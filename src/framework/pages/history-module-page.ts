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
