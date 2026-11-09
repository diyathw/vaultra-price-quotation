import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../src/competitor-rates.json', import.meta.url);
const snapshot = JSON.parse(await readFile(file, 'utf8'));
const textOf = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/gi, "'").replace(/&mdash;/g, '—').replace(/\s+/g, ' ');
const valid = n => Number.isFinite(n) && n > 0 && n < 10000;
const today = new Date().toISOString().slice(0, 10);
let updated = 0;
for (const facility of snapshot.facilities) {
  try {
    const response = await fetch(facility.url, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VaultraPriceReport/1.0)' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = textOf(await response.text());
    const rates = [];
    if (facility.id === 'storagemart') {
      for (const [size, expression] of [
        ['5x5', /5'w\s*X\s*5'd[\s\S]{0,250}?\$(\d+(?:\.\d{2})?)\s*\/mo\s*\$(\d+(?:\.\d{2})?)\s*\/mo/i],
        ['5x10', /5'w\s*X\s*10'd[\s\S]{0,250}?\$(\d+(?:\.\d{2})?)\s*\/mo\s*\$(\d+(?:\.\d{2})?)\s*\/mo/i],
      ]) {
        const match = body.match(expression);
        if (match) { const regular = Number(match[1]), price = Number(match[2]); if (valid(price) && valid(regular) && price <= regular) rates.push({ size, price, regular, period: 'month', details: 'Advertised monthly rate; verify promotion and unit features' }); }
      }
    }
    if (facility.id === 'smartstop') {
      for (const size of ['5x5', '10x10']) {
        const [width, depth] = size.split('x');
        const match = body.match(new RegExp(`${width}'\\s*x\\s*${depth}'[\\s\\S]{0,50}?\\$(\\d+(?:\\.\\d{2})?)\\s*\\/mo`, 'i'));
        if (match && valid(Number(match[1]))) rates.push({ size, price: Number(match[1]), period: 'month', details: 'Advertised special offer; verify promotion and unit features' });
      }
    }
    if (rates.length) { facility.rates = rates; facility.checkedAt = today; updated++; console.log(`${facility.name}: ${rates.length} exact-size rates`); }
    else console.log(`${facility.name}: no validated exact-size rates; retaining previous snapshot`);
  } catch (error) { console.warn(`${facility.name}: ${error.message}; retaining previous snapshot`); }
}
if (updated) { snapshot.checkedAt = today; await writeFile(file, `${JSON.stringify(snapshot, null, 2)}\n`); }
console.log(`Updated ${updated} facilities`);
