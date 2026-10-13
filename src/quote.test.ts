import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculate, newQuote, validate, units, legacyUnits } from './quote';
import { parseRates, applyLiveRate } from './live-rates';
import { binPackages, movingExtras, movingRateFor } from './moving-rates';

test('moving service rates include regular, promotion, premium and extras', () => {
  assert.equal(movingRateFor('10 x 10', 'base'), 650);
  assert.equal(movingRateFor('10x10', 'promotion'), 750);
  assert.equal(movingRateFor('10x10', 'premium'), 750);
  assert.equal(movingRateFor('10 × 30 Pre ft', 'base'), 3000);
  assert.equal(movingRateFor('5x5 ft', 'base'), 300);
  assert.equal(movingRateFor('unknown', 'base'), null);
  assert.equal(movingExtras.stairs, 125);
  assert.equal(binPackages[4].cycle, 60);
});

const liveFixture = (promotion: unknown = { name: '50% Off 8 Weeks', pricing: { monthly: '21.00' } }) => ({ billing_cycle_label: 'Every Four Weeks', insurance_included_in_price: 0, is_discount_enabled: true, sizes: { small: [{ dimensions: '5 x 5', types: [{ id: 21, unit_type: 'Upper Floor Climate Control', regular_pricing: { monthly: '42.00' }, unit_type_available: 17, promotion }] }] } });

test('live rate preserves unit type and applies promotion exactly once', () => {
  const rate = parseRates(liveFixture())[0];
  const q = { ...newQuote(), ...applyLiveRate(rate, '2026-10-12T12:00:00Z') };
  assert.equal(q.rate, 42);
  assert.equal(q.floor, newQuote().floor);
  assert.equal(q.cycles, 2);
  assert.equal(q.discount, 50);
  assert.equal(q.liveType, 'Upper Floor Climate Control');
  assert.equal(q.liveAvailable, 17);
  assert.equal(q.livePromotion, '50% Off 8 Weeks');
  assert.equal(q.liveAdvertisedRate, 21);
  assert.equal(calculate(q).rent - calculate(q).discount, 42);
  assert.equal(calculate(q).recurring, 64.35);
});
test('unrecognized or inconsistent promotions use regular rent for manual review', () => {
  for (const promo of [{ name: 'Free Move In', pricing: { monthly: '42' } }, { name: '50% Off 8 Weeks', pricing: { monthly: '30' } }]) {
    const r = parseRates(liveFixture(promo))[0];
    assert.equal(r.needsReview, true);
    assert.equal(r.discount, 0);
    assert.equal(r.cycles, 1);
  }
  assert.equal(parseRates(liveFixture(null))[0].needsReview, false);
});
test('live source rejects changed billing, malformed data and unavailable selections', () => {
  assert.throws(() => parseRates({ ...liveFixture(), billing_cycle_label: 'Monthly' }));
  assert.throws(() => parseRates({ ...liveFixture(), insurance_included_in_price: 1 }));
  assert.throws(() => parseRates({ sizes: {} }));
  const r = parseRates(liveFixture())[0];
  assert.throws(() => applyLiveRate({ ...r, available: 0 }, new Date().toISOString()));
});

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
test('standalone bin rental excludes storage charges', () => {
  const q = { ...newQuote(), binOnly: true, binPackage: 25, binCycles: 2 };
  const c = calculate(q);
  assert.equal(c.rent, 0);
  assert.equal(c.insurance, 0);
  assert.equal(c.subtotal, 50);
  assert.equal(c.recurring, 25);
  assert.equal(validate({ ...q, customer: 'Bin customer' }).length, 0);
  assert.ok(validate({ ...q, customer: 'Bin customer', binPackage: 0 }).some(e => e.includes('bin rental package')));
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
