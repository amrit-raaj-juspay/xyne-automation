/**
 * Google OAuth + TOTP Login Page
 * Extended LoginPage with complete Google OAuth and TOTP authentication flow
 * TypeScript equivalent of Python's SigninStaging class
 */

import { Page } from '@playwright/test';
import { LoginPage } from './login-page';
import { TOTPGenerator } from '../../utils/totp-generator';

export class GoogleOAuthLoginPage extends LoginPage {
  private totpGenerator: TOTPGenerator | null = null;

  // Google OAuth selectors (based on your Python implementation)
  private googleSelectors = {
    // Email step
    emailField: '#identifierId, [aria-label="Email or phone"]',
    emailNextButton: '#identifierNext, [data-testid="next-button"]',
    
    // Password step
    passwordField: 'input[type="password"], [aria-label="Enter your password"]',
    passwordNextButton: '#passwordNext, [data-testid="password-next"]',
    
    // 2FA options
    tryAnotherWayButton: 'text=Try another way',
    authenticatorOption: 'text=Get a verification code from the Google Authenticator app, text=Google Authenticator',
    
    // TOTP step
    otpField: '[aria-label="Enter code"], input[name="totpPin"], input[type="tel"], #totpPin',
    otpNextButton: 'text=Next',
    
    // Final consent/continue
    finalContinueButton: '[data-testid="continue-button"], button:has-text("Continue")',
    allowButton: 'text=Allow',
    
    // Error elements
    errorMessage: '[role="alert"], .error-message, [data-testid="error"]'
  };

  constructor(page: Page) {
    super(page);
    this.initializeTOTPGenerator();
  }

  /**
   * Initialize TOTP generator from environment variables
   */
  private initializeTOTPGenerator(): void {
    try {
      this.totpGenerator = TOTPGenerator.fromEnvironment('TOTP_SECRET_KEY');
      console.log('TOTP generator initialized successfully');
    } catch (error) {
      console.warn('WARNING: TOTP generator not initialized:', error);
    }
  }

  /**
   * Get credentials from environment variables
   */
  private getCredentials() {
    const email = process.env.GOOGLE_EMAIL;
    const password = process.env.GOOGLE_PASSWORD;
    
    if (!email || !password) {
      throw new Error('Google credentials not found in environment variables. Please set GOOGLE_EMAIL and GOOGLE_PASSWORD.');
    }
    
    return { email, password };
  }

  /**
   * Perform complete Google OAuth + TOTP login flow
   * Main method that orchestrates the entire login process
   */
  async performCompleteLogin(): Promise<boolean> {
    console.log('Starting complete Google OAuth + TOTP login flow');
    
    try {
      // Step 1: Navigate to login page and click Google login
      await this.initiateGoogleLogin();
      
      // Step 2: Handle Google email input
      await this.handleGoogleEmailStep();
      
      // Step 3: Handle Google password input
      await this.handleGooglePasswordStep();
      
      // Step 4: Handle 2FA selection (if needed)
      await this.handle2FASelection();
      
      // Step 5: Handle TOTP code input
      await this.handleTOTPStep();
      
      // Step 6: Handle final consent/continue
      await this.handleFinalConsent();
      
      // Step 7: Verify successful login
      const loginSuccess = await this.verifyLoginSuccess();
      
      if (loginSuccess) {
        console.log('Complete login flow successful');
        return true;
      } else {
        console.error('ERROR: Login verification failed');
        return false;
      }
      
    } catch (error) {
      console.error('ERROR: Login flow failed:', error);
      await this.takeScreenshot('login_error.png');
      return false;
    }
  }

  /**
   * Step 1: Navigate to login page and initiate Google OAuth
   */
  private async initiateGoogleLogin(): Promise<void> {
    console.log('Step 1: Initiating Google login');
    
    // Navigate to login page
    const loginUrl = this.getLoginUrls().login;
    await this.navigateToLogin(loginUrl);
    await this.assertLoginPageValid();
    
    // Wait for and click Google login button
    const googleLoginButton = 'text=Continue with google';
    await this.waitForElement(googleLoginButton, 10000);
    await this.clickElement(googleLoginButton);
    
    console.log('Google login initiated');
  }

  /**
   * Step 2: Handle Google email input
   */
  private async handleGoogleEmailStep(): Promise<void> {
    console.log('Step 2: Handling Google email input');
    
    const { email } = this.getCredentials();
    
    // Wait for email field and enter email
    await this.waitForElement(this.googleSelectors.emailField, 15000);
    await this.fill(this.googleSelectors.emailField, email);
    
    // Click Next button
    await this.waitForElement(this.googleSelectors.emailNextButton, 5000);
    await this.clickElement(this.googleSelectors.emailNextButton);
    
    // Wait for navigation to password step
    await this.page.waitForTimeout(3000);
    
    console.log('Email step completed');
  }

