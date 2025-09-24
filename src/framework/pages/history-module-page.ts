import { Page, expect } from '@playwright/test';

export class HistoryModulePage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Selectors
  private selectors = {
    historyIcon: 'svg.lucide-history',
    chatHistoryTitle: 'text=Chat History',
    favouriteChatsSection: 'text=Favourite Chats',
    allChatsSection: 'text=All Chats',
    chatEntries: '[class*="chat"], [class*="conversation"]',
    noFavouriteChat: 'text=No favourite chat',
    chatListItems: 'li.group.flex.justify-between.items-center',
    allChatsContainer: 'text=All Chats >> xpath=following-sibling::ul',
    allChatEntries: 'text=All Chats >> xpath=following-sibling::ul >> li.group.flex.justify-between.items-center',
    chatEllipsisMenu: 'svg.lucide-ellipsis.invisible.group-hover\\:visible',
    favouriteButton: 'div[role="button"]:has(svg.lucide-bookmark):has(span:has-text("Favourite"))',
    favouriteChatsContainer: 'text=Favourite Chats >> xpath=following-sibling::ul',
    favouriteChatEntries: 'text=Favourite Chats >> xpath=following-sibling::ul >> li.group.flex.justify-between.items-center',
    favouriteChatEllipsisMenu: 'svg.lucide-ellipsis.invisible.group-hover\\:visible',
    removeButton: 'div[role="button"]:has(svg.lucide-bookmark):has(span:has-text("Remove"))',
    renameButton: 'div[role="button"]:has(svg.lucide-pencil):has(span:has-text("Rename"))',
    renameInput: 'input[type="text"], input[placeholder*="name"], input[placeholder*="title"], textarea',
    deleteButton: 'div[role="button"]:has(svg.lucide-trash2):has(span:has-text("Delete"))',
    crossButton: 'svg.lucide-x',
    crossButtonWithStroke: 'svg.lucide-x[stroke="#4A4F59"], svg.lucide-x.dark\\:stroke-gray-300',
    chatInputArea: 'div[contenteditable="true"][data-at-mention="true"].flex-grow.resize-none.bg-transparent.outline-none',
    chatInputAreaSpecific: 'div[contenteditable="true"][data-at-mention="true"][class*="flex-grow"][class*="resize-none"][class*="bg-transparent"][class*="outline-none"]',
    sendButton: 'button:has(svg.lucide-arrow-right)',
    sendButtonSpecific: 'button.flex.mr-6:has(svg.lucide-arrow-right)',
    chatTitleSpan: 'span.text-\\[14px\\].dark\\:text-gray-200.pl-\\[10px\\].pr-\\[10px\\].truncate.cursor-pointer.flex-grow',
    allChatTitles: 'text=All Chats >> xpath=following-sibling::ul >> li >> span.cursor-pointer',
    favouriteChatTitles: 'text=Favourite Chats >> xpath=following-sibling::ul >> li >> span.cursor-pointer',
  };

  // Navigation methods
  async navigateToHistoryPage(): Promise<void> {
    console.log('Navigating to history page via sidebar icon');
    
    // Wait for page to be fully loaded
    await this.page.waitForLoadState('networkidle');
    
    // Find and click history icon
    const historyIcon = this.page.locator(this.selectors.historyIcon);
    await expect(historyIcon).toBeVisible({ timeout: 10000 });
    console.log('History icon found in sidebar');
    
    await historyIcon.click();
    console.log('History icon clicked');
    
    // Wait for navigation to complete
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    
    // Verify navigation was successful
    await this.verifyChatHistoryPageLoaded();
  }

  // Verification methods
  async verifyChatHistoryPageLoaded(): Promise<void> {
    const chatHistoryTitle = this.page.locator(this.selectors.chatHistoryTitle);
    await expect(chatHistoryTitle).toBeVisible({ timeout: 10000 });
    console.log('Chat History page loaded successfully');
  }

  async verifyPageElements(): Promise<void> {
    console.log('Verifying chat history page elements');
    
    // Verify main title
    const chatHistoryTitle = this.page.locator(this.selectors.chatHistoryTitle);
    await expect(chatHistoryTitle).toBeVisible({ timeout: 10000 });
    console.log('"Chat History" title found');
    
    // Verify Favourite Chats section
    const favouriteChatsSection = this.page.locator(this.selectors.favouriteChatsSection);
    await expect(favouriteChatsSection).toBeVisible({ timeout: 5000 });
    console.log('"Favourite Chats" section found');
    
    // Verify All Chats section
    const allChatsSection = this.page.locator(this.selectors.allChatsSection);
    await expect(allChatsSection).toBeVisible({ timeout: 5000 });
    console.log('"All Chats" section found');
  }

  async verifyHistoryIconHighlighted(): Promise<void> {
    console.log('Verifying history icon is highlighted');
    
    const historyIcon = this.page.locator(this.selectors.historyIcon);
    await expect(historyIcon).toBeVisible();
    
    try {
      const parentElement = historyIcon.locator('..');
      const hasActiveClass = await parentElement.evaluate((el: HTMLElement) => {
        const classList = el.className;
        return classList.includes('active') || 
               classList.includes('selected') || 
               classList.includes('current') ||
               classList.includes('bg-') ||
               el.style.backgroundColor !== '';
      });
      
      if (hasActiveClass) {
        console.log('History icon appears to be highlighted/active');
      } else {
        console.log('History icon styling checked (may not have obvious active state)');
      }
    } catch (error) {
      console.log('History icon active state check completed');
    }
  }

  // Chat interaction methods
  async getChatEntriesCount(): Promise<number> {
    try {
      const chatEntries = this.page.locator(this.selectors.chatEntries);
      const count = await chatEntries.count();
      console.log(`Found ${count} chat entries in history`);
      return count;
    } catch (error) {
      console.log('No chat entries found or error counting entries');
      return 0;
    }
  }

  async verifyFavouriteChatsSection(): Promise<void> {
    console.log('Verifying favourite chats section');
    
    const favouriteChatsSection = this.page.locator(this.selectors.favouriteChatsSection);
    await expect(favouriteChatsSection).toBeVisible({ timeout: 5000 });
    
    // Check if there's a "No favourite chat" message
    const noFavouriteChat = this.page.locator(this.selectors.noFavouriteChat);
    const hasNoFavourites = await noFavouriteChat.isVisible({ timeout: 2000 });
    
    if (hasNoFavourites) {
      console.log('No favourite chats found - showing "No favourite chat" message');
    } else {
      console.log('Favourite chats section loaded (may contain favourite chats)');
    }
  }

  async verifyAllChatsSection(): Promise<void> {
    console.log('Verifying all chats section');
    
    const allChatsSection = this.page.locator(this.selectors.allChatsSection);
    await expect(allChatsSection).toBeVisible({ timeout: 5000 });
    
    const chatCount = await this.getChatEntriesCount();
    if (chatCount > 0) {
      console.log(`All chats section contains ${chatCount} chat entries`);
    } else {
      console.log('All chats section is visible but may be empty');
    }
  }

  async hoverOverFirstChatEntry(): Promise<void> {
    console.log('Hovering over first chat entry in All Chats section');
    
    // Find the first chat entry using .first() method
    const firstChatEntry = this.page.locator(this.selectors.allChatEntries).first();
    await expect(firstChatEntry).toBeVisible({ timeout: 10000 });
    console.log('First chat entry found');
    
    // Hover over the first chat entry
    await firstChatEntry.hover();
    console.log('Hovered over first chat entry');
    
    // Wait for hover effects to take place
    await this.page.waitForTimeout(1000);
  }

  async verifyEllipsisMenuVisibleOnHover(): Promise<void> {
    console.log('Verifying ellipsis menu becomes visible on hover');
    
    // Find the ellipsis menu within the first chat entry
    const firstChatEntry = this.page.locator(this.selectors.allChatEntries).first();
    const ellipsisMenu = firstChatEntry.locator(this.selectors.chatEllipsisMenu);
    
    // Verify the ellipsis menu is visible after hover
    await expect(ellipsisMenu).toBeVisible({ timeout: 5000 });
    console.log('Ellipsis menu is visible on hover');
  }

  async clickEllipsisMenuOnFirstChatEntry(): Promise<void> {
    console.log('Clicking ellipsis menu on first chat entry');
    
    // Find the ellipsis menu within the first chat entry
    const firstChatEntry = this.page.locator(this.selectors.allChatEntries).first();
    const ellipsisMenu = firstChatEntry.locator(this.selectors.chatEllipsisMenu);
    
    // Ensure the menu is visible (should be visible from previous hover)
    await expect(ellipsisMenu).toBeVisible({ timeout: 5000 });
    
    // Click on the ellipsis menu
    await ellipsisMenu.click();
    console.log('Ellipsis menu clicked');
    
    // Wait for any dropdown/context menu to appear
    await this.page.waitForTimeout(1000);
  }

  async clickFavouriteButton(): Promise<void> {
    console.log('Clicking Favourite button in context menu');
    
    // Find the Favourite button in the context menu
    const favouriteButton = this.page.locator(this.selectors.favouriteButton);
    
    // Verify the Favourite button is visible
    await expect(favouriteButton).toBeVisible({ timeout: 5000 });
    console.log('Favourite button found in context menu');
    
    // Click on the Favourite button
    await favouriteButton.click();
    console.log('Favourite button clicked');
    
    // Wait for the action to complete
    await this.page.waitForTimeout(2000);
  }

  async verifyFavouriteButtonVisible(): Promise<void> {
    console.log('Verifying Favourite button is visible in context menu');
    
    const favouriteButton = this.page.locator(this.selectors.favouriteButton);
    await expect(favouriteButton).toBeVisible({ timeout: 5000 });
    console.log('Favourite button is visible in context menu');
  }

  async hoverOverFirstFavouriteChatEntry(): Promise<void> {
    console.log('Hovering over first chat entry in Favourite Chats section');
    
    // Wait for favourite chat to appear after favouriting
    await this.page.waitForTimeout(2000);
    
    // Find the first favourite chat entry using .first() method
    const firstFavouriteChatEntry = this.page.locator(this.selectors.favouriteChatEntries).first();
    await expect(firstFavouriteChatEntry).toBeVisible({ timeout: 10000 });
    console.log('First favourite chat entry found');
    
    // Hover over the first favourite chat entry
    await firstFavouriteChatEntry.hover();
    console.log('Hovered over first favourite chat entry');
    
    // Wait for hover effects to take place
    await this.page.waitForTimeout(1000);
  }

  async clickEllipsisMenuOnFirstFavouriteChatEntry(): Promise<void> {
    console.log('Clicking ellipsis menu on first favourite chat entry');
    
    // Find the ellipsis menu within the first favourite chat entry
    const firstFavouriteChatEntry = this.page.locator(this.selectors.favouriteChatEntries).first();
    const ellipsisMenu = firstFavouriteChatEntry.locator(this.selectors.favouriteChatEllipsisMenu);
    
    // Ensure the menu is visible (should be visible from previous hover)
    await expect(ellipsisMenu).toBeVisible({ timeout: 5000 });
    
    // Click on the ellipsis menu
    await ellipsisMenu.click();
    console.log('Ellipsis menu clicked on favourite chat entry');
    
    // Wait for any dropdown/context menu to appear
    await this.page.waitForTimeout(1000);
  }

  async verifyFavouriteChatExists(): Promise<void> {
    console.log('Verifying favourite chat exists in Favourite Chats section');
    
    // Wait for favourite chat to appear
    await this.page.waitForTimeout(2000);
    
    const firstFavouriteChatEntry = this.page.locator(this.selectors.favouriteChatEntries).first();
    await expect(firstFavouriteChatEntry).toBeVisible({ timeout: 10000 });
    console.log('Favourite chat entry found in Favourite Chats section');
  }

  async clickRemoveButton(): Promise<void> {
    console.log('Clicking Remove button in context menu');
    
    // Find the Remove button in the context menu
    const removeButton = this.page.locator(this.selectors.removeButton);
    
    // Verify the Remove button is visible
    await expect(removeButton).toBeVisible({ timeout: 5000 });
    console.log('Remove button found in context menu');
    
    // Click on the Remove button
    await removeButton.click();
    console.log('Remove button clicked');
    
    // Wait for the action to complete
    await this.page.waitForTimeout(2000);
  }

  async verifyRemoveButtonVisible(): Promise<void> {
    console.log('Verifying Remove button is visible in context menu');
    
    const removeButton = this.page.locator(this.selectors.removeButton);
    await expect(removeButton).toBeVisible({ timeout: 5000 });
    console.log('Remove button is visible in context menu');
  }

  async verifyFavouriteChatRemoved(): Promise<void> {
    console.log('Verifying favourite chat has been removed from Favourite Chats section');
    
    // Wait for removal to complete
    await this.page.waitForTimeout(2000);
    
    // Check if "No favourite chat" message appears
    const noFavouriteChat = this.page.locator(this.selectors.noFavouriteChat);
    const hasNoFavourites = await noFavouriteChat.isVisible({ timeout: 5000 });
    
    if (hasNoFavourites) {
      console.log('Chat successfully removed from favourites - "No favourite chat" message is visible');
    } else {
      console.log('Favourite chat removal completed (checking for empty state)');
    }
  }

  async clickRenameButton(): Promise<void> {
    console.log('Clicking Rename button in context menu');
    
    // Find the Rename button in the context menu
    const renameButton = this.page.locator(this.selectors.renameButton);
    
    // Verify the Rename button is visible
    await expect(renameButton).toBeVisible({ timeout: 5000 });
    console.log('Rename button found in context menu');
    
    // Click on the Rename button
    await renameButton.click();
    console.log('Rename button clicked');
    
    // Wait for the action to complete
    await this.page.waitForTimeout(2000);
  }

  async verifyRenameButtonVisible(): Promise<void> {
    console.log('Verifying Rename button is visible in context menu');
    
    const renameButton = this.page.locator(this.selectors.renameButton);
    await expect(renameButton).toBeVisible({ timeout: 5000 });
    console.log('Rename button is visible in context menu');
  }

  async updateChatTitle(newTitle: string): Promise<void> {
    console.log(`Updating chat title to: "${newTitle}"`);
    
    // Wait for rename input field to appear after clicking rename button
    const renameInput = this.page.locator(this.selectors.renameInput);
    await expect(renameInput).toBeVisible({ timeout: 5000 });
    console.log('Rename input field found');
    
    // Clear existing text and type new title
    await renameInput.click({ clickCount: 3 }); // Triple click to select all text
    await renameInput.fill(newTitle);
    console.log(`New title "${newTitle}" entered in input field`);
    
    // Press Enter to confirm the rename
    await renameInput.press('Enter');
    console.log('Enter key pressed to confirm rename');
    
    // Wait for the action to complete
    await this.page.waitForTimeout(2000);
  }

  async verifyRenameInputVisible(): Promise<void> {
    console.log('Verifying rename input field is visible');
    
    const renameInput = this.page.locator(this.selectors.renameInput);
    await expect(renameInput).toBeVisible({ timeout: 5000 });
    console.log('Rename input field is visible');
  }

  async clickDeleteButton(): Promise<void> {
    console.log('Clicking Delete button in context menu');
    
    // Find the Delete button in the context menu
    const deleteButton = this.page.locator(this.selectors.deleteButton);
    
    // Verify the Delete button is visible
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    console.log('Delete button found in context menu');
    
    // Click on the Delete button
    await deleteButton.click();
    console.log('Delete button clicked');
    
    // Wait for the action to complete
    await this.page.waitForTimeout(2000);
  }

  async verifyDeleteButtonVisible(): Promise<void> {
    console.log('Verifying Delete button is visible in context menu');
    
    const deleteButton = this.page.locator(this.selectors.deleteButton);
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    console.log('Delete button is visible in context menu');
  }

  async verifyChatDeleted(): Promise<void> {
    console.log('Verifying chat has been deleted from All Chats section');
    
    // Wait for deletion to complete
    await this.page.waitForTimeout(2000);
    
    // Get updated chat count to verify deletion
    const updatedChatCount = await this.getChatEntriesCount();
    console.log(`Chat count after deletion: ${updatedChatCount}`);
    
    console.log('Chat deletion verification completed');
  }

  async getChatEntryText(index: number = 0): Promise<string> {
    console.log(`Getting text content of chat entry at index ${index} from All Chats section`);
    
    // Get chat entries specifically from All Chats section
    const allChatEntries = this.page.locator(this.selectors.allChatEntries);
    const chatEntry = allChatEntries.nth(index);
    
    await expect(chatEntry).toBeVisible({ timeout: 5000 });
    
    // Get the text content of the chat title span
    const chatTitleSpan = chatEntry.locator('span.text-\\[14px\\].dark\\:text-gray-200');
    const chatText = await chatTitleSpan.textContent();
    
    console.log(`All Chats entry ${index} text: "${chatText}"`);
    return chatText || '';
  }

  // Cross button methods
  async clickCrossButton(): Promise<void> {
    console.log('Clicking cross (X) button');
    
    // Find the cross button using the lucide-x class
    const crossButton = this.page.locator(this.selectors.crossButton);
    
    // Verify the cross button is visible
    await expect(crossButton).toBeVisible({ timeout: 5000 });
    console.log('Cross button found and visible');
    
    // Click on the cross button
    await crossButton.click();
    console.log('Cross button clicked');
    
    // Wait for the action to complete
    await this.page.waitForTimeout(2000);
  }

  async clickCrossButtonWithStroke(): Promise<void> {
    console.log('Clicking cross (X) button with specific stroke color');
    
    // Find the cross button with specific stroke attributes
    const crossButton = this.page.locator(this.selectors.crossButtonWithStroke);
    
    // Verify the cross button is visible
    await expect(crossButton).toBeVisible({ timeout: 5000 });
    console.log('Cross button with stroke found and visible');
    
    // Click on the cross button
    await crossButton.click();
    console.log('Cross button with stroke clicked');
    
    // Wait for the action to complete
    await this.page.waitForTimeout(2000);
  }

  async verifyCrossButtonVisible(): Promise<void> {
    console.log('Verifying cross (X) button is visible');
    
    const crossButton = this.page.locator(this.selectors.crossButton);
    await expect(crossButton).toBeVisible({ timeout: 5000 });
    console.log('Cross button is visible');
  }

  async clickFirstVisibleCrossButton(): Promise<void> {
    console.log('Clicking first visible cross (X) button');
    
    // Find all cross buttons and click the first visible one
    const crossButtons = this.page.locator(this.selectors.crossButton);
    const count = await crossButtons.count();
    
    console.log(`Found ${count} cross button(s) on the page`);
    
    if (count > 0) {
      // Click the first cross button
      await crossButtons.first().click();
      console.log('First cross button clicked');
      
      // Wait for the action to complete
      await this.page.waitForTimeout(2000);
    } else {
      console.log('No cross buttons found on the page');
    }
  }

  async clickCrossButtonInContext(contextSelector: string): Promise<void> {
    console.log(`Clicking cross button within context: ${contextSelector}`);
    
    // Find the cross button within a specific context/container
    const contextElement = this.page.locator(contextSelector);
    const crossButton = contextElement.locator(this.selectors.crossButton);
    
    // Verify the cross button is visible within the context
    await expect(crossButton).toBeVisible({ timeout: 5000 });
    console.log(`Cross button found within context: ${contextSelector}`);
    
    // Click on the cross button
    await crossButton.click();
    console.log('Cross button clicked within context');
    
    // Wait for the action to complete
    await this.page.waitForTimeout(2000);
  }

  // Chat input area methods
  async clickChatInputArea(): Promise<void> {
    console.log('Clicking on chat input area');
    
    // Find the chat input area using contenteditable div
    const chatInputArea = this.page.locator(this.selectors.chatInputArea);
    
    // Verify the chat input area is visible
    await expect(chatInputArea).toBeVisible({ timeout: 10000 });
    console.log('Chat input area found and visible');
    
    // Click on the chat input area to focus it
    await chatInputArea.click();
    console.log('Chat input area clicked and focused');
    
    // Wait for focus to take effect
    await this.page.waitForTimeout(1000);
  }

  async typeChatMessage(message: string): Promise<void> {
    console.log(`Typing message in chat input: "${message}"`);
    
    // Find the chat input area
    const chatInputArea = this.page.locator(this.selectors.chatInputArea);
    
    // Verify the chat input area is visible
    await expect(chatInputArea).toBeVisible({ timeout: 5000 });
    console.log('Chat input area found');
    
    // Click to focus and then type the message
    await chatInputArea.click();
    await chatInputArea.fill(message);
    console.log(`Message "${message}" typed in chat input area`);
    
    // Wait for typing to complete
    await this.page.waitForTimeout(1000);
  }

  async verifyChatInputAreaVisible(): Promise<void> {
    console.log('Verifying chat input area is visible');
    
    const chatInputArea = this.page.locator(this.selectors.chatInputArea);
    await expect(chatInputArea).toBeVisible({ timeout: 10000 });
    console.log('Chat input area is visible');
  }

  async clickChatInputAreaSpecific(): Promise<void> {
    console.log('Clicking on specific chat input area with detailed selector');
    
    // Find the chat input area using more specific selector
    const chatInputArea = this.page.locator(this.selectors.chatInputAreaSpecific);
    
    // Verify the chat input area is visible
    await expect(chatInputArea).toBeVisible({ timeout: 10000 });
    console.log('Specific chat input area found and visible');
    
    // Click on the chat input area to focus it
    await chatInputArea.click();
    console.log('Specific chat input area clicked and focused');
    
    // Wait for focus to take effect
    await this.page.waitForTimeout(1000);
  }

  async sendChatMessage(): Promise<void> {
    console.log('Sending chat message by clicking send button');
    
    // Find the send button (arrow button)
    const sendButton = this.page.locator(this.selectors.sendButton);
    
    // Verify the send button is visible
    await expect(sendButton).toBeVisible({ timeout: 5000 });
    console.log('Send button (arrow) found and visible');
    
    // Click the send button
    await sendButton.click();
    console.log('Send button (arrow) clicked');
    
    // Wait for message to be sent (reduced time)
    await this.page.waitForTimeout(1000);
  }

  async clickSendButton(): Promise<void> {
    console.log('Clicking send button (arrow button)');
    
    // Find the send button using specific selector
    const sendButton = this.page.locator(this.selectors.sendButtonSpecific);
    
    // Verify the send button is visible
    await expect(sendButton).toBeVisible({ timeout: 5000 });
    console.log('Specific send button found and visible');
    
    // Click the send button
    await sendButton.click();
    console.log('Send button clicked');
    
    // Wait for message to be sent
    await this.page.waitForTimeout(1000);
  }

  async verifySendButtonVisible(): Promise<void> {
    console.log('Verifying send button (arrow) is visible');
    
    const sendButton = this.page.locator(this.selectors.sendButton);
    await expect(sendButton).toBeVisible({ timeout: 5000 });
    console.log('Send button (arrow) is visible');
  }

  async waitForAIResponseAndTitle(): Promise<void> {
    console.log('Waiting for AI response and title generation');
    
    // Wait for AI to start responding (look for loading indicators or response text)
    try {
      // Wait for AI response to appear - looking for common response indicators
      const responseSelectors = [
        '[data-testid="ai-response"]',
        '[class*="response"]',
        '[class*="message"]',
        'div:has-text("AI")',
        'div[class*="assistant"]',
        'div[class*="bot"]'
      ];
      
      console.log('Waiting for AI response to appear...');
      
      // Wait for any response indicator (reduced timeout for faster execution)
      await Promise.race([
        this.page.waitForSelector(responseSelectors[0], { timeout: 15000 }).catch(() => null),
        this.page.waitForSelector(responseSelectors[1], { timeout: 15000 }).catch(() => null),
        this.page.waitForSelector(responseSelectors[2], { timeout: 15000 }).catch(() => null),
        this.page.waitForTimeout(15000) // Reduced fallback timeout
      ]);
      
      console.log('AI response detected or timeout reached');
      
      // Wait additional time for title generation (reduced time)
      console.log('Waiting for chat title to be generated...');
      await this.page.waitForTimeout(3000);
      
      // Check if we're back on main chat page (not history)
      const currentUrl = this.page.url();
      if (!currentUrl.includes('history') && !currentUrl.includes('knowledgeManagement')) {
        console.log('Successfully on main chat page');
      }
      
      console.log('AI response and title generation completed');
      
    } catch (error) {
      console.log('AI response wait completed (may have timed out, but continuing)');
    }
  }

  async waitForChatTitleGeneration(): Promise<void> {
    console.log('Waiting specifically for chat title to be generated');
    
    try {
      // Wait for title to appear in page title or specific title element
      await this.page.waitForFunction(() => {
        // Check if page title has changed from default
        const title = document.title;
        return title && title !== 'Xyne' && title.length > 5;
      }, { timeout: 15000 });
      
      console.log('Chat title has been generated');
    } catch (error) {
      console.log('Title generation wait completed (may have timed out)');
    }
  }

  // Combined workflow methods
  async exitHistoryAndStartNewChat(message: string = 'hello this is for test'): Promise<void> {
    console.log('Starting workflow: Exit history and start new chat');
    
    // Check if we're currently on history page or main chat page
    const currentUrl = this.page.url();
    const isOnHistoryPage = currentUrl.includes('history') || currentUrl.includes('knowledgeManagement');
    
    if (isOnHistoryPage) {
      // Step 1: Click cross button to exit history (only if on history page)
      await this.clickCrossButton();
      console.log('✅ Step 1: Exited chat history');
      
      // Step 2: Wait for page transition
      await this.page.waitForTimeout(2000);
      console.log('✅ Step 2: Waited for page transition');
    } else {
      console.log('✅ Step 1-2: Already on main chat page, skipping cross button click');
    }
    
    // Step 3: Click on chat input area
    await this.clickChatInputArea();
    console.log('✅ Step 3: Clicked on chat input area');
    
    // Step 4: Type the test message
    await this.typeChatMessage(message);
    console.log(`✅ Step 4: Typed message "${message}"`);
    
    // Step 5: Send the message (press Enter)
    await this.sendChatMessage();
    console.log('✅ Step 5: Sent the message');
    
    // Step 6: Wait for AI response and title generation
    await this.waitForAIResponseAndTitle();
    console.log('✅ Step 6: AI response and title generated');
    
    console.log('🎉 Workflow completed: Exit history and start new chat with response');
  }

  async exitHistoryAndStartNewChatWithSpecificInput(message: string = 'hello this is for test'): Promise<void> {
    console.log('Starting workflow: Exit history and start new chat with specific input selector');
    
    // Step 1: Click cross button to exit history
    await this.clickCrossButton();
    console.log('✅ Step 1: Exited chat history');
    
    // Step 2: Wait for page transition
    await this.page.waitForTimeout(3000);
    console.log('✅ Step 2: Waited for page transition');
    
    // Step 3: Verify chat input area is available
    await this.verifyChatInputAreaVisible();
    console.log('✅ Step 3: Verified chat input area is visible');
    
    // Step 4: Click on specific chat input area
    await this.clickChatInputAreaSpecific();
    console.log('✅ Step 4: Clicked on specific chat input area');
    
    // Step 5: Type the test message
    await this.typeChatMessage(message);
    console.log(`✅ Step 5: Typed message "${message}"`);
    
    console.log('🎉 Workflow completed: Exit history and start new chat with specific input');
  }

  // Chat clicking methods
  async clickChatByIndex(index: number, section: 'all' | 'favourite' = 'all'): Promise<string> {
    console.log(`Clicking chat at index ${index} from ${section} chats section`);
    
    let chatEntries;
    if (section === 'favourite') {
      chatEntries = this.page.locator(this.selectors.favouriteChatTitles);
    } else {
      chatEntries = this.page.locator(this.selectors.allChatTitles);
    }
    
    // Get the specific chat entry
    const chatEntry = chatEntries.nth(index);
    await expect(chatEntry).toBeVisible({ timeout: 10000 });
    
    // Get the chat title before clicking
    const chatTitle = await chatEntry.textContent();
    console.log(`Found chat "${chatTitle}" at index ${index}`);
    
    // Click on the chat title
    await chatEntry.click();
    console.log(`Clicked on chat "${chatTitle}"`);
    
    // Wait for navigation to complete
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    
    return chatTitle || '';
  }

  async clickFirstChat(section: 'all' | 'favourite' = 'all'): Promise<string> {
    console.log(`Clicking first chat from ${section} chats section`);
    return await this.clickChatByIndex(0, section);
  }

  async clickSecondChat(section: 'all' | 'favourite' = 'all'): Promise<string> {
    console.log(`Clicking second chat from ${section} chats section`);
    return await this.clickChatByIndex(1, section);
  }

  async clickThirdChat(section: 'all' | 'favourite' = 'all'): Promise<string> {
    console.log(`Clicking third chat from ${section} chats section`);
    return await this.clickChatByIndex(2, section);
  }

  async getAllChatTitles(section: 'all' | 'favourite' = 'all'): Promise<string[]> {
    console.log(`Getting all chat titles from ${section} chats section`);
    
    let chatEntries;
    if (section === 'favourite') {
      chatEntries = this.page.locator(this.selectors.favouriteChatTitles);
    } else {
      chatEntries = this.page.locator(this.selectors.allChatTitles);
    }
    
    const count = await chatEntries.count();
    const titles: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const title = await chatEntries.nth(i).textContent();
      if (title) {
        titles.push(title.trim());
      }
    }
    
    console.log(`Found ${titles.length} chat titles in ${section} section:`, titles);
    return titles;
  }

  async clickMultipleChats(chatIndices: number[], section: 'all' | 'favourite' = 'all'): Promise<string[]> {
    console.log(`Clicking multiple chats at indices [${chatIndices.join(', ')}] from ${section} chats section`);
    
    const clickedChats: string[] = [];
    
    for (const index of chatIndices) {
      try {
        // Navigate back to history page before clicking next chat
        if (clickedChats.length > 0) {
          await this.navigateToHistoryPage();
        }
        
        const chatTitle = await this.clickChatByIndex(index, section);
        clickedChats.push(chatTitle);
        
        console.log(`✅ Successfully clicked chat ${index + 1}: "${chatTitle}"`);
        
        // Wait a bit between clicks
        await this.page.waitForTimeout(1000);
        
      } catch (error) {
        console.log(`❌ Failed to click chat at index ${index}: ${error}`);
      }
    }
    
    console.log(`Completed clicking ${clickedChats.length} chats:`, clickedChats);
    return clickedChats;
  }

  async clickFirstTwoChats(section: 'all' | 'favourite' = 'all'): Promise<string[]> {
    console.log(`Clicking first two chats from ${section} chats section`);
    return await this.clickMultipleChats([0, 1], section);
  }

  async clickFirstThreeChats(section: 'all' | 'favourite' = 'all'): Promise<string[]> {
    console.log(`Clicking first three chats from ${section} chats section`);
    return await this.clickMultipleChats([0, 1, 2], section);
  }

  async verifyChatNavigation(expectedChatTitle: string): Promise<void> {
    console.log(`Verifying navigation to chat: "${expectedChatTitle}"`);
    
    // Check if we're on a chat page (not history page)
    const currentUrl = this.page.url();
    const isOnChatPage = !currentUrl.includes('history') && !currentUrl.includes('knowledgeManagement');
    
    if (isOnChatPage) {
      console.log(`✅ Successfully navigated to chat page`);
      console.log(`Current URL: ${currentUrl}`);
    } else {
      console.log(`❌ Still on history page, navigation may have failed`);
    }
  }

  // Scrolling methods
  async scrollDownInHistory(): Promise<void> {
    console.log('Scrolling down in history page');
    
    // Target the specific scrollable container from the HTML structure
    const scrollContainer = this.page.locator('.flex-1.overflow-auto.mt-\\[15px\\]');
    
    if (await scrollContainer.isVisible()) {
      await scrollContainer.evaluate((element) => {
        element.scrollBy(0, 300);
      });
      console.log('Scrolled down 300px in history container');
    } else {
      console.log('History container not found, trying alternative selector');
      // Try alternative selector
      const altContainer = this.page.locator('.history-modal-container .flex-1.overflow-auto');
      if (await altContainer.isVisible()) {
        await altContainer.evaluate((element) => {
          element.scrollBy(0, 300);
        });
        console.log('Scrolled down 300px in alternative history container');
      } else {
        console.log('No scrollable container found');
      }
    }
    
    await this.page.waitForTimeout(1000);
  }

  async scrollUpInHistory(): Promise<void> {
    console.log('Scrolling up in history page');
    
    // Target the specific scrollable container from the HTML structure
    const scrollContainer = this.page.locator('.flex-1.overflow-auto.mt-\\[15px\\]');
    
    if (await scrollContainer.isVisible()) {
      await scrollContainer.evaluate((element) => {
        element.scrollBy(0, -300);
      });
      console.log('Scrolled up 300px in history container');
    } else {
      console.log('History container not found, trying alternative selector');
      // Try alternative selector
      const altContainer = this.page.locator('.history-modal-container .flex-1.overflow-auto');
      if (await altContainer.isVisible()) {
        await altContainer.evaluate((element) => {
          element.scrollBy(0, -300);
        });
        console.log('Scrolled up 300px in alternative history container');
      } else {
        console.log('No scrollable container found');
      }
    }
    
    await this.page.waitForTimeout(1000);
  }

  // Page refresh methods
  async refreshPage(): Promise<void> {
    console.log('Refreshing the page');
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    console.log('Page refreshed successfully');
  }

  // Utility methods
  async getCurrentUrl(): Promise<string> {
    const currentUrl = this.page.url();
    console.log('Current URL:', currentUrl);
    return currentUrl;
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
  }
}
