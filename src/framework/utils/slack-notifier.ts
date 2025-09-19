/**
 * Slack Notifier Utility
 * Sends test execution notifications to Slack channels
 */

import { WebClient } from '@slack/web-api';
import { PriorityExecutionStats } from '@/types';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

export interface SlackNotificationData {
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
  executionTime: string;
  testEnvUrl: string;
  scriptRunBy: string;
  moduleName?: string;
  htmlReportPath?: string;
  priorityStats?: {
    highest: { total: number; passed: number; failed: number; skipped: number };
    high: { total: number; passed: number; failed: number; skipped: number };
    medium: { total: number; passed: number; failed: number; skipped: number };
    low: { total: number; passed: number; failed: number; skipped: number };
  };
}

export class SlackNotifier {
  private client: WebClient | null = null;
  private channelId: string;
  private isEnabled: boolean;

  constructor() {
    const botToken = process.env.SLACK_BOT_TOKEN;
    const channelId = process.env.SLACK_CHANNEL_ID || 'xyne-automation';
    
    this.isEnabled = !!botToken;
    this.channelId = channelId;
    
    if (this.isEnabled && botToken) {
      this.client = new WebClient(botToken);
    } else {
      console.log('⚠️  Slack notifications disabled: SLACK_BOT_TOKEN not found in environment');
    }
  }

  /**
   * Send test execution completion notification to Slack
   */
  async sendTestCompletionNotification(data: SlackNotificationData): Promise<void> {
    if (!this.isEnabled || !this.client) {
      console.log('📱 Slack notification skipped: Not configured');
      return;
    }

    try {
      const message = this.formatTestCompletionMessage(data);
      
      const result = await this.client.chat.postMessage({
        channel: this.channelId,
        text: message.text,
        attachments: message.attachments,
        mrkdwn: true // Enable markdown formatting for attachments
      });

      if (result.ok) {
        console.log('✅ Slack notification sent successfully');
        
        // Send thread reply with priority breakdown if available
        if (data.priorityStats && result.ts) {
          await this.sendPriorityBreakdownThread(result.ts, data);
        }
        
        // Upload HTML report as thread reply if available
        if (data.htmlReportPath && result.ts) {
          await this.uploadHtmlReportFile(result.ts, data.htmlReportPath);
        }
      } else {
        console.error('❌ Failed to send Slack notification:', result.error);
      }
    } catch (error: any) {
      // Handle specific Slack API errors
      if (error.code === 'slack_webapi_platform_error' && error.data?.error === 'account_inactive') {
        console.log('⚠️  Slack notification skipped: Account inactive. Please update SLACK_BOT_TOKEN in .env file.');
        this.isEnabled = false; // Disable further attempts
        return;
      }
      console.error('❌ Error sending Slack notification:', error);
    }
  }

  /**
   * Upload HTML report file as a thread reply
   */
  private async uploadHtmlReportFile(threadTs: string, htmlReportPath: string): Promise<void> {
    if (!this.client) return;

    try {
      // Check if file exists
      if (!fs.existsSync(htmlReportPath)) {
        console.warn(`⚠️ HTML report file not found: ${htmlReportPath}`);
        return;
      }

      const fileName = path.basename(htmlReportPath);
      const fileTitle = `Test Execution Report - ${fileName}`;
      
      const result = await this.client.files.uploadV2({
        channels: this.channelId,
        file: fs.createReadStream(htmlReportPath),
        filename: fileName,
        title: fileTitle,
        thread_ts: threadTs,
        initial_comment: '*Detailed HTML Test Report*\n\nThis report includes:\n• Detailed test results with screenshots\n• Performance metrics and timing\n• Error details and stack traces\n• Interactive test timeline'
      });

      if (result.ok) {
        console.log('✅ HTML report file uploaded successfully');
      } else {
        console.error('❌ Failed to upload HTML report file:', result.error);
      }
    } catch (error) {
      console.error('❌ Error uploading HTML report file:', error);
    }
  }

