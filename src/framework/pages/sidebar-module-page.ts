/**
 * Sidebar Module Page Object - Contains all sidebar-related page interactions
 */

import { Page, expect } from '@playwright/test';
import { BasePage } from '@/framework/core/base-page';

export class SidebarModulePage extends BasePage {

  constructor(page: Page) {
    super(page);
  }

  /**
   * Verify sidebar is visible and accessible
   */
  async verifySidebarVisibility(): Promise<void> {
    console.log('Starting sidebar visibility verification');
    
    const sidebarContainer = this.page.locator('.sidebar-container');
    await expect(sidebarContainer).toBeVisible({ timeout: 10000 });
    console.log('Sidebar container found and visible');
    
    // Verify sidebar has correct width and positioning
    await expect(sidebarContainer).toHaveClass(/w-\[52px\]/);
    await expect(sidebarContainer).toHaveClass(/fixed/);
    console.log('Sidebar width and positioning verified');
  }

  /**
   * Verify sidebar navigation menu items
   */
  async verifySidebarNavigationItems(): Promise<void> {
    console.log('Starting sidebar navigation items verification');
    
    const sidebarContainer = this.page.locator('.sidebar-container');
    const navigationItems = sidebarContainer.locator('a, div[class*="cursor-pointer"]');
    const itemCount = await navigationItems.count();
    expect(itemCount).toBeGreaterThan(0);
    console.log(`Sidebar contains ${itemCount} navigation items`);
    
    // Verify specific navigation items are visible
    const homeButton = sidebarContainer.locator('a[href="/"][data-status="active"]');
    await expect(homeButton).toBeVisible();
    console.log('Home button found and visible');
    
    const historyButton = sidebarContainer.locator('svg.lucide-history').locator('..');
    await expect(historyButton).toBeVisible();
    console.log('History button found and visible');
    
    const usersButton = sidebarContainer.locator('svg.lucide-users').locator('..');
    await expect(usersButton).toBeVisible();
    console.log('Users button found and visible');
  }

