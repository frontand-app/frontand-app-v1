const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class ClosedAITestAgent {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseURL = 'http://localhost:8080';
    this.screenshotDir = './screenshots';
    this.issues = [];
  }

  async init() {
    // Create screenshots directory
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }

    // Launch browser
    this.browser = await chromium.launch({ 
      headless: false, // Set to true for headless mode
      slowMo: 1000 // Slow down for better observation
    });
    
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🤖 CLOSED AI Test Agent initialized');
  }

  async takeScreenshot(name, description) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}_${name}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    
    await this.page.screenshot({ 
      path: filepath, 
      fullPage: true 
    });
    
    console.log(`📸 Screenshot: ${filename} - ${description}`);
    return filepath;
  }

  async checkElement(selector, description) {
    try {
      const element = await this.page.waitForSelector(selector, { timeout: 5000 });
      if (element) {
        console.log(`✅ Found: ${description}`);
        return true;
      }
    } catch (error) {
      console.log(`❌ Missing: ${description}`);
      this.issues.push(`Missing element: ${description} (${selector})`);
      return false;
    }
  }

  async checkText(text, description) {
    try {
      await this.page.waitForSelector(`text=${text}`, { timeout: 5000 });
      console.log(`✅ Found text: ${description}`);
      return true;
    } catch (error) {
      console.log(`❌ Missing text: ${description}`);
      this.issues.push(`Missing text: ${description}`);
      return false;
    }
  }

  async testHomePage() {
    console.log('\n🏠 Testing Home Page...');
    
    await this.page.goto(this.baseURL);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('01_homepage', 'Homepage initial load');

    // Check header elements
    await this.checkElement('[data-testid="logo"], .logo, text=CLOSED AI', 'CLOSED AI Logo');
    await this.checkElement('nav, [role="navigation"]', 'Navigation menu');
    await this.checkText('Home', 'Home navigation link');
    await this.checkText('Flow Library', 'Flow Library navigation link');
    await this.checkText('Dashboard', 'Dashboard navigation link');
    await this.checkText('Creators', 'Creators navigation link');

    // Check hero section
    await this.checkText('The OS for Workflows', 'Main hero title');
    await this.checkElement('[data-testid="prompt-discovery"], .prompt-discovery', 'Prompt discovery component');
    
    // Check for featured workflows
    await this.checkText('Featured Workflows', 'Featured workflows section');
    await this.checkElement('.workflow-card, [data-testid="workflow-card"]', 'Workflow cards');

    await this.takeScreenshot('02_homepage_full', 'Homepage full content');
  }

  async testWorkflowRunner() {
    console.log('\n⚙️ Testing Workflow Runner...');
    
    // Navigate to keyword clustering workflow
    await this.page.goto(`${this.baseURL}/flows/cluster-keywords`);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('03_workflow_initial', 'Workflow runner initial load');

    // Check workflow header
    await this.checkText('Cluster Keywords', 'Workflow title');
    await this.checkText('Text Analysis', 'Workflow category');
    await this.checkText('Estimated cost:', 'Cost estimation');

    // Check input/output layout
    const inputPanel = await this.checkElement('[data-testid="input-panel"], .input-panel, text=Input', 'Input panel');
    const outputPanel = await this.checkElement('[data-testid="output-panel"], .output-panel, text=Output', 'Output panel');
    
    if (inputPanel && outputPanel) {
      console.log('✅ Input/Output layout found');
    } else {
      this.issues.push('Input/Output panels not properly configured');
    }

    // Check for form elements in input panel
    await this.checkElement('textarea, input[type="text"], .form-field', 'Input form fields');
    await this.checkElement('button[type="submit"], .submit-button, .run-button', 'Submit/Run button');

    await this.takeScreenshot('04_workflow_layout', 'Workflow layout with panels');

    // Try to scroll within panels to test fixed height
    try {
      const inputContainer = await this.page.locator('.input-panel, [data-testid="input-panel"]').first();
      if (await inputContainer.count() > 0) {
        await inputContainer.hover();
        await this.page.mouse.wheel(0, 500);
        await this.takeScreenshot('05_workflow_scrolled', 'Testing scroll within input panel');
      }
    } catch (error) {
      this.issues.push('Input panel scrolling not working properly');
    }
  }

  async testAuthentication() {
    console.log('\n🔐 Testing Authentication...');
    
    await this.page.goto(`${this.baseURL}/auth`);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('06_auth_page', 'Authentication page');

    // Check auth form elements
    await this.checkElement('input[type="email"], [placeholder*="email"]', 'Email input field');
    await this.checkElement('input[type="password"], [placeholder*="password"]', 'Password input field');
    await this.checkElement('button[type="submit"], .login-button, .signin-button', 'Login button');
    
    // Check for sign up option
    await this.checkText('Sign up', 'Sign up option');
    await this.checkText('Create account', 'Create account option');
  }

  async testCreatorsDashboard() {
    console.log('\n📊 Testing Creators Dashboard...');
    
    await this.page.goto(`${this.baseURL}/creators`);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('07_creators_dashboard', 'Creators dashboard');

    // Check dashboard elements
    await this.checkText('Creator Dashboard', 'Dashboard title');
    await this.checkElement('.stats-card, [data-testid="stats-card"]', 'Statistics cards');
    await this.checkElement('.chart, .recharts-wrapper, canvas', 'Analytics charts');
    
    // Check for revenue/earnings displays
    await this.checkText('Total Revenue', 'Revenue display');
    await this.checkText('Total Executions', 'Executions display');
  }

  async testResponsiveness() {
    console.log('\n📱 Testing Responsive Design...');
    
    // Test mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.goto(this.baseURL);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('08_mobile_homepage', 'Homepage on mobile');

    // Test workflow on mobile
    await this.page.goto(`${this.baseURL}/flows/cluster-keywords`);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('09_mobile_workflow', 'Workflow on mobile');

    // Test tablet viewport
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.page.goto(this.baseURL);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('10_tablet_homepage', 'Homepage on tablet');

    // Reset to desktop
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async testInteractions() {
    console.log('\n🖱️ Testing Interactions...');
    
    await this.page.goto(this.baseURL);
    await this.page.waitForLoadState('networkidle');

    // Test navigation
    try {
      await this.page.click('text=Flow Library');
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot('11_flow_library', 'Flow Library page');
    } catch (error) {
      this.issues.push('Navigation to Flow Library failed');
    }

    // Test workflow selection
    try {
      await this.page.click('.workflow-card, [data-testid="workflow-card"]');
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot('12_workflow_selected', 'Workflow selected from library');
    } catch (error) {
      this.issues.push('Workflow selection from library failed');
    }
  }

  async checkConsoleErrors() {
    console.log('\n🐛 Checking Console Errors...');
    
    const errors = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    this.page.on('pageerror', error => {
      errors.push(error.message);
    });

    // Navigate through pages to collect errors
    const pages = [
      this.baseURL,
      `${this.baseURL}/flows`,
      `${this.baseURL}/flows/cluster-keywords`,
      `${this.baseURL}/dashboard`,
      `${this.baseURL}/creators`,
      `${this.baseURL}/auth`
    ];

    for (const url of pages) {
      try {
        await this.page.goto(url);
        await this.page.waitForLoadState('networkidle');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for any async errors
      } catch (error) {
        errors.push(`Navigation error: ${url} - ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.log('❌ Console Errors Found:');
      errors.forEach(error => {
        console.log(`  - ${error}`);
        this.issues.push(`Console error: ${error}`);
      });
    } else {
      console.log('✅ No console errors found');
    }
  }

  async generateReport() {
    console.log('\n📋 Generating Test Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      baseURL: this.baseURL,
      screenshotsDirectory: this.screenshotDir,
      totalIssues: this.issues.length,
      issues: this.issues,
      recommendations: []
    };

    // Add recommendations based on issues
    if (this.issues.some(issue => issue.includes('Input/Output'))) {
      report.recommendations.push('Fix workflow input/output panel layout and content');
    }
    
    if (this.issues.some(issue => issue.includes('scroll'))) {
      report.recommendations.push('Implement proper scrolling within fixed-height panels');
    }
    
    if (this.issues.some(issue => issue.includes('Console error'))) {
      report.recommendations.push('Fix JavaScript console errors');
    }

    // Save report
    const reportPath = path.join(this.screenshotDir, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Test Report Summary:`);
    console.log(`  Total Issues: ${report.totalIssues}`);
    console.log(`  Screenshots: ${this.screenshotDir}`);
    console.log(`  Report: ${reportPath}`);
    
    if (report.totalIssues > 0) {
      console.log('\n🔧 Recommended Fixes:');
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }

    return report;
  }

  async runFullTest() {
    try {
      await this.init();
      
      await this.testHomePage();
      await this.testWorkflowRunner();
      await this.testAuthentication();
      await this.testCreatorsDashboard();
      await this.testResponsiveness();
      await this.testInteractions();
      await this.checkConsoleErrors();
      
      const report = await this.generateReport();
      
      await this.browser.close();
      
      return report;
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      if (this.browser) {
        await this.browser.close();
      }
      throw error;
    }
  }
}

// Export for use
module.exports = ClosedAITestAgent;

// Run if called directly
if (require.main === module) {
  const agent = new ClosedAITestAgent();
  agent.runFullTest()
    .then(report => {
      console.log('\n✅ Test completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
} 
const fs = require('fs');
const path = require('path');

class ClosedAITestAgent {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseURL = 'http://localhost:8080';
    this.screenshotDir = './screenshots';
    this.issues = [];
  }

  async init() {
    // Create screenshots directory
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }

    // Launch browser
    this.browser = await chromium.launch({ 
      headless: false, // Set to true for headless mode
      slowMo: 1000 // Slow down for better observation
    });
    
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🤖 CLOSED AI Test Agent initialized');
  }

  async takeScreenshot(name, description) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}_${name}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    
    await this.page.screenshot({ 
      path: filepath, 
      fullPage: true 
    });
    
    console.log(`📸 Screenshot: ${filename} - ${description}`);
    return filepath;
  }

  async checkElement(selector, description) {
    try {
      const element = await this.page.waitForSelector(selector, { timeout: 5000 });
      if (element) {
        console.log(`✅ Found: ${description}`);
        return true;
      }
    } catch (error) {
      console.log(`❌ Missing: ${description}`);
      this.issues.push(`Missing element: ${description} (${selector})`);
      return false;
    }
  }

  async checkText(text, description) {
    try {
      await this.page.waitForSelector(`text=${text}`, { timeout: 5000 });
      console.log(`✅ Found text: ${description}`);
      return true;
    } catch (error) {
      console.log(`❌ Missing text: ${description}`);
      this.issues.push(`Missing text: ${description}`);
      return false;
    }
  }

  async testHomePage() {
    console.log('\n🏠 Testing Home Page...');
    
    await this.page.goto(this.baseURL);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('01_homepage', 'Homepage initial load');

    // Check header elements
    await this.checkElement('[data-testid="logo"], .logo, text=CLOSED AI', 'CLOSED AI Logo');
    await this.checkElement('nav, [role="navigation"]', 'Navigation menu');
    await this.checkText('Home', 'Home navigation link');
    await this.checkText('Flow Library', 'Flow Library navigation link');
    await this.checkText('Dashboard', 'Dashboard navigation link');
    await this.checkText('Creators', 'Creators navigation link');

    // Check hero section
    await this.checkText('The OS for Workflows', 'Main hero title');
    await this.checkElement('[data-testid="prompt-discovery"], .prompt-discovery', 'Prompt discovery component');
    
    // Check for featured workflows
    await this.checkText('Featured Workflows', 'Featured workflows section');
    await this.checkElement('.workflow-card, [data-testid="workflow-card"]', 'Workflow cards');

    await this.takeScreenshot('02_homepage_full', 'Homepage full content');
  }

  async testWorkflowRunner() {
    console.log('\n⚙️ Testing Workflow Runner...');
    
    // Navigate to keyword clustering workflow
    await this.page.goto(`${this.baseURL}/flows/cluster-keywords`);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('03_workflow_initial', 'Workflow runner initial load');

    // Check workflow header
    await this.checkText('Cluster Keywords', 'Workflow title');
    await this.checkText('Text Analysis', 'Workflow category');
    await this.checkText('Estimated cost:', 'Cost estimation');

    // Check input/output layout
    const inputPanel = await this.checkElement('[data-testid="input-panel"], .input-panel, text=Input', 'Input panel');
    const outputPanel = await this.checkElement('[data-testid="output-panel"], .output-panel, text=Output', 'Output panel');
    
    if (inputPanel && outputPanel) {
      console.log('✅ Input/Output layout found');
    } else {
      this.issues.push('Input/Output panels not properly configured');
    }

    // Check for form elements in input panel
    await this.checkElement('textarea, input[type="text"], .form-field', 'Input form fields');
    await this.checkElement('button[type="submit"], .submit-button, .run-button', 'Submit/Run button');

    await this.takeScreenshot('04_workflow_layout', 'Workflow layout with panels');

    // Try to scroll within panels to test fixed height
    try {
      const inputContainer = await this.page.locator('.input-panel, [data-testid="input-panel"]').first();
      if (await inputContainer.count() > 0) {
        await inputContainer.hover();
        await this.page.mouse.wheel(0, 500);
        await this.takeScreenshot('05_workflow_scrolled', 'Testing scroll within input panel');
      }
    } catch (error) {
      this.issues.push('Input panel scrolling not working properly');
    }
  }

  async testAuthentication() {
    console.log('\n🔐 Testing Authentication...');
    
    await this.page.goto(`${this.baseURL}/auth`);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('06_auth_page', 'Authentication page');

    // Check auth form elements
    await this.checkElement('input[type="email"], [placeholder*="email"]', 'Email input field');
    await this.checkElement('input[type="password"], [placeholder*="password"]', 'Password input field');
    await this.checkElement('button[type="submit"], .login-button, .signin-button', 'Login button');
    
    // Check for sign up option
    await this.checkText('Sign up', 'Sign up option');
    await this.checkText('Create account', 'Create account option');
  }

  async testCreatorsDashboard() {
    console.log('\n📊 Testing Creators Dashboard...');
    
    await this.page.goto(`${this.baseURL}/creators`);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('07_creators_dashboard', 'Creators dashboard');

    // Check dashboard elements
    await this.checkText('Creator Dashboard', 'Dashboard title');
    await this.checkElement('.stats-card, [data-testid="stats-card"]', 'Statistics cards');
    await this.checkElement('.chart, .recharts-wrapper, canvas', 'Analytics charts');
    
    // Check for revenue/earnings displays
    await this.checkText('Total Revenue', 'Revenue display');
    await this.checkText('Total Executions', 'Executions display');
  }

  async testResponsiveness() {
    console.log('\n📱 Testing Responsive Design...');
    
    // Test mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.goto(this.baseURL);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('08_mobile_homepage', 'Homepage on mobile');

    // Test workflow on mobile
    await this.page.goto(`${this.baseURL}/flows/cluster-keywords`);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('09_mobile_workflow', 'Workflow on mobile');

    // Test tablet viewport
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.page.goto(this.baseURL);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('10_tablet_homepage', 'Homepage on tablet');

    // Reset to desktop
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async testInteractions() {
    console.log('\n🖱️ Testing Interactions...');
    
    await this.page.goto(this.baseURL);
    await this.page.waitForLoadState('networkidle');

    // Test navigation
    try {
      await this.page.click('text=Flow Library');
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot('11_flow_library', 'Flow Library page');
    } catch (error) {
      this.issues.push('Navigation to Flow Library failed');
    }

    // Test workflow selection
    try {
      await this.page.click('.workflow-card, [data-testid="workflow-card"]');
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot('12_workflow_selected', 'Workflow selected from library');
    } catch (error) {
      this.issues.push('Workflow selection from library failed');
    }
  }

  async checkConsoleErrors() {
    console.log('\n🐛 Checking Console Errors...');
    
    const errors = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    this.page.on('pageerror', error => {
      errors.push(error.message);
    });

    // Navigate through pages to collect errors
    const pages = [
      this.baseURL,
      `${this.baseURL}/flows`,
      `${this.baseURL}/flows/cluster-keywords`,
      `${this.baseURL}/dashboard`,
      `${this.baseURL}/creators`,
      `${this.baseURL}/auth`
    ];

    for (const url of pages) {
      try {
        await this.page.goto(url);
        await this.page.waitForLoadState('networkidle');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for any async errors
      } catch (error) {
        errors.push(`Navigation error: ${url} - ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.log('❌ Console Errors Found:');
      errors.forEach(error => {
        console.log(`  - ${error}`);
        this.issues.push(`Console error: ${error}`);
      });
    } else {
      console.log('✅ No console errors found');
    }
  }

  async generateReport() {
    console.log('\n📋 Generating Test Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      baseURL: this.baseURL,
      screenshotsDirectory: this.screenshotDir,
      totalIssues: this.issues.length,
      issues: this.issues,
      recommendations: []
    };

    // Add recommendations based on issues
    if (this.issues.some(issue => issue.includes('Input/Output'))) {
      report.recommendations.push('Fix workflow input/output panel layout and content');
    }
    
    if (this.issues.some(issue => issue.includes('scroll'))) {
      report.recommendations.push('Implement proper scrolling within fixed-height panels');
    }
    
    if (this.issues.some(issue => issue.includes('Console error'))) {
      report.recommendations.push('Fix JavaScript console errors');
    }

    // Save report
    const reportPath = path.join(this.screenshotDir, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Test Report Summary:`);
    console.log(`  Total Issues: ${report.totalIssues}`);
    console.log(`  Screenshots: ${this.screenshotDir}`);
    console.log(`  Report: ${reportPath}`);
    
    if (report.totalIssues > 0) {
      console.log('\n🔧 Recommended Fixes:');
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }

    return report;
  }

  async runFullTest() {
    try {
      await this.init();
      
      await this.testHomePage();
      await this.testWorkflowRunner();
      await this.testAuthentication();
      await this.testCreatorsDashboard();
      await this.testResponsiveness();
      await this.testInteractions();
      await this.checkConsoleErrors();
      
      const report = await this.generateReport();
      
      await this.browser.close();
      
      return report;
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      if (this.browser) {
        await this.browser.close();
      }
      throw error;
    }
  }
}

// Export for use
module.exports = ClosedAITestAgent;

// Run if called directly
if (require.main === module) {
  const agent = new ClosedAITestAgent();
  agent.runFullTest()
    .then(report => {
      console.log('\n✅ Test completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
} 
const fs = require('fs');
const path = require('path');

class ClosedAITestAgent {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseURL = 'http://localhost:8080';
    this.screenshotDir = './screenshots';
    this.issues = [];
  }

  async init() {
    // Create screenshots directory
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }

    // Launch browser
    this.browser = await chromium.launch({ 
      headless: false, // Set to true for headless mode
      slowMo: 1000 // Slow down for better observation
    });
    
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🤖 CLOSED AI Test Agent initialized');
  }

  async takeScreenshot(name, description) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}_${name}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    
    await this.page.screenshot({ 
      path: filepath, 
      fullPage: true 
    });
    
    console.log(`📸 Screenshot: ${filename} - ${description}`);
    return filepath;
  }

  async checkElement(selector, description) {
    try {
      const element = await this.page.waitForSelector(selector, { timeout: 5000 });
      if (element) {
        console.log(`✅ Found: ${description}`);
        return true;
      }
    } catch (error) {
      console.log(`❌ Missing: ${description}`);
      this.issues.push(`Missing element: ${description} (${selector})`);
      return false;
    }
  }

  async checkText(text, description) {
    try {
      await this.page.waitForSelector(`text=${text}`, { timeout: 5000 });
      console.log(`✅ Found text: ${description}`);
      return true;
    } catch (error) {
      console.log(`❌ Missing text: ${description}`);
      this.issues.push(`Missing text: ${description}`);
      return false;
    }
  }

  async testHomePage() {
    console.log('\n🏠 Testing Home Page...');
    
    await this.page.goto(this.baseURL);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('01_homepage', 'Homepage initial load');

    // Check header elements
    await this.checkElement('[data-testid="logo"], .logo, text=CLOSED AI', 'CLOSED AI Logo');
    await this.checkElement('nav, [role="navigation"]', 'Navigation menu');
    await this.checkText('Home', 'Home navigation link');
    await this.checkText('Flow Library', 'Flow Library navigation link');
    await this.checkText('Dashboard', 'Dashboard navigation link');
    await this.checkText('Creators', 'Creators navigation link');

    // Check hero section
    await this.checkText('The OS for Workflows', 'Main hero title');
    await this.checkElement('[data-testid="prompt-discovery"], .prompt-discovery', 'Prompt discovery component');
    
    // Check for featured workflows
    await this.checkText('Featured Workflows', 'Featured workflows section');
    await this.checkElement('.workflow-card, [data-testid="workflow-card"]', 'Workflow cards');

    await this.takeScreenshot('02_homepage_full', 'Homepage full content');
  }

  async testWorkflowRunner() {
    console.log('\n⚙️ Testing Workflow Runner...');
    
    // Navigate to keyword clustering workflow
    await this.page.goto(`${this.baseURL}/flows/cluster-keywords`);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('03_workflow_initial', 'Workflow runner initial load');

    // Check workflow header
    await this.checkText('Cluster Keywords', 'Workflow title');
    await this.checkText('Text Analysis', 'Workflow category');
    await this.checkText('Estimated cost:', 'Cost estimation');

    // Check input/output layout
    const inputPanel = await this.checkElement('[data-testid="input-panel"], .input-panel, text=Input', 'Input panel');
    const outputPanel = await this.checkElement('[data-testid="output-panel"], .output-panel, text=Output', 'Output panel');
    
    if (inputPanel && outputPanel) {
      console.log('✅ Input/Output layout found');
    } else {
      this.issues.push('Input/Output panels not properly configured');
    }

    // Check for form elements in input panel
    await this.checkElement('textarea, input[type="text"], .form-field', 'Input form fields');
    await this.checkElement('button[type="submit"], .submit-button, .run-button', 'Submit/Run button');

    await this.takeScreenshot('04_workflow_layout', 'Workflow layout with panels');

    // Try to scroll within panels to test fixed height
    try {
      const inputContainer = await this.page.locator('.input-panel, [data-testid="input-panel"]').first();
      if (await inputContainer.count() > 0) {
        await inputContainer.hover();
        await this.page.mouse.wheel(0, 500);
        await this.takeScreenshot('05_workflow_scrolled', 'Testing scroll within input panel');
      }
    } catch (error) {
      this.issues.push('Input panel scrolling not working properly');
    }
  }

  async testAuthentication() {
    console.log('\n🔐 Testing Authentication...');
    
    await this.page.goto(`${this.baseURL}/auth`);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('06_auth_page', 'Authentication page');

    // Check auth form elements
    await this.checkElement('input[type="email"], [placeholder*="email"]', 'Email input field');
    await this.checkElement('input[type="password"], [placeholder*="password"]', 'Password input field');
    await this.checkElement('button[type="submit"], .login-button, .signin-button', 'Login button');
    
    // Check for sign up option
    await this.checkText('Sign up', 'Sign up option');
    await this.checkText('Create account', 'Create account option');
  }

  async testCreatorsDashboard() {
    console.log('\n📊 Testing Creators Dashboard...');
    
    await this.page.goto(`${this.baseURL}/creators`);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('07_creators_dashboard', 'Creators dashboard');

    // Check dashboard elements
    await this.checkText('Creator Dashboard', 'Dashboard title');
    await this.checkElement('.stats-card, [data-testid="stats-card"]', 'Statistics cards');
    await this.checkElement('.chart, .recharts-wrapper, canvas', 'Analytics charts');
    
    // Check for revenue/earnings displays
    await this.checkText('Total Revenue', 'Revenue display');
    await this.checkText('Total Executions', 'Executions display');
  }

  async testResponsiveness() {
    console.log('\n📱 Testing Responsive Design...');
    
    // Test mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.goto(this.baseURL);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('08_mobile_homepage', 'Homepage on mobile');

    // Test workflow on mobile
    await this.page.goto(`${this.baseURL}/flows/cluster-keywords`);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('09_mobile_workflow', 'Workflow on mobile');

    // Test tablet viewport
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.page.goto(this.baseURL);
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('10_tablet_homepage', 'Homepage on tablet');

    // Reset to desktop
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async testInteractions() {
    console.log('\n🖱️ Testing Interactions...');
    
    await this.page.goto(this.baseURL);
    await this.page.waitForLoadState('networkidle');

    // Test navigation
    try {
      await this.page.click('text=Flow Library');
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot('11_flow_library', 'Flow Library page');
    } catch (error) {
      this.issues.push('Navigation to Flow Library failed');
    }

    // Test workflow selection
    try {
      await this.page.click('.workflow-card, [data-testid="workflow-card"]');
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot('12_workflow_selected', 'Workflow selected from library');
    } catch (error) {
      this.issues.push('Workflow selection from library failed');
    }
  }

  async checkConsoleErrors() {
    console.log('\n🐛 Checking Console Errors...');
    
    const errors = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    this.page.on('pageerror', error => {
      errors.push(error.message);
    });

    // Navigate through pages to collect errors
    const pages = [
      this.baseURL,
      `${this.baseURL}/flows`,
      `${this.baseURL}/flows/cluster-keywords`,
      `${this.baseURL}/dashboard`,
      `${this.baseURL}/creators`,
      `${this.baseURL}/auth`
    ];

    for (const url of pages) {
      try {
        await this.page.goto(url);
        await this.page.waitForLoadState('networkidle');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for any async errors
      } catch (error) {
        errors.push(`Navigation error: ${url} - ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.log('❌ Console Errors Found:');
      errors.forEach(error => {
        console.log(`  - ${error}`);
        this.issues.push(`Console error: ${error}`);
      });
    } else {
      console.log('✅ No console errors found');
    }
  }

  async generateReport() {
    console.log('\n📋 Generating Test Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      baseURL: this.baseURL,
      screenshotsDirectory: this.screenshotDir,
      totalIssues: this.issues.length,
      issues: this.issues,
      recommendations: []
    };

    // Add recommendations based on issues
    if (this.issues.some(issue => issue.includes('Input/Output'))) {
      report.recommendations.push('Fix workflow input/output panel layout and content');
    }
    
    if (this.issues.some(issue => issue.includes('scroll'))) {
      report.recommendations.push('Implement proper scrolling within fixed-height panels');
    }
    
    if (this.issues.some(issue => issue.includes('Console error'))) {
      report.recommendations.push('Fix JavaScript console errors');
    }

    // Save report
    const reportPath = path.join(this.screenshotDir, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Test Report Summary:`);
    console.log(`  Total Issues: ${report.totalIssues}`);
    console.log(`  Screenshots: ${this.screenshotDir}`);
    console.log(`  Report: ${reportPath}`);
    
    if (report.totalIssues > 0) {
      console.log('\n🔧 Recommended Fixes:');
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }

    return report;
  }

  async runFullTest() {
    try {
      await this.init();
      
      await this.testHomePage();
      await this.testWorkflowRunner();
      await this.testAuthentication();
      await this.testCreatorsDashboard();
      await this.testResponsiveness();
      await this.testInteractions();
      await this.checkConsoleErrors();
      
      const report = await this.generateReport();
      
      await this.browser.close();
      
      return report;
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      if (this.browser) {
        await this.browser.close();
      }
      throw error;
    }
  }
}

// Export for use
module.exports = ClosedAITestAgent;

// Run if called directly
if (require.main === module) {
  const agent = new ClosedAITestAgent();
  agent.runFullTest()
    .then(report => {
      console.log('\n✅ Test completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
} 
 
 
 
 