/**
 * Enhanced Reporter for Priority and Dependency Information
 * Adds priority and dependency metadata to test reports
 */

import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import { dependencyManager } from './dependency-manager';
import { PriorityExecutionStats, TestPriority, TestMetadata } from '@/types';
import { slackNotifier, SlackNotificationData, SlackNotificationResult } from '../utils/slack-notifier';
import { createZipArchive } from '../utils/zip-utils';
import { configManager } from './config-manager';
import { databaseService } from '../utils/database-service';
import fs from 'fs';
import path from 'path';

export default class EnhancedReporter implements Reporter {
  private stats: PriorityExecutionStats | null = null;
  private testResults = new Map<string, { result: TestResult; metadata?: TestMetadata; testCase: TestCase }>();

  onBegin() {
    console.log('📊 Enhanced Reporter: Starting test execution with priority and dependency tracking');
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const testName = test.title;
    const metadata = dependencyManager.getTestMetadata(testName);
    
    // Store the actual Playwright test result
    this.testResults.set(testName, { result, metadata, testCase: test });
    
    if (metadata) {
      // Add priority and dependency info to test annotations
      if (metadata.priority) {
        test.annotations.push({
          type: 'priority',
          description: `Priority: ${metadata.priority.toUpperCase()}`
        });
      }
      
      if (metadata.dependsOn && metadata.dependsOn.length > 0) {
        test.annotations.push({
          type: 'dependencies',
          description: `Depends on: ${metadata.dependsOn.join(', ')}`
        });
      }
      
      if (metadata.tags && metadata.tags.length > 0) {
        test.annotations.push({
          type: 'tags',
          description: `Tags: ${metadata.tags.join(', ')}`
        });
      }
    }

    // Check if test was skipped due to dependencies
    const executionResult = dependencyManager.getExecutionResults().get(testName);
    if (executionResult && executionResult.status === 'skipped' && executionResult.reason) {
      test.annotations.push({
        type: 'skip-reason',
        description: executionResult.reason
      });
      
      // Also add to test result
      result.status = 'skipped';
      if (!result.errors) {
        result.errors = [];
      }
      result.errors.push({
        message: executionResult.reason,
        location: undefined,
        stack: undefined
      });
    }
  }

  async onEnd(result: FullResult) {
    // Get stats from dependency manager
    this.stats = dependencyManager.getExecutionStats();
    
    // If no tests were tracked by dependency manager, build stats from Playwright results
    if (this.stats.highest.total === 0 && this.stats.high.total === 0 && 
        this.stats.medium.total === 0 && this.stats.low.total === 0) {
      this.stats = this.buildStatsFromPlaywrightResults(result);
    }
    
    this.generateEnhancedReport();
    
    console.log('\n📊 Enhanced Reporter: Test execution completed');
    console.log('📈 Priority and Dependency Statistics:');
    console.log(`   Highest Priority: ${this.stats.highest.total} tests (${this.stats.highest.passed} passed, ${this.stats.highest.failed} failed, ${this.stats.highest.skipped} skipped)`);
    console.log(`   High Priority: ${this.stats.high.total} tests (${this.stats.high.passed} passed, ${this.stats.high.failed} failed, ${this.stats.high.skipped} skipped)`);
    console.log(`   Medium Priority: ${this.stats.medium.total} tests (${this.stats.medium.passed} passed, ${this.stats.medium.failed} failed, ${this.stats.medium.skipped} skipped)`);
    console.log(`   Low Priority: ${this.stats.low.total} tests (${this.stats.low.passed} passed, ${this.stats.low.failed} failed, ${this.stats.low.skipped} skipped)`);
    console.log(`   Total Dependency Skips: ${this.stats.totalDependencySkips}`);
    console.log(`   Tests with Dependencies: ${this.stats.dependencyChains}`);

    // Send Slack notification
    await this.sendSlackNotification();
  }

