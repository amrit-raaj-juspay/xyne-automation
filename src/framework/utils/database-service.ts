/**
 * Database Service for storing test results in PostgreSQL
 * Handles authentication with Juspay APIs and data insertion
 */

import { PriorityExecutionStats } from '@/types';
import path from 'path';

export interface DatabaseRecord {
  module_name: string;
  test_cases_run: number;
  test_cases_passed: number;
  test_cases_skipped: number;
  test_cases_failed: number;
  highest_priority_failed: number;
  high_priority_failed: number;
  medium_priority_failed: number;
  low_priority_failed: number;
  run_datetime: string;
  slack_report_link: string | null;
  username: string;
  runenv: string;
  cron_run_id: string | null;
}

export interface TestSummary {
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private authToken: string | null = null;
  private tokenExpiry: number = 0;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Check if test results should be stored in database
   * Only store for specific allowed users
   */
  public async shouldStoreResults(): Promise<boolean> {
    try {
      const allowedUsers = process.env.DB_ALLOWED_USERS?.split(',') || 
        ['Amrit Raj', 'amrit.raj@juspay.in'];
      const currentUser = process.env.SCRIPT_RUN_BY || process.env.USER || process.env.USERNAME;
      
      if (!currentUser) {
        console.log('🔍 No user identified, skipping database storage');
        return false;
      }

      const shouldStore = allowedUsers.includes(currentUser);
      console.log(`🔍 Database storage check: User "${currentUser}" ${shouldStore ? 'allowed' : 'not allowed'}`);
      
      return shouldStore;
    } catch (error) {
      console.warn('⚠️ Error checking database storage eligibility:', error);
      return false;
    }
  }

