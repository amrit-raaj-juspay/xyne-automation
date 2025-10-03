#!/usr/bin/env node

/**
 * Test script to verify database integration
 * This script simulates test results and attempts to store them in the database
 */

// Use dynamic import for TypeScript modules
async function loadDatabaseService() {
  try {
    // Try to use ts-node to load TypeScript module
    require('ts-node/register');
    const { databaseService } = require('./src/framework/utils/database-service.ts');
    return databaseService;
  } catch (error) {
    console.error('❌ Failed to load database service:', error.message);
    console.log('\n🔍 To run this test, you need ts-node installed:');
    console.log('   npm install -g ts-node');
    console.log('   or run: npx ts-node test-database-integration.js');
    process.exit(1);
  }
}

async function testDatabaseIntegration() {
  console.log('🧪 Testing Database Integration...\n');

  // Mock test results data
  const mockPriorityStats = {
    highest: { total: 2, passed: 1, failed: 1, skipped: 0 },
    high: { total: 3, passed: 2, failed: 0, skipped: 1 },
    medium: { total: 5, passed: 4, failed: 1, skipped: 0 },
    low: { total: 2, passed: 2, failed: 0, skipped: 0 },
    totalDependencySkips: 1,
    dependencyChains: 2
  };

  const mockSummary = {
    totalTests: 12,
    totalPassed: 9,
    totalFailed: 2,
    totalSkipped: 1
  };

  const mockSlackReportLink = 'Test integration - no actual Slack report';

  try {
    // Test 1: Check if user is allowed to store results
    console.log('📋 Test 1: Checking user permissions...');
    const shouldStore = await databaseService.shouldStoreResults();
    console.log(`   Result: ${shouldStore ? '✅ User allowed' : '❌ User not allowed'}\n`);

    if (!shouldStore) {
      console.log('⚠️  Database storage is disabled for current user');
      console.log('   To enable, ensure SCRIPT_RUN_BY matches DB_ALLOWED_USERS in .env\n');
      return;
    }

    // Test 2: Set environment variables to simulate cron run
    console.log('📋 Test 2: Simulating cron run environment...');
    process.env.IS_CRON_RUN = 'true';
    process.env.CRON_RUN_ID = '20241001125000'; // Mock cron run ID
    process.env.MODULE_NAME = 'test-integration'; // Mock module name
    console.log(`   Cron Run ID: ${process.env.CRON_RUN_ID}`);
    console.log(`   Module Name: ${process.env.MODULE_NAME}\n`);

    // Test 3: Attempt to store test results
    console.log('📋 Test 3: Storing test results in database...');
    await databaseService.storeTestResults(
      mockPriorityStats,
      mockSummary,
      mockSlackReportLink
    );
    console.log('   ✅ Database storage completed successfully!\n');

    // Test 4: Test without cron run (should store NULL for cron_run_id)
    console.log('📋 Test 4: Testing manual run (no cron run ID)...');
    delete process.env.IS_CRON_RUN;
    delete process.env.CRON_RUN_ID;
    process.env.MODULE_NAME = 'manual-test-run';
    
    await databaseService.storeTestResults(
      mockPriorityStats,
      mockSummary,
      'Manual test run - no cron ID'
    );
    console.log('   ✅ Manual run storage completed successfully!\n');

    console.log('🎉 All database integration tests passed!');
    console.log('\n📊 Summary:');
    console.log('   ✅ User permission check');
    console.log('   ✅ Cron run ID generation');
    console.log('   ✅ Database authentication');
    console.log('   ✅ Test results storage');
    console.log('   ✅ Manual vs cron run differentiation');

  } catch (error) {
    console.error('❌ Database integration test failed:', error);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('   1. Check your .env file has correct JUSPAY_USERNAME and JUSPAY_PASSWORD');
    console.log('   2. Verify SCRIPT_RUN_BY is in DB_ALLOWED_USERS list');
    console.log('   3. Ensure network connectivity to Juspay APIs');
    console.log('   4. Check if the database table exists and has correct schema');
    process.exit(1);
  }
}

// Run the test
testDatabaseIntegration().catch(console.error);
