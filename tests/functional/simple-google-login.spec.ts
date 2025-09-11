/**
 * Simple Google OAuth + TOTP Login Test
 * Single test to avoid TOTP conflicts from multiple browser windows
 */

import { test, expect } from '@playwright/test';
import { GoogleOAuthLoginPage } from '../../src/framework/pages/google-oauth-login-page';

test('Google OAuth + TOTP login', async ({ page }) => {
  console.log('🚀 Starting simple Google OAuth + TOTP login test');
  
  const loginPage = new GoogleOAuthLoginPage(page);
  
  // Perform complete login flow
  const startTime = Date.now();
  const loginSuccess = await loginPage.performCompleteLogin();
  const loginDuration = Date.now() - startTime;

  // Verify login success
  expect(loginSuccess, 'Login should be successful').toBe(true);
  
  // Verify we're no longer on auth pages
  const currentUrl = loginPage.getCurrentUrl();
  expect(currentUrl, 'Should not be on Google auth pages').not.toContain('accounts.google.com');
  expect(currentUrl, 'Should not be on login page').not.toContain('/auth');

  console.log('✅ Simple Login Test Results:');
  console.log(`   Login Duration: ${loginDuration}ms`);
  console.log(`   Final URL: ${currentUrl}`);
  console.log(`   Login Success: ${loginSuccess}`);
});
