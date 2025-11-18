/**
 * Sidebar Module Test - Using Test Orchestrator with Page Object Model
 */

import { TestOrchestrator } from '@/framework/utils/test-orchestrator';
import { step } from '@/framework/utils/step-tracker';
import { LoginHelper } from '@/framework/pages/xyne/login-helper';
import { SidebarModulePage } from '@/framework/pages/xyne/sidebar-module-page';

const orchestrator = new TestOrchestrator({
  useSharedPage: true,
  continueOnFailure: true,
  sequential: true,
  logLevel: 'detailed'
});

orchestrator.createSuite('Sidebar Module Tests', [
  {
    name: 'user login',
    metadata: { priority: 'highest', tags: ['@critical', '@auth', '@sidebar'] },
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
    name: 'click history icon and verify history panel opens',
    dependencies: ['user login'],
    metadata: { priority: 'high', tags: ['@core', '@sidebar', '@history'] },
    testFunction: async ({ sharedPage }) => {
      const sidebarPage = new SidebarModulePage(sharedPage.page);

      await step('Click history icon in sidebar', async () => {
        await sidebarPage.clickHistoryIcon();
      });

      await step('Verify history panel content', async () => {
        await sidebarPage.verifyHistoryPanelContent();
      });

      await step('Close history panel', async () => {
        await sidebarPage.closeHistoryPanel();
      });
    }
  },

  {
    name: 'click buzz icon and verify buzz panel opens',
    dependencies: ['click history icon and verify history panel opens'],
    metadata: { priority: 'high', tags: ['@core', '@sidebar', '@buzz'] },
    testFunction: async ({ sharedPage }) => {
      const sidebarPage = new SidebarModulePage(sharedPage.page);

      await step('Click buzz icon (users icon)', async () => {
        await sidebarPage.clickBuzzIcon();
      });

      await step('Verify buzz panel has Chats and Call History buttons', async () => {
        await sidebarPage.verifyBuzzPanelContent();
      });

      await step('Verify chats panel is already open (default selection)', async () => {
        await sidebarPage.verifyUsersPanelContent();
      });
    }
  },

  {
    name: 'click call history button and verify call history panel opens',
    dependencies: ['click buzz icon and verify buzz panel opens'],
    metadata: { priority: 'high', tags: ['@core', '@sidebar', '@buzz', '@call-history'] },
    testFunction: async ({ sharedPage }) => {
      const sidebarPage = new SidebarModulePage(sharedPage.page);

      await step('Click Call History button in Buzz panel', async () => {
        await sidebarPage.clickCallHistoryButtonInBuzzPanel();
      });

      await step('Verify call history panel content', async () => {
        await sidebarPage.verifyCallHistoryPanelContent();
      });
    }
  },

  {
    name: 'click workflow icon and verify navigation',
    dependencies: ['click call history button and verify call history panel opens'],
    metadata: { priority: 'high', tags: ['@core', '@sidebar', '@navigation'] },
    testFunction: async ({ sharedPage }) => {
      const sidebarPage = new SidebarModulePage(sharedPage.page);

      await step('Click workflow icon and verify navigation', async () => {
        await sidebarPage.clickWorkflowIcon();
      });
    }
  },

  {
    name: 'click agent icon and verify navigation',
    dependencies: ['click workflow icon and verify navigation'],
    metadata: { priority: 'high', tags: ['@core', '@sidebar', '@navigation'] },
    testFunction: async ({ sharedPage }) => {
      const sidebarPage = new SidebarModulePage(sharedPage.page);

      await step('Click agent icon and verify navigation', async () => {
        await sidebarPage.clickAgentIcon();
      });
    }
  },

  {
    name: 'click integration icon and verify navigation',
    dependencies: ['click agent icon and verify navigation'],
    metadata: { priority: 'high', tags: ['@core', '@sidebar', '@navigation'] },
    testFunction: async ({ sharedPage }) => {
      const sidebarPage = new SidebarModulePage(sharedPage.page);

      await step('Click integration icon and verify navigation', async () => {
        await sidebarPage.clickIntegrationIcon();
      });
    }
  },

  {
    name: 'click knowledge management icon and verify navigation',
    dependencies: ['click integration icon and verify navigation'],
    metadata: { priority: 'high', tags: ['@core', '@sidebar', '@navigation'] },
    testFunction: async ({ sharedPage }) => {
      const sidebarPage = new SidebarModulePage(sharedPage.page);

      await step('Click knowledge management icon and verify navigation', async () => {
        await sidebarPage.clickKnowledgeManagementIcon();
      });
    }
  },

  {
    name: 'click user management icon and verify navigation',
    dependencies: ['click knowledge management icon and verify navigation'],
    metadata: { priority: 'high', tags: ['@core', '@sidebar', '@navigation'] },
    testFunction: async ({ sharedPage }) => {
      const sidebarPage = new SidebarModulePage(sharedPage.page);

      await step('Click user management icon and verify navigation', async () => {
        await sidebarPage.clickUserManagementIcon();
      });
    }
  },

  {
    name: 'click dashboard icon and verify navigation',
    dependencies: ['click user management icon and verify navigation'],
    metadata: { priority: 'high', tags: ['@core', '@sidebar', '@navigation'] },
    testFunction: async ({ sharedPage }) => {
      const sidebarPage = new SidebarModulePage(sharedPage.page);

      await step('Click dashboard icon and verify navigation', async () => {
        await sidebarPage.clickDashboardIcon();
      });
    }
  },

  {
    name: 'click new chat icon and verify navigation to home',
    dependencies: ['click dashboard icon and verify navigation'],
    metadata: { priority: 'high', tags: ['@core', '@sidebar', '@navigation'] },
    testFunction: async ({ sharedPage }) => {
      const sidebarPage = new SidebarModulePage(sharedPage.page);

      await step('Click new chat icon and verify navigation', async () => {
        await sidebarPage.clickNewChatIcon();
      });
    }
  },

  {
    name: 'click theme toggle and verify theme changes',
    dependencies: ['click new chat icon and verify navigation to home'],
    metadata: { priority: 'high', tags: ['@core', '@sidebar', '@theme'] },
    testFunction: async ({ sharedPage }) => {
      const sidebarPage = new SidebarModulePage(sharedPage.page);

      const themeChanged = await step('Click theme toggle and verify change', async () => {
        return await sidebarPage.clickThemeToggle();
      });

      if (!themeChanged) {
        throw new Error('Theme should toggle successfully');
      }
    }
  }
]);
