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

  testHigh('verify workflow page elements', {
    dependsOn: ['navigate to workflow page'],
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

  testHigh('save and verify saved workflow', {
    dependsOn: ['add email node'],
    tags: ['@core', '@workflow', '@save', '@success-popup', '@execute-button'],
    description: 'Click Save Changes button, verify success popup appears, and verify execute button is enabled'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting save and verify saved workflow');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.saveAndVerifyWorkflow();
  });

  testHigh('execute workflow', {
    dependsOn: ['save and verify saved workflow'],
    tags: ['@core', '@workflow', '@execute', '@file-upload'],
    description: 'Click execute button, verify popup appears with correct workflow name, upload solar system PDF, and start execution'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting execute workflow test');

    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.executeWorkflow();
  });

});