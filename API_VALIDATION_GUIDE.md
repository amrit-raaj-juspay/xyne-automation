# API Validation Guide for Chat Module

This guide shows you how to use the new API validation functionality in your chat module tests. The implementation mirrors the Python `ApiResponse` class functionality you provided, but is specifically designed for your TypeScript/Playwright testing framework.

## Overview

The API validation system consists of three main components:

1. **ApiValidationService** - Core service for API validation and waiting for responses
2. **Enhanced APIMonitor** - Extended monitoring with validation capabilities  
3. **Enhanced ChatModulePage** - Chat-specific methods that integrate API validation

## Key Features

✅ **Wait for specific API responses** during browser automation  
✅ **Validate API response structure** (status codes, content types, required keys)  
✅ **Monitor multiple APIs** during chat interactions  
✅ **Extract data** from API responses  
✅ **Measure response times** and performance  
✅ **Comprehensive error handling** and logging  

## Basic Usage Examples

### 1. Send Message and Wait for API Response

This is the main method you'll use to validate chat API responses:

```typescript
// In your test file
import { ChatModulePage } from '@/framework/pages/chat-module-page';

test('send message and validate API response', async ({ sharedPage }) => {
  const { page } = sharedPage;
  const chatPage = new ChatModulePage(page);
  
  // Send message and wait for API response with validation
  const result = await chatPage.sendMessageAndWaitForResponse(
    'What is the weather like today?',
    {
      chatApiEndpoint: '/api/chat/send',  // Your actual chat API endpoint
      timeout: 30000,
      validateResponse: true,
      expectedStatusCode: 200,
      requiredKeys: ['response', 'message_id', 'timestamp']
    }
  );
  
  // Check the results
  console.log('Message sent:', result.messageData);
  console.log('API Response:', result.apiResponse);
  
  // Validate the response structure
  expect(result.apiResponse.statusCode).toBe(200);
  expect(result.apiResponse.data).toHaveProperty('response');
  expect(result.apiResponse.data).toHaveProperty('message_id');
  
  // Check validation results
  if (result.validationResults) {
    for (const validation of result.validationResults) {
      expect(validation.success).toBe(true);
    }
  }
});
```

### 2. Wait for Specific API Endpoint

Wait for and validate a specific API endpoint during any interaction:

```typescript
test('wait for specific API endpoint', async ({ sharedPage }) => {
  const { page } = sharedPage;
  const chatPage = new ChatModulePage(page);
  
  // Start some action that will trigger an API call
  await chatPage.sendMessageToChat('Hello');
  
  // Wait for specific API endpoint
  const apiResult = await chatPage.waitForApiEndpoint('/api/chat/response', {
    expectedStatusCode: 200,
    requiredKeys: ['content', 'id'],
    forbiddenKeys: ['error', 'debug_info'],
    timeout: 30000
  });
  
  console.log('API Response:', apiResult);
  expect(apiResult.statusCode).toBe(200);
  expect(apiResult.data).toHaveProperty('content');
});
```

### 3. Monitor Multiple APIs During Chat Interaction

Monitor and validate multiple API calls during a complex interaction:

```typescript
test('monitor multiple APIs during chat interaction', async ({ sharedPage }) => {
  const { page } = sharedPage;
  const chatPage = new ChatModulePage(page);
  
  const results = await chatPage.monitorChatAPIs(
    // Action to perform
    async () => {
      await chatPage.sendMessageToChat('Explain quantum computing');
    },
    // Expected API endpoints to monitor
    [
      {
        endpoint: '/api/chat/send',
        expectedStatusCode: 200,
        requiredKeys: ['message_id']
      },
      {
        endpoint: '/api/chat/response',
        expectedStatusCode: 200,
        requiredKeys: ['content', 'response_id']
      },
      {
        endpoint: '/api/analytics/track',
        expectedStatusCode: 202,
        requiredKeys: ['event_id']
      }
    ]
  );
  
  // Check results for each endpoint
  expect(results.endpointResults['/api/chat/send'].statusCode).toBe(200);
  expect(results.endpointResults['/api/chat/response'].statusCode).toBe(200);
  
  // Check monitoring summary
  console.log('API Summary:', results.summary);
  expect(results.summary.successfulAPIs).toBeGreaterThan(0);
});
```

