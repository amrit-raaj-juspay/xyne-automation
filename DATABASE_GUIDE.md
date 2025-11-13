# Database Integration Guide

**Last Updated:** 2025-11-10
**Status:** ✅ Operational

---

## Overview

The test automation framework stores test execution data in PostgreSQL using two normalized tables:
- **`xyne_test_runs`** - Run metadata and version tracking
- **`xyne_test_module`** - Detailed test results with JSONB storage

---

## Database Schema

### xyne_test_runs

Stores one record per test run with version tracking.

```sql
CREATE TABLE xyne_test_runs (
    id SERIAL PRIMARY KEY,
    cron_run_id VARCHAR(255) UNIQUE NOT NULL,
    repo_version VARCHAR(100),
    is_version_active BOOLEAN DEFAULT TRUE,
    previous_version VARCHAR(100),
    previous_run_id VARCHAR(255),
    run_env VARCHAR(50),              -- 'sbx', 'prod', 'local'
    run_by VARCHAR(255),
    status VARCHAR(50),                -- 'in_progress', 'completed', 'failed'
    metadata JSONB,
    run_date_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Example metadata JSONB:**
```json
{
  "stagger_delay_seconds": 50,
  "parallel_workers": 6,
  "browser": "chromium",
  "base_url": "https://sbx.xyne.juspay.net",
  "node_version": "v24.1.0",
  "triggered_by": "cron"
}
```

### xyne_test_module

Stores detailed test results for each module with test-level data in JSONB.

```sql
CREATE TABLE xyne_test_module (
    id SERIAL PRIMARY KEY,
    cron_run_id VARCHAR(255) NOT NULL,
    module_name VARCHAR(255) NOT NULL,
    run_data JSONB NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    slack_report_link TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cron_run_id, module_name)
);
```

**Example run_data JSONB:**
```json
{
  "tests": [
    {
      "name": "user login",
      "status": "passed",
      "priority": "highest",
      "duration_ms": 35869,
      "started_at": "2025-11-10T12:30:45.132Z",
      "completed_at": "2025-11-10T12:31:21.001Z"
    },
    {
      "name": "verify form elements",
      "status": "failed",
      "priority": "high",
      "duration_ms": 10101,
      "started_at": "2025-11-10T12:31:21.150Z",
      "completed_at": "2025-11-10T12:31:31.251Z",
      "error_message": "Element not visible: input#private[type=\"radio\"]",
      "error_stack": "Error: locator.toBeVisible() failed..."
    },
    {
      "name": "create agent",
      "status": "skipped",
      "priority": "high",
      "skip_reason": "Dependencies not met: verify form elements"
    }
  ]
}
```

---

## Data Flow

### 1. Test Run Initialization

**When:** Before tests start
**Script:** `scripts/initialize-test-run.ts`
**Trigger:** `run-staggered-tests-server.sh` line 98

```bash
# Generate unique CRON_RUN_ID from current datetime
CRON_RUN_ID=$(date +"%Y%m%d%H%M%S")
export CRON_RUN_ID

# Set user for permission check (uses env variable or falls back to system user)
export SCRIPT_RUN_BY="${SCRIPT_RUN_BY:-${USER}}"

# Initialize database entry
npx tsx scripts/initialize-test-run.ts
```

**Database Action:**
```sql
INSERT INTO xyne_test_runs (
  cron_run_id,
  repo_version,
  is_version_active,
  previous_version,
  previous_run_id,
  run_env,
  run_by,
  status,
  metadata,
  run_date_time
) VALUES (
  '20251110123045',
  'a7f3c21',
  TRUE,
  'b5e2d19',
  '20251109145023',
  'sbx',
  'your-username',
  'in_progress',
  '{"stagger_delay_seconds":50,...}',
  CURRENT_TIMESTAMP
)
```

**Console Output:**
```
🔍 Database operations: ENABLED for user "your-username"
✅ Test run initialized successfully (Batch ID: 20251110123045)
```

---

### 2. Module Execution & Storage

**When:** After each module completes
**Reporter:** `src/framework/core/enhanced-reporter.ts`
**Method:** `storeModuleLevelResults()`

**Flow:**
1. Module tests complete
2. Reporter collects test results
3. Builds JSONB test array
4. Stores to `xyne_test_module` table

**Code:**
```typescript
// Build test data array
const tests = [];
for (const [testName, testData] of this.testResults) {
  const { result, metadata } = testData;

  tests.push({
    name: testName,
    status: result.status,
    priority: metadata?.priority || 'medium',
    duration_ms: result.duration,
    started_at: result.startTime ? new Date(result.startTime).toISOString() : new Date().toISOString(),
    completed_at: new Date().toISOString(),
    error_message: result.errors?.[0]?.message || undefined,
    error_stack: result.errors?.[0]?.stack || undefined,
    skip_reason: result.status === 'skipped' ? (result.errors?.[0]?.message || 'Skipped') : undefined
  });
}

