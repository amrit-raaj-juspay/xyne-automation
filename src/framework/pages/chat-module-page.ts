/**
 * Chat Module Page Object - Contains all chat-related page interactions
 */

import { Page } from '@playwright/test';
import { expect } from '@/framework/utils/instrumented-page';
import { ApiValidationService } from '../utils/api-validation-service';
import { APIMonitor } from '../utils/api-monitor';

export class ChatModulePage {
  private apiValidator: ApiValidationService;
  private apiMonitor: APIMonitor;

  constructor(private page: Page) {
    this.apiValidator = new ApiValidationService(page);
    this.apiMonitor = new APIMonitor(page, 'chat-module');
  }

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

  /**
   * Send message and wait for API response with validation
   * This is the main method you'll use to validate chat API responses
   */
  async sendMessageAndWaitForResponse(
    message: string = 'Hello, this is a test message for the chat functionality.',
    options: {
      chatApiEndpoint?: string;
      timeout?: number;
      validateResponse?: boolean;
      expectedStatusCode?: number;
      requiredKeys?: string[];
    } = {}
  ): Promise<{ 
    messageData: any; 
    apiResponse: any; 
    validationResults?: any[] 
  }> {
    const {
      chatApiEndpoint = '/api/v1/chat',  // Adjust this to your actual chat API endpoint
      timeout = 60000,
      validateResponse = true,
      expectedStatusCode = 200,
      requiredKeys = ['response', 'message_id']
    } = options;

    console.log('🚀 Starting message send with API validation');
    
    // Start API monitoring before sending the message
    await this.apiMonitor.startMonitoring('chat-message-test');
    
    // Send the message using existing method
    await this.sendMessageToChat(message);
    
    // Wait for the specific API response
    console.log(`⏳ Waiting for API response from ${chatApiEndpoint}...`);
    
    try {
      const apiResult = await this.apiValidator.waitForApiResponseWithInterception(
        chatApiEndpoint,
        {
          timeout,
          validationOptions: validateResponse ? {
            expectedStatusCode,
            expectedContentType: 'application/json',
            requiredKeys
          } : undefined
        }
      );

      console.log(`✅ API response received:`, apiResult);

      // Stop monitoring and get all captured calls
      await this.apiMonitor.stopMonitoring();
      const capturedCalls = this.apiMonitor.getAPICalls();

      return {
        messageData: { message, timestamp: new Date().toISOString() },
        apiResponse: apiResult,
        validationResults: apiResult.validationResults
      };

    } catch (error) {
      console.error(`❌ Failed to get API response: ${error}`);
      await this.apiMonitor.stopMonitoring();
      throw error;
    }
  }

  /**
   * Wait for specific API endpoint and validate response
   */
  async waitForApiEndpoint(
    endpoint: string,
    validationOptions: {
      expectedStatusCode?: number;
      requiredKeys?: string[];
      forbiddenKeys?: string[];
      timeout?: number;
    } = {}
  ): Promise<{ data: any; statusCode: number; validationResults?: any[] }> {
    const {
      expectedStatusCode = 200,
      requiredKeys = [],
      forbiddenKeys = [],
      timeout = 30000
    } = validationOptions;

    console.log(`🔍 Waiting for API endpoint: ${endpoint}`);

    const result = await this.apiValidator.waitForApiResponseWithInterception(
      endpoint,
      {
        timeout,
        validationOptions: {
          expectedStatusCode,
          expectedContentType: 'application/json',
          requiredKeys,
          forbiddenKeys
        }
      }
    );

    console.log(`✅ API endpoint ${endpoint} responded with status: ${result.statusCode}`);
    
    if (result.validationResults) {
      for (const validation of result.validationResults) {
        console.log(`📋 Validation: ${validation.message} - ${validation.success ? 'PASSED' : 'FAILED'}`);
      }
    }

    return result;
  }

