/**
 * Agent Module Test - Using priority and dependency management
 */

import {test, testHighest, testHigh, expect } from '@/framework/core/test-fixtures';
import { LoginHelper } from '@/framework/pages/login-helper';

// Configure tests to run sequentially and share browser context
test.describe.configure({ mode: 'serial' });

test.describe('Agent Module Tests', () => {
  
  testHighest('user login', {
    tags: ['@critical', '@auth', '@agent'],
    description: 'Authenticate user for agent module access'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting highest priority login test');
    
    const { page } = sharedPage;
    
    // Check if already logged in to avoid unnecessary login attempts
    const alreadyLoggedIn = await LoginHelper.isLoggedIn(page);
    if (alreadyLoggedIn) {
      console.log('✅ Already logged in, skipping login process');
      return;
    }
    
    // Perform login using LoginHelper with retries for better reliability
    const loginResult = await LoginHelper.performLoginWithDetails(page, {
      retries: 2  // Allow retries for better success rate
    });
    
    expect(loginResult.success, 'Login should be successful').toBe(true);
    
    console.log('✅ Login completed successfully');
    console.log('Current URL after login:', page.url());
  });

  testHigh('navigate to agent page', {
    dependsOn: ['user login'],
    tags: ['@core', '@navigation', '@agent'],
    description: 'Navigate to agent page after successful login'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting high priority agent navigation');
    
    const { page } = sharedPage;
    
    // Verify the agent navigation link is visible
    const agentNavLink = page.locator('a[href="/agent"]');
    await expect(agentNavLink).toBeVisible({ timeout: 10000 });
    console.log('✅ Agent navigation link is visible');
    
    // Verify the bot icon is present within the link
    const botIcon = agentNavLink.locator('svg.lucide-bot');
    await expect(botIcon).toBeVisible();
    console.log('✅ Bot icon is visible within agent link');
    
    // Click the agent navigation link
    await agentNavLink.click();
    console.log('✅ Clicked agent navigation link');
    
    // Wait for navigation and verify we're on the agent page
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toContain('/agent');
    await page.waitForTimeout(20000);
    console.log('✅ Successfully navigated to agent page:', currentUrl);
  });
});
