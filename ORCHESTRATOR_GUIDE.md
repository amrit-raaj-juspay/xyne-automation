# Playwright Test Orchestrator - Complete Guide

**Version:** 1.1
**Last Updated:** October 22, 2025
**Author:** Xyne Automation Team

---

## Table of Contents

1. [Overview](#overview)
2. [What Was Implemented](#what-was-implemented)
3. [Quick Start](#quick-start)
4. [Core Features](#core-features)
5. [Automatic Step Capture](#automatic-step-capture)
6. [How It Works](#how-it-works)
7. [File Changes](#file-changes)
8. [Usage Examples](#usage-examples)
9. [Reporting System](#reporting-system)
10. [Troubleshooting](#troubleshooting)
11. [API Reference](#api-reference)

---

## Overview

The Test Orchestrator is a powerful Playwright extension that provides:

### Key Features
- ✅ **Sequential test execution** with dependency management
- ✅ **Browser persistence** across test failures (continueOnFailure mode)
- ✅ **Priority-based test ordering** (highest, high, medium, low)
- ✅ **Automatic dependency checking** and test skipping
- ✅ **Detailed HTML reports** with Playwright-style UI
- ✅ **Screenshot capture** and embedding on failures
- ✅ **Slack notifications** with accurate pass/fail counts
- ✅ **Nested step tracking** with collapsible UI
- ✅ **Automatic step capture** for all Playwright actions (new!)
- ✅ **Auto-expand failed steps** in reports (new!)
- ✅ **Helper functions** for logging and URL capture (new!)

### Why Use It?

**Problem:** Standard Playwright tests stop when they fail, closing the browser and preventing subsequent tests from running in the same session.

**Solution:** The orchestrator catches errors, keeps the browser alive, and continues executing tests while maintaining accurate pass/fail tracking.

---

## What Was Implemented

### 1. Core Orchestrator System

**File:** `src/framework/utils/test-orchestrator.ts`

**Features:**
- Sequential test execution with dependency graphs
- Error catching without browser closure
- Test result storage in JSON format
- Automatic screenshot capture on failures
- Priority-based test ordering
- Custom test conditions and skip logic

**Key Code:**
```typescript
// Catch errors but don't re-throw (keeps browser alive)
if (suiteOptions.continueOnFailure) {
  try {
    await this.executeTest(testConfig, { sharedPage }, suiteOptions, testInfo);
  } catch (error: any) {
    // Re-throw skip errors
    if (error?.toString().includes('Test is skipped')) {
      throw error;
    }

    // Capture screenshot
    const screenshotPath = testInfo.outputPath(`failure-${Date.now()}.png`);
    await sharedPage.page.screenshot({ path: screenshotPath, fullPage: true });

    // DON'T re-throw - browser stays alive!
  }
}
```

### 2. Browser Persistence System

**File:** `src/framework/core/shared-browser-manager.ts`

**Features:**
- Page close protection in orchestrated mode
- Shared browser instances across tests
- Scoped page management (file, suite, test, global)

**Key Code:**
```typescript
// Override page.close() to prevent closure in orchestrated mode
const isOrchestratedMode = (globalThis as any).__ORCHESTRATOR_CONTINUE_ON_FAILURE__;

if (isOrchestratedMode) {
  console.log(`🔒 Page close protection enabled for orchestrated mode`);

  const originalPageClose = page.close.bind(page);
  page.close = async () => {
    console.log(`🛡️ Prevented page close in orchestrated mode`);
    return Promise.resolve();
  };

  (page as any).__originalClose = originalPageClose;
}
```

### 3. Custom Reporter System

**File:** `src/framework/core/orchestrator-reporter.ts`

**Features:**
- Fixes test statuses in Playwright's view
- Marks failed tests correctly even when errors are caught
- Integrates with blob reporter for detailed step data

**Key Code:**
```typescript
// Fix test status for caught errors
onTestEnd(test, result) {
  const orchestratorResults = loadOrchestratorResults();
  const testResult = orchestratorResults[test.title];

  if (testResult && testResult.status === 'failed') {
    // Force Playwright to see test as failed
    result.status = 'failed';
    if (testResult.error) {
      result.errors.push({
        message: testResult.error,
        stack: testResult.stack || ''
      });
    }
  }
}
```

### 4. Enhanced Reporting

**Files:**
- `scripts/generate-playwright-ui-report.js` - Main report generator
- `scripts/generate-orchestrator-report.js` - Legacy custom reporter
- `src/framework/core/enhanced-reporter.ts` - Auto-generates reports after tests

**Features:**
- Playwright-style HTML reports with collapsible nested steps
- Inline error display within failed substeps
- Base64 screenshot embedding
- Accurate test status from orchestrator results
- Dependency tracking and skip reason display

### 5. Slack Integration

**File:** `src/framework/core/enhanced-reporter.ts`

**Features:**
- Sends test summary to Slack after test completion
- Accurate pass/fail counts using orchestrator data
- Priority breakdown in thread
- Links to HTML reports

**Key Fix:**
```typescript
// Use orchestrator results for accurate counts
if (fs.existsSync(orchestratorResultsPath)) {
  const orchestratorResults = JSON.parse(fs.readFileSync(orchestratorResultsPath, 'utf-8'));
  const tests = Object.values(orchestratorResults);

  summary = {
    totalPassed: tests.filter(t => t.status === 'passed').length,
    totalFailed: tests.filter(t => t.status === 'failed').length,
    totalSkipped: tests.filter(t => t.status === 'skipped').length,
    // ...
  };
}
```

### 6. Configuration Changes

**File:** `playwright.config.ts`

**Changes:**
- Added blob reporter for detailed step capture
- Added orchestrator-reporter as first reporter
- Enabled trace collection
- Configured JSON and HTML reporters

```typescript
reporter: [
  ['./src/framework/core/orchestrator-reporter.ts'], // MUST be first
  ['blob', { outputDir: 'reports/blob-report' }],   // Captures all steps
  ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
  ['json', { outputFile: 'reports/test-results.json' }],
  ['list'],
  ['./src/framework/core/enhanced-reporter.ts']     // Slack + report generation
],
```

---

## Quick Start

### 1. Basic Test Setup

```typescript
import { TestOrchestrator } from '@/framework/utils/test-orchestrator';

const orchestrator = new TestOrchestrator({
  useSharedPage: true,
  continueOnFailure: true,  // Keep browser alive on failures
  sequential: true,          // Run tests in order
  logLevel: 'detailed'
});

orchestrator.createSuite('My Test Suite', [
  {
    name: 'Login Test',
    metadata: { priority: 'highest' },
    testFunction: async ({ sharedPage }) => {
      await sharedPage.page.goto('https://example.com/login');
      await sharedPage.page.fill('#username', 'user');
      await sharedPage.page.fill('#password', 'pass');
      await sharedPage.page.click('#login');
    }
  },
  {
    name: 'Dashboard Test',
    dependencies: ['Login Test'],  // Runs only if Login Test passes
    metadata: { priority: 'high' },
    testFunction: async ({ sharedPage }) => {
      // Browser is still on logged-in page from Login Test
      await expect(sharedPage.page.locator('h1')).toContainText('Dashboard');
    }
  },
  {
    name: 'Logout Test',
    dependencies: ['Login Test'],
    runRegardless: true,  // Always runs, even if dependencies fail
    metadata: { priority: 'medium' },
    testFunction: async ({ sharedPage }) => {
      await sharedPage.page.click('#logout');
    }
  }
]);
```

### 2. Run Tests

```bash
# Run tests with orchestrator
npx playwright test tests/functional/agent-module.spec.ts --project=chromium

# Generate report manually (auto-generated by default)
npm run report:detailed

# View report
open reports/detailed-step-report.html
```

---

## Core Features

### 1. Dependency Management

Tests can depend on other tests. If a dependency fails, dependent tests skip automatically.

```typescript
{
  name: 'Create Agent',
  dependencies: ['Login', 'Navigate to Agent Page'],  // Both must pass
  testFunction: async ({ sharedPage }) => {
    // Only runs if both Login and Navigate to Agent Page passed
  }
}
```

**Dependency Types:**

```typescript
// Simple string dependency (always required)
dependencies: ['Login Test']

// All dependencies are required by default
dependencies: ['Test 1', 'Test 2', 'Test 3']
```

### 2. Priority Levels

Organize tests by priority:

```typescript
metadata: {
  priority: 'highest' | 'high' | 'medium' | 'low'
}
```

**Priority Order:**
1. `highest` - Critical tests (e.g., login, setup)
2. `high` - Important features
3. `medium` - Standard features
4. `low` - Optional features

### 3. Browser Persistence (continueOnFailure Mode)

**How It Works:**

1. **Global Flag Set**
   ```typescript
   (globalThis as any).__ORCHESTRATOR_CONTINUE_ON_FAILURE__ = true;
   ```

2. **Error Catching**
   ```typescript
   try {
     await executeTest();
   } catch (error) {
     // Capture screenshot
     // Store error
     // DON'T re-throw (browser stays alive)
   }
   ```

3. **Page Close Protection**
   ```typescript
   page.close = async () => {
     console.log('🛡️ Prevented page close');
     return Promise.resolve();
   };
   ```

**Result:** Browser stays open across all 16 tests, even when test 12 fails!

### 4. Conditional Execution

Run tests based on custom conditions:

```typescript
{
  name: 'Optional Test',
  runRegardless: true,  // Ignores dependencies
  customCondition: (results) => {
    const hasEnoughPassed =
      Array.from(results.values()).filter(r => r.status === 'passed').length >= 5;

    return {
      shouldRun: hasEnoughPassed,
      reason: 'Need at least 5 passed tests'
    };
  }
}
```

---

## Automatic Step Capture

The framework automatically captures Playwright actions as test steps that appear in HTML reports. This provides detailed visibility into what your tests are doing.

### What's Automatically Captured

The following operations are **automatically wrapped** and appear as steps in reports without any code changes:

#### 1. Page Navigation
```typescript
await page.goto('https://example.com');
// Appears in report as: goto("https://example.com")
```

#### 2. Page Navigation
```typescript
await page.goBack();
// Appears in report as: goBack()

await page.goForward();
// Appears in report as: goForward()

await page.reload();
// Appears in report as: reload()
```

#### 3. Wait Operations
```typescript
await page.waitForTimeout(3000);
// Appears in report as: waitForTimeout(3000ms)

await page.waitForURL('/dashboard');
// Appears in report as: waitForURL("/dashboard")

await page.waitForLoadState('networkidle');
// Appears in report as: waitForLoadState("networkidle")

await page.waitForSelector('.loading');
// Appears in report as: waitForSelector(".loading")
```

#### 4. All Locator Actions
```typescript
await page.locator('#username').fill('user@example.com');
// Appears in report as: fill("user@example.com") on "#username"

await page.locator('button').click();
// Appears in report as: click() on "button"

await page.locator('input').type('password');
// Appears in report as: type("password") on "input"
```

**Automatically captured locator actions:**
- `click()`, `dblclick()` - Click actions
- `fill()`, `type()`, `press()`, `pressSequentially()` - Text input
- `check()`, `uncheck()` - Checkbox/radio
- `selectOption()` - Dropdowns
- `setInputFiles()` - File uploads
- `focus()`, `blur()` - Focus control
- `hover()`, `dragTo()`, `tap()` - Mouse/touch gestures

#### 4. Expectations (Auto-captured via instrumented expect())
```typescript
import { expect } from '@/framework/utils/instrumented-page';

await expect(page.locator('h1')).toBeVisible();
// Appears in report as: expect(locator).toBeVisible()

await expect(page.locator('span')).toHaveText('Welcome');
// Appears in report as: expect(locator).toHaveText("Welcome")

await expect(page).toHaveTitle('Dashboard');
// Appears in report as: expect(page).toHaveTitle("Dashboard")
```

**All expect() assertions are automatically captured when you import from instrumented-page!**

### Helper Functions for Manual Capture

Some operations can't be automatically wrapped because they're synchronous. For these, use helper functions:

#### 1. `logStep()` - Capture Log Messages

**Instead of `console.log()`:**
```typescript
// ❌ Old way (not captured in reports)
console.log('Starting user registration flow');
console.log('User email:', userEmail);

// ✅ New way (appears in reports)
import { logStep } from '@/framework/utils';

await logStep('Starting user registration flow');
await logStep('User email:', userEmail);
await logStep('Processing payment for order:', orderId);
```

**In the report, you'll see:**
```
✓ 📝 Starting user registration flow
✓ 📝 User email: user@example.com
✓ 📝 Processing payment for order: ORD-12345
```

**⚠️ Important Notes:**

1. **`console.log()` only appears in terminal** - NOT in HTML reports
   ```typescript
   console.log('This message'); // ❌ Only in terminal/console output
   await logStep('This message'); // ✅ Appears in HTML report
   ```

2. **`logStep()` appears in exact order** - Shows at the position where you call it
   ```typescript
   await logStep('Starting test');        // Step 1 in report
   await page.goto('https://example.com'); // Step 2 in report
   await logStep('Page loaded');          // Step 3 in report
   await page.click('button');            // Step 4 in report
   await logStep('Button clicked');       // Step 5 in report
   ```

3. **Both work together** - Use `console.log()` for debug, `logStep()` for reports
   ```typescript
   console.log('DEBUG: Internal state:', state); // Terminal only (debugging)
   await logStep('User completed checkout');     // HTML report (business logic)
   ```

#### 2. `getUrlStep()` - Capture URL Checks

**Instead of `page.url()`:**
```typescript
// ❌ Old way (not captured in reports)
const currentUrl = page.url();
console.log('Current URL:', currentUrl);
expect(currentUrl).toContain('/dashboard');

// ✅ New way (appears in reports)
import { getUrlStep } from '@/framework/utils';

const currentUrl = await getUrlStep(page, 'Verify we are on dashboard');
expect(currentUrl).toContain('/dashboard');
```

**In the report, you'll see:**
```
✓ Verify we are on dashboard
  Current URL: https://example.com/dashboard
```

### Quick Reference: What Goes in Reports vs Terminal

| Operation | Code | Terminal Output | HTML Report | Notes |
|-----------|------|-----------------|-------------|-------|
| **Console log** | `console.log('message')` | ✅ Yes | ❌ No | Debug only |
| **Log step** | `await logStep('message')` | ✅ Yes | ✅ Yes | Use for reports |
| **Page goto** | `await page.goto(url)` | ✅ Yes | ✅ Yes | Auto-captured |
| **Page navigation** | `await page.goBack()` | ✅ Yes | ✅ Yes | Auto-captured |
| **Wait timeout** | `await page.waitForTimeout(ms)` | ✅ Yes | ✅ Yes | Auto-captured |
| **Wait for URL** | `await page.waitForURL(url)` | ✅ Yes | ✅ Yes | Auto-captured |
| **Wait for state** | `await page.waitForLoadState()` | ✅ Yes | ✅ Yes | Auto-captured |
| **Click action** | `await page.locator().click()` | ✅ Yes | ✅ Yes | Auto-captured |
| **Fill action** | `await page.locator().fill()` | ✅ Yes | ✅ Yes | Auto-captured |
| **Type action** | `await page.locator().type()` | ✅ Yes | ✅ Yes | Auto-captured |
| **Press key** | `await page.locator().press()` | ✅ Yes | ✅ Yes | Auto-captured |
| **Check/Uncheck** | `await page.locator().check()` | ✅ Yes | ✅ Yes | Auto-captured |
| **Expect assertion** | `await expect(...).toBeVisible()` | ✅ Yes | ✅ Yes | Auto-captured |
| **Page URL** | `page.url()` | ❌ No | ❌ No | Use getUrlStep() |
| **Get URL step** | `await getUrlStep(page, label)` | ✅ Yes | ✅ Yes | Use for reports |

### Complete Example

```typescript
import { logStep, getUrlStep } from '@/framework/utils';

test('User registration flow', async ({ page }) => {
  // Debug logging (terminal only)
  console.log('DEBUG: Starting registration test');

  // Automatically captured
  await page.goto('https://example.com/register');

  // Manual logging (appears in report)
  await logStep('Starting registration for new user');

  // Automatically captured
  await page.locator('#email').fill('user@example.com');
  await page.locator('#password').fill('SecurePass123');
  await page.locator('#confirmPassword').fill('SecurePass123');

  // Manual logging with data (appears in report)
  await logStep('Filled registration form for:', 'user@example.com');

  // Debug logging (terminal only)
  console.log('DEBUG: Form filled, submitting...');

  // Automatically captured
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);

  // Capture URL verification (appears in report)
  const currentUrl = await getUrlStep(page, 'Verify redirected to welcome page');
  expect(currentUrl).toContain('/welcome');

  // Automatically captured
  await expect(page.locator('h1')).toHaveText('Welcome!');

  await logStep('Registration completed successfully');

  // Debug logging (terminal only)
  console.log('DEBUG: Test completed');
});
```

**Terminal Output:**
```
DEBUG: Starting registration test
DEBUG: Form filled, submitting...
DEBUG: Test completed
✓ User registration flow (5.2s)
```

**HTML Report Output:**
```
✓ goto("https://example.com/register")
✓ 📝 Starting registration for new user
✓ fill("user@example.com") on "#email"
✓ fill("SecurePass123") on "#password"
✓ fill("SecurePass123") on "#confirmPassword"
✓ 📝 Filled registration form for: user@example.com
✓ click() on "button[type="submit"]"
✓ waitForTimeout(2000ms)
✓ Verify redirected to welcome page
  Current URL: https://example.com/welcome
✓ expect().toHaveText("Welcome!") on "h1"
✓ 📝 Registration completed successfully
```

**Notice:** The `console.log()` messages appear only in terminal, while `logStep()` messages appear in both!

### How It Works Internally

**File:** `src/framework/utils/instrumented-page.ts`

The framework uses Proxy objects to intercept and wrap Playwright method calls:

```typescript
// Automatically wraps page.goto()
page.goto = async function(url: string, options?: any) {
  return await step(`goto("${url}")`, async () => {
    return await originalGoto(url, options);
  });
};

// Automatically wraps page.waitForTimeout()
page.waitForTimeout = async function(timeout: number) {
  return await step(`waitForTimeout(${timeout}ms)`, async () => {
    return await originalWaitForTimeout(timeout);
  });
};

// Automatically wraps locator actions
locator.click = async function(...args: any[]) {
  return await step(`click() on "${selector}"`, async () => {
    return await originalClick.apply(this, args);
  });
};
```

### Configuration

The instrumentation is **automatically enabled** through the test fixtures system:

**File:** `src/framework/core/test-fixtures.ts`

```typescript
import { wrapPageWithInstrumentation } from '@/framework/utils/instrumented-page';

test.extend({
  sharedPage: async ({ page }, use) => {
    // Automatically wrap page methods
    const instrumentedPage = wrapPageWithInstrumentation(page);
    await use({ page: instrumentedPage });
  }
});
```

**No configuration needed** - it works automatically for all tests using the orchestrator!

---

## How It Works

### Test Execution Flow

```
1. Orchestrator Starts
   ↓
2. Build Dependency Graph
   ↓
3. Order Tests by Priority
   ↓
4. For Each Test:
   ├─ Check Dependencies
   │  ├─ All passed? → Run test
   │  ├─ Any failed? → Skip test
   │  └─ runRegardless? → Run anyway
   ├─ Execute Test
   │  ├─ Success? → Record as passed
   │  └─ Failure? → Catch error, capture screenshot, record as failed
   └─ Save Result to orchestrator-results.json
   ↓
5. Generate Reports
   ├─ Merge orchestrator data + blob data
   ├─ Generate HTML report
   └─ Send Slack notification
```

### Data Flow

```
Test Execution
    ↓
orchestrator-results.json (accurate status)
    ↓
blob-report/ (detailed steps)
    ↓
test-results.json (Playwright data)
    ↓
generate-playwright-ui-report.js (merge all data)
    ↓
detailed-step-report.html (final report)
```

### Key Technical Details

**Serial Mode:**
```typescript
test.describe.configure({ mode: 'serial' });
```
Required for dependencies to work - tests run one at a time.

**Error Handling Trade-off:**
- ✅ Browser stays alive (errors caught)
- ⚠️ Playwright thinks test passed (error not re-thrown)
- ✅ Orchestrator knows real status (saved in JSON)
- ✅ Custom reporter fixes Playwright's view

---

## File Changes

### New Files Created

```
src/framework/
├── core/
│   └── orchestrator-reporter.ts          # Custom Playwright reporter
├── utils/
│   ├── test-orchestrator.ts              # Main orchestrator logic
│   ├── step-tracker.ts                   # Step tracking utilities
│   ├── instrumented-page.ts              # Automatic action tracking (experimental)
│   ├── api-response.ts                   # API response utilities
│   └── index.ts                          # Exports

scripts/
├── generate-orchestrator-report.js        # Custom HTML report generator
├── generate-playwright-ui-report.js       # Playwright-style report (main)
├── generate-detailed-step-report.js       # Detailed steps report
└── generate-playwright-style-orchestrator-report.js  # Legacy

tests/examples/
└── test-orchestrator-example.spec.ts      # Usage examples

docs/
├── ORCHESTRATOR_ARCHITECTURE_AND_ISSUES.md
├── ORCHESTRATOR_SOLUTION_SUMMARY.md
├── ENHANCED_PLAYWRIGHT_REPORT.md
├── DETAILED_STEP_REPORTING.md
├── FINAL_REPORT_SOLUTION.md
└── WHAT_TO_DO_NEXT.md
```

### Modified Files

```
playwright.config.ts                       # Added blob reporter, orchestrator-reporter
package.json                               # Added report scripts
src/framework/core/enhanced-reporter.ts    # Slack fix, auto-report generation
src/framework/core/shared-browser-manager.ts  # Browser persistence
src/framework/core/test-fixtures.ts        # Screenshot capture, page management
tests/functional/agent-module.spec.ts      # Converted to orchestrated tests
```

---

## Usage Examples

### Example 1: Simple Dependency Chain

```typescript
orchestrator.createSuite('E-Commerce Tests', [
  {
    name: 'User Login',
    metadata: { priority: 'highest' },
    testFunction: async ({ sharedPage }) => {
      await sharedPage.page.goto('/login');
      await sharedPage.page.fill('#username', 'user');
      await sharedPage.page.fill('#password', 'pass');
      await sharedPage.page.click('#login');
    }
  },
  {
    name: 'Add to Cart',
    dependencies: ['User Login'],
    metadata: { priority: 'high' },
    testFunction: async ({ sharedPage }) => {
      await sharedPage.page.goto('/products');
      await sharedPage.page.click('.add-to-cart:first-child');
    }
  },
  {
    name: 'Checkout',
    dependencies: ['Add to Cart'],
    metadata: { priority: 'high' },
    testFunction: async ({ sharedPage }) => {
      await sharedPage.page.goto('/cart');
      await sharedPage.page.click('#checkout');
    }
  },
  {
    name: 'Logout',
    dependencies: ['User Login'],
    runRegardless: true,  // Always cleanup
    metadata: { priority: 'medium' },
    testFunction: async ({ sharedPage }) => {
      await sharedPage.page.click('#logout');
    }
  }
]);
```

### Example 2: Real-World Agent Module Tests

**File:** `tests/functional/agent-module.spec.ts`

```typescript
const orchestrator = new TestOrchestrator({
  useSharedPage: true,
  continueOnFailure: true,
  sequential: true
});

orchestrator.createSuite('Agent Module Tests', [
  {
    name: 'user login',
    metadata: { priority: 'highest' },
    testFunction: async ({ sharedPage }) => {
      await loginHelper.performLogin(sharedPage.page);
    }
  },
  {
    name: 'navigate to agent page',
    dependencies: ['user login'],
    metadata: { priority: 'high' },
    testFunction: async ({ sharedPage }) => {
      await agentPage.navigateToAgentPage();
    }
  },
  {
    name: 'verify and click agent create button',
    dependencies: ['navigate to agent page'],
    metadata: { priority: 'high' },
    testFunction: async ({ sharedPage }) => {
      await agentPage.verifyAndClickCreateButton();
    }
  },
  {
    name: 'create agent with form data',
    dependencies: ['verify and click agent create button'],
    metadata: { priority: 'high' },
    testFunction: async ({ sharedPage }) => {
      await agentPage.createAgentWithFormData({
        name: 'Test Automation Agent',
        description: 'An agent for testing automation',
        instructions: 'Follow test instructions carefully'
      });
    }
  },
  // ... more tests ...
  {
    name: 'delete agent and verify removal',
    dependencies: ['user login'],  // Only needs login, not full chain
    runRegardless: true,            // Always cleanup
    metadata: { priority: 'medium' },
    testFunction: async ({ sharedPage }) => {
      await agentPage.deleteAgent('Test Automation Agent');
    }
  }
]);
```

**Test Results:**
```
✓  1 user login (32s)
✓  2 navigate to agent page (23s)
✓  3 verify and click agent create button (6s)
✓  4 create agent with form data (8s)
✓  5 verify success popup (2s)
✓  6 verify created agent in tabs (5s)
✓  7 click agent name (3s)
✓  8 upload PDF (7s)
✓  9 verify uploaded file (2s)
✓ 10 ask question (5s)
✓ 11 verify AI response (4s)
❌ 12 verify conversation (FAIL - element not found)
-  13 navigate back (SKIP - dependency failed)
-  14 edit agent (SKIP - dependency failed)
-  15 verify edited (SKIP - dependency failed)
✓ 16 delete agent (runRegardless: true)

Total: 16 tests | Passed: 12 | Failed: 1 | Skipped: 3
```

---

## Reporting System

### 1. Orchestrator Results

**File:** `reports/orchestrator-results.json`

**Contains:**
- Accurate test status (passed/failed/skipped)
- Test duration
- Error messages and stack traces
- Screenshot paths
- Dependencies
- Priority levels
- Timestamps

**Example:**
```json
{
  "verify conversation with AI response": {
    "testName": "verify conversation with AI response",
    "fullTitle": "verify conversation with AI response",
    "status": "failed",
    "duration": 10608,
    "error": "Element not found: text=TestNeptune",
    "stack": "...",
    "screenshotPath": "reports/test-artifacts/failure-1729618234567.png",
    "priority": "high",
    "dependencies": ["ask question about solar system planets and send"],
    "startTime": "2025-10-22T17:15:23.234Z",
    "endTime": "2025-10-22T17:15:33.842Z"
  }
}
```

### 2. Blob Report

**Location:** `reports/blob-report/`

**Contains:**
- Every Playwright action (click, fill, expect, etc.)
- Nested step hierarchy
- Step timing
- Error locations

### 3. HTML Report

**File:** `reports/detailed-step-report.html`

**Features:**
- Playwright's exact UI design
- Collapsible nested steps (▶ icon to expand)
- **Auto-expand failed steps** - Failed tests automatically expand to show all substeps
- **Proper error messages** - Shows actual error text instead of `[object Object]`
- Inline error display within failed substeps
- Embedded screenshots (base64)
- **Priority badges** - Color-coded badges showing test priority (Highest, High, Medium, Low)
- **Advanced filtering** - Filter by status (All/Passed/Failed/Skipped) AND priority (All/Highest/High/Medium/Low)
- Search functionality - Search tests by name
- Accurate test status from orchestrator

**Auto-generated by:** `src/framework/core/enhanced-reporter.ts` after test completion

**Manual generation:**
```bash
npm run report:detailed
# or
node scripts/generate-playwright-ui-report.js
```

**Recent Improvements (v1.1):**

1. **Auto-Expand Failed Steps**
   - When a test fails, all parent steps containing the failure are automatically expanded
   - Shows exactly which substeps passed (✓) before the failure occurred
   - Makes debugging much faster - no need to manually expand steps

2. **Fixed Error Message Display**
   - Previously showed: `Error: [object Object]`
   - Now shows: `Error: expect().toBeVisible() failed - Locator not found...`
   - Handles both object and string error formats
   - Includes full stack trace for debugging

3. **Better Step Location Display**
   - Shows file:line numbers for failures
   - Handles both string and object location formats
   - Example: `agent-module-page.ts:733`

4. **Priority Badges and Filtering**
   - Each test displays a color-coded priority badge next to its name
   - Badge colors:
     - 🔴 **HIGHEST** - Red (#c0392b) - Critical tests
     - 🟠 **HIGH** - Orange (#e67e22) - Important features
     - 🟡 **MEDIUM** - Yellow (#f39c12) - Standard tests
     - ⚪ **LOW** - Gray (#95a5a6) - Nice-to-have tests
   - Dual filter system:
     - Status filters: All, Passed, Failed, Skipped
     - Priority filters: All Priorities, Highest, High, Medium, Low
   - Filters work together (AND logic) - e.g., show only "Failed" tests with "High" priority
   - Priority data stored as `data-priority` attribute on each test item

**Where to See Priorities in the Report:**

The priority badge appears in the test header, between the test name and duration:

```
✓ user login [HIGHEST] 2.3s
✓ navigate to agent page [HIGH] 1.5s
✓ create agent with form data [HIGH] 3.2s
✓ cleanup test agents [MEDIUM] 0.8s
```

**Example of Failed Test Report:**

```
❌ upload solar system PDF via clip icon (15.1s)  [Auto-expanded]
  ↓
  ✓ setInputFiles("./props/Solar-System-PDF.pdf") on "input[type='file']" (12ms)
  ✓ waitForTimeout(3000ms) (3.0s)
  ✓ expect().toBeVisible() on "div.search-container" (245ms)
  ✓ expect().toBeVisible() on "div[contenteditable='true']" (189ms)
  ✗ expect().toBeVisible() on "button:has(svg.lucide-arrow-right)" (10.0s)
    └─ Error: expect().toBeVisible() failed

       Locator: locator('button:has(svg.lucide-arrow-right)')
       Expected: visible
       Received: <element(s) not found>
       Timeout: 10000ms

       Location: agent-module-page.ts:733

       [Screenshot attached]
```

### 4. Slack Notifications

**Sent to:** Configured Slack webhook

**Contains:**
- Test summary (passed/failed/skipped counts)
- Priority breakdown
- Failed test names
- Skipped test reasons
- Link to HTML report (if configured)

**Example:**
```
🔴 Test Suite Execution Completed
XYNE - Automation report for agent-module

📅 DATE/TIME: Tuesday, October 22, 2025

SCRIPT RUN BY: your-username
TEST ENV URL: https://sbx.xyne.juspay.net

Test Cases Run: 16
Test Cases Passed: 12 ✅
Test Cases Failed: 1 ❌
Test Cases Skipped: 3

📊 Priority Breakdown:
🟢 HIGHEST: 1/1 passed (100%)
🔴 HIGH: 10/11 passed (91%) | Failed: 1
🟢 MEDIUM: 1/1 passed (100%)
```

---

## Troubleshooting

### Issue 1: Browser Still Closing on Failures

**Symptoms:**
- Tests stop after first failure
- Browser closes
- Subsequent tests don't run

**Check:**
1. Is `continueOnFailure: true` set in orchestrator options?
2. Look for console log: `🌐 Global flag __ORCHESTRATOR_CONTINUE_ON_FAILURE__ set to: true`
3. Look for: `🔒 Page close protection enabled for orchestrated mode`

**Debug:**
```typescript
console.log('Flag:', (globalThis as any).__ORCHESTRATOR_CONTINUE_ON_FAILURE__);
```

**Fix:**
Ensure orchestrator is created with:
```typescript
const orchestrator = new TestOrchestrator({
  continueOnFailure: true  // ← Must be true
});
```

### Issue 2: Wrong Test Status in Reports

**Symptoms:**
- Failed tests show as passed
- Slack shows 16 passed / 0 failed (should be 12 passed / 1 failed / 3 skipped)

**Check:**
1. Does `reports/orchestrator-results.json` exist?
2. Look for console log: `📊 Using orchestrator results for Slack notification`
3. Check if orchestrator-reporter.ts is first in reporter list

**Fix:**
Ensure `playwright.config.ts` has:
```typescript
reporter: [
  ['./src/framework/core/orchestrator-reporter.ts'], // ← MUST be first
  // ... other reporters
]
```

### Issue 3: Tests Not Running Sequentially

**Symptoms:**
- Tests run in parallel
- Dependencies don't work
- Random test failures

**Cause:** Missing serial mode configuration

**Fix:**
Ensure `sequential: true` in orchestrator options:
```typescript
const orchestrator = new TestOrchestrator({
  sequential: true  // ← Required for dependencies
});
```

### Issue 4: Missing Screenshots in Report

**Symptoms:**
- Screenshots not appearing in HTML report
- Screenshot section empty

**Check:**
1. Are screenshots being captured? Look for: `📸 Screenshot captured`
2. Check `reports/test-artifacts/` for PNG files
3. Check browser console for base64 embedding errors

**Fix:**
Screenshots are automatically embedded as base64. If missing, check:
```typescript
// In generate-playwright-ui-report.js
function imageToBase64(imagePath) {
  // Ensure this function is working
}
```

### Issue 5: Duplicate Steps in Report

**Symptoms:**
- Same action appears 5 times
- Example: `fill("text") on "input"` appears multiple times

**Cause:** Custom instrumentation wrapping locator chains

**Solution:** Custom instrumentation is DISABLED by default.
Do NOT enable `wrapPageWithInstrumentation()` in test-fixtures.ts

**Current Status (CORRECT):**
```typescript
// test-fixtures.ts
// NOTE: Custom instrumentation DISABLED - causes duplicate nested steps
// const instrumentedPage = wrapPageWithInstrumentation(page);
await use({ page, apiMonitor });  // ← Use raw page
```

---

## API Reference

### TestOrchestrator Class

#### Constructor

```typescript
constructor(options: Partial<OrchestratorOptions>)
```

**Options:**
```typescript
interface OrchestratorOptions {
  useSharedPage?: boolean;       // Default: true
  sequential?: boolean;           // Default: true
  continueOnFailure?: boolean;    // Default: false
  logLevel?: 'minimal' | 'detailed' | 'verbose';  // Default: 'detailed'
  suiteName?: string;
}
```

#### Methods

**createSuite()**
```typescript
createSuite(
  suiteName: string,
  tests: OrchestratedTestConfig[],
  options?: Partial<OrchestratorOptions>
): void
```

Creates a test suite with orchestration.

### Test Configuration

```typescript
interface OrchestratedTestConfig {
  name: string;                    // Test name (must be unique)
  dependencies?: string[];         // Names of tests this depends on
  metadata?: {
    priority?: 'highest' | 'high' | 'medium' | 'low';
    tags?: string[];
  };
  runRegardless?: boolean;         // Run even if dependencies fail
  customCondition?: (results: Map<string, TestExecutionResult>) => {
    shouldRun: boolean;
    reason?: string;
  };
  testFunction: (fixtures: { sharedPage: { page: Page, apiMonitor?: APIMonitor } }) => Promise<void> | void;
  timeout?: number;                // Test timeout in ms
  retries?: number;                // Number of retries on failure
}
```

### Test Result

```typescript
interface TestExecutionResult {
  testName: string;
  fullTitle: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;                // milliseconds
  error?: string;
  stack?: string;
  screenshotPath?: string;
  priority?: string;
  dependencies?: string[];
  skipReason?: string;
  startTime: string;               // ISO timestamp
  endTime: string;                 // ISO timestamp
  attachments?: Array<{
    name: string;
    path: string;
    contentType: string;
  }>;
}
```

---

## NPM Scripts

```json
{
  "scripts": {
    "test:agent-module": "npx playwright test tests/functional/agent-module.spec.ts --project=chromium",
    "test:agent-with-report": "npm run test:agent-module && npm run report:detailed",
    "report:detailed": "node scripts/generate-playwright-ui-report.js",
    "report:orchestrator": "node scripts/generate-orchestrator-report.js"
  }
}
```

---

## Summary of Changes

### What Was Done

#### v1.0 (Initial Release)
1. ✅ Created test orchestrator with dependency management
2. ✅ Implemented browser persistence (continueOnFailure mode)
3. ✅ Added custom Playwright reporter to fix test statuses
4. ✅ Integrated blob reporter for detailed step capture
5. ✅ Created Playwright-style HTML report generator
6. ✅ Fixed Slack notifications to show accurate counts
7. ✅ Added screenshot capture and embedding
8. ✅ Implemented priority-based test ordering
9. ✅ Added auto-report generation after tests
10. ✅ Created comprehensive documentation

#### v1.1 (Latest - October 22, 2025)
11. ✅ **Added automatic step capture for all Playwright actions**
    - `page.goto()` - Already working
    - `page.waitForTimeout()` - **NEW!** Now captured automatically
    - `page.goBack()`, `goForward()`, `reload()` - **NEW!** Navigation actions
    - `page.waitForURL()`, `waitForLoadState()`, `waitForSelector()` - **NEW!** Wait methods
    - All locator actions (click, fill, type, press, check, etc.) - Already working
    - `pressSequentially()`, `tap()` - **NEW!** Additional locator actions
    - `expect()` assertions - **NEW!** All assertions via instrumented expect()

12. ✅ **Created helper functions for manual capture**
    - `logStep(message)` - Replaces `console.log()` for captured logging
    - `getUrlStep(page, label)` - Captures `page.url()` checks as steps
    - Both appear in HTML reports with proper formatting

13. ✅ **Fixed HTML report error display**
    - Previously: Showed `[object Object]` for errors
    - Now: Shows actual error message with full details
    - Handles both object and string error formats
    - Includes stack traces and file:line locations

14. ✅ **Auto-expand failed test steps in reports**
    - Failed tests automatically expand to show all substeps
    - Shows which substeps passed (✓) before failure
    - Shows exactly where and why test failed (✗)
    - Recursive expansion - all levels auto-expand

15. ✅ **Enhanced instrumented-page.ts**
    - Wraps `page.waitForTimeout()` automatically
    - Better documentation with usage examples
    - Exported via utils index for easy import

16. ✅ **Updated documentation**
    - New "Automatic Step Capture" section with examples
    - Helper function usage guide
    - Report improvements documented
    - Version bumped to 1.1

17. ✅ **Priority badges and filtering in HTML reports**
    - Color-coded priority badges (HIGHEST, HIGH, MEDIUM, LOW)
    - Visual priority indicators in test headers
    - Dual filter system: status + priority
    - Filters work together (AND logic) for precise filtering
    - Priority data stored in `data-priority` attributes

### Known Limitations

1. **Serial mode required** - Tests must run sequentially for dependencies to work. Cannot use parallel execution with dependencies.

2. **Error catching trade-off** - Playwright's console shows ✓ for failed tests (fixed in reports via orchestrator-reporter).

3. **Synchronous methods need helpers** - `page.url()` and `console.log()` can't be auto-wrapped. Use `getUrlStep()` and `logStep()` instead.

---

## Best Practices

1. **Always set priorities** - Helps with organization and reporting
2. **Use dependencies wisely** - Don't create circular dependencies
3. **Cleanup with runRegardless** - Always cleanup resources (logout, delete data)
4. **Check orchestrator results** - Use `orchestrator-results.json` for accurate status
5. **Monitor console logs** - Look for "🔒 Page close protection" and orchestrator messages
6. **Use explicit test.step()** - For logical grouping of actions
7. **Keep test names unique** - Required for dependency matching
8. **Don't modify shared page** - Avoid closing or destroying in continueOnFailure mode
9. **Use `logStep()` for important logs** - Replace `console.log()` to capture logs in reports
10. **Use `getUrlStep()` for URL verification** - Makes URL checks visible in reports
11. **Let automatic capture do its work** - `goto()`, `waitForTimeout()`, and locator actions are auto-captured

---

## Support

For issues or questions:
- Check console logs for orchestrator debug messages (🔒, 🌐, 📊 emojis)
- Review `reports/orchestrator-results.json` for test status
- Verify global flag: `(globalThis).__ORCHESTRATOR_CONTINUE_ON_FAILURE__`
- Check if `orchestrator-reporter.ts` is first in reporter list
- Review this documentation's troubleshooting section

---

**End of Documentation**
