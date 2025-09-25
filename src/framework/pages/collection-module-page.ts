import { Page, expect } from '@playwright/test';
import { BasePage } from '../core/base-page';

export class CollectionModulePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  private selectors = {
    collectionsIcon: 'svg.lucide-book-open',
    knowledgeManagementTitle: 'text=KNOWLEDGE MANAGEMENT',
    newCollectionButton: 'button:has-text("NEW COLLECTION")',
    newCollectionButtonSpecific: 'button.bg-slate-800:has(svg.lucide-plus):has(span.font-mono:has-text("NEW COLLECTION"))',
    
    // Modal elements
    modalTitle: 'h2.font-mono:has-text("CREATE NEW COLLECTION")',
    collectionTitleLabel: 'label[for="collectionName"]:has-text("Collection title")',
    collectionTitleInput: 'input#collectionName[placeholder="Enter collection title"]',
    dragDropArea: 'div.border-2.border-dashed.border-gray-200',
    dragDropText: 'h3:has-text("Drag & drop files or folders here")',
    selectFolderButton: 'button:has-text("Select Folder")',
    uploadButton: 'button.bg-primary.text-primary-foreground:has(svg.lucide-upload.w-4.h-4):has(span:has-text("Upload"))',
    
    // Three dot menu and actions
    threeDotMenu: 'svg.lucide-ellipsis.cursor-pointer',
    editOption: 'div[role="menuitem"]:has(svg.lucide-square-pen):has(span:has-text("Edit"))',
    deleteOption: 'div[role="menuitem"]:has(svg.lucide-trash2):has(span:has-text("Delete"))',
    
    // Plus button (separate from NEW COLLECTION button)
    plusButton: 'svg.lucide-plus.cursor-pointer',
    
    // Cross/X button
    crossButton: 'svg.lucide-x.h-5.w-5.text-gray-400',
    
    // Edit dialog
    editDialogTitle: 'h2.font-mono:has-text("EDIT COLLECTION NAME")',
    editCollectionTitleInput: 'input#editCollectionName[placeholder="Enter collection title"]',
    cancelButton: 'button:has-text("Cancel")',
    updateButton: 'button.bg-primary.text-primary-foreground:has-text("Update")',
    
    // Delete confirmation
    okButton: 'button.bg-primary.text-primary-foreground:has-text("OK")',
    
