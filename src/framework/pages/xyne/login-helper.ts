/**
 * LoginHelper - Reusable login utility for test automation
 * 
 * Simple utility class that provides a one-line login solution for any test file.
 * Handles the complete Google OAuth + TOTP authentication flow internally.
 * 
 * Usage:
 * ```typescript
 * import { LoginHelper } from '../xyne/framework/pages/login-helper';
 * 
 * test('my test', async ({ page }) => {
 *   const loginSuccess = await LoginHelper.performLogin(page);
 *   expect(loginSuccess).toBe(true);
 *   // Continue with your test logic...
 * });
 * ```
 */

import { Page } from '@playwright/test';
import { GoogleOAuthLoginPage } from './google-oauth-login-page';
import { configManager } from '../../core/config-manager';

export interface LoginOptions {
  /** Custom email (overrides environment variable) */
  email?: string;
  /** Custom password (overrides environment variable) */
  password?: string;
  /** Custom TOTP secret (overrides environment variable) */
  totpSecret?: string;
  /** Login timeout in milliseconds (default: 60000) */
  timeout?: number;
  /** Number of retry attempts (default: 2) */
  retries?: number;
  /** Take screenshot on failure (default: true) */
  screenshotOnFailure?: boolean;
  /** Custom login URL (overrides config) */
  loginUrl?: string;
}

export interface LoginResult {
  /** Whether login was successful */
  success: boolean;
  /** Final URL after login attempt */
  finalUrl: string;
  /** Duration of login process in milliseconds */
  duration: number;
  /** Error message if login failed */
  error?: string;
  /** Screenshot path if taken */
  screenshotPath?: string;
}

export class LoginHelper {
  /**
   * Perform complete login flow with default settings
   * Simple one-line method for most use cases
   */
  static async performLogin(page: Page): Promise<boolean> {
    const result = await this.performLoginWithDetails(page);
    return result.success;
  }