  /**
   * Step 3: Handle Google password input
   */
  private async handleGooglePasswordStep(): Promise<void> {
    console.log('Step 3: Handling Google password input');
    
    const { password } = this.getCredentials();
    
    // Wait for password field and enter password
    await this.waitForElement(this.googleSelectors.passwordField, 15000);
    await this.fill(this.googleSelectors.passwordField, password);
    
    // Click Next button
    await this.waitForElement(this.googleSelectors.passwordNextButton, 5000);
    await this.clickElement(this.googleSelectors.passwordNextButton);
    
    // Wait for 2FA or next step
    await this.page.waitForTimeout(5000);
    
    console.log('Password step completed');
  }

  /**
   * Step 4: Handle 2FA selection (Try another way -> Google Authenticator OR direct selection)
   */
  private async handle2FASelection(): Promise<void> {
    console.log('Step 4: Handling 2FA selection');
    
    try {
      // Wait a moment for the 2FA page to load
      await this.page.waitForTimeout(2000);
      
      // Multiple possible selectors for Google Authenticator option
      const authenticatorSelectors = [
        'text=Get a verification code from the Google Authenticator app',
        'text=Google Authenticator',
        '[data-testid="authenticator-app"]',
        'div:has-text("Google Authenticator app")',
        'div:has-text("verification code from the Google Authenticator")',
        // More specific selectors based on the screenshot
        'div[role="button"]:has-text("Google Authenticator")',
        'button:has-text("Google Authenticator")'
      ];
      
      // First, try to find and click Google Authenticator option directly
      console.log('Looking for Google Authenticator option...');
      let authenticatorFound = false;
      
      for (const selector of authenticatorSelectors) {
        try {
          const isVisible = await this.isElementVisible(selector);
          console.log(`   Checking selector "${selector}": ${isVisible ? 'Found' : 'Not found'}`);
          
          if (isVisible) {
            console.log(`Found Google Authenticator option with selector: ${selector}`);
            await this.clickElement(selector);
            await this.page.waitForTimeout(3000);
            console.log('Google Authenticator selected directly');
            authenticatorFound = true;
            break;
          }
        } catch (error) {
          console.log(`   Error checking selector "${selector}": ${error}`);
          continue;
        }
      }
      
      // If not found directly, try "Try another way" approach
      if (!authenticatorFound) {
        console.log('Google Authenticator not found directly, trying "Try another way"...');
        const tryAnotherWayVisible = await this.isElementVisible(this.googleSelectors.tryAnotherWayButton);
        
        if (tryAnotherWayVisible) {
          console.log('"Try another way" option found, clicking...');
          await this.clickElement(this.googleSelectors.tryAnotherWayButton);
          await this.page.waitForTimeout(3000);
          
          // Now try to find Google Authenticator option again
          for (const selector of authenticatorSelectors) {
            try {
              const isVisible = await this.isElementVisible(selector);
              if (isVisible) {
                console.log(`Found Google Authenticator after "Try another way" with selector: ${selector}`);
                await this.clickElement(selector);
                await this.page.waitForTimeout(3000);
                console.log('Google Authenticator selected after "Try another way"');
                authenticatorFound = true;
                break;
              }
            } catch (error) {
              continue;
            }
          }
        }
      }
      
      if (!authenticatorFound) {
        console.log('WARNING: Google Authenticator option not found, but proceeding to TOTP step');
        // Take a screenshot for debugging
        await this.takeLoginScreenshot('2fa_selection_failed');
      }
      
    } catch (error) {
      console.log('️ 2FA selection step encountered error:', error);
      await this.takeLoginScreenshot('2fa_selection_error');
    }
  }

  /**
   * Step 5: Handle TOTP code input
   */
  private async handleTOTPStep(): Promise<void> {
    console.log('Step 5: Handling TOTP code input');
    
    if (!this.totpGenerator) {
      throw new Error('TOTP generator not initialized. Please check TOTP_SECRET_KEY environment variable.');
    }
    
    // Wait for OTP input field
    await this.waitForElement(this.googleSelectors.otpField, 15000);
    
    // Generate TOTP code with smart timing
    const totpCode = await this.totpGenerator.generateCodeWithTiming(3);
    
    // Enter TOTP code
    await this.fill(this.googleSelectors.otpField, totpCode);
    await this.page.waitForTimeout(1000);
    
    // Click Next button
    await this.waitForElement(this.googleSelectors.otpNextButton, 5000);
    await this.clickElement(this.googleSelectors.otpNextButton);
    
    // Wait for next step
    await this.page.waitForTimeout(5000);
    
    console.log('TOTP step completed');
  }

