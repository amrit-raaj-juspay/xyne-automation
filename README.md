# Xyne TypeScript Automation Framework

A comprehensive test automation framework for the Xyne AI-first Search & Answer Engine, built with TypeScript and Playwright. This framework provides advanced testing capabilities including LLM response evaluation, network monitoring, and performance analysis.

## 🚀 Features

### Core Testing Capabilities
- **Cross-browser Testing**: Support for Chromium, Firefox, and WebKit
- **Page Object Model**: Structured and maintainable test organization
- **Network Monitoring**: Real-time API call capture and analysis
- **Performance Testing**: Response time monitoring and bottleneck detection
- **Visual Testing**: Screenshot comparison and visual regression detection

### LLM-Specific Testing
- **Response Evaluation**: Multi-dimensional LLM response quality assessment
- **Semantic Similarity**: Keyword matching and content relevance analysis
- **Factual Accuracy**: LLM-as-judge evaluation using OpenAI API
- **Citation Validation**: Source verification and link checking
- **Safety Assessment**: Content safety and appropriateness evaluation
- **Business Context**: Professional tone and context appropriateness

### Advanced Features
- **Streaming Response Monitoring**: Real-time chat response analysis
- **API Integration Testing**: Backend service validation
- **Configuration Management**: Environment-specific test configuration
- **Comprehensive Reporting**: Detailed test results with metrics
- **TypeScript Support**: Full type safety and IntelliSense

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

## 🛠️ Installation

### 1. Install Node.js and npm

#### macOS (using Homebrew)
```bash
brew install node
```

#### Using Node Version Manager (nvm)
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install latest LTS Node.js
nvm install --lts
nvm use --lts
```

### 2. Clone and Setup Framework

```bash
# Navigate to the TypeScript framework directory
cd xyne-automation-ts

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Copy environment configuration
cp .env.example .env
```

### 3. Configure Environment

Edit the `.env` file with your settings:

```env
# Xyne Application URLs
XYNE_BASE_URL=https://xyne.juspay.net
XYNE_AUTH_URL=https://xyne.juspay.net/auth

# Test Configuration
TEST_TIMEOUT=30000
HEADLESS=true
BROWSER=chromium

# LLM Evaluation (Optional)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Logging
LOG_LEVEL=info
```

## 🏃‍♂️ Running Tests

### Basic Test Execution

```bash
# Default: Chromium browser, headed mode (UI visible)
npm test                           # Alias for npm run test:chromium
npm run test:chromium              # Chromium, headed mode
npm run test:chromium:headless     # Chromium, headless mode

# Specific browsers
npm run test:firefox               # Firefox, headed mode
npm run test:webkit                # WebKit, headed mode

# Cross-browser testing
npm run test:cross-browser         # All browsers, headless mode

# Test suites
npm run test:smoke                 # Smoke tests, Chromium headed
npm run test:smoke:headless        # Smoke tests, Chromium headless
npm run test:integration           # Integration tests, Chromium headed

# Specific tests
npm run test:chat                  # Chat functionality tests
npm run test:login                 # Login page validation tests

# Debug mode
npm run test:debug                 # Debug mode with Chromium
```

### Advanced Test Options

```bash
# Run tests on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run tests with specific tag
npx playwright test --grep="@smoke"
npx playwright test --grep="@integration"

# Generate and view test report
npm run test:report
npx playwright show-report
```

## 📁 Framework Structure

```
xyne-automation-ts/
├── src/
│   ├── framework/
│   │   ├── core/                    # Core framework components
│   │   │   ├── base-page.ts         # Base page object class
│   │   │   ├── config-manager.ts    # Configuration management
│   │   │   ├── global-setup.ts      # Global test setup
│   │   │   └── global-teardown.ts   # Global test cleanup
│   │   ├── pages/                   # Page Object Models
│   │   │   └── login-page.ts        # Login page interactions
│   │   └── utils/                   # Utility functions
│   │       ├── network-analyzer.ts  # Network monitoring
│   │       └── llm-evaluator.ts     # LLM response evaluation
│   └── types/                       # TypeScript type definitions
│       └── index.ts                 # Core type definitions
├── tests/
│   ├── functional/                  # Functional tests
│   │   └── chat-complete.spec.ts    # Main chat functionality tests
│   ├── integration/                 # Integration tests
│   └── smoke/                       # Smoke tests
├── reports/                         # Test reports and artifacts
├── playwright.config.ts             # Playwright configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies and scripts
└── .env                            # Environment configuration
```

## 🧪 Test Examples

### Basic Login Test

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/framework/pages/login-page';

test('should validate login page elements', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.navigate();
  const elements = await loginPage.validatePageElements();
  
  expect(elements.pageLoaded).toBe(true);
  expect(elements.googleButtonVisible).toBe(true);
  expect(elements.hasErrors).toBe(false);
});
```

### Network Monitoring Test

```typescript
import { test, expect } from '@playwright/test';
import { NetworkAnalyzer } from '../src/framework/utils/network-analyzer';

test('should monitor API calls during chat', async ({ page }) => {
  const networkAnalyzer = new NetworkAnalyzer();
  
  // Setup network monitoring
  page.on('request', request => networkAnalyzer.addRequest(request));
  page.on('response', response => networkAnalyzer.addResponse(response));
  
  // Perform test actions
  await page.goto('/chat');
  // ... chat interactions
  
  // Analyze results
  const metrics = networkAnalyzer.getPerformanceMetrics();
  expect(metrics.errorCount).toBe(0);
  expect(metrics.averageResponseTime).toBeLessThan(2000);
});
```

