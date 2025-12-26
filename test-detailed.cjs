const { chromium } = require('playwright');

(async () => {
  console.log('Starting detailed Playwright test...');
  
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
    console.log('Loading page...');
    await page.goto('https://t7vt8at0pcxo.space.minimax.io', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    console.log('Page title:', await page.title());
    
    // Check if main content area exists
    const mainContent = await page.locator('main').first();
    const mainExists = await mainContent.count() > 0;
    console.log('\nMain content exists:', mainExists);
    
    if (mainExists) {
      console.log('Main HTML:', (await mainContent.innerHTML()).substring(0, 500));
    }
    
    // Look for ANY button on the page
    console.log('\n=== All buttons on page ===');
    const allButtons = await page.locator('button').all();
    console.log('Total buttons found:', allButtons.length);
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent().catch(() => 'N/A');
      const visible = await allButtons[i].isVisible().catch(() => false);
      console.log(`Button ${i + 1}: "${text.substring(0, 50)}..." - Visible: ${visible}`);
    }
    
    // Check for Smart Meal Planning heading
    console.log('\n=== Smart Meal Planning Section ===');
    const mealPlanningSection = await page.locator('text=Smart Meal Planning').first();
    const sectionExists = await mealPlanningSection.count() > 0;
    console.log('Smart Meal Planning heading found:', sectionExists);
    
    if (sectionExists) {
      // Get parent element to see what around it
      const parent = await mealPlanningSection.locator('..').first();
      console.log('Parent HTML snippet:', (await parent.innerHTML()).substring(0, 800));
    }
    
    // Check for calorie dashboard (should be visible)
    console.log('\n=== Calorie Dashboard ===');
    const dashboard = await page.locator('text=Daily Progress').first();
    const dashboardVisible = await dashboard.count() > 0;
    console.log('Calorie dashboard visible:', dashboardVisible);
    
    // Check for today's meals
    console.log('\n=== Today\'s Meals Section ===');
    const todayMeals = await page.locator('text=Today\'s Meals').first();
    const todayMealsVisible = await todayMeals.count() > 0;
    console.log('Today\'s Meals visible:', todayMealsVisible);
    
    // Check console for errors
    console.log('\n=== Console Errors ===');
    const errorMessages = consoleMessages.filter(msg => msg.type === 'error');
    if (errorMessages.length === 0) {
      console.log('No console errors');
    } else {
      errorMessages.forEach(msg => console.log('ERROR:', msg.text));
    }
    
    // Check for JS errors
    console.log('\n=== Page Errors ===');
    if (errors.length === 0) {
      console.log('No page errors');
    } else {
      errors.forEach(err => console.log('PAGE ERROR:', err));
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
