# Slack Integration Guide

This guide explains how to set up and use the Slack notification feature for test execution reports.

## Overview

The Xyne automation framework now includes Slack integration that automatically sends test execution notifications to a specified Slack channel after every test run. The notifications include:

- 🚨 Test Suite Execution Completed status
- Module name (Xyne)
- Date/Time of execution
- Script run by information
- Test environment URL
- Test statistics (Run, Failed, Passed, Skipped)
- Bot signature

## Setup Instructions

### 1. Slack Bot Configuration

The Slack bot token is already configured in the `.env` file:
```
```

### 2. Add Bot to Channel

**IMPORTANT**: The bot needs to be added to the `xyne-automation` channel:

1. Go to the `#xyne-automation` channel in Slack
2. Type `/invite @Auditor` (or whatever the bot name is)
3. Or go to channel settings → Integrations → Add apps → Add the bot

### 3. Verify Bot Permissions

Ensure the bot has the following permissions:
- `chat:write` - To post messages
- `channels:read` - To access channel information
- `groups:read` - To access private channels (if needed)

## Testing the Integration

### Test Slack Connection
```bash
# Run a simple test to verify Slack integration
npm run test:agent-module -- --grep "user login"
```

### Test Different Scenarios
```bash
# Test with failures (to see failure notifications)
npm run test:agent-module

# Test with different modules
npm run test:chat-module
```

## Message Format

The Slack notification follows this exact format:

```
🚨 Test Suite Execution Completed 🚨
XYNE
Automation report for (Xyne) Module

📅 DATE/TIME: 18-09-2025 - 01:49:08 AM

SCRIPT RUN BY: Amrit Raj

TEST ENV URL: https://xyne.juspay.net

Test Cases Run: 2
Test Cases Failed: 0
Test Cases Passed: 2
Test Cases Skipped: 0

🤖 Automation Notification Bot
```

## Configuration Options

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SLACK_BOT_TOKEN` | Slack bot token | `xoxb-...` |
| `SLACK_CHANNEL_ID` | Channel name or ID | `xyne-automation` |
| `SCRIPT_RUN_BY` | User name for notifications | `Amrit Raj` |

### Customization

To modify the notification format, edit `src/framework/utils/slack-notifier.ts`:

```typescript
private formatTestCompletionMessage(data: SlackNotificationData): string {
  // Customize message format here
}
```

## Troubleshooting

### Common Issues

1. **"not_in_channel" Error**
   - **Solution**: Add the bot to the target channel
   - **Command**: `/invite @BotName` in the channel

2. **"invalid_auth" Error**
   - **Solution**: Check if the bot token is correct
   - **Check**: Verify `SLACK_BOT_TOKEN` in `.env`

3. **"channel_not_found" Error**
   - **Solution**: Verify channel name/ID is correct
   - **Check**: Ensure `SLACK_CHANNEL_ID` matches actual channel

4. **No Notifications Sent**
   - **Check**: Ensure `SLACK_BOT_TOKEN` is set
   - **Verify**: Bot has proper permissions
   - **Debug**: Check console logs for error messages

### Debug Mode

To see detailed Slack integration logs, check the console output during test execution. Look for:
- `✅ Slack notification sent successfully`
- `❌ Error sending Slack notification: [error details]`
- `📱 Slack notification skipped: Not configured`

### Manual Testing

Create a test script to verify Slack connection:

```javascript
// test-slack-connection.js
const { slackNotifier } = require('./src/framework/utils/slack-notifier');

async function testSlackConnection() {
  const testData = {
    totalTests: 5,
    totalPassed: 4,
    totalFailed: 1,
    totalSkipped: 0,
    executionTime: new Date().toISOString(),
    testEnvUrl: 'https://xyne.juspay.net',
    scriptRunBy: 'Test User'
  };

  try {
    await slackNotifier.sendTestCompletionNotification(testData);
    console.log('✅ Slack test notification sent successfully');
  } catch (error) {
    console.error('❌ Slack test failed:', error);
  }
}

testSlackConnection();
```

## Integration with CI/CD

The Slack integration works automatically in CI/CD environments. Ensure the following environment variables are set in your CI/CD system:

```bash
SLACK_BOT_TOKEN=your-bot-token
SLACK_CHANNEL_ID=your-channel
SCRIPT_RUN_BY=CI/CD System
```

## Security Notes

- Keep the `SLACK_BOT_TOKEN` secure and never commit it to version control
- Use environment variables or secure secret management
- Regularly rotate bot tokens for security
- Limit bot permissions to only what's necessary

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify bot permissions in Slack
3. Check console logs for detailed error messages
4. Ensure the bot is added to the target channel

The integration is designed to fail gracefully - if Slack is not configured or fails, tests will continue to run normally without interruption.
