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
    const placeholderText = sharedPage.locator('text=Ask a question or type @ to search your apps');
    await expect(placeholderText).toBeVisible();
    console.log('✅ Placeholder text found');
    
    // Verify file attachment icon
    const attachmentIcon = sharedPage.locator('svg[title*="Attach files"]');
    await expect(attachmentIcon).toBeVisible();
    console.log('✅ File attachment icon found');
    
  
    
    // Verify model selector (Claude Sonnet 4)
    const modelSelector = sharedPage.locator('button:has-text("Claude Sonnet 4")');
    await expect(modelSelector).toBeVisible();
    console.log('✅ Model selector found');
    
 
    
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

  test('verify able to send messages to chat', async () => {
    console.log('🚀 Starting sending messages to chat test');
    
    // First, click on Ask button to ensure we're in chat mode
    const askButton = sharedPage.locator('button:has-text("Ask")');
    await askButton.click();
    console.log('✅ Ask button clicked to enter chat mode');
    
    // Wait for the chat interface to load
    await sharedPage.waitForTimeout(2000);
    
    // Locate the chat container with the specific structure
    const chatContainer = sharedPage.locator('div.flex.flex-col.w-full.border.dark\\:border-gray-700.rounded-\\[20px\\].bg-white.dark\\:bg-\\[\\#1E1E1E\\].search-container');
    await expect(chatContainer).toBeVisible({ timeout: 5000 });
    console.log('✅ Chat container found');
    
    // Locate the contenteditable input field within the chat container
    const chatInput = chatContainer.locator('div[contenteditable="true"][data-at-mention="true"]');
    await expect(chatInput).toBeVisible();
    console.log('✅ Chat input field found');
    
    // Click on the chat input field to focus it
    await chatInput.click();
    console.log('✅ Chat input field clicked and focused');
    
    // Enter a valid chat message
    const testMessage = 'Hello, this is a test message for the chat functionality.';
    await chatInput.fill(testMessage);
    console.log(`✅ Test message entered: "${testMessage}"`);
    
    // Verify the message was entered correctly
    await expect(chatInput).toHaveText(testMessage);
    console.log('✅ Message content verified in input field');
    
    // Click on the chat container itself (the outer container)
    await chatContainer.click();
    console.log('✅ Chat container clicked');
    
    // Wait to see the interaction
    await sharedPage.waitForTimeout(1000);
    
    // Verify the send button is visible and enabled
    const sendButton = chatContainer.locator('button svg.lucide-arrow-right').locator('..');
    await expect(sendButton).toBeVisible();
    await sendButton.click();
    console.log('✅ Send button is visible and ready');
    
    console.log('🎉 Successfully entered valid chat message and clicked on chat container');
  });

  test('verify chat header icons', async () => {
    console.log('🚀 Starting chat header icons verification test');
    
    // Locate the chat header container
    const headerContainer = sharedPage.locator('div.flex.h-\\[48px\\].items-center.max-w-3xl.w-full.px-4');
    await expect(headerContainer).toBeVisible({ timeout: 5000 });
    console.log('✅ Chat header container found');
    
    // Verify the title span has some text (not checking exact text)
    const titleSpan = headerContainer.locator('span.text-\\[\\#1C1D1F\\].dark\\:text-gray-100.text-\\[16px\\].font-normal.overflow-hidden.text-ellipsis.whitespace-nowrap.font-medium');
    await expect(titleSpan).toBeVisible();
    
    // Check that the span has some text content (not empty)
    const titleText = await titleSpan.textContent();
    expect(titleText).toBeTruthy();
    expect(titleText?.trim().length).toBeGreaterThan(0);
    console.log(`✅ Title span found with text: "${titleText}"`);
    
    // Verify pencil icon (edit)
    const pencilIcon = headerContainer.locator('svg.lucide-pencil');
    await expect(pencilIcon).toBeVisible();
    console.log('✅ Pencil (edit) icon found');
    
    // Verify share icon
    const shareIcon = headerContainer.locator('svg.lucide-share2');
    await expect(shareIcon).toBeVisible();
    console.log('✅ Share icon found');
    
    // Verify bookmark icon
    const bookmarkIcon = headerContainer.locator('svg.lucide-bookmark');
    await expect(bookmarkIcon).toBeVisible();
    console.log('✅ Bookmark icon found');
    
    // Verify ellipsis icon (more options)
    const ellipsisIcon = headerContainer.locator('svg.lucide-ellipsis');
    await expect(ellipsisIcon).toBeVisible();
    console.log('✅ Ellipsis (more options) icon found');
    
    // Verify all icons are clickable (have cursor-pointer class)
    await expect(pencilIcon).toHaveClass(/cursor-pointer/);
    await expect(shareIcon).toHaveClass(/cursor-pointer/);
    await expect(bookmarkIcon).toHaveClass(/cursor-pointer/);
    console.log('✅ All icons have cursor-pointer class (clickable)');

    await sharedPage.waitForTimeout(10000);
    
    console.log('🎉 Successfully verified all chat header icons and title');
  });

  test('verify if reply comes and feedback buttons are there', async () => {
    console.log('🚀 Starting chat reply and feedback buttons verification test');
    // Wait for a reply to appear in the chat (up to 30 seconds
  });
});
