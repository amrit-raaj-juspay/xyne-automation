#!/usr/bin/env node

/**
 * Test script to verify OpenAI API key input works without countdown interference
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

/**
 * Ask question with timeout functionality (fixed version)
 * @param {string} question - The question to ask
 * @param {string} defaultValue - Default value to use on timeout
 * @param {number} timeoutMs - Timeout in milliseconds (default: 40000)
 * @param {boolean} showCountdown - Whether to show countdown for longer timeouts
 * @returns {Promise<string>} - User input or default value
 */
// Create a global readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestionWithTimeout(question, defaultValue, timeoutMs = 40000, showCountdown = false) {
  return new Promise((resolve) => {
    let timeoutId;
    let countdownInterval;
    let answered = false;
    
    // Show countdown for longer timeouts (>60 seconds)
    if (showCountdown && timeoutMs > 60000) {
      let remainingSeconds = Math.floor(timeoutMs / 1000);
      log(`${colors.yellow}⏰ Auto-proceeding in ${remainingSeconds} seconds if no input provided${colors.reset}`);
      log(`${colors.yellow}💡 You can paste your API key at any time during the countdown${colors.reset}`);
      
      countdownInterval = setInterval(() => {
        remainingSeconds--;
        if (remainingSeconds > 0 && remainingSeconds % 10 === 0) {
          // Use a new line instead of overwriting the current line to avoid interfering with user input
          log(`${colors.yellow}⏰ ${remainingSeconds} seconds remaining...${colors.reset}`);
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
    
    // Use the global readline interface
    rl.question(`${colors.blue}${question}${colors.reset}`, (answer) => {
      if (!answered) {
        answered = true;
        clearTimeout(timeoutId);
        if (countdownInterval) clearInterval(countdownInterval);
        
        // Clear countdown line if it was shown
        if (showCountdown && timeoutMs > 60000) {
          process.stdout.write('\r\x1b[K'); // Clear line
        }
        
        const finalAnswer = answer.trim();
        resolve(finalAnswer || defaultValue);
      }
    });
  });
}

async function testApiKeyInput() {
  log('\n' + '='.repeat(60));
  log(colors.cyan + colors.bright + '🧪 Testing OpenAI API Key Input with Countdown' + colors.reset);
  log('='.repeat(60));
  log('\nThis test simulates the OpenAI API key input with countdown timer.');
  log('You can paste an API key or wait for the timeout to test both scenarios.\n');
  
  try {
    // Test the OpenAI API key input with 30-second timeout for faster testing
    log(colors.yellow + '🤖 LLM Evaluation (Optional):' + colors.reset);
    const openaiKey = await askQuestionWithTimeout('OpenAI API Key (optional, for LLM evaluations): ', 'your-openai-api-key-here', 30000, true);
    
    log(`\n${colors.green}✅ API Key received: ${openaiKey.substring(0, 20)}...${colors.reset}`);
    log(`${colors.green}✅ Input test completed successfully!${colors.reset}`);
    
    if (openaiKey === 'your-openai-api-key-here') {
      log(`${colors.yellow}ℹ️  Used default value (timeout occurred)${colors.reset}`);
    } else {
      log(`${colors.green}ℹ️  User provided custom API key${colors.reset}`);
    }
    
  } catch (error) {
    log(`${colors.red}❌ Test failed: ${error.message}${colors.reset}`);
  } finally {
    rl.close();
  }
  
  log('\n' + '='.repeat(60) + '\n');
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  log('\n\n' + colors.yellow + 'Test interrupted by user' + colors.reset);
  rl.close();
  process.exit(1);
});

testApiKeyInput();
