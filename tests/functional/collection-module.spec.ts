/**
 * Collection Module Test - Using Test Orchestrator with Page Object Model
 */

import { TestOrchestrator } from '@/framework/utils/test-orchestrator';
import { step } from '@/framework/utils/step-tracker';
import { LoginHelper } from '@/framework/pages/login-helper';
import { CollectionModulePage } from '@/framework/pages/collection-module-page';

const orchestrator = new TestOrchestrator({
  useSharedPage: true,
  continueOnFailure: true,
  sequential: true,
  logLevel: 'detailed'
});

orchestrator.createSuite('Collection Module Tests', [
  {
    name: 'user login',
    metadata: { priority: 'highest', tags: ['@critical', '@auth', '@collection'] },
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
    name: 'navigate to collections page via sidebar icon',
    dependencies: ['user login'],
    metadata: { priority: 'high', tags: ['@navigation', '@sidebar', '@collection'] },
    testFunction: async ({ sharedPage }) => {
      const collectionPage = new CollectionModulePage(sharedPage.page);

      await step('Starting navigation to collections page', async () => {
        console.log('Starting navigation to collections page test');
      });

      await step('Navigate to collections page', async () => {
        await collectionPage.navigateToCollectionsPage();
      });

      await step('Log completion', async () => {
        console.log('Navigation to collections page completed successfully');
      });
    }
  },

  {
    name: 'verify collections page elements',
    dependencies: ['navigate to collections page via sidebar icon'],
    metadata: { priority: 'high', tags: ['@ui', '@verification', '@collection'] },
    testFunction: async ({ sharedPage }) => {
      const collectionPage = new CollectionModulePage(sharedPage.page);

      await step('Starting collections page elements verification', async () => {
        console.log('Starting collections page elements verification test');
      });

      await step('Verify collections page elements', async () => {
        await collectionPage.verifyCollectionsPageElements();
      });

      await step('Log completion', async () => {
        console.log('Collections page elements verification completed');
      });
    }
  },

  {
    name: 'verify collections sidebar navigation is highlighted',
    dependencies: ['verify collections page elements'],
    metadata: { priority: 'high', tags: ['@ui', '@sidebar', '@navigation'] },
    testFunction: async ({ sharedPage }) => {
      const collectionPage = new CollectionModulePage(sharedPage.page);

      await step('Starting collections sidebar highlight verification', async () => {
        console.log('Starting collections sidebar highlight verification test');
      });

      await step('Verify collections sidebar highlight', async () => {
        await collectionPage.verifyCollectionsSidebarHighlight();
      });

      await step('Log completion', async () => {
        console.log('Collections sidebar highlight verification completed');
      });
    }
  },

  {
    name: 'click new collection button and verify modal opens',
    dependencies: ['verify collections sidebar navigation is highlighted'],
    metadata: { priority: 'high', tags: ['@ui', '@modal', '@collection'] },
    testFunction: async ({ sharedPage }) => {
      const collectionPage = new CollectionModulePage(sharedPage.page);

      await step('Starting new collection button click', async () => {
        console.log('Starting new collection button click test');
      });

      await step('Click new collection button', async () => {
        await collectionPage.clickNewCollectionButton();
      });

      await step('Verify create collection modal', async () => {
        await collectionPage.verifyCreateCollectionModal();
      });

      await step('Log completion', async () => {
        console.log('New collection button click and modal verification completed');
      });
    }
  },

  {
    name: 'add collection title',
    dependencies: ['click new collection button and verify modal opens'],
    metadata: { priority: 'high', tags: ['@ui', '@input', '@collection'] },
    testFunction: async ({ sharedPage }) => {
      const collectionPage = new CollectionModulePage(sharedPage.page);

      await step('Starting collection title addition', async () => {
        console.log('Starting collection title addition test');
      });

      const collectionTitle = await step('Add collection title', async () => {
        return await collectionPage.addCollectionTitle();
      });

      await step('Log completion', async () => {
        console.log(`Collection title "${collectionTitle}" added successfully`);
        console.log('Collection title addition test completed');
      });
    }
  },

  {
    name: 'select file and upload',
    dependencies: ['add collection title'],
    metadata: { priority: 'high', tags: ['@ui', '@upload', '@file'] },
    testFunction: async ({ sharedPage }) => {
      const collectionPage = new CollectionModulePage(sharedPage.page);

      await step('Starting file selection and upload', async () => {
        console.log('Starting file selection and upload test');
      });

      await step('Select file and upload', async () => {
        await collectionPage.selectFileAndUpload();
      });

      await step('Log completion', async () => {
        console.log('File selection and upload test completed');
      });
    }
  },

  {
    name: 'refresh page and verify collection',
    dependencies: ['select file and upload'],
    metadata: { priority: 'high', tags: ['@ui', '@verification', '@persistence'] },
    testFunction: async ({ sharedPage }) => {
      const collectionPage = new CollectionModulePage(sharedPage.page);

      await step('Starting page refresh', async () => {
        console.log('Starting page refresh test');
      });

      await step('Refresh page and verify collection', async () => {
        await collectionPage.refreshPageAndVerifyCollection();
      });

      await step('Log completion', async () => {
        console.log('Page refresh test completed');
      });
    }
  },

  {
    name: 'click 3-dot menu and select Edit option',
    dependencies: ['refresh page and verify collection'],
    metadata: { priority: 'high', tags: ['@ui', '@menu', '@edit'] },
    testFunction: async ({ sharedPage }) => {
      const collectionPage = new CollectionModulePage(sharedPage.page);

      await step('Starting 3-dot menu Edit', async () => {
        console.log('Starting 3-dot menu Edit test');
      });

      const updatedTitle = await step('Click 3-dot menu and edit', async () => {
        return await collectionPage.clickThreeDotMenuAndEdit();
      });

      await step('Log completion', async () => {
        if (updatedTitle) {
          console.log(`Collection successfully updated to: "${updatedTitle}"`);
        }
        console.log('3-dot menu Edit test completed');
      });
    }
  },

  {
    name: 'click on uploaded file to open document viewer',
    dependencies: ['refresh page and verify collection'],
    metadata: { priority: 'high', tags: ['@ui', '@document', '@navigation'] },
    testFunction: async ({ sharedPage }) => {
      const { page } = sharedPage;
      const collectionPage = new CollectionModulePage(page);

      await step('Starting file click test', async () => {
        console.log('Starting file click test');
      });

      await step('Wait for page to be fully loaded', async () => {
        await page.waitForTimeout(2000);
      });

      await step('Find and click uploaded file', async () => {
        const uploadedFileRow = page.locator('div.col-span-5.flex.items-center.hover\\:cursor-pointer:has(span:has-text("Data Enrichment.docx"))').first();
        const isVisible = await uploadedFileRow.isVisible({ timeout: 10000 });
        if (!isVisible) {
          throw new Error('Uploaded file row "Data Enrichment.docx" not found');
        }
        console.log('Uploaded file row "Data Enrichment.docx" found');

        await uploadedFileRow.click();
        console.log('Clicked on "Data Enrichment.docx" file');
      });

      await step('Wait for document viewer to load', async () => {
        await page.waitForTimeout(5000);
        console.log('Waited for document viewer to load');
      });

      await step('Verify document viewer opened', async () => {
        await collectionPage.verifyDocumentViewer();
      });

      await step('Log completion', async () => {
        console.log('Document viewer opened successfully - staying on this page for chat validation');
      });
    }
  },

  {
    name: 'validate chat response for required services',
    dependencies: ['click on uploaded file to open document viewer'],
    metadata: { priority: 'high', tags: ['@chat', '@validation', '@critical'] },
    testFunction: async ({ sharedPage }) => {
      const collectionPage = new CollectionModulePage(sharedPage.page);

      await step('Starting chat validation', async () => {
        console.log('Starting chat validation test - already on document viewer page');
      });

      await step('Interact with chat and validate', async () => {
        await collectionPage.interactWithChat();
      });

      await step('Log completion', async () => {
        console.log('Chat validation test completed');
      });
    }
  },

  {
    name: 'navigate back to collections page',
    dependencies: ['click on uploaded file to open document viewer'],
    metadata: { priority: 'high', tags: ['@navigation', '@ui', '@collections'] },
    testFunction: async ({ sharedPage }) => {
      const collectionPage = new CollectionModulePage(sharedPage.page);

      await step('Starting navigation back to collections', async () => {
        console.log('Starting navigation back to collections page');
      });

      await step('Navigate back to collections', async () => {
        await collectionPage.navigateBackToCollections();
      });

      await step('Log completion', async () => {
        console.log('Successfully navigated back to collections page');
      });
    }
  },

  {
    name: 'click + button',
    dependencies: ['navigate back to collections page'],
    metadata: { priority: 'high', tags: ['@ui', '@button', '@plus'] },
    testFunction: async ({ sharedPage }) => {
      const collectionPage = new CollectionModulePage(sharedPage.page);

      await step('Starting + button click', async () => {
        console.log('Starting + button click test');
      });

      await step('Click plus button', async () => {
        await collectionPage.clickPlusButton();
      });

      await step('Log completion', async () => {
        console.log('+ button click test completed');
      });
    }
  },

  {
    name: 'click X (cross) button',
    dependencies: ['click + button'],
    metadata: { priority: 'high', tags: ['@ui', '@button', '@cross'] },
    testFunction: async ({ sharedPage }) => {
      const collectionPage = new CollectionModulePage(sharedPage.page);

      await step('Starting X (cross) button click', async () => {
        console.log('Starting X (cross) button click test');
      });

      await step('Click cross button', async () => {
        await collectionPage.clickCrossButton();
      });

      await step('Log completion', async () => {
        console.log('X (cross) button click test completed');
      });
    }
  },

  {
    name: 'click + button again',
    dependencies: ['click X (cross) button'],
    metadata: { priority: 'high', tags: ['@ui', '@button', '@plus'] },
    testFunction: async ({ sharedPage }) => {
      const collectionPage = new CollectionModulePage(sharedPage.page);

      await step('Starting + button click (second time)', async () => {
        console.log('Starting + button click test (second time)');
      });

      await step('Click plus button', async () => {
        await collectionPage.clickPlusButton();
      });

      await step('Log completion', async () => {
        console.log('+ button click test (second time) completed');
      });
    }
  },

  {
    name: 'select euler-team folder and upload',
    dependencies: ['click + button again'],
    metadata: { priority: 'high', tags: ['@ui', '@upload', '@folder'] },
    testFunction: async ({ sharedPage }) => {
      const collectionPage = new CollectionModulePage(sharedPage.page);

      await step('Starting euler-team folder selection and upload', async () => {
        console.log('Starting euler-team folder selection and upload test');
      });

      await step('Select euler-team folder and upload', async () => {
        await collectionPage.selectEulerTeamFolderAndUpload();
      });

      await step('Log completion', async () => {
        console.log('euler-team folder selection and upload test completed');
      });
    }
  },

  {
    name: 'click chevron arrow to expand euler-team folder',
    dependencies: ['select euler-team folder and upload'],
    metadata: { priority: 'high', tags: ['@ui', '@folder', '@expand'] },
    testFunction: async ({ sharedPage }) => {
      await step('Click chevron arrow to expand euler-team folder', async () => {
        const collectionPage = new CollectionModulePage(sharedPage.page);
        await collectionPage.clickChevronToExpandFolder();
      });
    }
  },

  {
    name: 'click chevron- down arrow to collapse euler-team folder',
    dependencies: ['click chevron arrow to expand euler-team folder'],
    metadata: { priority: 'high', tags: ['@ui', '@folder', '@collapse'] },
    testFunction: async ({ sharedPage }) => {
      await step('Click chevron-down arrow to collapse euler-team folder', async () => {
        const collectionPage = new CollectionModulePage(sharedPage.page);
        await collectionPage.clickChevronToCollapseFolder();
      });
    }
  },

  {
    name: 'click collection chevron-down arrow to collapse collection',
    dependencies: ['refresh page and verify collection'],
    metadata: { priority: 'high', tags: ['@ui', '@collection', '@collapse'] },
    testFunction: async ({ sharedPage }) => {
      await step('Click collection chevron-down arrow to collapse collection', async () => {
        const collectionPage = new CollectionModulePage(sharedPage.page);
        await collectionPage.clickCollectionChevronToCollapse();
      });
    }
  },

  {
    name: 'click collection chevron-right arrow to expand collection again',
    dependencies: ['click collection chevron-down arrow to collapse collection'],
    metadata: { priority: 'high', tags: ['@ui', '@collection', '@expand'] },
    testFunction: async ({ sharedPage }) => {
      await step('Click collection chevron-right arrow to expand collection again', async () => {
        const collectionPage = new CollectionModulePage(sharedPage.page);
        await collectionPage.clickCollectionChevronToExpand();
      });
    }
  },

  {
    name: 'click 3-dot menu and select Delete option',
    dependencies: ['refresh page and verify collection'],
    metadata: { priority: 'high', tags: ['@ui', '@menu', '@delete'] },
    testFunction: async ({ sharedPage }) => {
      const collectionPage = new CollectionModulePage(sharedPage.page);

      await step('Starting 3-dot menu Delete', async () => {
        console.log('Starting 3-dot menu Delete test');
      });

      await step('Click 3-dot menu and delete', async () => {
        await collectionPage.clickThreeDotMenuAndDelete();
      });

      await step('Log completion', async () => {
        console.log('3-dot menu Delete test completed');
      });
    }
  }
]);
