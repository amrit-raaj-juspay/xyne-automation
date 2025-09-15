/**
 * Chat Module Test - Separate test cases with session sharing
 */

import { test, expect } from '@playwright/test';
import { LoginHelper } from '@/framework/pages/login-helper';

// Configure tests to run sequentially and share browser context
test.describe.configure({ mode: 'serial' });

test.describe('Chat Module Tests', () => {
  let sharedPage: any;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    sharedPage = await context.newPage();
  });
  
  test('user login', async () => {
    console.log('🚀 Starting login test');
    
    // Check if already logged in to avoid unnecessary login attempts
    const alreadyLoggedIn = await LoginHelper.isLoggedIn(sharedPage);
    if (alreadyLoggedIn) {
      console.log('✅ Already logged in, skipping login process');
      return;
    }
    
    // Perform login using LoginHelper
    const loginSuccess = await LoginHelper.performLogin(sharedPage);
    expect(loginSuccess, 'Login should be successful').toBe(true);
    
    console.log('✅ Login completed successfully');
    console.log('Current URL after login:', sharedPage.url());
  });

  test('verify chat page elements', async () => {
    console.log('🚀 Starting chat verification test');
    console.log('🔍 Verifying chat page elements...');
    
    // Login should have automatically redirected to chat page
    // Just verify we're on the chat page by checking for key elements
    try {
      await expect(sharedPage.locator('button:has-text("Ask")')).toBeVisible({ timeout: 10000 });
      console.log('✅ Chat page loaded');
    } catch (error) {
      console.log('❌ Ask button not found. Current URL:', sharedPage.url());
      throw error;
    }
    
    // Verify Ask and Search buttons are present
    const askButton = sharedPage.locator('button:has-text("Ask")');
    const searchButton = sharedPage.locator('button:has-text("Search")');
    
    await expect(askButton).toBeVisible();
    await expect(searchButton).toBeVisible();
    console.log('✅ Ask and Search buttons found');
    
    // Verify the search input container
    const searchContainer = sharedPage.locator('div.search-container');
    await expect(searchContainer).toBeVisible();
    console.log('✅ Search container found');
    
    // Verify the main input field with placeholder text
    const inputField = sharedPage.locator('[contenteditable="true"][data-at-mention="true"]');
    await expect(inputField).toBeVisible();
    console.log('✅ Main input field found');
    
    // Verify placeholder text is present
    const placeholderText = sharedPage.locator('text=Ask anything across apps...');
    await expect(placeholderText).toBeVisible();
    console.log('✅ Placeholder text found');
    
    // Verify file attachment icon
    const attachmentIcon = sharedPage.locator('svg[title*="Attach files"]');
    await expect(attachmentIcon).toBeVisible();
    console.log('✅ File attachment icon found');
    
    // Verify @ mention icon
    const mentionIcon = sharedPage.locator('svg.reference-trigger');
    await expect(mentionIcon).toBeVisible();
    console.log('✅ @ mention icon found');
    
    // Verify model selector (Claude Sonnet 4)
    const modelSelector = sharedPage.locator('button:has-text("Claude Sonnet 4")');
    await expect(modelSelector).toBeVisible();
    console.log('✅ Model selector found');
    
    // Verify Agent toggle button
    const agentButton = sharedPage.locator('button:has-text("Agent")');
    await expect(agentButton).toBeVisible();
    console.log('✅ Agent button found');
    
    // Verify send button (arrow icon)
    const sendButton = sharedPage.locator('button svg.lucide-arrow-right').locator('..');
    await expect(sendButton).toBeVisible();
    console.log('✅ Send button found');
    
    console.log('🎉 Successfully verified all chat page elements');
  });

  test('verify search functionality', async () => {
    console.log('🚀 Starting search functionality test');
    
    // Click on the Search button to activate search mode
    const searchButton = sharedPage.locator('button:has-text("Search")');
    await searchButton.click();
    console.log('✅ Search button clicked');
    
    // Wait to visually see the search button click action
    await sharedPage.waitForTimeout(2000);
    
    // Verify the search interface appears with the expected structure
    const searchContainer = sharedPage.locator('div.flex.w-full.items-center.bg-white.dark\\:bg-\\[\\#1E1E1E\\].rounded-\\[20px\\].border.border-\\[\\#D3DAE0\\].dark\\:border-gray-700.h-\\[52px\\]');
    await expect(searchContainer).toBeVisible({ timeout: 5000 });
    console.log('✅ Search container found');
    
    // Verify search icon is present
    const searchIcon = searchContainer.locator('svg.lucide-search');
    await expect(searchIcon).toBeVisible();
    console.log('✅ Search icon found');
    
    // Verify search input field with correct placeholder
    const searchInput = searchContainer.locator('input[placeholder="Search anything across apps..."]');
    await expect(searchInput).toBeVisible();
    console.log('✅ Search input field found');
    
    
    // Verify search submit button (arrow icon)
    const searchSubmitButton = searchContainer.locator('button svg.lucide-arrow-right').locator('..');
    await expect(searchSubmitButton).toBeVisible();
    console.log('✅ Search submit button found');
    
    
    console.log('🎉 Search functionality verification completed');
  });

});
