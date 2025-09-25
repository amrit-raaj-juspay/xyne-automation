#!/bin/bash

# This script runs all functional tests in parallel in a server-safe manner.
# It is designed for any environment, including headless Linux servers.
# It staggers the start of each test and runs them as background processes.

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
  echo "Starting test: $file (in background)"
  echo "--------------------------------------------------"
  
  # Run the test in the background with the --headless flag to ensure it works on servers.
  npx playwright test "$file" --project=chromium &
  pids+=($!)
  
  echo "Waiting for 40 seconds before starting the next test..."
  sleep 40
done

echo "--------------------------------------------------"
echo "All tests have been started in the background."
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
if [ $exit_code -eq 0 ]; then
  echo "All tests completed successfully."
else
  echo "One or more tests failed."
fi
echo "--------------------------------------------------"

exit $exit_code
