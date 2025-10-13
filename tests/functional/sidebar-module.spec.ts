/**
 * Sidebar Module Test - Using priority and dependency management with Page Object Model
 */

import { test, testHighest, testHigh, expect } from '@/framework/core/test-fixtures';
import { LoginHelper } from '@/framework/pages/login-helper';
import { SidebarModulePage } from '@/framework/pages/sidebar-module-page';

// Configure tests to run sequentially and share browser context
test.describe.configure({ mode: 'serial' });

test.describe('Sidebar Module Tests', () => {
  
  testHighest('user login', {
    tags: ['@critical', '@auth', '@sidebar'],
    description: 'Authenticate user for sidebar module access'
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

  testHigh('click history icon and verify history panel opens', {
    dependsOn: ['user login'],
    tags: ['@core', '@sidebar', '@modal'],
    description: 'Click history icon and verify history panel opens with correct content'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const sidebarPage = new SidebarModulePage(page);
    
    // Use the page object method to test history icon
    await sidebarPage.clickHistoryIcon();
    await sidebarPage.verifyHistoryPanelContent();
    await sidebarPage.closeHistoryPanel();
  });

  testHigh('click users icon and verify users panel opens', {
    dependsOn: ['click history icon and verify history panel opens'],
    tags: ['@core', '@sidebar', '@modal'],
    description: 'Click users icon and verify workspace users panel opens'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const sidebarPage = new SidebarModulePage(page);
    
    // Use the page object method to test users icon
    await sidebarPage.clickUsersIcon();
    await sidebarPage.verifyUsersPanelContent();
    await sidebarPage.closeUsersPanel();
  });

  testHigh('click workflow icon and verify navigation', {
    dependsOn: ['click users icon and verify users panel opens'],
    tags: ['@core', '@sidebar', '@navigation'],
    description: 'Click workflow icon and verify navigation to workflow page'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const sidebarPage = new SidebarModulePage(page);
    
    // Use the page object method to test workflow navigation
    await sidebarPage.clickWorkflowIcon();
  });

  testHigh('click agent icon and verify navigation', {
    dependsOn: ['click workflow icon and verify navigation'],
    tags: ['@core', '@sidebar', '@navigation'],
    description: 'Click agent icon and verify navigation to agent page'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const sidebarPage = new SidebarModulePage(page);
    
    // Use the page object method to test agent navigation
    await sidebarPage.clickAgentIcon();
  });

  testHigh('click integration icon and verify navigation', {
    dependsOn: ['click agent icon and verify navigation'],
    tags: ['@core', '@sidebar', '@navigation'],
    description: 'Click integration icon and verify navigation to integrations page'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const sidebarPage = new SidebarModulePage(page);
    
    // Use the page object method to test integration navigation
    await sidebarPage.clickIntegrationIcon();
  });

  testHigh('click knowledge management icon and verify navigation', {
    dependsOn: ['click integration icon and verify navigation'],
    tags: ['@core', '@sidebar', '@navigation'],
    description: 'Click knowledge management icon and verify navigation to knowledge management page'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const sidebarPage = new SidebarModulePage(page);
    
    // Use the page object method to test knowledge management navigation
    await sidebarPage.clickKnowledgeManagementIcon();
  });

  testHigh('click user management icon and verify navigation', {
    dependsOn: ['click knowledge management icon and verify navigation'],
    tags: ['@core', '@sidebar', '@navigation'],
    description: 'Click user management icon and verify navigation to user management page'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const sidebarPage = new SidebarModulePage(page);
    
    // Use the page object method to test user management navigation
    await sidebarPage.clickUserManagementIcon();
  });

  testHigh('click dashboard icon and verify navigation', {
    dependsOn: ['click user management icon and verify navigation'],
    tags: ['@core', '@sidebar', '@navigation'],
    description: 'Click dashboard icon and verify navigation to dashboard page'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const sidebarPage = new SidebarModulePage(page);
    
    // Use the page object method to test dashboard navigation (don't go back to home)
    await sidebarPage.clickDashboardIcon();
  });

  testHigh('click new chat icon and verify navigation to home', {
    dependsOn: ['click dashboard icon and verify navigation'],
    tags: ['@core', '@sidebar', '@navigation'],
    description: 'Click new chat/plus icon and verify it navigates back to home page'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const sidebarPage = new SidebarModulePage(page);
    
    // Use the page object method to test new chat icon from dashboard
    await sidebarPage.clickNewChatIcon();
  });

  testHigh('click theme toggle and verify theme changes', {
    dependsOn: ['click new chat icon and verify navigation to home'],
    tags: ['@core', '@sidebar', '@theme'],
    description: 'Click theme toggle icon and verify theme switches between light and dark'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const sidebarPage = new SidebarModulePage(page);
    
    // Use the page object method to test theme toggle
    const themeChanged = await sidebarPage.clickThemeToggle();
    expect(themeChanged, 'Theme should toggle successfully').toBe(true);
  });
});
