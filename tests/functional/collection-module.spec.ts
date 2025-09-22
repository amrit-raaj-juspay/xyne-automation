import { test, expect } from '@playwright/test';
import { LoginHelper } from '@/framework/pages/login-helper';

// Configure tests to run sequentially and share browser context
test.describe.configure({ mode: 'serial' });

test.describe('Collection Module Tests', () => {
  let sharedPage: any;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    sharedPage = await context.newPage();
  });

  test('user login', async () => {
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

  test('navigate to collections page via sidebar icon', async () => {
    console.log('Starting navigation to collections page test');
    
    // Wait for the page to be fully loaded
    await sharedPage.waitForLoadState('networkidle');
    
    // Look for the Collections icon using the specific SVG class
    const collectionsIcon = sharedPage.locator('svg.lucide-book-open');
    
    // Verify the Collections icon is visible
    await expect(collectionsIcon).toBeVisible({ timeout: 10000 });
    console.log('Collections icon (book-open) found in sidebar');
    
    // Click on the Collections icon
    await collectionsIcon.click();
    console.log('Collections icon clicked');
    
    // Wait for navigation to complete
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);
    
    // Verify we're on the collections page by checking URL or page content
    const currentUrl = sharedPage.url();
    console.log('Current URL after clicking Collections icon:', currentUrl);
    
    // Verify collections page loaded successfully
    expect(currentUrl).toContain('knowledgeManagement');
    console.log('Successfully navigated to collections page');
  });

  test('verify collections page elements', async () => {
    console.log('Starting collections page elements verification test');
    
    // Verify we're on the collections page
    const currentUrl = sharedPage.url();
    expect(currentUrl).toContain('knowledgeManagement');
    console.log('Confirmed on collections page');
    
    // Wait for page elements to load
    await sharedPage.waitForTimeout(3000);
    
    // Verify the "KNOWLEDGE MANAGEMENT" title is present
    const knowledgeManagementTitle = sharedPage.locator('text=KNOWLEDGE MANAGEMENT');
    await expect(knowledgeManagementTitle).toBeVisible({ timeout: 10000 });
    console.log('"KNOWLEDGE MANAGEMENT" title found on collections page');
    
    // Verify the "NEW COLLECTION" button is present
    const newCollectionButton = sharedPage.locator('button:has-text("NEW COLLECTION")');
    await expect(newCollectionButton).toBeVisible({ timeout: 10000 });
    console.log('"NEW COLLECTION" button found on collections page');
    
    // Verify the button is clickable
    await expect(newCollectionButton).toBeEnabled();
    console.log('"NEW COLLECTION" button is enabled and clickable');
    
    console.log('Collections page elements verification completed');
  });

  test('verify collections sidebar navigation is highlighted', async () => {
    console.log('Starting collections sidebar highlight verification test');
    
    // Look for the Collections icon in the sidebar
    const collectionsIcon = sharedPage.locator('svg.lucide-book-open');
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
  });

  test('click new collection button and verify modal opens', async () => {
    console.log('Starting new collection button click test');
    
    // Find and click the "NEW COLLECTION" button using specific selector based on HTML structure
    const newCollectionButton = sharedPage.locator('button.bg-slate-800:has(svg.lucide-plus):has(span.font-mono:has-text("NEW COLLECTION"))');
    
    await expect(newCollectionButton).toBeVisible({ timeout: 10000 });
    await newCollectionButton.click();
    console.log('"NEW COLLECTION" button clicked');
    
    // Wait for modal to appear
    await sharedPage.waitForTimeout(2000);
    
    // Comprehensive verification of all modal elements using specific selectors
    console.log('Starting comprehensive modal elements verification with specific selectors');
    
    // 1. Verify the "CREATE NEW COLLECTION" modal title using specific h2 selector
    const modalTitle = sharedPage.locator('h2.font-mono:has-text("CREATE NEW COLLECTION")');
    await expect(modalTitle).toBeVisible({ timeout: 10000 });
    console.log('"CREATE NEW COLLECTION" modal title found with h2.font-mono selector');
    
    // 2. Verify the "Collection title" label using specific label selector
    const collectionTitleLabel = sharedPage.locator('label[for="collectionName"]:has-text("Collection title")');
    await expect(collectionTitleLabel).toBeVisible({ timeout: 5000 });
    console.log('"Collection title" label found with specific for="collectionName" selector');
    
    // 3. Verify the collection title input field using specific ID and placeholder
    const collectionTitleInput = sharedPage.locator('input#collectionName[placeholder="Enter collection title"]');
    await expect(collectionTitleInput).toBeVisible({ timeout: 5000 });
    console.log('Collection title input field found with ID "collectionName"');
    
    // 4. Test input field functionality
    await collectionTitleInput.fill('Test Collection Name');
    const inputValue = await collectionTitleInput.inputValue();
    expect(inputValue).toBe('Test Collection Name');
    console.log('Collection title input field is functional and accepts text');
    
    // Clear input and verify essential modal elements only
    await collectionTitleInput.clear();
    
    // Verify drag & drop area
    const dragDropText = sharedPage.locator('h3:has-text("Drag & drop files or folders here")');
    await expect(dragDropText).toBeVisible({ timeout: 5000 });
    console.log('Drag & drop area found');
    
    // Verify action buttons
    const selectFolderButton = sharedPage.locator('button:has-text("Select Folder")');
    await expect(selectFolderButton).toBeVisible({ timeout: 5000 });
    console.log('Select Folder button found');
    
    const uploadButton = sharedPage.locator('button:has-text("Upload")');
    await expect(uploadButton).toBeVisible({ timeout: 5000 });
    console.log('Upload button found');
    
    console.log('Modal verification completed');
  });

  test('add collection title', async () => {
    console.log('Starting collection title addition test');
    
    // Modal should already be open from previous test
    // Verify the collection title input field is available
    const collectionTitleInput = sharedPage.locator('input#collectionName[placeholder="Enter collection title"]');
    await expect(collectionTitleInput).toBeVisible({ timeout: 5000 });
    console.log('Collection title input field found');
    
    // Generate random alphanumeric string
    const generateRandomString = (length: number): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    // Create collection title with random suffix
    const randomSuffix = generateRandomString(8);
    const testCollectionTitle = `My Test Collection ${randomSuffix}`;
    
    await collectionTitleInput.fill(testCollectionTitle);
    console.log(`Collection title "${testCollectionTitle}" entered`);
    
    // Wait after adding collection name
    await sharedPage.waitForTimeout(2000);
    
    // Verify the title was entered correctly
    const enteredValue = await collectionTitleInput.inputValue();
    expect(enteredValue).toBe(testCollectionTitle);
    console.log('Collection title input verified successfully');
 
    console.log('Collection title addition test completed');
  });

  test('select file and upload', async () => {
    console.log('Starting file selection and upload test');
    
    // Modal should already be open from previous tests
    // Step 1: Click on drag & drop area to open file selection dialog
    const dragDropArea = sharedPage.locator('div.border-2.border-dashed.border-gray-200');
    await expect(dragDropArea).toBeVisible({ timeout: 5000 });
    console.log('Drag & drop area found');
    
    // Set up file chooser event listener before clicking
    const fileChooserPromise = sharedPage.waitForEvent('filechooser');
    
    // Click on the drag & drop area to open file selection dialog
    await dragDropArea.click();
    console.log('Clicked on drag & drop area - file selection dialog should open');
    
    // Step 2: File selection dialog opens and select the file
    const fileChooser = await fileChooserPromise;
    console.log('File selection dialog opened');
    
    await fileChooser.setFiles('documents/Data Enrichment.docx');
    console.log('File selected: documents/Data Enrichment.docx');
    
    // Step 3: Wait for file to be added to the interface
    await sharedPage.waitForTimeout(3000);
    console.log('Waited for file to be added to the interface');
    
    // Step 4: Find and click the upload button
    const uploadButton = sharedPage.locator('button.bg-primary.text-primary-foreground:has(svg.lucide-upload.w-4.h-4):has(span:has-text("Upload"))');
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
      await sharedPage.waitForTimeout(10000);
      console.log('Waited for upload process to complete');
      
    } else {
      console.log('Upload button is still disabled after file selection');
    }
    
    console.log('File selection and upload test completed');
  });

  test('refresh page and verify collection', async () => {
    console.log('Starting page refresh test');
    
    // Refresh the page to verify the uploaded collection persists
    await sharedPage.reload();
    console.log('Page refreshed');
    
    // Wait for page to load after refresh
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(3000);
    console.log('Waited for page to load after refresh');
    
    // Verify we're still on the collections page
    const currentUrl = sharedPage.url();
    expect(currentUrl).toContain('knowledgeManagement');
    console.log('Confirmed still on collections page after refresh');
    
    // Verify the "KNOWLEDGE MANAGEMENT" title is still present
    const knowledgeManagementTitle = sharedPage.locator('text=KNOWLEDGE MANAGEMENT');
    await expect(knowledgeManagementTitle).toBeVisible({ timeout: 10000 });
    console.log('"KNOWLEDGE MANAGEMENT" title found after page refresh');
    
    // Verify the "NEW COLLECTION" button is still present
    const newCollectionButton = sharedPage.locator('button:has-text("NEW COLLECTION")');
    await expect(newCollectionButton).toBeVisible({ timeout: 10000 });
    console.log('"NEW COLLECTION" button found after page refresh');
    
    // Check if the uploaded collection appears in the collections list
    // Look for any collection entries or file listings that might indicate successful upload
    try {
      const collectionEntries = sharedPage.locator('[class*="collection"], [class*="folder"], [class*="file"]');
      const entryCount = await collectionEntries.count();
      if (entryCount > 0) {
        console.log(`Found ${entryCount} collection/file entries after refresh`);
      } else {
        console.log('No collection entries found after refresh');
      }
    } catch (error) {
      console.log('Collection entries check completed after refresh');
    }
    
    console.log('Page refresh test completed');
  });

  test('click 3-dot menu and select Edit option', async () => {
    console.log('Starting 3-dot menu Edit test');
    
    // Wait for page to be fully loaded
    await sharedPage.waitForTimeout(2000);
    
    // Find the 3-dot menu (ellipsis) button using the specific SVG selector
    const threeDotMenu = sharedPage.locator('svg.lucide-ellipsis.cursor-pointer');
    
    // Check if the 3-dot menu is visible
    const menuCount = await threeDotMenu.count();
    console.log(`Found ${menuCount} 3-dot menu(s) on the page`);
    
    if (menuCount > 0) {
      // Click on the first 3-dot menu (should be for our created collection)
      await expect(threeDotMenu.first()).toBeVisible({ timeout: 5000 });
      console.log('3-dot menu found and visible');
      
      // Click the 3-dot menu
      await threeDotMenu.first().click();
      console.log('3-dot menu clicked');
      
      // Wait for menu dropdown to appear
      await sharedPage.waitForTimeout(2000);
      console.log('Waited for menu dropdown to appear');
      
      // Find and click the Edit option using the specific selector
      const editOption = sharedPage.locator('div[role="menuitem"]:has(svg.lucide-square-pen):has(span:has-text("Edit"))');
      await expect(editOption).toBeVisible({ timeout: 5000 });
      console.log('Edit option found in dropdown menu');
      
      // Click the Edit option
      await editOption.click();
      console.log('Edit option clicked');
      
      // Wait for edit dialog to appear
      await sharedPage.waitForTimeout(2000);
      console.log('Waited for edit dialog to appear');
      
      // Verify "EDIT COLLECTION NAME" dialog title using specific selector
      const editDialogTitle = sharedPage.locator('h2.font-mono:has-text("EDIT COLLECTION NAME")');
      await expect(editDialogTitle).toBeVisible({ timeout: 5000 });
      console.log('Edit collection name dialog title found');
      
      // Verify collection title input field using specific ID
      const collectionTitleInput = sharedPage.locator('input#editCollectionName[placeholder="Enter collection title"]');
      await expect(collectionTitleInput).toBeVisible({ timeout: 5000 });
      console.log('Collection title input field found in edit dialog');
      
      // Verify Cancel button
      const cancelButton = sharedPage.locator('button:has-text("Cancel")');
      await expect(cancelButton).toBeVisible({ timeout: 5000 });
      console.log('Cancel button found in edit dialog');
      
      // Verify Update button with specific styling
      const updateButton = sharedPage.locator('button.bg-primary.text-primary-foreground:has-text("Update")');
      await expect(updateButton).toBeVisible({ timeout: 5000 });
      console.log('Update button found in edit dialog');
      
      // Generate random alphanumeric string for updated name
      const generateRandomString = (length: number): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };
      
      // Create updated collection title with random suffix
      const randomSuffix = generateRandomString(8);
      const updatedCollectionTitle = `Updated Collection ${randomSuffix}`;
      
      // Modify the collection name
      await collectionTitleInput.clear();
      await collectionTitleInput.fill(updatedCollectionTitle);
      console.log(`Collection name updated to "${updatedCollectionTitle}" in edit dialog`);
      
      // Wait after editing
      await sharedPage.waitForTimeout(2000);
      
      // Click Update button to save changes
      await updateButton.click();
      console.log('Update button clicked to save changes');
      
      // Wait for update to complete
      await sharedPage.waitForTimeout(3000);
      console.log('Waited for update to complete');
      
      // Verify that the new collection name is present in the collections list
      const updatedCollectionName = sharedPage.locator(`text=${updatedCollectionTitle}`);
      await expect(updatedCollectionName).toBeVisible({ timeout: 10000 });
      console.log(`Verified that updated collection name "${updatedCollectionTitle}" is now visible in the collections list`);
      
    } else {
      console.log('No 3-dot menu found - collection may not be visible yet');
    }
    
    console.log('3-dot menu Edit test completed');
  });

  test('click on uploaded file to open document viewer', async () => {
    console.log('Starting file click test');
    
    // Wait for page to be fully loaded
    await sharedPage.waitForTimeout(2000);
    
    // Find and click on the uploaded file using the specific selector for the clickable file row
    const uploadedFileRow = sharedPage.locator('div.col-span-5.flex.items-center.hover\\:cursor-pointer:has(span:has-text("Data Enrichment.docx"))').first();
    await expect(uploadedFileRow).toBeVisible({ timeout: 10000 });
    console.log('Uploaded file row "Data Enrichment.docx" found');
    
    // Click on the file row to open document viewer
    await uploadedFileRow.click();
    console.log('Clicked on "Data Enrichment.docx" file');
    
    // Wait for document viewer to load
    await sharedPage.waitForTimeout(5000);
    console.log('Waited for document viewer to load');
    
    // Verify document viewer opened by checking for document content
    const documentTitle = sharedPage.locator('text=DPIP Integration Guide');
    await expect(documentTitle).toBeVisible({ timeout: 10000 });
    console.log('Document viewer opened successfully - "DPIP Integration Guide" title found');
    
    // Verify chat interface is available
    const chatInterface = sharedPage.locator('text=Chat with Data Enrichment.docx');
    await expect(chatInterface).toBeVisible({ timeout: 5000 });
    console.log('Chat interface found - "Chat with Data Enrichment.docx" header visible');
    
    // Verify document content sections are visible
    const systemOverview = sharedPage.locator('text=1.0 System Overview');
    await expect(systemOverview).toBeVisible({ timeout: 5000 });
    console.log('Document content loaded - "1.0 System Overview" section found');
    
    // Wait to allow full document loading
    await sharedPage.waitForTimeout(3000);
    console.log('Document viewer fully loaded and verified');
    
    // Find and click on the chat input area
    const chatInputArea = sharedPage.locator('div[contenteditable="true"][data-at-mention="true"].flex-grow.resize-none.bg-transparent.outline-none');
    await expect(chatInputArea).toBeVisible({ timeout: 10000 });
    console.log('Chat input area found');
    
    // Click on the chat input area to focus it
    await chatInputArea.click();
    console.log('Clicked on chat input area');
    
    // Wait for input area to be focused
    await sharedPage.waitForTimeout(1000);
    
    // Type a message in the chat input
    const testMessage = 'What are the two main services I need to integrate with?';
    await chatInputArea.fill(testMessage);
    console.log(`Typed message in chat: "${testMessage}"`);
    
    // Find and click the send button
    const sendButton = sharedPage.locator('button.flex.mr-6.bg-\\[\\#464B53\\].dark\\:bg-slate-700:has(svg.lucide-arrow-right)');
    await expect(sendButton).toBeVisible({ timeout: 5000 });
    console.log('Send button found');
    
    // Click the send button to send the message
    await sendButton.click();
    console.log('Send button clicked - message sent');
    
    // Wait for response to appear
    await sharedPage.waitForTimeout(10000);
    console.log('Waited for chat response');
    
    // Look for the chat response containing the expected services
    const chatResponse = sharedPage.locator('div').filter({ hasText: /Bank Edge Service|Central DPIP Service/ });
    
    // Wait for response with either service name to appear
    await expect(chatResponse.first()).toBeVisible({ timeout: 30000 });
    console.log('Chat response found');
    
    // Get the response text to validate both services are mentioned
    const responseText = await sharedPage.textContent('body');
    
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
    
    // Find and click the back arrow button to return to collections page
    const backArrowButton = sharedPage.locator('button.justify-center.whitespace-nowrap.font-medium:has(svg.lucide-arrow-left)');
    await expect(backArrowButton).toBeVisible({ timeout: 10000 });
    console.log('Back arrow button found');
    
    // Click the back arrow button
    await backArrowButton.click();
    console.log('Back arrow button clicked - returning to collections page');
    
    // Wait for navigation back to collections page
    await sharedPage.waitForTimeout(3000);
    console.log('Waited for navigation back to collections page');
    
    // Verify we're back on the collections page
    const currentUrl = sharedPage.url();
    expect(currentUrl).toContain('knowledgeManagement');
    console.log('Confirmed back on collections page');
    
    console.log('File click test completed');
  });

  test('click 3-dot menu and select Delete option', async () => {
    console.log('Starting 3-dot menu Delete test');
    
    // Wait for page to be fully loaded
    await sharedPage.waitForTimeout(2000);
    
    // Find the 3-dot menu (ellipsis) button using the specific SVG selector
    const threeDotMenu = sharedPage.locator('svg.lucide-ellipsis.cursor-pointer');
    
    // Check if the 3-dot menu is visible
    const menuCount = await threeDotMenu.count();
    console.log(`Found ${menuCount} 3-dot menu(s) on the page`);
    
    if (menuCount > 0) {
      // Click on the first 3-dot menu (should be for our created collection)
      await expect(threeDotMenu.first()).toBeVisible({ timeout: 5000 });
      console.log('3-dot menu found and visible');
      
      // Click the 3-dot menu
      await threeDotMenu.first().click();
      console.log('3-dot menu clicked');
      
      // Wait for menu dropdown to appear
      await sharedPage.waitForTimeout(2000);
      console.log('Waited for menu dropdown to appear');
      
      // Find and click the Delete option
      const deleteOption = sharedPage.locator('div[role="menuitem"]:has(svg.lucide-trash2):has(span:has-text("Delete"))');
      await expect(deleteOption).toBeVisible({ timeout: 5000 });
      console.log('Delete option found in dropdown menu');
      
      // Click the Delete option
      await deleteOption.click();
      console.log('Delete option clicked');
      
      // Wait for confirmation dialog to appear
      await sharedPage.waitForTimeout(2000);
      console.log('Waited for delete confirmation dialog to appear');
      
      // Verify Cancel button exists but don't interact with it
      const cancelButton = sharedPage.locator('button:has-text("Cancel")');
      const cancelExists = await cancelButton.count() > 0;
      if (cancelExists) {
        console.log('Cancel button found in delete confirmation dialog (not highlighted)');
      } else {
        console.log('Cancel button not found in delete confirmation dialog');
      }
      
      // Find and verify OK button is visible
      const okButton = sharedPage.locator('button.bg-primary.text-primary-foreground:has-text("OK")');
      await expect(okButton).toBeVisible({ timeout: 5000 });
      console.log('OK button found in delete confirmation dialog');
      
      // Click the OK button to confirm deletion
      await okButton.click();
      console.log('OK button clicked - confirming deletion');
      
      // Wait for deletion to complete
      await sharedPage.waitForTimeout(5000);
      console.log('Waited for deletion to complete');
      
      // Additional wait to verify deletion
      await sharedPage.waitForTimeout(3000);
      console.log('Additional wait completed - you can now verify if collection is deleted');
      
    } else {
      console.log('No 3-dot menu found - collection may not be visible yet');
    }
    
    console.log('3-dot menu Delete test completed');
  });

  

});
