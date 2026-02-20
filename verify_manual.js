const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Test Admin page
  console.log('Testing Admin Manual...');
  await page.goto('file://' + path.resolve('docs/adminManual.html'));
  await page.waitForSelector('.drop-zone');
  const dropZoneExists = await page.evaluate(() => !!document.querySelector('.drop-zone'));
  console.log('Drop zone exists:', dropZoneExists);

  const titleExists = await page.evaluate(() => !!document.querySelector('#title'));
  console.log('Title input exists:', titleExists);

  // Take screenshot of admin
  await page.screenshot({ path: 'screenshot_admin_manual.png' });

  // Test Manual page
  console.log('Testing Manual Viewer...');
  await page.goto('file://' + path.resolve('docs/manual.html'));
  await page.waitForSelector('#indexer-panel');
  const indexerExists = await page.evaluate(() => !!document.querySelector('#indexer-panel'));
  console.log('Indexer panel exists:', indexerExists);

  // Take screenshot of manual
  await page.screenshot({ path: 'screenshot_manual_viewer.png' });

  await browser.close();
})();