### 4. Validate Response Structure

Validate that API responses contain expected data structure:

```typescript
test('validate chat response structure', async ({ sharedPage }) => {
  const { page } = sharedPage;
  const chatPage = new ChatModulePage(page);
  
  // Send message and get API response
  const result = await chatPage.sendMessageAndWaitForResponse('Hello');
  
  // Validate response structure
  const structureValidation = await chatPage.validateChatResponseStructure(
    result.apiResponse,
    {
      hasMessageId: true,
      hasTimestamp: true,
      hasContent: true,
      hasMetadata: false,
      customValidations: [
        (data) => data.response?.length > 0 || 'Response content should not be empty',
        (data) => data.model === 'claude-sonnet-4' || 'Should use correct AI model'
      ]
    }
  );
  
  expect(structureValidation.isValid).toBe(true);
  if (!structureValidation.isValid) {
    console.log('Validation errors:', structureValidation.errors);
  }
});
```

### 5. Extract Data from API Response

Extract specific data from API responses using dot notation:

```typescript
test('extract data from API response', async ({ sharedPage }) => {
  const { page } = sharedPage;
  const chatPage = new ChatModulePage(page);
  
  const result = await chatPage.sendMessageAndWaitForResponse('What is AI?');
  
  // Extract specific data using dot notation
  const messageId = chatPage.extractResponseData(result.apiResponse, 'message_id');
  const responseText = chatPage.extractResponseData(result.apiResponse, 'response.content');
  const timestamp = chatPage.extractResponseData(result.apiResponse, 'metadata.timestamp');
  
  expect(messageId).toBeTruthy();
  expect(responseText).toBeTruthy();
  console.log('Extracted message ID:', messageId);
  console.log('Extracted response:', responseText);
});
```

### 6. Validate Response Timing

Measure and validate API response times:

```typescript
test('validate API response timing', async ({ sharedPage }) => {
  const { page } = sharedPage;
  const chatPage = new ChatModulePage(page);
  
  const timingResult = await chatPage.validateResponseTiming(
    // Action to perform
    async () => {
      await chatPage.sendMessageToChat('Quick question');
    },
    '/api/chat/response',  // Endpoint to monitor
    5000  // Max response time in ms
  );
  
  expect(timingResult.withinLimit).toBe(true);
  console.log(`Response time: ${timingResult.responseTime}ms`);
  
  // Fail test if response is too slow
  if (!timingResult.withinLimit) {
    throw new Error(`API response too slow: ${timingResult.responseTime}ms`);
  }
});
```

## Advanced Usage

### Direct API Validation (Without Browser)

You can also use the API validation service directly for API-only testing:

```typescript
import { ApiValidationService } from '@/framework/utils/api-validation-service';

test('direct API validation', async ({ page }) => {
  const apiValidator = new ApiValidationService(page, 'https://your-api-host.com');
  
  // Make direct API call
  const response = await apiValidator
    .request('/api/chat/send')
    .method('POST')
    .payload({ message: 'Hello', user_id: '123' })
    .headers({ 'Authorization': 'Bearer your-token' })
    .execute();
  
  // Validate response
  const validationResults = await apiValidator.validateResponse(response, {
    expectedStatusCode: 200,
    expectedContentType: 'application/json',
    requiredKeys: ['response', 'message_id'],
    customValidations: [
      (resp) => resp.data.response.length > 0 || 'Response should not be empty'
    ]
  });
  
  // Check all validations passed
  for (const result of validationResults) {
    expect(result.success).toBe(true);
  }
});
```

### Authentication and Token Management

