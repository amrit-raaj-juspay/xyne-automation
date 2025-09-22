import { test, expect } from '../../src/framework/core/test-fixtures';

test.describe('Xyne Basic Navigation Tests', () => {
  test('should open browser and navigate to Xyne homepage', async ({ page }) => {
    console.log('🚀 Starting basic navigation test');
    
    // Navigate to Xyne homepage
    console.log('📍 Navigating to: https://xyne.juspay.net');
    await page.goto('https://xyne.juspay.net', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Verify page loaded successfully
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Basic assertions
    expect(title).toBeTruthy();
    expect(page.url()).toContain('xyne.juspay.net');
    
    // Take a screenshot for verification
    await page.screenshot({ 
      path: 'reports/screenshots/homepage-navigation.png',
      fullPage: true 
    });
    
    console.log('✅ Basic navigation test completed successfully');
  });

  test('should verify page elements are loaded', async ({ page }) => {
    console.log('🚀 Starting page elements verification test');
    
    // Navigate to Xyne homepage
    await page.goto('https://xyne.juspay.net', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for page to be fully interactive
    await page.waitForLoadState('networkidle');
    
    // Check if basic HTML structure exists
    const bodyElement = await page.locator('body');
    await expect(bodyElement).toBeVisible();
    
    // Check if there's any content on the page
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
    expect(pageContent!.length).toBeGreaterThan(0);
    
    console.log(`📊 Page content length: ${pageContent!.length} characters`);
    console.log('✅ Page elements verification completed');
  });
});
