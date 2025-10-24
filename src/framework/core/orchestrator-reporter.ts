/**
 * Custom Playwright Reporter for Test Orchestrator
 * Fixes test statuses in HTML report to show actual pass/fail from orchestrator
 */

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

// Global storage for orchestrator results
// This will be populated by the orchestrator during test execution
const ORCHESTRATOR_RESULTS_FILE = 'reports/orchestrator-results.json';

interface OrchestratorResult {
  testName: string;
  fullTitle: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshotPath?: string;
  priority?: string;
  dependencies?: string[];
}

class OrchestratorReporter implements Reporter {
  private orchestratorResults: Map<string, OrchestratorResult> = new Map();

  onBegin(config: FullConfig, suite: Suite) {
    console.log('\n🎭 Orchestrator Reporter: Starting test run');

    // Try to load orchestrator results if available
    try {
      if (fs.existsSync(ORCHESTRATOR_RESULTS_FILE)) {
        const data = fs.readFileSync(ORCHESTRATOR_RESULTS_FILE, 'utf-8');
        const results = JSON.parse(data);
        this.orchestratorResults = new Map(Object.entries(results));
        console.log(`📊 Loaded ${this.orchestratorResults.size} orchestrator results`);
      }
    } catch (error) {
      console.log('⚠️ Could not load orchestrator results:', error);
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const testName = test.title;

    // Reload orchestrator results to get the latest status for this test
    try {
      if (fs.existsSync(ORCHESTRATOR_RESULTS_FILE)) {
        const data = fs.readFileSync(ORCHESTRATOR_RESULTS_FILE, 'utf-8');
        const results = JSON.parse(data);
        this.orchestratorResults = new Map(Object.entries(results));
      }
    } catch (error) {
      // Silently fail
    }

    const orchestratorResult = this.orchestratorResults.get(testName);

    if (orchestratorResult) {
      // Override Playwright's result with orchestrator's actual result
      if (orchestratorResult.status === 'failed' && result.status === 'passed') {
        console.log(`🔄 Fixing status for "${testName}": passed → failed`);

        // Mark the result as failed
        result.status = 'failed';

        // Add error information
        if (orchestratorResult.error) {
          result.error = {
            message: orchestratorResult.error,
            stack: orchestratorResult.error,
            value: orchestratorResult.error
          };
        }

        // Add screenshot attachment if available
        if (orchestratorResult.screenshotPath && fs.existsSync(orchestratorResult.screenshotPath)) {
          result.attachments.push({
            name: 'screenshot',
            path: orchestratorResult.screenshotPath,
            contentType: 'image/png',
            body: undefined
          });
          console.log(`📸 Added screenshot: ${orchestratorResult.screenshotPath}`);
        }
      } else if (orchestratorResult.status === 'skipped' && result.status === 'passed') {
        console.log(`🔄 Fixing status for "${testName}": passed → skipped`);
        result.status = 'skipped';
      }
    }
  }

  onEnd(result: FullResult) {
    console.log('\n📊 Orchestrator Reporter: Test run completed');
    console.log(`✅ Status: ${result.status}`);

    // Reload orchestrator results to get the latest data from this test run
    try {
      if (fs.existsSync(ORCHESTRATOR_RESULTS_FILE)) {
        const data = fs.readFileSync(ORCHESTRATOR_RESULTS_FILE, 'utf-8');
        const results = JSON.parse(data);
        this.orchestratorResults = new Map(Object.entries(results));
      }
    } catch (error) {
      console.log('⚠️ Could not reload orchestrator results:', error);
    }

    // Print summary from orchestrator results
    if (this.orchestratorResults.size > 0) {
      const passed = Array.from(this.orchestratorResults.values()).filter(r => r.status === 'passed').length;
      const failed = Array.from(this.orchestratorResults.values()).filter(r => r.status === 'failed').length;
      const skipped = Array.from(this.orchestratorResults.values()).filter(r => r.status === 'skipped').length;

      console.log('\n📈 Orchestrator Results (Accurate):');
      console.log(`   ✅ Passed: ${passed}`);
      console.log(`   ❌ Failed: ${failed}`);
      console.log(`   ⏭️ Skipped: ${skipped}`);
      console.log(`   📊 Total: ${this.orchestratorResults.size}`);
    }
  }
}

export default OrchestratorReporter;
