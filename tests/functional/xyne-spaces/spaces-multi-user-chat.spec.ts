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
  continueOnFailure: true,
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
          'User 1',
          'User 2'
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
        await spacesMultiUserChat.loginBothUsers(true);
        console.log(' Both users logged in successfully to Spaces');
      });
    }
  },

  {
    name: 'save both users names from welcome header',
    dependencies: ['login both users to Spaces'],
    metadata: { priority: 'high', tags: ['@spaces', '@user-info'] },
    testFunction: async () => {
      await step('Extract and save User 1 name from welcome header', async () => {
        const userName1 = await spacesMultiUserChat.getUserNameFromHeader('user1');
        console.log(` User 1 name saved: ${userName1}`);
      });

      await step('Extract and save User 2 name from welcome header', async () => {
        const userName2 = await spacesMultiUserChat.getUserNameFromHeader('user2');
        console.log(` User 2 name saved: ${userName2}`);
      });
    }
  },

  {
    name: 'click chat icon for both users',
    dependencies: ['save both users names from welcome header'],
    metadata: { priority: 'high', tags: ['@spaces', '@navigation'] },
    testFunction: async () => {
      await step('User 1 clicks on chat icon in sidebar', async () => {
        await spacesMultiUserChat.clickChatIconForUser('user1');
        console.log(' User 1 clicked chat icon');
      });

      await step('User 2 clicks on chat icon in sidebar', async () => {
        await spacesMultiUserChat.clickChatIconForUser('user2');
        console.log(' User 2 clicked chat icon');
      });
    }
  },

  {
    name: 'click plus icon and verify Start DM modal appears',
    dependencies: ['click chat icon for both users'],
    metadata: { priority: 'high', tags: ['@spaces', '@modal', '@dm'] },
    testFunction: async () => {
      await step('User 1 clicks on + icon to open Start DM modal', async () => {
        await spacesMultiUserChat.clickPlusIconForUser('user1');
        console.log(' User 1 clicked + icon');
      });

      await step('Verify Start DM modal is visible for User 1', async () => {
        await spacesMultiUserChat.verifyStartDMModalVisible('user1');
        console.log(' Start DM modal verified for User 1');
      });

      await step('User 2 clicks on + icon to open Start DM modal', async () => {
        await spacesMultiUserChat.clickPlusIconForUser('user2');
        console.log(' User 2 clicked + icon');
      });

      await step('Verify Start DM modal is visible for User 2', async () => {
        await spacesMultiUserChat.verifyStartDMModalVisible('user2');
        console.log(' Start DM modal verified for User 2');
      });
    }
  },

  {
    name: 'start DM with other user',
    dependencies: ['click plus icon and verify Start DM modal appears'],
    metadata: { priority: 'high', tags: ['@spaces', '@dm', '@chat'] },
    testFunction: async () => {
      await step('User 1 types User 2 name and clicks Start DM', async () => {
        const savedNames = spacesMultiUserChat.getSavedUserNames();
        if (!savedNames.user2Name) {
          throw new Error('User 2 name not saved');
        }
        await spacesMultiUserChat.startDMWithUser('user1', savedNames.user2Name);
        console.log(` User 1 started DM with ${savedNames.user2Name}`);
      });

      await step('User 2 types User 1 name and clicks Start DM', async () => {
        const savedNames = spacesMultiUserChat.getSavedUserNames();
        if (!savedNames.user1Name) {
          throw new Error('User 1 name not saved');
        }
        await spacesMultiUserChat.startDMWithUser('user2', savedNames.user1Name);
        console.log(` User 2 started DM with ${savedNames.user1Name}`);
      });
    }
  },

  {
    name: 'send plain text messages between users',
    dependencies: ['start DM with other user'],
    metadata: { priority: 'high', tags: ['@spaces', '@chat', '@messaging'] },
    testFunction: async () => {
      await step('User 1 sends a plain text message', async () => {
        await spacesMultiUserChat.sendPlainMessage('user1', 'Hello! This is a plain text message.');
        console.log(' User 1 sent plain text message');
      });

      await step('User 2 verifies receipt of plain text message', async () => {
        await spacesMultiUserChat.verifyUser2SeesMessage('Hello! This is a plain text message.');
        console.log(' User 2 verified plain text message');
      });

      await step('User 2 sends a reply', async () => {
        await spacesMultiUserChat.sendPlainMessage('user2', 'Hi! I received your message.');
        console.log(' User 2 sent reply');
      });

      await step('User 1 verifies receipt of reply', async () => {
        await spacesMultiUserChat.verifyUser1SeesMessage('Hi! I received your message.');
        console.log(' User 1 verified reply');
      });
    }
  },

  {
    name: 'test bold text formatting',
    dependencies: ['send plain text messages between users'],
    metadata: { priority: 'high', tags: ['@spaces', '@chat', '@formatting', '@bold'] },
    testFunction: async () => {
      await step('User 1 sends a bold message', async () => {
        await spacesMultiUserChat.sendBoldMessage('user1', 'This is bold text');
        console.log(' User 1 sent bold message');
      });

      await step('User 1 verifies bold formatting in their own view', async () => {
        await spacesMultiUserChat.verifyBoldMessage('user1', 'This is bold text');
        console.log(' User 1 verified bold formatting');
      });

      await step('User 2 verifies bold formatting', async () => {
        await spacesMultiUserChat.verifyBoldMessage('user2', 'This is bold text');
        console.log(' User 2 verified bold formatting');
      });
    }
  },

  {
    name: 'test italic text formatting',
    dependencies: ['test bold text formatting'],
    metadata: { priority: 'high', tags: ['@spaces', '@chat', '@formatting', '@italic'] },
    testFunction: async () => {
      await step('User 2 sends an italic message', async () => {
        await spacesMultiUserChat.sendItalicMessage('user2', 'This is italic text');
        console.log(' User 2 sent italic message');
      });

      await step('User 2 verifies italic formatting in their own view', async () => {
        await spacesMultiUserChat.verifyItalicMessage('user2', 'This is italic text');
        console.log(' User 2 verified italic formatting');
      });

      await step('User 1 verifies italic formatting', async () => {
        await spacesMultiUserChat.verifyItalicMessage('user1', 'This is italic text');
        console.log(' User 1 verified italic formatting');
      });
    }
  },

  {
    name: 'test numbered list formatting',
    dependencies: ['test italic text formatting'],
    metadata: { priority: 'high', tags: ['@spaces', '@chat', '@formatting', '@list'] },
    testFunction: async () => {
      await step('User 1 sends a numbered list', async () => {
        const listItems = [
          'First item in the list',
          'Second item in the list',
          'Third item in the list'
        ];
        await spacesMultiUserChat.sendNumberedListMessage('user1', listItems);
        console.log(' User 1 sent numbered list');
      });

      await step('User 1 verifies numbered list in their own view', async () => {
        const listItems = [
          'First item in the list',
          'Second item in the list',
          'Third item in the list'
        ];
        await spacesMultiUserChat.verifyNumberedList('user1', listItems);
        console.log(' User 1 verified numbered list');
      });

      await step('User 2 verifies numbered list', async () => {
        const listItems = [
          'First item in the list',
          'Second item in the list',
          'Third item in the list'
        ];
        await spacesMultiUserChat.verifyNumberedList('user2', listItems);
        console.log(' User 2 verified numbered list');
      });
    }
  },

  {
    name: 'test combined formatting messages',
    dependencies: ['test numbered list formatting'],
    metadata: { priority: 'medium', tags: ['@spaces', '@chat', '@formatting', '@comprehensive'] },
    testFunction: async () => {
      await step('User 2 sends another numbered list', async () => {
        const listItems = [
          'Task one: Complete testing',
          'Task two: Review results',
          'Task three: Submit report'
        ];
        await spacesMultiUserChat.sendNumberedListMessage('user2', listItems);
        console.log(' User 2 sent numbered list');
      });

      await step('User 1 verifies User 2 numbered list', async () => {
        const listItems = [
          'Task one: Complete testing',
          'Task two: Review results',
          'Task three: Submit report'
        ];
        await spacesMultiUserChat.verifyNumberedList('user1', listItems);
        console.log(' User 1 verified User 2 numbered list');
      });

      await step('User 1 sends a bold response', async () => {
        await spacesMultiUserChat.sendBoldMessage('user1', 'Acknowledged all tasks!');
        console.log(' User 1 sent bold response');
      });

      await step('User 2 verifies bold response', async () => {
        await spacesMultiUserChat.verifyBoldMessage('user2', 'Acknowledged all tasks!');
        console.log(' User 2 verified bold response');
      });
    }
  },

  {
    name: 'test emoji insertion in messages',
    dependencies: ['test combined formatting messages'],
    metadata: { priority: 'high', tags: ['@spaces', '@chat', '@emoji', '@formatting'] },
    testFunction: async () => {
      await step('User 1 sends a message with emoji', async () => {
        await spacesMultiUserChat.sendMessageWithEmoji('user1', 'Great work on those tasks ', '+1');
        console.log(' User 1 sent message with emoji');
      });

      await step('User 1 verifies emoji message in their view', async () => {
        await spacesMultiUserChat.verifyMessageWithEmoji('user1', 'Great work on those tasks');
        console.log(' User 1 verified emoji message');
      });

      await step('User 2 verifies emoji message', async () => {
        await spacesMultiUserChat.verifyMessageWithEmoji('user2', 'Great work on those tasks');
        console.log(' User 2 verified emoji message');
      });

      await step('User 2 sends a response with emoji', async () => {
        await spacesMultiUserChat.sendMessageWithEmoji('user2', 'Thank you ', 'grinning');
        console.log(' User 2 sent response with emoji');
      });

      await step('User 1 verifies User 2 emoji message', async () => {
        await spacesMultiUserChat.verifyMessageWithEmoji('user1', 'Thank you');
        console.log(' User 1 verified User 2 emoji message');
      });
    }
  },

  {
    name: 'test user mentions with @ symbol',
    dependencies: ['test combined formatting messages'],
    metadata: { priority: 'high', tags: ['@spaces', '@chat', '@mention', '@tagging'] },
    testFunction: async () => {
      await step('User 1 sends a message mentioning User 2', async () => {
        const savedNames = spacesMultiUserChat.getSavedUserNames();
        if (!savedNames.user2Name) {
          throw new Error('User 2 name not saved');
        }
        await spacesMultiUserChat.sendMessageWithMention('user1', 'Hey ', savedNames.user2Name);
        console.log(` User 1 sent message mentioning ${savedNames.user2Name}`);
      });

      await step('User 1 verifies mention in their view', async () => {
        const savedNames = spacesMultiUserChat.getSavedUserNames();
        if (!savedNames.user2Name) {
          throw new Error('User 2 name not saved');
        }
        await spacesMultiUserChat.verifyMention('user1', savedNames.user2Name);
        console.log(' User 1 verified mention');
      });

      await step('User 2 verifies they were mentioned', async () => {
        const savedNames = spacesMultiUserChat.getSavedUserNames();
        if (!savedNames.user2Name) {
          throw new Error('User 2 name not saved');
        }
        await spacesMultiUserChat.verifyMention('user2', savedNames.user2Name);
        console.log(' User 2 verified they were mentioned');
      });

      await step('User 2 sends a message mentioning User 1', async () => {
        const savedNames = spacesMultiUserChat.getSavedUserNames();
        if (!savedNames.user1Name) {
          throw new Error('User 1 name not saved');
        }
        await spacesMultiUserChat.sendMessageWithMention('user2', 'Thanks for the mention ', savedNames.user1Name);
        console.log(` User 2 sent message mentioning ${savedNames.user1Name}`);
      });

      await step('User 1 verifies they were mentioned by User 2', async () => {
        const savedNames = spacesMultiUserChat.getSavedUserNames();
        if (!savedNames.user1Name) {
          throw new Error('User 1 name not saved');
        }
        await spacesMultiUserChat.verifyMention('user1', savedNames.user1Name);
        console.log(' User 1 verified they were mentioned');
      });
    }
  },

  {
    name: 'test inline code formatting',
    dependencies: ['test user mentions with @ symbol'],
    metadata: { priority: 'high', tags: ['@spaces', '@chat', '@code', '@formatting'] },
    testFunction: async () => {
      await step('User 1 sends a message with inline code', async () => {
        await spacesMultiUserChat.sendInlineCodeMessage('user1', 'You can use the function ', 'getUserData()');
        console.log(' User 1 sent message with inline code');
      });

      await step('User 1 verifies inline code in their view', async () => {
        await spacesMultiUserChat.verifyInlineCode('user1', 'getUserData()');
        console.log(' User 1 verified inline code');
      });

      await step('User 2 verifies inline code', async () => {
        await spacesMultiUserChat.verifyInlineCode('user2', 'getUserData()');
        console.log(' User 2 verified inline code');
      });
    }
  },

  {
    name: 'test code block formatting',
    dependencies: ['test inline code formatting'],
    metadata: { priority: 'high', tags: ['@spaces', '@chat', '@code', '@formatting'] },
    testFunction: async () => {
      await step('User 2 sends a code block', async () => {
        const code = 'function greet() {\n  console.log("Hello World");\n  return true;\n}';
        await spacesMultiUserChat.sendCodeBlockMessage('user2', code);
        console.log(' User 2 sent code block');
      });

      await step('User 2 verifies code block in their view', async () => {
        await spacesMultiUserChat.verifyCodeBlock('user2', 'function greet()');
        console.log(' User 2 verified code block');
      });

      await step('User 1 verifies code block from User 2', async () => {
        await spacesMultiUserChat.verifyCodeBlock('user1', 'function greet()');
        console.log(' User 1 verified code block');
      });

      await step('User 1 sends a code block response', async () => {
        const code = 'const result = greet();\nconsole.log(result);';
        await spacesMultiUserChat.sendCodeBlockMessage('user1', code);
        console.log(' User 1 sent code block response');
      });

      await step('User 2 verifies User 1 code block', async () => {
        await spacesMultiUserChat.verifyCodeBlock('user2', 'const result');
        console.log(' User 2 verified User 1 code block');
      });
    }
  },

  {
    name: 'test comprehensive formatting combination',
    dependencies: ['test code block formatting'],
    metadata: { priority: 'medium', tags: ['@spaces', '@chat', '@formatting', '@comprehensive'] },
    testFunction: async () => {
      await step('User 1 sends message with emoji and mention', async () => {
        const savedNames = spacesMultiUserChat.getSavedUserNames();
        if (!savedNames.user2Name) {
          throw new Error('User 2 name not saved');
        }
        
        // Send a plain message first, then verify
        await spacesMultiUserChat.typeInChatInput('user1', 'Looking good ');
        await spacesMultiUserChat.clickMentionButton('user1');
        await spacesMultiUserChat.selectUserToMention('user1', savedNames.user2Name);
        await spacesMultiUserChat.clickSendButton('user1');
        
        console.log(' User 1 sent comprehensive message');
      });

      await step('User 2 verifies comprehensive message', async () => {
        await spacesMultiUserChat.verifyMessageWithEmoji('user2', 'Looking good');
        console.log(' User 2 verified comprehensive message');
      });

      await step('User 2 sends bold message with inline code', async () => {
        await spacesMultiUserChat.clickBoldButton('user2');
        await spacesMultiUserChat.typeInChatInput('user2', 'Use this: ');
        await spacesMultiUserChat.clickInlineCodeButton('user2');
        
        const currentUser = spacesMultiUserChat['user2'];
        if (currentUser) {
          const chatInput = currentUser.page.locator('div.tiptap.ProseMirror.chat-input-editor[contenteditable="true"]');
          await chatInput.pressSequentially('npm install');
        }
        
        await spacesMultiUserChat.clickSendButton('user2');
        console.log(' User 2 sent bold message with inline code');
      });

      await step('User 1 verifies bold and inline code combination', async () => {
        await spacesMultiUserChat.verifyInlineCode('user1', 'npm install');
        console.log(' User 1 verified bold and inline code combination');
      });
    }
  }
]);