// Save to database
await testRunDbService.saveModuleResults({
  cronRunId,
  moduleName,
  runData: { tests },
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  slackReportLink: slackReportLink || undefined
});
```

**Database Action:**
```sql
INSERT INTO xyne_test_module (
  cron_run_id,
  module_name,
  run_data,
  started_at,
  completed_at,
  slack_report_link
) VALUES (
  '20251110123045',
  'agent-module',
  '{"tests":[...]}',
  '2025-11-10 12:30:45',
  '2025-11-10 12:32:15',
  'https://juspay.slack.com/archives/C09FNC0FBAP/p1762514338561489'
)
ON CONFLICT (cron_run_id, module_name)
DO UPDATE SET
  run_data = EXCLUDED.run_data,
  completed_at = EXCLUDED.completed_at,
  slack_report_link = EXCLUDED.slack_report_link
```

**Console Output:**
```
💾 Saving module results to test_modules table...
✅ Module results saved to test_modules table
```

---

### 3. Test Run Completion

**When:** After all modules finish
**Script:** `scripts/complete-test-run.ts`
**Trigger:** `run-staggered-tests-server.sh` line 253

```bash
npx tsx scripts/complete-test-run.ts "$exit_code"
```

**Database Action:**
```sql
UPDATE xyne_test_runs
SET
  status = 'completed',  -- or 'failed' if exit_code != 0
  updated_at = CURRENT_TIMESTAMP
WHERE cron_run_id = '20251110123045'
```

---

### 4. Report Generation

#### PDF Report

**When:** After test completion
**Script:** `src/framework/utils/pdf-report-generator.py`
**Trigger:** `run-staggered-tests-server.sh` line 265

**Database Query:**
```sql
SELECT
  m.module_name,
  m.run_data,
  m.slack_report_link,
  r.run_by as username,
  r.run_env as runenv,
  r.cron_run_id,
  r.created_at as run_datetime
FROM xyne_test_module m
JOIN xyne_test_runs r ON m.cron_run_id = r.cron_run_id
WHERE m.cron_run_id = '20251110123045'
ORDER BY m.module_name
```

**Data Transformation:**
```python
# Parse JSONB run_data
run_data = record.get('run_data', {})
tests = run_data.get('tests', [])

# Calculate statistics
total_tests = len(tests)
passed = len([t for t in tests if t.get('status') == 'passed'])
failed = len([t for t in tests if t.get('status') == 'failed'])
skipped = len([t for t in tests if t.get('status') == 'skipped'])

# Count priority failures
highest_failed = len([t for t in tests if t.get('status') == 'failed' and t.get('priority') == 'highest'])
high_failed = len([t for t in tests if t.get('status') == 'failed' and t.get('priority') == 'high'])
# ... etc
```

**Output:**
- PDF file: `reports/test-execution-report-20251110123045-<timestamp>.pdf`
- Uploaded to Slack

#### HTML Report

**When:** Auto-triggered after PDF upload
**Script:** `src/framework/utils/html-report-generator.py`

**Database Query:**
```sql
SELECT
  module_name,
  run_data,
  started_at,
  completed_at,
  slack_report_link