### LLM Response Evaluation

```typescript
import { test, expect } from '@playwright/test';
import { LLMEvaluator } from '../src/framework/utils/llm-evaluator';

test('should evaluate chat response quality', async ({ page }) => {
  const evaluator = LLMEvaluator.createSimpleEvaluator();
  
  // Get chat response
  const response = await getChatResponse(page, 'What is machine learning?');
  
  // Evaluate response
  const evaluation = await evaluator.evaluateResponse(
    'What is machine learning?',
    response,
    ['algorithm', 'data', 'learning', 'artificial intelligence']
  );
  
  expect(evaluation.overallScore).toBeGreaterThan(0.7);
  expect(evaluation.semanticSimilarity?.score).toBeGreaterThan(0.6);
});
```

## 🔧 Configuration

### Test Configuration

The framework uses a centralized configuration system. Key configuration options:

```typescript
interface TestConfig {
  baseUrl: string;                    // Application base URL
  browser: 'chromium' | 'firefox' | 'webkit';
  headless: boolean;                  // Run in headless mode
  timeout: {
    action: number;                   // Action timeout (ms)
    navigation: number;               // Navigation timeout (ms)
    test: number;                     // Test timeout (ms)
  };
  llm: {
    openaiApiKey?: string;           // OpenAI API key for evaluations
    model: string;                   // LLM model to use
    similarityThreshold: number;     // Similarity threshold for evaluations
  };
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `XYNE_BASE_URL` | Base URL for Xyne application | `https://xyne.juspay.net` |
| `XYNE_AUTH_URL` | Authentication URL | `https://xyne.juspay.net/auth` |
| `TEST_TIMEOUT` | Default test timeout (ms) | `30000` |
| `HEADLESS` | Run tests in headless mode | `true` |
| `BROWSER` | Default browser | `chromium` |
| `OPENAI_API_KEY` | OpenAI API key for LLM evaluations | - |
| `OPENAI_MODEL` | OpenAI model for evaluations | `gpt-4` |
| `LOG_LEVEL` | Logging level | `info` |

## 📊 Reporting

### Test Reports

The framework generates comprehensive test reports including:

- **Test Results**: Pass/fail status with detailed error information
- **Performance Metrics**: Response times and performance bottlenecks
- **Network Analysis**: API call analysis and failure detection
- **LLM Evaluations**: Response quality scores and feedback
- **Screenshots**: Visual evidence of test execution
- **Videos**: Test execution recordings (optional)

### Viewing Reports

```bash
# Generate HTML report
npx playwright test --reporter=html

# View report in browser
npx playwright show-report

# Generate JSON report
npx playwright test --reporter=json
```

## 🔍 Debugging

### Debug Mode

```bash
# Run tests in debug mode
npm run test:debug

# Run specific test in debug mode
npx playwright test --debug tests/functional/chat-complete.spec.ts

# Run with browser visible
npx playwright test --headed
```

### Logging

The framework provides structured logging:

```typescript
import { logger } from '../src/framework/core/logger';

logger.info('Test started', { testName: 'login-validation' });
logger.warn('Slow response detected', { responseTime: 3000 });
logger.error('Test failed', { error: error.message });
```

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Add JSDoc comments for public methods
- Include unit tests for utility functions

## 📚 API Reference

### Core Classes

#### `BasePage`
Base class for all page objects with common functionality.

#### `NetworkAnalyzer`
Monitors and analyzes network traffic during test execution.

#### `LLMEvaluator`
Evaluates LLM responses using multiple criteria.

#### `ConfigManager`
Manages test configuration and environment variables.

### Utility Functions

#### Network Analysis
- `getAPICalls()`: Get all captured API calls
- `getFailedAPICalls()`: Get failed API calls
- `getPerformanceMetrics()`: Get performance statistics

#### LLM Evaluation
- `evaluateResponse()`: Comprehensive response evaluation
- `evaluateSemanticSimilarity()`: Keyword and relevance analysis
- `evaluateFactualAccuracy()`: Fact-checking using LLM-as-judge

## 🐛 Troubleshooting

### Common Issues

1. **TypeScript compilation errors**
   - Ensure all dependencies are installed: `npm install`
   - Check TypeScript configuration in `tsconfig.json`

2. **Playwright browser issues**
   - Install browsers: `npx playwright install`
   - Update Playwright: `npm update @playwright/test`

3. **Network connectivity issues**
   - Check firewall settings
   - Verify proxy configuration
   - Ensure Xyne application is accessible

4. **Environment configuration**
   - Verify `.env` file exists and is properly configured
   - Check environment variable values
   - Ensure API keys are valid

### Getting Help

- Check the test logs in `reports/` directory
- Run tests with `--debug` flag for verbose output
- Review the Playwright documentation
- Check the framework's GitHub issues

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Playwright](https://playwright.dev/)
- TypeScript support
- OpenAI API for LLM evaluations
- Inspired by modern test automation best practices
