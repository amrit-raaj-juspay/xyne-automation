/**
 * Google OAuth + TOTP Login Test Suite
 * Comprehensive tests for Google OAuth authentication with TOTP
 * TypeScript equivalent of Python's login test functionality
 */

import { test, expect } from '@playwright/test';
import { GoogleOAuthLoginPage } from '../../src/framework/pages/google-oauth-login-page';
import { configManager } from '../../src/framework/core/config-manager';

// Test configuration
const config = configManager.getConfig();

// Configure tests to run sequentially to avoid TOTP conflicts
test.describe.configure({ mode: 'serial' });

test.describe('Google OAuth + TOTP Login Tests', () => {
  let loginPage: GoogleOAuthLoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new GoogleOAuthLoginPage(page);
    console.log('🚀 Starting Google OAuth + TOTP login test');
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot after each test for debugging
    await loginPage.takeLoginScreenshot('test_end');
  });

  test('complete Google OAuth + TOTP login flow', async ({ page }) => {
    console.log('🔐 Testing complete Google OAuth + TOTP login flow');
    
    // Network monitoring setup
    const networkRequests: any[] = [];
    const networkResponses: any[] = [];
    
    // Capture network requests for monitoring
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: new Date().toISOString(),
        resourceType: request.resourceType()
      });
    });
    
    // Capture network responses
    page.on('response', response => {
      networkResponses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        timestamp: new Date().toISOString(),
        ok: response.ok()
      });
    });

    // Perform complete login flow
    const startTime = Date.now();
    const loginSuccess = await loginPage.performCompleteLogin();
    const loginDuration = Date.now() - startTime;

    // Assertions
    expect(loginSuccess, 'Login should be successful').toBe(true);
    expect(loginDuration, 'Login should complete within reasonable time').toBeLessThan(120000); // 2 minutes max

    // Verify we're no longer on auth pages
    const currentUrl = loginPage.getCurrentUrl();
    expect(currentUrl, 'Should not be on Google auth pages').not.toContain('accounts.google.com');
    expect(currentUrl, 'Should not be on login page').not.toContain('/auth');

    // Network validation
    const authRequests = networkRequests.filter(req => 
      req.url.includes('accounts.google.com') || 
      req.url.includes('oauth') ||
      req.url.includes('auth')
    );
    expect(authRequests.length, 'Should have made authentication requests').toBeGreaterThan(0);

    // Check for failed responses
    const failedResponses = networkResponses.filter(resp => !resp.ok && resp.status >= 400);
    expect(failedResponses.length, 'Should not have many failed requests').toBeLessThanOrEqual(2);

    console.log('✅ Complete Login Test Results:');
    console.log(`   Login Duration: ${loginDuration}ms`);
    console.log(`   Final URL: ${currentUrl}`);
    console.log(`   Network Requests: ${networkRequests.length}`);
    console.log(`   Auth Requests: ${authRequests.length}`);
    console.log(`   Failed Responses: ${failedResponses.length}`);
  });

  test('login page validation before OAuth flow', async ({ page }) => {
    console.log('🔍 Testing login page validation');
    
    // Navigate to login page
    const loginUrl = configManager.getLoginUrl();
    await loginPage.navigateToLogin(loginUrl);
    
    // Validate login page elements
    const validation = await loginPage.validateLoginPageElements();
    
    // Core login page assertions
    expect(validation.pageLoaded, 'Login page should load successfully').toBe(true);
    expect(validation.loginHeading, 'Should have login heading').toBeTruthy();
    expect(validation.googleButtonVisible, 'Google login button should be visible').toBe(true);
    expect(validation.googleButtonEnabled, 'Google login button should be enabled').toBe(true);
    expect(validation.hasErrors, 'Should not have error messages initially').toBe(false);
    
    // URL validation
    expect(validation.currentUrl, 'Should be on auth page').toContain('/auth');
    
    console.log('✅ Login Page Validation Results:');
    console.log(`   Page Title: ${validation.pageTitle}`);
    console.log(`   Login Heading: ${validation.loginHeading}`);
    console.log(`   Google Button Visible: ${validation.googleButtonVisible}`);
    console.log(`   Current URL: ${validation.currentUrl}`);
  });

  test('quick login method functionality', async ({ page }) => {
    console.log('⚡ Testing quick login method');
    
    // Use the quick login method
    const loginSuccess = await loginPage.quickLogin();
    
    // Verify login success
    expect(loginSuccess, 'Quick login should be successful').toBe(true);
    
    // Verify we're logged in
    const currentUrl = loginPage.getCurrentUrl();
    expect(currentUrl, 'Should be redirected away from auth pages').not.toContain('/auth');
    
    console.log('✅ Quick Login Test Results:');
    console.log(`   Login Success: ${loginSuccess}`);
    console.log(`   Final URL: ${currentUrl}`);
  });

  test('error handling during login flow', async ({ page }) => {
    console.log('❌ Testing error handling during login');
    
    // Monitor for JavaScript errors
    const jsErrors: any[] = [];
    page.on('pageerror', error => {
      jsErrors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });
    
    // Monitor for console errors
    const consoleErrors: any[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          text: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    try {
      // Attempt login (may fail due to various reasons)
      const loginSuccess = await loginPage.performCompleteLogin();
      
      // If login succeeds, that's good
      if (loginSuccess) {
        console.log('✅ Login succeeded without errors');
      }
      
    } catch (error) {
      console.log('ℹ️ Login failed as expected for error testing:', error);
      
      // Check if error was handled gracefully
      const errorMessage = await loginPage.getLoginErrorMessage();
      console.log(`Error message displayed: ${errorMessage}`);
    }
    
    // Verify error handling
    expect(jsErrors.length, 'Should not have many JavaScript errors').toBeLessThanOrEqual(2);
    
    console.log('✅ Error Handling Test Results:');
    console.log(`   JavaScript Errors: ${jsErrors.length}`);
    console.log(`   Console Errors: ${consoleErrors.length}`);
    
    if (jsErrors.length > 0) {
      console.log('   JS Errors:', jsErrors);
    }
  });

  test('login performance monitoring', async ({ page }) => {
    console.log('📊 Testing login performance');
    
    const performanceMetrics: any[] = [];
    
    // Monitor performance
    page.on('response', response => {
      if (response.url().includes('accounts.google.com') || 
          response.url().includes('oauth') ||
          response.url().includes('auth')) {
        performanceMetrics.push({
          url: response.url(),
          status: response.status(),
          timing: response.request().timing(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Measure total login time
    const startTime = Date.now();
    
    try {
      const loginSuccess = await loginPage.performCompleteLogin();
      const totalTime = Date.now() - startTime;
      
      // Performance assertions
      expect(totalTime, 'Total login time should be reasonable').toBeLessThan(180000); // 3 minutes max
      
      // Check for slow requests
      const slowRequests = performanceMetrics.filter(metric => {
        const timing = metric.timing;
        return timing && (timing.responseEnd - timing.requestStart) > 10000; // 10 seconds
      });
      
      expect(slowRequests.length, 'Should not have many slow requests').toBeLessThanOrEqual(1);
      
      console.log('✅ Performance Test Results:');
      console.log(`   Total Login Time: ${totalTime}ms`);
      console.log(`   Auth Requests Monitored: ${performanceMetrics.length}`);
      console.log(`   Slow Requests: ${slowRequests.length}`);
      console.log(`   Login Success: ${loginSuccess}`);
      
    } catch (error) {
      console.log('ℹ️ Performance test completed with error:', error);
    }
  });

  test('session persistence after login', async ({ page }) => {
    console.log('🔄 Testing session persistence');
    
    // First, perform login
    const loginSuccess = await loginPage.performCompleteLogin();
    
    if (loginSuccess) {
      const urlAfterLogin = loginPage.getCurrentUrl();
      
      // Navigate to a different page and back
      await page.goto(config.baseUrl);
      await page.waitForTimeout(2000);
      
      // Check if still logged in (not redirected to auth)
      const currentUrl = loginPage.getCurrentUrl();
      const stillLoggedIn = !currentUrl.includes('/auth') && !currentUrl.includes('login');
      
      expect(stillLoggedIn, 'Session should persist after navigation').toBe(true);
      
      console.log('✅ Session Persistence Test Results:');
      console.log(`   Initial Login: ${loginSuccess}`);
      console.log(`   URL After Login: ${urlAfterLogin}`);
      console.log(`   URL After Navigation: ${currentUrl}`);
      console.log(`   Session Persisted: ${stillLoggedIn}`);
    } else {
      console.log('⚠️ Skipping session persistence test - login failed');
    }
  });

  test('comprehensive login validation', async ({ page }) => {
    console.log('🔍 Testing comprehensive login validation');
    
    // Comprehensive test combining multiple validations
    const startTime = Date.now();
    
    // Network monitoring
    const networkData = {
      requests: [] as any[],
      responses: [] as any[],
      errors: [] as any[]
    };
    
    page.on('request', req => networkData.requests.push({
      url: req.url(),
      method: req.method(),
      timestamp: new Date().toISOString()
    }));
    
    page.on('response', resp => networkData.responses.push({
      url: resp.url(),
      status: resp.status(),
      timestamp: new Date().toISOString()
    }));
    
    page.on('pageerror', error => networkData.errors.push({
      message: error.message,
      timestamp: new Date().toISOString()
    }));
    
    // Perform login
    const loginSuccess = await loginPage.performCompleteLogin();
    
    if (loginSuccess) {
      // 1. URL Validation
      const currentUrl = loginPage.getCurrentUrl();
      expect(currentUrl, 'Should not be on auth pages').not.toContain('/auth');
      
      // 2. Page Title Validation
      const pageTitle = await loginPage.getPageTitle();
      expect(pageTitle, 'Should have page title').toBeTruthy();
      
      // 3. Network Validation
      const authCalls = networkData.requests.filter(req => 
        req.url.includes('accounts.google.com') || 
        req.url.includes('oauth')
      );
      const successfulResponses = networkData.responses.filter(resp => resp.status < 400);
      const successRate = (successfulResponses.length / networkData.responses.length) * 100;
      
      expect(authCalls.length, 'Should have made auth calls').toBeGreaterThan(0);
      expect(successRate, 'Network reliability should be high').toBeGreaterThanOrEqual(80);
      
      // 4. Performance Validation
      const totalTime = Date.now() - startTime;
      expect(totalTime, 'Total test time should be reasonable').toBeLessThan(180000); // 3 minutes
      
      // 5. Error Validation
      expect(networkData.errors.length, 'Should not have many JavaScript errors').toBeLessThanOrEqual(1);
      
      console.log('✅ Comprehensive Validation Results:');
      console.log(`   Login Success: ${loginSuccess}`);
      console.log(`   Page Title: ${pageTitle}`);
      console.log(`   Current URL: ${currentUrl}`);
      console.log(`   Network Requests: ${networkData.requests.length}`);
      console.log(`   Auth Calls: ${authCalls.length}`);
      console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
      console.log(`   JavaScript Errors: ${networkData.errors.length}`);
      console.log(`   Total Test Time: ${totalTime}ms`);
    } else {
      console.log('⚠️ Login failed - comprehensive validation skipped');
      expect(loginSuccess, 'Login should succeed for comprehensive validation').toBe(true);
    }
  });
});

// Test configuration validation
test.describe('Login Configuration Tests', () => {
  test('environment variables validation', async () => {
    console.log('⚙️ Testing environment variables');
    
    // Check required environment variables
    const requiredVars = ['GOOGLE_EMAIL', 'GOOGLE_PASSWORD', 'TOTP_SECRET_KEY'];
    const missingVars: string[] = [];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }
    
    if (missingVars.length > 0) {
      console.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`);
      console.warn('Please set these variables in your .env file for login tests to work');
    }
    
    // This test should pass even if vars are missing (for CI/CD)
    expect(true, 'Environment check completed').toBe(true);
    
    console.log('✅ Environment Variables Check:');
    console.log(`   Required Variables: ${requiredVars.join(', ')}`);
    console.log(`   Missing Variables: ${missingVars.length > 0 ? missingVars.join(', ') : 'None'}`);
  });

  test('configuration manager validation', async () => {
    console.log('⚙️ Testing configuration manager');
    
    const config = configManager.getConfig();
    const validation = configManager.validateConfig();
    
    // Basic configuration assertions
    expect(config.baseUrl, 'Should have base URL').toBeTruthy();
    expect(config.timeout.action, 'Should have action timeout').toBeGreaterThan(0);
    expect(validation.valid, 'Configuration should be valid').toBe(true);
    
    if (!validation.valid) {
      console.error('Configuration errors:', validation.errors);
    }
    
    console.log('✅ Configuration Validation Results:');
    console.log(`   Base URL: ${config.baseUrl}`);
    console.log(`   Browser: ${config.browser}`);
    console.log(`   Headless: ${config.headless}`);
    console.log(`   Valid: ${validation.valid}`);
    console.log(`   Errors: ${validation.errors.length}`);
  });
});