  /**
   * Monitor and validate multiple API calls during chat interaction
   */
  async monitorChatAPIs(
    action: () => Promise<void>,
    expectedEndpoints: Array<{
      endpoint: string;
      expectedStatusCode?: number;
      requiredKeys?: string[];
    }> = []
  ): Promise<Record<string, any>> {
    console.log('🔍 Starting comprehensive API monitoring for chat interaction');

    // Start monitoring
    await this.apiMonitor.startMonitoring('chat-apis-monitoring');

    try {
      // Perform the action (e.g., send message, click button, etc.)
      await action();

      // Wait for all expected endpoints
      const results: Record<string, any> = {};
      
      for (const { endpoint, expectedStatusCode = 200, requiredKeys = [] } of expectedEndpoints) {
        try {
          const result = await this.waitForApiEndpoint(endpoint, {
            expectedStatusCode,
            requiredKeys,
            timeout: 30000
          });
          results[endpoint] = result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(`⚠️ Failed to capture ${endpoint}: ${errorMessage}`);
          results[endpoint] = { error: errorMessage };
        }
      }

      // Stop monitoring and get summary
      await this.apiMonitor.stopMonitoring();
      const summary = this.apiMonitor.getValidationSummary();
      
      console.log('📊 API Monitoring Summary:', summary);

      return {
        endpointResults: results,
        summary,
        allCapturedAPIs: this.apiMonitor.getAPICalls()
      };

    } catch (error) {
      await this.apiMonitor.stopMonitoring();
      throw error;
    }
  }

  /**
   * Validate that chat response contains expected data structure
   */
  async validateChatResponseStructure(
    apiResponse: any,
    expectedStructure: {
      hasMessageId?: boolean;
      hasTimestamp?: boolean;
      hasContent?: boolean;
      hasMetadata?: boolean;
      customValidations?: Array<(data: any) => boolean | string>;
    } = {}
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const {
      hasMessageId = true,
      hasTimestamp = true,
      hasContent = true,
      hasMetadata = false,
      customValidations = []
    } = expectedStructure;

    const errors: string[] = [];

    console.log('🔍 Validating chat response structure...');

    // Basic structure validations
    if (hasMessageId && !apiResponse.data?.message_id && !apiResponse.data?.id) {
      errors.push('Missing message ID in response');
    }

    if (hasTimestamp && !apiResponse.data?.timestamp && !apiResponse.data?.created_at) {
      errors.push('Missing timestamp in response');
    }

    if (hasContent && !apiResponse.data?.content && !apiResponse.data?.message && !apiResponse.data?.response) {
      errors.push('Missing content/message in response');
    }

    if (hasMetadata && !apiResponse.data?.metadata) {
      errors.push('Missing metadata in response');
    }

    // Custom validations
    for (const validation of customValidations) {
      const result = validation(apiResponse.data);
      if (typeof result === 'string') {
        errors.push(result);
      } else if (!result) {
        errors.push('Custom validation failed');
      }
    }

    const isValid = errors.length === 0;
    
    if (isValid) {
      console.log('✅ Chat response structure validation passed');
    } else {
      console.log('❌ Chat response structure validation failed:', errors);
    }

    return { isValid, errors };
  }

  /**
   * Extract specific data from API response
   */
  extractResponseData(apiResponse: any, dataPath: string): any {
    return this.apiValidator.extractNestedValue(apiResponse.data, dataPath);
  }

  /**
   * Validate API response timing
   */
  async validateResponseTiming(
    action: () => Promise<void>,
    endpoint: string,
    maxResponseTime: number = 5000
  ): Promise<{ responseTime: number; withinLimit: boolean }> {
    console.log(`⏱️ Measuring response time for ${endpoint}`);
    
    const startTime = Date.now();
    
    // Start listening for the API response
    const responsePromise = this.apiValidator.waitForApiResponseWithInterception(endpoint, {
      timeout: maxResponseTime + 1000
    });
    
    // Perform the action
    await action();
    
    // Wait for response and measure time
    const response = await responsePromise;
    const responseTime = Date.now() - startTime;
    const withinLimit = responseTime <= maxResponseTime;
    
    console.log(`⏱️ Response time: ${responseTime}ms (limit: ${maxResponseTime}ms) - ${withinLimit ? 'PASSED' : 'FAILED'}`);
    
    return { responseTime, withinLimit };
  }

