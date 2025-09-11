#!/usr/bin/env node

/**
 * Test script to demonstrate timeout functionality
 * This script tests the askQuestionWithTimeout function
 */

const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Ask question with timeout functionality
 * @param {string} question - The question to ask
 * @param {string} defaultValue - Default value to use on timeout
 * @param {number} timeoutMs - Timeout in milliseconds (default: 40000)
 * @param {boolean} showCountdown - Whether to show countdown for longer timeouts
 * @returns {Promise<string>} - User input or default value
 */
function askQuestionWithTimeout(question, defaultValue, timeoutMs = 40000, showCountdown = false) {
  return new Promise((resolve) => {
    let timeoutId;
    let countdownInterval;
    let answered = false;
    
    // Show countdown for longer timeouts (>60 seconds)
    if (showCountdown && timeoutMs > 60000) {
      let remainingSeconds = Math.floor(timeoutMs / 1000);
      log(`${colors.yellow}⏰ Auto-proceeding in ${remainingSeconds} seconds if no input provided${colors.reset}`);
      
      countdownInterval = setInterval(() => {
        remainingSeconds--;
        if (remainingSeconds > 0 && remainingSeconds % 10 === 0) {
          process.stdout.write(`\r${colors.yellow}⏰ Auto-proceeding in ${remainingSeconds} seconds...${colors.reset}`);
        }
      }, 1000);
    }
    
    // Set up timeout
    timeoutId = setTimeout(() => {
      if (!answered) {
        answered = true;
        if (countdownInterval) clearInterval(countdownInterval);
        
        // Clear the current line and show timeout message
        process.stdout.write('\r\x1b[K'); // Clear line
        log(`${colors.yellow}⏰ Timeout reached, using default: ${colors.bright}${defaultValue}${colors.reset}`);
        resolve(defaultValue);
      }
    }, timeoutMs);
    
    // Ask the question
    rl.question(`${colors.blue}${question}${colors.reset}`, (answer) => {
      if (!answered) {
        answered = true;
        clearTimeout(timeoutId);
        if (countdownInterval) clearInterval(countdownInterval);
        
        // Clear countdown line if it was shown
        if (showCountdown && timeoutMs > 60000) {
          process.stdout.write('\r\x1b[K'); // Clear line
        }
        
        resolve(answer.trim() || defaultValue);
      }
    });
  });
}

async function testTimeoutFunctionality() {
  log('\n' + '='.repeat(60));
  log(colors.cyan + colors.bright + '🧪 Testing Timeout Functionality' + colors.reset);
  log('='.repeat(60));
  log('\nThis script demonstrates the timeout functionality with different scenarios:\n');
  
  try {
    // Test 1: Short timeout (5 seconds)
    log(colors.yellow + '📋 Test 1: Short timeout (5 seconds)' + colors.reset);
    const result1 = await askQuestionWithTimeout('Enter your name [John Doe]: ', 'John Doe', 5000);
    log(`${colors.green}✅ Result: ${result1}${colors.reset}\n`);
    
    // Test 2: Medium timeout (10 seconds) 
    log(colors.yellow + '📋 Test 2: Medium timeout (10 seconds)' + colors.reset);
    const result2 = await askQuestionWithTimeout('Enter your email [user@example.com]: ', 'user@example.com', 10000);
    log(`${colors.green}✅ Result: ${result2}${colors.reset}\n`);
    
    // Test 3: Long timeout with countdown (15 seconds)
    log(colors.yellow + '📋 Test 3: Long timeout with countdown (15 seconds)' + colors.reset);
    const result3 = await askQuestionWithTimeout('Enter API Key [demo-key-123]: ', 'demo-key-123', 15000, true);
    log(`${colors.green}✅ Result: ${result3}${colors.reset}\n`);
    
    log(colors.green + colors.bright + '🎉 All timeout tests completed successfully!' + colors.reset);
    log('='.repeat(60) + '\n');
    
  } catch (error) {
    log(`${colors.red}❌ Test failed: ${error.message}${colors.reset}`);
  } finally {
    rl.close();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  log('\n\n' + colors.yellow + 'Test interrupted by user' + colors.reset);
  rl.close();
  process.exit(1);
});

testTimeoutFunctionality();
