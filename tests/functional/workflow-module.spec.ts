/**
 * Workflow Module Test - Using Test Orchestrator with priority and dependency management
 */

import { TestOrchestrator } from '@/framework/utils/test-orchestrator';
import { LoginHelper } from '@/framework/pages/login-helper';
import { WorkflowModulePage } from '@/framework/pages/workflow-module-page';
import { step } from '@/framework/utils/step-tracker';

const orchestrator = new TestOrchestrator({
  useSharedPage: true,
  continueOnFailure: true,
  sequential: true,
  logLevel: 'detailed'
});

orchestrator.createSuite('Workflow Module Tests', [
  {
    name: 'user login',
    metadata: { priority: 'highest', tags: ['@critical', '@auth', '@workflow'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting highest priority login test');

      const { page } = sharedPage;

      // Check if already logged in to avoid unnecessary login attempts
      const alreadyLoggedIn = await LoginHelper.isLoggedIn(page);
      if (alreadyLoggedIn) {
        console.log('✅ Already logged in, skipping login process');
        return;
      }

      // Perform login using LoginHelper with retries for better reliability
      const loginResult = await step('Authenticate user for workflow module access', async () => {
        return await LoginHelper.performLoginWithDetails(page, {
          retries: 2  // Allow retries for better success rate
        });
      });

      if (!loginResult.success) {
        throw new Error('Login should be successful');
      }

      console.log('✅ Login completed successfully');
      console.log('Current URL after login:', page.url());
    }
  },

  {
    name: 'navigate to workflow page',
    dependencies: ['user login'],
    metadata: { priority: 'high', tags: ['@core', '@navigation', '@workflow'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting high priority workflow navigation');

      await step('Navigate to workflow page after successful login and verify tooltip', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.navigateToWorkflowModule();
      });
    }
  },

  {
    name: 'verify workflow template default tabs state',
    dependencies: ['navigate to workflow page'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@template', '@tabs'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting workflow template default tabs state verification');

      await step('Verify workflow template page shows All and Public workflows tabs with All selected by default', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyWorkflowTemplateDefaultTabsState();
      });
    }
  },

  {
    name: 'click public workflows template tab',
    dependencies: ['verify workflow template default tabs state'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@template', '@tabs', '@interaction'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting click public workflows template tab');

      await step('Click on Public workflows tab in workflow template page', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.clickPublicWorkflowsTemplateTab();
      });
    }
  },

  {
    name: 'verify public workflows template tab active',
    dependencies: ['click public workflows template tab'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@template', '@tabs', '@verification'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting verify public workflows template tab active');

      await step('Verify Public workflows tab is now active and All tab is inactive', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyPublicWorkflowsTemplateTabActive();
      });
    }
  },

  {
    name: 'click all template tab again',
    dependencies: ['verify public workflows template tab active'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@template', '@tabs', '@interaction'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting click all template tab again');

      await step('Click on All tab again to switch back', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.clickAllTemplateTab();
      });
    }
  },

  {
    name: 'verify workflow page elements',
    dependencies: ['click all template tab again'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@elements'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting workflow page elements verification');

      await step('Verify workflow page elements including tabs, creation options, and search', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyWorkflowPageElements();
      });
    }
  },

  {
    name: 'verify workflows present or empty state',
    dependencies: ['verify workflow page elements'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@state'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting workflows state verification');

      await step('Verify workflow cards when present or empty state message when no workflows', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyNoWorkflowsState();
      });
    }
  },

  {
    name: 'verify and click workflow create button',
    dependencies: ['verify workflows present or empty state'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@create'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting workflow create button verification');

      await step('Verify and click create workflow button based on current state', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyAndClickWorkflowCreateButton();
      });
    }
  },

  {
    name: 'verify workflow creation interface',
    dependencies: ['verify and click workflow create button'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@interface'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting workflow creation interface verification');

      await step('Verify workflow creation interface elements after clicking create', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyWorkflowCreationInterface();
      });
    }
  },

  {
    name: 'verify and click add first step',
    dependencies: ['verify workflow creation interface'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@triggers'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting Add first step verification');

      await step('Click Add first step button and verify triggers panel', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyAndClickAddFirstStep();
      });
    }
  },

  {
    name: 'verify form submission trigger configuration',
    dependencies: ['verify and click add first step'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@form-config'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting Form Submission trigger configuration verification');

      await step('Click Form Submission trigger and verify configuration panel', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyFormSubmissionTriggerConfiguration();
      });
    }
  },

  {
    name: 'verify workflow name change',
    dependencies: ['verify workflow creation interface'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@name-edit'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting workflow name change verification');

      await step('Double-click workflow name, change to "Automation Workflow", and verify the change', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyWorkflowNameChange();
      });
    }
  },

  {
    name: 'verify click add first step',
    dependencies: ['verify workflow creation interface'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@click-first-step'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting click Add first step verification');

      await step('Click Add first step button and verify immediate UI changes with timeout', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyClickAddFirstStep();
      });
    }
  },

  {
    name: 'verify add first node',
    dependencies: ['verify click add first step'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@react-flow', '@node'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting add first node verification');

      await step('Verify React Flow node appears with correct styling and disabled execute button', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyAddFirstNode();
      });
    }
  },

  {
    name: 'verify cross icon and sidebar toggle',
    dependencies: ['verify add first node'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@sidebar', '@toggle'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting cross icon and sidebar toggle verification');

      await step('Click cross icon to close sidebar, then click node to reopen sidebar', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyCrossIconAndSidebarToggle();
      });
    }
  },

  {
    name: 'verify first node added with complete interaction flow',
    dependencies: ['verify cross icon and sidebar toggle'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@form-submission', '@interaction-flow'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting first node added with complete interaction flow verification');

      await step('Complete form submission trigger interaction: hover, click, configure, back button, cross button, reopen, final click', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyFirstNodeAdded();
      });
    }
  },

  {
    name: 'add trigger node data',
    dependencies: ['verify first node added with complete interaction flow'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@form-data', '@save-config'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting add trigger node data verification');

      await step('Fill form title, description, change field name from "Field 1" to "Upload Document", and save configuration', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.addTriggerNodeData();
      });
    }
  },

  {
    name: 'verify post save state',
    dependencies: ['add trigger node data'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@post-save', '@verification'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting post save state verification');

      await step('Verify post-save state: Save Changes button active, sidebar disappears, node appears with title/description', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyPostSaveState();
      });
    }
  },

  {
    name: 'change form data',
    dependencies: ['verify post save state'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@form-edit', '@data-modification'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting change form data verification');

      await step('Click node, verify form sidebar, clear fields, verify fallback values, then add new data and verify updates', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.changeFormData();
      });
    }
  },

  {
    name: 'add AI agent node',
    dependencies: ['change form data'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@ai-agent', '@node-creation'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting add AI agent node verification');

      await step('Add AI agent node by clicking plus icon, verifying sidebar contents, clicking cross, reopening, selecting AI Agent, configuring it, and saving', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.addAIAgentNode();
      });
    }
  },

  {
    name: 'add email node',
    dependencies: ['add AI agent node'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@email', '@node-creation', '@validation'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting add email node verification');

      await step('Add email node by clicking plus icon on AI agent, selecting Email, testing email validation with invalid and valid emails, adding/removing emails, and saving', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.addEmailNode();
      });
    }
  },

  {
    name: 'click workflow breadcrumb before save',
    dependencies: ['add email node'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@breadcrumb', '@navigation'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting click workflow breadcrumb before save');

      await step('Click Workflow breadcrumb to test unsaved work warning', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.clickWorkflowBreadcrumb();
      });
    }
  },

  {
    name: 'verify unsaved work popup',
    dependencies: ['click workflow breadcrumb before save'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@popup', '@unsaved-work'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting verify unsaved work popup');

      await step('Verify unsaved work popup appears with correct content', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyUnsavedWorkPopup();
      });
    }
  },

  {
    name: 'click cancel in unsaved popup',
    dependencies: ['verify unsaved work popup'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@popup', '@cancel'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting click cancel in unsaved popup');

      await step('Click Cancel button to dismiss unsaved work popup', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.clickCancelInUnsavedPopup();
      });
    }
  },

  {
    name: 'save and verify saved workflow',
    dependencies: ['click cancel in unsaved popup'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@save', '@success-popup', '@execute-button'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting save and verify saved workflow');

      await step('Click Save Changes button, verify success popup appears, and verify execute button is enabled', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.saveAndVerifyWorkflow();
      });
    }
  },

  {
    name: 'execute workflow with PDF',
    dependencies: ['save and verify saved workflow'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@execute', '@file-upload', '@pdf'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting execute workflow test with PDF');

      await step('Click execute button, verify popup appears with correct workflow name, upload PDF file, and start execution', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.executeWorkflow();
      });
    }
  },

  {
    name: 'execute TXT file',
    dependencies: ['execute workflow with PDF'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@execute', '@file-upload', '@txt', '@supported'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting TXT file execution test');

      await step('Execute workflow with TXT file (supported format)', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.executeSubsequentFile('./props/data-enrichment.txt', 'data-enrichment.txt', 'txt');
      });
    }
  },

  {
    name: 'execute DOCX file',
    dependencies: ['execute TXT file'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@execute', '@file-upload', '@docx', '@supported'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting DOCX file execution test');

      await step('Execute workflow with DOCX file (supported format)', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.executeSubsequentFile('./props/test-automation-guide.docx', 'test-automation-guide.docx', 'docx');
      });
    }
  },

  {
    name: 'verify CSV unsupported file error',
    dependencies: ['execute DOCX file'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@execute', '@file-upload', '@csv', '@unsupported', '@error'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting CSV unsupported file error test');

      await step('Upload CSV file and verify unsupported file type error is displayed', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.executeUnsupportedFile('./props/employee-data.csv', 'employee-data.csv', 'csv', true); // true = click "Upload Another" first
      });
    }
  },

  {
    name: 'verify MD unsupported file error',
    dependencies: ['verify CSV unsupported file error'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@execute', '@file-upload', '@md', '@unsupported', '@error'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting MD unsupported file error test');

      await step('Upload Markdown file and verify unsupported file type error is displayed', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.executeUnsupportedFile('./props/test-automation-guide.md', 'test-automation-guide.md', 'md');
      });
    }
  },

  {
    name: 'verify XLSX unsupported file error',
    dependencies: ['verify MD unsupported file error'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@execute', '@file-upload', '@xlsx', '@unsupported', '@error'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting XLSX unsupported file error test');

      await step('Upload XLSX file and verify unsupported file type error is displayed', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.executeUnsupportedFile('./props/employee-data.xlsx', 'employee-data.xlsx', 'xlsx');
      });
    }
  },

  {
    name: 'verify PPTX unsupported file error',
    dependencies: ['verify XLSX unsupported file error'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@execute', '@file-upload', '@pptx', '@unsupported', '@error'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting PPTX unsupported file error test');

      await step('Upload PPTX file and verify unsupported file type error is displayed', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.executeUnsupportedFile('./props/business-presentation.pptx', 'business-presentation.pptx', 'pptx');
      });
    }
  },

  {
    name: 'execute DOC file',
    dependencies: ['verify PPTX unsupported file error'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@execute', '@file-upload', '@doc', '@supported'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting DOC file execution test');

      await step('Execute workflow with DOC file (supported format) - final successful execution before viewing workflow', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.executeSubsequentFile('./props/test-automation-guide.doc', 'test-automation-guide.doc', 'doc', true); // true = skip "Upload Another" (upload area already visible after error)
      });
    }
  },

  {
    name: 'verify completion and click view workflow',
    dependencies: ['execute DOC file'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@execute', '@view-workflow'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting verify completion and click view workflow test');

      await step('Verify workflow execution completed successfully and click "View Workflow" button', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyCompletionAndClickViewWorkflow();
      });
    }
  },

  {
    name: 'verify workflow execution details screen',
    dependencies: ['verify completion and click view workflow'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@execute', '@execution-details', '@react-flow'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting verify workflow execution details screen test');

      await step('Verify workflow execution details screen shows correct breadcrumb with timestamp and all three workflow nodes with green borders', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyWorkflowExecutionDetailsScreen();
      });
    }
  },

  {
    name: 'verify node execution details',
    dependencies: ['verify workflow execution details screen'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@execute', '@node-details', '@sidebar'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting verify node execution details test');

      await step('Click each executed node and verify their execution details in the sidebar', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyNodeExecutionDetails();
      });
    }
  },

  {
    name: 'navigate back to workflow page via breadcrumb',
    dependencies: ['verify node execution details'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@breadcrumb', '@navigation'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting navigate back to workflow page via breadcrumb test');

      await step('Click Workflow breadcrumb text to navigate back to workflow page', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.clickWorkflowBreadcrumbFromExecution();
      });
    }
  },

  {
    name: 'verify workflow template appears in templates page',
    dependencies: ['navigate back to workflow page via breadcrumb'],
    metadata: { priority: 'high', tags: ['@core', '@workflow', '@template', '@verification'] },
    testFunction: async ({ sharedPage }) => {
      console.log('🚀 Starting verify workflow template appears test');

      await step('Verify that the created workflow template appears with correct name and timestamp when Save as Private was clicked', async () => {
        const workflowPage = new WorkflowModulePage(sharedPage.page);
        await workflowPage.verifyWorkflowTemplateAppears();
      });
    }
  }
]);