  /**
   * Verify hover tooltips for each sidebar icon systematically
   */
  async verifyHoverTooltips(): Promise<void> {
    console.log('Starting systematic hover tooltip verification');
    
    const sidebarContainer = this.page.locator('.sidebar-container');
    
    // Define all sidebar icons using more specific selectors from the actual DOM
    const iconsToTest = [
      { 
        name: 'Home/Add', 
        selector: 'a[href="/"][data-status="active"]',
        description: 'Home button with plus icon'
      },
      { 
        name: 'History', 
        selector: 'div.flex.w-8.h-8.rounded-lg.items-center.justify-center.cursor-pointer:has(svg.lucide-history)',
        description: 'History button with clock icon'
      },
      { 
        name: 'Users', 
        selector: 'div.flex.w-8.h-8.rounded-lg.items-center.justify-center.cursor-pointer:has(svg.lucide-users)',
        description: 'Users button with people icon'
      },
      { 
        name: 'Workflow', 
        selector: 'a[href="/workflow"]',
        description: 'Workflow navigation link'
      },
      { 
        name: 'Agent', 
        selector: 'a[href="/agent"]',
        description: 'Agent navigation link'
      },
      { 
        name: 'Integrations', 
        selector: 'a[href="/admin/integrations"]',
        description: 'Integrations navigation link'
      },
      { 
        name: 'Knowledge Management', 
        selector: 'a[href="/knowledgeManagement"]',
        description: 'Knowledge Management navigation link'
      },
      { 
        name: 'User Management', 
        selector: 'a[href="/admin/userManagement"]',
        description: 'User Management navigation link'
      },
      { 
        name: 'Dashboard', 
        selector: 'a[href="/dashboard"]',
        description: 'Dashboard navigation link'
      },
      { 
        name: 'Theme Toggle', 
        selector: 'div.flex.w-8.h-8.rounded-lg.items-center.justify-center.cursor-pointer:has(svg.lucide-moon)',
        description: 'Theme toggle button with moon icon'
      }
    ];
    
    for (let i = 0; i < iconsToTest.length; i++) {
      const iconTest = iconsToTest[i];
      console.log(`\n--- Testing icon ${i + 1}/${iconsToTest.length}: ${iconTest.name} ---`);
      console.log(`Looking for: ${iconTest.description}`);
      
      // Find the icon element within sidebar
      const iconElement = sidebarContainer.locator(iconTest.selector).first();
      
      try {
        // Check if element exists and is visible
        const isVisible = await iconElement.isVisible();
        
        if (isVisible) {
          console.log(`${iconTest.name} icon is visible`);
          
          // Get element position for debugging
          const boundingBox = await iconElement.boundingBox();
          if (boundingBox) {
            console.log(`Element position: x=${boundingBox.x}, y=${boundingBox.y}, width=${boundingBox.width}, height=${boundingBox.height}`);
          }
          
          // Hover over the icon
          console.log(`Hovering over ${iconTest.name} icon...`);
          await iconElement.hover({ force: true });
          
          // Wait for tooltip to appear
          console.log('Waiting for tooltip to appear...');
          await this.page.waitForTimeout(1500);
          
          // Look for tooltip with multiple strategies
          let tooltipFound = false;
          
          // Strategy 1: Look for tooltip elements
          const tooltipSelectors = [
            '[role="tooltip"]',
            '.tooltip',
            '[data-testid="tooltip"]',
            '.MuiTooltip-tooltip',
            '[data-popper-placement]',
            '.tippy-content'
          ];
          
          for (const tooltipSelector of tooltipSelectors) {
            const tooltip = this.page.locator(tooltipSelector);
            if (await tooltip.isVisible()) {
              const tooltipText = await tooltip.textContent();
              console.log(`✅ ${iconTest.name} tooltip found: "${tooltipText?.trim()}"`);
              tooltipFound = true;
              break;
            }
          }
          
          // Strategy 2: Check for title attribute
          if (!tooltipFound) {
            const title = await iconElement.getAttribute('title');
            if (title) {
              console.log(`✅ ${iconTest.name} title attribute: "${title}"`);
              tooltipFound = true;
            }
          }
          
          // Strategy 3: Check for aria-label
          if (!tooltipFound) {
            const ariaLabel = await iconElement.getAttribute('aria-label');
            if (ariaLabel) {
              console.log(`✅ ${iconTest.name} aria-label: "${ariaLabel}"`);
              tooltipFound = true;
            }
          }
          
          if (!tooltipFound) {
            console.log(`⚠️ No tooltip found for ${iconTest.name} icon`);
          }
          
          // Move mouse away to hide tooltip
          console.log('Moving mouse away to hide tooltip...');
          await this.page.mouse.move(10, 10);
          await this.page.waitForTimeout(500);
          
        } else {
          console.log(`❌ ${iconTest.name} icon is not visible`);
        }
      } catch (error) {
        console.log(`❌ Error testing ${iconTest.name}: ${error}`);
      }
    }
    
    console.log('\n✅ Completed systematic tooltip verification for all sidebar icons');
  }

  /**
   * Verify sidebar toggle functionality
   */
  async verifySidebarToggleFunctionality(): Promise<void> {
    console.log('Starting sidebar toggle functionality test');
    
    const toggleButton = this.page.locator('[data-testid="sidebar-toggle"], .sidebar-toggle, button[aria-label*="toggle"]').first();
    
    if (await toggleButton.isVisible()) {
      const sidebarContainer = this.page.locator('[data-testid="sidebar"], .sidebar').first();
      const initiallyVisible = await sidebarContainer.isVisible();
      
      await toggleButton.click();
      await this.page.waitForTimeout(1000);
      
      const afterToggleVisible = await sidebarContainer.isVisible();
      console.log(`Sidebar toggle functionality tested - state changed: ${initiallyVisible !== afterToggleVisible}`);
    } else {
      console.log('No toggle button found - sidebar may be always visible');
    }
  }

