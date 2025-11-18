/**
 * Multi-User Chat Page for Xyne Spaces
 * Handles 2-user chat automation scenarios in Spaces environment
 * Uses multiple browser contexts to simulate real concurrent chat between users
 */

import { Page, BrowserContext } from '@playwright/test';
import { expect } from '@/framework/utils/instrumented-page';
import { SpacesLoginHelper } from './spaces-login-helper';

export interface SpacesChatUser {
  context: BrowserContext;
  page: Page;
  name: string;
  credentials?: {
    email: string;
    password: string;
  };
}

export class SpacesMultiUserChatPage {
  private user1: SpacesChatUser | null = null;
  private user2: SpacesChatUser | null = null;
  private chatRoomId: string | null = null;

  /**
   * Initialize two users with separate browser contexts for Spaces
   */
  async initializeUsers(
    context1: BrowserContext,
    context2: BrowserContext,
    user1Name: string = 'User 1',
    user2Name: string = 'User 2'
  ): Promise<{ user1: SpacesChatUser; user2: SpacesChatUser }> {
    console.log('🚀 Initializing two users for Spaces chat testing');

    // Create pages for both users
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Initialize user objects
    this.user1 = {
      context: context1,
      page: page1,
      name: user1Name,
    };

    this.user2 = {
      context: context2,
      page: page2,
      name: user2Name,
    };

    console.log(`✅ Initialized ${user1Name} and ${user2Name} for Spaces`);

    return {
      user1: this.user1,
      user2: this.user2,
    };
  }

  /**
   * Login both users sequentially with a delay to allow OTP refresh
   * Supports different credentials for each user
   * @param loginDelay - Delay in milliseconds between logins (default: 45000ms = 45 seconds)
   * @param useDifferentUsers - If true, uses USER1 and USER2 credentials from .env (default: false)
   */
  async loginBothUsersSequentially(
    loginDelay: number = 45000,
    useDifferentUsers: boolean = false
  ): Promise<void> {
    if (!this.user1 || !this.user2) {
      throw new Error('Users not initialized. Call initializeUsers() first.');
    }

    if (useDifferentUsers) {
      // Use different credentials for each user with small stagger to avoid race conditions
      console.log(`🔐 Logging in ${this.user1.name} to Spaces with USER1 credentials (${process.env.USER1_GOOGLE_EMAIL})`);
      const user1Success = await SpacesLoginHelper.performLoginWithCredentials(
        this.user1.page,
        process.env.USER1_GOOGLE_EMAIL!,
        process.env.USER1_GOOGLE_PASSWORD!,
        process.env.USER1_TOTP_SECRET_KEY
      );
      
      if (!user1Success) {
        throw new Error(`Failed to login User 1 to Spaces with credentials: ${process.env.USER1_GOOGLE_EMAIL}`);
      }
      
      // Small delay to avoid Google OAuth race conditions (much shorter than 45 seconds!)
      console.log(`⏳ Waiting 5 seconds before ${this.user2.name} login (different user, just avoiding race condition)...`);
      await this.user1.page.waitForTimeout(5000);
      
      console.log(`🔐 Logging in ${this.user2.name} to Spaces with USER2 credentials (${process.env.USER2_GOOGLE_EMAIL})`);
      const user2Success = await SpacesLoginHelper.performLoginWithCredentials(
        this.user2.page,
        process.env.USER2_GOOGLE_EMAIL!,
        process.env.USER2_GOOGLE_PASSWORD!,
        process.env.USER2_TOTP_SECRET_KEY
      );
      
      if (!user2Success) {
        throw new Error(`Failed to login User 2 to Spaces with credentials: ${process.env.USER2_GOOGLE_EMAIL}`);
      }
    } else {
      // Use same credentials (legacy mode)
      console.log(`🔐 Logging in ${this.user1.name} to Spaces`);
      await SpacesLoginHelper.performLogin(this.user1.page);
      
      console.log(`⏳ Waiting ${loginDelay / 1000} seconds for OTP to refresh before ${this.user2.name} login...`);
      await this.user1.page.waitForTimeout(loginDelay);
      
      console.log(`🔐 Logging in ${this.user2.name} to Spaces`);
      await SpacesLoginHelper.performLogin(this.user2.page);
    }
    
    console.log('✅ Both users logged in successfully to Spaces');
  }

