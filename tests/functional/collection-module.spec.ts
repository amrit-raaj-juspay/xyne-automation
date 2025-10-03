import { test, testHighest, testHigh, expect } from '@/framework/core/test-fixtures';
import { LoginHelper } from '@/framework/pages/login-helper';
import { CollectionModulePage } from '@/framework/pages/collection-module-page';

// Configure tests to run sequentially and share browser context
test.describe.configure({ mode: 'serial' });

test.describe('Collection Module Tests', () => {
  
  testHighest('user login', {
    tags: ['@critical', '@auth', '@collection'],
    description: 'Authenticate user for collection module access'
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

  testHigh('navigate to collections page via sidebar icon', {
    dependsOn: ['user login'],
    tags: ['@navigation', '@sidebar', '@collection'],
    description: 'Navigate to collections page using sidebar collections icon'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const collectionPage = new CollectionModulePage(page);
    
    console.log('Starting navigation to collections page test');
    
    await collectionPage.navigateToCollectionsPage();
    
    console.log('Navigation to collections page completed successfully');
  });

  testHigh('verify collections page elements', {
    dependsOn: ['navigate to collections page via sidebar icon'],
    tags: ['@ui', '@verification', '@collection'],
    description: 'Verify all main elements are present on collections page'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const collectionPage = new CollectionModulePage(page);
    
    console.log('Starting collections page elements verification test');
    
    await collectionPage.verifyCollectionsPageElements();
    
    console.log('Collections page elements verification completed');
  });

  testHigh('verify collections sidebar navigation is highlighted', {
    dependsOn: ['verify collections page elements'],
    tags: ['@ui', '@sidebar', '@navigation'],
    description: 'Verify collections icon is highlighted when on collections page'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const collectionPage = new CollectionModulePage(page);
    
    console.log('Starting collections sidebar highlight verification test');
    
    await collectionPage.verifyCollectionsSidebarHighlight();
    
    console.log('Collections sidebar highlight verification completed');
  });

  testHigh('click new collection button and verify modal opens', {
    dependsOn: ['verify collections sidebar navigation is highlighted'],
    tags: ['@ui', '@modal', '@collection'],
    description: 'Click NEW COLLECTION button and verify modal opens with all elements'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const collectionPage = new CollectionModulePage(page);
    
    console.log('Starting new collection button click test');
    
    await collectionPage.clickNewCollectionButton();
    await collectionPage.verifyCreateCollectionModal();
    
    console.log('New collection button click and modal verification completed');
  });

  testHigh('add collection title', {
    dependsOn: ['click new collection button and verify modal opens'],
    tags: ['@ui', '@input', '@collection'],
    description: 'Add a collection title in the modal input field'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const collectionPage = new CollectionModulePage(page);
    
    console.log('Starting collection title addition test');
    
    const collectionTitle = await collectionPage.addCollectionTitle();
    console.log(`Collection title "${collectionTitle}" added successfully`);
    
    console.log('Collection title addition test completed');
  });

  testHigh('select file and upload', {
    dependsOn: ['add collection title'],
    tags: ['@ui', '@upload', '@file'],
    description: 'Select a file and upload it to the collection'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const collectionPage = new CollectionModulePage(page);
    
    console.log('Starting file selection and upload test');
    
    await collectionPage.selectFileAndUpload();
    
    console.log('File selection and upload test completed');
  });

  testHigh('refresh page and verify collection', {
    dependsOn: ['select file and upload'],
    tags: ['@ui', '@verification', '@persistence'],
    description: 'Refresh page and verify the uploaded collection persists'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const collectionPage = new CollectionModulePage(page);
    
    console.log('Starting page refresh test');
    
    await collectionPage.refreshPageAndVerifyCollection();
    
    console.log('Page refresh test completed');
  });

  testHigh('click 3-dot menu and select Edit option', {
    dependsOn: ['refresh page and verify collection'],
    tags: ['@ui', '@menu', '@edit'],
    description: 'Click 3-dot menu and select Edit option to modify collection name'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const collectionPage = new CollectionModulePage(page);
    
    console.log('Starting 3-dot menu Edit test');
    
    const updatedTitle = await collectionPage.clickThreeDotMenuAndEdit();
    if (updatedTitle) {
      console.log(`Collection successfully updated to: "${updatedTitle}"`);
    }
    
    console.log('3-dot menu Edit test completed');
  });

  testHigh('click on uploaded file to open document viewer', {
    dependsOn: ['click 3-dot menu and select Edit option'],
    tags: ['@ui', '@document', '@navigation'],
    description: 'Click on uploaded file to open document viewer'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const collectionPage = new CollectionModulePage(page);
    
    console.log('Starting file click test');
    
    // Wait for page to be fully loaded
    await page.waitForTimeout(2000);
    
    // Find and click on the uploaded file
    const uploadedFileRow = page.locator('div.col-span-5.flex.items-center.hover\\:cursor-pointer:has(span:has-text("Data Enrichment.docx"))').first();
    await expect(uploadedFileRow).toBeVisible({ timeout: 10000 });
    console.log('Uploaded file row "Data Enrichment.docx" found');
    
    // Click on the file row to open document viewer
    await uploadedFileRow.click();
    console.log('Clicked on "Data Enrichment.docx" file');
    
    // Wait for document viewer to load
    await page.waitForTimeout(5000);
    console.log('Waited for document viewer to load');
    
    // Verify document viewer opened
    await collectionPage.verifyDocumentViewer();
    
    console.log('Document viewer opened successfully - staying on this page for chat validation');
  });

  testHigh('validate chat response for required services', {
    dependsOn: ['click on uploaded file to open document viewer'],
    tags: ['@chat', '@validation', '@critical'],
    description: 'Interact with chat and validate response contains required services'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const collectionPage = new CollectionModulePage(page);
    
    console.log('Starting chat validation test - already on document viewer page');
    
    // We're already on the document viewer page from the previous test
    // Just interact with chat and validate response (this can fail independently)
    await collectionPage.interactWithChat();
    
    console.log('Chat validation test completed');
  });

  testHigh('navigate back to collections page', {
    dependsOn: ['click on uploaded file to open document viewer'],
    tags: ['@navigation', '@ui', '@collections'],
    description: 'Navigate back to collections page from document viewer'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const collectionPage = new CollectionModulePage(page);
    
    console.log('Starting navigation back to collections page');
    
    // Navigate back to collections page (this ensures we're on the right page for subsequent tests)
    await collectionPage.navigateBackToCollections();
    
    console.log('Successfully navigated back to collections page');
  });

  testHigh('click + button', {
    dependsOn: ['navigate back to collections page'],
    tags: ['@ui', '@button', '@plus'],
    description: 'Click the + (plus) button on the page'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const collectionPage = new CollectionModulePage(page);
    
    console.log('Starting + button click test');
    
    await collectionPage.clickPlusButton();
    
    console.log('+ button click test completed');
  });

  testHigh('click X (cross) button', {
    dependsOn: ['click + button'],
    tags: ['@ui', '@button', '@cross'],
    description: 'Click the X (cross) button on the page'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const collectionPage = new CollectionModulePage(page);
    
    console.log('Starting X (cross) button click test');
    
    await collectionPage.clickCrossButton();
    
    console.log('X (cross) button click test completed');
  });

  testHigh('click + button again', {
    dependsOn: ['click X (cross) button'],
    tags: ['@ui', '@button', '@plus'],
    description: 'Click the + (plus) button again after clicking cross button'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const collectionPage = new CollectionModulePage(page);
    
    console.log('Starting + button click test (second time)');
    
    await collectionPage.clickPlusButton();
    
    console.log('+ button click test (second time) completed');
  });

  testHigh('select euler-team folder and upload', {
    dependsOn: ['click + button again'],
    tags: ['@ui', '@upload', '@folder'],
    description: 'Select euler-team folder and upload it to the collection'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const collectionPage = new CollectionModulePage(page);
    
    console.log('Starting euler-team folder selection and upload test');
    
    await collectionPage.selectScreeningFeedbackFileAndUpload();
    
    console.log('euler-team folder selection and upload test completed');
  });

  testHigh('click 3-dot menu and select Delete option', {
    dependsOn: ['select euler-team folder and upload'],
    tags: ['@ui', '@menu', '@delete'],
    description: 'Click 3-dot menu and select Delete option to remove collection'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const collectionPage = new CollectionModulePage(page);
    
    console.log('Starting 3-dot menu Delete test');
    
    await collectionPage.clickThreeDotMenuAndDelete();
    
    console.log('3-dot menu Delete test completed');
  });

});
