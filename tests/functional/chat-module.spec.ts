/**
 * Chat Module Test - Using priority and dependency management with Page Object Model
 */

import { test, testHighest, testHigh, expect } from '@/framework/core/test-fixtures';
import { LoginHelper } from '@/framework/pages/login-helper';
import { ChatModulePage } from '@/framework/pages/chat-module-page';

// Configure tests to run sequentially and share browser context
test.describe.configure({ mode: 'serial' });

test.describe('Chat Module Tests', () => {
  
  testHighest('user login', {
    tags: ['@critical', '@auth', '@chat'],
    description: 'Authenticate user for chat module access'
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

  testHigh('verify chat page elements', {
    dependsOn: ['user login'],
    tags: ['@core', '@chat', '@ui'],
    description: 'Verify all chat page UI elements are present and visible'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Use the page object method to verify chat page elements
    await chatPage.verifyChatPageElements();
  });

  testHigh('verify models API and dropdown integration', {
    dependsOn: ['verify chat page elements'],
    tags: ['@core', '@chat', '@api', '@models'],
    description: 'Verify models API response and check if model names are reflected in dropdown'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Use the page object method to verify models API and dropdown
    await chatPage.verifyModelsAPIAndDropdown();
  });

  testHigh('verify search functionality', {
    dependsOn: ['verify chat page elements'],
    tags: ['@core', '@chat', '@search'],
    description: 'Verify search functionality and interface elements'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Use the page object method to verify search functionality
    await chatPage.verifySearchFunctionality();
  });

  testHigh('verify able to send messages to chat', {
    dependsOn: ['verify search functionality'],
    tags: ['@core', '@chat', '@messaging'],
    description: 'Verify ability to send messages in chat interface'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Use the page object method to send a message to chat
    await chatPage.sendMessageAndWaitForResponse();
  });

  testHigh('verify chat header icons', {
    dependsOn: ['verify able to send messages to chat'],
    tags: ['@core', '@chat', '@ui', '@header'],
    description: 'Verify all chat header icons are present and functional'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Use the page object method to verify chat header icons
    await chatPage.verifyChatHeaderIcons();
  });

  testHigh('verify if reply comes and feedback buttons are there', {
    dependsOn: ['verify chat header icons'],
    tags: ['@core', '@chat', '@feedback', '@ai-response'],
    description: 'Verify AI reply appears with proper feedback buttons'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Use the page object method to verify AI reply and feedback buttons
    await chatPage.verifyAIReplyAndFeedbackButtons();
  });

  testHigh('verify pencil icon functionality - edit chat title', {
    dependsOn: ['verify if reply comes and feedback buttons are there'],
    tags: ['@core', '@chat', '@edit', '@title'],
    description: 'Verify pencil icon functionality for editing chat title'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Use the page object method to edit chat title
    await chatPage.editChatTitle();
  });

  testHigh('verify file upload functionality - PDF file', {
    dependsOn: ['verify pencil icon functionality - edit chat title'],
    tags: ['@core', '@chat', '@upload', '@pdf'],
    description: 'Verify PDF file upload functionality and API response'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Upload PDF file and verify API response
    const pdfPath = 'props/Solar-System-PDF.pdf';
    const uploadResult = await chatPage.uploadFileAndVerifyAPI(pdfPath, {
      uploadApiEndpoint: '/api/v1/files/upload-attachment',
      timeout: 30000,
      expectedStatusCode: 200,
      requiredKeys: ['fileId', 'fileName', 'fileSize']
    });
    
    console.log('📋 PDF Upload Result:', uploadResult);
    expect(uploadResult.fileName).toBe('Solar-System-PDF.pdf');
    expect(uploadResult.uploadResponse).toBeTruthy();
    
    // Send message with uploaded PDF and verify chat API response
    const chatResult = await chatPage.sendMessageWithUploadedFile(
      'Please analyze this PDF document and provide a summary.',
      {
        chatApiEndpoint: '/api/v1/chat',
        timeout: 60000,
        expectedStatusCode: 200,
        requiredKeys: ['chat', 'messages']
      }
    );
    
    console.log('📋 Chat with PDF Result:', chatResult);
    expect(chatResult).toBeTruthy();
  });

  testHigh('verify file upload functionality - TXT file', {
    dependsOn: ['verify file upload functionality - PDF file'],
    tags: ['@core', '@chat', '@upload', '@txt'],
    description: 'Verify TXT file upload functionality and API response'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Upload TXT file and verify API response
    const txtPath = 'documents/test-file.txt';
    const uploadResult = await chatPage.uploadFileAndVerifyAPI(txtPath, {
      uploadApiEndpoint: '/api/v1/files/upload-attachment',
      timeout: 30000,
      expectedStatusCode: 200,
      requiredKeys: ['fileId', 'fileName', 'fileSize']
    });
    
    console.log('📋 TXT Upload Result:', uploadResult);
    expect(uploadResult.fileName).toBe('test-file.txt');
    expect(uploadResult.uploadResponse).toBeTruthy();
    
    // Send message with uploaded TXT and verify chat API response
    const chatResult = await chatPage.sendMessageWithUploadedFile(
      'Please read this text file and summarize its contents.',
      {
        chatApiEndpoint: '/api/v1/chat',
        timeout: 60000,
        expectedStatusCode: 200,
        requiredKeys: ['chat', 'messages']
      }
    );
    
    console.log('📋 Chat with TXT Result:', chatResult);
    expect(chatResult).toBeTruthy();
  });

  testHigh('verify file upload functionality - MD file', {
    dependsOn: ['verify file upload functionality - TXT file'],
    tags: ['@core', '@chat', '@upload', '@markdown'],
    description: 'Verify Markdown file upload functionality and API response'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Upload MD file and verify API response
    const mdPath = 'documents/test-file.md';
    const uploadResult = await chatPage.uploadFileAndVerifyAPI(mdPath, {
      uploadApiEndpoint: '/api/v1/files/upload-attachment',
      timeout: 30000,
      expectedStatusCode: 200,
      requiredKeys: ['fileId', 'fileName', 'fileSize']
    });
    
    console.log('📋 MD Upload Result:', uploadResult);
    expect(uploadResult.fileName).toBe('test-file.md');
    expect(uploadResult.uploadResponse).toBeTruthy();
    
    // Send message with uploaded MD and verify chat API response
    const chatResult = await chatPage.sendMessageWithUploadedFile(
      'Please parse this markdown file and explain its structure.',
      {
        chatApiEndpoint: '/api/v1/chat',
        timeout: 60000,
        expectedStatusCode: 200,
        requiredKeys: ['chat', 'messages']
      }
    );
    
    console.log('📋 Chat with MD Result:', chatResult);
    expect(chatResult).toBeTruthy();
  });

  testHigh('verify file upload functionality - DOCX file', {
    dependsOn: ['verify file upload functionality - MD file'],
    tags: ['@core', '@chat', '@upload', '@docx'],
    description: 'Verify DOCX file upload functionality and API response'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Upload DOCX file and verify API response
    const docxPath = 'documents/Data Enrichment.docx';
    const uploadResult = await chatPage.uploadFileAndVerifyAPI(docxPath, {
      uploadApiEndpoint: '/api/v1/files/upload-attachment',
      timeout: 30000,
      expectedStatusCode: 200,
      requiredKeys: ['fileId', 'fileName', 'fileSize']
    });
    
    console.log('📋 DOCX Upload Result:', uploadResult);
    expect(uploadResult.fileName).toBe('Data Enrichment.docx');
    expect(uploadResult.uploadResponse).toBeTruthy();
    
    // Send message with uploaded DOCX and verify chat API response
    const chatResult = await chatPage.sendMessageWithUploadedFile(
      'Please extract and analyze the content from this Word document.',
      {
        chatApiEndpoint: '/api/v1/chat',
        timeout: 60000,
        expectedStatusCode: 200,
        requiredKeys: ['chat', 'messages']
      }
    );
    
    console.log('📋 Chat with DOCX Result:', chatResult);
    expect(chatResult).toBeTruthy();
  });

  testHigh('verify file upload functionality - CSV file', {
    dependsOn: ['verify file upload functionality - DOCX file'],
    tags: ['@core', '@chat', '@upload', '@csv'],
    description: 'Verify CSV file upload functionality and API response'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const chatPage = new ChatModulePage(page);
    
    // Upload CSV file and verify API response
    const csvPath = 'documents/test-file.csv';
    const uploadResult = await chatPage.uploadFileAndVerifyAPI(csvPath, {
      uploadApiEndpoint: '/api/v1/files/upload-attachment',
      timeout: 30000,
      expectedStatusCode: 200,
      requiredKeys: ['fileId', 'fileName', 'fileSize']
    });
    
    console.log('📋 CSV Upload Result:', uploadResult);
    expect(uploadResult.fileName).toBe('test-file.csv');
    expect(uploadResult.uploadResponse).toBeTruthy();
    
    // Send message with uploaded CSV and verify chat API response
    const chatResult = await chatPage.sendMessageWithUploadedFile(
      'Please analyze this CSV data and provide insights about the employee information.',
      {
        chatApiEndpoint: '/api/v1/chat',
        timeout: 60000,
        expectedStatusCode: 200,
        requiredKeys: ['chat', 'messages']
      }
    );
    
    console.log('📋 Chat with CSV Result:', chatResult);
    expect(chatResult).toBeTruthy();
  });
  
});
