const { chromium } = require('playwright');

(async () => {
  console.log('Testing API key storage and settings loading...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('https://t7vt8at0pcxo.space.minimax.io', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('\n=== Initial localStorage (should be empty) ===');
    const initialStorage = await page.evaluate(() => Object.keys(localStorage));
    console.log('Keys:', initialStorage);
    
    console.log('\n=== Simulating API key addition ===');
    await page.evaluate(() => {
      const testApiKey = 'sk-test123456789';
      const settings = {
        dailyCalorieGoal: 2000,
        apiKey: testApiKey,
        proteinGoal_g: 150,
        carbsGoal_g: 250,
        fatGoal_g: 65,
        age: 30,
        weight: 70,
        height: 175,
        activityLevel: 'moderately_active',
        goal: 'maintain',
        dietaryPreferences: []
      };
      localStorage.setItem('nutriai_settings', JSON.stringify(settings));
      console.log('API key saved to localStorage');
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n=== After adding API key ===');
    const savedStorage = await page.evaluate(() => Object.keys(localStorage));
    console.log('localStorage keys:', savedStorage);
    
    const savedSettings = await page.evaluate(() => {
      const settings = JSON.parse(localStorage.getItem('nutriai_settings') || '{}');
      return {
        hasApiKey: !!settings.apiKey,
        apiKeyLength: settings.apiKey ? settings.apiKey.length : 0,
        apiKeyPreview: settings.apiKey ? settings.apiKey.substring(0, 8) + '...' : 'NONE'
      };
    });
    console.log('Settings check:', JSON.stringify(savedSettings));
    
    // Now check if the buttons are visible
    console.log('\n=== Checking for meal planning buttons ===');
    const pantryButton = await page.locator('button:has-text("Plan from Available Foods")').first();
    const pantryVisible = await pantryButton.isVisible().catch(() => false);
    console.log('Pantry button visible:', pantryVisible);
    
    const aiButton = await page.locator('button:has-text("Generate Suggestions")').first();
    const aiVisible = await aiButton.isVisible().catch(() => false);
    console.log('AI Suggestions button visible:', aiVisible);
    
    // Check what's actually in the Smart Meal Planning section
    console.log('\n=== Smart Meal Planning Section Content ===');
    const mealPlanningSection = await page.evaluate(() => {
      const section = document.querySelector('h2:has-text("Smart Meal Planning")');
      if (section) {
        const parent = section.closest('.bg-white');
        if (parent) {
          return parent.innerHTML;
        }
      }
      return 'Section not found';
    });
    
    if (mealPlanningSection.includes('Please set your OpenAI API key')) {
      console.log('RESULT: Still showing "No API key" message despite settings having apiKey');
      console.log('This indicates a REACT STATE or COMPONENT issue');
    } else if (mealPlanningSection.includes('Plan from Available Foods')) {
      console.log('RESULT: Buttons are present! They should be clickable now.');
    } else {
      console.log('RESULT: Unknown state in Smart Meal Planning section');
    }
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
