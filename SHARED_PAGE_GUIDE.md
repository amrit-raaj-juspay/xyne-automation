# Shared Page Functionality Guide

This guide explains how to use the new global shared page functionality in the Xyne Automation Framework. This feature allows tests within a file to share browser sessions, eliminating the need for manual setup and enabling session persistence across tests.

## 🚀 Quick Start

### Before (Manual Setup Required)
```typescript
import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Test Suite', () => {
  let sharedPage: any;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    sharedPage = await context.newPage();
  });
  
  test('test 1', async () => {
    // Use sharedPage manually
  });
});
```

### After (Zero Setup Required)
```typescript
import { test, expect } from '@/framework/core/test-fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('Test Suite', () => {
  test('test 1', async ({ sharedPage }) => {
    // sharedPage automatically available!
    // Sequential execution automatically enabled!
  });
  
  test('test 2', async ({ sharedPage }) => {
    // Same shared page instance, session persists
  });
});
```

## 📋 Features

### ✅ **Zero Boilerplate**
- No more manual shared page setup in each test file
- Automatic shared page management

### ✅ **Session Persistence**
- Login state persists across tests in the same file
- Cookies, localStorage, and sessionStorage maintained

### ✅ **Flexible Scoping**
- **File Scope**: Share pages within a single test file (default)
- **Suite Scope**: Share pages within a test suite/describe block
- **Global Scope**: Share pages across all test files

### ✅ **Automatic Sequential Execution**
- Tests using shared pages run sequentially by default
- Prevents conflicts and ensures session consistency

### ✅ **Backward Compatibility**
- Existing tests continue to work unchanged
- Can mix shared and isolated pages as needed

## 🛠️ Configuration

### Enable/Disable Shared Mode

**config/local.yaml:**
```yaml
browser:
  type: "chromium"
  sharedMode: true          # Enable shared pages
  sharedScope: "file"       # Default scope: 'file' | 'suite' | 'global'
  autoSequential: true     # Auto-enable sequential execution
```

**Environment Variables:**
```bash
SHARED_MODE=true
SHARED_SCOPE=file
```

## 📖 Usage Examples

### 1. Basic Shared Page Usage

```typescript
import { test, expect } from '@/framework/core/test-fixtures';
import { LoginHelper } from '@/framework/pages/login-helper';

test.describe.configure({ mode: 'serial' });

test.describe('Chat Tests', () => {
  test('login', async ({ sharedPage }) => {
    const loginSuccess = await LoginHelper.performLogin(sharedPage);
    expect(loginSuccess).toBe(true);
  });

  test('navigate to chat', async ({ sharedPage }) => {
    // Login session persists from previous test
    await sharedPage.goto('/chat');
    
    const askButton = sharedPage.locator('button:has-text("Ask")');
    await expect(askButton).toBeVisible();
  });

  test('send message', async ({ sharedPage }) => {
    // Still logged in, still on chat page
    const input = sharedPage.locator('[contenteditable="true"]');
    await input.fill('Hello, world!');
    // ... rest of test
  });
});
```

### 2. Fresh Shared Page

```typescript
test.describe('New Session Tests', () => {
  test('start with clean session', async ({ newSharedPage }) => {
    // Creates a completely new shared page instance
    // Useful when you need a clean session but still want sharing
    
    await newSharedPage.goto('/');
    // This will be a clean session (not logged in)
  });
});
```

### 3. Scoped Shared Pages

```typescript
test.describe('Suite A', () => {
  test('test 1', async ({ sharedPageWithScope }) => {
    const suitePage = await sharedPageWithScope('suite');
    // This page is shared only within "Suite A"
  });
  
  test('test 2', async ({ sharedPageWithScope }) => {
    const suitePage = await sharedPageWithScope('suite');
    // Same page instance as test 1
  });
});

test.describe('Suite B', () => {
  test('test 3', async ({ sharedPageWithScope }) => {
    const suitePage = await sharedPageWithScope('suite');
    // Different page instance from Suite A
  });
});
```

### 4. Global Shared Pages

```typescript
// File 1: login.spec.ts
test('global login', async ({ sharedPageWithScope }) => {
  const globalPage = await sharedPageWithScope('global');
  await LoginHelper.performLogin(globalPage);
});

// File 2: chat.spec.ts  
test('use global session', async ({ sharedPageWithScope }) => {
  const globalPage = await sharedPageWithScope('global');
  // Login session from File 1 is available here!
  await globalPage.goto('/chat');
});
```

### 5. Mixed Page Usage

```typescript
test.describe('Mixed Tests', () => {
  test('isolated test', async ({ page }) => {
    // Uses regular isolated page when needed
    await page.goto('/');
  });

  test('shared test', async ({ sharedPage }) => {
    // Uses shared page with session persistence
    await sharedPage.goto('/chat');
  });

  test('both pages', async ({ sharedPage, page }) => {
    // Can use both in the same test if needed
    await sharedPage.goto('/chat');
    await page.goto('/admin');
  });
});
```

## 🔧 Advanced Usage

### Test Utilities

```typescript
import { testUtils } from '@/framework/core/test-fixtures';

// Configure shared tests
testUtils.configureSharedTests({
  scope: 'suite',
  sequential: true
});

// Get shared browser manager for advanced operations
const manager = testUtils.getSharedBrowserManager();
const stats = testUtils.getSharedInstanceStats();

// Manual cleanup (usually not needed)
await testUtils.cleanupSharedInstances('file', 'test-file-name');
```

### Custom Scopes

```typescript
test('custom scope example', async ({ browser }) => {
  const manager = testUtils.getSharedBrowserManager();
  
  // Create custom shared page with specific options
  const customPage = await manager.getSharedPage(browser, 'file', {
    fileId: 'custom-file',
    forceNew: true
  });
});
```

