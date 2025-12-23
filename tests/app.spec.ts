import { test, expect } from '@playwright/test';

test('NutriAI app loads correctly', async ({ page }) => {
  // Listen for console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
  });

  // Navigate to the app
  await page.goto(`file://${process.cwd()}/dist/index.html`);
  
  // Wait for the app to load
  await page.waitForSelector('header', { timeout: 10000 });
  
  // Check if main components are present
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('textarea')).toBeVisible();
  await expect(page.locator('button:has-text("Settings")')).toBeVisible();
  
  // Log results
  console.log('Page loaded successfully!');
  console.log('Header present: true');
  console.log('Meal input present: true');
  console.log('Settings button present: true');
  
  // Check for console errors
  if (errors.length > 0) {
    console.log('\nConsole errors found:');
    errors.forEach(err => console.log('  -', err));
  } else {
    console.log('\nNo console errors found!');
  }
  
  console.log('\nTest completed successfully!');
});