FROM xyne_test_module
WHERE cron_run_id = '20251110123045'
ORDER BY module_name
```

**Output:**
- HTML file: `reports/test-execution-report-20251110123045-<timestamp>.html`
- Uploaded to Slack as thread reply to PDF message

---

## Permission Control

### Configuration

**File:** `.env`
```bash
DB_ALLOWED_USERS=your-username,another-user
```

**Runtime:** `run-staggered-tests-server.sh`
```bash
export SCRIPT_RUN_BY="${SCRIPT_RUN_BY:-${USER}}"
```

### Permission Check

**File:** `src/framework/utils/test-run-db-service.ts`
**Method:** `shouldPerformDbOperations()`

```typescript
async shouldPerformDbOperations(): Promise<boolean> {
  const allowedUsersEnv = process.env.DB_ALLOWED_USERS;

  if (!allowedUsersEnv) {
    console.log('🔍 DB_ALLOWED_USERS not configured, skipping database operations');
    return false;
  }

  const allowedUsers = allowedUsersEnv.split(',').map(u => u.trim());
  const currentUser = process.env.SCRIPT_RUN_BY || process.env.USER || process.env.USERNAME;

  if (!currentUser) {
    console.log('🔍 No user identified, skipping database operations');
    return false;
  }

  const shouldPerform = allowedUsers.includes(currentUser);

  if (!shouldPerform) {
    console.log(`🔍 Database operations: DISABLED for user "${currentUser}"`);
    console.log(`ℹ️  Allowed users: ${allowedUsers.join(', ')}`);
  } else {
    console.log(`🔍 Database operations: ENABLED for user "${currentUser}"`);
  }

  return shouldPerform;
}
```

**Logic:**
1. Check if `DB_ALLOWED_USERS` is set in `.env`
2. Get current user from `SCRIPT_RUN_BY`, `USER`, or `USERNAME` (in that order)
3. Return `true` only if current user is in allowed list
4. Log detailed permission check result

---

## Environment Configuration

**File:** `.env`

```bash
# Database API Credentials
JUSPAY_USERNAME=hema.priya+2@juspay.in
JUSPAY_PASSWORD=Juspay@123456

# Database Access Control
DB_ALLOWED_USERS=your-username,another-user

# Database Endpoints
LOGIN_API_ENDPOINT=https://euler-x.internal.staging.mum.juspay.net/api/ec/v1/admin/login
DB_API_ENDPOINT=https://sandbox.portal.juspay.in/dashboard-test-automation/dbQuery
```

---

## API Usage

### Authentication

```typescript
const response = await fetch(LOGIN_API_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: process.env.JUSPAY_USERNAME,
    password: process.env.JUSPAY_PASSWORD
  })
});

const { token } = await response.json();
```

### Executing Queries

**SELECT (use GET):**
```typescript
const response = await fetch(DB_API_ENDPOINT, {
  method: 'GET',  // Important: GET for SELECT
  headers: {
    'x-web-logintoken': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query: 'SELECT * FROM xyne_test_runs LIMIT 5' })
});

const result = await response.json();
// result = { response: [...rows...] }
```

**INSERT/UPDATE/DELETE (use POST):**
```typescript
const response = await fetch(DB_API_ENDPOINT, {
  method: 'POST',  // Important: POST for INSERT/UPDATE/DELETE
  headers: {
    'x-web-logintoken': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query: 'INSERT INTO ...' })
});

const result = await response.json();
// result = { response: "successfully ran the query", status: true }
```

---

## Querying Test Data

### Get Recent Test Runs

```sql
SELECT
  cron_run_id,
  repo_version,
  status,
  run_by,
  run_env,
  created_at
FROM xyne_test_runs
ORDER BY created_at DESC
LIMIT 10;
```

### Get Module Results for a Run

```sql
SELECT
  module_name,
  run_data,
  slack_report_link,
  started_at,
  completed_at
FROM xyne_test_module
WHERE cron_run_id = '20251110123045'
ORDER BY module_name;
```

### Get Test-Level Data

```sql
SELECT
  module_name,
  run_data->'tests' as tests
FROM xyne_test_module
WHERE cron_run_id = '20251110123045';
```

### Get Failed Tests Only

```sql
SELECT
  m.module_name,
  test->>'name' as test_name,
  test->>'priority' as priority,
  test->>'error_message' as error
FROM xyne_test_module m,
  jsonb_array_elements(m.run_data->'tests') as test
WHERE m.cron_run_id = '20251110123045'
  AND test->>'status' = 'failed';
```

### Get Test Statistics

```sql
SELECT
  m.module_name,
  jsonb_array_length(m.run_data->'tests') as total_tests,
  COUNT(*) FILTER (WHERE test->>'status' = 'passed') as passed,
  COUNT(*) FILTER (WHERE test->>'status' = 'failed') as failed,
  COUNT(*) FILTER (WHERE test->>'status' = 'skipped') as skipped