  /**
   * Step 6: Handle final consent/continue buttons
   */
  private async handleFinalConsent(): Promise<void> {
    console.log('Step 6: Handling final consent');
    
    try {
      // Look for various possible final consent buttons
      const possibleButtons = [
        this.googleSelectors.finalContinueButton,
        this.googleSelectors.allowButton,
        'text=Continue',
        'text=Allow',
        'button:has-text("Continue")',
        'button:has-text("Allow")'
      ];
      
      for (const buttonSelector of possibleButtons) {
        try {
          const buttonVisible = await this.isElementVisible(buttonSelector);
          if (buttonVisible) {
            console.log(`Found final button: ${buttonSelector}`);
            await this.clickElement(buttonSelector);
            await this.page.waitForTimeout(3000);
            break;
          }
        } catch (error) {
          // Continue to next button option
          continue;
        }
      }
      
      console.log('Final consent step completed');
    } catch (error) {
      console.log('INFO: Final consent step skipped or not needed:', error);
    }
  }

  /**
   * Step 7: Verify successful login
   */
  private async verifyLoginSuccess(): Promise<boolean> {
    console.log('Step 7: Verifying login success');
    
    try {
      // Wait for redirect away from auth pages
      await this.page.waitForTimeout(5000);
      
      const currentUrl = this.getCurrentUrl();
      console.log(`Current URL after login: ${currentUrl}`);
      
      // Check if we're no longer on Google auth pages
      const isOnGoogleAuth = currentUrl.includes('accounts.google.com') || 
                            currentUrl.includes('oauth') ||
                            currentUrl.includes('/auth');
      
      if (!isOnGoogleAuth) {
        console.log('Successfully redirected away from auth pages');
        return true;
      }
      
      // Additional checks for successful login indicators
      const successIndicators = [
        '[data-testid="user-menu"]',
        '[data-testid="logout"]',
        '.user-avatar',
        '.profile-menu'
      ];
      
      for (const indicator of successIndicators) {
        const indicatorVisible = await this.isElementVisible(indicator);
        if (indicatorVisible) {
          console.log(`Login success indicator found: ${indicator}`);
          return true;
        }
      }
      
      // Check if we're on a protected page (not login/auth)
      if (!currentUrl.includes('/auth') && !currentUrl.includes('login')) {
        console.log('On protected page, login likely successful');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Error verifying login success:', error);
      return false;
    }
  }

  /**
   * Check if there are any error messages during login
   */
  async hasLoginErrors(): Promise<boolean> {
    try {
      return await this.isElementVisible(this.googleSelectors.errorMessage);
    } catch {
      return false;
    }
  }

  /**
   * Get login error message if present
   */
  async getLoginErrorMessage(): Promise<string | null> {
    try {
      if (await this.hasLoginErrors()) {
        return await this.getElementText(this.googleSelectors.errorMessage);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Quick login method for simple test cases
   */
  async quickLogin(): Promise<boolean> {
    console.log('Performing quick Google OAuth + TOTP login');
    return await this.performCompleteLogin();
  }

  /**
   * Login with custom credentials (override environment variables)
   */
  async loginWithCredentials(email: string, password: string, totpSecret?: string): Promise<boolean> {
    console.log('Performing login with custom credentials');
    
    // Temporarily override environment variables
    const originalEmail = process.env.GOOGLE_EMAIL;
    const originalPassword = process.env.GOOGLE_PASSWORD;
    const originalTotpSecret = process.env.TOTP_SECRET_KEY;
    
    try {
      process.env.GOOGLE_EMAIL = email;
      process.env.GOOGLE_PASSWORD = password;
      if (totpSecret) {
        process.env.TOTP_SECRET_KEY = totpSecret;
        this.initializeTOTPGenerator();
      }
      
      return await this.performCompleteLogin();
      
    } finally {
      // Restore original environment variables
      if (originalEmail) process.env.GOOGLE_EMAIL = originalEmail;
      if (originalPassword) process.env.GOOGLE_PASSWORD = originalPassword;
      if (originalTotpSecret) process.env.TOTP_SECRET_KEY = originalTotpSecret;
      if (totpSecret) this.initializeTOTPGenerator();
    }
  }

  /**
   * Take screenshot with timestamp for debugging
   */
  async takeLoginScreenshot(step: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `google_oauth_login_${step}_${timestamp}.png`;
    return await this.takeScreenshot(filename);
  }
}
