import { test, testHighest, testHigh, expect } from '@/framework/core/test-fixtures';
import { LoginHelper } from '@/framework/pages/login-helper';
import { HistoryModulePage } from '@/framework/pages/history-module-page';

// Configure tests to run sequentially and share browser context
test.describe.configure({ mode: 'serial' });

test.describe('History Module Tests', () => {
  let sharedPage: any;
  let historyPage: HistoryModulePage;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    sharedPage = await context.newPage();
    historyPage = new HistoryModulePage(sharedPage);
  });

  testHighest('user login', {
    tags: ['@critical', '@auth', '@history'],
    description: 'Authenticate user for history module access'
  }, async () => {
    console.log('Starting login test');
    
    // Check if already logged in to avoid unnecessary login attempts
    const alreadyLoggedIn = await LoginHelper.isLoggedIn(sharedPage);
    if (alreadyLoggedIn) {
      console.log('Already logged in, skipping login process');
      return;
    }
    
    // Perform login using LoginHelper
    const loginSuccess = await LoginHelper.performLogin(sharedPage);
    expect(loginSuccess, 'Login should be successful').toBe(true);
    
    console.log('Login completed successfully');
    console.log('Current URL after login:', sharedPage.url());
  });

  testHigh('navigate to history page via sidebar icon', {
    tags: ['@navigation', '@sidebar', '@history'],
    description: 'Navigate to chat history page using sidebar history icon'
  }, async () => {
    console.log('Starting navigation to history page test');
    
    // Use page object method to navigate to history page
    await historyPage.navigateToHistoryPage();
    
    // Get current URL for logging
    await historyPage.getCurrentUrl();
    
    console.log('Navigation to history page completed successfully');
  });

  testHigh('verify chat history page elements', {
    tags: ['@ui', '@verification', '@history'],
    description: 'Verify all main elements are present on chat history page'
  }, async () => {
    console.log('Starting chat history page elements verification test');
    
    // Wait for page to load
    await historyPage.waitForPageLoad();
    
    // Verify all main page elements
    await historyPage.verifyPageElements();
    
    console.log('Chat history page elements verification completed');
  });

  testHigh('verify favourite chats section', {
    tags: ['@ui', '@favourites', '@history'],
    description: 'Verify favourite chats section functionality and display'
  }, async () => {
    console.log('Starting favourite chats section verification test');
    
    // Verify favourite chats section specifically
    await historyPage.verifyFavouriteChatsSection();
    
    console.log('Favourite chats section verification completed');
  });

  testHigh('verify all chats section', {
    tags: ['@ui', '@chats', '@history'],
    description: 'Verify all chats section and count chat entries'
  }, async () => {
    console.log('Starting all chats section verification test');
    
    // Verify all chats section and count entries
    await historyPage.verifyAllChatsSection();
    
    // Get chat entries count for additional verification
    const chatCount = await historyPage.getChatEntriesCount();
    console.log(`Total chat entries found: ${chatCount}`);
    
    console.log('All chats section verification completed');
  });

  testHigh('verify history sidebar navigation is highlighted', {
    tags: ['@ui', '@sidebar', '@navigation'],
    description: 'Verify history icon is highlighted when on history page'
  }, async () => {
    console.log('Starting history sidebar highlight verification test');
    
    // Use page object method to verify icon highlighting
    await historyPage.verifyHistoryIconHighlighted();
    
    console.log('History sidebar highlight verification completed');
  });

  testHigh('verify hover effect on first chat entry', {
    tags: ['@ui', '@hover', '@interaction'],
    description: 'Verify ellipsis menu becomes visible when hovering over first chat entry'
  }, async () => {
    console.log('Starting hover effect verification test');
    
    // Get the text of the first chat entry for logging
    const firstChatText = await historyPage.getChatEntryText(0);
    console.log(`First chat entry text: "${firstChatText}"`);
    
    // Hover over the first chat entry
    await historyPage.hoverOverFirstChatEntry();
    
    // Verify ellipsis menu becomes visible on hover
    await historyPage.verifyEllipsisMenuVisibleOnHover();
    
    console.log('Hover effect verification completed');
  });

  testHigh('click ellipsis menu on first chat entry', {
    tags: ['@ui', '@click', '@menu'],
    description: 'Click on the ellipsis menu of the first chat entry to open context menu'
  }, async () => {
    console.log('Starting ellipsis menu click test');
    
    // Hover over the first chat entry to make ellipsis visible
    await historyPage.hoverOverFirstChatEntry();
    
    // Click on the ellipsis menu
    await historyPage.clickEllipsisMenuOnFirstChatEntry();
    
    console.log('Ellipsis menu click test completed');
  });

  testHigh('click favourite button in context menu', {
    tags: ['@ui', '@favourite', '@interaction'],
    description: 'Click on the Favourite button in the context menu to add chat to favourites'
  }, async () => {
    console.log('Starting favourite button click test');
    
    // Context menu should already be open from previous test
    // Verify Favourite button is visible in context menu
    await historyPage.verifyFavouriteButtonVisible();
    
    // Click on the Favourite button
    await historyPage.clickFavouriteButton();
    
    console.log('Favourite button click test completed');
  });

  testHigh('verify favourite chat appears and click its ellipsis menu', {
    tags: ['@ui', '@favourite', '@ellipsis'],
    description: 'Verify chat appears in Favourite Chats section and click its ellipsis menu'
  }, async () => {
    console.log('Starting favourite chat ellipsis menu test');
    
    // Verify favourite chat exists in Favourite Chats section
    await historyPage.verifyFavouriteChatExists();
    
    // Hover over the first favourite chat entry to make ellipsis visible
    await historyPage.hoverOverFirstFavouriteChatEntry();
    
    // Click on the ellipsis menu of the favourite chat entry
    await historyPage.clickEllipsisMenuOnFirstFavouriteChatEntry();
    
    console.log('Favourite chat ellipsis menu test completed');
  });

  testHigh('click remove button to unfavourite chat', {
    tags: ['@ui', '@remove', '@unfavourite'],
    description: 'Click Remove button in context menu to remove chat from favourites'
  }, async () => {
    console.log('Starting remove button click test');
    
    // Context menu should already be open from previous test
    // Verify Remove button is visible in context menu
    await historyPage.verifyRemoveButtonVisible();
    
    // Click on the Remove button
    await historyPage.clickRemoveButton();
    
    // Verify chat has been removed from favourites
    await historyPage.verifyFavouriteChatRemoved();
    
    console.log('Remove button click test completed');
  });

  testHigh('click ellipsis menu on first chat entry again', {
    tags: ['@ui', '@click', '@repeat'],
    description: 'Click ellipsis menu on first chat entry in All Chats section again after removal'
  }, async () => {
    console.log('Starting repeat ellipsis menu click test');
    
    // Hover over the first chat entry to make ellipsis visible
    await historyPage.hoverOverFirstChatEntry();
    
    // Click on the ellipsis menu again
    await historyPage.clickEllipsisMenuOnFirstChatEntry();
    
    console.log('Repeat ellipsis menu click test completed');
  });

  testHigh('click rename button in context menu', {
    tags: ['@ui', '@rename', '@interaction'],
    description: 'Click Rename button in context menu to rename the chat'
  }, async () => {
    console.log('Starting rename button click test');
    
    // Context menu should already be open from previous test
    // Verify Rename button is visible in context menu
    await historyPage.verifyRenameButtonVisible();
    
    // Click on the Rename button
    await historyPage.clickRenameButton();
    
    console.log('Rename button click test completed');
  });

  testHigh('update chat title and confirm with Enter', {
    tags: ['@ui', '@rename', '@title-update'],
    description: 'Update chat title in rename input field and confirm with Enter key'
  }, async () => {
    console.log('Starting chat title update test');
    
    // Verify rename input field is visible after clicking rename button
    await historyPage.verifyRenameInputVisible();
    
    // Update the chat title with a new name
    const newTitle = 'Updated Chat Title - Test Automation';
    await historyPage.updateChatTitle(newTitle);
    
    console.log('Chat title update test completed');
  });

  testHigh('click ellipsis menu on first chat entry after rename', {
    tags: ['@ui', '@click', '@post-rename'],
    description: 'Click ellipsis menu on first chat entry in All Chats section after rename operation'
  }, async () => {
    console.log('Starting post-rename ellipsis menu click test');
    
    // Hover over the first chat entry to make ellipsis visible
    await historyPage.hoverOverFirstChatEntry();
    
    // Click on the ellipsis menu again after rename
    await historyPage.clickEllipsisMenuOnFirstChatEntry();
    
    console.log('Post-rename ellipsis menu click test completed');
  });

  testHigh('click delete button to delete chat', {
    tags: ['@ui', '@delete', '@destructive'],
    description: 'Click Delete button in context menu to permanently delete the chat'
  }, async () => {
    console.log('Starting delete button click test');
    
    // Context menu should already be open from previous test
    // Verify Delete button is visible in context menu
    await historyPage.verifyDeleteButtonVisible();
    
    // Click on the Delete button
    await historyPage.clickDeleteButton();
    
    // Verify chat has been deleted
    await historyPage.verifyChatDeleted();
    
    console.log('Delete button click test completed');
  });

});