FROM xyne_test_module m,
  jsonb_array_elements(m.run_data->'tests') as test
WHERE m.cron_run_id = '20251110123045'
GROUP BY m.module_name;
```

---

## Complete Test Run Example

```bash
# 1. Start test run
bash run-staggered-tests-server.sh

# Console output:
🚀 Starting test batch with Cron Run ID: 20251110123045
📋 Initializing test run in database...
🔍 Database operations: ENABLED for user "your-username"
✅ Test run initialized successfully (Batch ID: 20251110123045)

# 2. Tests execute (6 modules in parallel)
💾 Saving module results to test_modules table...
✅ Module results saved to test_modules table

# 3. Test completion
📋 Updating test run status in database...
✅ Test run status updated to: completed

# 4. Report generation
📊 Generating PDF summary report...
✅ PDF report generated successfully
✅ PDF report sent to Slack successfully
📊 Generating HTML report for thread...
✅ HTML report file uploaded successfully
```

**Database State After Completion:**

**xyne_test_runs:**
| cron_run_id | repo_version | status | run_by | run_env | created_at |
|-------------|--------------|--------|--------|---------|------------|
| 20251110123045 | a7f3c21 | completed | your-username | sbx | 2025-11-10 12:30:45 |

**xyne_test_module:**
| cron_run_id | module_name | tests | status |
|-------------|-------------|-------|--------|
| 20251110123045 | agent-module | 16 tests | 3 passed, 1 failed, 12 skipped |
| 20251110123045 | chat-module | 13 tests | 13 passed |
| 20251110123045 | collection-module | 21 tests | 21 passed |
| 20251110123045 | history-module | 25 tests | 1 passed, 1 failed, 23 skipped |
| 20251110123045 | sidebar-module | 12 tests | 1 passed, 1 failed, 10 skipped |
| 20251110123045 | workflow-module | 39 tests | 33 passed, 1 failed, 5 skipped |

---

## Troubleshooting

### Issue: Permission Check Fails

**Symptoms:**
```
ℹ️  Database operations disabled for this user/environment
```

**Solution:**
Check that `SCRIPT_RUN_BY` is exported in `run-staggered-tests-server.sh` line 96:
```bash
export SCRIPT_RUN_BY="${SCRIPT_RUN_BY:-${USER}}"
```

### Issue: Duplicate Key Error

**Symptoms:**
```
duplicate key value violates unique constraint "xyne_test_runs_cron_run_id_key"
```

**Cause:** Trying to insert a CRON_RUN_ID that already exists

**Solution:** This usually means a test run is being retried. Each run should generate a fresh CRON_RUN_ID from `date +"%Y%m%d%H%M%S"`

### Issue: No Data in Tables

**Check:**
1. Permission check passed: Look for "Database operations: ENABLED"
2. No errors in console output
3. Database credentials correct in `.env`
4. User in `DB_ALLOWED_USERS` list

---

## Version Tracking

The system tracks repository versions across test runs:

```typescript
// Get previous run info
const previousRun = await getPreviousRunInfo(runEnv);

// Store with version tracking
{
  cron_run_id: '20251110123045',
  repo_version: 'a7f3c21',         // Current git commit
  is_version_active: true,
  previous_version: 'b5e2d19',     // Previous run's version
  previous_run_id: '20251109145023' // Previous run's ID
}
```

This enables:
- Tracking which version is currently active
- Comparing results across versions
- Identifying when version changes occurred

---

## Summary

### Data Storage
- ✅ Run metadata → `xyne_test_runs`
- ✅ Test details → `xyne_test_module` (JSONB)
- ✅ Version tracking enabled
- ✅ Permission-based access control

### Reports
- ✅ PDF reports (fetch from new tables)
- ✅ HTML reports (with test-level detail)
- ✅ Slack integration (PDF + HTML thread)

### Benefits
- **Detailed Data:** Test-level information, not just aggregates
- **Flexible Schema:** JSONB allows storing any test metadata
- **Version Tracking:** Links test runs to code versions
- **Normalized:** Clean separation of run vs module data
- **Queryable:** Rich JSONB queries for test analysis

---

**Documentation Version:** 1.0
**Last Updated:** 2025-11-10
**Database Schema Version:** 2.0 (normalized with JSONB)
