/**
 * Chat Module Test - Using priority and dependency management with Page Object Model
 */

import { test, testHighest, testHigh, expect } from '@/framework/core/test-fixtures';
import { LoginHelper } from '@/framework/pages/login-helper';
import { ChatModulePage } from '@/framework/pages/chat-module-page';

// Configure tests to run sequentially and share browser context
test.describe.configure({ mode: 'serial' });

test.describe('Chat Module Tests', () => {
  
  testHighest('user login', {
    tags: ['@critical', '@auth', '@chat'],
    description: 'Authenticate user for chat module access'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting login test');
    const { page } = sharedPage;
    
    // Check if already logged in to avoid unnecessary login attempts
    const alreadyLoggedIn = await LoginHelper.isLoggedIn(page);
    if (alreadyLoggedIn) {
      console.log('✅ Already logged in, skipping login process');
      return;
    }
    
    // Perform login using LoginHelper
    const loginSuccess = await LoginHelper.performLogin(page);
    expect(loginSuccess, 'Login should be successful').toBe(true);
    
    console.log('✅ Login completed successfully');
    console.log('Current URL after login:', page.url());
  });

  testHigh('verify chat page elements', {
    dependsOn: ['user login'],
    tags: ['@core', '@chat', '@ui'],
    description: 'Verify all chat page UI elements are present and visible'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Use the page object method to verify chat page elements
    await chatPage.verifyChatPageElements();
  });

  testHigh('verify search functionality', {
    dependsOn: ['verify chat page elements'],
    tags: ['@core', '@chat', '@search'],
    description: 'Verify search functionality and interface elements'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Use the page object method to verify search functionality
    await chatPage.verifySearchFunctionality();
  });

  testHigh('verify able to send messages to chat', {
    dependsOn: ['verify search functionality'],
    tags: ['@core', '@chat', '@messaging'],
    description: 'Verify ability to send messages in chat interface'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Use the page object method to send a message to chat
    await chatPage.sendMessageToChat();
  });

  testHigh('verify chat header icons', {
    dependsOn: ['verify able to send messages to chat'],
    tags: ['@core', '@chat', '@ui', '@header'],
    description: 'Verify all chat header icons are present and functional'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Use the page object method to verify chat header icons
    await chatPage.verifyChatHeaderIcons();
  });

  testHigh('verify if reply comes and feedback buttons are there', {
    dependsOn: ['verify chat header icons'],
    tags: ['@core', '@chat', '@feedback', '@ai-response'],
    description: 'Verify AI reply appears with proper feedback buttons'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Use the page object method to verify AI reply and feedback buttons
    await chatPage.verifyAIReplyAndFeedbackButtons();
  });

  testHigh('verify pencil icon functionality - edit chat title', {
    dependsOn: ['verify if reply comes and feedback buttons are there'],
    tags: ['@core', '@chat', '@edit', '@title'],
    description: 'Verify pencil icon functionality for editing chat title'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Use the page object method to edit chat title
    await chatPage.editChatTitle();
  });
});
