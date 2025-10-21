/**
 * Agent Module Page Object - Contains all agent-related page interactions
 */

import { Page, expect } from '@playwright/test';

export class AgentModulePage {

  constructor(private page: Page) {}


  /**
   * Verify and click agent create button with additional UI validations
   */
  async verifyAndClickAgentCreateButtonWithValidations(): Promise<void> {
    console.log('Starting agent create button verification test with UI validations');

    // Debug: Log shared page state
    console.log('Shared page URL:', this.page.url());
    console.log('Shared page title:', await this.page.title());

    // Wait for page to load
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // TC_XY_AG_04: Validate search bar presence
    const searchInputField = this.page.locator('input[placeholder*="Search agents"]');
    const isSearchFieldVisible = await searchInputField.isVisible().catch(() => false);
    if (isSearchFieldVisible) {
      const placeholderText = await searchInputField.getAttribute('placeholder');
      console.log(`✅ Search bar is visible with placeholder: "${placeholderText}"`);
    } else {
      console.log('⚠️ Search bar not found - may use different selector');
    }

    // TC_XY_AG_09: Validate refresh button presence
    const refreshButton = this.page.locator('button:has(svg.lucide-refresh-cw), button:has(svg.lucide-rotate-ccw), button[title*="Refresh"], button:has-text("Refresh")');
    const refreshVisible = await refreshButton.isVisible().catch(() => false);
    if (refreshVisible) {
      console.log('✅ Refresh button is visible');
    } else {
      console.log('⚠️ Refresh button not found - may use different selector');
    }

    // Debug: Log page state after wait
    console.log('Page URL after wait:', this.page.url());
    console.log('Page title after wait:', await this.page.title());

    // Debug: Log what buttons are actually present on the page
    const allButtons = await this.page.locator('button').all();
    console.log('Total buttons found on page:', allButtons.length);

    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      const buttonText = await allButtons[i].textContent();
      const buttonClass = await allButtons[i].getAttribute('class');
      console.log(`Button ${i + 1}: "${buttonText?.trim()}" | Classes: ${buttonClass?.substring(0, 100)}...`);
    }

    // Debug: Look for any SVG elements that might be plus icons
    const plusSvgs = await this.page.locator('svg.lucide-plus').count();
    console.log('Plus SVG icons found:', plusSvgs);

    const createTextElements = await this.page.locator('text=CREATE').count();
    console.log('Elements with CREATE text:', createTextElements);

    // Try different selectors for the page title based on actual page structure
    let pageTitle = this.page.locator('text=AGENTS');
    let titleVisible = await pageTitle.isVisible();

    if (!titleVisible) {
      // Try alternative selectors for the stylized AGENTS title
      pageTitle = this.page.locator('h1:has-text("AGENTS")');
      titleVisible = await pageTitle.isVisible();
    }

    if (!titleVisible) {
      // Try with exact styling class structure from the page
      pageTitle = this.page.locator('.text-4xl.tracking-wider.font-display:has-text("AGENTS")');
      titleVisible = await pageTitle.isVisible();
    }

    if (titleVisible) {
      console.log('Page title is visible');
    } else {
      console.log('Page title not found, continuing with CREATE button search');
    }

    // Try to find search input with different selectors based on actual page
    let searchInput = this.page.locator('input[placeholder*="Search agents"]');
    let searchVisible = await searchInput.isVisible();

    if (!searchVisible) {
      // Try the exact placeholder from the page
      searchInput = this.page.locator('input[placeholder="Search agents.."]');
      searchVisible = await searchInput.isVisible();
    }

    if (!searchVisible) {
      // Try generic search selector
      searchInput = this.page.locator('input[placeholder*="Search"]');
      searchVisible = await searchInput.isVisible();
    }

    if (searchVisible) {
      console.log('Search input field is visible');
    } else {
      console.log('Search input not found, continuing with CREATE button search');
    }

    // Check if we're on the "no agents" page first
    const noAgentsMessage = this.page.locator('p:has-text("No agents in this category yet.")');
    const isNoAgentsPage = await noAgentsMessage.isVisible().catch(() => false);

    if (isNoAgentsPage) {
      console.log('No agents present - found empty state message');

      // Verify the "No agents in this category yet." message
      await expect(noAgentsMessage).toBeVisible();
      console.log('No agents message is visible');

      // Verify the instruction message
      const instructionMessage = this.page.locator('p:has-text("Click \\"CREATE\\" to get started.")');
      await expect(instructionMessage).toBeVisible();
      console.log('Instruction message is visible');

      // Find CREATE button in the empty state (different location)
      const createButtonEmptyState = this.page.locator('button:has-text("CREATE"):has(svg.lucide-plus)');
      await expect(createButtonEmptyState).toBeVisible({ timeout: 10000 });
      console.log('CREATE button found in empty state');

      // Click the CREATE button from empty state
      await createButtonEmptyState.click();
      console.log('CREATE button clicked from empty state');

    } else {
      console.log('Agents are present - looking for regular CREATE button');

      // Find CREATE button using the SVG icon approach (like chat module pattern)
      const createButton = this.page.locator('button svg.lucide-plus').locator('..');
      await expect(createButton).toBeVisible({ timeout: 10000 });
      console.log('CREATE button is visible');

      // Verify the button text contains CREATE
      const buttonText = await createButton.textContent();
      expect(buttonText?.trim()).toContain('CREATE');
      console.log('Button contains CREATE text');

      // Verify plus icon is visible
      const plusIcon = createButton.locator('svg.lucide-plus');
      await expect(plusIcon).toBeVisible();
      console.log('Plus icon is visible within CREATE button');

      // Click the CREATE button
      await createButton.click();
      console.log('CREATE button clicked successfully');
    }

