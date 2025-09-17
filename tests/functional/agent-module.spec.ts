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
    
    // Check if already logged in to avoid unnecessary login attempts
    const alreadyLoggedIn = await LoginHelper.isLoggedIn(sharedPage);
    if (alreadyLoggedIn) {
      console.log('✅ Already logged in, skipping login process');
      return;
    }
    
    // Perform login using LoginHelper with no retries (single attempt only)
    const loginResult = await LoginHelper.performLoginWithDetails(sharedPage, {
      retries: 0  // Only attempt once, no retries
    });
    
    expect(loginResult.success, 'Login should be successful').toBe(true);
    
    console.log('✅ Login completed successfully');
    console.log('Current URL after login:', sharedPage.url());
  });

  testHigh('navigate to agent page', {
    dependsOn: ['user login'],
    tags: ['@core', '@navigation', '@agent'],
    description: 'Navigate to agent page after successful login'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting high priority agent navigation');
    
    // Verify the agent navigation link is visible
    const agentNavLink = sharedPage.locator('a[href="/agent"]');
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
    await sharedPage.waitForTimeout(2000);
    const currentUrl = sharedPage.url();
    expect(currentUrl).toContain('/agent');
    await sharedPage.waitForTimeout(20000);
    console.log('✅ Successfully navigated to agent page:', currentUrl);
  });
});
