# Priority and Dependency Management Guide

This guide explains how to use the new priority and dependency management features in the Xyne automation framework.

## Overview

The framework now supports:
- **Test Priorities**: `highest`, `high`, `medium`, `low`
- **Test Dependencies**: Tests can depend on other tests by name
- **Automatic Skipping**: If a dependency fails, all dependent tests are automatically skipped
- **Execution Ordering**: Tests run in priority order while respecting dependencies

## Quick Start

### Basic Priority Usage

```typescript
import { testHighest, testHigh, testMedium, testLow } from '@/framework/core/test-fixtures';

// Highest priority - critical tests
testHighest('user login', async ({ sharedPage }) => {
  // Critical authentication test
});

// High priority - core functionality
testHigh('navigate to dashboard', async ({ sharedPage }) => {
  // Important navigation test
});

// Medium priority - feature tests
testMedium('create project', async ({ sharedPage }) => {
  // Feature functionality test
});

// Low priority - edge cases
testLow('advanced search', async ({ sharedPage }) => {
  // Nice-to-have functionality
});
```

### Basic Dependency Usage

```typescript
// Test with dependencies
testHigh('navigate to dashboard', {
  dependsOn: ['user login'],  // This test depends on 'user login'
  tags: ['@core']
}, async ({ sharedPage }) => {
  // This will be skipped if 'user login' fails
});
```

## API Reference

### Test Functions

#### `testWithMetadata(name, metadata, testFunction)`
Generic function for creating tests with full metadata support.

```typescript
testWithMetadata('my test', {
  priority: 'high',
  dependsOn: ['prerequisite test'],
  tags: ['@feature', '@critical'],
  timeout: 30000,
  description: 'Test description'
}, async ({ sharedPage }) => {
  // Test implementation
});
```

#### Priority-Specific Functions

- `testHighest(name, metadata, testFunction)` - Highest priority tests
- `testHigh(name, metadata, testFunction)` - High priority tests  
- `testMedium(name, metadata, testFunction)` - Medium priority tests
- `testLow(name, metadata, testFunction)` - Low priority tests

### Metadata Options

```typescript
interface TestMetadata {
  priority?: 'highest' | 'high' | 'medium' | 'low';
  dependsOn?: string[];  // Array of test names this test depends on
  tags?: string[];       // Test tags for filtering
  timeout?: number;      // Custom timeout in milliseconds
  description?: string;  // Test description
}
```

## Priority Levels

### Highest Priority
- **Use for**: Critical path tests, authentication, core setup
- **Examples**: Login, basic navigation, essential API endpoints
- **Execution**: Runs first, before all other priorities

### High Priority  
- **Use for**: Core functionality that depends on critical tests
- **Examples**: Dashboard navigation, user profile, main features
- **Execution**: Runs after highest priority tests

### Medium Priority
- **Use for**: Feature tests, secondary functionality
- **Examples**: Creating projects, updating settings, form submissions
- **Execution**: Runs after high priority tests

### Low Priority
- **Use for**: Edge cases, nice-to-have features, complex scenarios
- **Examples**: Advanced search, sharing features, admin functions
- **Execution**: Runs last

## Dependency Management

### How Dependencies Work

1. **Registration**: Tests register their dependencies when defined
2. **Graph Building**: Framework builds a dependency graph
3. **Validation**: Circular dependencies are detected and reported
4. **Execution Order**: Tests run in dependency order within priority levels
5. **Failure Handling**: If a test fails, all dependent tests are automatically skipped

### Dependency Examples

#### Simple Dependency Chain
```typescript
testHighest('setup data', async ({ sharedPage }) => {
  // Setup test data
});

testHigh('configure system', {
  dependsOn: ['setup data']
}, async ({ sharedPage }) => {
  // Configure system using setup data
});

testMedium('test feature', {
  dependsOn: ['configure system']
}, async ({ sharedPage }) => {
  // Test feature with configured system
});
```

#### Multiple Dependencies
```typescript
testLow('integration test', {
  dependsOn: ['test feature A', 'test feature B']
}, async ({ sharedPage }) => {
  // This test needs both feature A and B to pass
});
```

#### Complex Dependency Chains
```typescript
// Foundation test
testHighest('user login', async ({ sharedPage }) => {
  // Login functionality
});

// Two parallel branches depending on login
testHigh('navigate to dashboard', {
  dependsOn: ['user login']
}, async ({ sharedPage }) => {
  // Dashboard functionality
});

testHigh('verify user profile', {
  dependsOn: ['user login']  
}, async ({ sharedPage }) => {
  // Profile functionality
});

// Tests depending on the branches
testMedium('create project', {
  dependsOn: ['navigate to dashboard']
}, async ({ sharedPage }) => {
  // Project creation from dashboard
});

testMedium('update settings', {
  dependsOn: ['verify user profile']
}, async ({ sharedPage }) => {
  // Settings update from profile
});

// Final integration test
testLow('end-to-end workflow', {
  dependsOn: ['create project', 'update settings']
}, async ({ sharedPage }) => {
  // Complete workflow test
});
```

