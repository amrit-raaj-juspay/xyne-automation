/**
 * Global teardown for Playwright tests
 * Runs once after all tests
 */

import { sharedBrowserManager } from './shared-browser-manager';

async function globalTeardown() {
  console.log('\n🏁 Starting Xyne Automation Framework Global Teardown');
  
  // Cleanup operations
  console.log('🧹 Performing cleanup operations...');
  
  // Cleanup all shared browser instances
  try {
    const stats = sharedBrowserManager.getStats();
    if (stats.totalInstances > 0) {
      console.log(`🔍 Found ${stats.totalInstances} shared browser instances to cleanup`);
      console.log(`   - Global: ${stats.byScope.global}`);
      console.log(`   - File: ${stats.byScope.file}`);
      console.log(`   - Suite: ${stats.byScope.suite}`);
      
      await sharedBrowserManager.cleanupAll();
      console.log('✅ All shared browser instances cleaned up');
    } else {
      console.log('ℹ️  No shared browser instances to cleanup');
    }
  } catch (error) {
    console.warn('⚠️ Error during shared browser cleanup:', error);
  }
  
  // Log test completion
  console.log('✅ Global teardown completed successfully');
}

export default globalTeardown;