## 📊 Monitoring and Debugging

### View Shared Instance Statistics

```typescript
test('debug shared instances', async () => {
  const stats = testUtils.getSharedInstanceStats();
  console.log('Shared instances:', stats);
  // Output:
  // {
  //   totalInstances: 3,
  //   byScope: { global: 1, file: 2, suite: 0 },
  //   oldestInstance: 2023-12-01T10:00:00.000Z,
  //   newestInstance: 2023-12-01T10:05:00.000Z
  // }
});
```

### Console Output

The framework provides detailed logging:

```
🆕 Creating new shared file page: file-example-test
🔄 Reusing shared file page: file-example-test
🔗 Using shared file page for test: login test
✅ Shared page test completed: login test
🧹 Cleaned up shared instance: file-example-test
```

## 🎯 Best Practices

### 1. **Use Sequential Execution**
```typescript
// Always configure serial mode for shared page tests
test.describe.configure({ mode: 'serial' });
```

### 2. **Check Login State**
```typescript
test('login', async ({ sharedPage }) => {
  // Always check if already logged in
  const alreadyLoggedIn = await LoginHelper.isLoggedIn(sharedPage);
  if (alreadyLoggedIn) {
    console.log('Already logged in, skipping login');
    return;
  }
  
  await LoginHelper.performLogin(sharedPage);
});
```

### 3. **Graceful Navigation**
```typescript
test('navigate to page', async ({ sharedPage }) => {
  // Check current location before navigating
  const currentUrl = sharedPage.url();
  if (!currentUrl.includes('/target-page')) {
    await sharedPage.goto('/target-page');
  }
});
```

### 4. **Use Appropriate Scope**
- **File scope**: Most common, good for related tests in one file
- **Suite scope**: When you need isolation between test suites
- **Global scope**: For expensive setup that can be shared across files

### 5. **Mix with Isolated Pages When Needed**
```typescript
test('admin test', async ({ page }) => {
  // Use isolated page for admin tests that might interfere
  // with shared user sessions
});
```

## 🚨 Common Pitfalls

### ❌ **Forgetting Sequential Mode**
```typescript
// DON'T: Parallel execution with shared pages
test.describe('Shared Tests', () => {
  // Tests run in parallel, shared page state conflicts
});

// DO: Sequential execution
test.describe.configure({ mode: 'serial' });
test.describe('Shared Tests', () => {
  // Tests run sequentially, shared page state preserved
});
```

### ❌ **Assuming Clean State**
```typescript
// DON'T: Assume clean state
test('test', async ({ sharedPage }) => {
  await sharedPage.goto('/');
  // Page might already be logged in from previous test
});

// DO: Check and handle existing state
test('test', async ({ sharedPage }) => {
  const isLoggedIn = await LoginHelper.isLoggedIn(sharedPage);
  if (isLoggedIn) {
    await LoginHelper.logout(sharedPage);
  }
  await sharedPage.goto('/');
});
```

### ❌ **Mixing Scopes Incorrectly**
```typescript
// DON'T: Mix different scopes expecting same session
test('test1', async ({ sharedPage }) => {
  // Uses file scope
});

test('test2', async ({ sharedPageWithScope }) => {
  const page = await sharedPageWithScope('global');
  // Different scope = different session
});
```

## 🔄 Migration Guide

### Migrating Existing Tests

1. **Update Import**
```typescript
// Before
import { test, expect } from '@playwright/test';

// After  
import { test, expect } from '@/framework/core/test-fixtures';
```

2. **Remove Manual Setup**
```typescript
// Before
test.describe('Tests', () => {
  let sharedPage: any;
  
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    sharedPage = await context.newPage();
  });
  
  test('test', async () => {
    // Use sharedPage
  });
});

// After
test.describe('Tests', () => {
  test('test', async ({ sharedPage }) => {
    // sharedPage automatically available
  });
});
```

3. **Keep Sequential Configuration**
```typescript
// Keep this line
test.describe.configure({ mode: 'serial' });
```

## 📈 Performance Benefits

- **Faster Test Execution**: Reusing browser instances reduces startup time
- **Session Persistence**: No need to re-login for each test
- **Resource Efficiency**: Fewer browser instances = less memory usage
- **Reduced Flakiness**: Consistent session state reduces test failures

## 🔍 Troubleshooting

### Issue: Tests Running in Parallel
**Solution**: Add `test.describe.configure({ mode: 'serial' })`

### Issue: Session Not Persisting
**Solution**: Ensure all tests in the suite use `sharedPage` fixture

### Issue: Shared Mode Not Working
**Solution**: Check configuration in `config/local.yaml`:
```yaml
browser:
  sharedMode: true
```

### Issue: Memory Leaks
**Solution**: Shared instances are automatically cleaned up in global teardown

## 📚 API Reference

### Fixtures

- `sharedPage`: Default shared page (file scope)
- `newSharedPage`: Fresh shared page instance
- `sharedPageWithScope(scope)`: Shared page with specific scope

### Scopes

- `'file'`: Share within test file (default)
- `'suite'`: Share within test suite
- `'global'`: Share across all files

### Utilities

- `testUtils.configureSharedTests(options)`
- `testUtils.getSharedBrowserManager()`
- `testUtils.cleanupSharedInstances(scope?, fileId?, suiteId?)`
- `testUtils.getSharedInstanceStats()`

---

This shared page functionality transforms your test automation by eliminating boilerplate code while providing powerful session management capabilities. Start with the basic `sharedPage` fixture and explore advanced features as needed!