  private buildStatsFromPlaywrightResults(result: FullResult): PriorityExecutionStats {
    const stats: PriorityExecutionStats = {
      highest: { total: 0, passed: 0, failed: 0, skipped: 0 },
      high: { total: 0, passed: 0, failed: 0, skipped: 0 },
      medium: { total: 0, passed: 0, failed: 0, skipped: 0 },
      low: { total: 0, passed: 0, failed: 0, skipped: 0 },
      totalDependencySkips: 0,
      dependencyChains: 0
    };

    // Use actual Playwright test results
    for (const [testName, testData] of this.testResults) {
      const metadata = testData.metadata;
      const playwrightResult = testData.result;
      
      const priority: TestPriority = metadata?.priority || 'medium';
      const priorityStats = stats[priority];
      
      priorityStats.total++;
      
      // Use Playwright's actual test status
      switch (playwrightResult.status) {
        case 'passed':
          priorityStats.passed++;
          break;
        case 'failed':
          priorityStats.failed++;
          break;
        case 'skipped':
          priorityStats.skipped++;
          // Check if it was skipped due to dependencies
          const executionResult = dependencyManager.getExecutionResults().get(testName);
          if (executionResult?.reason?.includes('Dependency failed')) {
            stats.totalDependencySkips++;
          }
          break;
        case 'timedOut':
          priorityStats.failed++; // Treat timeout as failure
          break;
      }
    }

    // Also include tests that were registered but never executed (skipped by dependency system)
    const allTests = dependencyManager.getAllTests();
    const executionResults = dependencyManager.getExecutionResults();
    
    for (const [testName, metadata] of allTests) {
      // If test was registered but not executed by Playwright
      if (!this.testResults.has(testName)) {
        const priority: TestPriority = metadata.priority || 'medium';
        const priorityStats = stats[priority];
        
        priorityStats.total++;
        priorityStats.skipped++;
        
        // Check if it was skipped due to dependencies
        const executionResult = executionResults.get(testName);
        if (executionResult?.reason?.includes('Dependency failed')) {
          stats.totalDependencySkips++;
        }
      }
    }

    // Count dependency chains
    const dependencyGraph = dependencyManager.getDependencyGraph();
    if (dependencyGraph) {
      stats.dependencyChains = Array.from(dependencyGraph.nodes.values())
        .filter(node => node.dependencies.length > 0).length;
    }

    return stats;
  }

