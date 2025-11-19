/**
 * Chat Module Test - Using Test Orchestrator with Page Object Model
 */

import { TestOrchestrator } from '@/framework/utils/test-orchestrator';
import { step } from '@/framework/utils/step-tracker';
import { LoginHelper } from '@/framework/pages/xyne/login-helper';
import { ChatModulePage } from '@/framework/pages/xyne/chat-module-page';

const orchestrator = new TestOrchestrator({
  useSharedPage: true,
  continueOnFailure: true,
  sequential: true,
  logLevel: 'detailed'
});

orchestrator.createSuite('Chat Module Tests', [
  {
    name: 'user login',
    metadata: { priority: 'highest', tags: ['@critical', '@auth', '@chat'] },
    testFunction: async ({ sharedPage }) => {
      const { page } = sharedPage;

      await step('Starting login test', async () => {
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
    name: 'verify chat page elements',
    dependencies: ['user login'],
    metadata: { priority: 'high', tags: ['@core', '@chat', '@ui'] },
    testFunction: async ({ sharedPage }) => {
      const chatPage = new ChatModulePage(sharedPage.page);

      await step('Verify chat page elements', async () => {
        await chatPage.verifyChatPageElements();
      });
    }
  },

  {
    name: 'verify models API and dropdown integration',
    dependencies: ['verify chat page elements'],
    metadata: { priority: 'high', tags: ['@core', '@chat', '@api', '@models'] },
    testFunction: async ({ sharedPage }) => {
      const chatPage = new ChatModulePage(sharedPage.page);

      await step('Verify models API and dropdown integration', async () => {
        await chatPage.verifyModelsAPIAndDropdown();
      });
    }
  },

  {
    name: 'verify search functionality',
    dependencies: ['verify chat page elements'],
    metadata: { priority: 'high', tags: ['@core', '@chat', '@search'] },
    testFunction: async ({ sharedPage }) => {
      const chatPage = new ChatModulePage(sharedPage.page);

      await step('Verify search functionality', async () => {
        await chatPage.verifySearchFunctionality();
      });
    }
  },

  {
    name: 'verify able to send messages to chat',
    dependencies: ['verify search functionality'],
    metadata: { priority: 'high', tags: ['@core', '@chat', '@messaging'] },
    testFunction: async ({ sharedPage }) => {
      const chatPage = new ChatModulePage(sharedPage.page);

      await step('Send message and wait for response', async () => {
        await chatPage.sendMessageAndWaitForResponse();
      });
    }
  },

  {
    name: 'verify chat header icons',
    dependencies: ['verify able to send messages to chat'],
    metadata: { priority: 'high', tags: ['@core', '@chat', '@ui', '@header'] },
    testFunction: async ({ sharedPage }) => {
      const chatPage = new ChatModulePage(sharedPage.page);

      await step('Verify chat header icons', async () => {
        await chatPage.verifyChatHeaderIcons();
      });
    }
  },

  {
    name: 'verify if reply comes and feedback buttons are there',
    dependencies: ['verify chat header icons'],
    metadata: { priority: 'high', tags: ['@core', '@chat', '@feedback', '@ai-response'] },
    testFunction: async ({ sharedPage }) => {
      const chatPage = new ChatModulePage(sharedPage.page);

      await step('Verify AI reply and feedback buttons', async () => {
        await chatPage.verifyAIReplyAndFeedbackButtons();
      });
    }
  },

  {
    name: 'verify pencil icon functionality - edit chat title',
    dependencies: ['verify if reply comes and feedback buttons are there'],
    metadata: { priority: 'high', tags: ['@core', '@chat', '@edit', '@title'] },
    testFunction: async ({ sharedPage }) => {
      const chatPage = new ChatModulePage(sharedPage.page);

      await step('Edit chat title using pencil icon', async () => {
        await chatPage.editChatTitle();
      });
    }
  },

  {
    name: 'verify file upload functionality - PDF file',
    dependencies: ['verify pencil icon functionality - edit chat title'],
    metadata: { priority: 'high', tags: ['@core', '@chat', '@upload', '@pdf'] },
    testFunction: async ({ sharedPage }) => {
      const chatPage = new ChatModulePage(sharedPage.page);

      const uploadResult = await step('Upload PDF file and verify API response', async () => {
        const pdfPath = 'props/Solar-System-PDF.pdf';
        return await chatPage.uploadFileAndVerifyAPI(pdfPath, {
          uploadApiEndpoint: '/api/v1/files/upload-attachment',
          timeout: 30000,
          expectedStatusCode: 200,
          requiredKeys: ['fileId', 'fileName', 'fileSize']
        });
      });

      await step('Validate PDF upload result', async () => {
        console.log('PDF Upload Result:', uploadResult);
        if (uploadResult.fileName !== 'Solar-System-PDF.pdf') {
          throw new Error(`Expected fileName to be 'Solar-System-PDF.pdf', got '${uploadResult.fileName}'`);
        }
        if (!uploadResult.uploadResponse) {
          throw new Error('Upload response should be truthy');
        }
      });

      const chatResult = await step('Send message with uploaded PDF and verify chat API', async () => {
        return await chatPage.sendMessageWithUploadedFile(
          'Please analyze this PDF document and provide a summary.',
          {
            chatApiEndpoint: '/api/v1/chat',
            timeout: 60000,
            expectedStatusCode: 200,
            requiredKeys: ['chat', 'messages']
          }
        );
      });

      await step('Validate chat with PDF result', async () => {
        console.log('Chat with PDF Result:', chatResult);
        if (!chatResult) {
          throw new Error('Chat result should be truthy');
        }
      });
    }
  },

  {
    name: 'verify file upload functionality - TXT file',
    dependencies: ['verify file upload functionality - PDF file'],
    metadata: { priority: 'high', tags: ['@core', '@chat', '@upload', '@txt'] },
    testFunction: async ({ sharedPage }) => {
      const chatPage = new ChatModulePage(sharedPage.page);

      const uploadResult = await step('Upload TXT file and verify API response', async () => {
        const txtPath = 'documents/test-file.txt';
        return await chatPage.uploadFileAndVerifyAPI(txtPath, {
          uploadApiEndpoint: '/api/v1/files/upload-attachment',
          timeout: 30000,
          expectedStatusCode: 200,
          requiredKeys: ['fileId', 'fileName', 'fileSize']
        });
      });

      await step('Validate TXT upload result', async () => {
        console.log('TXT Upload Result:', uploadResult);
        if (uploadResult.fileName !== 'test-file.txt') {
          throw new Error(`Expected fileName to be 'test-file.txt', got '${uploadResult.fileName}'`);
        }
        if (!uploadResult.uploadResponse) {
          throw new Error('Upload response should be truthy');
        }
      });

      const chatResult = await step('Send message with uploaded TXT and verify chat API', async () => {
        return await chatPage.sendMessageWithUploadedFile(
          'Please read this text file and summarize its contents.',
          {
            chatApiEndpoint: '/api/v1/chat',
            timeout: 60000,
            expectedStatusCode: 200,
            requiredKeys: ['chat', 'messages']
          }
        );
      });

      await step('Validate chat with TXT result', async () => {
        console.log('Chat with TXT Result:', chatResult);
        if (!chatResult) {
          throw new Error('Chat result should be truthy');
        }
      });
    }
  },

  {
    name: 'verify file upload functionality - MD file',
    dependencies: ['verify file upload functionality - TXT file'],
    metadata: { priority: 'high', tags: ['@core', '@chat', '@upload', '@markdown'] },
    testFunction: async ({ sharedPage }) => {
      const chatPage = new ChatModulePage(sharedPage.page);

      const uploadResult = await step('Upload MD file and verify API response', async () => {
        const mdPath = 'documents/test-file.md';
        return await chatPage.uploadFileAndVerifyAPI(mdPath, {
          uploadApiEndpoint: '/api/v1/files/upload-attachment',
          timeout: 30000,
          expectedStatusCode: 200,
          requiredKeys: ['fileId', 'fileName', 'fileSize']
        });
      });

      await step('Validate MD upload result', async () => {
        console.log('MD Upload Result:', uploadResult);
        if (uploadResult.fileName !== 'test-file.md') {
          throw new Error(`Expected fileName to be 'test-file.md', got '${uploadResult.fileName}'`);
        }
        if (!uploadResult.uploadResponse) {
          throw new Error('Upload response should be truthy');
        }
      });

      const chatResult = await step('Send message with uploaded MD and verify chat API', async () => {
        return await chatPage.sendMessageWithUploadedFile(
          'Please parse this markdown file and explain its structure.',
          {
            chatApiEndpoint: '/api/v1/chat',
            timeout: 60000,
            expectedStatusCode: 200,
            requiredKeys: ['chat', 'messages']
          }
        );
      });

      await step('Validate chat with MD result', async () => {
        console.log('Chat with MD Result:', chatResult);
        if (!chatResult) {
          throw new Error('Chat result should be truthy');
        }
      });
    }
  },

  {
    name: 'verify file upload functionality - DOCX file',
    dependencies: ['verify file upload functionality - MD file'],
    metadata: { priority: 'high', tags: ['@core', '@chat', '@upload', '@docx'] },
    testFunction: async ({ sharedPage }) => {
      const chatPage = new ChatModulePage(sharedPage.page);

      const uploadResult = await step('Upload DOCX file and verify API response', async () => {
        const docxPath = 'documents/Data Enrichment.docx';
        return await chatPage.uploadFileAndVerifyAPI(docxPath, {
          uploadApiEndpoint: '/api/v1/files/upload-attachment',
          timeout: 30000,
          expectedStatusCode: 200,
          requiredKeys: ['fileId', 'fileName', 'fileSize']
        });
      });

      await step('Validate DOCX upload result', async () => {
        console.log('DOCX Upload Result:', uploadResult);
        if (uploadResult.fileName !== 'Data Enrichment.docx') {
          throw new Error(`Expected fileName to be 'Data Enrichment.docx', got '${uploadResult.fileName}'`);
        }
        if (!uploadResult.uploadResponse) {
          throw new Error('Upload response should be truthy');
        }
      });

      const chatResult = await step('Send message with uploaded DOCX and verify chat API', async () => {
        return await chatPage.sendMessageWithUploadedFile(
          'Please extract and analyze the content from this Word document.',
          {
            chatApiEndpoint: '/api/v1/chat',
            timeout: 60000,
            expectedStatusCode: 200,
            requiredKeys: ['chat', 'messages']
          }
        );
      });

      await step('Validate chat with DOCX result', async () => {
        console.log('Chat with DOCX Result:', chatResult);
        if (!chatResult) {
          throw new Error('Chat result should be truthy');
        }
      });
    }
  },

  {
    name: 'verify file upload functionality - CSV file',
    dependencies: ['verify file upload functionality - DOCX file'],
    metadata: { priority: 'high', tags: ['@core', '@chat', '@upload', '@csv'] },
    testFunction: async ({ sharedPage }) => {
      const chatPage = new ChatModulePage(sharedPage.page);

      const uploadResult = await step('Upload CSV file and verify API response', async () => {
        const csvPath = 'documents/test-file.csv';
        return await chatPage.uploadFileAndVerifyAPI(csvPath, {
          uploadApiEndpoint: '/api/v1/files/upload-attachment',
          timeout: 30000,
          expectedStatusCode: 200,
          requiredKeys: ['fileId', 'fileName', 'fileSize']
        });
      });

      await step('Validate CSV upload result', async () => {
        console.log('CSV Upload Result:', uploadResult);
        if (uploadResult.fileName !== 'test-file.csv') {
          throw new Error(`Expected fileName to be 'test-file.csv', got '${uploadResult.fileName}'`);
        }
        if (!uploadResult.uploadResponse) {
          throw new Error('Upload response should be truthy');
        }
      });

      const chatResult = await step('Send message with uploaded CSV and verify chat API', async () => {
        return await chatPage.sendMessageWithUploadedFile(
          'Please analyze this CSV data and provide insights about the employee information.',
          {
            chatApiEndpoint: '/api/v1/chat',
            timeout: 60000,
            expectedStatusCode: 200,
            requiredKeys: ['chat', 'messages']
          }
        );
      });

      await step('Validate chat with CSV result', async () => {
        console.log('Chat with CSV Result:', chatResult);
        if (!chatResult) {
          throw new Error('Chat result should be truthy');
        }
      });
    }
  }
]);
