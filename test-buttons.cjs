const { chromium } = require('playwright');

(async () => {
  console.log('Starting Playwright test...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  
  // Collect errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  try {
    console.log('Loading page: https://t7vt8at0pcxo.space.minimax.io');
    await page.goto('https://t7vt8at0pcxo.space.minimax.io', { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('Page loaded, waiting for content...');
    await page.waitForTimeout(2000);
    
    // Check if page loaded
    const title = await page.title();
    console.log('Page title:', title);
    
    // Look for buttons
    console.log('\n=== Checking for buttons ===');
    
    // Try to find the pantry button by text
    const pantryButton = await page.locator('button:has-text("Plan from Available Foods")').first();
    const pantryButtonExists = await pantryButton.count() > 0;
    console.log('Pantry button found:', pantryButtonExists);
    
    if (pantryButtonExists) {
      console.log('Pantry button HTML:', await pantryButton.innerHTML());
      console.log('Pantry button visible:', await pantryButton.isVisible());
      console.log('Pantry button enabled:', await pantryButton.isEnabled());
      
      // Try clicking it
      console.log('\n=== Clicking pantry button ===');
      await pantryButton.click({ timeout: 5000 }).catch(e => console.log('Click error:', e.message));
      await page.waitForTimeout(1000);
      
      // Check for modal
      const modal = await page.locator('text=What foods do you have available').first();
      const modalVisible = await modal.count() > 0 && await modal.isVisible().catch(() => false);
      console.log('Modal visible after click:', modalVisible);
    }
    
    // Try to find the AI suggestions button
    console.log('\n=== Checking AI suggestions button ===');
    const aiButton = await page.locator('button:has-text("Generate Suggestions")').first();
    const aiButtonExists = await aiButton.count() > 0;
    console.log('AI button found:', aiButtonExists);
    
    if (aiButtonExists) {
      console.log('AI button HTML:', await aiButton.innerHTML());
      console.log('AI button visible:', await aiButton.isVisible());
      console.log('AI button enabled:', await aiButton.isEnabled());
    }
    
    // Check for console errors
    console.log('\n=== Console Messages ===');
    consoleMessages.forEach(msg => {
      if (msg.type === 'error' || msg.text.includes('ERROR') || msg.text.includes('Error') || msg.text.includes('error')) {
        console.log(`[${msg.type}] ${msg.text}`);
      }
    });
    
    console.log('\n=== JavaScript Errors ===');
    if (errors.length === 0) {
      console.log('No JavaScript errors detected');
    } else {
      errors.forEach(err => console.log('ERROR:', err));
    }
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