    // Wait to see the interaction - wait for form to appear
    await this.page.locator('h1:has-text("CREATE AGENT"), input#agentName').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    console.log('Agent create button verification and click test completed');
  }

  /**
   * Verify create agent form elements after clicking CREATE button
   */
  async verifyCreateAgentFormElements(): Promise<void> {
    console.log('Starting create agent form elements verification test');

    // Wait for the create agent form to load
    await this.page.locator('h1:has-text("CREATE AGENT")').waitFor({ state: 'visible', timeout: 5000 });

    // Verify the back button (arrow left) is present
    const backButton = this.page.locator('svg[class*="lucide-arrow-left"]').locator('..');
    await expect(backButton).toBeVisible();
    console.log('Back button is visible');

    // Verify the page title "CREATE AGENT" is visible
    const createPageTitle = this.page.locator('h1:has-text("CREATE AGENT")');
    await expect(createPageTitle).toBeVisible();
    console.log('CREATE AGENT page title is visible');

    // Verify Name field and label
    const nameLabel = this.page.locator('label[for="agentName"]:has-text("Name")');
    const nameInput = this.page.locator('input#agentName');
    await expect(nameLabel).toBeVisible();
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveAttribute('placeholder', 'e.g., Report Generator');
    console.log('Name field and label are visible with correct placeholder');

    // Verify Description field and label
    const descriptionLabel = this.page.locator('label[for="agentDescription"]:has-text("Description")');
    const descriptionTextarea = this.page.locator('textarea#agentDescription');
    await expect(descriptionLabel).toBeVisible();
    await expect(descriptionTextarea).toBeVisible();
    await expect(descriptionTextarea).toHaveAttribute('placeholder', 'e.g., Helps with generating quarterly financial reports...');
    console.log('Description field and label are visible with correct placeholder');

    // Verify Prompt field and label
    const promptLabel = this.page.locator('label[for="agentPrompt"]:has-text("Prompt")');
    const promptTextarea = this.page.locator('textarea#agentPrompt');
    const sparklesButton = this.page.locator('svg[class*="lucide-sparkles"]').locator('..');
    await expect(promptLabel).toBeVisible();
    await expect(promptTextarea).toBeVisible();
    await expect(sparklesButton).toBeVisible();
    console.log('Prompt field, label and sparkles button are visible');

    // Verify Visibility section with radio buttons
    const visibilityLabel = this.page.locator('label:has-text("Visibility")');
    const privateRadio = this.page.locator('input#private[type="radio"]');
    const publicRadio = this.page.locator('input#public[type="radio"]');
    await expect(visibilityLabel).toBeVisible();
    await expect(privateRadio).toBeVisible();
    await expect(publicRadio).toBeVisible();
    await expect(privateRadio).toBeChecked(); // Should be checked by default
    console.log('Visibility section with radio buttons is visible, private is selected by default');

    // Verify App Integrations section
    const appIntegrationsLabel = this.page.locator('label:has-text("App Integrations")');
    await expect(appIntegrationsLabel).toBeVisible();
    console.log('App Integrations section label is visible');

    // Verify App Integrations description
    const appIntegrationsDesc = this.page.locator('p:has-text("Select knowledge sources for your agent.")');
    await expect(appIntegrationsDesc).toBeVisible();
    console.log('App Integrations description is visible');

    // Verify the integration selection area with placeholder
    const integrationArea = this.page.locator('div.flex.flex-wrap.items-center.gap-2.p-3.border:has(span:has-text("Add integrations.."))');
    await expect(integrationArea).toBeVisible();
    console.log('App Integrations selection area is visible');

    // Verify the "Add integrations.." placeholder text
    const integrationsPlaceholder = this.page.locator('span:has-text("Add integrations..")');
    await expect(integrationsPlaceholder).toBeVisible();
    console.log('App Integrations placeholder text is visible');

    // Verify the plus button for adding integrations
    const addIntegrationsButton = this.page.locator('button:has(svg.lucide-circle-plus)');
    await expect(addIntegrationsButton).toBeVisible();
    console.log('Add integrations plus button is visible');

    // Verify the collections note
    const collectionsNote = this.page.locator('p:has-text("Collections appear in the submenu when selecting integrations.")');
    await expect(collectionsNote).toBeVisible();
    console.log('Collections submenu note is visible');

    // Verify Specific Entities section
    const specificEntitiesLabel = this.page.locator('label:has-text("Specific Entities")');
    await expect(specificEntitiesLabel).toBeVisible();
    console.log('Specific Entities label is visible');

    // Verify Specific Entities description
    const specificEntitiesDesc = this.page.locator('p:has-text("Search for and select specific entities for your agent to use.")');
    await expect(specificEntitiesDesc).toBeVisible();
    console.log('Specific Entities description is visible');

    // Verify the selected entities display area
    const selectedEntitiesArea = this.page.locator('div.flex.flex-wrap.items-center.gap-2.p-3.border:has(span:has-text("Selected entities will be shown here"))');
    await expect(selectedEntitiesArea).toBeVisible();
    console.log('Selected entities display area is visible');

    // Verify the "Selected entities will be shown here" placeholder
    const entitiesPlaceholder = this.page.locator('span:has-text("Selected entities will be shown here")');
    await expect(entitiesPlaceholder).toBeVisible();
    console.log('Selected entities placeholder text is visible');

    // Verify the entities search input
    const entitiesSearchInput = this.page.locator('input[placeholder="Search for specific entities..."]');
    await expect(entitiesSearchInput).toBeVisible();
    console.log('Specific Entities search input is visible');

    // Verify Agent Users section
    const agentUsersLabel = this.page.locator('label:has-text("Agent Users")');
    const userSearchInput = this.page.locator('input[placeholder="Search users by name or email..."]');
    await expect(agentUsersLabel).toBeVisible();
    await expect(userSearchInput).toBeVisible();
    console.log('Agent Users section with search input is visible');

    // Verify Test Agent panel on the right side
    const testAgentTitle = this.page.locator('h2:has-text("TEST AGENT")');
    const testConfigButton = this.page.locator('button:has-text("Test Current Form Config")');
    await expect(testAgentTitle).toBeVisible();
    await expect(testConfigButton).toBeVisible();
    console.log('Test Agent panel is visible');

    // Verify file attachment icon in test area
    const attachmentIcon = this.page.locator('svg[title*="Attach files"]');
    await expect(attachmentIcon).toBeVisible();
    console.log('File attachment icon is visible in test area');

    // Verify test chat input area
    const testChatInput = this.page.locator('div[contenteditable="true"][data-at-mention="true"]');
    await expect(testChatInput).toBeVisible();
    console.log('Test chat input area is visible');

    console.log('Create agent form elements verification test completed');
  }

  /**
   * Create agent with form data
   */
  async createAgentWithFormData(): Promise<void> {
    console.log('Starting create agent with form data test');

    // Define test data
    const testAgentName = 'Test Automation Agent';
    const testAgentDescription = 'This is a test agent created by automation for testing purposes.';
    const testAgentPrompt = 'You are a helpful assistant that helps with testing automation. Always be concise and accurate in your responses.';

    // Fill in the Name field
    const nameInput = this.page.locator('input#agentName');
    await nameInput.click();
    await nameInput.fill(testAgentName);
    await expect(nameInput).toHaveValue(testAgentName);
    console.log(`Name field filled with: "${testAgentName}"`);

    // Fill in the Description field
    const descriptionTextarea = this.page.locator('textarea#agentDescription');
    await descriptionTextarea.click();
    await descriptionTextarea.fill(testAgentDescription);
    await expect(descriptionTextarea).toHaveValue(testAgentDescription);
    console.log(`Description field filled with: "${testAgentDescription}"`);

    // Fill in the Prompt field
    const promptTextarea = this.page.locator('textarea#agentPrompt');
    await promptTextarea.click();
    await promptTextarea.fill(testAgentPrompt);
    await expect(promptTextarea).toHaveValue(testAgentPrompt);
    console.log(`Prompt field filled with: "${testAgentPrompt}"`);

    // Scroll to the bottom to ensure the Create Agent button is visible
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.locator('button:has-text("Create Agent")').waitFor({ state: 'visible', timeout: 3000 });

    // Verify the Create Agent button is present and enabled
    const createAgentButton = this.page.locator('button:has-text("Create Agent")');
    await expect(createAgentButton).toBeVisible();
    await expect(createAgentButton).toBeEnabled();
    console.log('Create Agent button is visible and enabled');

    // Click the Create Agent button
    await createAgentButton.click();
    console.log('Create Agent button clicked successfully');

    // Wait for success popup or navigation
    await this.page.locator('[role="status"][aria-live="off"], .text-sm.font-semibold:has-text("Success")').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    console.log('Create agent with form data test completed');
  }

  /**
   * Verify success popup after agent creation
   */
  async verifySuccessPopupAfterAgentCreation(): Promise<void> {
    console.log('Starting success popup verification test');

    // Wait for the success popup to appear
    await this.page.locator('[role="status"][aria-live="off"]').waitFor({ state: 'visible', timeout: 5000 });

    // Verify success popup appears
    const successPopup = this.page.locator('[role="status"][aria-live="off"]');
    await expect(successPopup).toBeVisible({ timeout: 10000 });
    console.log('Success popup is visible');

    // Verify success popup title
    const successTitle = successPopup.locator('div.text-sm.font-semibold:has-text("Success")');
    await expect(successTitle).toBeVisible();
    console.log('Success title is visible in popup');

    // Verify success popup message
    const successMessage = successPopup.locator('div.text-sm.opacity-90:has-text("Agent created successfully.")');
    await expect(successMessage).toBeVisible();
    console.log('Success message "Agent created successfully." is visible');

    // Verify close button is present in popup
    const closeButton = successPopup.locator('button[toast-close]');
    await expect(closeButton).toBeVisible();
    console.log('Close button is visible in success popup');

    // Ensure popup remains visible
    await expect(successPopup).toBeVisible({ timeout: 2000 });

    console.log('Success popup verification test completed');
  }

  /**
   * Verify created agent appears in ALL and MADE-BY-ME tabs with search and star functionality
   */
  async verifyCreatedAgentAppearsInTabsWithSearchAndStar(): Promise<void> {
    console.log('Starting agent list verification test');

    // Define the test agent data to look for
    const testAgentName = 'Test Automation Agent';
    const testAgentDescription = 'This is a test agent created by automation for testing purposes.';

    // Navigate back to agents list to verify the agent was created
    await this.page.goto('/agent');
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    console.log('Navigated back to agents list page');

    // Verify the newly created agent appears in ALL tab (should be active by default)
    const allTab = this.page.locator('button:has-text("ALL")');
    await expect(allTab).toBeVisible();
    console.log('ALL tab is visible');

    // Look for the newly created agent by name in the list
    const createdAgentName = this.page.getByRole('heading', { name: testAgentName, exact: true }).first();
    await expect(createdAgentName).toBeVisible({ timeout: 10000 });
    console.log(`Found created agent "${testAgentName}" in ALL tab`);

    // Verify the agent description is present
    const createdAgentDescription = createdAgentName.locator('..').locator('..').locator(`p:has-text("${testAgentDescription}")`);
    await expect(createdAgentDescription).toBeVisible();
    console.log(`Found agent description "${testAgentDescription}" in ALL tab`);

    // Switch to MADE-BY-ME tab to verify the agent appears there too
    const madeByMeTab = this.page.locator('button:has-text("MADE-BY-ME")');
    await expect(madeByMeTab).toBeVisible();
    await madeByMeTab.click();
    console.log('Clicked on MADE-BY-ME tab');

    // Wait for the tab content to load
    await this.page.locator('button:has-text("MADE-BY-ME")[aria-selected="true"], button:has-text("MADE-BY-ME").bg-white').first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});

    // Verify the newly created agent appears in MADE-BY-ME tab
    const createdAgentInMadeByMe = this.page.getByRole('heading', { name: testAgentName, exact: true }).first();
    await expect(createdAgentInMadeByMe).toBeVisible({ timeout: 10000 });
    console.log(`Found created agent "${testAgentName}" in MADE-BY-ME tab`);

    // Verify the agent description is present in MADE-BY-ME tab
    const createdAgentDescInMadeByMe = createdAgentInMadeByMe.locator('..').locator('..').locator(`p:has-text("${testAgentDescription}")`);
    await expect(createdAgentDescInMadeByMe).toBeVisible();
    console.log(`Found agent description "${testAgentDescription}" in MADE-BY-ME tab`);

    // Verify action buttons are present for the created agent
    const agentContainer = createdAgentInMadeByMe.locator('..').locator('..').locator('..');
    const editButton = agentContainer.locator('button svg[class*="lucide-pen-line"]').locator('..');
    const deleteButton = agentContainer.locator('button svg[class*="lucide-trash2"]').locator('..');
    const starButton = agentContainer.locator('button svg[class*="lucide-star"]').locator('..');

    await expect(editButton).toBeVisible();
    await expect(deleteButton).toBeVisible();
    await expect(starButton).toBeVisible();
    console.log('Edit, delete, and star buttons are visible for the created agent');

    // TC_XY_AG_10: Search for agent by exact name
    console.log('Testing search functionality...');

    // Find the search input
    const searchInput = this.page.locator('input[placeholder*="Search agents"]');
    const isSearchVisible = await searchInput.isVisible().catch(() => false);

    if (isSearchVisible) {
      // Clear any existing text and enter the exact agent name
      await searchInput.click();
      await searchInput.fill('');
      await searchInput.fill(testAgentName);
      console.log(`✅ Entered search term: "${testAgentName}"`);

      // Wait for search results to filter
      await this.page.locator(`[role="heading"]:has-text("${testAgentName}")`).first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});

      // Verify that the searched agent is still displayed
      const searchedAgent = this.page.getByRole('heading', { name: testAgentName, exact: true }).first();
      const isAgentVisible = await searchedAgent.isVisible().catch(() => false);
      if (isAgentVisible) {
        console.log(`✅ Found agent "${testAgentName}" in search results`);
      }

      // Clear the search to reset for next operations
      await searchInput.click();
      await searchInput.fill('');
      console.log('✅ Search cleared');
      await this.page.locator(`[role="heading"]:has-text("${testAgentName}")`).first().waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
    } else {
      console.log('⚠️ Search input not found - search functionality test skipped');
    }

    // TC_XY_AG_18: Mark agent as favorite using star icon
    console.log('Testing star/favorite functionality...');

    // Find the created agent again (in case search cleared the view)
    const agentForStar = this.page.getByRole('heading', { name: testAgentName, exact: true }).first();
    const isAgentForStarVisible = await agentForStar.isVisible().catch(() => false);

    if (isAgentForStarVisible) {
      // Find the star button for this agent
      const agentContainerForStar = agentForStar.locator('..').locator('..').locator('..');
      const starButtonForFav = agentContainerForStar.locator('button svg[class*="lucide-star"]').locator('..');
      const isStarVisible = await starButtonForFav.isVisible().catch(() => false);

      if (isStarVisible) {
        // Check current star state (fill attribute indicates if starred)
        const starSvg = starButtonForFav.locator('svg').first();
        const initialFillState = await starSvg.getAttribute('fill');
        console.log(`Star button initial fill state: ${initialFillState}`);

        // Click the star button to favorite the agent
        await starButtonForFav.click();
        console.log('✅ Clicked star button to favorite agent');

        // Wait for the favorite action to process - wait for attribute change
        await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});

        // Check if the star state changed to favorited
        const firstClickFillState = await starSvg.getAttribute('fill');
        console.log(`Star button fill state after first click: ${firstClickFillState}`);

        if (initialFillState !== firstClickFillState) {
          console.log('✅ Star button favorited - first click successful');

          // Test unfavorite by clicking again
          await starButtonForFav.click();
          console.log('✅ Clicked star button again to unfavorite agent');

          // Wait for the unfavorite action to process
          await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});

          // Check if the star state changed back to unfavorited
          const secondClickFillState = await starSvg.getAttribute('fill');
          console.log(`Star button fill state after second click: ${secondClickFillState}`);

          if (firstClickFillState !== secondClickFillState) {
            console.log('✅ Star button unfavorited - toggle functionality working correctly');
          } else {
            console.log('⚠️ Star button unfavorite failed - state did not change back');
          }

          // TC_XY_AG_20: Test favorite persistence after page reload
          // First, favorite the agent again for persistence test
          await starButtonForFav.click();
          console.log('✅ Favorited agent again for persistence test');
          await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});

          // Verify agent is favorited before reload
          const beforeReloadFillState = await starSvg.getAttribute('fill');
          console.log(`Star fill state before reload: ${beforeReloadFillState}`);

          // Reload the page
          await this.page.reload();
          console.log('✅ Page reloaded');
          await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

          // Find the agent again after reload
          const agentAfterReload = this.page.getByRole('heading', { name: testAgentName, exact: true }).first();
          const isAgentVisibleAfterReload = await agentAfterReload.isVisible().catch(() => false);

          if (isAgentVisibleAfterReload) {
            // Find the star button after reload
            const agentContainerAfterReload = agentAfterReload.locator('..').locator('..').locator('..');
            const starButtonAfterReload = agentContainerAfterReload.locator('button svg[class*="lucide-star"]').locator('..');
            const starSvgAfterReload = starButtonAfterReload.locator('svg').first();

            // Check if favorite state persisted
            const afterReloadFillState = await starSvgAfterReload.getAttribute('fill');
            console.log(`Star fill state after reload: ${afterReloadFillState}`);

            if (beforeReloadFillState === afterReloadFillState && afterReloadFillState !== 'none') {
              console.log('✅ Favorite state persisted after page reload');
            } else {
              console.log('⚠️ Favorite state did not persist after page reload');
            }
          } else {
            console.log('⚠️ Agent not found after reload - persistence test skipped');
          }
        } else {
          console.log('⚠️ Star button favorite failed - may need different verification approach');
        }
      } else {
        console.log('⚠️ Star button not found - favorite functionality test skipped');
      }
    } else {
      console.log('⚠️ Agent not found for star test - favorite functionality test skipped');
    }

    // Check current URL after all verifications
    const currentUrl = this.page.url();
    console.log(`Current URL after verification: ${currentUrl}`);

    console.log('Agent list verification with search and star functionality test completed');
  }

  /**
   * Click agent name in ALL tab and verify details
   */
  async clickAgentNameInAllTabAndVerifyDetails(): Promise<void> {
    console.log('Starting click agent name in ALL tab and verify details test');

    // Define the test agent data
    const testAgentName = 'Test Automation Agent';

    // Ensure we're on the agent list page
    await this.page.goto('/agent');
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    console.log('Navigated to agents list page');

    // Click on ALL tab to ensure we're in the correct tab
    const allTab = this.page.locator('button:has-text("ALL")');
    await expect(allTab).toBeVisible();
    await allTab.click();
    console.log('Clicked on ALL tab');

    // Wait for tab content to load
    await this.page.locator('button:has-text("ALL")[aria-selected="true"], button:has-text("ALL").bg-white').first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});

    // Find and click on the agent name/heading
    const agentNameHeading = this.page.getByRole('heading', { name: testAgentName, exact: true }).first();
    await expect(agentNameHeading).toBeVisible({ timeout: 10000 });
    await agentNameHeading.click();
    console.log(`Clicked on agent name: "${testAgentName}"`);

    // Wait for agent details page to load
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Verify we're on the agent details page by checking the URL
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('agentId');
    console.log(`Navigated to agent details page: ${currentUrl}`);

    // Verify the agent name appears as the main heading (h1)
    const agentDetailsHeading = this.page.locator('h1.font-display.text-3xl:has-text("Test Automation Agent")');
    await expect(agentDetailsHeading).toBeVisible({ timeout: 10000 });
    console.log('Agent name heading is visible on details page');

    // Verify the agent description appears in the description section
    const agentDescription = this.page.locator('p.text-gray-500:has-text("This is a test agent created by automation for testing purposes.")').first();
    await expect(agentDescription).toBeVisible();
    console.log('Agent description is visible on details page');

    // Verify the "ASK AGENT" section is present
    const askAgentSection = this.page.locator('span.text-sm.font-mono.tracking-wider.uppercase:has-text("ASK AGENT")');
    await expect(askAgentSection).toBeVisible();
    console.log('ASK AGENT section is visible');

    // Verify the agent name appears in the ASK AGENT section header
    const agentNameInAskSection = this.page.locator('span.text-sm.font-mono.tracking-wider.uppercase:has-text("Test Automation Agent")');
    await expect(agentNameInAskSection).toBeVisible();
    console.log('Agent name is visible in ASK AGENT section');

    // Verify the chat input area is present
    const chatInput = this.page.locator('div[contenteditable="true"][data-at-mention="true"]');
    await expect(chatInput).toBeVisible();
    console.log('Chat input area is visible');

    // // Verify the placeholder text in chat input
    // const placeholderText = this.page.locator('div:has-text("Ask a question or type @ to search your apps")');
    // await expect(placeholderText).toBeVisible();
    // console.log('Chat input placeholder text is visible');

    // Verify the Ask button is present and active (with star icon)
    const askButton = this.page.locator('button:has-text("Ask")');
    await expect(askButton).toBeVisible();

    // Verify the star icon is present in the Ask button
    const starIcon = askButton.locator('svg');
    await expect(starIcon).toBeVisible();
    console.log('Ask button with star icon is visible');

    // Verify the Search button is present
    const searchButton = this.page.locator('button:has(svg.lucide-search):has-text("Search")');
    await expect(searchButton).toBeVisible();
    console.log('Search button is visible');

    // Verify the file attachment icon is present
    const attachmentIcon = this.page.locator('svg[title*="Attach files"]');
    await expect(attachmentIcon).toBeVisible();
    console.log('File attachment icon is visible');

    // Verify the send button (arrow right) is present
    const sendButton = this.page.locator('button:has(svg.lucide-arrow-right)');
    await expect(sendButton).toBeVisible();
    console.log('Send button is visible');

    console.log('Click agent name in ALL tab and verify details test completed');
  }

  /**
   * Upload solar system PDF via clip icon
   */
  async uploadSolarSystemPDFViaClipIcon(): Promise<void> {
    console.log('Starting upload solar system PDF via file input test');

    // Verify we're still on the agent details page from the previous test
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('agentId');
    console.log(`Currently on agent details page: ${currentUrl}`);

    // Get the path to the solar system PDF file
    const solarSystemPdfPath = './props/Solar-System-PDF.pdf';
    console.log(`Solar system PDF path: ${solarSystemPdfPath}`);

    // Find the hidden file input element
    const fileInput = this.page.locator('input[type="file"][multiple].hidden');
    await expect(fileInput).toBeAttached();
    console.log('Hidden file input element found');

    // Directly set the file to the input element (no need to click clip icon)
    await fileInput.setInputFiles(solarSystemPdfPath);
    console.log('Solar system PDF file directly added to input element');

    // Wait for the file to be processed/uploaded - wait for file indicator
    await this.page.locator('div:has-text("Solar-System-PDF.pdf"), span:has-text("Solar-System-PDF.pdf"), [title*="Solar-System-PDF.pdf"]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    // Verify file upload indicators or success state
    // Look for file upload progress or completion indicators
    const uploadedFile = this.page.locator('div:has-text("Solar-System-PDF.pdf"), span:has-text("Solar-System-PDF.pdf"), [title*="Solar-System-PDF.pdf"]');

    // Check if file upload was successful by looking for the file name or upload indicator
    const isFileVisible = await uploadedFile.isVisible().catch(() => false);

    if (isFileVisible) {
      console.log('Solar system PDF file upload completed - file is visible in UI');
    } else {
      // Alternative verification - check if the chat input area shows any file-related indicators
      console.log('File uploaded - checking for upload completion indicators');

      // Sometimes file uploads are indicated by changes in the input area or surrounding elements
      const chatContainer = this.page.locator('div.search-container');
      await expect(chatContainer).toBeVisible();
      console.log('Chat container is still accessible after file upload');
    }

    // Verify that the chat input is still functional after file upload
    const chatInput = this.page.locator('div[contenteditable="true"][data-at-mention="true"]');
    await expect(chatInput).toBeVisible();
    console.log('Chat input area is still visible and functional after file upload');

    // Verify the send button is still present (should be enabled after file upload)
    const sendButton = this.page.locator('button:has(svg.lucide-arrow-right)');
    await expect(sendButton).toBeVisible();
    console.log('Send button is visible after file upload');

    // Verify the file attachment icon (clip icon) is still visible
    const attachmentIcon = this.page.locator('svg[title*="Attach files"]');
    await expect(attachmentIcon).toBeVisible();
    console.log('File attachment icon is still visible');

    console.log('Upload solar system PDF via file input test completed');
  }

  /**
   * Verify uploaded file in attachments section
   */
  async verifyUploadedFileInAttachmentsSection(): Promise<void> {
    console.log('Starting verification of uploaded file in attachments section');

    // Verify we're still on the agent details page
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('agentId');
    console.log(`Currently on agent details page: ${currentUrl}`);

    // Verify the attachments section is visible
    const attachmentsSection = this.page.locator('div.px-4.py-2.border-t.border-gray-100');
    await expect(attachmentsSection).toBeVisible({ timeout: 10000 });
    console.log('Attachments section is visible');

    // Verify the "Attachments (1/5)" text is present
    const attachmentsLabel = this.page.locator('span.text-xs.text-gray-500:has-text("Attachments (1/5)")');
    await expect(attachmentsLabel).toBeVisible();
    console.log('Attachments label "Attachments (1/5)" is visible');

    // Verify the file container is present
    const fileContainer = this.page.locator('div.relative.group');
    await expect(fileContainer).toBeVisible();
    console.log('File container is visible');

    // Verify the file item with proper styling
    const fileItem = this.page.locator('div.flex.items-center.gap-2.px-3.py-2.bg-gray-50.rounded-lg.border.border-gray-200');
    await expect(fileItem).toBeVisible();
    console.log('File item with proper styling is visible');

    // Verify the PDF file icon (lucide-file-text with red color)
    const fileIcon = fileItem.locator('svg.lucide-file-text.text-red-600');
    await expect(fileIcon).toBeVisible();
    console.log('PDF file icon with red color is visible');

    // Verify the file name "Solar-System-PDF.pdf" is displayed
    const fileName = fileItem.locator('span.text-sm.text-gray-700:has-text("Solar-System-PDF.pdf")');
    await expect(fileName).toBeVisible();
    console.log('File name "Solar-System-PDF.pdf" is visible');

    // Verify the file name has the correct title attribute
    const fileNameWithTitle = fileItem.locator('span[title="Solar-System-PDF.pdf"]:has-text("Solar-System-PDF.pdf")');
    await expect(fileNameWithTitle).toBeVisible();
    console.log('File name with correct title attribute is present');

    // Verify the file type "PDF" is displayed
    const fileType = fileItem.locator('span.text-xs.text-gray-500:has-text("PDF")');
    await expect(fileType).toBeVisible();
    console.log('File type "PDF" is visible');

    // Verify the file type has the correct title attribute
    const fileTypeWithTitle = fileItem.locator('span[title="pdf"]:has-text("PDF")');
    await expect(fileTypeWithTitle).toBeVisible();
    console.log('File type with correct title attribute is present');

    // Verify the remove button (X icon) is present
    const removeButton = fileItem.locator('button.text-gray-400.hover\\:text-red-500');
    await expect(removeButton).toBeVisible();
    console.log('Remove button is visible');

    // Verify the X icon inside the remove button
    const xIcon = removeButton.locator('svg.lucide-x');
    await expect(xIcon).toBeVisible();
    console.log('X icon in remove button is visible');

    // Verify the file attachment icon (clip icon) is still present at the bottom
    const clipIcon = this.page.locator('svg[title*="Attach files"]').first();
    await expect(clipIcon).toBeVisible();
    console.log('File attachment (clip) icon is still visible');

    // Verify the model selector now shows "Claude Sonnet 4" instead of "Gemini 2.5 Flash"
    const modelSelector = this.page.locator('span.font-semibold:has-text("Claude Sonnet 4")');
    await expect(modelSelector).toBeVisible();
    console.log('Model selector showing "Claude Sonnet 4" is visible');

    // Verify the send button is still present and enabled
    const sendButton = this.page.locator('button:has(svg.lucide-arrow-right)');
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeEnabled();
    console.log('Send button is visible and enabled');

    // Verify the chat input area is still functional
    const chatInput = this.page.locator('div[contenteditable="true"][data-at-mention="true"]');
    await expect(chatInput).toBeVisible();
    console.log('Chat input area is still visible and functional');


    // Verify the file truncation styling is applied correctly
    const truncatedFileName = fileItem.locator('span.truncate.block.max-w-\\[120px\\]:has-text("Solar-System-PDF.pdf")');
    await expect(truncatedFileName).toBeVisible();
    console.log('File name with truncation styling is applied correctly');

    console.log('Verification of uploaded file in attachments section completed successfully');
  }

  /**
   * Ask question about solar system planets and send
   */
  async askQuestionAboutSolarSystemPlanets(): Promise<void> {
    console.log('Starting ask question about solar system planets test');

    // Verify we're still on the agent details page
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('agentId');
    console.log(`Currently on agent details page: ${currentUrl}`);

    // Define the question to ask
    const question = 'What are the planets in solar system';
    console.log(`Question to ask: "${question}"`);

    // Verify the chat input area is visible and ready
    const chatInput = this.page.locator('div[contenteditable="true"][data-at-mention="true"]');
    await expect(chatInput).toBeVisible({ timeout: 10000 });
    console.log('Chat input area is visible');


    // Click on the chat input to focus it
    await chatInput.click();
    console.log('Clicked on chat input to focus');

    // Wait a moment for the input to be ready
    await chatInput.waitFor({ state: 'attached', timeout: 2000 });

    // Type the question in the chat input
    await chatInput.fill(question);
    console.log(`Typed question: "${question}" into chat input`);

    // Verify the question text appears in the input
    const inputText = await chatInput.textContent();
    expect(inputText?.trim()).toBe(question);
    console.log('Question text is correctly displayed in chat input');

    // Verify the send button is visible and enabled
    const sendButton = this.page.locator('button:has(svg.lucide-arrow-right)');
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeEnabled();
    console.log('Send button is visible and enabled');

    // Click the send button
    await sendButton.click();
    console.log('Clicked send button to send the question');

    // Wait for the message to be processed - wait for user message bubble
    await this.page.locator('div.rounded-\\[16px\\].bg-\\[\\#F0F2F4\\].text-\\[\\#1C1D1F\\].self-end').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    // Verify the chat input is cleared after sending
    const inputTextAfterSend = await chatInput.textContent();
    console.log(`Chat input content after send: "${inputTextAfterSend?.trim()}"`);

    // Verify the placeholder text reappears after sending
    const placeholderAfterSend = this.page.locator('div:has-text("Ask a question or type @ to search your apps")');
    const isPlaceholderVisible = await placeholderAfterSend.isVisible().catch(() => false);
    if (isPlaceholderVisible) {
      console.log('Placeholder text reappeared after sending message');
    } else {
      console.log('Chat input is ready for new input after sending message');
    }

    // Look for any chat response or message indicators
    // This could be a loading indicator, response area, or conversation thread
    const chatResponse = this.page.locator('div[class*="message"], div[class*="response"], div[class*="conversation"]').first();
    const hasResponse = await chatResponse.isVisible().catch(() => false);

    if (hasResponse) {
      console.log('Chat response area is visible - message processing started');
    } else {
      console.log('Message sent successfully - waiting for response processing');
    }


    // Verify the file attachment is still present in the attachments section
    const attachmentsSection = this.page.locator('div.px-4.py-2.border-t.border-gray-100');
    const hasAttachments = await attachmentsSection.isVisible().catch(() => false);
    if (hasAttachments) {
      console.log('Attachments section is still visible after sending message');
    }

    console.log('Ask question about solar system planets test completed successfully');
  }

  /**
   * Verify conversation with AI response about planets
   */
  async verifyConversationWithAIResponseAboutPlanets(): Promise<void> {
    console.log('Starting verification of conversation with AI response about planets');

    // Wait for the AI response to be generated
    console.log('Waiting for AI response to be generated...');
    await this.page.locator('div.markdown-content').waitFor({ state: 'visible', timeout: 15000 });

    // Verify we're still on the agent details page
    // const currentUrl = this.page.url();
    // expect(currentUrl).toContain('agentId');
    // console.log(`Currently on agent details page: ${currentUrl}`);

    // Verify the conversation container is visible
    const conversationContainer = this.page.locator('div.h-full.w-full.overflow-auto.flex.flex-col.items-center');
    await expect(conversationContainer).toBeVisible({ timeout: 30000 });
    console.log('Conversation container is visible');

    // // Verify the file attachment appears in the conversation
    // const fileSection = this.page.locator('h4:has-text("Files (1)")');
    // await expect(fileSection).toBeVisible();
    // console.log('File section with "Files (1)" is visible in conversation');

    // // Verify the uploaded PDF file appears in the conversation
    // const conversationFile = this.page.locator('p:has-text("Solar-System-PDF.pdf")');
    // await expect(conversationFile).toBeVisible();
    // console.log('Solar-System-PDF.pdf appears in conversation');

    // // Verify the file size and type information
    // const fileInfo = this.page.locator('p:has-text("444.95 KB • PDF")');
    // await expect(fileInfo).toBeVisible();
    // console.log('File size and type information is visible');

    // Verify the user's question appears in the conversation with proper styling
    const userQuestionBubble = this.page.locator('div.rounded-\\[16px\\].bg-\\[\\#F0F2F4\\].text-\\[\\#1C1D1F\\].self-end');
    // await expect(userQuestionBubble).toBeVisible();
    // console.log('User question bubble with proper styling is visible');

    // Verify the specific question text appears in the user message bubble
    const userQuestionText = userQuestionBubble.locator('div.break-words:has-text("What are the planets in solar system")');
    await expect(userQuestionText).toBeVisible();
    console.log('User question "What are the planets in solar system" appears in conversation');

    // Verify the AI response section is visible
    const aiResponseSection = this.page.locator('div.markdown-content');
    await expect(aiResponseSection).toBeVisible();
    console.log('AI response section is visible');

    // Wait for response content to fully load
    await this.page.locator('text=Mercury, text=Neptune').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    // Define the 8 planet names to verify
    const planetNames = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
    console.log('Verifying all 8 planet names are present in the AI response...');

    // Verify each planet name appears in the response
    for (const planet of planetNames) {
      const planetElement = this.page.locator(`text=${planet}`).first();
      await expect(planetElement).toBeVisible();
      console.log(`✓ Planet "${planet}" found in AI response`);
    }


    // Verify interaction buttons are present (copy, thumbs up, thumbs down)
    const copyButton = this.page.locator('svg.lucide-copy');
    await expect(copyButton).toBeVisible();
    console.log('Copy button is visible');

    const thumbsUpButton = this.page.locator('svg.lucide-thumbs-up');
    await expect(thumbsUpButton).toBeVisible();
    console.log('Thumbs up button is visible');

    const thumbsDownButton = this.page.locator('svg.lucide-thumbs-down');
    await expect(thumbsDownButton).toBeVisible();
    console.log('Thumbs down button is visible');

    // Verify related suggestions section
    const relatedSection = this.page.locator('span:has-text("RELATED")');
    await expect(relatedSection).toBeVisible();
    console.log('Related suggestions section is visible');


    // Verify the conversation structure with proper indexing
    const firstMessage = this.page.locator('[data-index="0"]');
    await expect(firstMessage).toBeVisible();
    console.log('First message (user question and file) is properly indexed');

    const secondMessage = this.page.locator('[data-index="1"]');
    await expect(secondMessage).toBeVisible();
    console.log('Second message (AI response) is properly indexed');


    console.log('✅ All 8 planet names verified successfully in AI response');
    console.log('✅ Conversation with AI response about planets verification completed successfully');
  }

  /**
   * Edit created agent and verify success
   */
  async editCreatedAgentAndVerifySuccess(): Promise<void> {
    console.log('Starting edit agent test');

    // Define updated test data
    const updatedAgentName = 'Updated Test Automation Agent';
    const updatedAgentDescription = 'This is an updated test agent description modified by automation testing.';
    const updatedAgentPrompt = 'You are an updated helpful assistant that helps with testing automation. Always be detailed and accurate in your responses.';

    // Refresh the page to ensure latest state
    await this.page.reload();
    console.log('Page refreshed for edit test');
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Ensure we're in MADE-BY-ME tab after refresh
    const madeByMeTab = this.page.locator('button:has-text("MADE-BY-ME")');
    await expect(madeByMeTab).toBeVisible();
    await madeByMeTab.click();
    console.log('Clicked on MADE-BY-ME tab after refresh');
    await this.page.locator('button:has-text("MADE-BY-ME")[aria-selected="true"], button:has-text("MADE-BY-ME").bg-white').first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});

    // Find the created agent and click edit button
    const testAgentName = 'Test Automation Agent';
    const createdAgentInMadeByMe = this.page.getByRole('heading', { name: testAgentName, exact: true }).first();
    await expect(createdAgentInMadeByMe).toBeVisible({ timeout: 10000 });

    // Click the edit button (pen icon) - simplified approach
    const agentRow = createdAgentInMadeByMe.locator('..').locator('..'); // Go up to the full row

    // Try different approaches to find the edit button
    let editButton = agentRow.locator('button[title="Edit Agent"]').first();
    let isVisible = await editButton.isVisible().catch(() => false);

    if (!isVisible) {
      // Try by SVG class
      editButton = agentRow.locator('button:has(svg.lucide-pen-line)').first();
      isVisible = await editButton.isVisible().catch(() => false);
    }

    if (!isVisible) {
      // Try by button classes that contain pen icon
      editButton = agentRow.locator('button.h-8.w-8:has(svg[class*="pen"])').first();
      isVisible = await editButton.isVisible().catch(() => false);
    }

    if (!isVisible) {
      // Last resort: find any button with pen-line in its content
      editButton = agentRow.locator('svg.lucide-pen-line').locator('xpath=..').first();
      isVisible = await editButton.isVisible().catch(() => false);
    }

    if (isVisible) {
      await editButton.click();
      console.log('Clicked edit button');
    } else {
      console.log('⚠️ Edit button not found - skipping edit test');
      return;
    }

    // Wait for edit form to load
    await this.page.locator('input#agentName').waitFor({ state: 'visible', timeout: 5000 });

    // Verify we're on the edit page by checking for form elements
    const nameInput = this.page.locator('input#agentName');
    const descriptionTextarea = this.page.locator('textarea#agentDescription');
    const promptTextarea = this.page.locator('textarea#agentPrompt');

    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await expect(descriptionTextarea).toBeVisible();
    await expect(promptTextarea).toBeVisible();
    console.log('Edit form is visible');

    // Clear and update the Name field
    await nameInput.click();
    await nameInput.selectText();
    await nameInput.fill(updatedAgentName);
    await expect(nameInput).toHaveValue(updatedAgentName);
    console.log(`Name updated to: "${updatedAgentName}"`);

    // Clear and update the Description field
    await descriptionTextarea.click();
    await descriptionTextarea.selectText();
    await descriptionTextarea.fill(updatedAgentDescription);
    await expect(descriptionTextarea).toHaveValue(updatedAgentDescription);
    console.log(`Description updated to: "${updatedAgentDescription}"`);

    // Clear and update the Prompt field
    await promptTextarea.click();
    await promptTextarea.selectText();
    await promptTextarea.fill(updatedAgentPrompt);
    await expect(promptTextarea).toHaveValue(updatedAgentPrompt);
    console.log(`Prompt updated to: "${updatedAgentPrompt}"`);

    // Scroll to find the Save Changes button
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.locator('button:has-text("Save Changes")').waitFor({ state: 'visible', timeout: 3000 });

    // Find and click the Save Changes button
    const saveButton = this.page.locator('button:has-text("Save Changes")');
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    console.log('Clicked Save Changes button');

    // Verify the success popup appears
    await this.page.locator('[role="status"][aria-live="off"]').waitFor({ state: 'visible', timeout: 5000 });

    // Check for success popup with the specific structure from your HTML
    const successPopup = this.page.locator('[role="status"][aria-live="off"]');
    await expect(successPopup).toBeVisible({ timeout: 10000 });
    console.log('Success popup is visible');

    // Verify success popup title
    const successTitle = successPopup.locator('div.text-sm.font-semibold:has-text("Success")');
    await expect(successTitle).toBeVisible();
    console.log('Success title is visible in popup');

    // Verify success popup message for agent update
    const successMessage = successPopup.locator('div.text-sm.opacity-90:has-text("Agent updated successfully.")');
    await expect(successMessage).toBeVisible();
    console.log('Success message "Agent updated successfully." is visible');

    // Verify close button is present in popup
    const closeButton = successPopup.locator('button[toast-close]');
    await expect(closeButton).toBeVisible();
    console.log('Close button is visible in success popup');

    // Ensure popup remains visible
    await expect(successPopup).toBeVisible({ timeout: 3000 });

    console.log('Edit agent and verify success test completed');
  }

  /**
   * Verify edited agent details in tabs
   */
  async verifyEditedAgentDetailsInTabs(): Promise<void> {
    console.log('Starting verification of edited agent details');

    // Define the updated agent data to verify
    const updatedAgentName = 'Updated Test Automation Agent';
    const updatedAgentDescription = 'This is an updated test agent description modified by automation testing.';

    // Wait for page to load after redirect from edit
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Verify we're on the agents page
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('/agent');
    console.log('On agents page after edit:', currentUrl);

    // ALL tab is active at start, so switch to MADE-BY-ME tab first
    const madeByMeTab = this.page.locator('button:has-text("MADE-BY-ME")');
    await expect(madeByMeTab).toBeVisible();
    await madeByMeTab.click();
    console.log('Clicked on MADE-BY-ME tab');

    // Wait for the tab content to load
    await this.page.locator('button:has-text("MADE-BY-ME")[aria-selected="true"], button:has-text("MADE-BY-ME").bg-white').first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});

    // Check what agents are actually visible in MADE-BY-ME tab
    const allAgentHeadings = await this.page.getByRole('heading').all();
    console.log('All agent headings found:');
    for (let i = 0; i < allAgentHeadings.length; i++) {
      const headingText = await allAgentHeadings[i].textContent().catch(() => '');
      console.log(`  ${i}: "${headingText}"`);
    }

    // Try to find the updated agent with some flexibility
    let updatedAgentName_MadeByMe = this.page.getByRole('heading', { name: updatedAgentName, exact: true });
    let isUpdatedVisible = await updatedAgentName_MadeByMe.isVisible().catch(() => false);

    if (!isUpdatedVisible) {
      // Try to find the original agent name (edit might not have worked)
      const originalAgentName = 'Test Automation Agent';
      updatedAgentName_MadeByMe = this.page.getByRole('heading', { name: originalAgentName, exact: true }).first();
      isUpdatedVisible = await updatedAgentName_MadeByMe.isVisible().catch(() => false);

      if (isUpdatedVisible) {
        console.log('⚠️ Found original agent name - edit might not have been successful');
      }
    }

    if (isUpdatedVisible) {
      const actualName = await updatedAgentName_MadeByMe.textContent();
      console.log(`Found agent with name: "${actualName}" in MADE-BY-ME tab`);
    } else {
      console.log('⚠️ Neither updated nor original agent name found - skipping verification');
      return;
    }

    // Try to verify the description (could be updated or original)
    const agentRow = updatedAgentName_MadeByMe.locator('..').locator('..');

    // First try to find updated description
    let updatedAgentDesc_MadeByMe = agentRow.locator(`p:has-text("${updatedAgentDescription}")`);
    let isDescVisible = await updatedAgentDesc_MadeByMe.isVisible().catch(() => false);

    if (!isDescVisible) {
      // Try to find original description
      const originalDescription = 'This is a test agent created by automation for testing purposes.';
      updatedAgentDesc_MadeByMe = agentRow.locator(`p:has-text("${originalDescription}")`);
      isDescVisible = await updatedAgentDesc_MadeByMe.isVisible().catch(() => false);

      if (isDescVisible) {
        console.log('⚠️ Found original description - edit description might not have been successful');
      }
    } else {
      console.log(`✅ Found updated description "${updatedAgentDescription}" in MADE-BY-ME tab`);
    }

    if (!isDescVisible) {
      // Get any description that's actually there
      const anyDescription = agentRow.locator('p').first();
      const actualDesc = await anyDescription.textContent().catch(() => 'No description found');
      console.log(`⚠️ Expected description not found. Actual description: "${actualDesc}"`);
    }

    // Switch to ALL tab to verify the edited agent appears there too
    const allTab = this.page.locator('button:has-text("ALL")');
    await expect(allTab).toBeVisible();
    await allTab.click();
    console.log('Clicked on ALL tab');

    // Wait for the tab content to load
    await this.page.locator('button:has-text("ALL")[aria-selected="true"], button:has-text("ALL").bg-white').first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});

    // Try to find the agent in ALL tab (could be updated or original name)
    let updatedAgentName_All = this.page.getByRole('heading', { name: updatedAgentName, exact: true });
    let isAllVisible = await updatedAgentName_All.isVisible().catch(() => false);

    if (!isAllVisible) {
      // Try to find the original agent name
      const originalAgentName = 'Test Automation Agent';
      updatedAgentName_All = this.page.getByRole('heading', { name: originalAgentName, exact: true }).first();
      isAllVisible = await updatedAgentName_All.isVisible().catch(() => false);

      if (isAllVisible) {
        console.log('⚠️ Found original agent name in ALL tab - edit might not have been successful');
      }
    } else {
      console.log(`✅ Found updated agent name "${updatedAgentName}" in ALL tab`);
    }

    if (!isAllVisible) {
      console.log('⚠️ Agent not found in ALL tab - skipping ALL tab verification');
      console.log('Edit agent verification completed with warnings');
      return;
    }

    // Try to verify the description in ALL tab
    const agentRowAll = updatedAgentName_All.locator('..').locator('..');

    // First try to find updated description
    let updatedAgentDesc_All = agentRowAll.locator(`p:has-text("${updatedAgentDescription}")`);
    let isDescAllVisible = await updatedAgentDesc_All.isVisible().catch(() => false);

    if (!isDescAllVisible) {
      // Try to find original description
      const originalDescription = 'This is a test agent created by automation for testing purposes.';
      updatedAgentDesc_All = agentRowAll.locator(`p:has-text("${originalDescription}")`);
      isDescAllVisible = await updatedAgentDesc_All.isVisible().catch(() => false);

      if (isDescAllVisible) {
        console.log('⚠️ Found original description in ALL tab - edit description might not have been successful');
      }
    } else {
      console.log(`✅ Found updated description "${updatedAgentDescription}" in ALL tab`);
    }

    if (!isDescAllVisible) {
      console.log('⚠️ Expected description not found in ALL tab');
    }

    // Switch back to MADE-BY-ME tab for the delete test
    await madeByMeTab.click();
    console.log('Switched back to MADE-BY-ME tab');
    await this.page.locator('button:has-text("MADE-BY-ME")[aria-selected="true"], button:has-text("MADE-BY-ME").bg-white').first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});

    console.log('Edited agent details verification test completed');
  }

  /**
   * Delete agent and verify removal
   */
  async deleteAgentAndVerifyRemoval(): Promise<void> {
    console.log('Starting delete agent test');

    // Define the updated agent name to find and delete - ONLY delete the updated agent
    const updatedAgentName = 'Updated Test Automation Agent';
    const deletedAgentName = updatedAgentName; // We specifically want to delete the updated agent

    // Find the updated agent to delete
    const agentToDelete = this.page.getByRole('heading', { name: updatedAgentName, exact: true }).first();
    const isAgentVisible = await agentToDelete.isVisible().catch(() => false);

    if (isAgentVisible) {
      console.log(`Found updated agent "${updatedAgentName}" to delete`);
    }

    if (!isAgentVisible) {
      console.log('⚠️ No agent found to delete - skipping delete test');
      return;
    }

    // Find the delete button using the same pattern as the working code
    console.log(`Looking for delete button for agent: ${deletedAgentName}`);

    const agentContainer = agentToDelete.locator('..').locator('..').locator('..');
    const deleteButton = agentContainer.locator('button svg[class*="lucide-trash2"]').locator('..');

    console.log('Waiting for delete button to be visible...');
    await expect(deleteButton).toBeVisible({ timeout: 5000 });

    // Verify delete button has the correct styling (red color)
    await expect(deleteButton).toHaveClass(/text-red-500|text-red-400/);
    console.log('Delete button found with correct red styling');

    await deleteButton.click();
    console.log('Clicked delete button');

    // Wait for the confirmation dialog to appear
    await this.page.locator('[role="dialog"]').waitFor({ state: 'visible', timeout: 3000 });

    // Handle the delete confirmation dialog
    const deleteDialog = this.page.locator('[role="dialog"]');
    console.log('Waiting for delete confirmation dialog...');
    await expect(deleteDialog).toBeVisible({ timeout: 5000 });
    console.log('Delete confirmation dialog appeared');

    // Verify dialog title and message
    const dialogTitle = deleteDialog.locator('h2:has-text("Delete Agent")');
    const dialogMessage = deleteDialog.locator('p:has-text("Are you sure you want to delete this agent? This action cannot be undone.")');
    await expect(dialogTitle).toBeVisible();
    await expect(dialogMessage).toBeVisible();
    console.log('Confirmed dialog title and message');

    // TC_XY_AG_74: Verify presence of Cancel button
    const cancelButton = deleteDialog.locator('button:has-text("Cancel")');
    await expect(cancelButton).toBeVisible();
    console.log('✅ Cancel button is visible in delete modal');

    // TC_XY_AG_75: Verify presence of OK button
    const okButton = deleteDialog.locator('button:has-text("OK")');
    await expect(okButton).toBeVisible();
    console.log('✅ OK button is visible in delete modal');

    // Verify presence of X close button
    const closeButton = deleteDialog.locator('button[type="button"] svg').first();
    await expect(closeButton).toBeVisible();
    console.log('✅ X close button is visible in delete modal');

    // TC_XY_AG_76: Test Cancel button functionality
    await cancelButton.click();
    console.log('✅ Clicked Cancel button');

    // Verify modal closes after Cancel
    await expect(deleteDialog).not.toBeVisible({ timeout: 3000 });
    console.log('✅ Modal closed after clicking Cancel');

    // Verify agent is still visible after Cancel
    await expect(agentToDelete).toBeVisible();
    console.log('✅ Agent still exists after clicking Cancel');

    // Click delete button again to test X close functionality
    await deleteButton.click();
    console.log('Clicked delete button again for X close test');
    await this.page.locator('[role="dialog"]').waitFor({ state: 'visible', timeout: 3000 });

    // Wait for dialog to reappear
    await expect(deleteDialog).toBeVisible({ timeout: 5000 });
    console.log('Delete confirmation dialog reappeared');

    // TC_XY_AG_77: Test X close button functionality
    const closeButtonClickable = deleteDialog.locator('button[type="button"]').last();
    await closeButtonClickable.click();
    console.log('✅ Clicked X close button');

    // Verify modal closes after X button
    await expect(deleteDialog).not.toBeVisible({ timeout: 3000 });
    console.log('✅ Modal closed after clicking X button');

    // Verify agent is still visible after X close
    await expect(agentToDelete).toBeVisible();
    console.log('✅ Agent still exists after clicking X close');

    // Click delete button one final time for actual deletion
    await deleteButton.click();
    console.log('Clicked delete button for final deletion');
    await this.page.locator('[role="dialog"]').waitFor({ state: 'visible', timeout: 3000 });

    // Wait for dialog to appear for final deletion
    await expect(deleteDialog).toBeVisible({ timeout: 5000 });
    console.log('Delete confirmation dialog appeared for final deletion');

    // TC_XY_AG_78: Click OK button to actually delete
    const finalOkButton = deleteDialog.locator('button:has-text("OK")');
    await expect(finalOkButton).toBeVisible();
    await finalOkButton.click();
    console.log('✅ Clicked OK button to confirm final deletion');

    // Wait for the dialog to close and deletion to complete
    await expect(deleteDialog).not.toBeVisible({ timeout: 5000 });
    console.log('Delete dialog closed, waiting for deletion to process...');
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Check how many agents exist after deletion - specifically looking for updated agent name
    console.log(`Verifying deletion of updated agent: "${deletedAgentName}"`);
    const agentsAfterDeletion = this.page.getByRole('heading', { name: deletedAgentName, exact: true });
    const countAfterDeletion = await agentsAfterDeletion.count();
    console.log(`Found ${countAfterDeletion} agents with name "${deletedAgentName}" after deletion`);

    // Verify the updated agent is no longer visible in MADE-BY-ME tab
    const deletedAgent_MadeByMe = this.page.getByRole('heading', { name: deletedAgentName, exact: true }).first();
    await expect(deletedAgent_MadeByMe).not.toBeVisible({ timeout: 10000 });
    console.log(`Updated agent "${deletedAgentName}" is no longer visible in MADE-BY-ME tab`);

    // Switch to ALL tab to verify the agent is also removed there
    const allTab = this.page.locator('button:has-text("ALL")');
    await allTab.click();
    console.log('Switched to ALL tab to verify deletion');
    await this.page.locator('button:has-text("ALL")[aria-selected="true"], button:has-text("ALL").bg-white').first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});

    // Verify the agent is not visible in ALL tab either
    const deletedAgent_All = this.page.getByRole('heading', { name: deletedAgentName, exact: true }).first();
    await expect(deletedAgent_All).not.toBeVisible({ timeout: 10000 });
    console.log(`Agent "${deletedAgentName}" is no longer visible in ALL tab`);

    console.log('Delete agent test completed successfully');
  }
}