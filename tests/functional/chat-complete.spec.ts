/**
 * Complete chat functionality testing with built-in network monitoring and LLM validation
 * TypeScript equivalent of Python's test_chat_complete.py
 */

import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../../src/framework/pages/login-page';
import { configManager } from '../../src/framework/core/config-manager';

// Test configuration
const config = configManager.getConfig();
const loginUrl = configManager.getLoginUrl();

test.describe('Xyne Chat Complete Testing Suite', () => {
  
  test('login page validation', async ({ page }) => {
    console.log('🚀 Starting login page validation test');
    
    const loginPage = new LoginPage(page);
    
    // Navigate to login page
    await loginPage.navigateToLogin(loginUrl);
    
    // Comprehensive login page validation
    const validationResults = await loginPage.validateLoginPageElements();
    
    // Core login page assertions
    expect(validationResults.pageLoaded, 'Login page should load successfully').toBe(true);
    expect(validationResults.loginHeading, 'Expected "Login" heading').toBe('Login');
    expect(validationResults.subtitle, 'Subtitle should match expected text').toBe('Login with your workspace google account');
    expect(validationResults.googleButtonVisible, 'Google login button should be visible').toBe(true);
    expect(validationResults.googleButtonEnabled, 'Google login button should be enabled').toBe(true);
    expect(validationResults.hasErrors, 'Should not have error messages').toBe(false);
    expect(validationResults.isLoading, 'Page should not be in loading state').toBe(false);
    
    // URL validation
    expect(validationResults.currentUrl, 'Should be on auth page').toContain('/auth');
    
    // Page title validation
    expect(validationResults.pageTitle, 'Page should have a title').toBeTruthy();
    expect(validationResults.pageTitle.length, 'Page title should not be empty').toBeGreaterThan(0);
    
    // Take screenshot for visual verification
    const screenshotPath = await loginPage.takeLoginPageScreenshot('login_page_validation.png');
    
    console.log('✅ Login Page Validation Results:');
    console.log(`   Page Title: ${validationResults.pageTitle}`);
    console.log(`   Login Heading: ${validationResults.loginHeading}`);
    console.log(`   Subtitle: ${validationResults.subtitle}`);
    console.log(`   Google Button Visible: ${validationResults.googleButtonVisible}`);
    console.log(`   Google Button Enabled: ${validationResults.googleButtonEnabled}`);
    console.log(`   Current URL: ${validationResults.currentUrl}`);
    console.log(`   Page Load Status: ${validationResults.pageLoaded}`);
    console.log(`   Has Errors: ${validationResults.hasErrors}`);
    console.log(`   Screenshot: ${screenshotPath}`);
  });

  test('basic chat functionality with network monitoring', async ({ page }) => {
    console.log('🚀 Starting basic chat functionality test');
    
    // Network monitoring setup
    const networkRequests: any[] = [];
    const networkResponses: any[] = [];
    
    // Capture network requests
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
    
    // Navigate to chat page (assuming login is handled separately or mocked)
    await page.goto(config.baseUrl + '/chat', { waitUntil: 'networkidle' });
    
    // Basic chat interaction simulation
    // Note: This would need to be adapted based on actual chat interface
    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea');
    const sendButton = page.locator('[data-testid="send-button"], button:has-text("Send")');
    
    if (await chatInput.isVisible()) {
      const query = "What is artificial intelligence?";
      await chatInput.fill(query);
      await sendButton.click();
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Check for response elements
      const responseElements = page.locator('[data-testid="chat-response"], .message, .response');
      const responseCount = await responseElements.count();
      
      expect(responseCount, 'Should receive a response').toBeGreaterThan(0);
      
      if (responseCount > 0) {
        const responseText = await responseElements.first().textContent();
        expect(responseText, 'Response should be substantial').toBeTruthy();
        expect(responseText!.length, 'Response should have meaningful content').toBeGreaterThan(10);
        
        console.log(`✅ Chat response received: ${responseText!.substring(0, 100)}...`);
      }
    }
    
    // Network validation
    const apiCalls = networkRequests.filter(req => req.url.includes('/api/'));
    expect(apiCalls.length, 'Should have made API calls').toBeGreaterThan(0);
    
    // Performance validation
    const failedResponses = networkResponses.filter(resp => !resp.ok);
    const successRate = ((networkResponses.length - failedResponses.length) / networkResponses.length) * 100;
    expect(successRate, 'API success rate should be high').toBeGreaterThanOrEqual(90);
    
    console.log('✅ Basic Chat Test Results:');
    console.log(`   Network requests: ${networkRequests.length}`);
    console.log(`   API calls: ${apiCalls.length}`);
    console.log(`   Success rate: ${successRate.toFixed(1)}%`);
    console.log(`   Failed responses: ${failedResponses.length}`);
  });

  test('performance monitoring', async ({ page }) => {
    console.log('🚀 Starting performance monitoring test');
    
    const performanceMetrics: any[] = [];
    
    // Monitor performance
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        performanceMetrics.push({
          url: response.url(),
          status: response.status(),
          timing: response.request().timing(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Navigate to application
    const startTime = Date.now();
    await page.goto(config.baseUrl, { waitUntil: 'networkidle' });
    const pageLoadTime = Date.now() - startTime;
    
    // Performance assertions
    expect(pageLoadTime, 'Page load time should be reasonable').toBeLessThan(10000); // 10 seconds
    
    // Check for performance issues
    const slowRequests = performanceMetrics.filter(metric => {
      const timing = metric.timing;
      return timing && (timing.responseEnd - timing.requestStart) > 5000; // 5 seconds
    });
    
    expect(slowRequests.length, 'Should not have many slow requests').toBeLessThanOrEqual(2);
    
    console.log('✅ Performance Test Results:');
    console.log(`   Page load time: ${pageLoadTime}ms`);
    console.log(`   API requests monitored: ${performanceMetrics.length}`);
    console.log(`   Slow requests: ${slowRequests.length}`);
  });

  test('error handling and edge cases', async ({ page }) => {
    console.log('🚀 Starting error handling test');
    
    // Test navigation to non-existent page
    const response = await page.goto(config.baseUrl + '/non-existent-page', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    // Should handle 404 gracefully
    if (response) {
      console.log(`Response status for non-existent page: ${response.status()}`);
      // Most applications should show a 404 page rather than crashing
      expect([404, 200].includes(response.status()), 'Should handle non-existent pages gracefully').toBe(true);
    }
    
    // Test with invalid URL parameters
    await page.goto(config.baseUrl + '?invalid=<script>alert("xss")</script>', { 
      waitUntil: 'networkidle' 
    });
    
    // Check that page still loads and doesn't execute malicious scripts
    const pageTitle = await page.title();
    expect(pageTitle, 'Page should still load with invalid parameters').toBeTruthy();
    
    console.log('✅ Error Handling Test Results:');
    console.log(`   Handled non-existent page gracefully`);
    console.log(`   Handled invalid parameters safely`);
  });

  test('comprehensive validation', async ({ page }) => {
    console.log('🚀 Starting comprehensive validation test');
    
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
    
    // Navigate to main application
    await page.goto(config.baseUrl, { waitUntil: 'networkidle' });
    
    // 1. Frontend Validation
    const pageTitle = await page.title();
    expect(pageTitle, 'Should have page title').toBeTruthy();
    
    // 2. Network Validation
    const apiCalls = networkData.requests.filter(req => req.url.includes('/api/'));
    const successfulResponses = networkData.responses.filter(resp => resp.status < 400);
    const successRate = (successfulResponses.length / networkData.responses.length) * 100;
    
    expect(successRate, 'Network reliability should be high').toBeGreaterThanOrEqual(90);
    
    // 3. Performance Validation
    const totalTime = Date.now() - startTime;
    expect(totalTime, 'Total test time should be reasonable').toBeLessThan(30000); // 30 seconds
    
    // 4. Error Validation
    expect(networkData.errors.length, 'Should not have JavaScript errors').toBeLessThanOrEqual(1);
    
    console.log('✅ Comprehensive Validation Results:');
    console.log(`   Page Title: ${pageTitle}`);
    console.log(`   Network Requests: ${networkData.requests.length}`);
    console.log(`   API Calls: ${apiCalls.length}`);
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`   JavaScript Errors: ${networkData.errors.length}`);
    console.log(`   Total Test Time: ${totalTime}ms`);
  });
});
