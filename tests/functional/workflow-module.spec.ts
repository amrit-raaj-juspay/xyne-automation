/**
 * Workflow Module Test - Using priority and dependency management
 */

import {test, testHighest, testHigh, expect } from '@/framework/core/test-fixtures';
import { LoginHelper } from '@/framework/pages/login-helper';
import { WorkflowModulePage } from '@/framework/pages/workflow-module-page';

// Configure tests to run sequentially and share browser context
test.describe.configure({ mode: 'serial' });

test.describe('Workflow Module Tests', () => {

  testHighest('user login', {
    tags: ['@critical', '@auth', '@workflow'],
    description: 'Authenticate user for workflow module access'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting highest priority login test');

    const { page } = sharedPage;

    // Check if already logged in to avoid unnecessary login attempts
    const alreadyLoggedIn = await LoginHelper.isLoggedIn(page);
    if (alreadyLoggedIn) {
      console.log('✅ Already logged in, skipping login process');
      return;
    }

    // Perform login using LoginHelper with retries for better reliability
    const loginResult = await LoginHelper.performLoginWithDetails(page, {
      retries: 2  // Allow retries for better success rate
    });

    expect(loginResult.success, 'Login should be successful').toBe(true);

    console.log('✅ Login completed successfully');
    console.log('Current URL after login:', page.url());
  });

  testHigh('navigate to workflow page', {
    dependsOn: ['user login'],
    tags: ['@core', '@navigation', '@workflow'],
    description: 'Navigate to workflow page after successful login and verify tooltip'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting high priority workflow navigation');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.navigateToWorkflowModule();
  });

  testHigh('verify workflow template default tabs state', {
    dependsOn: ['navigate to workflow page'],
    tags: ['@core', '@workflow', '@template', '@tabs'],
    description: 'Verify workflow template page shows All and Public workflows tabs with All selected by default'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting workflow template default tabs state verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyWorkflowTemplateDefaultTabsState();
  });

  testHigh('click public workflows template tab', {
    dependsOn: ['verify workflow template default tabs state'],
    tags: ['@core', '@workflow', '@template', '@tabs', '@interaction'],
    description: 'Click on Public workflows tab in workflow template page'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting click public workflows template tab');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.clickPublicWorkflowsTemplateTab();
  });

  testHigh('verify public workflows template tab active', {
    dependsOn: ['click public workflows template tab'],
    tags: ['@core', '@workflow', '@template', '@tabs', '@verification'],
    description: 'Verify Public workflows tab is now active and All tab is inactive'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting verify public workflows template tab active');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyPublicWorkflowsTemplateTabActive();
  });

  testHigh('click all template tab again', {
    dependsOn: ['verify public workflows template tab active'],
    tags: ['@core', '@workflow', '@template', '@tabs', '@interaction'],
    description: 'Click on All tab again to switch back'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting click all template tab again');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.clickAllTemplateTab();
  });

  testHigh('verify workflow page elements', {
    dependsOn: ['click all template tab again'],
    tags: ['@core', '@workflow', '@elements'],
    description: 'Verify workflow page elements including tabs, creation options, and search'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting workflow page elements verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyWorkflowPageElements();
  });

  testHigh('verify workflows present or empty state', {
    dependsOn: ['verify workflow page elements'],
    tags: ['@core', '@workflow', '@state'],
    description: 'Verify workflow cards when present or empty state message when no workflows'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting workflows state verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyNoWorkflowsState();
  });

  testHigh('verify and click workflow create button', {
    dependsOn: ['verify workflows present or empty state'],
    tags: ['@core', '@workflow', '@create'],
    description: 'Verify and click create workflow button based on current state'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting workflow create button verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyAndClickWorkflowCreateButton();
  });

  testHigh('verify workflow creation interface', {
    dependsOn: ['verify and click workflow create button'],
    tags: ['@core', '@workflow', '@interface'],
    description: 'Verify workflow creation interface elements after clicking create'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting workflow creation interface verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyWorkflowCreationInterface();
  });

  testHigh('verify and click add first step', {
    dependsOn: ['verify workflow creation interface'],
    tags: ['@core', '@workflow', '@triggers'],
    description: 'Click Add first step button and verify triggers panel'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting Add first step verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyAndClickAddFirstStep();
  });

  testHigh('verify form submission trigger configuration', {
    dependsOn: ['verify and click add first step'],
    tags: ['@core', '@workflow', '@form-config'],
    description: 'Click Form Submission trigger and verify configuration panel'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting Form Submission trigger configuration verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyFormSubmissionTriggerConfiguration();
  });

  testHigh('verify workflow name change', {
    dependsOn: ['verify workflow creation interface'],
    tags: ['@core', '@workflow', '@name-edit'],
    description: 'Double-click workflow name, change to "Automation Workflow", and verify the change'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting workflow name change verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyWorkflowNameChange();
  });

  testHigh('verify click add first step', {
    dependsOn: ['verify workflow creation interface'],
    tags: ['@core', '@workflow', '@click-first-step'],
    description: 'Click Add first step button and verify immediate UI changes with timeout'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting click Add first step verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyClickAddFirstStep();
  });

  testHigh('verify add first node', {
    dependsOn: ['verify click add first step'],
    tags: ['@core', '@workflow', '@react-flow', '@node'],
    description: 'Verify React Flow node appears with correct styling and disabled execute button'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting add first node verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyAddFirstNode();
  });

  testHigh('verify cross icon and sidebar toggle', {
    dependsOn: ['verify add first node'],
    tags: ['@core', '@workflow', '@sidebar', '@toggle'],
    description: 'Click cross icon to close sidebar, then click node to reopen sidebar'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting cross icon and sidebar toggle verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyCrossIconAndSidebarToggle();
  });

  testHigh('verify first node added with complete interaction flow', {
    dependsOn: ['verify cross icon and sidebar toggle'],
    tags: ['@core', '@workflow', '@form-submission', '@interaction-flow'],
    description: 'Complete form submission trigger interaction: hover, click, configure, back button, cross button, reopen, final click'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting first node added with complete interaction flow verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyFirstNodeAdded();
  });

  testHigh('add trigger node data', {
    dependsOn: ['verify first node added with complete interaction flow'],
    tags: ['@core', '@workflow', '@form-data', '@save-config'],
    description: 'Fill form title, description, change field name from "Field 1" to "Upload Document", and save configuration'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting add trigger node data verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.addTriggerNodeData();
  });

  testHigh('verify post save state', {
    dependsOn: ['add trigger node data'],
    tags: ['@core', '@workflow', '@post-save', '@verification'],
    description: 'Verify post-save state: Save Changes button active, sidebar disappears, node appears with title/description'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting post save state verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyPostSaveState();
  });

  testHigh('change form data', {
    dependsOn: ['verify post save state'],
    tags: ['@core', '@workflow', '@form-edit', '@data-modification'],
    description: 'Click node, verify form sidebar, clear fields, verify fallback values, then add new data and verify updates'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting change form data verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.changeFormData();
  });

  testHigh('add AI agent node', {
    dependsOn: ['change form data'],
    tags: ['@core', '@workflow', '@ai-agent', '@node-creation'],
    description: 'Add AI agent node by clicking plus icon, verifying sidebar contents, clicking cross, reopening, selecting AI Agent, configuring it, and saving'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting add AI agent node verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.addAIAgentNode();
  });

  testHigh('add email node', {
    dependsOn: ['add AI agent node'],
    tags: ['@core', '@workflow', '@email', '@node-creation', '@validation'],
    description: 'Add email node by clicking plus icon on AI agent, selecting Email, testing email validation with invalid and valid emails, adding/removing emails, and saving'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting add email node verification');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.addEmailNode();
  });

  testHigh('click workflow breadcrumb before save', {
    dependsOn: ['add email node'],
    tags: ['@core', '@workflow', '@breadcrumb', '@navigation'],
    description: 'Click Workflow breadcrumb to test unsaved work warning'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting click workflow breadcrumb before save');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.clickWorkflowBreadcrumb();
  });

  testHigh('verify unsaved work popup', {
    dependsOn: ['click workflow breadcrumb before save'],
    tags: ['@core', '@workflow', '@popup', '@unsaved-work'],
    description: 'Verify unsaved work popup appears with correct content'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting verify unsaved work popup');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyUnsavedWorkPopup();
  });

  testHigh('click cancel in unsaved popup', {
    dependsOn: ['verify unsaved work popup'],
    tags: ['@core', '@workflow', '@popup', '@cancel'],
    description: 'Click Cancel button to dismiss unsaved work popup'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting click cancel in unsaved popup');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.clickCancelInUnsavedPopup();
  });

  testHigh('save and verify saved workflow', {
    dependsOn: ['click cancel in unsaved popup'],
    tags: ['@core', '@workflow', '@save', '@success-popup', '@execute-button'],
    description: 'Click Save Changes button, verify success popup appears, and verify execute button is enabled'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting save and verify saved workflow');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.saveAndVerifyWorkflow();
  });

  testHigh('execute workflow with PDF', {
    dependsOn: ['save and verify saved workflow'],
    tags: ['@core', '@workflow', '@execute', '@file-upload', '@pdf'],
    description: 'Click execute button, verify popup appears with correct workflow name, upload PDF file, and start execution'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting execute workflow test with PDF');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.executeWorkflow();
  });

  testHigh('execute TXT file', {
    dependsOn: ['execute workflow with PDF'],
    tags: ['@core', '@workflow', '@execute', '@file-upload', '@txt', '@supported'],
    description: 'Execute workflow with TXT file (supported format)'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting TXT file execution test');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.executeSubsequentFile('./props/data-enrichment.txt', 'data-enrichment.txt', 'txt');
  });

  testHigh('execute DOCX file', {
    dependsOn: ['execute TXT file'],
    tags: ['@core', '@workflow', '@execute', '@file-upload', '@docx', '@supported'],
    description: 'Execute workflow with DOCX file (supported format)'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting DOCX file execution test');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.executeSubsequentFile('./props/test-automation-guide.docx', 'test-automation-guide.docx', 'docx');
  });

  testHigh('verify CSV unsupported file error', {
    dependsOn: ['execute DOCX file'],
    tags: ['@core', '@workflow', '@execute', '@file-upload', '@csv', '@unsupported', '@error'],
    description: 'Upload CSV file and verify unsupported file type error is displayed'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting CSV unsupported file error test');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.executeUnsupportedFile('./props/employee-data.csv', 'employee-data.csv', 'csv', true); // true = click "Upload Another" first
  });

  testHigh('verify MD unsupported file error', {
    dependsOn: ['verify CSV unsupported file error'],
    tags: ['@core', '@workflow', '@execute', '@file-upload', '@md', '@unsupported', '@error'],
    description: 'Upload Markdown file and verify unsupported file type error is displayed'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting MD unsupported file error test');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.executeUnsupportedFile('./props/test-automation-guide.md', 'test-automation-guide.md', 'md');
  });

  testHigh('verify XLSX unsupported file error', {
    dependsOn: ['verify MD unsupported file error'],
    tags: ['@core', '@workflow', '@execute', '@file-upload', '@xlsx', '@unsupported', '@error'],
    description: 'Upload XLSX file and verify unsupported file type error is displayed'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting XLSX unsupported file error test');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.executeUnsupportedFile('./props/employee-data.xlsx', 'employee-data.xlsx', 'xlsx');
  });

  testHigh('verify PPTX unsupported file error', {
    dependsOn: ['verify XLSX unsupported file error'],
    tags: ['@core', '@workflow', '@execute', '@file-upload', '@pptx', '@unsupported', '@error'],
    description: 'Upload PPTX file and verify unsupported file type error is displayed'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting PPTX unsupported file error test');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.executeUnsupportedFile('./props/business-presentation.pptx', 'business-presentation.pptx', 'pptx');
  });

  testHigh('execute DOC file', {
    dependsOn: ['verify PPTX unsupported file error'],
    tags: ['@core', '@workflow', '@execute', '@file-upload', '@doc', '@supported'],
    description: 'Execute workflow with DOC file (supported format) - final successful execution before viewing workflow'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting DOC file execution test');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.executeSubsequentFile('./props/test-automation-guide.doc', 'test-automation-guide.doc', 'doc', true); // true = skip "Upload Another" (upload area already visible after error)
  });

  testHigh('verify completion and click view workflow', {
    dependsOn: ['execute DOC file'],
    tags: ['@core', '@workflow', '@execute', '@view-workflow'],
    description: 'Verify workflow execution completed successfully and click "View Workflow" button'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting verify completion and click view workflow test');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyCompletionAndClickViewWorkflow();
  });

  testHigh('verify workflow execution details screen', {
    dependsOn: ['verify completion and click view workflow'],
    tags: ['@core', '@workflow', '@execute', '@execution-details', '@react-flow'],
    description: 'Verify workflow execution details screen shows correct breadcrumb with timestamp and all three workflow nodes with green borders'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting verify workflow execution details screen test');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyWorkflowExecutionDetailsScreen();
  });

  testHigh('verify node execution details', {
    dependsOn: ['verify workflow execution details screen'],
    tags: ['@core', '@workflow', '@execute', '@node-details', '@sidebar'],
    description: 'Click each executed node and verify their execution details in the sidebar'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting verify node execution details test');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyNodeExecutionDetails();
  });

  testHigh('navigate back to workflow page via breadcrumb', {
    dependsOn: ['verify node execution details'],
    tags: ['@core', '@workflow', '@breadcrumb', '@navigation'],
    description: 'Click Workflow breadcrumb text to navigate back to workflow page'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting navigate back to workflow page via breadcrumb test');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.clickWorkflowBreadcrumbFromExecution();
  });

  testHigh('verify workflow template appears in templates page', {
    dependsOn: ['navigate back to workflow page via breadcrumb'],
    tags: ['@core', '@workflow', '@template', '@verification'],
    description: 'Verify that the created workflow template appears with correct name and timestamp when Save as Private was clicked'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting verify workflow template appears test');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyWorkflowTemplateAppears();
  });

});