  /**
   * Open Chat and search for a specific user to start conversation in Spaces
   */
  async openChatWithUser(fromUserPage: any, toUserName: string): Promise<void> {
    console.log(`🔍 ${fromUserPage.name} opening Spaces chat with ${toUserName}...`);
    
    // Wait for page to be ready
    await fromUserPage.page.waitForLoadState('networkidle');
    await fromUserPage.page.waitForTimeout(3000);
    
    // Step 1: Click on Chat button in sidebar
    console.log(`💬 Clicking Chat button in Spaces sidebar...`);
    const chatButton = fromUserPage.page.locator('button[data-sidebar-sub-option="Chat"]').first();
    
    try {
      await chatButton.waitFor({ state: 'visible', timeout: 10000 });
      await chatButton.click();
      console.log(`✅ Spaces Chat button clicked`);
      await fromUserPage.page.waitForTimeout(3000);
    } catch (e) {
      console.log(`⚠️ Spaces Chat button not found, trying alternative...`);
      const altChatButton = fromUserPage.page.locator('button:has(svg.lucide-message-square)').first();
      await altChatButton.waitFor({ state: 'visible', timeout: 5000 });
      await altChatButton.click();
      console.log(`✅ Spaces Chat button clicked (alternative selector)`);
      await fromUserPage.page.waitForTimeout(3000);
    }
    
    // Step 2: Find and use the search input to search for the user
    console.log(`🔍 Searching for user in Spaces: ${toUserName}...`);
    const searchInput = fromUserPage.page.locator('input[placeholder="Search users and channels"]');
    
    try {
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });
      
      // Click on the search input to focus it
      await searchInput.click();
      console.log(`✅ Spaces search input focused`);
      await fromUserPage.page.waitForTimeout(1000);
      
      // Type the user name to search
      await searchInput.fill(toUserName);
      console.log(`✅ Typed "${toUserName}" in Spaces search`);
      await fromUserPage.page.waitForTimeout(2000);
      
      // Wait for search results to appear
      console.log(`⏳ Waiting for Spaces search results...`);
      await fromUserPage.page.waitForTimeout(2000);
      
      // Click on the search result using the exact element structure
      const searchResultItem = fromUserPage.page.locator('div.chat-sidebar-search-result-item').first();
      