Handle authentication tokens like in your Python example:

```typescript
test('authentication and token management', async ({ page }) => {
  const apiValidator = new ApiValidationService(page);
  
  try {
    // Login and get token
    const token = await apiValidator.loginToken({
      username: 'test@example.com',
      password: 'password123',
      host: 'https://your-auth-host.com'
    });
    
    console.log('Received token:', token);
    
    // Use token for subsequent requests
    const response = await apiValidator
      .request('/api/protected-endpoint')
      .method('GET')
      .headers({ 'Authorization': `Bearer ${token}` })
      .execute();
      
    expect(response.status).toBe(200);
    
  } catch (error) {
    console.log('Authentication failed:', error.message);
  }
});
```

## Configuration

### Customizing API Endpoints

Update the default endpoints in your chat page methods:

```typescript
// In your test
const result = await chatPage.sendMessageAndWaitForResponse(
  'Your message',
  {
    chatApiEndpoint: '/api/v2/chat/messages',  // Your actual endpoint
    timeout: 45000,  // Longer timeout for complex queries
    expectedStatusCode: 201,  // Different expected status
    requiredKeys: ['data.response', 'data.id', 'metadata.timestamp']
  }
);
```

### Environment-Specific Configuration

Set up different configurations for different environments:

```typescript
// In your test setup
const apiEndpoints = {
  development: '/api/dev/chat',
  staging: '/api/staging/chat', 
  production: '/api/v1/chat'
};

const currentEndpoint = apiEndpoints[process.env.NODE_ENV] || apiEndpoints.development;
```

## Error Handling

The API validation system provides comprehensive error handling:

```typescript
test('handle API validation errors', async ({ sharedPage }) => {
  const { page } = sharedPage;
  const chatPage = new ChatModulePage(page);
  
  try {
    const result = await chatPage.sendMessageAndWaitForResponse(
      'Test message',
      {
        chatApiEndpoint: '/api/chat/send',
        timeout: 10000,
        expectedStatusCode: 200,
        requiredKeys: ['response', 'message_id']
      }
    );
    
    // Check if any validations failed
    if (result.validationResults) {
      const failedValidations = result.validationResults.filter(v => !v.success);
      if (failedValidations.length > 0) {
        console.log('Failed validations:', failedValidations);
        // Handle validation failures
      }
    }
    
  } catch (error) {
    console.log('API validation error:', error.message);
    // Handle timeout or other errors
  }
});
```

## Best Practices

1. **Use specific endpoints**: Always specify the exact API endpoint you want to monitor
2. **Set appropriate timeouts**: Chat APIs might take longer, so adjust timeouts accordingly
3. **Validate key data**: Always check for required keys in API responses
4. **Monitor performance**: Use timing validation to catch performance regressions
5. **Handle errors gracefully**: Implement proper error handling for failed API calls
6. **Log comprehensively**: Use the built-in logging to debug issues

## Integration with Existing Tests

You can easily integrate API validation into your existing chat module tests:

```typescript
// Update your existing test
testHigh('verify able to send messages to chat', {
  dependsOn: ['verify search functionality'],
  tags: ['@core', '@chat', '@messaging', '@api'],
  description: 'Verify ability to send messages and validate API responses'
}, async ({ sharedPage }) => {
  const { page } = sharedPage;
  const chatPage = new ChatModulePage(page);
  
  // Use the new API validation method instead of just sendMessageToChat
  const result = await chatPage.sendMessageAndWaitForResponse(
    'Hello, this is a test message for the chat functionality.',
    {
      chatApiEndpoint: '/api/chat/send',  // Replace with your actual endpoint
      validateResponse: true,
      expectedStatusCode: 200,
      requiredKeys: ['response', 'message_id']
    }
  );
  
  // Additional validations
  expect(result.apiResponse.statusCode).toBe(200);
  expect(result.apiResponse.data).toHaveProperty('response');
  
  console.log('✅ Message sent and API validated successfully');
});
```