  private generateEnhancedReport() {
    if (!this.stats) return;

    const reportData = {
      timestamp: new Date().toISOString(),
      priorityStats: this.stats,
      dependencyGraph: this.serializeDependencyGraph(),
      executionResults: this.serializeExecutionResults(),
      summary: this.generateSummary()
    };

    // Ensure reports directory exists
    const reportsDir = 'reports';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Write enhanced report
    const reportPath = path.join(reportsDir, 'priority-dependency-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

    // Generate HTML summary
    this.generateHtmlSummary(reportData);

    console.log(`📄 Enhanced report saved: ${reportPath}`);
    console.log(`📄 HTML summary saved: ${path.join(reportsDir, 'priority-dependency-summary.html')}`);
  }

  private serializeDependencyGraph() {
    const graph = dependencyManager.getDependencyGraph();
    if (!graph) return null;

    return {
      executionOrder: graph.executionOrder,
      hasCycles: graph.hasCycles,
      cycles: graph.cycles,
      nodes: Array.from(graph.nodes.entries()).map(([name, node]) => ({
        testName: name,
        priority: node.priority,
        dependencies: node.dependencies,
        dependents: node.dependents,
        status: node.status
      }))
    };
  }

  private serializeExecutionResults() {
    const results = dependencyManager.getExecutionResults();
    return Array.from(results.entries()).map(([name, result]) => ({
      testName: name,
      status: result.status,
      duration: result.duration,
      priority: result.priority,
      dependencies: result.dependencies,
      reason: result.reason,
      error: result.error
    }));
  }

  private generateSummary() {
    if (!this.stats) return {};

    const totalTests = this.stats.highest.total + this.stats.high.total + 
                      this.stats.medium.total + this.stats.low.total;
    const totalPassed = this.stats.highest.passed + this.stats.high.passed + 
                       this.stats.medium.passed + this.stats.low.passed;
    const totalFailed = this.stats.highest.failed + this.stats.high.failed + 
                       this.stats.medium.failed + this.stats.low.failed;
    const totalSkipped = this.stats.highest.skipped + this.stats.high.skipped + 
                        this.stats.medium.skipped + this.stats.low.skipped;

    return {
      totalTests,
      totalPassed,
      totalFailed,
      totalSkipped,
      dependencySkips: this.stats.totalDependencySkips,
      dependencyChains: this.stats.dependencyChains,
      passRate: totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0
    };
  }

  /**
   * Send Slack notification with test execution results
   */
  private async sendSlackNotification(): Promise<void> {
    if (!this.stats) return;

    try {
      const config = configManager.getConfig();
      const summary = this.generateSummary();
      
      // Determine module name from test file paths or environment
      const moduleName = this.determineModuleName();
      
      // Get Playwright HTML report path
      const playwrightHtmlReportPath = path.join('reports', 'html-report', 'index.html');
      let finalHtmlReportPath: string | undefined;
      
      // Create a zip archive of the HTML report directory
      if (fs.existsSync(path.dirname(playwrightHtmlReportPath))) {
        try {
          const zipReportPath = path.join('reports', 'html-report.zip');
          console.log('📦 Creating zip archive of the HTML report...');
          await createZipArchive({
            sourceDir: path.dirname(playwrightHtmlReportPath),
            outputFile: zipReportPath,
            verbose: true
          });
          finalHtmlReportPath = zipReportPath;
          console.log('✅ HTML report archive created successfully');
        } catch (zipError) {
          console.error('❌ Error creating HTML report archive:', zipError);
          // Fallback to the non-archived report path
          finalHtmlReportPath = playwrightHtmlReportPath;
        }
      }
      
      const slackData: SlackNotificationData = {
        totalTests: summary.totalTests || 0,
        totalPassed: summary.totalPassed || 0,
        totalFailed: summary.totalFailed || 0,
        totalSkipped: summary.totalSkipped || 0,
        executionTime: new Date().toISOString(),
        testEnvUrl: config.baseUrl || 'https://xyne.juspay.net',
        scriptRunBy: process.env.SCRIPT_RUN_BY || process.env.USER || process.env.USERNAME || 'Unknown User',
        moduleName: moduleName,
        htmlReportPath: finalHtmlReportPath,
        priorityStats: {
          highest: this.stats.highest,
          high: this.stats.high,
          medium: this.stats.medium,
          low: this.stats.low
        }
      };

      const slackResult = await slackNotifier.sendTestCompletionNotification(slackData);

      // Store test results in database after Slack notification
      await this.storeTestResultsInDatabase(slackData, slackResult);
    } catch (error) {
      console.error('❌ Error sending Slack notification:', error);
    }
  }

  /**
   * Store test results in database
   */
  private async storeTestResultsInDatabase(slackData: SlackNotificationData, slackResult: SlackNotificationResult): Promise<void> {
    try {
      if (!this.stats) {
        console.log('📊 No stats available for database storage');
        return;
      }

      console.log('💾 Attempting to store test results in database...');

      // Prepare summary data for database service
      const summary = {
        totalTests: slackData.totalTests,
        totalPassed: slackData.totalPassed,
        totalFailed: slackData.totalFailed,
        totalSkipped: slackData.totalSkipped
      };

      // Get actual Slack message URL if available, otherwise fallback to generic message
      const slackReportLink = slackResult.success && slackResult.messageUrl ? 
        slackResult.messageUrl : 
        (slackData.htmlReportPath ? `Slack notification sent for ${slackData.moduleName}` : undefined);

      // Store in database
      await databaseService.storeTestResults(
        this.stats,
        summary,
        slackReportLink
      );

    } catch (error) {
      // Database storage is non-critical, so we log but don't throw
      console.warn('⚠️ Database storage encountered an issue:', error);
    }
  }

  /**
   * Determine module name from test results or environment
   */
  private determineModuleName(): string {
    // Check environment variable first
    const envModuleName = process.env.MODULE_NAME;
    if (envModuleName) {
      return envModuleName;
    }

    // If we can't extract from file paths, try to get from process.argv
    // Playwright often passes the test file as an argument
    const testFileArg = process.argv.find(arg => arg.includes('.spec.ts') || arg.includes('.test.ts'));
    if (testFileArg) {
      const moduleName = this.extractModuleNameFromPath(testFileArg);
      if (moduleName) {
        return moduleName;
      }
    }

    // Extract module name from test file paths
    // For a file like "tests/functional/agent-module.spec.ts", return "agent-module"
    for (const [testName, testData] of this.testResults) {
      const testCase = testData.testCase;
      
      // Get the test file path from the test case location
      if (testCase.location?.file) {
        const moduleName = this.extractModuleNameFromPath(testCase.location.file);
        if (moduleName) {
          return moduleName;
        }
      }
      
      // Fallback: try to get file path from test result attachments
      const testResult = testData.result;
      if (testResult.attachments && testResult.attachments.length > 0) {
        for (const attachment of testResult.attachments) {
          if (attachment.path) {
            const moduleName = this.extractModuleNameFromPath(attachment.path);
            if (moduleName) {
              return moduleName;
            }
          }
        }
      }
    }

    // Default fallback
    return 'Xyne';
  }

  /**
   * Extract module name from file path
   * For "tests/functional/agent-module.spec.ts" returns "agent-module"
   */
  private extractModuleNameFromPath(filePath: string): string | null {
    if (!filePath) return null;
    
    // Get the filename from the path
    const fileName = path.basename(filePath);
    
    // Remove .spec.ts, .test.ts, .spec.js, .test.js extensions
    const moduleNameMatch = fileName.match(/^(.+)\.(?:spec|test)\.[jt]s$/);
    if (moduleNameMatch) {
      return moduleNameMatch[1];
    }
    
    return null;
  }

  private generateHtmlSummary(reportData: any) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Priority & Dependency Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; }
        .stat-card.highest { border-left-color: #dc3545; }
        .stat-card.high { border-left-color: #fd7e14; }
        .stat-card.medium { border-left-color: #ffc107; }
        .stat-card.low { border-left-color: #28a745; }
        .stat-title { font-weight: bold; font-size: 1.1em; margin-bottom: 10px; }
        .stat-value { font-size: 2em; font-weight: bold; color: #333; }
        .stat-details { margin-top: 10px; font-size: 0.9em; color: #666; }
        .dependency-graph { margin-top: 30px; }
        .execution-order { background: #e9ecef; padding: 15px; border-radius: 4px; margin: 10px 0; }
        .test-list { margin-top: 20px; }
        .test-item { background: #f8f9fa; margin: 5px 0; padding: 10px; border-radius: 4px; border-left: 3px solid #ccc; }
        .test-item.passed { border-left-color: #28a745; }
        .test-item.failed { border-left-color: #dc3545; }
        .test-item.skipped { border-left-color: #ffc107; }
        .test-name { font-weight: bold; }
        .test-meta { font-size: 0.9em; color: #666; margin-top: 5px; }
        .priority-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; font-weight: bold; }
        .priority-highest { background: #dc3545; color: white; }
        .priority-high { background: #fd7e14; color: white; }
        .priority-medium { background: #ffc107; color: black; }
        .priority-low { background: #28a745; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Priority & Dependency Test Report</h1>
            <p>Generated on ${new Date(reportData.timestamp).toLocaleString()}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card highest">
                <div class="stat-title">🔴 Highest Priority</div>
                <div class="stat-value">${reportData.priorityStats.highest.total}</div>
                <div class="stat-details">
                    ✅ ${reportData.priorityStats.highest.passed} passed<br>
                    ❌ ${reportData.priorityStats.highest.failed} failed<br>
                    ⏭️ ${reportData.priorityStats.highest.skipped} skipped
                </div>
            </div>
            
            <div class="stat-card high">
                <div class="stat-title">🟠 High Priority</div>
                <div class="stat-value">${reportData.priorityStats.high.total}</div>
                <div class="stat-details">
                    ✅ ${reportData.priorityStats.high.passed} passed<br>
                    ❌ ${reportData.priorityStats.high.failed} failed<br>
                    ⏭️ ${reportData.priorityStats.high.skipped} skipped
                </div>
            </div>
            
            <div class="stat-card medium">
                <div class="stat-title">🟡 Medium Priority</div>
                <div class="stat-value">${reportData.priorityStats.medium.total}</div>
                <div class="stat-details">
                    ✅ ${reportData.priorityStats.medium.passed} passed<br>
                    ❌ ${reportData.priorityStats.medium.failed} failed<br>
                    ⏭️ ${reportData.priorityStats.medium.skipped} skipped
                </div>
            </div>
            
            <div class="stat-card low">
                <div class="stat-title">🟢 Low Priority</div>
                <div class="stat-value">${reportData.priorityStats.low.total}</div>
                <div class="stat-details">
                    ✅ ${reportData.priorityStats.low.passed} passed<br>
                    ❌ ${reportData.priorityStats.low.failed} failed<br>
                    ⏭️ ${reportData.priorityStats.low.skipped} skipped
                </div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-title">📊 Overall Summary</div>
                <div class="stat-value">${reportData.summary.passRate}%</div>
                <div class="stat-details">
                    Pass rate<br>
                    ${reportData.summary.totalPassed}/${reportData.summary.totalTests} tests passed
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-title">🔗 Dependencies</div>
                <div class="stat-value">${reportData.priorityStats.dependencyChains}</div>
                <div class="stat-details">
                    Tests with dependencies<br>
                    ${reportData.priorityStats.totalDependencySkips} dependency skips
                </div>
            </div>
        </div>

        ${reportData.dependencyGraph ? `
        <div class="dependency-graph">
            <h2>🔄 Execution Order</h2>
            <div class="execution-order">
                <strong>Tests executed in this order:</strong><br>
                ${reportData.dependencyGraph.executionOrder.join(' → ')}
            </div>
        </div>
        ` : ''}

        <div class="test-list">
            <h2>📋 Test Results</h2>
            ${reportData.executionResults.map((test: any) => `
                <div class="test-item ${test.status}">
                    <div class="test-name">${test.testName}</div>
                    <div class="test-meta">
                        <span class="priority-badge priority-${test.priority || 'medium'}">${(test.priority || 'medium').toUpperCase()}</span>
                        Status: ${test.status.toUpperCase()}
                        ${test.duration ? ` | Duration: ${test.duration}ms` : ''}
                        ${test.dependencies && test.dependencies.length > 0 ? ` | Depends on: ${test.dependencies.join(', ')}` : ''}
                        ${test.reason ? ` | Reason: ${test.reason}` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

    const htmlPath = path.join('reports', 'priority-dependency-summary.html');
    fs.writeFileSync(htmlPath, html);
  }
}
