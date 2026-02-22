const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Mock Supabase and other elements to avoid errors
  await page.addInitScript(() => {
    window.supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [{
              id: 1,
              title: 'La Ilustracion Sacra',
              type: 'image',
              file_path: 'https://placehold.co/600x400?text=Medieval+Image',
              description: 'Aqui se muestra el emblema de nuestra orden, tratado con las artes del grabado antiguo para preservar su mistica.'
            }], error: null })
          })
        })
      })
    };

    // Add dummy dragHint if it's expected by other scripts
    document.addEventListener('DOMContentLoaded', () => {
      if (!document.getElementById('dragHint')) {
        const hint = document.createElement('div');
        hint.id = 'dragHint';
        document.body.appendChild(hint);
      }
    });
  });

  const url = 'file://' + path.resolve('docs/manual.html');
  await page.goto(url);

  // Wait for the renderer to apply the logic
  await page.waitForTimeout(2000);

  // Force selection of the mock item
  await page.evaluate(() => {
    const item = {
      id: 1,
      title: 'La Ilustracion Sacra',
      type: 'image',
      file_path: 'https://placehold.co/600x400?text=Medieval+Image',
      description: 'Aqui se muestra el emblema de nuestra orden, tratado con las artes del grabado antiguo para preservar su mistica.'
    };
    window.selectItem(item);
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'manual_medieval_verify.png' });

  await browser.close();
})();