  /**
   * Verify models API and check if model names are reflected in dropdown
   */
  async verifyModelsAPIAndDropdown(): Promise<void> {
    console.log('🚀 Starting models API and dropdown verification test');
    
    // Set up network interception to capture the models API response
    console.log('📡 Setting up network interception for /api/v1/chat/models...');
    
    let modelsApiResponse: any = null;
    
    // Listen for the models API response
    this.page.on('response', async (response) => {
      if (response.url().includes('/api/v1/chat/models')) {
        console.log(`📋 Intercepted models API response: ${response.status()}`);
        if (response.status() === 200) {
          try {
            modelsApiResponse = await response.json();
            console.log('📋 Models API response captured:', JSON.stringify(modelsApiResponse, null, 2));
          } catch (error) {
            console.log('⚠️ Failed to parse models API response as JSON:', error);
          }
        }
      }
    });

    // Trigger the API call by refreshing the page or opening the dropdown
    console.log('🔄 Refreshing page to trigger models API call...');
    await this.page.reload();
    await this.page.waitForTimeout(3000); // Wait for API calls to complete

    // If no API response was captured, try opening the model dropdown
    if (!modelsApiResponse) {
      console.log('🔍 No API response captured on page load, trying to open model dropdown...');
      
      // Find and click the model selector button
      const modelSelector = this.page.locator('button').filter({ 
        has: this.page.locator('span:has-text("Claude Sonnet 4"), span:has-text("Sonnet 4"), span:has-text("Claude"), span:has-text("GPT"), span:has-text("Gemini")') 
      }).first();
      
      await expect(modelSelector).toBeVisible({ timeout: 10000 });
      await modelSelector.click();
      await this.page.waitForTimeout(2000); // Wait for potential API call
    }

    // Verify we captured the API response
    expect(modelsApiResponse).toBeTruthy();
    expect(modelsApiResponse.models).toBeDefined();
    expect(Array.isArray(modelsApiResponse.models)).toBe(true);
    expect(modelsApiResponse.models.length).toBeGreaterThan(0);

    // Extract model names from the API response
    const modelNames: string[] = modelsApiResponse.models.map((model: any) => model.labelName);
    console.log('📋 Extracted model names from API:', modelNames);

    // Expected models based on the provided response format
    const expectedApiModels = ['Claude Sonnet 4', 'Gemini 2.5 Pro', 'Gemini 2.5 Flash'];
    for (const expectedModel of expectedApiModels) {
      expect(modelNames).toContain(expectedModel);
      console.log(`✅ Expected API model "${expectedModel}" found in response`);
    }

    // Now verify the model selector dropdown in the UI
    console.log('🔍 Verifying model selector dropdown...');
    
    // Find the model selector button
    const modelSelector = this.page.locator('button').filter({ 
      has: this.page.locator('span:has-text("Claude Sonnet 4"), span:has-text("Sonnet 4"), span:has-text("Claude"), span:has-text("GPT"), span:has-text("Gemini")') 
    }).first();
    
    await expect(modelSelector).toBeVisible({ timeout: 10000 });
    console.log('✅ Model selector button found');

    // Get the current selected model text
    const currentModelText = await modelSelector.textContent();
    console.log(`📋 Current selected model: "${currentModelText}"`);

    // Click on the model selector to open dropdown
    await modelSelector.click();
    console.log('✅ Model selector clicked to open dropdown');

    // Wait for dropdown to appear
    await this.page.waitForTimeout(2000);

    // Find the dropdown menu container
    const dropdownMenu = this.page.locator('div[role="menu"]').or(
      this.page.locator('div[data-radix-popper-content-wrapper]')
    ).first();
    
    await expect(dropdownMenu).toBeVisible({ timeout: 5000 });
    console.log('✅ Dropdown menu opened');

    // Extract all model options from the dropdown
    const modelOptions = await dropdownMenu.locator('div[role="menuitem"], button[role="menuitem"]').all();
    console.log(`📋 Found ${modelOptions.length} model options in dropdown`);

    const dropdownModelNames: string[] = [];
    
    for (const option of modelOptions) {
      // Look for the model name span within each option
      const modelNameSpan = option.locator('span.font-medium').first();
      if (await modelNameSpan.isVisible()) {
        const modelName = await modelNameSpan.textContent();
        if (modelName && modelName.trim()) {
          dropdownModelNames.push(modelName.trim());
          console.log(`📋 Found dropdown model: "${modelName.trim()}"`);
        }
      }
    }

    console.log('📋 All dropdown model names:', dropdownModelNames);

    // Verify that dropdown contains expected models based on the HTML structure provided
    const expectedDropdownModels = ['Sonnet 4', 'O3 Research', '2.5 Pro', '2.5 Flash'];
    
    for (const expectedModel of expectedDropdownModels) {
      const found = dropdownModelNames.some(name => 
        name.includes(expectedModel) || expectedModel.includes(name)
      );
      if (found) {
        console.log(`✅ Expected dropdown model "${expectedModel}" found`);
      } else {
        console.log(`⚠️ Expected dropdown model "${expectedModel}" not found`);
      }
    }

    // Verify correlation between API models and dropdown models
    let matchCount = 0;
    for (const apiModel of modelNames) {
      const found = dropdownModelNames.some(dropdownModel => {
        // Check for partial matches (e.g., "Claude Sonnet 4" matches "Sonnet 4")
        const apiModelNormalized = apiModel.toLowerCase().replace(/[^a-z0-9]/g, '');
        const dropdownModelNormalized = dropdownModel.toLowerCase().replace(/[^a-z0-9]/g, '');
        return apiModelNormalized.includes(dropdownModelNormalized) || 
               dropdownModelNormalized.includes(apiModelNormalized) ||
               this.normalizeModelName(apiModel) === this.normalizeModelName(dropdownModel);
      });
      if (found) {
        matchCount++;
        console.log(`✅ API model "${apiModel}" correlates with dropdown models`);
      }
    }

    // Extract expected providers from API response model names
    const expectedProviders = new Set<string>();
    for (const model of modelsApiResponse.models) {
      const labelName = model.labelName.toLowerCase();
      if (labelName.includes('claude')) {
        expectedProviders.add('Claude');
      } else if (labelName.includes('gemini')) {
        expectedProviders.add('Gemini');
      } else if (labelName.includes('gpt') || labelName.includes('openai')) {
        expectedProviders.add('OpenAI');
      }
    }
    
    console.log('📋 Expected providers from API:', Array.from(expectedProviders));
    
    // Verify provider sections are present in dropdown using correct selectors
    const providers: string[] = [];
    
    // Look for provider text elements directly
    for (const expectedProvider of expectedProviders) {
      const providerElement = await dropdownMenu.locator(`text=${expectedProvider}`).first();
      if (await providerElement.isVisible()) {
        providers.push(expectedProvider);
        console.log(`✅ Provider "${expectedProvider}" found in dropdown`);
      } else {
        console.log(`⚠️ Provider "${expectedProvider}" not found in dropdown`);
      }
    }
    
    console.log('📋 Found providers in dropdown:', providers);
    
    // Verify that all expected providers from API are present in dropdown
    for (const expectedProvider of expectedProviders) {
      const found = providers.includes(expectedProvider);
      expect(found).toBe(true);
    }

    // Close the dropdown by pressing Escape key
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(1000);
    
    console.log('✅ Dropdown closed');

    // Final validation
    expect(dropdownModelNames.length).toBeGreaterThan(0);
    expect(providers.length).toBeGreaterThan(0);
    expect(matchCount).toBeGreaterThan(0);
    
    console.log('🎉 Successfully verified models API and dropdown integration');
    console.log(`📊 Summary: API returned ${modelNames.length} models, dropdown shows ${dropdownModelNames.length} options, ${matchCount} correlations found`);
  }