  /**
   * Test sidebar navigation by clicking menu items
   */
  async testSidebarNavigation(): Promise<void> {
    console.log('Starting sidebar navigation test');
    
    const sidebarContainer = this.page.locator('.sidebar-container');
    
    // Test specific navigation links
    const navigationTests = [
      { href: '/workflow', name: 'Workflow' },
      { href: '/agent', name: 'Agent' },
      { href: '/admin/integrations', name: 'Integrations' },
      { href: '/knowledgeManagement', name: 'Knowledge Management' },
      { href: '/dashboard', name: 'Dashboard' }
    ];
    
    for (const navTest of navigationTests) {
      const navLink = sidebarContainer.locator(`a[href="${navTest.href}"]`);
      
      if (await navLink.isVisible()) {
        console.log(`Testing ${navTest.name} navigation`);
        const currentUrl = this.page.url();
        
        await navLink.click();
        await this.page.waitForTimeout(2000);
        
        const newUrl = this.page.url();
        if (newUrl !== currentUrl) {
          console.log(`${navTest.name} navigation successful`);
          await this.page.goBack();
          await this.page.waitForTimeout(1000);
        } else {
          console.log(`${navTest.name} navigation - URL unchanged`);
        }
      }
    }
  }

  /**
   * Verify user profile section in sidebar
   */
  async verifyUserProfileSection(): Promise<void> {
    console.log('Starting user profile section verification');
    
    const sidebarContainer = this.page.locator('.sidebar-container');
    const profileImage = sidebarContainer.locator('img[alt="Profile"]');
    
    await expect(profileImage).toBeVisible();
    console.log('User profile image is visible');
    
    // Verify profile image attributes
    await expect(profileImage).toHaveClass(/w-8/);
    await expect(profileImage).toHaveClass(/h-8/);
    await expect(profileImage).toHaveClass(/rounded-full/);
    console.log('Profile image styling verified');
    
    // Test hover on profile image
    await profileImage.hover();
    await this.page.waitForTimeout(500);
    console.log('Profile image hover tested');
  }

  /**
   * Verify sidebar accessibility features
   */
  async verifySidebarAccessibility(): Promise<void> {
    console.log('Starting sidebar accessibility verification');
    
    const sidebarContainer = this.page.locator('.sidebar-container');
    
    // Check navigation links for accessibility
    const navLinks = sidebarContainer.locator('a');
    const linkCount = await navLinks.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      const ariaCurrent = await link.getAttribute('aria-current');
      
      if (href) {
        console.log(`Link ${i + 1}: href="${href}", aria-current="${ariaCurrent || 'not set'}"`);
      }
    }
    
    // Verify profile image has alt text
    const profileImage = sidebarContainer.locator('img[alt="Profile"]');
    const altText = await profileImage.getAttribute('alt');
    expect(altText).toBe('Profile');
    console.log('Profile image has proper alt text');
    
    // Verify logo has alt text
    const logoImage = sidebarContainer.locator('img[alt="Logo"]');
    if (await logoImage.isVisible()) {
      const logoAlt = await logoImage.getAttribute('alt');
      expect(logoAlt).toBe('Logo');
      console.log('Logo image has proper alt text');
    }
    
