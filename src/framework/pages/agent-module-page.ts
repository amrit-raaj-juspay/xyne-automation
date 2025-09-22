/**
 * Agent Module Page Object - Contains all agent-related page interactions
 */

import { Page, expect } from '@playwright/test';

export class AgentModulePage {

  constructor(private page: Page) {}

  /**
   * Verify and click agent create button
   */
  async verifyAndClickAgentCreateButton(): Promise<void> {
    console.log('Starting agent create button verification test');

    // Debug: Log shared page state
    console.log('Shared page URL:', this.page.url());
    console.log('Shared page title:', await this.page.title());

    // Wait for page to load
    await this.page.waitForTimeout(3000);

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

    // Wait to see the interaction
    await this.page.waitForTimeout(3000);

    console.log('Agent create button verification and click test completed');
  }

  /**
   * Verify create agent form elements after clicking CREATE button
   */
  async verifyCreateAgentFormElements(): Promise<void> {
    console.log('Starting create agent form elements verification test');

    // Wait for the create agent form to load
    await this.page.waitForTimeout(3000);

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
    const ragToggle = this.page.locator('button[role="switch"][id="rag-toggle"]');
    await expect(appIntegrationsLabel).toBeVisible();
    await expect(ragToggle).toBeVisible();
    await expect(ragToggle).toHaveAttribute('aria-checked', 'true'); // Should be enabled by default
    console.log('App Integrations section with RAG toggle is visible and enabled');

    // Verify Specific Entities section
    const specificEntitiesLabel = this.page.locator('label:has-text("Specific Entities")');
    const entitiesSearchInput = this.page.locator('input[placeholder="Search for specific entities..."]');
    await expect(specificEntitiesLabel).toBeVisible();
    await expect(entitiesSearchInput).toBeVisible();
    console.log('Specific Entities section with search input is visible');

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
    await this.page.waitForTimeout(1000);

    // Verify the Create Agent button is present and enabled
    const createAgentButton = this.page.locator('button:has-text("Create Agent")');
    await expect(createAgentButton).toBeVisible();
    await expect(createAgentButton).toBeEnabled();
    console.log('Create Agent button is visible and enabled');

    // Click the Create Agent button
    await createAgentButton.click();
    console.log('Create Agent button clicked successfully');

    // Wait for 3 seconds to see the interaction/response
    await this.page.waitForTimeout(3000);

    console.log('Create agent with form data test completed');
  }

  /**
   * Verify success popup after agent creation
   */
  async verifySuccessPopupAfterAgentCreation(): Promise<void> {
    console.log('Starting success popup verification test');

    // Wait for the success popup to appear
    await this.page.waitForTimeout(2000);

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

    // Wait for 1 more second to see the popup
    await this.page.waitForTimeout(1000);

    console.log('Success popup verification test completed');
  }

  /**
   * Verify created agent appears in ALL and MADE-BY-ME tabs
   */
  async verifyCreatedAgentAppearsInTabs(): Promise<void> {
    console.log('Starting agent list verification test');

    // Define the test agent data to look for
    const testAgentName = 'Test Automation Agent';
    const testAgentDescription = 'This is a test agent created by automation for testing purposes.';

    // Navigate back to agents list to verify the agent was created
    await this.page.goto('/agent');
    await this.page.waitForTimeout(3000);
    console.log('Navigated back to agents list page');

    // Verify the newly created agent appears in ALL tab (should be active by default)
    const allTab = this.page.locator('button:has-text("ALL")');
    await expect(allTab).toBeVisible();
    console.log('ALL tab is visible');

    // Look for the newly created agent by name in the list
    const createdAgentName = this.page.getByRole('heading', { name: testAgentName, exact: true });
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
    await this.page.waitForTimeout(2000);

    // Verify the newly created agent appears in MADE-BY-ME tab
    const createdAgentInMadeByMe = this.page.getByRole('heading', { name: testAgentName, exact: true });
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

    // Check current URL after verification
    const currentUrl = this.page.url();
    console.log(`Current URL after verification: ${currentUrl}`);

    console.log('Agent list verification test completed');
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

    // Find the created agent and click edit button
    const testAgentName = 'Test Automation Agent';
    const createdAgentInMadeByMe = this.page.getByRole('heading', { name: testAgentName, exact: true });
    await expect(createdAgentInMadeByMe).toBeVisible({ timeout: 10000 });

    // Click the edit button (pen icon)
    const agentContainer = createdAgentInMadeByMe.locator('..').locator('..').locator('..');
    const editButton = agentContainer.locator('button svg[class*="lucide-pen-line"]').locator('..');
    await expect(editButton).toBeVisible();
    await editButton.click();
    console.log('Clicked edit button');

    // Wait for edit form to load
    await this.page.waitForTimeout(3000);

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
    await this.page.waitForTimeout(1000);

    // Find and click the Save Changes button
    const saveButton = this.page.locator('button:has-text("Save Changes")');
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    console.log('Clicked Save Changes button');

    // Verify the success popup appears
    await this.page.waitForTimeout(2000);

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

    // Wait to see the popup before test completes
    await this.page.waitForTimeout(2000);

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

    // Should already be on agents page with MADE-BY-ME tab selected after edit
    // Wait for page to load after redirect from edit
    await this.page.waitForTimeout(3000);

    // Verify we're on the agents page
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('/agent');
    console.log('On agents page after edit:', currentUrl);

    // Verify MADE-BY-ME tab is selected (should be active after edit)
    const madeByMeTab = this.page.locator('button:has-text("MADE-BY-ME")');
    await expect(madeByMeTab).toBeVisible();
    await expect(madeByMeTab).toHaveClass(/bg-gray-200|bg-slate-700/); // Active tab styling
    console.log('MADE-BY-ME tab is selected');

    // Verify the updated agent appears with new name and description in MADE-BY-ME tab
    const updatedAgentName_MadeByMe = this.page.getByRole('heading', { name: updatedAgentName, exact: true });
    await expect(updatedAgentName_MadeByMe).toBeVisible({ timeout: 10000 });
    console.log(`Found updated agent name "${updatedAgentName}" in MADE-BY-ME tab`);

    // Verify the updated description is present in MADE-BY-ME tab
    const updatedAgentDesc_MadeByMe = updatedAgentName_MadeByMe.locator('..').locator('..').locator(`p:has-text("${updatedAgentDescription}")`);
    await expect(updatedAgentDesc_MadeByMe).toBeVisible();
    console.log(`Found updated description "${updatedAgentDescription}" in MADE-BY-ME tab`);

    // Switch to ALL tab to verify the edited agent appears there too
    const allTab = this.page.locator('button:has-text("ALL")');
    await expect(allTab).toBeVisible();
    await allTab.click();
    console.log('Clicked on ALL tab');

    // Wait for the tab content to load
    await this.page.waitForTimeout(2000);

    // Verify the updated agent appears with new name and description in ALL tab
    const updatedAgentName_All = this.page.getByRole('heading', { name: updatedAgentName, exact: true });
    await expect(updatedAgentName_All).toBeVisible({ timeout: 10000 });
    console.log(`Found updated agent name "${updatedAgentName}" in ALL tab`);

    // Verify the updated description is present in ALL tab
    const updatedAgentDesc_All = updatedAgentName_All.locator('..').locator('..').locator(`p:has-text("${updatedAgentDescription}")`);
    await expect(updatedAgentDesc_All).toBeVisible();
    console.log(`Found updated description "${updatedAgentDescription}" in ALL tab`);

    // Switch back to MADE-BY-ME tab for the delete test
    await madeByMeTab.click();
    console.log('Switched back to MADE-BY-ME tab');
    await this.page.waitForTimeout(2000);

    console.log('Edited agent details verification test completed');
  }

