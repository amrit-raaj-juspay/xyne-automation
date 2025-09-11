#!/usr/bin/env node

/**
 * Simple test runner for basic navigation test
 * Similar to the Python framework's run_login_test.py
 * Uses standardized command structure
 */

const { execSync } = require('child_process');

console.log('🚀 Running Xyne Basic Navigation Test');
console.log('==================================================');

try {
  // Run the basic navigation test using standardized command
  console.log('Executing: npm run test:smoke');
  console.log('--------------------------------------------------');
  
  execSync(
    'npm run test:smoke',
    { 
      cwd: __dirname,
      stdio: 'inherit'
    }
  );
  
  console.log('--------------------------------------------------');
  console.log('✅ Basic navigation test PASSED!');
  
} catch (error) {
  console.log('--------------------------------------------------');
  console.log('❌ Basic navigation test FAILED!');
  console.log(`Exit code: ${error.status}`);
  process.exit(1);
}
