/**
 * Chat Module Page Object - Contains all chat-related page interactions
 */

import { Page, expect } from '@playwright/test';

export class ChatModulePage {

  constructor(private page: Page) {}

  /**
   * Verify all chat page UI elements are present and visible
   */
  async verifyChatPageElements(): Promise<void> {
    console.log('🚀 Starting chat verification test');
    console.log('🔍 Verifying chat page elements...');
    
    // Login should have automatically redirected to chat page
    // Just verify we're on the chat page by checking for key elements
    try {
      await expect(this.page.locator('button:has-text("Ask")')).toBeVisible({ timeout: 10000 });
      console.log('✅ Chat page loaded');
    } catch (error) {
      console.log('❌ Ask button not found. Current URL:', this.page.url());
      throw error;
    }
    
    // Verify Ask and Search buttons are present
    const askButton = this.page.locator('button:has-text("Ask")');
    const searchButton = this.page.locator('button:has-text("Search")');
    
    await expect(askButton).toBeVisible();
    await expect(searchButton).toBeVisible();
    console.log('✅ Ask and Search buttons found');
    
    // Verify the search input container
    const searchContainer = this.page.locator('div.search-container');
    await expect(searchContainer).toBeVisible();
    console.log('✅ Search container found');
    
    // Verify the main input field with placeholder text
    const inputField = this.page.locator('[contenteditable="true"][data-at-mention="true"]');
    await expect(inputField).toBeVisible();
    console.log('✅ Main input field found');
    
    // Verify placeholder text is present
    const placeholderText = this.page.locator('text=Ask a question or type @ to search your apps');
    await expect(placeholderText).toBeVisible();
    console.log('✅ Placeholder text found');
    
    // Verify file attachment icon
    const attachmentIcon = this.page.locator('svg[title*="Attach files"]');
    await expect(attachmentIcon).toBeVisible();
    console.log('✅ File attachment icon found');
    
    // Verify model selector (Claude Sonnet 4)
    const modelSelector = this.page.locator('button:has-text("Claude Sonnet 4")');
    await expect(modelSelector).toBeVisible();
    console.log('✅ Model selector found');
    
    // Verify send button (arrow icon)
    const sendButton = this.page.locator('button svg.lucide-arrow-right').locator('..');
    await expect(sendButton).toBeVisible();
    console.log('✅ Send button found');
    
    console.log('🎉 Successfully verified all chat page elements');
  }

  /**
   * Verify search functionality and interface elements
   */
  async verifySearchFunctionality(): Promise<void> {
    console.log('🚀 Starting search functionality test');
    
    // Click on the Search button to activate search mode
    const searchButton = this.page.locator('button:has-text("Search")');
    await searchButton.click();
    console.log('✅ Search button clicked');
    
    // Wait to visually see the search button click action
    await this.page.waitForTimeout(2000);
    
    // Verify the search interface appears with the expected structure
    const searchContainer = this.page.locator('div.flex.w-full.items-center.bg-white.dark\\:bg-\\[\\#1E1E1E\\].rounded-\\[20px\\].border.border-\\[\\#D3DAE0\\].dark\\:border-gray-700.h-\\[52px\\]');
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
  }

  /**
   * Send a message in the chat interface
   */
  async sendMessageToChat(message: string = 'Hello, this is a test message for the chat functionality.'): Promise<void> {
    console.log('🚀 Starting sending messages to chat test');
    
    // First, click on Ask button to ensure we're in chat mode
    const askButton = this.page.locator('button:has-text("Ask")');
    await askButton.click();
    console.log('✅ Ask button clicked to enter chat mode');
    
    // Wait for the chat interface to load
    await this.page.waitForTimeout(2000);
    
    // Locate the chat container with the specific structure
    const chatContainer = this.page.locator('div.flex.flex-col.w-full.border.dark\\:border-gray-700.rounded-\\[20px\\].bg-white.dark\\:bg-\\[\\#1E1E1E\\].search-container');
    await expect(chatContainer).toBeVisible({ timeout: 5000 });
    console.log('✅ Chat container found');
    
    // Locate the contenteditable input field within the chat container
    const chatInput = chatContainer.locator('div[contenteditable="true"][data-at-mention="true"]');
    await expect(chatInput).toBeVisible();
    console.log('✅ Chat input field found');
    
    // Click on the chat input field to focus it
    await chatInput.click();
    console.log('✅ Chat input field clicked and focused');
    
    // Enter the message
    await chatInput.fill(message);
    console.log(`✅ Test message entered: "${message}"`);
    
    // Verify the message was entered correctly
    await expect(chatInput).toHaveText(message);
    console.log('✅ Message content verified in input field');
    
    // Click on the chat container itself (the outer container)
    await chatContainer.click();
    console.log('✅ Chat container clicked');
    
    // Wait to see the interaction
    await this.page.waitForTimeout(1000);
    
    // Verify the send button is visible and enabled
    const sendButton = chatContainer.locator('button svg.lucide-arrow-right').locator('..');
    await expect(sendButton).toBeVisible();
    await sendButton.click();
    console.log('✅ Send button clicked');
    
    console.log('🎉 Successfully entered valid chat message and sent it');
  }