  /**
   * Get login token using the same method as in gsheet_report.py
   */
  private async authenticateWithJuspay(): Promise<string> {
    try {
      // Check if we have a valid token
      if (this.authToken && Date.now() < this.tokenExpiry) {
        return this.authToken;
      }

      // Login endpoint
      const loginUrl = 'https://roaming.sandbox.portal.juspay.in/api/ec/v1/admin/login';
      
      const loginUsername = process.env.JUSPAY_USERNAME;
      const loginPassword = process.env.JUSPAY_PASSWORD;

      if (!loginUsername || !loginPassword) {
        throw new Error('Missing JUSPAY_USERNAME or JUSPAY_PASSWORD environment variables');
      }

      // Login payload
      const loginPayload = {
        username: loginUsername,
        password: loginPassword
      };

      // Configure proxy settings if needed
      const proxy = process.env.PROXY || '';
      const userName = process.env.user_name;
      
      // Determine if we should use proxies (for server environments)
      const shouldUseProxy = userName === 'cronServer' || userName === 'apiServer';
      
      console.log(`🔐 Attempting to get login token from: ${loginUrl}`);

      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
        // Note: Node.js fetch doesn't support proxy configuration directly
        // For proxy support, you would need to use a library like node-fetch with proxy-agent
        // or configure proxy at the system level
      };

      // Add timeout (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      fetchOptions.signal = controller.signal;

      try {
        // Make the login API call
        const loginResponse = await fetch(loginUrl, fetchOptions);
        clearTimeout(timeoutId);

        // Check if the login was successful
        if (!loginResponse.ok) {
          throw new Error(`Authentication failed: ${loginResponse.status} ${loginResponse.statusText}`);
        }

        // Extract token from response
        const loginData = await loginResponse.json();
        const token = loginData.token;

        if (token) {
          console.log('✅ Successfully obtained login token');
          this.authToken = token;
          // Set token expiry (assume 1 hour if not provided)
          this.tokenExpiry = Date.now() + 3600000;
          return token;
        } else {
          console.log('❌ Token not found in login response');
          throw new Error('Token not found in login response');
        }

      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timeout: Authentication took longer than 30 seconds');
        }
        throw fetchError;
      }

    } catch (error) {
      if (error instanceof Error) {
        console.error(`❌ An error occurred while getting login token: ${error.message}`);
      } else {
        console.error(`❌ An unexpected error occurred during token retrieval: ${error}`);
      }
      throw error;
    }
  }

  /**
   * Get the shared cron run ID for batch identification
   */
  private getCronRunId(): string | null {
    if (process.env.IS_CRON_RUN === 'true' && process.env.CRON_RUN_ID) {
      return process.env.CRON_RUN_ID;
    }
    return null;
  }

  /**
   * Extract module name from test file paths or process arguments
   */
  private extractModuleName(): string {
    // Check environment variable first
    const envModuleName = process.env.MODULE_NAME;
    if (envModuleName) {
      return envModuleName;
    }

    // Try to extract from process arguments
    const testFileArg = process.argv.find(arg => arg.includes('.spec.ts') || arg.includes('.test.ts'));
    if (testFileArg) {
      const fileName = path.basename(testFileArg);
      const moduleNameMatch = fileName.match(/^(.+)\.(?:spec|test)\.[jt]s$/);
      if (moduleNameMatch) {
        return moduleNameMatch[1];
      }
    }

    // Fallback to generic name
    return 'xyne-test';
  }

  /**
   * Determine the run environment
   */
  private determineRunEnvironment(): string {
    const baseUrl = process.env.XYNE_BASE_URL;
    if (baseUrl) {
      console.log(`🔍 Determining run environment from base URL: ${baseUrl}`);
      if (baseUrl === 'https://sbx.xyne.juspay.net') {
        return 'Sandbox';
      }
      if (baseUrl === 'https://xyne.juspay.net') {
        return 'Production';
      }
    }

    // Only fall back to NODE_ENV if base URL doesn't match known environments
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv && nodeEnv !== 'local') {
      return nodeEnv;
    }

    return 'local';
  }

  /**
   * Map test results to database schema
   */
  private mapTestResultsToDbSchema(
    priorityStats: PriorityExecutionStats,
    summary: TestSummary,
    slackReportLink?: string
  ): DatabaseRecord {
    return {
      module_name: this.extractModuleName(),
      test_cases_run: summary.totalTests || 0,
      test_cases_passed: summary.totalPassed || 0,
      test_cases_skipped: summary.totalSkipped || 0,
      test_cases_failed: summary.totalFailed || 0,
      highest_priority_failed: priorityStats.highest?.failed || 0,
      high_priority_failed: priorityStats.high?.failed || 0,
      medium_priority_failed: priorityStats.medium?.failed || 0,
      low_priority_failed: priorityStats.low?.failed || 0,
      run_datetime: new Date().toISOString(),
      slack_report_link: slackReportLink || null,
      username: process.env.SCRIPT_RUN_BY || process.env.USER || process.env.USERNAME || 'Unknown',
      runenv: this.determineRunEnvironment(),
      cron_run_id: this.getCronRunId()
    };
  }

  /**
   * Generate SQL INSERT query with proper escaping
   */
  private generateInsertQuery(data: DatabaseRecord): string {
    // Escape single quotes in string values
    const escapeString = (str: string | null): string => {
      if (str === null) return 'NULL';
      return `'${str.replace(/'/g, "''")}'`;
    };

    const cronRunId = data.cron_run_id ? escapeString(data.cron_run_id) : 'NULL';
    const slackReportLink = data.slack_report_link ? escapeString(data.slack_report_link) : 'NULL';

    return `INSERT INTO test_run_summary (
      module_name, test_cases_run, test_cases_passed, test_cases_skipped,
      test_cases_failed, highest_priority_failed, high_priority_failed,
      medium_priority_failed, low_priority_failed, run_datetime,
      slack_report_link, username, runenv, cron_run_id
    ) VALUES (
      ${escapeString(data.module_name)}, ${data.test_cases_run}, ${data.test_cases_passed},
      ${data.test_cases_skipped}, ${data.test_cases_failed}, 
      ${data.highest_priority_failed}, ${data.high_priority_failed},
      ${data.medium_priority_failed}, ${data.low_priority_failed},
      ${escapeString(data.run_datetime)}, ${slackReportLink},
      ${escapeString(data.username)}, ${escapeString(data.runenv)}, ${cronRunId}
    )`;
  }

  /**
   * Insert test results into database
   */
  private async insertTestResults(data: DatabaseRecord): Promise<void> {
    try {
      const token = await this.authenticateWithJuspay();
      const query = this.generateInsertQuery(data);
      const dbEndpoint = process.env.DB_API_ENDPOINT || 
        'https://sandbox.portal.juspay.in/dashboard-test-automation/dbQuery';

      console.log('💾 Inserting test results into database...');
      console.log('📊 Data:', {
        module: data.module_name,
        total: data.test_cases_run,
        passed: data.test_cases_passed,
        failed: data.test_cases_failed,
        cronRunId: data.cron_run_id
      });
      console.log('🔍 SQL Query:', query);

      const response = await fetch(dbEndpoint, {
        method: 'POST',
        headers: {
          'x-web-logintoken': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query
        })
      });

      if (!response.ok) {
        throw new Error(`Database insertion failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Test results successfully stored in database');
      
      if (data.cron_run_id) {
        console.log(`🔗 Batch ID: ${data.cron_run_id}`);
      }

    } catch (error) {
      console.error('❌ Failed to insert test results into database:', error);
      throw error;
    }
  }

  /**
   * Store test results in database with error handling
   */
  public async storeTestResults(
    priorityStats: PriorityExecutionStats,
    summary: TestSummary,
    slackReportLink?: string
  ): Promise<void> {
    try {
      // Check if we should store results
      if (!(await this.shouldStoreResults())) {
        return;
      }

      // Map data to database schema
      const dbRecord = this.mapTestResultsToDbSchema(priorityStats, summary, slackReportLink);

      // Insert into database
      await this.insertTestResults(dbRecord);

    } catch (error) {
      // Graceful failure - log error but don't throw
      console.warn('⚠️ Database storage failed, continuing execution:', error);
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
