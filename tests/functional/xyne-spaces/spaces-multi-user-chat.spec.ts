/**
 * Spaces Multi-User Chat Test - Using Test Orchestrator
 */

import { TestOrchestrator } from '@/framework/utils/test-orchestrator';
import { step } from '@/framework/utils/step-tracker';
import { SpacesLoginHelper } from '@/framework/pages/xyne-spaces/spaces-login-helper';
import { SpacesMultiUserChatPage } from '@/framework/pages/xyne-spaces';
import { chromium, Browser, BrowserContext } from '@playwright/test';

/**
 * Multi-user test - reuses orchestrator's browser for User 1, creates 1 new context for User 2
 * Result: Only 2 browser windows total (orchestrator's context + 1 new context)
 */
const orchestrator = new TestOrchestrator({
  useSharedPage: true, // Use orchestrator's browser
  continueOnFailure: false,
  sequential: true,
  logLevel: 'detailed'
});

// Shared state for multi-user testing  
let browser: Browser;
let context1: BrowserContext; // From orchestrator
let context2: BrowserContext; // New context for second user
let spacesMultiUserChat: SpacesMultiUserChatPage;

orchestrator.createSuite('Spaces - Multi-User Chat Tests', [
  {
    name: 'initialize browser and contexts for two users',
    metadata: { priority: 'highest', tags: ['@critical', '@spaces', '@setup'] },
    testFunction: async ({ sharedPage }) => {
      await step('Get browser and context from orchestrator for User 1', async () => {
        const existingBrowser = sharedPage.page.context().browser();
        if (!existingBrowser) {
          throw new Error('Failed to get browser from orchestrator');
        }
        browser = existingBrowser;
        context1 = sharedPage.page.context(); // Reuse orchestrator's context for User 1
        console.log(' Using orchestrator browser and context for User 1');
      });

      await step('Create 1 additional context for User 2', async () => {
        context2 = await browser.newContext();
        console.log(' Created 1 new context for User 2');
        console.log(' Total: 2 browser windows from 1 browser');
      });

      await step('Initialize SpacesMultiUserChatPage', async () => {
        spacesMultiUserChat = new SpacesMultiUserChatPage();
        console.log(' SpacesMultiUserChatPage initialized');
      });

      await step('Initialize both users', async () => {
        await spacesMultiUserChat.initializeUsers(
          context1,
          context2,
          'Mahek Agarwal',  // User 1
          'Dashboard QA'    // User 2
        );
        console.log(' Both users initialized');
      });
    }
  },

  {
    name: 'login both users to Spaces',
    dependencies: ['initialize browser and contexts for two users'],
    metadata: { priority: 'highest', tags: ['@critical', '@spaces', '@auth'] },
    testFunction: async () => {
      await step('Login both users with different credentials', async () => {
        await spacesMultiUserChat.loginBothUsersSequentially(5000, true);
        console.log(' Both users logged in successfully to Spaces');
      });
    }
  }
]);