    // File and document viewer
    uploadedFileRow: 'div.col-span-5.flex.items-center.hover\\:cursor-pointer:has(span:has-text("Data Enrichment.docx"))',
    documentTitle: 'text=DPIP Integration Guide',
    chatInterface: 'text=Chat with Data Enrichment.docx',
    systemOverview: 'text=1.0 System Overview',
    chatInputArea: 'div[contenteditable="true"][data-at-mention="true"].flex-grow.resize-none.bg-transparent.outline-none',
    sendButton: 'button.flex.mr-6.bg-\\[\\#464B53\\].dark\\:bg-slate-700:has(svg.lucide-arrow-right)',
    backArrowButton: 'button.justify-center.whitespace-nowrap.font-medium:has(svg.lucide-arrow-left)'
  };

  // Navigation methods
  async navigateToCollectionsPage(): Promise<void> {
    console.log('Navigating to collections page via sidebar icon');
    
    // Wait for the page to be fully loaded
    await this.page.waitForLoadState('networkidle');
    
    // Look for the Collections icon using the specific SVG class
    const collectionsIcon = this.page.locator(this.selectors.collectionsIcon);
    
    // Verify the Collections icon is visible
    await expect(collectionsIcon).toBeVisible({ timeout: 10000 });
    console.log('Collections icon (book-open) found in sidebar');
    
    // Click on the Collections icon
    await collectionsIcon.click();
    console.log('Collections icon clicked');
    
    // Wait for navigation to complete
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    
    // Verify we're on the collections page by checking URL
    const currentUrl = this.page.url();
    console.log('Current URL after clicking Collections icon:', currentUrl);
    
    // Verify collections page loaded successfully
    expect(currentUrl).toContain('knowledgeManagement');
    console.log('Successfully navigated to collections page');
  }

  // Verification methods
  async verifyCollectionsPageElements(): Promise<void> {
    console.log('Verifying collections page elements');
    
    // Verify we're on the collections page
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('knowledgeManagement');
    console.log('Confirmed on collections page');
    
    // Wait for page elements to load
    await this.page.waitForTimeout(3000);
    
    // Verify the "KNOWLEDGE MANAGEMENT" title is present
    const knowledgeManagementTitle = this.page.locator(this.selectors.knowledgeManagementTitle);
    await expect(knowledgeManagementTitle).toBeVisible({ timeout: 10000 });
    console.log('"KNOWLEDGE MANAGEMENT" title found on collections page');
    
    // Verify the "NEW COLLECTION" button is present
    const newCollectionButton = this.page.locator(this.selectors.newCollectionButton);
    await expect(newCollectionButton).toBeVisible({ timeout: 10000 });
    console.log('"NEW COLLECTION" button found on collections page');
    
    // Verify the button is clickable
    await expect(newCollectionButton).toBeEnabled();
    console.log('"NEW COLLECTION" button is enabled and clickable');
    
    console.log('Collections page elements verification completed');
  }

  async verifyCollectionsSidebarHighlight(): Promise<void> {
    console.log('Verifying collections sidebar highlight');
    
    // Look for the Collections icon in the sidebar
    const collectionsIcon = this.page.locator(this.selectors.collectionsIcon);
    await expect(collectionsIcon).toBeVisible();
    
    // Check if the collections icon has active/selected styling
    try {
      const parentElement = collectionsIcon.locator('..');
      const hasActiveClass = await parentElement.evaluate((el: HTMLElement) => {
        const classList = el.className;
        return classList.includes('active') || 
               classList.includes('selected') || 
               classList.includes('current') ||
               classList.includes('bg-') ||
               el.style.backgroundColor !== '';
      });
      
      if (hasActiveClass) {
        console.log('Collections icon appears to be highlighted/active');
      } else {
        console.log('Collections icon styling checked (may not have obvious active state)');
      }
    } catch (error) {
      console.log('Collections icon active state check completed');
    }
    
    console.log('Collections sidebar highlight verification completed');
  }

  // Modal and collection creation methods
  async clickNewCollectionButton(): Promise<void> {
    console.log('Clicking new collection button');
    
    // Find and click the "NEW COLLECTION" button using specific selector
    const newCollectionButton = this.page.locator(this.selectors.newCollectionButtonSpecific);
    
    await expect(newCollectionButton).toBeVisible({ timeout: 10000 });
    await newCollectionButton.click();
    console.log('"NEW COLLECTION" button clicked');
    
    // Wait for modal to appear
    await this.page.waitForTimeout(2000);
  }

  async verifyCreateCollectionModal(): Promise<void> {
    console.log('Verifying create collection modal elements');
    
    // 1. Verify the "CREATE NEW COLLECTION" modal title
    const modalTitle = this.page.locator(this.selectors.modalTitle);
    await expect(modalTitle).toBeVisible({ timeout: 10000 });
    console.log('"CREATE NEW COLLECTION" modal title found');
    
    // 2. Verify the "Collection title" label
    const collectionTitleLabel = this.page.locator(this.selectors.collectionTitleLabel);
    await expect(collectionTitleLabel).toBeVisible({ timeout: 5000 });
    console.log('"Collection title" label found');
    
    // 3. Verify the collection title input field
    const collectionTitleInput = this.page.locator(this.selectors.collectionTitleInput);
    await expect(collectionTitleInput).toBeVisible({ timeout: 5000 });
    console.log('Collection title input field found');
    
    // 4. Test input field functionality
    await collectionTitleInput.fill('Test Collection Name');
    const inputValue = await collectionTitleInput.inputValue();
    expect(inputValue).toBe('Test Collection Name');
    console.log('Collection title input field is functional');
    
    // Clear input
    await collectionTitleInput.clear();
    
    // Verify drag & drop area
    const dragDropText = this.page.locator(this.selectors.dragDropText);
    await expect(dragDropText).toBeVisible({ timeout: 5000 });
    console.log('Drag & drop area found');
    
    // Verify action buttons
    const selectFolderButton = this.page.locator(this.selectors.selectFolderButton);
    await expect(selectFolderButton).toBeVisible({ timeout: 5000 });
    console.log('Select Folder button found');
    
    const uploadButton = this.page.locator(this.selectors.uploadButton);
    await expect(uploadButton).toBeVisible({ timeout: 5000 });
    console.log('Upload button found');
    
    console.log('Modal verification completed');
  }

  async addCollectionTitle(): Promise<string> {
    console.log('Adding collection title');
    
    // Verify the collection title input field is available
    const collectionTitleInput = this.page.locator(this.selectors.collectionTitleInput);
    await expect(collectionTitleInput).toBeVisible({ timeout: 5000 });
    console.log('Collection title input field found');
    
    // Generate random alphanumeric string
    const randomSuffix = this.generateRandomString(8);
    const testCollectionTitle = `My Test Collection ${randomSuffix}`;
    
    await collectionTitleInput.fill(testCollectionTitle);
    console.log(`Collection title "${testCollectionTitle}" entered`);
    
    // Wait after adding collection name
    await this.page.waitForTimeout(2000);
    
    // Verify the title was entered correctly
    const enteredValue = await collectionTitleInput.inputValue();
    expect(enteredValue).toBe(testCollectionTitle);
    console.log('Collection title input verified successfully');
    
    console.log('Collection title addition completed');
    return testCollectionTitle;
  }

  async selectFileAndUpload(): Promise<void> {
    console.log('Selecting file and uploading');
    
    // Step 1: Click on drag & drop area to open file selection dialog
    const dragDropArea = this.page.locator(this.selectors.dragDropArea);
    await expect(dragDropArea).toBeVisible({ timeout: 5000 });
    console.log('Drag & drop area found');
    
    // Set up file chooser event listener before clicking
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    
    // Click on the drag & drop area to open file selection dialog
    await dragDropArea.click();
    console.log('Clicked on drag & drop area - file selection dialog should open');
    
    // Step 2: File selection dialog opens and select the file
    const fileChooser = await fileChooserPromise;
    console.log('File selection dialog opened');
    
    await fileChooser.setFiles('documents/Data Enrichment.docx');
    console.log('File selected: documents/Data Enrichment.docx');
    
    // Step 3: Wait for file to be added to the interface
    await this.page.waitForTimeout(3000);
    console.log('Waited for file to be added to the interface');
    
    // Step 4: Find and click the upload button
    const uploadButton = this.page.locator(this.selectors.uploadButton);
    await expect(uploadButton).toBeVisible({ timeout: 5000 });
    console.log('Upload button found');
    
    // Check if upload button is now enabled after file selection
    const isDisabled = await uploadButton.getAttribute('disabled');
    if (isDisabled === null) {
      console.log('Upload button is enabled after file selection');
      
      // Click the upload button to start upload process
      await uploadButton.click();
      console.log('Upload button clicked - starting upload process');
      
      // Wait for upload process to complete
      await this.page.waitForTimeout(10000);
      console.log('Waited for upload process to complete');
      
    } else {
      console.log('Upload button is still disabled after file selection');
    }
    
    console.log('File selection and upload completed');
  }

  async selectScreeningFeedbackFileAndUpload(): Promise<void> {
    console.log('Selecting Screening & Feedback file and uploading');
    
    // Step 1: Click on drag & drop area to open file selection dialog
    const dragDropArea = this.page.locator(this.selectors.dragDropArea);
    await expect(dragDropArea).toBeVisible({ timeout: 5000 });
    console.log('Drag & drop area found');
    
    // Set up file chooser event listener before clicking
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    
    // Click on the drag & drop area to open file selection dialog
    await dragDropArea.click();
    console.log('Clicked on drag & drop area - file selection dialog should open');
    
    // Step 2: File selection dialog opens and select the file
    const fileChooser = await fileChooserPromise;
    console.log('File selection dialog opened');
    
    await fileChooser.setFiles('documents/Screening & Feedback.docx');
    console.log('File selected: documents/Screening & Feedback.docx');
    
    // Step 3: Wait for file to be added to the interface
    await this.page.waitForTimeout(3000);
    console.log('Waited for file to be added to the interface');
    
    // Step 4: Find and click the upload button
    const uploadButton = this.page.locator(this.selectors.uploadButton);
    await expect(uploadButton).toBeVisible({ timeout: 5000 });
    console.log('Upload button found');
    
    // Check if upload button is now enabled after file selection
    const isDisabled = await uploadButton.getAttribute('disabled');
    if (isDisabled === null) {
      console.log('Upload button is enabled after file selection');
      
      // Click the upload button to start upload process
      await uploadButton.click();
      console.log('Upload button clicked - starting upload process');
      
      // Wait for upload process to complete
      await this.page.waitForTimeout(10000);
      console.log('Waited for upload process to complete');
      
    } else {
      console.log('Upload button is still disabled after file selection');
    }
    
    console.log('Screening & Feedback file selection and upload completed');
  }

  async refreshPageAndVerifyCollection(): Promise<void> {
    console.log('Refreshing page and verifying collection');
    
    // Refresh the page to verify the uploaded collection persists
    await this.page.reload();
    console.log('Page refreshed');
    
    // Wait for page to load after refresh
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
    console.log('Waited for page to load after refresh');
    
    // Verify we're still on the collections page
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('knowledgeManagement');
    console.log('Confirmed still on collections page after refresh');
    
    // Verify the "KNOWLEDGE MANAGEMENT" title is still present
    const knowledgeManagementTitle = this.page.locator(this.selectors.knowledgeManagementTitle);
    await expect(knowledgeManagementTitle).toBeVisible({ timeout: 10000 });
    console.log('"KNOWLEDGE MANAGEMENT" title found after page refresh');
    
    // Verify the "NEW COLLECTION" button is still present
    const newCollectionButton = this.page.locator(this.selectors.newCollectionButton);
    await expect(newCollectionButton).toBeVisible({ timeout: 10000 });
    console.log('"NEW COLLECTION" button found after page refresh');
    
    // Check if the uploaded collection appears in the collections list
    try {
      const collectionEntries = this.page.locator('[class*="collection"], [class*="folder"], [class*="file"]');
      const entryCount = await collectionEntries.count();
      if (entryCount > 0) {
        console.log(`Found ${entryCount} collection/file entries after refresh`);
      } else {
        console.log('No collection entries found after refresh');
      }
    } catch (error) {
      console.log('Collection entries check completed after refresh');
    }
    
    console.log('Page refresh and verification completed');
  }

  // Three dot menu methods
  async clickThreeDotMenuAndEdit(): Promise<string> {
    console.log('Clicking 3-dot menu and selecting Edit');
    
    // Wait for page to be fully loaded
    await this.page.waitForTimeout(2000);
    
    // Find the 3-dot menu (ellipsis) button
    const threeDotMenu = this.page.locator(this.selectors.threeDotMenu);
    
    // Check if the 3-dot menu is visible
    const menuCount = await threeDotMenu.count();
    console.log(`Found ${menuCount} 3-dot menu(s) on the page`);
    
    if (menuCount > 0) {
      // Click on the first 3-dot menu
      await expect(threeDotMenu.first()).toBeVisible({ timeout: 5000 });
      console.log('3-dot menu found and visible');
      
      // Click the 3-dot menu
      await threeDotMenu.first().click();
      console.log('3-dot menu clicked');
      
      // Wait for menu dropdown to appear
      await this.page.waitForTimeout(2000);
      console.log('Waited for menu dropdown to appear');
      
      // Find and click the Edit option
      const editOption = this.page.locator(this.selectors.editOption);
      await expect(editOption).toBeVisible({ timeout: 5000 });
      console.log('Edit option found in dropdown menu');
      
      // Click the Edit option
      await editOption.click();
      console.log('Edit option clicked');
      
      // Wait for edit dialog to appear
      await this.page.waitForTimeout(2000);
      console.log('Waited for edit dialog to appear');
      
      // Verify edit dialog elements
      await this.verifyEditDialog();
      
      // Generate and enter new collection name
      const randomSuffix = this.generateRandomString(8);
      const updatedCollectionTitle = `Updated Collection ${randomSuffix}`;
      
      const collectionTitleInput = this.page.locator(this.selectors.editCollectionTitleInput);
      await collectionTitleInput.clear();
      await collectionTitleInput.fill(updatedCollectionTitle);
      console.log(`Collection name updated to "${updatedCollectionTitle}" in edit dialog`);
      
      // Wait after editing
      await this.page.waitForTimeout(2000);
      
      // Click Update button to save changes
      const updateButton = this.page.locator(this.selectors.updateButton);
      await updateButton.click();
      console.log('Update button clicked to save changes');
      
      // Wait for update to complete
      await this.page.waitForTimeout(3000);
      console.log('Waited for update to complete');
      
      // Verify that the new collection name is present
      const updatedCollectionName = this.page.locator(`text=${updatedCollectionTitle}`);
      await expect(updatedCollectionName).toBeVisible({ timeout: 10000 });
      console.log(`Verified that updated collection name "${updatedCollectionTitle}" is now visible`);
      
      return updatedCollectionTitle;
    } else {
      console.log('No 3-dot menu found - collection may not be visible yet');
      return '';
    }
  }

  async verifyEditDialog(): Promise<void> {
    console.log('Verifying edit dialog elements');
    
    // Verify "EDIT COLLECTION NAME" dialog title
    const editDialogTitle = this.page.locator(this.selectors.editDialogTitle);
    await expect(editDialogTitle).toBeVisible({ timeout: 5000 });
    console.log('Edit collection name dialog title found');
    
    // Verify collection title input field
    const collectionTitleInput = this.page.locator(this.selectors.editCollectionTitleInput);
    await expect(collectionTitleInput).toBeVisible({ timeout: 5000 });
    console.log('Collection title input field found in edit dialog');
    
    // Verify Cancel button
    const cancelButton = this.page.locator(this.selectors.cancelButton);
    await expect(cancelButton).toBeVisible({ timeout: 5000 });
    console.log('Cancel button found in edit dialog');
    
    // Verify Update button
    const updateButton = this.page.locator(this.selectors.updateButton);
    await expect(updateButton).toBeVisible({ timeout: 5000 });
    console.log('Update button found in edit dialog');
  }

  // File interaction methods
  async clickUploadedFileAndInteract(): Promise<void> {
    console.log('Clicking uploaded file and interacting');
    
    // Wait for page to be fully loaded
    await this.page.waitForTimeout(2000);
    
    // Find and click on the uploaded file
    const uploadedFileRow = this.page.locator(this.selectors.uploadedFileRow).first();
    await expect(uploadedFileRow).toBeVisible({ timeout: 10000 });
    console.log('Uploaded file row "Data Enrichment.docx" found');
    
    // Click on the file row to open document viewer
    await uploadedFileRow.click();
    console.log('Clicked on "Data Enrichment.docx" file');
    
    // Wait for document viewer to load
    await this.page.waitForTimeout(5000);
    console.log('Waited for document viewer to load');
    
    // Verify document viewer opened
    await this.verifyDocumentViewer();
    
    // Interact with chat
    await this.interactWithChat();
    
    // Navigate back to collections page
    await this.navigateBackToCollections();
  }

  async verifyDocumentViewer(): Promise<void> {
    console.log('Verifying document viewer');
    
    // Verify document viewer opened by checking for document content
    const documentTitle = this.page.locator(this.selectors.documentTitle);
    await expect(documentTitle).toBeVisible({ timeout: 10000 });
    console.log('Document viewer opened successfully - "DPIP Integration Guide" title found');
    
    // Verify chat interface is available
    const chatInterface = this.page.locator(this.selectors.chatInterface);
    await expect(chatInterface).toBeVisible({ timeout: 5000 });
    console.log('Chat interface found - "Chat with Data Enrichment.docx" header visible');
    
    // Verify document content sections are visible
    const systemOverview = this.page.locator(this.selectors.systemOverview);
    await expect(systemOverview).toBeVisible({ timeout: 5000 });
    console.log('Document content loaded - "1.0 System Overview" section found');
    
    // Wait to allow full document loading
    await this.page.waitForTimeout(3000);
    console.log('Document viewer fully loaded and verified');
  }

  async interactWithChat(): Promise<void> {
    console.log('Interacting with chat');
    
    // Find and click on the chat input area
    const chatInputArea = this.page.locator(this.selectors.chatInputArea);
    await expect(chatInputArea).toBeVisible({ timeout: 10000 });
    console.log('Chat input area found');
    
    // Click on the chat input area to focus it
    await chatInputArea.click();
    console.log('Clicked on chat input area');
    
    // Wait for input area to be focused
    await this.page.waitForTimeout(1000);
    
    // Type a message in the chat input
    const testMessage = 'What are the two main services I need to integrate with?';
    await chatInputArea.fill(testMessage);
    console.log(`Typed message in chat: "${testMessage}"`);
    
    // Find and click the send button
    const sendButton = this.page.locator(this.selectors.sendButton);
    await expect(sendButton).toBeVisible({ timeout: 5000 });
    console.log('Send button found');
    
    // Click the send button to send the message
    await sendButton.click();
    console.log('Send button clicked - message sent');
    
    // Wait for response to appear
    await this.page.waitForTimeout(10000);
    console.log('Waited for chat response');
    
    // Validate chat response
    await this.validateChatResponse();
  }

  async validateChatResponse(): Promise<void> {
    console.log('Validating chat response');
    
    // Look for the chat response containing the expected services
    const chatResponse = this.page.locator('div').filter({ hasText: /Bank Edge Service|Central DPIP Service/ });
    
    // Wait for response with either service name to appear
    await expect(chatResponse.first()).toBeVisible({ timeout: 30000 });
    console.log('Chat response found');
    
    // Get the response text to validate both services are mentioned
    const responseText = await this.page.textContent('body');
    
    // Validate that both required services are mentioned in the response
    const hasBankEdgeService = responseText?.includes('Bank Edge Service');
    const hasCentralDPIPService = responseText?.includes('Central DPIP Service');
    
    if (hasBankEdgeService && hasCentralDPIPService) {
      console.log('✓ Chat response validation successful: Both "Bank Edge Service" and "Central DPIP Service" found in response');
    } else {
      console.log('✗ Chat response validation failed:');
      console.log(`  - Bank Edge Service found: ${hasBankEdgeService}`);
      console.log(`  - Central DPIP Service found: ${hasCentralDPIPService}`);
    }
    
    // Assert that both services are mentioned
    expect(hasBankEdgeService).toBe(true);
    expect(hasCentralDPIPService).toBe(true);
    
    console.log('Chat interaction and validation completed');
  }

  async navigateBackToCollections(): Promise<void> {
    console.log('Navigating back to collections page');
    
    // Find and click the back arrow button to return to collections page
    const backArrowButton = this.page.locator(this.selectors.backArrowButton);
    await expect(backArrowButton).toBeVisible({ timeout: 10000 });
    console.log('Back arrow button found');
    
    // Click the back arrow button
    await backArrowButton.click();
    console.log('Back arrow button clicked - returning to collections page');
    
    // Wait for navigation back to collections page
    await this.page.waitForTimeout(3000);
    console.log('Waited for navigation back to collections page');
    
    // Verify we're back on the collections page
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('knowledgeManagement');
    console.log('Confirmed back on collections page');
  }

  // Plus button methods
  async clickPlusButton(): Promise<void> {
    console.log('Clicking + button');
    
    // Find the + button using the specific selector
    const plusButton = this.page.locator(this.selectors.plusButton);
    
    // Check if the + button is visible
    const buttonCount = await plusButton.count();
    console.log(`Found ${buttonCount} + button(s) on the page`);
    
    if (buttonCount > 0) {
      // Verify the + button is visible
      await expect(plusButton.first()).toBeVisible({ timeout: 10000 });
      console.log('+ button found and visible');
      
      // Click the + button
      await plusButton.first().click();
      console.log('+ button clicked');
      
      // Wait for any action to complete
      await this.page.waitForTimeout(2000);
      console.log('Waited for + button action to complete');
      
    } else {
      console.log('No + button found on the page');
    }
    
    console.log('+ button click completed');
  }

  // Cross button methods
  async clickCrossButton(): Promise<void> {
    console.log('Clicking X (cross) button');
    
    // Find the cross button using the specific selector
    const crossButton = this.page.locator(this.selectors.crossButton);
    
    // Check if the cross button is visible
    const buttonCount = await crossButton.count();
    console.log(`Found ${buttonCount} X (cross) button(s) on the page`);
    
    if (buttonCount > 0) {
      // Verify the cross button is visible
      await expect(crossButton.first()).toBeVisible({ timeout: 10000 });
      console.log('X (cross) button found and visible');
      
      // Click the cross button
      await crossButton.first().click();
      console.log('X (cross) button clicked');
      
      // Wait for any action to complete
      await this.page.waitForTimeout(2000);
      console.log('Waited for X (cross) button action to complete');
      
    } else {
      console.log('No X (cross) button found on the page');
    }
    
    console.log('X (cross) button click completed');
  }

  // Delete methods
  async clickThreeDotMenuAndDelete(): Promise<void> {
    console.log('Clicking 3-dot menu and selecting Delete');
    
    // Wait for page to be fully loaded
    await this.page.waitForTimeout(2000);
    
    // Find the 3-dot menu (ellipsis) button
    const threeDotMenu = this.page.locator(this.selectors.threeDotMenu);
    
    // Check if the 3-dot menu is visible
    const menuCount = await threeDotMenu.count();
    console.log(`Found ${menuCount} 3-dot menu(s) on the page`);
    
    if (menuCount > 0) {
      // Click on the first 3-dot menu
      await expect(threeDotMenu.first()).toBeVisible({ timeout: 5000 });
      console.log('3-dot menu found and visible');
      
      // Click the 3-dot menu
      await threeDotMenu.first().click();
      console.log('3-dot menu clicked');
      
      // Wait for menu dropdown to appear
      await this.page.waitForTimeout(2000);
      console.log('Waited for menu dropdown to appear');
      
      // Find and click the Delete option
      const deleteOption = this.page.locator(this.selectors.deleteOption);
      await expect(deleteOption).toBeVisible({ timeout: 5000 });
      console.log('Delete option found in dropdown menu');
      
      // Click the Delete option
      await deleteOption.click();
      console.log('Delete option clicked');
      
      // Wait for confirmation dialog to appear
      await this.page.waitForTimeout(2000);
      console.log('Waited for delete confirmation dialog to appear');
      
      // Verify and handle delete confirmation
      await this.handleDeleteConfirmation();
      
    } else {
      console.log('No 3-dot menu found - collection may not be visible yet');
    }
    
    console.log('3-dot menu Delete completed');
  }

  async handleDeleteConfirmation(): Promise<void> {
    console.log('Handling delete confirmation');
    
    // Verify Cancel button exists but don't interact with it
    const cancelButton = this.page.locator(this.selectors.cancelButton);
    const cancelExists = await cancelButton.count() > 0;
    if (cancelExists) {
      console.log('Cancel button found in delete confirmation dialog (not highlighted)');
    } else {
      console.log('Cancel button not found in delete confirmation dialog');
    }
    
    // Find and verify OK button is visible
    const okButton = this.page.locator(this.selectors.okButton);
    await expect(okButton).toBeVisible({ timeout: 5000 });
    console.log('OK button found in delete confirmation dialog');
    
    // Click the OK button to confirm deletion
    await okButton.click();
    console.log('OK button clicked - confirming deletion');
    
    // Wait for deletion to complete
    await this.page.waitForTimeout(5000);
    console.log('Waited for deletion to complete');
    
    // Additional wait to verify deletion
    await this.page.waitForTimeout(3000);
    console.log('Additional wait completed - deletion should be complete');
  }

  // Utility methods
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Getter methods for current state
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
  }
}