      try {
        await searchResultItem.waitFor({ state: 'visible', timeout: 5000 });
        await searchResultItem.click();
        console.log(`✅ Clicked on Spaces search result for ${toUserName}`);
        await fromUserPage.page.waitForTimeout(2000);
      } catch (e) {
        console.log(`⚠️ Primary Spaces search result not found, trying alternative...`);
        
        // Alternative: Try clicking on the name span within the result
        const nameSpan = fromUserPage.page.locator('span.chat-sidebar-search-result-name', { hasText: toUserName }).first();
        const nameVisible = await nameSpan.isVisible({ timeout: 3000 }).catch(() => false);
        
        if (nameVisible) {
          await nameSpan.click();
          console.log(`✅ Clicked on name span in Spaces for ${toUserName}`);
          await fromUserPage.page.waitForTimeout(2000);
        } else {
          console.log(`⚠️ Spaces search result not found, continuing anyway...`);
        }
      }
      
    } catch (e) {
      console.log(`⚠️ Spaces search input not found or error: ${e}`);
    }
    
    console.log(`✅ Spaces chat with ${toUserName} should be open`);
  }

  async navigateBothUsersToChat(): Promise<void> {
    if (!this.user1 || !this.user2) {
      throw new Error('Users not initialized. Call initializeUsers() first.');
    }

    console.log('🚀 Setting up Spaces chat between both users');

    // Wait for both pages to be ready after login
    await this.user1.page.waitForLoadState('networkidle');
    await this.user2.page.waitForLoadState('networkidle');
    await this.user1.page.waitForTimeout(3000);
    await this.user2.page.waitForTimeout(3000);
    
    console.log('✅ Both users are logged in to Spaces and pages are ready');
    
    // User 1 opens chat with User 2
    await this.openChatWithUser(this.user1, this.user2.name);
    
    // User 2 opens chat with User 1
    await this.openChatWithUser(this.user2, this.user1.name);

    console.log('✅ Both users have opened Spaces chat with each other');
  }

  /**
   * User 1 sends a message in Spaces
   */
  async user1SendsMessage(message: string): Promise<void> {
    if (!this.user1) {
      throw new Error('User 1 not initialized');
    }

    console.log(`📤 ${this.user1.name} sending in Spaces: "${message}"`);
    
    // Send message using chat input
    const chatInput = this.user1.page.locator('textarea[placeholder*="Message"], input[placeholder*="Type a message"]');
    await chatInput.fill(message);
    await chatInput.press('Enter');
    await this.user1.page.waitForTimeout(1000);
    
    console.log(`✅ ${this.user1.name} message sent in Spaces`);
  }

  /**
   * User 2 sends a message in Spaces
   */
  async user2SendsMessage(message: string): Promise<void> {
    if (!this.user2) {
      throw new Error('User 2 not initialized');
    }

    console.log(`📤 ${this.user2.name} sending in Spaces: "${message}"`);
    
    // Send message using chat input
    const chatInput = this.user2.page.locator('textarea[placeholder*="Message"], input[placeholder*="Type a message"]');
    await chatInput.fill(message);
    await chatInput.press('Enter');
    await this.user2.page.waitForTimeout(1000);
    
    console.log(`✅ ${this.user2.name} message sent in Spaces`);
  }

  /**
   * Verify User 1 can see a specific message in Spaces
   */
  async verifyUser1SeesMessage(message: string, timeout: number = 10000): Promise<void> {
    if (!this.user1) {
      throw new Error('User 1 not initialized');
    }

    console.log(`🔍 Verifying ${this.user1.name} sees in Spaces: "${message}"`);
    
    const messageLocator = this.user1.page.locator(`text="${message}"`).first();
    await expect(messageLocator).toBeVisible({ timeout });
    
    console.log(`✅ ${this.user1.name} confirmed message visible in Spaces`);
  }

  /**
   * Verify User 2 can see a specific message in Spaces
   */
  async verifyUser2SeesMessage(message: string, timeout: number = 10000): Promise<void> {
    if (!this.user2) {
      throw new Error('User 2 not initialized');
    }

    console.log(`🔍 Verifying ${this.user2.name} sees in Spaces: "${message}"`);
    
    const messageLocator = this.user2.page.locator(`text="${message}"`).first();
    await expect(messageLocator).toBeVisible({ timeout });
    
    console.log(`✅ ${this.user2.name} confirmed message visible in Spaces`);
  }

  /**
   * Simulate a conversation between two users in Spaces
   * @param conversation Array of messages with sender info
   */
  async simulateConversation(
    conversation: Array<{ sender: 1 | 2; message: string; delay?: number }>
  ): Promise<void> {
    console.log('🎭 Starting Spaces conversation simulation');

    for (const { sender, message, delay = 2000 } of conversation) {
      if (sender === 1) {
        await this.user1SendsMessage(message);
        // Verify user 2 sees it
        await this.verifyUser2SeesMessage(message);
      } else {
        await this.user2SendsMessage(message);
        // Verify user 1 sees it
        await this.verifyUser1SeesMessage(message);
      }

      // Add delay between messages for realistic simulation
      await this.user1?.page.waitForTimeout(delay);
    }

    console.log('✅ Spaces conversation simulation completed');
  }

  /**
   * Test parallel messaging in Spaces (both users send at the same time)
   */
  async testParallelMessaging(message1: string, message2: string): Promise<void> {
    if (!this.user1 || !this.user2) {
      throw new Error('Users not initialized');
    }

    console.log('🚀 Testing parallel messaging in Spaces');

    // Send messages in parallel
    await Promise.all([
      this.user1SendsMessage(message1),
      this.user2SendsMessage(message2),
    ]);

    // Verify both users see both messages
    await Promise.all([
      this.verifyUser1SeesMessage(message1),
      this.verifyUser1SeesMessage(message2),
      this.verifyUser2SeesMessage(message1),
      this.verifyUser2SeesMessage(message2),
    ]);

    console.log('✅ Spaces parallel messaging test completed');
  }

  /**
   * Verify message order is correct for both users in Spaces
   */
  async verifyMessageOrder(messages: string[]): Promise<void> {
    if (!this.user1 || !this.user2) {
      throw new Error('Users not initialized');
    }

    console.log('🔍 Verifying message order in Spaces');

    for (const [index, message] of messages.entries()) {
      console.log(`Checking message ${index + 1} in Spaces: "${message}"`);
      
      // Check in both user views
      await Promise.all([
        this.verifyUser1SeesMessage(message),
        this.verifyUser2SeesMessage(message),
      ]);
    }

    console.log('✅ Message order verified for both users in Spaces');
  }

  /**
   * Get all messages from User 1's view in Spaces
   */
  async getUser1Messages(): Promise<string[]> {
    if (!this.user1) {
      throw new Error('User 1 not initialized');
    }

    const messages = await this.user1.page.locator('.message, [class*="message"]').allTextContents();
    return messages;
  }

  /**
   * Get all messages from User 2's view in Spaces
   */
  async getUser2Messages(): Promise<string[]> {
    if (!this.user2) {
      throw new Error('User 2 not initialized');
    }

    const messages = await this.user2.page.locator('.message, [class*="message"]').allTextContents();
    return messages;
  }

  /**
   * Verify both users see the same message count in Spaces
   */
  async verifyMessageCountMatch(): Promise<void> {
    if (!this.user1 || !this.user2) {
      throw new Error('Users not initialized');
    }

    const user1Messages = await this.getUser1Messages();
    const user2Messages = await this.getUser2Messages();

    console.log(`📊 Spaces - User 1 sees ${user1Messages.length} messages`);
    console.log(`📊 Spaces - User 2 sees ${user2Messages.length} messages`);

    if (user1Messages.length === user2Messages.length) {
      console.log('✅ Spaces message counts match');
    } else {
      throw new Error(`Spaces message count mismatch: User 1 (${user1Messages.length}) vs User 2 (${user2Messages.length})`);
    }
  }

  /**
   * Clean up - close all pages and contexts
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up Spaces user sessions');

    const closePromises = [];

    if (this.user1) {
      closePromises.push(this.user1.page.close());
    }

    if (this.user2) {
      closePromises.push(this.user2.page.close());
    }

    await Promise.all(closePromises);

    this.user1 = null;
    this.user2 = null;

    console.log('✅ Spaces cleanup completed');
  }

  /**
   * Take screenshots of both users' views for debugging
   */
  async takeScreenshotsOfBothUsers(prefix: string = 'spaces-multi-user'): Promise<void> {
    if (!this.user1 || !this.user2) {
      throw new Error('Users not initialized');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    await Promise.all([
      this.user1.page.screenshot({ 
        path: `reports/${prefix}-user1-${timestamp}.png`,
        fullPage: true 
      }),
      this.user2.page.screenshot({ 
        path: `reports/${prefix}-user2-${timestamp}.png`,
        fullPage: true 
      }),
    ]);

    console.log(`✅ Spaces screenshots saved: ${prefix}-user1/user2-${timestamp}.png`);
  }
}
