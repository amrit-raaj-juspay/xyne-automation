/**
 * History Module Test - Using Test Orchestrator with Page Object Model
 */

import { TestOrchestrator } from '@/framework/utils/test-orchestrator';
import { step } from '@/framework/utils/step-tracker';
import { LoginHelper } from '@/framework/pages/xyne/login-helper';
import { HistoryModulePage } from '@/framework/pages/xyne/history-module-page';

const orchestrator = new TestOrchestrator({
  useSharedPage: true,
  continueOnFailure: true,
  sequential: true,
  logLevel: 'detailed'
});

orchestrator.createSuite('History Module Tests', [
  {
    name: 'user login',
    metadata: { priority: 'highest', tags: ['@critical', '@auth', '@history'] },
    testFunction: async ({ sharedPage }) => {
      const { page } = sharedPage;

      await step('Initialize history page object', async () => {
        console.log('Starting login test');
      });

      // Check if already logged in to avoid unnecessary login attempts
      const alreadyLoggedIn = await step('Check if already logged in', async () => {
        return await LoginHelper.isLoggedIn(page);
      });

      if (alreadyLoggedIn) {
        await step('Skip login - already authenticated', async () => {
          console.log('Already logged in, skipping login process');
        });
        return;
      }

      // Perform login using LoginHelper
      const loginSuccess = await step('Perform user login', async () => {
        return await LoginHelper.performLogin(page);
      });

      if (!loginSuccess) {
        throw new Error('Login should be successful');
      }

      await step('Log completion status', async () => {
        console.log('Login completed successfully');
        console.log('Current URL after login:', page.url());
      });
    }
  },

  {
    name: 'navigate to history page via sidebar icon',
    dependencies: ['user login'],
    metadata: { priority: 'high', tags: ['@navigation', '@sidebar', '@history'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting navigation to history page', async () => {
        console.log('Starting navigation to history page test');
      });

      await step('Navigate to history page', async () => {
        await historyPage.navigateToHistoryPage();
      });

      await step('Get current URL', async () => {
        await historyPage.getCurrentUrl();
      });

      await step('Log completion', async () => {
        console.log('Navigation to history page completed successfully');
      });
    }
  },

  {
    name: 'verify chat history page elements',
    dependencies: ['navigate to history page via sidebar icon'],
    metadata: { priority: 'high', tags: ['@ui', '@verification', '@history'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting chat history page elements verification', async () => {
        console.log('Starting chat history page elements verification test');
      });

      await step('Wait for page to load', async () => {
        await historyPage.waitForPageLoad();
      });

      await step('Verify page elements', async () => {
        await historyPage.verifyPageElements();
      });

      await step('Log completion', async () => {
        console.log('Chat history page elements verification completed');
      });
    }
  },

  {
    name: 'verify favourite chats section',
    dependencies: ['verify chat history page elements'],
    metadata: { priority: 'high', tags: ['@ui', '@favourites', '@history'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting favourite chats section verification', async () => {
        console.log('Starting favourite chats section verification test');
      });

      await step('Verify favourite chats section', async () => {
        await historyPage.verifyFavouriteChatsSection();
      });

      await step('Log completion', async () => {
        console.log('Favourite chats section verification completed');
      });
    }
  },

  {
    name: 'verify all chats section',
    dependencies: ['verify favourite chats section'],
    metadata: { priority: 'high', tags: ['@ui', '@chats', '@history'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting all chats section verification', async () => {
        console.log('Starting all chats section verification test');
      });

      await step('Verify all chats section', async () => {
        await historyPage.verifyAllChatsSection();
      });

      const chatCount = await step('Get chat entries count', async () => {
        return await historyPage.getChatEntriesCount();
      });

      await step('Log completion', async () => {
        console.log(`Total chat entries found: ${chatCount}`);
        console.log('All chats section verification completed');
      });
    }
  },

  {
    name: 'verify history sidebar navigation is highlighted',
    dependencies: ['verify all chats section'],
    metadata: { priority: 'high', tags: ['@ui', '@sidebar', '@navigation'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting history sidebar highlight verification', async () => {
        console.log('Starting history sidebar highlight verification test');
      });

      await step('Verify history icon highlighted', async () => {
        await historyPage.verifyHistoryIconHighlighted();
      });

      await step('Log completion', async () => {
        console.log('History sidebar highlight verification completed');
      });
    }
  },

  {
    name: 'verify hover effect on first chat entry',
    dependencies: ['verify history sidebar navigation is highlighted'],
    metadata: { priority: 'high', tags: ['@ui', '@hover', '@interaction'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting hover effect verification', async () => {
        console.log('Starting hover effect verification test');
      });

      const firstChatText = await step('Get first chat entry text', async () => {
        return await historyPage.getChatEntryText(0);
      });

      await step('Log first chat text', async () => {
        console.log(`First chat entry text: "${firstChatText}"`);
      });

      await step('Hover over first chat entry', async () => {
        await historyPage.hoverOverFirstChatEntry();
      });

      await step('Verify ellipsis menu visible on hover', async () => {
        await historyPage.verifyEllipsisMenuVisibleOnHover();
      });

      await step('Log completion', async () => {
        console.log('Hover effect verification completed');
      });
    }
  },

  {
    name: 'click ellipsis menu on first chat entry',
    dependencies: ['verify hover effect on first chat entry'],
    metadata: { priority: 'high', tags: ['@ui', '@click', '@menu'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting ellipsis menu click', async () => {
        console.log('Starting ellipsis menu click test');
      });

      await step('Hover over first chat entry', async () => {
        await historyPage.hoverOverFirstChatEntry();
      });

      await step('Click ellipsis menu on first chat entry', async () => {
        await historyPage.clickEllipsisMenuOnFirstChatEntry();
      });

      await step('Log completion', async () => {
        console.log('Ellipsis menu click test completed');
      });
    }
  },

  {
    name: 'click favourite button in context menu',
    dependencies: ['click ellipsis menu on first chat entry'],
    metadata: { priority: 'high', tags: ['@ui', '@favourite', '@interaction'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting favourite button click', async () => {
        console.log('Starting favourite button click test');
      });

      await step('Verify favourite button visible', async () => {
        await historyPage.verifyFavouriteButtonVisible();
      });

      await step('Click favourite button', async () => {
        await historyPage.clickFavouriteButton();
      });

      await step('Log completion', async () => {
        console.log('Favourite button click test completed');
      });
    }
  },

  {
    name: 'verify favourite chat appears and click its ellipsis menu',
    dependencies: ['click favourite button in context menu'],
    metadata: { priority: 'high', tags: ['@ui', '@favourite', '@ellipsis'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting favourite chat ellipsis menu test', async () => {
        console.log('Starting favourite chat ellipsis menu test');
      });

      await step('Verify favourite chat exists', async () => {
        await historyPage.verifyFavouriteChatExists();
      });

      await step('Hover over first favourite chat entry', async () => {
        await historyPage.hoverOverFirstFavouriteChatEntry();
      });

      await step('Click ellipsis menu on first favourite chat entry', async () => {
        await historyPage.clickEllipsisMenuOnFirstFavouriteChatEntry();
      });

      await step('Log completion', async () => {
        console.log('Favourite chat ellipsis menu test completed');
      });
    }
  },

  {
    name: 'click remove button to unfavourite chat',
    dependencies: ['verify favourite chat appears and click its ellipsis menu'],
    metadata: { priority: 'high', tags: ['@ui', '@remove', '@unfavourite'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting remove button click', async () => {
        console.log('Starting remove button click test');
      });

      await step('Verify remove button visible', async () => {
        await historyPage.verifyRemoveButtonVisible();
      });

      await step('Click remove button', async () => {
        await historyPage.clickRemoveButton();
      });

      await step('Verify favourite chat removed', async () => {
        await historyPage.verifyFavouriteChatRemoved();
      });

      await step('Log completion', async () => {
        console.log('Remove button click test completed');
      });
    }
  },

  {
    name: 'click ellipsis menu on first chat entry again',
    dependencies: ['click remove button to unfavourite chat'],
    metadata: { priority: 'high', tags: ['@ui', '@click', '@repeat'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting repeat ellipsis menu click', async () => {
        console.log('Starting repeat ellipsis menu click test');
      });

      await step('Hover over first chat entry', async () => {
        await historyPage.hoverOverFirstChatEntry();
      });

      await step('Click ellipsis menu on first chat entry', async () => {
        await historyPage.clickEllipsisMenuOnFirstChatEntry();
      });

      await step('Log completion', async () => {
        console.log('Repeat ellipsis menu click test completed');
      });
    }
  },

  {
    name: 'click rename button in context menu',
    dependencies: ['click ellipsis menu on first chat entry again'],
    metadata: { priority: 'high', tags: ['@ui', '@rename', '@interaction'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting rename button click', async () => {
        console.log('Starting rename button click test');
      });

      await step('Verify rename button visible', async () => {
        await historyPage.verifyRenameButtonVisible();
      });

      await step('Click rename button', async () => {
        await historyPage.clickRenameButton();
      });

      await step('Log completion', async () => {
        console.log('Rename button click test completed');
      });
    }
  },

  {
    name: 'update chat title and confirm with Enter',
    dependencies: ['click rename button in context menu'],
    metadata: { priority: 'high', tags: ['@ui', '@rename', '@title-update'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting chat title update', async () => {
        console.log('Starting chat title update test');
      });

      await step('Verify rename input visible', async () => {
        await historyPage.verifyRenameInputVisible();
      });

      await step('Update chat title', async () => {
        const newTitle = 'Updated Chat Title - Test Automation';
        await historyPage.updateChatTitle(newTitle);
      });

      await step('Log completion', async () => {
        console.log('Chat title update test completed');
      });
    }
  },

  {
    name: 'click ellipsis menu on first chat entry after rename',
    dependencies: ['update chat title and confirm with Enter'],
    metadata: { priority: 'high', tags: ['@ui', '@click', '@post-rename'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting post-rename ellipsis menu click', async () => {
        console.log('Starting post-rename ellipsis menu click test');
      });

      await step('Navigate back to history page', async () => {
        await historyPage.navigateToHistoryPage();
      });

      await step('Hover over first chat entry', async () => {
        await historyPage.hoverOverFirstChatEntry();
      });

      await step('Click ellipsis menu on first chat entry', async () => {
        await historyPage.clickEllipsisMenuOnFirstChatEntry();
      });

      await step('Log completion', async () => {
        console.log('Post-rename ellipsis menu click test completed');
      });
    }
  },

  {
    name: 'click delete button to delete chat',
    dependencies: ['click ellipsis menu on first chat entry after rename'],
    metadata: { priority: 'high', tags: ['@ui', '@delete', '@destructive'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting delete button click', async () => {
        console.log('Starting delete button click test');
      });

      await step('Verify delete button visible', async () => {
        await historyPage.verifyDeleteButtonVisible();
      });

      await step('Click delete button', async () => {
        await historyPage.clickDeleteButton();
      });

      await step('Verify chat deleted', async () => {
        await historyPage.verifyChatDeleted();
      });

      await step('Log completion', async () => {
        console.log('Delete button click test completed');
      });
    }
  },

  {
    name: 'verify cross button is visible',
    dependencies: ['click delete button to delete chat'],
    metadata: { priority: 'high', tags: ['@ui', '@cross-button', '@verification'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting cross button visibility verification', async () => {
        console.log('Starting cross button visibility verification test');
      });

      await step('Navigate to history page', async () => {
        await historyPage.navigateToHistoryPage();
      });

      await step('Verify cross button visible', async () => {
        await historyPage.verifyCrossButtonVisible();
      });

      await step('Log completion', async () => {
        console.log('Cross button visibility verification completed');
      });
    }
  },

  {
    name: 'click cross button',
    dependencies: ['verify cross button is visible'],
    metadata: { priority: 'high', tags: ['@ui', '@cross-button', '@click'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting cross button click', async () => {
        console.log('Starting cross button click test');
      });

      await step('Click cross button', async () => {
        await historyPage.clickCrossButton();
      });

      await step('Log completion', async () => {
        console.log('Cross button click test completed');
      });
    }
  },

  {
    name: 'exit history and start new chat',
    dependencies: ['click cross button'],
    metadata: { priority: 'high', tags: ['@ui', '@workflow', '@chat-input'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting exit history and start new chat workflow', async () => {
        console.log('Starting exit history and start new chat workflow test');
      });

      await step('Exit history and start new chat', async () => {
        await historyPage.exitHistoryAndStartNewChat('hello this is for test');
      });

      await step('Log completion', async () => {
        console.log('Exit history and start new chat workflow test completed');
      });
    }
  },

  {
    name: 'navigate to history page via sidebar icon again',
    dependencies: ['exit history and start new chat'],
    metadata: { priority: 'high', tags: ['@navigation', '@sidebar', '@history'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting navigation to history page again', async () => {
        console.log('Starting navigation to history page test again');
      });

      await step('Navigate to history page', async () => {
        await historyPage.navigateToHistoryPage();
      });

      await step('Get current URL', async () => {
        await historyPage.getCurrentUrl();
      });

      await step('Log completion', async () => {
        console.log('Navigation to history page completed successfully again');
      });
    }
  },

  {
    name: 'click second chat from all chats section',
    dependencies: ['navigate to history page via sidebar icon again'],
    metadata: { priority: 'high', tags: ['@ui', '@chat-navigation', '@click'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting second chat click', async () => {
        console.log('Starting second chat click test');
      });

      const chatTitle = await step('Click second chat', async () => {
        return await historyPage.clickSecondChat('all');
      });

      await step('Verify chat navigation', async () => {
        await historyPage.verifyChatNavigation(chatTitle);
      });

      await step('Log completion', async () => {
        console.log(`Second chat click test completed - clicked on: "${chatTitle}"`);
      });
    }
  },

  {
    name: 'click third chat from all chats section',
    dependencies: ['click second chat from all chats section'],
    metadata: { priority: 'high', tags: ['@ui', '@chat-navigation', '@click'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting third chat click', async () => {
        console.log('Starting third chat click test');
      });

      const chatTitle = await step('Click third chat', async () => {
        return await historyPage.clickThirdChat('all');
      });

      await step('Verify chat navigation', async () => {
        await historyPage.verifyChatNavigation(chatTitle);
      });

      await step('Log completion', async () => {
        console.log(`Third chat click test completed - clicked on: "${chatTitle}"`);
      });
    }
  },

  {
    name: 'type follow-up question after third chat click',
    dependencies: ['click third chat from all chats section'],
    metadata: { priority: 'high', tags: ['@ui', '@chat-input', '@followup'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting follow-up question test', async () => {
        console.log('Starting follow-up question test after third chat click');
      });

      await step('Click chat input area', async () => {
        await historyPage.clickChatInputArea();
      });

      const followupMessage = 'hello testing for followup';

      await step('Type chat message', async () => {
        await historyPage.typeChatMessage(followupMessage);
      });

      await step('Send chat message', async () => {
        await historyPage.sendChatMessage();
      });

      await step('Wait for AI response and title', async () => {
        await historyPage.waitForAIResponseAndTitle();
      });

      await step('Log completion', async () => {
        console.log(`Follow-up question test completed - sent: "${followupMessage}"`);
      });
    }
  },

  {
    name: 'scroll down and up in history page',
    dependencies: ['type follow-up question after third chat click'],
    metadata: { priority: 'high', tags: ['@ui', '@scrolling', '@history'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting scrolling test', async () => {
        console.log('Starting scrolling test in history page');
      });

      await step('Scroll down in history', async () => {
        await historyPage.scrollDownInHistory();
      });

      await step('Scroll up in history', async () => {
        await historyPage.scrollUpInHistory();
      });

      await step('Log completion', async () => {
        console.log('Scrolling test completed in history page');
      });
    }
  },

  {
    name: 'refresh page after scrolling',
    dependencies: ['scroll down and up in history page'],
    metadata: { priority: 'high', tags: ['@ui', '@refresh', '@history'] },
    testFunction: async ({ sharedPage }) => {
      const historyPage = new HistoryModulePage(sharedPage.page);

      await step('Starting page refresh test', async () => {
        console.log('Starting page refresh test after scrolling');
      });

      await step('Refresh page', async () => {
        await historyPage.refreshPage();
      });

      await step('Navigate to history page after refresh', async () => {
        await historyPage.navigateToHistoryPage();
      });

      await step('Verify page elements after refresh', async () => {
        await historyPage.verifyPageElements();
      });

      await step('Log completion', async () => {
        console.log('Page refresh test completed with history navigation');
      });
    }
  }
]);
