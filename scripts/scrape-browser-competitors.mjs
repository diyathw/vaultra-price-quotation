import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../src/competitor-rates.json', import.meta.url);
const snapshot = JSON.parse(await readFile(file, 'utf8'));
const browser = await chromium.launch({ headless: true });
let updated = 0;
try {
  const access = snapshot.facilities.find(facility => facility.id === 'access');
  const page = await browser.newPage();
  try {
    await page.goto(access.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.getByText('Featured Units', { exact: true }).first().waitFor({ timeout: 15000 });
    const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    const found = new Map();
    const pattern = /(5|10)[’']\s*x\s*(5|10)[’']\s+Climate Controlled[\s\S]{0,100}?\$\d+(?:\.\d{2})?\s*\$(\d+(?:\.\d{2})?)\s*\/\s*wk/gi;
    for (const match of body.matchAll(pattern)) {
      const size = `${match[1]}x${match[2]}`;
      const price = Number(match[3]);
      if (!['5x5', '5x10', '10x10'].includes(size) || !Number.isFinite(price) || price <= 0 || price > 1000) continue;
      if (!found.has(size) || price < found.get(size).price) found.set(size, { size, price, period: 'week', details: 'Advertised weekly rate · climate controlled · confirm promotion and fees' });
    }
    if (found.size) {
      access.rates = [...found.values()];
      access.checkedAt = new Date().toISOString().slice(0, 10);
      updated++;
      console.log(`Access Storage: ${found.size} exact-size rates`);
    } else console.warn('Access Storage: no validated exact-size rates; retaining previous snapshot');
  } catch (error) { console.warn(`Access Storage: ${error.message}; retaining previous snapshot`); }
  finally { await page.close(); }
} finally { await browser.close(); }
if (updated) { snapshot.checkedAt = new Date().toISOString().slice(0, 10); await writeFile(file, `${JSON.stringify(snapshot, null, 2)}\n`); }
