# Database Integration Guide

This guide explains how to use the PostgreSQL database integration for storing test results in the Xyne automation framework.

## Overview

The database integration automatically stores test results in a PostgreSQL database after each test execution. It captures detailed metrics including priority-based failure counts, execution metadata, and batch tracking for server runs.

## Database Schema

The test results are stored in a table with the following structure:

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `module_name` | varchar(255) | NO | Test module name (e.g., "agent-module") |
| `test_cases_run` | integer | YES | Total number of test cases executed |
| `test_cases_passed` | integer | YES | Number of test cases that passed |
| `test_cases_skipped` | integer | YES | Number of test cases that were skipped |
| `test_cases_failed` | integer | YES | Number of test cases that failed |
| `highest_priority_failed` | integer | YES | Failed tests with highest priority |
| `high_priority_failed` | integer | YES | Failed tests with high priority |
| `medium_priority_failed` | integer | YES | Failed tests with medium priority |
| `low_priority_failed` | integer | YES | Failed tests with low priority |
| `run_datetime` | timestamp | YES | When the test was executed |
| `slack_report_link` | text | YES | Link to Slack notification or report |
| `username` | varchar(255) | YES | User who executed the test |
| `runenv` | varchar(255) | YES | Environment where test was run |
| `cron_run_id` | text | YES | Batch identifier for server runs |

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash

```

### User Access Control

Only users listed in `DB_ALLOWED_USERS` can store results in the database. The system checks against:
- `process.env.SCRIPT_RUN_BY`
- `process.env.USER`
- `process.env.USERNAME`

## How It Works

### 1. Automatic Integration

The database integration is automatically triggered by the Enhanced Reporter after:
1. Test execution completes
2. Slack notification is sent
3. Test results are processed

### 2. Data Collection

The system automatically collects:
- **Module Name**: Extracted from test file path (e.g., "agent-module.spec.ts" → "agent-module")
- **Test Counts**: Total, passed, failed, skipped from Playwright results
- **Priority Metrics**: Failure counts by priority level (highest, high, medium, low)
- **Metadata**: Timestamp, username, environment, Slack report link
- **Batch ID**: Shared identifier for server script runs

### 3. Batch Tracking

When tests are run via `run-staggered-tests-server.sh`:
- A single `cron_run_id` is generated (format: `yyyymmddhrminsec`)
- All test files in the batch share the same `cron_run_id`
- Manual runs store `NULL` for `cron_run_id`

## Usage Examples

### Running Individual Tests

```bash
# Manual test run (cron_run_id will be NULL)
npx playwright test tests/functional/agent-module.spec.ts
```

### Running Batch Tests

```bash
# Server script run (all tests get same cron_run_id)
./run-staggered-tests-server.sh
```

### Testing Database Integration

```bash
# Test the database connection and storage
node test-database-integration.js
```

## Database Queries

### Find All Tests from a Batch

```sql
SELECT * FROM test_results 
WHERE cron_run_id = '20241001123045';
```

### Count Tests by Environment

```sql
SELECT runenv, COUNT(*) as test_count 
FROM test_results 
GROUP BY runenv;
```

### Find Failed Tests in Recent Batches

```sql
SELECT module_name, test_cases_failed, cron_run_id, run_datetime
FROM test_results 
WHERE test_cases_failed > 0 
  AND cron_run_id IS NOT NULL
ORDER BY run_datetime DESC;
```

### Get Priority-based Failure Analysis

```sql
SELECT 
  module_name,
  highest_priority_failed + high_priority_failed as critical_failures,
  medium_priority_failed + low_priority_failed as minor_failures,
  run_datetime
FROM test_results 
WHERE test_cases_failed > 0
ORDER BY critical_failures DESC;
```

## Error Handling

The database integration is designed to fail gracefully:

1. **Authentication Failures**: Logged as warnings, test execution continues
2. **Network Issues**: Automatic retry once, then graceful failure
3. **User Not Allowed**: Silently skipped with informational log
4. **Database Errors**: Logged as warnings, test execution continues

## Troubleshooting

### Common Issues

1. **"User not allowed" message**
   - Check `SCRIPT_RUN_BY` in `.env`
   - Verify user is in `DB_ALLOWED_USERS` list

2. **Authentication failures**
   - Verify `JUSPAY_USERNAME` and `JUSPAY_PASSWORD`
   - Check network connectivity to Juspay APIs

3. **Database insertion errors**
   - Verify database table exists with correct schema
   - Check API endpoint URLs in `.env`

### Debug Mode

Enable detailed logging by setting:
```bash
DEBUG=database-service
```

### Test Integration

Run the integration test to verify everything works:
```bash
node test-database-integration.js
```

## Architecture

### Components

1. **DatabaseService** (`src/framework/utils/database-service.ts`)
   - Handles authentication with Juspay APIs
   - Manages data mapping and SQL generation
   - Provides user access control

2. **Enhanced Reporter** (`src/framework/core/enhanced-reporter.ts`)
   - Integrates database storage with existing reporting
   - Calls database service after Slack notifications

3. **Server Script** (`run-staggered-tests-server.sh`)
   - Generates shared batch identifiers
   - Exports environment variables for child processes

### Data Flow

```
Test Execution → Enhanced Reporter → Slack Notification → Database Storage
                                                        ↓
                                              Authentication → Data Mapping → SQL Insert
```

## Security Considerations

1. **Credentials**: Store sensitive credentials in `.env` file (not in version control)
2. **User Access**: Only authorized users can store data
3. **SQL Injection**: All queries use proper escaping
4. **Token Management**: Authentication tokens are cached and refreshed automatically

## Best Practices

1. **Environment Separation**: Use different database endpoints for staging/production
2. **Monitoring**: Monitor database storage success/failure rates
3. **Cleanup**: Implement data retention policies for old test results
4. **Backup**: Regular database backups for test result history

## Integration with Existing Workflow

The database integration seamlessly works with your existing test workflow:

- ✅ No changes needed to existing test files
- ✅ Works with current Slack notifications
- ✅ Compatible with priority and dependency systems
- ✅ Maintains existing error handling patterns
- ✅ Preserves all current reporting features

The database storage is additive - it enhances your current setup without disrupting existing functionality.