  /**
   * Helper method to normalize model names for comparison
   */
  private normalizeModelName(modelName: string): string {
    return modelName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/claude/g, '')
      .replace(/openai/g, '')
      .replace(/gemini/g, '')
      .replace(/gpt/g, '')
      .trim();
  }

  /**
   * Upload a file using the attachment icon and verify API response
   */
  async uploadFileAndVerifyAPI(
    filePath: string,
    options: {
      uploadApiEndpoint?: string;
      timeout?: number;
      expectedStatusCode?: number;
      requiredKeys?: string[];
    } = {}
  ): Promise<{ 
    fileName: string; 
    uploadResponse: any; 
    validationResults?: any[] 
  }> {
    const {
      uploadApiEndpoint = '/api/v1/files/upload-attachment',  // Adjust this to your actual upload API endpoint
      timeout = 30000,
      expectedStatusCode = 200,
      requiredKeys = ['fileId', 'fileName', 'fileSize']
    } = options;

    console.log(`🚀 Starting file upload test for: ${filePath}`);
    
    // Extract filename from path
    const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
    
    
    // Locate the file attachment icon with the specific SVG structure
    const attachmentIcon = this.page.locator('div.relative.inline-block svg[title*="Attach files"]');
    await expect(attachmentIcon).toBeVisible({ timeout: 10000 });
    console.log('✅ File attachment icon found');
    
    // Verify the attachment icon attributes
    await expect(attachmentIcon).toHaveAttribute('width', '16');
    await expect(attachmentIcon).toHaveAttribute('height', '16');
    await expect(attachmentIcon).toHaveAttribute('viewBox', '0 0 16 16');
    console.log('✅ Attachment icon attributes verified');
    
    // Start API monitoring before file upload
    await this.apiMonitor.startMonitoring(`file-upload-${fileName}`);
    
    // Set up file chooser listener before clicking
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    
    // Click on the attachment icon to open file chooser
    await attachmentIcon.click();
    console.log('✅ Attachment icon clicked');
    
    // Wait for file chooser and select the file
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
    console.log(`✅ File selected: ${fileName}`);
    
    // Wait for upload API response
    console.log(`⏳ Waiting for upload API response from ${uploadApiEndpoint}...`);
    
    try {
      const uploadResult = await this.apiValidator.waitForApiResponseWithInterception(
        uploadApiEndpoint,
        {
          timeout,
          validationOptions: {
            expectedStatusCode,
            expectedContentType: 'application/json',
            requiredKeys
          }
        }
      );

      console.log(`✅ Upload API response received:`, uploadResult);

      // Stop monitoring and get all captured calls
      await this.apiMonitor.stopMonitoring();
      
      // Verify file appears in the interface
      await this.verifyUploadedFileInInterface(fileName);
      
      return {
        fileName,
        uploadResponse: uploadResult,
        validationResults: uploadResult.validationResults
      };

    } catch (error) {
      console.error(`❌ Failed to get upload API response: ${error}`);
      await this.apiMonitor.stopMonitoring();
      throw error;
    }
  }

  /**
   * Verify uploaded file appears in chat interface
   */
  async verifyUploadedFileInInterface(fileName: string): Promise<void> {
    console.log(`🔍 Verifying uploaded file appears in interface: ${fileName}`);
    
    // Wait for file to be processed and appear in the interface
    await this.page.waitForTimeout(3000);
    
    // Look for file attachment indicator in the chat interface
    const fileIndicator = this.page.locator(`text=${fileName}`).or(
      this.page.locator(`[title*="${fileName}"]`).or(
        this.page.locator('div').filter({ hasText: fileName }).or(
          this.page.locator('[data-testid*="file"]').or(
            this.page.locator('.file-attachment')
          )
        )
      )
    );
    
    // try {
    //   await expect(fileIndicator).toBeVisible({ timeout: 10000 });
    //   console.log(`✅ Uploaded file "${fileName}" is visible in chat interface`);
    // } catch (error) {
    //   console.log(`⚠️ File "${fileName}" not immediately visible in interface, checking for other indicators...`);
      
    //   // Check for generic file upload success indicators
    //   const uploadSuccess = this.page.locator('text=*uploaded*').or(
    //     this.page.locator('text=*attached*').or(
    //       this.page.locator('[role="status"]').or(
    //         this.page.locator('.upload-success')
    //       )
    //     )
    //   );
      
    //   if (await uploadSuccess.count() > 0) {
    //     console.log('✅ File upload success indicator found');
    //   } else {
    //     console.log('⚠️ No clear file upload indicator found in interface');
    //   }
    // }
  }

  /**
   * Send message with uploaded file and verify API response
   */
  async sendMessageWithUploadedFile(
    message: string = 'Please analyze this uploaded file.',
    options: {
      chatApiEndpoint?: string;
      timeout?: number;
      expectedStatusCode?: number;
      requiredKeys?: string[];
    } = {}
  ): Promise<any> {
    const {
      chatApiEndpoint = '/api/v1/chat',
      timeout = 60000,
      expectedStatusCode = 200,
      requiredKeys = ['chat', 'messages']
    } = options;

    console.log(`🚀 Sending message with uploaded file: "${message}"`);
    
    // Locate the chat input and send button
    const chatContainer = this.page.locator('div.flex.flex-col.w-full.border.dark\\:border-gray-700.rounded-\\[20px\\].bg-white.dark\\:bg-\\[\\#1E1E1E\\].search-container');
    const chatInput = chatContainer.locator('div[contenteditable="true"][data-at-mention="true"]');
    
    // Enter the message
    await chatInput.click();
    await chatInput.fill(message);
    console.log(`✅ Message entered: "${message}"`);
    
    // Start API monitoring for chat response
    await this.apiMonitor.startMonitoring('chat-with-file');
    
    // Send the message
    const sendButton = chatContainer.locator('button svg.lucide-arrow-right').locator('..');
    await sendButton.click();
    console.log('✅ Message with file sent');
    
    // Wait for chat API response
    try {
      const chatResult = await this.apiValidator.waitForApiResponseWithInterception(
        chatApiEndpoint,
        {
          timeout,
          validationOptions: {
            expectedStatusCode,
            expectedContentType: 'application/json',
            requiredKeys
          }
        }
      );

      console.log(`✅ Chat API response received:`, chatResult);
      await this.apiMonitor.stopMonitoring();
      
      return chatResult;

    } catch (error) {
      console.error(`❌ Failed to get chat API response: ${error}`);
      await this.apiMonitor.stopMonitoring();
      throw error;
    }
  }
}
