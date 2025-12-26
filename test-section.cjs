const { chromium } = require('playwright');

(async () => {
  console.log('Testing Smart Meal Planning section specifically...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('https://t7vt8at0pcxo.space.minimax.io', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    console.log('Page title:', await page.title());
    
    // Find the Smart Meal Planning section by looking for the heading
    const heading = await page.locator('h2:has-text("Smart Meal Planning")').first();
    
    if (await heading.count() > 0) {
      console.log('\n✓ Smart Meal Planning heading found');
      
      // Get the parent container
      const container = await heading.locator('..').locator('..').locator('..');
      if (await container.count() > 0) {
        console.log('\nContainer HTML (full Smart Meal Planning section):');
        const html = await container.innerHTML();
        console.log(html);
        
        // Check if buttons are present in the HTML
        const hasPlanFromPantry = html.includes('Plan from Available Foods');
        const hasGenerateSuggestions = html.includes('Generate Suggestions');
        
        console.log('\n=== Button Check ===');
        console.log('Has "Plan from Available Foods" text:', hasPlanFromPantry);
        console.log('Has "Generate Suggestions" text:', hasGenerateSuggestions);
        
        // Count buttons in this container
        const buttons = await container.locator('button').all();
        console.log('Number of buttons in container:', buttons.length);
        
        // Get button texts
        for (let i = 0; i < buttons.length; i++) {
          const text = await buttons[i].textContent().catch(() => 'N/A');
          console.log(`Button ${i + 1}: "${text.trim()}"`);
        }
      }
    } else {
      console.log('✗ Smart Meal Planning heading NOT found');
    }
    
    // Check localStorage
    console.log('\n=== Checking localStorage ===');
    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
    
    console.log('localStorage keys:', Object.keys(localStorageData));
    if (localStorageData['meal-plans']) {
      console.log('meal-plans data exists:', localStorageData['meal-plans'].substring(0, 200));
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
