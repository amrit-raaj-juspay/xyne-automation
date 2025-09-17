/**
 * Custom Playwright Test Fixtures
 * Provides enhanced test fixtures including shared page functionality
 */

import { test as base, expect, Page, Browser } from '@playwright/test';
import { sharedBrowserManager, SharedScope } from './shared-browser-manager';
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
   */
  sharedPage: async ({ browser }, use, testInfo) => {
    // Set up test context
    const { fileId, suiteId } = getTestContext(testInfo);
    sharedBrowserManager.setCurrentFile(fileId);
    sharedBrowserManager.setCurrentSuite(suiteId);

    // Check if shared mode is enabled
    if (!sharedBrowserManager.isSharedModeEnabled()) {
      // Fall back to regular page if shared mode is disabled
      const context = await browser.newContext();
      const page = await context.newPage();
      await use(page);
      await page.close();
      await context.close();
      return;
    }

    // Get default scope from configuration
    const defaultScope = sharedBrowserManager.getDefaultScope();
    
    // Get or create shared page
    const sharedPage = await sharedBrowserManager.getSharedPage(
      browser,
      defaultScope,
      { fileId, suiteId }
    );

    console.log(`🔗 Using shared ${defaultScope} page for test: ${testInfo.title}`);

    // Note: Sequential execution should be configured at the describe level
    // using test.describe.configure({ mode: 'serial' })

    await use(sharedPage);

    // Note: We don't close the shared page here as it may be reused by other tests
    console.log(`✅ Shared page test completed: ${testInfo.title}`);
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

// Re-export expect for convenience
export { expect };

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
  getSharedBrowserManager: () => sharedBrowserManager,

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