  /**
   * Delete agent and verify removal
   */
  async deleteAgentAndVerifyRemoval(): Promise<void> {
    console.log('Starting delete agent test');

    // Define the updated agent name to find and delete
    const updatedAgentName = 'Updated Test Automation Agent';

    // Find the updated agent in MADE-BY-ME tab
    const updatedAgentName_MadeByMe = this.page.getByRole('heading', { name: updatedAgentName, exact: true });
    await expect(updatedAgentName_MadeByMe).toBeVisible({ timeout: 10000 });
    console.log(`Found agent "${updatedAgentName}" to delete`);

    // Find and click the delete button (trash icon)
    const agentContainer = updatedAgentName_MadeByMe.locator('..').locator('..').locator('..');
    const deleteButton = agentContainer.locator('button svg.lucide-trash2').locator('..');
    await expect(deleteButton).toBeVisible();

    // Verify delete button has the correct styling (red color)
    await expect(deleteButton).toHaveClass(/text-red-500|text-red-400/);
    console.log('Delete button found with correct red styling');

    await deleteButton.click();
    console.log('Clicked delete button');

    // Wait for the confirmation dialog to appear
    await this.page.waitForTimeout(1000);

    // Handle the delete confirmation dialog
    const deleteDialog = this.page.locator('[role="dialog"]');
    await expect(deleteDialog).toBeVisible({ timeout: 5000 });
    console.log('Delete confirmation dialog appeared');

    // Verify dialog title and message
    const dialogTitle = deleteDialog.locator('h2:has-text("Delete Agent")');
    const dialogMessage = deleteDialog.locator('p:has-text("Are you sure you want to delete this agent? This action cannot be undone.")');
    await expect(dialogTitle).toBeVisible();
    await expect(dialogMessage).toBeVisible();
    console.log('Confirmed dialog title and message');

    // Click the OK button to confirm deletion
    const okButton = deleteDialog.locator('button:has-text("OK")');
    await expect(okButton).toBeVisible();
    await okButton.click();
    console.log('Clicked OK button to confirm deletion');

    // Wait for the dialog to close and deletion to complete
    await expect(deleteDialog).not.toBeVisible({ timeout: 5000 });
    await this.page.waitForTimeout(2000);

    // Verify the agent is no longer visible in MADE-BY-ME tab
    const deletedAgent_MadeByMe = this.page.getByRole('heading', { name: updatedAgentName, exact: true });
    await expect(deletedAgent_MadeByMe).not.toBeVisible({ timeout: 10000 });
    console.log(`Agent "${updatedAgentName}" is no longer visible in MADE-BY-ME tab`);

    // Switch to ALL tab to verify the agent is also removed there
    const allTab = this.page.locator('button:has-text("ALL")');
    await allTab.click();
    console.log('Switched to ALL tab to verify deletion');
    await this.page.waitForTimeout(2000);

    // Verify the agent is not visible in ALL tab either
    const deletedAgent_All = this.page.getByRole('heading', { name: updatedAgentName, exact: true });
    await expect(deletedAgent_All).not.toBeVisible({ timeout: 10000 });
    console.log(`Agent "${updatedAgentName}" is no longer visible in ALL tab`);

    console.log('Delete agent test completed successfully');
  }
}