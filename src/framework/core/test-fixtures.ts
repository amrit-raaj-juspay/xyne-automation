/**
 * Custom Playwright Test Fixtures
 * Provides enhanced test fixtures including shared page functionality,
 * priority-based execution, and dependency management
 */

import { test as base, expect, Page, Browser } from '@playwright/test';
import { sharedBrowserManager, SharedScope } from './shared-browser-manager';
import { dependencyManager } from './dependency-manager';
import { TestMetadata, TestExecutionResult } from '@/types';
import path from 'path';

// Define custom fixture types
type CustomFixtures = {
  sharedPage: Page;
  newSharedPage: Page;
  sharedPageWithScope: (scope: SharedScope) => Promise<Page>;
};

// Extract file and suite information from test info
function getTestContext(testInfo: any) {
  const filePath = testInfo.file;
  const fileName = path.basename(filePath, path.extname(filePath));
  const suiteName = testInfo.titlePath[0] || 'default-suite';
  
  return {
    fileId: fileName,
    suiteId: suiteName,
  };
}

// Create enhanced test with custom fixtures
export const test = base.extend<CustomFixtures>({
  /**
   * Shared page fixture - provides a shared page instance based on file scope
   * Automatically enables sequential execution for tests using this fixture
   * Enhanced with dependency checking and priority support
   */
  sharedPage: async ({ browser }, use, testInfo) => {
    const testName = testInfo.title;
    const startTime = Date.now();

    // Build dependency graph if not already built
    try {
      if (!dependencyManager.getDependencyGraph()) {
        dependencyManager.buildDependencyGraph();
      }
    } catch (error) {
      console.error('❌ Dependency graph error:', error);
    }

    // Check if test should be skipped due to failed dependencies
    const skipInfo = dependencyManager.shouldSkipTest(testName);
    if (skipInfo.skip) {
      console.log(`⏭️  Skipping test "${testName}": ${skipInfo.reason}`);
      
      // Record the skip in dependency manager
      const skipResult: TestExecutionResult = {
        testName,
        fullTitle: testInfo.titlePath.join(' > '),
        status: 'skipped',
        reason: skipInfo.reason,
        duration: 0,
        priority: dependencyManager.getTestMetadata(testName)?.priority,
        dependencies: dependencyManager.getTestMetadata(testName)?.dependsOn
      };
      dependencyManager.recordTestResult(skipResult);
      
      test.skip(true, skipInfo.reason);
      return;
    }

    // Set up test context
    const { fileId, suiteId } = getTestContext(testInfo);
    sharedBrowserManager.setCurrentFile(fileId);
    sharedBrowserManager.setCurrentSuite(suiteId);

    let testResult: TestExecutionResult | undefined;
    let page: Page | undefined;
    let shouldCleanupPage = false;

    try {
      // Check if shared mode is enabled
      if (!sharedBrowserManager.isSharedModeEnabled()) {
        // Fall back to regular page if shared mode is disabled
        const context = await browser.newContext();
        page = await context.newPage();
        shouldCleanupPage = true;
      } else {
        // Get default scope from configuration
        const defaultScope = sharedBrowserManager.getDefaultScope();
        
        // Get or create shared page
        page = await sharedBrowserManager.getSharedPage(
          browser,
          defaultScope,
          { fileId, suiteId }
        );
        shouldCleanupPage = false;
      }

      console.log(`🔗 Using shared page for test: ${testName}`);

      await use(page);

      // Test passed
      const duration = Date.now() - startTime;
      testResult = {
        testName,
        fullTitle: testInfo.titlePath.join(' > '),
        status: 'passed',
        duration,
        priority: dependencyManager.getTestMetadata(testName)?.priority,
        dependencies: dependencyManager.getTestMetadata(testName)?.dependsOn
      };

      console.log(`✅ Test passed: ${testName} (${duration}ms)`);

    } catch (error) {
      // Test failed
      const duration = Date.now() - startTime;
      testResult = {
        testName,
        fullTitle: testInfo.titlePath.join(' > '),
        status: 'failed',
        duration,
        error: error instanceof Error ? error.message : String(error),
        priority: dependencyManager.getTestMetadata(testName)?.priority,
        dependencies: dependencyManager.getTestMetadata(testName)?.dependsOn
      };

      console.log(`❌ Test failed: ${testName} (${duration}ms) - ${testResult.error}`);
      
      // Record the failure immediately before re-throwing
      dependencyManager.recordTestResult(testResult);
      
      throw error;

    } finally {
      // Record test result for dependency tracking (if not already recorded in catch block)
      if (testResult && testResult.status !== 'failed') {
        dependencyManager.recordTestResult(testResult);
      }

      // Clean up non-shared pages
      if (shouldCleanupPage && page) {
        await page.context().close();
      }
    }
  },

  /**
   * New shared page fixture - forces creation of a fresh shared page
   */
  newSharedPage: async ({ browser }, use, testInfo) => {
    const { fileId, suiteId } = getTestContext(testInfo);
    sharedBrowserManager.setCurrentFile(fileId);
    sharedBrowserManager.setCurrentSuite(suiteId);

    if (!sharedBrowserManager.isSharedModeEnabled()) {
      const context = await browser.newContext();
      const page = await context.newPage();
      await use(page);
      await page.close();
      await context.close();
      return;
    }

    const defaultScope = sharedBrowserManager.getDefaultScope();
    const newSharedPage = await sharedBrowserManager.createNewSharedPage(
      browser,
      defaultScope,
      { fileId, suiteId }
    );

    console.log(`🆕 Using new shared ${defaultScope} page for test: ${testInfo.title}`);

    await use(newSharedPage);
    console.log(`✅ New shared page test completed: ${testInfo.title}`);
  },

  /**
   * Shared page with scope fixture - provides a function to get shared pages with specific scopes
   */
  sharedPageWithScope: async ({ browser }, use, testInfo) => {
    const { fileId, suiteId } = getTestContext(testInfo);
    sharedBrowserManager.setCurrentFile(fileId);
    sharedBrowserManager.setCurrentSuite(suiteId);

    const getSharedPageWithScope = async (scope: SharedScope): Promise<Page> => {
      if (!sharedBrowserManager.isSharedModeEnabled()) {
        const context = await browser.newContext();
        return await context.newPage();
      }

      return await sharedBrowserManager.getSharedPage(
        browser,
        scope,
        { fileId, suiteId }
      );
    };

    await use(getSharedPageWithScope);
  },
});

