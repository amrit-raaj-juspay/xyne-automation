/**
 * Agent Module Test - Using Test Orchestrator with Dependencies
 */

import { TestOrchestrator } from '@/framework/utils/test-orchestrator';
import { LoginHelper } from '@/framework/pages/login-helper';
import { AgentModulePage } from '@/framework/pages/agent-module-page';
import { step } from '@/framework/utils/step-tracker';

// Create orchestrator instance
const orchestrator = new TestOrchestrator({
  useSharedPage: true,
  continueOnFailure: true,
  sequential: true,
  logLevel: 'detailed'
});

// Create orchestrated test suite
orchestrator.createSuite('Agent Module Tests', [
  {
    name: 'user login',
    metadata: { priority: 'highest', tags: ['@critical', '@auth', '@agent'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting highest priority login test');

      const { page } = sharedPage;

      const alreadyLoggedIn = await LoginHelper.isLoggedIn(page);
      if (alreadyLoggedIn) {
        console.log('✅ Already logged in, skipping login process');
        return;
      }

      const loginResult = await LoginHelper.performLoginWithDetails(page, {
        retries: 2
      });

      if (!loginResult.success) {
        throw new Error('Login should be successful');
      }

      console.log('✅ Login completed successfully');
      console.log('Current URL after login:', page.url());
    }
  },

  {
    name: 'navigate to agent page',
    dependencies: ['user login'],
    metadata: { priority: 'medium', tags: ['@core', '@navigation', '@agent'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting high priority agent navigation');

      const { page } = sharedPage;

      const agentNavLink = page.locator('a[href="/agent"]');
      await agentNavLink.waitFor({ state: 'visible', timeout: 10000 });
      console.log('✅ Agent navigation link is visible');

      await agentNavLink.hover();
      console.log('✅ Hovered over agent navigation link');

      await page.locator('[role="tooltip"]:has-text("Agents"), .tooltip:has-text("Agents")').first().waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});

      const tooltip = page.locator('[role="tooltip"]:has-text("Agents"), .tooltip:has-text("Agents"), [data-tooltip]:has-text("Agents")');
      const tooltipVisible = await tooltip.isVisible().catch(() => false);
      if (tooltipVisible) {
        console.log('✅ Tooltip with text "Agents" is visible');
      } else {
        console.log('⚠️ Tooltip not found - may not be implemented or uses different structure');
      }

      const botIcon = agentNavLink.locator('svg.lucide-bot');
      await botIcon.waitFor({ state: 'visible' });
      console.log('✅ Bot icon is visible within agent link');

      await agentNavLink.click();
      console.log('✅ Clicked agent navigation link');

      await page.waitForURL('**/agent', { timeout: 5000 }).catch(() => {});
      const currentUrl = page.url();
      if (!currentUrl.includes('/agent')) {
        throw new Error(`Expected URL to contain '/agent', but got: ${currentUrl}`);
      }
      await page.waitForLoadState('networkidle', { timeout: 25000 }).catch(() => {});
      console.log('✅ Successfully navigated to agent page:', currentUrl);
    }
  },

  {
    name: 'verify and click agent create button',
    dependencies: ['navigate to agent page'],
    metadata: { priority: 'high', tags: ['@core', '@agent', '@button'] },
    testFunction: async ({ sharedPage }) => {
      await step('Verify and click agent create button', async () => {
        const agentPage = new AgentModulePage(sharedPage.page);
        await agentPage.verifyAndClickAgentCreateButtonWithValidations();
      });
    }
  },

  {
    name: 'verify create agent form elements after clicking CREATE button',
    dependencies: ['verify and click agent create button'],
    metadata: { priority: 'high', tags: ['@core', '@agent', '@form'] },
    testFunction: async ({ sharedPage }) => {
      await step('Verify create agent form elements', async () => {
        const agentPage = new AgentModulePage(sharedPage.page);
        await agentPage.verifyCreateAgentFormElements();
      });
    }
  },

  {
    name: 'create agent with form data',
    dependencies: ['verify create agent form elements after clicking CREATE button'],
    metadata: { priority: 'high', tags: ['@core', '@agent', '@form-fill'] },
    testFunction: async ({ sharedPage }) => {
      await step('Create agent with form data', async () => {
        const agentPage = new AgentModulePage(sharedPage.page);
        await agentPage.createAgentWithFormData();
      });
    }
  },

  {
    name: 'verify success popup after agent creation',
    dependencies: ['create agent with form data'],
    metadata: { priority: 'high', tags: ['@core', '@agent', '@popup'] },
    testFunction: async ({ sharedPage }) => {
      await step('Verify success popup', async () => {
        const agentPage = new AgentModulePage(sharedPage.page);
        await agentPage.verifySuccessPopupAfterAgentCreation();
      });
    }
  },

  {
    name: 'verify created agent appears in ALL and MADE-BY-ME tabs',
    dependencies: ['verify success popup after agent creation'],
    metadata: { priority: 'high', tags: ['@core', '@agent', '@verification'] },
    testFunction: async ({ sharedPage }) => {
      await step('Verify created agent in tabs', async () => {
        const agentPage = new AgentModulePage(sharedPage.page);
        await agentPage.verifyCreatedAgentAppearsInTabsWithSearchAndStar();
      });
    }
  },

  {
    name: 'click agent name in ALL tab and verify details',
    dependencies: ['verify created agent appears in ALL and MADE-BY-ME tabs'],
    metadata: { priority: 'high', tags: ['@core', '@agent', '@details'] },
    testFunction: async ({ sharedPage }) => {
      await step('Click agent and verify details', async () => {
        const agentPage = new AgentModulePage(sharedPage.page);
        await agentPage.clickAgentNameInAllTabAndVerifyDetails();
      });
    }
  },

  {
    name: 'upload solar system PDF via clip icon',
    dependencies: ['click agent name in ALL tab and verify details'],
    metadata: { priority: 'medium', tags: ['@core', '@agent', '@upload'] },
    testFunction: async ({ sharedPage }) => {
      await step('Upload solar system PDF', async () => {
        const agentPage = new AgentModulePage(sharedPage.page);
        await agentPage.uploadSolarSystemPDFViaClipIcon();
      });
    }
  },

  {
    name: 'verify uploaded file in attachments section',
    dependencies: ['upload solar system PDF via clip icon'],
    metadata: { priority: 'medium', tags: ['@core', '@agent', '@attachment'] },
    testFunction: async ({ sharedPage }) => {
      await step('Verify uploaded file', async () => {
        const agentPage = new AgentModulePage(sharedPage.page);
        await agentPage.verifyUploadedFileInAttachmentsSection();
      });
    }
  },

  {
    name: 'ask question about solar system planets and send',
    dependencies: ['verify uploaded file in attachments section'],
    metadata: { priority: 'medium', tags: ['@core', '@agent', '@chat'] },
    testFunction: async ({ sharedPage }) => {
      await step('Ask question about solar system', async () => {
        const agentPage = new AgentModulePage(sharedPage.page);
        await agentPage.askQuestionAboutSolarSystemPlanets();
      });
    }
  },

  {
    name: 'verify conversation with AI response about planets',
    dependencies: ['ask question about solar system planets and send'],
    metadata: { priority: 'medium', tags: ['@core', '@agent', '@response'] },
    testFunction: async ({ sharedPage }) => {
      await step('Verify AI response about planets', async () => {
        const agentPage = new AgentModulePage(sharedPage.page);
        await agentPage.verifyConversationWithAIResponseAboutPlanets();
      });
    }
  },

  {
    name: 'navigate back to agent page from sidebar',
    dependencies: ['create agent with form data'],
    metadata: { priority: 'medium', tags: ['@core', '@navigation', '@agent'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting navigation back to agent page from sidebar');

      const { page } = sharedPage;

      const agentNavLink = page.locator('a[href="/agent"]');
      await agentNavLink.waitFor({ state: 'visible', timeout: 10000 });
      console.log('✅ Agent navigation link is visible');

      const botIcon = agentNavLink.locator('svg.lucide-bot');
      await botIcon.waitFor({ state: 'visible' });
      console.log('✅ Bot icon is visible within agent link');

      await agentNavLink.click();
      console.log('✅ Clicked agent navigation link');

      await page.waitForURL('**/agent', { timeout: 5000 }).catch(() => {});
      const currentUrl = page.url();
      if (!currentUrl.includes('/agent')) {
        throw new Error(`Expected URL to contain '/agent', but got: ${currentUrl}`);
      }
      await page.waitForLoadState('networkidle', { timeout: 25000 }).catch(() => {});
      console.log('✅ Successfully navigated to agent page:', currentUrl);
    }
  },

  {
    name: 'edit created agent and verify success',
    dependencies: ['verify conversation with AI response about planets'],
    metadata: { priority: 'high', tags: ['@core', '@agent', '@edit'] },
    testFunction: async ({ sharedPage }) => {
      await step('Edit created agent', async () => {
        const agentPage = new AgentModulePage(sharedPage.page);
        await agentPage.editCreatedAgentAndVerifySuccess();
      });
    }
  },

  {
    name: 'verify edited agent details in tabs',
    dependencies: ['edit created agent and verify success'],
    metadata: { priority: 'high', tags: ['@core', '@agent', '@verification'] },
    testFunction: async ({ sharedPage }) => {
      await step('Verify edited agent details', async () => {
        const agentPage = new AgentModulePage(sharedPage.page);
        await agentPage.verifyEditedAgentDetailsInTabs();
      });
    }
  },

  {
    name: 'delete agent and verify removal',
    dependencies: ['verify edited agent details in tabs'],
    metadata: { priority: 'high', tags: ['@core', '@agent', '@delete'] },
    testFunction: async ({ sharedPage }) => {
      await step('Delete agent and verify removal', async () => {
        const agentPage = new AgentModulePage(sharedPage.page);
        await agentPage.deleteAgentAndVerifyRemoval();
      });
    }
  }
]);