  /**
   * Verify all chat header icons are present and functional
   */
  async verifyChatHeaderIcons(): Promise<string> {
    console.log('🚀 Starting chat header icons verification test');
    
    // Locate the chat header container
    const headerContainer = this.page.locator('div.flex.h-\\[48px\\].items-center.max-w-3xl.w-full.px-4');
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

    await this.page.waitForTimeout(10000);
    
    console.log('🎉 Successfully verified all chat header icons and title');
    
    return titleText?.trim() || '';
  }

  /**
   * Verify AI reply appears with proper feedback buttons
   */
  async verifyAIReplyAndFeedbackButtons(): Promise<void> {
    console.log('🚀 Starting chat reply and feedback buttons verification test');
    
    // Wait for a reply to appear in the chat (up to 30 seconds)
    console.log('⏳ Waiting for chat reply to appear...');
    
    // Look for the AI reply container specifically (data-index="1" or use .last() for most recent)
    // Fix: Use .last() to avoid strict mode violation when multiple replies exist
    const replyContainer = this.page.locator('div[data-index]').filter({ 
      has: this.page.locator('div.max-w-full.min-w-0.flex.flex-col.items-end.space-y-3') 
    }).last();
    await expect(replyContainer).toBeVisible({ timeout: 30000 });
    console.log('✅ Chat reply container found');
    
    // Wait a bit more to ensure the reply is fully loaded
    await this.page.waitForTimeout(3000);
    
    // Look for the markdown content to ensure the reply text is present
    const markdownContent = replyContainer.locator('div.markdown-content');
    await expect(markdownContent).toBeVisible();
    console.log('✅ Reply markdown content found');
    
    // Locate the feedback icons container within the reply
    const feedbackContainer = replyContainer.locator('div.flex.ml-\\[52px\\].mt-\\[12px\\].items-center');
    await expect(feedbackContainer).toBeVisible({ timeout: 10000 });
    console.log('✅ Feedback icons container found');
    
    // Verify copy icon (lucide-copy)
    const copyIcon = feedbackContainer.locator('svg.lucide-copy');
    await expect(copyIcon).toBeVisible();
    await expect(copyIcon).toHaveAttribute('width', '16');
    await expect(copyIcon).toHaveAttribute('height', '16');
    await expect(copyIcon).toHaveAttribute('viewBox', '0 0 24 24');
    await expect(copyIcon).toHaveAttribute('stroke', '#B2C3D4');
    await expect(copyIcon).toHaveAttribute('stroke-width', '2');
    await expect(copyIcon).toHaveClass(/cursor-pointer/);
    console.log('✅ Copy icon verified with correct attributes');
    
    // Verify thumbs-up icon (lucide-thumbs-up)
    const thumbsUpIcon = feedbackContainer.locator('svg.lucide-thumbs-up');
    await expect(thumbsUpIcon).toBeVisible();
    await expect(thumbsUpIcon).toHaveAttribute('width', '16');
    await expect(thumbsUpIcon).toHaveAttribute('height', '16');
    await expect(thumbsUpIcon).toHaveAttribute('viewBox', '0 0 24 24');
    await expect(thumbsUpIcon).toHaveAttribute('stroke', '#B2C3D4');
    await expect(thumbsUpIcon).toHaveAttribute('stroke-width', '2');
    await expect(thumbsUpIcon).toHaveClass(/cursor-pointer/);
    await expect(thumbsUpIcon).toHaveClass(/ml-\[18px\]/);
    console.log('✅ Thumbs-up icon verified with correct attributes');
    
    // Verify thumbs-down icon (lucide-thumbs-down)
    const thumbsDownIcon = feedbackContainer.locator('svg.lucide-thumbs-down');
    await expect(thumbsDownIcon).toBeVisible();
    await expect(thumbsDownIcon).toHaveAttribute('width', '16');
    await expect(thumbsDownIcon).toHaveAttribute('height', '16');
    await expect(thumbsDownIcon).toHaveAttribute('viewBox', '0 0 24 24');
    await expect(thumbsDownIcon).toHaveAttribute('stroke', '#B2C3D4');
    await expect(thumbsDownIcon).toHaveAttribute('stroke-width', '2');
    await expect(thumbsDownIcon).toHaveClass(/cursor-pointer/);
    await expect(thumbsDownIcon).toHaveClass(/ml-\[10px\]/);
    console.log('✅ Thumbs-down icon verified with correct attributes');
    
    // Verify the SVG paths for each icon to ensure they are the correct icons
    
    // Copy icon path verification
    const copyRect = copyIcon.locator('rect');
    await expect(copyRect).toHaveAttribute('width', '14');
    await expect(copyRect).toHaveAttribute('height', '14');
    await expect(copyRect).toHaveAttribute('x', '8');
    await expect(copyRect).toHaveAttribute('y', '8');
    await expect(copyRect).toHaveAttribute('rx', '2');
    await expect(copyRect).toHaveAttribute('ry', '2');
    
    const copyPath = copyIcon.locator('path');
    await expect(copyPath).toHaveAttribute('d', 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2');
    console.log('✅ Copy icon SVG paths verified');
    
    // Thumbs-up icon path verification
    const thumbsUpPaths = thumbsUpIcon.locator('path');
    await expect(thumbsUpPaths.nth(0)).toHaveAttribute('d', 'M7 10v12');
    await expect(thumbsUpPaths.nth(1)).toHaveAttribute('d', 'M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z');
    console.log('✅ Thumbs-up icon SVG paths verified');
    
    // Thumbs-down icon path verification
    const thumbsDownPaths = thumbsDownIcon.locator('path');
    await expect(thumbsDownPaths.nth(0)).toHaveAttribute('d', 'M17 14V2');
    await expect(thumbsDownPaths.nth(1)).toHaveAttribute('d', 'M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z');
    console.log('✅ Thumbs-down icon SVG paths verified');
    
    // Verify all icons are clickable by testing hover state
    await copyIcon.hover();
    await this.page.waitForTimeout(500);
    await thumbsUpIcon.hover();
    await this.page.waitForTimeout(500);
    await thumbsDownIcon.hover();
    await this.page.waitForTimeout(500);
    console.log('✅ All feedback icons are hoverable (interactive)');
    
    // Verify the icons are in the correct order (copy, thumbs-up, thumbs-down)
    const allIcons = feedbackContainer.locator('svg');
    await expect(allIcons).toHaveCount(3);
    
    // Check the order by class names
    await expect(allIcons.nth(0)).toHaveClass(/lucide-copy/);
    await expect(allIcons.nth(1)).toHaveClass(/lucide-thumbs-up/);
    await expect(allIcons.nth(2)).toHaveClass(/lucide-thumbs-down/);
    console.log('✅ Icons are in correct order: copy, thumbs-up, thumbs-down');
    
    console.log('🎉 Successfully verified chat reply and all feedback icons with correct attributes and SVG paths');
  }

  /**
   * Edit chat title using pencil icon functionality
   */
  async editChatTitle(newTitle: string = 'Updated Chat Title - Test'): Promise<{ originalTitle: string; updatedTitle: string }> {
    console.log('🚀 Starting pencil icon functionality test');
    
    // Locate the chat header container
    const headerContainer = this.page.locator('div.flex.h-\\[48px\\].items-center.max-w-3xl.w-full.px-4');
    await expect(headerContainer).toBeVisible({ timeout: 5000 });
    console.log('✅ Chat header container found');
    
    // Get the current title text before editing
    const titleSpan = headerContainer.locator('span.text-\\[\\#1C1D1F\\].dark\\:text-gray-100.text-\\[16px\\].font-normal.overflow-hidden.text-ellipsis.whitespace-nowrap.font-medium');
    await expect(titleSpan).toBeVisible();
    const originalTitle = await titleSpan.textContent();
    console.log(`📝 Original title: "${originalTitle}"`);
    
    // Verify the pencil icon with correct attributes based on provided HTML
    const pencilIcon = headerContainer.locator('svg.lucide-pencil');
    await expect(pencilIcon).toBeVisible();
    await expect(pencilIcon).toHaveAttribute('width', '18');
    await expect(pencilIcon).toHaveAttribute('height', '18');
    await expect(pencilIcon).toHaveAttribute('viewBox', '0 0 24 24');
    await expect(pencilIcon).toHaveAttribute('stroke', '#4A4F59');
    await expect(pencilIcon).toHaveAttribute('stroke-width', '2');
    await expect(pencilIcon).toHaveClass(/cursor-pointer/);
    await expect(pencilIcon).toHaveClass(/dark:stroke-gray-400/);
    console.log('✅ Pencil icon attributes verified');
    
    // Verify the pencil icon SVG paths
    const pencilPaths = pencilIcon.locator('path');
    await expect(pencilPaths.nth(0)).toHaveAttribute('d', 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z');
    await expect(pencilPaths.nth(1)).toHaveAttribute('d', 'm15 5 4 4');
    console.log('✅ Pencil icon SVG paths verified');
    
    // Click on the pencil icon to enable editing
    await pencilIcon.click();
    console.log('✅ Pencil icon clicked');
    
    // Wait for the edit mode to activate
    await this.page.waitForTimeout(1000);
    
    // The input field should now be active and editable after clicking pencil icon
    // Try multiple possible selectors for the edit input field
    const editInput = this.page.locator('input[type="text"]').or(
      this.page.locator('input:not([type])').or(
        this.page.locator('[contenteditable="true"]').or(
          this.page.locator('textarea')
        )
      )
    ).first();
    await expect(editInput).toBeVisible({ timeout: 5000 });
    console.log('✅ Edit input field found');
    
    // Clear the existing content and enter a new title
    // Use keyboard shortcuts to select all and replace
    await editInput.click();
    await editInput.press('Control+a'); // Select all
    await editInput.fill(newTitle);
    console.log(`📝 New title entered: "${newTitle}"`);
    
    // Verify the input contains the new title
    const inputValue = await editInput.inputValue();
    expect(inputValue).toBe(newTitle);
    console.log('✅ Input field contains the new title');
    
    // Press Enter to save the title
    await editInput.press('Enter');
    console.log('✅ Enter pressed to save the title');
    
    // Wait for the edit mode to close and the title to update
    await this.page.waitForTimeout(2000);
    
    // Verify the title has been updated in the UI
    await expect(titleSpan).toBeVisible();
    const updatedTitle = await titleSpan.textContent();
    console.log(`📝 Updated title in UI: "${updatedTitle}"`);
    
    // Verify the title has actually changed
    expect(updatedTitle).toBe(newTitle);
    expect(updatedTitle).not.toBe(originalTitle);
    console.log('✅ Title successfully updated in the UI');
    
    // Verify the pencil icon is still clickable after the update
    await expect(pencilIcon).toBeVisible();
    await expect(pencilIcon).toHaveClass(/cursor-pointer/);
    console.log('✅ Pencil icon remains clickable after update');
    
    console.log('🎉 Successfully verified pencil icon functionality and title editing');
    
    return {
      originalTitle: originalTitle?.trim() || '',
      updatedTitle: updatedTitle?.trim() || ''
    };
  }

  /**
   * Navigate to chat page
   */
  async navigateToChat(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForTimeout(2000);
    console.log('✅ Navigated to chat page');
  }

  /**
   * Wait for page to load
   */
  async waitForPageLoad(timeout: number = 3000): Promise<void> {
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Get current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }
}
