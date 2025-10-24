# Test Orchestrator Migration Guide

This guide explains how to migrate existing tests from the traditional Playwright approach to the new **Test Orchestrator** pattern.

## Table of Contents
- [Overview](#overview)
- [Key Benefits](#key-benefits)
- [File Structure Changes](#file-structure-changes)
- [Step-by-Step Migration](#step-by-step-migration)
- [Detailed Examples](#detailed-examples)
- [Page Object Updates](#page-object-updates)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Test Orchestrator provides a centralized way to manage test execution with:
- Better dependency management
- Improved error handling and recovery
- Detailed step-level reporting
- Shared browser context for faster execution
- Conditional test execution (runRegardless flag)

### Comparison

| Feature | Traditional (Workflow) | Orchestrator (Agent) |
|---------|----------------------|---------------------|
| Test Definition | `test()`, `testHigh()`, `testHighest()` | Object-based test definitions |
| Dependencies | `dependsOn: ['test name']` metadata | `dependencies: ['test name']` in test object |
| Shared Context | Manual via `sharedPage` fixture | Built-in with `useSharedPage: true` |
| Step Tracking | Manual console.log | `step()` utility with detailed reporting |
| Error Recovery | Limited | `continueOnFailure`, `runRegardless` flags |
| Reporting | Basic Playwright report | Enhanced HTML with step details |

---

## Key Benefits

### 1. **Centralized Test Management**
All tests are defined in a single array, making it easier to understand test flow and dependencies.

### 2. **Enhanced Error Handling**
- `continueOnFailure`: Keep browser alive after failures
- `runRegardless`: Run cleanup tests even if dependencies fail

### 3. **Better Reporting**
- Step-by-step execution details
- Screenshot embedding in reports
- Dependency chain visualization

### 4. **Performance**
- Shared browser context reduces startup overhead
- Sequential execution ensures predictable state

---

## File Structure Changes

### Test File Structure

#### Before (Traditional - Workflow Module)
```
tests/functional/workflow-module.spec.ts
├── imports: test, testHigh, testHighest from fixtures
├── test.describe.configure({ mode: 'serial' })
└── test.describe('Test Suite', () => {
    ├── testHighest('test name', { metadata }, async ({ sharedPage }) => { ... })
    ├── testHigh('test name', { dependsOn: [...], metadata }, async ({ sharedPage }) => { ... })
    └── ...
  })
```

#### After (Orchestrator - Agent Module)
```
tests/functional/agent-module.spec.ts
├── imports: test from fixtures, TestOrchestrator, step
├── const orchestrator = new TestOrchestrator({ config })
└── orchestrator.createSuite('Test Suite', [
    {
      name: 'test name',
      dependencies: [...],
      metadata: { priority, tags },
      testFunction: async ({ sharedPage }) => { ... }
    },
    ...
  ])
```

---

## Step-by-Step Migration

### Step 1: Update Imports

#### Before (Workflow)
```typescript
import { test, testHighest, testHigh, expect } from '@/framework/core/test-fixtures';
import { LoginHelper } from '@/framework/pages/login-helper';
import { WorkflowModulePage } from '@/framework/pages/workflow-module-page';
```

#### After (Agent)
```typescript
import { test } from '@/framework/core/test-fixtures';
import { TestOrchestrator } from '@/framework/utils/test-orchestrator';
import { LoginHelper } from '@/framework/pages/login-helper';
import { AgentModulePage } from '@/framework/pages/agent-module-page';
import { step } from '@/framework/utils/step-tracker';
```

**Changes:**
- ✅ Keep `test` import (still needed for orchestrator)
- ❌ Remove `testHighest`, `testHigh` (replaced by priority metadata)
- ✅ Add `TestOrchestrator` import
- ✅ Add `step` import for step tracking
- ❌ Remove `expect` import (use instrumented expect from page object)

---

### Step 2: Remove test.describe.configure

#### Before (Workflow)
```typescript
test.describe.configure({ mode: 'serial' });
```

#### After (Agent)
```typescript
// Not needed - orchestrator handles sequential execution
// Remove this line completely
```

**Why:** Orchestrator configuration handles sequential execution via `sequential: true` option.

---

### Step 3: Create Orchestrator Instance

Add this **before** your test suite:

```typescript
const orchestrator = new TestOrchestrator({
  useSharedPage: true,        // Share browser context across tests
  continueOnFailure: true,    // Keep browser alive on failures
  sequential: true,           // Run tests sequentially
  logLevel: 'detailed'        // Detailed logging
});
```

**Configuration Options:**
- `useSharedPage`: Share browser/page across tests (faster)
- `continueOnFailure`: Don't close browser on test failure (debugging)
- `sequential`: Run tests in order (default: true)
- `logLevel`: 'minimal' | 'detailed' (default: 'detailed')

---

### Step 4: Replace test.describe with orchestrator.createSuite

#### Before (Workflow)
```typescript
test.describe('Workflow Module Tests', () => {
  testHighest('user login', {
    tags: ['@critical', '@auth'],
    description: 'Authenticate user'
  }, async ({ sharedPage }) => {
    // test code
  });
});
```

#### After (Agent)
```typescript
orchestrator.createSuite('Agent Module Tests', [
  {
    name: 'user login',
    metadata: {
      priority: 'highest',
      tags: ['@critical', '@auth']
    },
    testFunction: async ({ sharedPage }) => {
      // test code
    }
  }
]);
```

---

### Step 5: Convert Test Definitions

Each test needs to be converted from a function call to an object.

#### Test Structure Mapping

| Traditional | Orchestrator |
|------------|--------------|
| `testHighest('name', ...)` | `{ name: '...', metadata: { priority: 'highest' } }` |
| `testHigh('name', ...)` | `{ name: '...', metadata: { priority: 'high' } }` |
| `test('name', ...)` | `{ name: '...', metadata: { priority: 'medium' } }` |
| `{ dependsOn: ['x'] }` | `dependencies: ['x']` |
| `{ tags: [...] }` | `metadata: { tags: [...] }` |
| `async ({ sharedPage }) => {}` | `testFunction: async ({ sharedPage }) => {}` |

#### Example: Login Test

**Before (Workflow):**
```typescript
testHighest('user login', {
  tags: ['@critical', '@auth', '@workflow'],
  description: 'Authenticate user for workflow module access'
}, async ({ sharedPage }) => {
  console.log('🚀 Starting highest priority login test');

  const { page } = sharedPage;
  const alreadyLoggedIn = await LoginHelper.isLoggedIn(page);

  if (alreadyLoggedIn) {
    console.log('✅ Already logged in');
    return;
  }

  const loginResult = await LoginHelper.performLoginWithDetails(page, {
    retries: 2
  });

  expect(loginResult.success, 'Login should be successful').toBe(true);
  console.log('✅ Login completed successfully');
});
```

**After (Agent):**
```typescript
{
  name: 'user login',
  metadata: {
    priority: 'highest',
    tags: ['@critical', '@auth', '@agent']
  },
  testFunction: async ({ sharedPage }) => {
    console.log('🚀 Starting highest priority login test');

    const { page } = sharedPage;
    const alreadyLoggedIn = await LoginHelper.isLoggedIn(page);

    if (alreadyLoggedIn) {
      console.log('✅ Already logged in');
      return;
    }

    const loginResult = await LoginHelper.performLoginWithDetails(page, {
      retries: 2
    });

    if (!loginResult.success) {
      throw new Error('Login failed');
    }

    console.log('✅ Login completed successfully');
  }
}
```

**Key Changes:**
- Priority moved from function name to `metadata.priority`
- `dependsOn` → `dependencies` (at object level, not in metadata)
- `expect().toBe()` → `throw new Error()` for failures
- Test wrapped in object with `name` and `testFunction`

---

### Step 6: Handle Dependencies

#### Before (Workflow)
```typescript
testHigh('navigate to workflow page', {
  dependsOn: ['user login'],  // In metadata object
  tags: ['@core', '@navigation'],
  description: 'Navigate to workflow page'
}, async ({ sharedPage }) => {
  // test code
});
```

#### After (Agent)
```typescript
{
  name: 'navigate to agent page',
  dependencies: ['user login'],  // At test object level
  metadata: {
    priority: 'high',
    tags: ['@core', '@navigation']
  },
  testFunction: async ({ sharedPage }) => {
    // test code
  }
}
```

**Important:** `dependencies` is now a **top-level property** of the test object, not inside `metadata`.

---

### Step 7: Add Step Tracking (Optional but Recommended)

For better reporting, wrap test logic in `step()` calls:

#### Before (Workflow)
```typescript
testHigh('verify agent create button', {
  dependsOn: ['navigate to agent page'],
  tags: ['@core', '@agent']
}, async ({ sharedPage }) => {
  const agentPage = new AgentModulePage(sharedPage.page);
  await agentPage.verifyAndClickAgentCreateButton();
});
```

#### After (Agent)
```typescript
{
  name: 'verify and click agent create button',
  dependencies: ['navigate to agent page'],
  metadata: {
    priority: 'high',
    tags: ['@core', '@agent', '@button']
  },
  testFunction: async ({ sharedPage }) => {
    await step('Verify and click agent create button', async () => {
      const agentPage = new AgentModulePage(sharedPage.page);
      await agentPage.verifyAndClickAgentCreateButtonWithValidations();
    });
  }
}
```

**Benefits:**
- Step appears separately in Playwright UI report
- Better error localization
- Enhanced debugging

---

### Step 8: Add Cleanup Tests with runRegardless

For cleanup operations that should always run:

```typescript
{
  name: 'delete agent and verify removal',
  dependencies: ['user login'],  // Only requires login, not full chain
  runRegardless: true,  // Run even if other tests failed
  metadata: {
    priority: 'medium',
    tags: ['@core', '@agent', '@delete']
  },
  testFunction: async ({ sharedPage }) => {
    await step('Delete agent and verify removal', async () => {
      const agentPage = new AgentModulePage(sharedPage.page);
      await agentPage.deleteAgentAndVerifyRemoval();
    });
  }
}
```

**Key Points:**
- `runRegardless: true` ensures cleanup runs even if tests fail
- Minimal dependencies for cleanup tests
- Always runs last (orchestrator handles order)

---

## Page Object Updates

### Import Changes

#### Before (Workflow Page)
```typescript
import { Page, expect } from '@playwright/test';
```

#### After (Agent Page)
```typescript
import { Page, test } from '@playwright/test';
import { expect } from '@/framework/utils/instrumented-page';
```

**Why:** Instrumented expect provides better error reporting and screenshot capture.

### No Functional Changes Required

The good news: **Page object methods don't need changes**. Only the import statements differ.

```typescript
export class AgentModulePage {
  constructor(private page: Page) {}

  // Methods remain the same
  async verifyAndClickAgentCreateButton(): Promise<void> {
    // Same implementation as before
  }
}
```

---

## Common Patterns

### Pattern 1: Login Test

```typescript
{
  name: 'user login',
  metadata: { priority: 'highest', tags: ['@critical', '@auth'] },
  testFunction: async ({ sharedPage }) => {
    const { page } = sharedPage;
    const alreadyLoggedIn = await LoginHelper.isLoggedIn(page);

    if (alreadyLoggedIn) {
      console.log('✅ Already logged in, skipping');
      return;
    }

    const loginResult = await LoginHelper.performLoginWithDetails(page, {
      retries: 2
    });

    if (!loginResult.success) {
      throw new Error('Login failed');
    }
  }
}
```

---

### Pattern 2: Navigation Test

```typescript
{
  name: 'navigate to module page',
  dependencies: ['user login'],
  metadata: { priority: 'high', tags: ['@navigation'] },
  testFunction: async ({ sharedPage }) => {
    const { page } = sharedPage;

    await page.locator('a[href="/module"]').click();
    await page.waitForURL('**/module', { timeout: 5000 });

    if (!page.url().includes('/module')) {
      throw new Error(`Navigation failed: ${page.url()}`);
    }
  }
}
```

---

### Pattern 3: Page Object Method Call

```typescript
{
  name: 'verify page elements',
  dependencies: ['navigate to module page'],
  metadata: { priority: 'high', tags: ['@core', '@ui'] },
  testFunction: async ({ sharedPage }) => {
    await step('Verify page elements', async () => {
      const modulePage = new ModulePage(sharedPage.page);
      await modulePage.verifyPageElements();
    });
  }
}
```

---

### Pattern 4: Cleanup Test

```typescript
{
  name: 'cleanup created data',
  dependencies: ['user login'],  // Minimal dependencies
  runRegardless: true,  // Always run
  metadata: { priority: 'medium', tags: ['@cleanup'] },
  testFunction: async ({ sharedPage }) => {
    await step('Delete created items', async () => {
      const modulePage = new ModulePage(sharedPage.page);
      await modulePage.deleteCreatedItems();
    });
  }
}
```

---

## Detailed Examples

### Complete Test File: Before and After

#### Before: Workflow Module (Traditional)

```typescript
import { test, testHighest, testHigh, expect } from '@/framework/core/test-fixtures';
import { LoginHelper } from '@/framework/pages/login-helper';
import { WorkflowModulePage } from '@/framework/pages/workflow-module-page';

test.describe.configure({ mode: 'serial' });

test.describe('Workflow Module Tests', () => {

  testHighest('user login', {
    tags: ['@critical', '@auth'],
    description: 'Authenticate user'
  }, async ({ sharedPage }) => {
    const { page } = sharedPage;
    const loginResult = await LoginHelper.performLoginWithDetails(page);
    expect(loginResult.success).toBe(true);
  });

  testHigh('navigate to workflow page', {
    dependsOn: ['user login'],
    tags: ['@navigation'],
  }, async ({ sharedPage }) => {
    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.navigateToWorkflowModule();
  });

  testHigh('verify workflow elements', {
    dependsOn: ['navigate to workflow page'],
    tags: ['@ui'],
  }, async ({ sharedPage }) => {
    const workflowPage = new WorkflowModulePage(sharedPage.page);
    await workflowPage.verifyWorkflowPageElements();
  });

});
```

#### After: Agent Module (Orchestrator)

```typescript
import { test } from '@/framework/core/test-fixtures';
import { TestOrchestrator } from '@/framework/utils/test-orchestrator';
import { LoginHelper } from '@/framework/pages/login-helper';
import { AgentModulePage } from '@/framework/pages/agent-module-page';
import { step } from '@/framework/utils/step-tracker';

const orchestrator = new TestOrchestrator({
  useSharedPage: true,
  continueOnFailure: true,
  sequential: true,
  logLevel: 'detailed'
});

orchestrator.createSuite('Agent Module Tests', [
  {
    name: 'user login',
    metadata: {
      priority: 'highest',
      tags: ['@critical', '@auth']
    },
    testFunction: async ({ sharedPage }) => {
      const { page } = sharedPage;
      const loginResult = await LoginHelper.performLoginWithDetails(page);

      if (!loginResult.success) {
        throw new Error('Login failed');
      }
    }
  },

  {
    name: 'navigate to agent page',
    dependencies: ['user login'],
    metadata: {
      priority: 'high',
      tags: ['@navigation']
    },
    testFunction: async ({ sharedPage }) => {
      await step('Navigate to agent page', async () => {
        const agentPage = new AgentModulePage(sharedPage.page);
        await agentPage.navigateToAgentModule();
      });
    }
  },

  {
    name: 'verify agent elements',
    dependencies: ['navigate to agent page'],
    metadata: {
      priority: 'high',
      tags: ['@ui']
    },
    testFunction: async ({ sharedPage }) => {
      await step('Verify agent page elements', async () => {
        const agentPage = new AgentModulePage(sharedPage.page);
        await agentPage.verifyAgentPageElements();
      });
    }
  }
]);
```

---

## Troubleshooting

### Issue 1: Tests Not Running in Order

**Problem:** Tests execute in wrong order or skip dependencies.

**Solution:** Ensure `sequential: true` in orchestrator config:
```typescript
const orchestrator = new TestOrchestrator({
  sequential: true  // ✅ Add this
});
```

---

### Issue 2: Shared Page Not Working

**Problem:** Each test starts new browser instance.

**Solution:** Enable shared page in config:
```typescript
const orchestrator = new TestOrchestrator({
  useSharedPage: true  // ✅ Add this
});
```

---

### Issue 3: Test Failures Don't Show Details

**Problem:** Hard to debug failing tests.

**Solutions:**
1. Use `step()` wrapper for better error localization
2. Enable detailed logging:
```typescript
const orchestrator = new TestOrchestrator({
  logLevel: 'detailed'  // ✅ Add this
});
```

---

### Issue 4: expect() Not Working

**Problem:** `expect is not defined` error.

**Solution:** In page objects, use instrumented expect:
```typescript
// ❌ Wrong
import { Page, expect } from '@playwright/test';

// ✅ Correct
import { Page } from '@playwright/test';
import { expect } from '@/framework/utils/instrumented-page';
```

---

### Issue 5: Cleanup Tests Not Running After Failure

**Problem:** Cleanup tests skip when earlier tests fail.

**Solution:** Add `runRegardless: true`:
```typescript
{
  name: 'cleanup',
  runRegardless: true,  // ✅ Runs even if tests fail
  testFunction: async ({ sharedPage }) => {
    // cleanup code
  }
}
```

---

## Migration Checklist

Use this checklist when migrating a test file:

### Imports
- [ ] Keep `test` import
- [ ] Remove `testHighest`, `testHigh` imports
- [ ] Add `TestOrchestrator` import
- [ ] Add `step` import
- [ ] Update page object imports if needed

### Configuration
- [ ] Remove `test.describe.configure({ mode: 'serial' })`
- [ ] Create orchestrator instance with config
- [ ] Set `useSharedPage: true`
- [ ] Set `continueOnFailure: true`
- [ ] Set `sequential: true`

### Test Structure
- [ ] Replace `test.describe()` with `orchestrator.createSuite()`
- [ ] Convert `testHighest()` to `{ priority: 'highest' }`
- [ ] Convert `testHigh()` to `{ priority: 'high' }`
- [ ] Move `dependsOn` to `dependencies` at object level
- [ ] Wrap test logic in `testFunction`

### Error Handling
- [ ] Replace `expect().toBe()` with `throw new Error()` for failures
- [ ] Add `if (!result) throw new Error()` patterns
- [ ] Ensure cleanup tests have `runRegardless: true`

### Step Tracking
- [ ] Wrap page object calls in `step()` functions
- [ ] Add descriptive step names
- [ ] Group related operations in single steps

### Page Objects
- [ ] Update imports in page objects
- [ ] Use `expect` from `@/framework/utils/instrumented-page`
- [ ] No functional changes needed

### Testing
- [ ] Run tests locally
- [ ] Verify step-level reporting works
- [ ] Check HTML report shows screenshots
- [ ] Confirm cleanup runs after failures

---

## Quick Reference

### Orchestrator Config Options

```typescript
new TestOrchestrator({
  useSharedPage: boolean,      // Share browser context (default: false)
  continueOnFailure: boolean,  // Keep browser alive on fail (default: false)
  sequential: boolean,         // Run tests in order (default: true)
  logLevel: 'minimal' | 'detailed'  // Logging verbosity (default: 'detailed')
})
```

### Test Object Structure

```typescript
{
  name: string,                // Test name (must be unique)
  dependencies?: string[],     // Names of tests this depends on
  runRegardless?: boolean,     // Run even if dependencies fail
  metadata?: {
    priority?: 'highest' | 'high' | 'medium' | 'low',
    tags?: string[],
    description?: string
  },
  testFunction: async ({ sharedPage, page }) => {
    // Test implementation
  }
}
```

### Step Wrapper

```typescript
await step('Step description', async () => {
  // Step implementation
  // This appears as separate step in reports
});
```

---

## Summary

### Key Takeaways

1. **Orchestrator provides better structure** - All tests in one array
2. **Dependencies are clearer** - Top-level `dependencies` property
3. **Error handling is robust** - `continueOnFailure`, `runRegardless`
4. **Reporting is enhanced** - Step-level details with screenshots
5. **Page objects don't change** - Only import statements differ

### Migration Time Estimate

- **Small module (5-10 tests):** 15-30 minutes
- **Medium module (10-20 tests):** 30-60 minutes
- **Large module (20+ tests):** 1-2 hours

### Next Steps

1. Choose a test file to migrate
2. Follow the step-by-step guide
3. Use the checklist to verify completion
4. Run tests and verify reports
5. Share feedback/issues with the team

---

## Support

For questions or issues during migration:
- Check existing agent-module.spec.ts for reference
- Review ORCHESTRATOR_GUIDE.md for orchestrator details
- Ask in the team channel for help

Happy migrating! 🚀
