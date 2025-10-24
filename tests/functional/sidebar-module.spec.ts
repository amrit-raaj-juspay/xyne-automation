/**
 * Sidebar Module Test - Using Test Orchestrator with Page Object Model
 */

import { TestOrchestrator } from '@/framework/utils/test-orchestrator';
import { step } from '@/framework/utils/step-tracker';
import { LoginHelper } from '@/framework/pages/login-helper';
import { SidebarModulePage } from '@/framework/pages/sidebar-module-page';

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
    metadata: { priority: 'high', tags: ['@core', '@sidebar', '@modal'] },
    testFunction: async ({ sharedPage }) => {
      const sidebarPage = new SidebarModulePage(sharedPage.page);

      await step('Click history icon', async () => {
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
    name: 'click users icon and verify users panel opens',
    dependencies: ['click history icon and verify history panel opens'],
    metadata: { priority: 'high', tags: ['@core', '@sidebar', '@modal'] },
    testFunction: async ({ sharedPage }) => {
      const sidebarPage = new SidebarModulePage(sharedPage.page);

      await step('Click users icon', async () => {
        await sidebarPage.clickUsersIcon();
      });

      await step('Verify users panel content', async () => {
        await sidebarPage.verifyUsersPanelContent();
      });

      await step('Close users panel', async () => {
        await sidebarPage.closeUsersPanel();
      });
    }
  },

  {
    name: 'click workflow icon and verify navigation',
    dependencies: ['click users icon and verify users panel opens'],
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
