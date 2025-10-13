#!/bin/bash

# This script runs all functional tests in parallel in a server-safe manner.
# It is designed for any environment, including headless Linux servers.
# It staggers the start of each test and runs them as background processes.

# Generate a single Cron Run ID for this entire batch
CRON_RUN_ID=$(date +"%Y%m%d%H%M%S")
export CRON_RUN_ID
export IS_CRON_RUN=true

echo "🚀 Starting test batch with Cron Run ID: $CRON_RUN_ID"
echo "📋 This ID will be shared across all tests in this batch"


# Set up environment for cron compatibility
# Try to source NVM if available
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
fi

# If node/npm are not in PATH, try to find them
if ! command -v node &> /dev/null; then
    # Try to find node in common NVM locations
    if [ -f "$HOME/.nvm/versions/node/v22.20.0/bin/node" ]; then
        export PATH="$HOME/.nvm/versions/node/v22.20.0/bin:$PATH"
    elif [ -f "/usr/bin/node" ]; then
        export PATH="/usr/bin:$PATH"
    else
        echo "ERROR: Node.js not found. Please ensure Node.js is installed."
        exit 1
    fi
fi

# Verify Node.js and npm are available
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found in PATH. Current PATH: $PATH"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "ERROR: npm not found in PATH. Current PATH: $PATH"
    exit 1
fi

echo "Using Node.js version: $(node --version)"
echo "Using npm version: $(npm --version)"
# Directory containing the test files
TEST_DIR="tests/functional"

# Find all test spec files in the directory
TEST_FILES=$(find "$TEST_DIR" -name "*.spec.ts")

# Check if any test files were found
if [ -z "$TEST_FILES" ]; then
  echo "No test files found in $TEST_DIR"
  exit 1
fi

# Array to store the process IDs (PIDs) of the background jobs
pids=()

# Loop through each test file and run it in the background
for file in $TEST_FILES; do
  echo "--------------------------------------------------"
  echo "Starting test: $file (Cron Run ID: $CRON_RUN_ID)"
  echo "--------------------------------------------------"
  
  # Extract module name from file path for unique naming
  MODULE_NAME=$(basename "$file" .spec.ts)
  export MODULE_NAME
  
  # Create timestamp for unique file naming
  TIMESTAMP=$(date +"%Y-%m-%dT%H-%M-%S-%3NZ")
  
  # Create a temporary config file with unique output paths
  TEMP_CONFIG="playwright.config.${MODULE_NAME}.${TIMESTAMP}.js"
  cat > "$TEMP_CONFIG" << EOF
import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config.ts';

export default defineConfig({
  ...baseConfig,
  reporter: [
    ['html', { outputFolder: 'reports/html-report-${MODULE_NAME}-${TIMESTAMP}', open: 'never' }],
    ['json', { outputFile: 'reports/test-results-${MODULE_NAME}-${TIMESTAMP}.json' }],
    ['junit', { outputFile: 'reports/junit-results-${MODULE_NAME}-${TIMESTAMP}.xml' }],
    ['list'],
    ['./src/framework/core/enhanced-reporter.ts']
  ],
  outputDir: 'reports/test-artifacts-${MODULE_NAME}-${TIMESTAMP}'
});
EOF
  
  # Run the test in the background with the temporary config
  npx playwright test "$file" --project=chromium --config="$TEMP_CONFIG" &
  pids+=($!)
  
  # Clean up the temporary config file after a delay (in background)
  (sleep 300 && rm -f "$TEMP_CONFIG") &
  pids+=($!)
  echo "Waiting for 40 seconds before starting the next test..."
  sleep 40
done

echo "--------------------------------------------------"
echo "All tests started with shared Cron Run ID: $CRON_RUN_ID"
echo "Waiting for all tests to complete..."
echo "PIDs: ${pids[*]}"
echo "--------------------------------------------------"

# Wait for all background processes to finish and check their exit codes
exit_code=0
for pid in "${pids[@]}"; do
  if ! wait "$pid"; then
    echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    echo "Test with PID $pid failed. Check logs for details."
    echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    exit_code=1
  fi
done

echo "--------------------------------------------------"
echo "Batch $CRON_RUN_ID completed"
if [ $exit_code -eq 0 ]; then
  echo "✅ All tests in batch completed successfully."
else
  echo "❌ One or more tests in batch failed."
fi
echo "📊 Check database for detailed results with Cron Run ID: $CRON_RUN_ID"
echo "--------------------------------------------------"

# Wait for database writes to complete before generating PDF
echo "⏳ Waiting for all test data to be written to database..."
echo "🔄 Allowing 15 seconds for database synchronization..."
sleep 15

# Generate PDF report after all tests complete
echo "📊 Generating PDF summary report..."
if [ -d "venv-pdf" ] && [ -f "venv-pdf/bin/python" ]; then
  echo "🐍 Using virtual environment for PDF generation..."
  venv-pdf/bin/python src/framework/utils/pdf-report-generator.py "$CRON_RUN_ID"
  pdf_exit_code=$?
  
  if [ $pdf_exit_code -eq 0 ]; then
    echo "✅ PDF report generated successfully"
  else
    echo "⚠️ PDF report generation failed (exit code: $pdf_exit_code)"
  fi
else
  echo "⚠️ PDF virtual environment not found. Skipping PDF generation."
  echo "💡 Run './setup-pdf-dependencies.sh' to set up PDF generation."
fi

echo "--------------------------------------------------"
echo "🎯 Test execution and reporting completed for batch: $CRON_RUN_ID"
echo "--------------------------------------------------"

exit $exit_code