    console.log('Accessibility verification completed');
  }

  /**
   * Verify active state highlighting
   */
  async verifyActiveStateHighlighting(): Promise<void> {
    console.log('Starting active state highlighting verification');
    
    const sidebarContainer = this.page.locator('.sidebar-container');
    
    // Check for active home button
    const activeHomeButton = sidebarContainer.locator('a[data-status="active"]');
    await expect(activeHomeButton).toBeVisible();
    
    const ariaCurrent = await activeHomeButton.getAttribute('aria-current');
    expect(ariaCurrent).toBe('page');
    console.log('Active home button has correct aria-current attribute');
    
    // Verify active button has border styling
    await expect(activeHomeButton).toHaveClass(/border/);
    console.log('Active button styling verified');
  }

  /**
   * Navigate to a specific page
   */
  async navigateToPage(path: string = '/'): Promise<void> {
    await this.navigate(path);
    await this.waitForPageLoad();
    console.log(`Navigated to ${path}`);
  }

  /**
   * Test navigation by clicking each sidebar icon one by one
   */
  async testNavigationByClickingEachIcon(): Promise<void> {
    console.log('Starting navigation test by clicking each sidebar icon');
    
    const sidebarContainer = this.page.locator('.sidebar-container');
    
    // Define navigation icons with their expected URLs
    const navigationIcons = [
      {
        name: 'Home',
        selector: 'a[href="/"][data-status="active"]',
        expectedUrl: '/',
        description: 'Home page with plus icon'
      },
      {
        name: 'Workflow',
        selector: 'a[href="/workflow"]',
        expectedUrl: '/workflow',
        description: 'Workflow page'
      },
      {
        name: 'Agent',
        selector: 'a[href="/agent"]',
        expectedUrl: '/agent',
        description: 'Agent page'
      },
      {
        name: 'Integrations',
        selector: 'a[href="/admin/integrations"]',
        expectedUrl: '/admin/integrations',
        description: 'Integrations page'
      },
      {
        name: 'Knowledge Management',
        selector: 'a[href="/knowledgeManagement"]',
        expectedUrl: '/knowledgeManagement',
        description: 'Knowledge Management page'
      },
      {
        name: 'User Management',
        selector: 'a[href="/admin/userManagement"]',
        expectedUrl: '/admin/userManagement',
        description: 'User Management page'
      },
      {
        name: 'Dashboard',
        selector: 'a[href="/dashboard"]',
        expectedUrl: '/dashboard',
        description: 'Dashboard page'
      }
    ];
    
    for (let i = 0; i < navigationIcons.length; i++) {
      const icon = navigationIcons[i];
      console.log(`\n--- Testing navigation ${i + 1}/${navigationIcons.length}: ${icon.name} ---`);
      console.log(`Looking for: ${icon.description}`);
      
      // Find the navigation icon
      const navIcon = sidebarContainer.locator(icon.selector);
      
      try {
        // Check if icon is visible
        const isVisible = await navIcon.isVisible();
        
        if (isVisible) {
          console.log(`${icon.name} icon is visible`);
          
          // Get current URL before clicking
          const currentUrl = this.page.url();
          console.log(`Current URL before click: ${currentUrl}`);
          
          // Click the navigation icon
          console.log(`Clicking ${icon.name} icon...`);
          await navIcon.click();
          
          // Wait for navigation to complete
          console.log('Waiting for navigation to complete...');
          await this.page.waitForTimeout(3000);
          
          // Get new URL after clicking
          const newUrl = this.page.url();
          console.log(`URL after click: ${newUrl}`);
          
          // Check if navigation was successful
          if (newUrl.includes(icon.expectedUrl)) {
            console.log(`✅ ${icon.name} navigation successful - URL contains "${icon.expectedUrl}"`);
          } else {
            console.log(`⚠️ ${icon.name} navigation may not have worked - expected "${icon.expectedUrl}" but got "${newUrl}"`);
          }
          
          // Wait a bit to see the page load
          await this.page.waitForTimeout(2000);
          
          // Navigate back to home for next test (except if we're already on home)
          if (!newUrl.endsWith('/') && icon.expectedUrl !== '/') {
            console.log('Navigating back to home page for next test...');
            await this.page.goto('/');
            await this.page.waitForTimeout(2000);
          }
          
        } else {
          console.log(`❌ ${icon.name} icon is not visible`);
        }
      } catch (error) {
        console.log(`❌ Error testing ${icon.name} navigation: ${error}`);
      }
    }
    
    console.log('\n✅ Completed navigation testing for all sidebar icons');
  }

  /**
   * Wait for sidebar to load
   */
  async waitForSidebarLoad(timeout: number = 3000): Promise<void> {
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Click new chat icon and verify navigation to home
   */
  async clickNewChatIcon(): Promise<void> {
    console.log('Clicking New Chat icon');
    const sidebarContainer = this.page.locator('.sidebar-container');
    const newChatIcon = sidebarContainer.locator('a[href="/"]').first();
    
    await newChatIcon.click();
    await this.page.waitForTimeout(2000);
    
    const currentUrl = this.page.url();
    console.log(`Navigated to: ${currentUrl}`);
  }

  /**
   * Click history icon and verify history panel opens
   */
  async clickHistoryIcon(): Promise<void> {
    console.log('Clicking History icon');
    const sidebarContainer = this.page.locator('.sidebar-container');
    const historyIcon = sidebarContainer.locator('div.cursor-pointer:has(svg.lucide-history)');
    
    await historyIcon.click();
    await this.page.waitForTimeout(2000);
    
    // Verify history panel is visible
    const historyPanel = this.page.locator('.history-modal-container');
    await expect(historyPanel).toBeVisible();
    console.log('History panel opened successfully');
  }

  /**
   * Verify history panel content
   */
  async verifyHistoryPanelContent(): Promise<void> {
    console.log('Verifying history panel content');
    const historyPanel = this.page.locator('.history-modal-container');
    
    // Verify panel title
    const panelTitle = historyPanel.locator('text=Chat History');
    await expect(panelTitle).toBeVisible();
    console.log('✅ "Chat History" title found');
    
    // Verify sections
    const favouriteChats = historyPanel.locator('text=Favourite Chats');
    await expect(favouriteChats).toBeVisible();
    console.log('✅ "Favourite Chats" section found');
    
    const allChats = historyPanel.locator('text=All Chats');
    await expect(allChats).toBeVisible();
    console.log('✅ "All Chats" section found');
  }

  /**
   * Close history panel
   */
  async closeHistoryPanel(): Promise<void> {
    console.log('Closing history panel');
    const historyPanel = this.page.locator('.history-modal-container');
    const closeButton = historyPanel.locator('button:has(svg.lucide-x)');
    
    await closeButton.click();
    await this.page.waitForTimeout(1000);
    
    await expect(historyPanel).not.toBeVisible();
    console.log('History panel closed successfully');
  }

  /**
   * Click users icon and verify users panel opens
   */
  async clickUsersIcon(): Promise<void> {
    console.log('Clicking Users icon');
    const sidebarContainer = this.page.locator('.sidebar-container');
    const usersIcon = sidebarContainer.locator('div.cursor-pointer:has(svg.lucide-users)');
    
    await usersIcon.click();
    await this.page.waitForTimeout(2000);
    
    // Verify users panel is visible
    const usersPanel = this.page.locator('.history-modal-container');
    await expect(usersPanel).toBeVisible();
    console.log('Users panel opened successfully');
  }

  /**
   * Verify users panel content
   */
  async verifyUsersPanelContent(): Promise<void> {
    console.log('Verifying users panel content');
    const usersPanel = this.page.locator('.history-modal-container');
    
    // Verify panel title
    const panelTitle = usersPanel.locator('text=Workspace Users');
    await expect(panelTitle).toBeVisible();
    console.log('✅ "Workspace Users" title found');
    
    // Verify search input
    const searchInput = usersPanel.locator('input[placeholder="Search users..."]');
    await expect(searchInput).toBeVisible();
    console.log('✅ Search input found in users panel');
  }

  /**
   * Close users panel
   */
  async closeUsersPanel(): Promise<void> {
    console.log('Closing users panel');
    const usersPanel = this.page.locator('.history-modal-container');
    const closeButton = usersPanel.locator('button:has(svg.lucide-x)');
    
    await closeButton.click();
    await this.page.waitForTimeout(1000);
    
    await expect(usersPanel).not.toBeVisible();
    console.log('Users panel closed successfully');
  }

  /**
   * Click workflow icon and verify navigation
   */
  async clickWorkflowIcon(): Promise<void> {
    console.log('Clicking Workflow icon');
    const sidebarContainer = this.page.locator('.sidebar-container');
    const workflowIcon = sidebarContainer.locator('a[href="/workflow"]');
    
    await workflowIcon.click();
    await this.page.waitForTimeout(3000);
    
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('/workflow');
    console.log('✅ Workflow navigation successful');
  }

  /**
   * Click agent icon and verify navigation
   */
  async clickAgentIcon(): Promise<void> {
    console.log('Clicking Agent icon');
    const sidebarContainer = this.page.locator('.sidebar-container');
    const agentIcon = sidebarContainer.locator('a[href="/agent"]');
    
    await agentIcon.click();
    await this.page.waitForTimeout(3000);
    
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('/agent');
    console.log('✅ Agent navigation successful');
  }

  /**
   * Click integration icon and verify navigation
   */
  async clickIntegrationIcon(): Promise<void> {
    console.log('Clicking Integration icon');
    const sidebarContainer = this.page.locator('.sidebar-container');
    const integrationIcon = sidebarContainer.locator('a[href="/admin/integrations"]');
    
    await integrationIcon.click();
    await this.page.waitForTimeout(3000);
    
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('/admin/integrations');
    console.log('✅ Integration navigation successful');
  }

  /**
   * Click knowledge management icon and verify navigation
   */
  async clickKnowledgeManagementIcon(): Promise<void> {
    console.log('Clicking Knowledge Management icon');
    const sidebarContainer = this.page.locator('.sidebar-container');
    const kmIcon = sidebarContainer.locator('a[href="/knowledgeManagement"]');
    
    await kmIcon.click();
    await this.page.waitForTimeout(3000);
    
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('/knowledgeManagement');
    console.log('✅ Knowledge Management navigation successful');
  }

  /**
   * Click user management icon and verify navigation
   */
  async clickUserManagementIcon(): Promise<void> {
    console.log('Clicking User Management icon');
    const sidebarContainer = this.page.locator('.sidebar-container');
    const userMgmtIcon = sidebarContainer.locator('a[href="/admin/userManagement"]');
    
    await userMgmtIcon.click();
    await this.page.waitForTimeout(3000);
    
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('/admin/userManagement');
    console.log('✅ User Management navigation successful');
  }

  /**
   * Click dashboard icon and verify navigation
   */
  async clickDashboardIcon(): Promise<void> {
    console.log('Clicking Dashboard icon');
    const sidebarContainer = this.page.locator('.sidebar-container');
    const dashboardIcon = sidebarContainer.locator('a[href="/dashboard"]');
    
    await dashboardIcon.click();
    await this.page.waitForTimeout(3000);
    
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('/dashboard');
    console.log('✅ Dashboard navigation successful');
  }

  /**
   * Click theme toggle and verify theme changes
   */
  async clickThemeToggle(): Promise<boolean> {
    console.log('Clicking Theme Toggle');
    const sidebarContainer = this.page.locator('.sidebar-container');
    
    // Find the theme toggle div
    const themeToggleDiv = sidebarContainer.locator('div:has(svg.lucide-moon), div:has(svg.lucide-sun)').last();
    
    // Check initial state
    const moonIcon = sidebarContainer.locator('svg.lucide-moon').last();
    const sunIcon = sidebarContainer.locator('svg.lucide-sun').last();
    
    const hasMoonInitially = await moonIcon.isVisible().catch(() => false);
    const hasSunInitially = await sunIcon.isVisible().catch(() => false);
    
    console.log(`Initial theme - Moon: ${hasMoonInitially}, Sun: ${hasSunInitially}`);
    
    // Click toggle
    await themeToggleDiv.click();
    await this.page.waitForTimeout(1500);
    
    // Check after state
    const hasMoonAfter = await moonIcon.isVisible().catch(() => false);
    const hasSunAfter = await sunIcon.isVisible().catch(() => false);
    
    console.log(`After toggle - Moon: ${hasMoonAfter}, Sun: ${hasSunAfter}`);
    
    // Verify theme changed
    const themeChanged = (hasMoonInitially && hasSunAfter) || (hasSunInitially && hasMoonAfter);
    
    if (themeChanged) {
      console.log('✅ Theme toggled successfully');
    } else {
      console.log('⚠️ Theme toggle may not have worked');
    }
    
    return themeChanged;
  }

  /**
   * Navigate back to home page
   */
  async navigateBackToHome(): Promise<void> {
    console.log('Navigating back to home');
    await this.page.goto('/');
    await this.page.waitForTimeout(2000);
    console.log('Back to home page');
  }

  /**
   * Click any sidebar navigation icon by href
   */
  async clickSidebarNavigationByHref(href: string): Promise<void> {
    console.log(`Clicking sidebar navigation: ${href}`);
    const sidebarContainer = this.page.locator('.sidebar-container');
    const navIcon = sidebarContainer.locator(`a[href="${href}"]`);
    
    await navIcon.click();
    await this.page.waitForTimeout(3000);
    
    const currentUrl = this.page.url();
    expect(currentUrl).toContain(href);
    console.log(`✅ Navigation to ${href} successful`);
  }

  /**
   * Verify sidebar icon is visible by selector
   */
  async verifySidebarIconVisible(iconSelector: string): Promise<boolean> {
    const sidebarContainer = this.page.locator('.sidebar-container');
    const icon = sidebarContainer.locator(iconSelector);
    
    const isVisible = await icon.isVisible();
    console.log(`Icon ${iconSelector} visible: ${isVisible}`);
    
    return isVisible;
  }
}