  /**
   * Perform complete login flow with detailed result
   * Returns comprehensive information about the login attempt
   */
  static async performLoginWithDetails(page: Page, options: LoginOptions = {}): Promise<LoginResult> {
    const startTime = Date.now();
    const config = configManager.getConfig();
    
    // Default options
    const opts: Required<LoginOptions> = {
      email: options.email || process.env.GOOGLE_EMAIL || '',
      password: options.password || process.env.GOOGLE_PASSWORD || '',
      totpSecret: options.totpSecret || process.env.TOTP_SECRET_KEY || '',
      timeout: options.timeout || 60000,
      retries: options.retries ?? 2,
      screenshotOnFailure: options.screenshotOnFailure ?? true,
      loginUrl: options.loginUrl || configManager.getLoginUrl()
    };

    console.log('🚀 LoginHelper: Starting login process');
    console.log(`   Login URL: ${opts.loginUrl}`);
    console.log(`   Timeout: ${opts.timeout}ms`);
    console.log(`   Retries: ${opts.retries}`);

    // Validate required credentials
    if (!opts.email || !opts.password) {
      const error = 'Missing required credentials. Please set GOOGLE_EMAIL and GOOGLE_PASSWORD environment variables.';
      console.error('❌ LoginHelper:', error);
      return {
        success: false,
        finalUrl: page.url(),
        duration: Date.now() - startTime,
        error
      };
    }

    if (!opts.totpSecret) {
      const error = 'Missing TOTP secret. Please set TOTP_SECRET_KEY environment variable.';
      console.error('❌ LoginHelper:', error);
      return {
        success: false,
        finalUrl: page.url(),
        duration: Date.now() - startTime,
        error
      };
    }

    // Attempt login with retries
    let lastError: string = '';
    let screenshotPath: string | undefined;
    const maxAttempts = opts.retries + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔄 LoginHelper: Attempt ${attempt}/${maxAttempts}`);
        
        const loginPage = new GoogleOAuthLoginPage(page);
        
        // Set custom credentials if provided
        if (opts.email !== process.env.GOOGLE_EMAIL || 
            opts.password !== process.env.GOOGLE_PASSWORD || 
            opts.totpSecret !== process.env.TOTP_SECRET_KEY) {
          
          const loginSuccess = await loginPage.loginWithCredentials(
            opts.email,
            opts.password,
            opts.totpSecret
          );
          
          if (loginSuccess) {
            const duration = Date.now() - startTime;
            console.log(`✅ LoginHelper: Login successful in ${duration}ms`);
            return {
              success: true,
              finalUrl: page.url(),
              duration,
              screenshotPath
            };
          }
        } else {
          // Use environment variables
          const loginSuccess = await loginPage.performCompleteLogin();
          
          if (loginSuccess) {
            const duration = Date.now() - startTime;
            console.log(`✅ LoginHelper: Login successful in ${duration}ms`);
            return {
              success: true,
              finalUrl: page.url(),
              duration,
              screenshotPath
            };
          }
        }

        // Check for specific error messages
        const errorMessage = await loginPage.getLoginErrorMessage();
        if (errorMessage) {
          lastError = `Login failed: ${errorMessage}`;
          console.error(`❌ LoginHelper: ${lastError}`);
        } else {
          lastError = 'Login failed: Unknown error';
          console.error('❌ LoginHelper: Login failed without specific error message');
        }

        // Take screenshot on failure (except for last attempt, handled below)
        if (opts.screenshotOnFailure && attempt < maxAttempts) {
          try {
            screenshotPath = await loginPage.takeLoginScreenshot(`login_failure_attempt_${attempt}`);
            console.log(`📸 LoginHelper: Screenshot saved: ${screenshotPath}`);
          } catch (screenshotError) {
            console.warn('⚠️ LoginHelper: Failed to take screenshot:', screenshotError);
          }
        }

        // Wait before retry (except for last attempt)
        if (attempt < maxAttempts) {
          console.log(`⏳ LoginHelper: Waiting 3 seconds before retry...`);
          await page.waitForTimeout(3000);
        }

      } catch (error) {
        lastError = `Login attempt failed: ${error}`;
        console.error(`❌ LoginHelper: Attempt ${attempt} failed:`, error);
        
        // Take screenshot on error
        if (opts.screenshotOnFailure) {
          try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotFilePath = `reports/login_error_${timestamp}.png`;
            await page.screenshot({ 
              path: screenshotFilePath,
              fullPage: true 
            });
            screenshotPath = screenshotFilePath;
            console.log(`📸 LoginHelper: Error screenshot saved: ${screenshotPath}`);
          } catch (screenshotError) {
            console.warn('⚠️ LoginHelper: Failed to take error screenshot:', screenshotError);
          }
        }

        // Wait before retry (except for last attempt)
        if (attempt < maxAttempts) {
          console.log(`⏳ LoginHelper: Waiting 5 seconds before retry after error...`);
          await page.waitForTimeout(20000);
        }
      }
    }

    // All attempts failed
    const duration = Date.now() - startTime;
    console.error(`❌ LoginHelper: All login attempts failed after ${duration}ms`);
    
    return {
      success: false,
      finalUrl: page.url(),
      duration,
      error: lastError,
      screenshotPath
    };
  }

  /**
   * Quick login with custom credentials
   * Convenience method for tests that need different credentials
   */
  static async performLoginWithCredentials(
    page: Page, 
    email: string, 
    password: string, 
    totpSecret?: string
  ): Promise<boolean> {
    const result = await this.performLoginWithDetails(page, {
      email,
      password,
      totpSecret
    });
    return result.success;
  }

  /**
   * Verify if user is already logged in
   * Useful to skip login if already authenticated
   */
  static async isLoggedIn(page: Page): Promise<boolean> {
    try {
      const currentUrl = page.url();
      
      // Check if we're on auth/login pages
      if (currentUrl.includes('/auth') || 
          currentUrl.includes('/login') || 
          currentUrl.includes('accounts.google.com')) {
        return false;
      }
  
      // More reliable check: look for a key element on the main post-login page
      try {
        const askButtonVisible = await page.isVisible('button:has-text("Ask")', { timeout: 3000 });
        if (askButtonVisible) {
          console.log('✅ LoginHelper: Already logged in (found "Ask" button)');
          return true;
        }
      } catch {
        // "Ask" button not found, continue with other checks
      }

      // Check for common logged-in indicators
      const loggedInIndicators = [
        '[data-testid="user-menu"]',
        '[data-testid="logout"]',
        '.user-avatar',
        '.profile-menu',
        '[data-testid="user-profile"]'
      ];

      for (const indicator of loggedInIndicators) {
        try {
          const isVisible = await page.isVisible(indicator, { timeout: 2000 });
          if (isVisible) {
            console.log(`✅ LoginHelper: Already logged in (found ${indicator})`);
            return true;
          }
        } catch {
          // Continue checking other indicators
        }
      }

      return false;
    } catch (error) {
      console.warn('⚠️ LoginHelper: Error checking login status:', error);
      return false;
    }
  }

  /**
   * Perform login only if not already logged in
   * Smart login that checks current state first
   */
  static async ensureLoggedIn(page: Page, options: LoginOptions = {}): Promise<boolean> {
    console.log('🔍 LoginHelper: Checking if already logged in...');
    
    const alreadyLoggedIn = await this.isLoggedIn(page);
    if (alreadyLoggedIn) {
      console.log('✅ LoginHelper: Already logged in, skipping login process');
      return true;
    }

    console.log('🔑 LoginHelper: Not logged in, performing login...');
    return await this.performLogin(page);
  }

  /**
   * Get login URLs for different environments
   */
  static getLoginUrls() {
    const config = configManager.getConfig();
    return {
      login: configManager.getLoginUrl(),
      base: config.baseUrl,
      chat: config.baseUrl + '/chat',
      api: config.apiBaseUrl
    };
  }

  /**
   * Validate environment setup for login
   * Useful for debugging test setup issues
   */
  static validateEnvironment(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!process.env.GOOGLE_EMAIL) {
      issues.push('GOOGLE_EMAIL environment variable not set');
    }
    
    if (!process.env.GOOGLE_PASSWORD) {
      issues.push('GOOGLE_PASSWORD environment variable not set');
    }
    
    if (!process.env.TOTP_SECRET_KEY) {
      issues.push('TOTP_SECRET_KEY environment variable not set');
    }

    try {
      const config = configManager.getConfig();
      if (!config.baseUrl) {
        issues.push('Base URL not configured');
      }
    } catch (error) {
      issues.push(`Configuration error: ${error}`);
    }

    const valid = issues.length === 0;
    
    if (valid) {
      console.log('✅ LoginHelper: Environment validation passed');
    } else {
      console.error('❌ LoginHelper: Environment validation failed:');
      issues.forEach(issue => console.error(`   - ${issue}`));
    }

    return { valid, issues };
  }
}
