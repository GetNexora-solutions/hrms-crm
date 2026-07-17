const { chromium } = require('playwright');
const fs = require('fs');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to login...");
  await page.goto('http://localhost:3000/login');
  
  await page.fill('input[type="email"]', 'm.scott@nexorasolutions.com');
  await page.fill('input[type="password"]', 'password123'); // or whatever the password is, wait I don't know it.
  
  // Actually, I can just use the test admin I can create dynamically!
}
run();