// Enhanced test function with metadata support
interface TestWithMetadata {
  (name: string, metadata: TestMetadata, fn: (fixtures: any) => Promise<void> | void): void;
  (name: string, fn: (fixtures: any) => Promise<void> | void): void;
}

/**
 * Enhanced test function that supports priority and dependency metadata
 */
export const testWithMetadata: TestWithMetadata = (
  name: string, 
  metadataOrFn: TestMetadata | ((fixtures: any) => Promise<void> | void),
  fn?: (fixtures: any) => Promise<void> | void
) => {
  let metadata: TestMetadata = {};
  let testFn: (fixtures: any) => Promise<void> | void;

  if (typeof metadataOrFn === 'function') {
    // Called as testWithMetadata(name, fn)
    testFn = metadataOrFn;
  } else {
    // Called as testWithMetadata(name, metadata, fn)
    metadata = metadataOrFn;
    testFn = fn!;
  }

  // Register test with dependency manager
  dependencyManager.registerTest(name, metadata);

  // Create the actual test
  return test(name, testFn);
};

// Convenience functions for different priority levels
export const testHighest = (name: string, metadata: Omit<TestMetadata, 'priority'> = {}, fn?: (fixtures: any) => Promise<void> | void) => {
  if (typeof metadata === 'function') {
    return testWithMetadata(name, { priority: 'highest' }, metadata);
  }
  return testWithMetadata(name, { ...metadata, priority: 'highest' }, fn!);
};

export const testHigh = (name: string, metadata: Omit<TestMetadata, 'priority'> = {}, fn?: (fixtures: any) => Promise<void> | void) => {
  if (typeof metadata === 'function') {
    return testWithMetadata(name, { priority: 'high' }, metadata);
  }
  return testWithMetadata(name, { ...metadata, priority: 'high' }, fn!);
};

export const testMedium = (name: string, metadata: Omit<TestMetadata, 'priority'> = {}, fn?: (fixtures: any) => Promise<void> | void) => {
  if (typeof metadata === 'function') {
    return testWithMetadata(name, { priority: 'medium' }, metadata);
  }
  return testWithMetadata(name, { ...metadata, priority: 'medium' }, fn!);
};

export const testLow = (name: string, metadata: Omit<TestMetadata, 'priority'> = {}, fn?: (fixtures: any) => Promise<void> | void) => {
  if (typeof metadata === 'function') {
    return testWithMetadata(name, { priority: 'low' }, metadata);
  }
  return testWithMetadata(name, { ...metadata, priority: 'low' }, fn!);
};

// Re-export expect for convenience
export { expect };

// Define public interface for SharedBrowserManager to avoid exposing private properties
interface PublicSharedBrowserManager {
  setCurrentFile(fileId: string): void;
  setCurrentSuite(suiteId: string): void;
  getSharedPage(browser: any, scope?: SharedScope, options?: any): Promise<any>;
  createNewSharedPage(browser: any, scope?: SharedScope, options?: any): Promise<any>;
  cleanupInstance(instanceKey: string): Promise<void>;
  cleanupByScope(scope: SharedScope, fileId?: string, suiteId?: string): Promise<void>;
  cleanupAll(): Promise<void>;
  getStats(): {
    totalInstances: number;
    byScope: Record<SharedScope, number>;
    oldestInstance?: Date;
    newestInstance?: Date;
  };
  isSharedModeEnabled(): boolean;
  getDefaultScope(): SharedScope;
}

// Export test utilities
export const testUtils = {
  /**
   * Configure a test describe block to use shared pages with sequential execution
   */
  configureSharedTests: (options?: {
    scope?: SharedScope;
    sequential?: boolean;
  }) => {
    const { scope = 'file', sequential = true } = options || {};
    
    if (sequential) {
      test.describe.configure({ mode: 'serial' });
    }
    
    return {
      scope,
      sequential,
    };
  },

  /**
   * Get shared browser manager instance for advanced usage
   */
  getSharedBrowserManager: (): PublicSharedBrowserManager => sharedBrowserManager,

  /**
   * Cleanup shared instances (useful for test teardown)
   */
  cleanupSharedInstances: async (scope?: SharedScope, fileId?: string, suiteId?: string) => {
    if (scope) {
      await sharedBrowserManager.cleanupByScope(scope, fileId, suiteId);
    } else {
      await sharedBrowserManager.cleanupAll();
    }
  },

  /**
   * Get statistics about current shared instances
   */
  getSharedInstanceStats: () => sharedBrowserManager.getStats(),
};

// Export types for external use
export type { SharedScope };