  /**
   * Format the test completion message with rich Slack attachments
   */
  private formatTestCompletionMessage(data: SlackNotificationData): { text: string; attachments: any[] } {
    const currentDate = new Date();
    const formattedDate = this.formatDateTime(currentDate);
    const moduleName = data.moduleName || 'Xyne';
    
    // Determine colors and emojis based on test results
    const colors = this.getStatusColors();
    const emojis = this.getStatusEmojis();
    
    // Determine overall status and color
    const overallColor = data.totalFailed > 0 ? colors.failed : 
                        (data.totalSkipped > 0 ? colors.skipped : colors.passed);
    const overallEmoji = data.totalFailed > 0 ? emojis.alert : 
                        (data.totalSkipped > 0 ? emojis.alert : emojis.passed);
    
    const mainText = `${overallEmoji} *Test Suite Execution Completed* ${overallEmoji}\nXYNE\nAutomation report for ${moduleName}`;
    
    const pretext = `:calendar: *DATE/TIME*: ${formattedDate}\n\n\`\`\`\nSCRIPT RUN BY: ${data.scriptRunBy}\nTEST ENV URL: ${data.testEnvUrl}\n\`\`\``;
    
    return {
      text: mainText,
      attachments: [
        {
          fallback: `Test Suite Execution Completed - ${data.totalPassed}/${data.totalTests} tests passed`,
          color: overallColor,
          pretext: pretext,
          fields: [
            {
              title: "",
              value: `*Test Cases Run* : ${data.totalTests}`,
              short: false
            },
            {
              title: "",
              value: `*Test Cases Failed* : ${data.totalFailed}`,
              short: false
            },
            {
              title: "",
              value: `*Test Cases Passed* : ${data.totalPassed}`,
              short: false
            },
            {
              title: "",
              value: `*Test Cases Skipped* : ${data.totalSkipped}`,
              short: false
            }
          ],
          footer: `:robot_face: Automation Notification Bot`
        }
      ]
    };
  }

  /**
   * Get status colors for Slack attachments
   */
  private getStatusColors() {
    return {
      passed: '#36a64f',  // Green
      failed: '#e01e5a',  // Red
      skipped: '#f7a700'  // Yellow
    };
  }

  /**
   * Get status emojis
   */
  private getStatusEmojis() {
    return {
      alert: ':alerting:',
      passed: ':qa-passed:',
      repeat: ':repeat:'
    };
  }

  /**
   * Send priority breakdown as thread reply
   */
  private async sendPriorityBreakdownThread(threadTs: string, data: SlackNotificationData): Promise<void> {
    if (!this.client || !data.priorityStats) return;

    try {
      const colors = this.getStatusColors();
      const hasPriorityFailures = data.priorityStats.highest.failed > 0 || 
                                 data.priorityStats.high.failed > 0 || 
                                 data.priorityStats.medium.failed > 0 || 
                                 data.priorityStats.low.failed > 0;

      const overallColor = hasPriorityFailures ? colors.failed : colors.passed;
      
      const threadMessage = {
        text: `\n\`Please Download the .html file and Open in Chrome Browser. All the reports are shared over email also, Kindly Please check Your Email for detailed Analysis of Testing Reports\`\n\n`,
        attachments: [
          {
            fallback: `Priority Test Breakdown`,
            color: overallColor,
            pretext: hasPriorityFailures ? `Module Owner: Please Check The Report For The Failed Test Cases.` : '',
            fields: [
              {
                title: `*Highest Priority Failed*`,
                value: `${data.priorityStats.highest.failed}`,
                short: true
              },
              {
                title: `*High Priority Failed*`,
                value: `${data.priorityStats.high.failed}`,
                short: true
              },
              {
                title: `*Medium Priority Failed*`,
                value: `${data.priorityStats.medium.failed}`,
                short: true
              },
              {
                title: `*Low Priority Failed*`,
                value: `${data.priorityStats.low.failed}`,
                short: true
              }
            ]
          }
        ]
      };

      await this.client.chat.postMessage({
        channel: this.channelId,
        text: threadMessage.text,
        attachments: threadMessage.attachments,
        thread_ts: threadTs,
        mrkdwn: true
      });

      console.log('✅ Priority breakdown thread sent successfully');
    } catch (error) {
      console.error('❌ Error sending priority breakdown thread:', error);
    }
  }

  /**
   * Format date and time in the required format: DD-MM-YYYY - HH:MM:SS AM/PM
   */
  private formatDateTime(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const formattedHours = hours.toString().padStart(2, '0');
    
    return `${day}-${month}-${year} - ${formattedHours}:${minutes}:${seconds} ${ampm}`;
  }

  /**
   * Test the Slack connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.isEnabled || !this.client) {
      console.log('❌ Slack not configured');
      return false;
    }

    try {
      const result = await this.client.auth.test();
      if (result.ok) {
        console.log('✅ Slack connection successful');
        console.log(`   Bot User: ${result.user}`);
        console.log(`   Team: ${result.team}`);
        return true;
      } else {
        console.error('❌ Slack connection failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error testing Slack connection:', error);
      return false;
    }
  }

  /**
   * Check if Slack notifications are enabled
   */
  isSlackEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const slackNotifier = new SlackNotifier();
