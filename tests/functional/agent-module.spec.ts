/**
 * Agent Module Test - Using priority and dependency management
 */

import {test, testHighest, testHigh, expect } from '@/framework/core/test-fixtures';
import { LoginHelper } from '@/framework/pages/login-helper';
import { AgentModulePage } from '@/framework/pages/agent-module-page';

// Configure tests to run sequentially and share browser context
test.describe.configure({ mode: 'serial' });

test.describe('Agent Module Tests', () => {
  
  testHighest('user login', {
    tags: ['@critical', '@auth', '@agent'],
    description: 'Authenticate user for agent module access'
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

  testHigh('navigate to agent page', {
    dependsOn: ['user login'],
    tags: ['@core', '@navigation', '@agent'],
    description: 'Navigate to agent page after successful login'
  }, async ({ sharedPage }) => {
    console.log('🚀 Starting high priority agent navigation');
    
    const { page } = sharedPage;
    
    // Verify the agent navigation link is visible
    const agentNavLink = page.locator('a[href="/agent"]');
    await expect(agentNavLink).toBeVisible({ timeout: 10000 });
    console.log('✅ Agent navigation link is visible');

    // Verify the bot icon is present within the link
    const botIcon = agentNavLink.locator('svg.lucide-bot');
    await expect(botIcon).toBeVisible();
    console.log('✅ Bot icon is visible within agent link');

    // Click the agent navigation link
    await agentNavLink.click();
    console.log('✅ Clicked agent navigation link');

    // Wait for navigation and verify we're on the agent page
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toContain('/agent');
    await page.waitForTimeout(20000);
    console.log('✅ Successfully navigated to agent page:', currentUrl);
  });

  testHigh('verify and click agent create button', {
    dependsOn: ['navigate to agent page'],
    tags: ['@core', '@agent', '@button'],
    description: 'Verify CREATE button functionality on agent page'
  }, async ({ sharedPage }) => {
    const agentPage = new AgentModulePage(sharedPage);
    await agentPage.verifyAndClickAgentCreateButton();
  });

  testHigh('verify create agent form elements after clicking CREATE button', {
    dependsOn: ['verify and click agent create button'],
    tags: ['@core', '@agent', '@form'],
    description: 'Verify create agent form elements after CREATE button click'
  }, async ({ sharedPage }) => {
    const agentPage = new AgentModulePage(sharedPage);
    await agentPage.verifyCreateAgentFormElements();
  });

  testHigh('create agent with form data', {
    dependsOn: ['verify create agent form elements after clicking CREATE button'],
    tags: ['@core', '@agent', '@form-fill'],
    description: 'Fill and submit create agent form'
  }, async ({ sharedPage }) => {
    const agentPage = new AgentModulePage(sharedPage);
    await agentPage.createAgentWithFormData();
  });

  testHigh('verify success popup after agent creation', {
    dependsOn: ['create agent with form data'],
    tags: ['@core', '@agent', '@popup'],
    description: 'Verify success popup appears after agent creation'
  }, async ({ sharedPage }) => {
    const agentPage = new AgentModulePage(sharedPage);
    await agentPage.verifySuccessPopupAfterAgentCreation();
  });

  testHigh('verify created agent appears in ALL and MADE-BY-ME tabs', {
    dependsOn: ['verify success popup after agent creation'],
    tags: ['@core', '@agent', '@verification'],
    description: 'Verify created agent appears in agent list tabs'
  }, async ({ sharedPage }) => {
    const agentPage = new AgentModulePage(sharedPage);
    await agentPage.verifyCreatedAgentAppearsInTabs();
  });

  testHigh('edit created agent and verify success', {
    dependsOn: ['verify created agent appears in ALL and MADE-BY-ME tabs'],
    tags: ['@core', '@agent', '@edit'],
    description: 'Edit the created agent and verify success popup'
  }, async ({ sharedPage }) => {
    const agentPage = new AgentModulePage(sharedPage);
    await agentPage.editCreatedAgentAndVerifySuccess();
  });

  testHigh('verify edited agent details in tabs', {
    dependsOn: ['edit created agent and verify success'],
    tags: ['@core', '@agent', '@verification'],
    description: 'Verify edited agent appears with updated details in MADE-BY-ME and ALL tabs'
  }, async ({ sharedPage }) => {
    const agentPage = new AgentModulePage(sharedPage);
    await agentPage.verifyEditedAgentDetailsInTabs();
  });

  testHigh('delete agent and verify removal', {
    dependsOn: ['verify edited agent details in tabs'],
    tags: ['@core', '@agent', '@delete'],
    description: 'Delete the created agent and verify it is removed'
  }, async ({ sharedPage }) => {
    const agentPage = new AgentModulePage(sharedPage);
    await agentPage.deleteAgentAndVerifyRemoval();
  });

});
