import { test, testHighest, testHigh, expect } from '@/framework/core/test-fixtures';
import { LoginHelper } from '@/framework/pages/login-helper';
import { CollectionModulePage } from '@/framework/pages/collection-module-page';

// Configure tests to run sequentially and share browser context
test.describe.configure({ mode: 'serial' });

test.describe('Collection Module Tests', () => {
  let sharedPage: any;
  let collectionPage: CollectionModulePage;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    sharedPage = await context.newPage();
    collectionPage = new CollectionModulePage(sharedPage);
  });

  testHighest('user login', {
    tags: ['@critical', '@auth', '@collection'],
    description: 'Authenticate user for collection module access'
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

  testHigh('navigate to collections page via sidebar icon', {
    tags: ['@navigation', '@sidebar', '@collection'],
    description: 'Navigate to collections page using sidebar collections icon'
  }, async () => {
    console.log('Starting navigation to collections page test');
    
    await collectionPage.navigateToCollectionsPage();
    
    console.log('Navigation to collections page completed successfully');
  });

  testHigh('verify collections page elements', {
    tags: ['@ui', '@verification', '@collection'],
    description: 'Verify all main elements are present on collections page'
  }, async () => {
    console.log('Starting collections page elements verification test');
    
    await collectionPage.verifyCollectionsPageElements();
    
    console.log('Collections page elements verification completed');
  });

  testHigh('verify collections sidebar navigation is highlighted', {
    tags: ['@ui', '@sidebar', '@navigation'],
    description: 'Verify collections icon is highlighted when on collections page'
  }, async () => {
    console.log('Starting collections sidebar highlight verification test');
    
    await collectionPage.verifyCollectionsSidebarHighlight();
    
    console.log('Collections sidebar highlight verification completed');
  });

  testHigh('click new collection button and verify modal opens', {
    tags: ['@ui', '@modal', '@collection'],
    description: 'Click NEW COLLECTION button and verify modal opens with all elements'
  }, async () => {
    console.log('Starting new collection button click test');
    
    await collectionPage.clickNewCollectionButton();
    await collectionPage.verifyCreateCollectionModal();
    
    console.log('New collection button click and modal verification completed');
  });

  testHigh('add collection title', {
    tags: ['@ui', '@input', '@collection'],
    description: 'Add a collection title in the modal input field'
  }, async () => {
    console.log('Starting collection title addition test');
    
    const collectionTitle = await collectionPage.addCollectionTitle();
    console.log(`Collection title "${collectionTitle}" added successfully`);
    
    console.log('Collection title addition test completed');
  });

  testHigh('select file and upload', {
    tags: ['@ui', '@upload', '@file'],
    description: 'Select a file and upload it to the collection'
  }, async () => {
    console.log('Starting file selection and upload test');
    
    await collectionPage.selectFileAndUpload();
    
    console.log('File selection and upload test completed');
  });

  testHigh('refresh page and verify collection', {
    tags: ['@ui', '@verification', '@persistence'],
    description: 'Refresh page and verify the uploaded collection persists'
  }, async () => {
    console.log('Starting page refresh test');
    
    await collectionPage.refreshPageAndVerifyCollection();
    
    console.log('Page refresh test completed');
  });

  testHigh('click 3-dot menu and select Edit option', {
    tags: ['@ui', '@menu', '@edit'],
    description: 'Click 3-dot menu and select Edit option to modify collection name'
  }, async () => {
    console.log('Starting 3-dot menu Edit test');
    
    const updatedTitle = await collectionPage.clickThreeDotMenuAndEdit();
    if (updatedTitle) {
      console.log(`Collection successfully updated to: "${updatedTitle}"`);
    }
    
    console.log('3-dot menu Edit test completed');
  });

  testHigh('click on uploaded file to open document viewer', {
    tags: ['@ui', '@document', '@chat'],
    description: 'Click on uploaded file to open document viewer and interact with chat'
  }, async () => {
    console.log('Starting file click test');
    
    await collectionPage.clickUploadedFileAndInteract();
    
    console.log('File click test completed');
  });

  testHigh('click 3-dot menu and select Delete option', {
    tags: ['@ui', '@menu', '@delete'],
    description: 'Click 3-dot menu and select Delete option to remove collection'
  }, async () => {
    console.log('Starting 3-dot menu Delete test');
    
    await collectionPage.clickThreeDotMenuAndDelete();
    
    console.log('3-dot menu Delete test completed');
  });

});
