import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculate, newQuote, validate, units, legacyUnits } from './quote';

test('4-week 50% offer reconciles itemized charges and tax', () => {
  const q = { ...newQuote(), rate: 200 };
  const c = calculate(q);
  assert.equal(c.subtotal, 153.89);
  assert.equal(c.tax, 20.01);
  assert.equal(c.total, 173.90);
  assert.equal(c.recurring, 242.89);
});
test('75% discount covers two cycles; insurance remains undiscounted', () => {
  const c = calculate({ ...newQuote(), rate: 428, cycles: 2, discount: 75 });
  assert.equal(c.rent, 856);
  assert.equal(c.discount, 642);
  assert.equal(c.insurance, 29.90);
  assert.equal(c.total, 319.61);
});
test('waived fees, multiple units and moving are calculated independently', () => {
  const c = calculate({ ...newQuote(), rate: 100, quantity: 2, cycles: 3, discount: 50, insurance: 0, admin: 0, locks: 0, moving: 500 });
  assert.equal(c.total, 904);
  assert.equal(c.recurring, 226);
});
test('validation rejects missing customers and invalid financial inputs', () => {
  assert.ok(validate(newQuote()).includes('Enter a customer name.'));
  assert.equal(validate({ ...newQuote(), customer: 'Test Customer' }).length, 0);
  assert.ok(validate({ ...newQuote(), customer: 'Test', discount: 101, cycles: 1.5, rate: -5 }).length >= 3);
});
test('workbook rate sources stay distinct', () => {
  assert.equal(units.find(u => u.floor === 'Ground' && u.size === '5x5')?.rate, 113);
  assert.equal(legacyUnits.find(u => u.size === '5x5')?.rate, 119);
  assert.ok(units.every(u => Number.isFinite(u.rate) && u.rate > 0));
});