## Best Practices

### 1. Test Naming
- Use descriptive, unique test names
- Dependencies reference tests by exact name
- Consider using consistent naming patterns

```typescript
// Good: Descriptive and unique
testHighest('user authentication with valid credentials', ...)
testHigh('dashboard navigation after login', ...)

// Avoid: Generic names that might conflict
testHighest('login', ...)
testHigh('navigation', ...)
```

### 2. Dependency Design
- Keep dependency chains reasonable (avoid very deep chains)
- Design tests to be as independent as possible
- Use dependencies for true prerequisites, not convenience

```typescript
// Good: Clear prerequisite relationship
testHigh('create project', {
  dependsOn: ['user login']  // Project creation requires authentication
}, ...)

// Avoid: Unnecessary dependency
testMedium('check footer links', {
  dependsOn: ['user login']  // Footer links don't require login
}, ...)
```

### 3. Priority Assignment
- **Highest**: Only for absolutely critical tests
- **High**: Core functionality that most features depend on
- **Medium**: Standard feature tests
- **Low**: Edge cases, complex scenarios, nice-to-have features

### 4. Test Organization
- Use `test.describe.configure({ mode: 'serial' })` for dependency management
- Group related tests in describe blocks
- Consider splitting complex test suites into multiple files

```typescript
test.describe.configure({ mode: 'serial' });

test.describe('Authentication Flow', () => {
  testHighest('user login', ...)
  testHigh('verify login state', { dependsOn: ['user login'] }, ...)
});

test.describe('Dashboard Features', () => {
  testMedium('create project', { dependsOn: ['user login'] }, ...)
  testMedium('view project list', { dependsOn: ['create project'] }, ...)
});
```

## Error Handling and Debugging

### Circular Dependencies
If circular dependencies are detected, the framework will throw an error:

```
🚨 Circular dependencies detected: test A -> test B -> test A
```

### Dependency Skipping
When a test fails, dependent tests are automatically skipped:

```
❌ Test failed: user login (1500ms) - Invalid credentials
⏭️  Skipping test "navigate to dashboard": Dependency failed: "user login"
⏭️  Skipping test "create project": Dependency failed: "user login"
```

### Missing Dependencies
If a test depends on a non-existent test:

```
⚠️  Warning: Test "feature test" depends on "non-existent test" which is not registered
```

## Reporting and Statistics

The framework provides detailed statistics about test execution:

```typescript
import { dependencyManager } from '@/framework/core/dependency-manager';

// Get execution statistics
const stats = dependencyManager.getExecutionStats();
console.log('Priority breakdown:', stats);

// Get dependency graph for analysis
const graph = dependencyManager.getDependencyGraph();
console.log('Dependency relationships:', graph);
```

## CLI Usage

Run tests by priority:
```bash
# Run only highest priority tests
npx playwright test --grep="@priority:highest"

# Run high and highest priority tests
npx playwright test --grep="@priority:(highest|high)"

# Run specific test suites
npx playwright test tests/examples/priority-dependency-example.spec.ts
```

## Migration Guide

### Updating Existing Tests

1. **No changes required**: Existing tests continue to work unchanged
2. **Add priorities gradually**: Start by adding priorities to critical tests
3. **Identify dependencies**: Look for tests that logically depend on others
4. **Update imports**: Change from `@playwright/test` to `@/framework/core/test-fixtures`

```typescript
// Before
import { test, expect } from '@playwright/test';

test('my test', async ({ page }) => {
  // Test implementation
});

// After - with priorities and dependencies
import { testHigh, expect } from '@/framework/core/test-fixtures';

testHigh('my test', {
  dependsOn: ['prerequisite test'],
  tags: ['@feature']
}, async ({ sharedPage }) => {
  // Test implementation
});
```

## Troubleshooting

### Common Issues

1. **Tests not running in expected order**
   - Ensure `test.describe.configure({ mode: 'serial' })` is set
   - Check that dependencies are correctly specified

2. **Unexpected test skipping**
   - Check if dependency tests are failing
   - Verify test names match exactly (case-sensitive)

3. **Circular dependency errors**
   - Review dependency chains
   - Remove unnecessary dependencies
   - Restructure tests to eliminate cycles

### Debug Mode

Enable detailed logging:
```typescript
// In your test file
console.log('Dependency graph:', dependencyManager.getDependencyGraph());
console.log('Execution results:', dependencyManager.getExecutionResults());
```

## Examples

See `tests/examples/priority-dependency-example.spec.ts` for comprehensive examples of:
- All priority levels
- Simple and complex dependency chains
- Error handling and skipping behavior
- Integration with shared browser functionality

## Support

For questions or issues with the priority and dependency system:
1. Check this documentation
2. Review the example test file
3. Examine the dependency manager logs
4. Report issues with detailed reproduction steps
