const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.setViewport({width:1366, height:768});
  await page.goto('http://localhost:8000', {waitUntil: 'networkidle2'});
  await page.screenshot({path: 'screenshot-homepage-1366x768.png', fullPage: false});

  await page.setViewport({width:1200, height:900});
  await page.screenshot({path: 'screenshot-homepage-1200x900.png'});

  await page.setViewport({width:390, height:844});
  await page.screenshot({path: 'screenshot-homepage-mobile-390x844.png'});

  await browser.close();
  console.log('Screenshots saved.');
})();
