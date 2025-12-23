import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Listen for page errors
  page.on('pageerror', err => {
    errors.push(err.message);
  });
  
  try {
    // Navigate to the app
    await page.goto(`file://${process.cwd()}/dist/index.html`, { waitUntil: 'networkidle' });
    
    // Wait for the app to load
    await page.waitForSelector('header', { timeout: 10000 });
    
    // Check if main components are present
    const header = await page.$('header');
    const dashboard = await page.$('.bg-white.rounded-2xl');
    const mealInput = await page.$('textarea');
    const settingsButton = await page.$('button:has-text("Settings")');
    
    console.log('Page loaded successfully!');
    console.log('Header present:', !!header);
    console.log('Dashboard present:', !!dashboard);
    console.log('Meal input present:', !!mealInput);
    console.log('Settings button present:', !!settingsButton);
    
    // Check for console errors
    if (errors.length > 0) {
      console.log('\nConsole errors found:');
      errors.forEach(err => console.log('  -', err));
    } else {
      console.log('\nNo console errors found!');
    }
    
    console.log('\nTest completed successfully!');
    
  } catch (err) {
    console.error('Test failed:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
