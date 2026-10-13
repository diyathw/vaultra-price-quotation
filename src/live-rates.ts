import { round, type Quote } from './quote';

export const RATE_ENDPOINT = 'https://cdn.akiba.ca/customer/api/v1/units/4';
export interface LiveRate {
  id: string; size: string; type: string; regular: number; available: number;
  promotion: string; promotional: number | null; discount: number; cycles: number; needsReview: boolean;
}
type Obj = Record<string, unknown>;
const object = (v: unknown): Obj => v !== null && typeof v === 'object' && !Array.isArray(v) ? v as Obj : {};
function price(value: unknown): number {
  if ((typeof value !== 'string' && typeof value !== 'number') || value === '') throw new Error('Missing rate');
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error('Invalid rate');
  return round(n);
}
export function parseRates(payload: unknown): LiveRate[] {
  const data = object(payload);
  if (data.billing_cycle_label !== 'Every Four Weeks') throw new Error('The rate source billing period has changed. Enter rates manually.');
  if (data.insurance_included_in_price !== 0 && data.insurance_included_in_price !== false) throw new Error('Insurance pricing has changed. Enter rates manually.');
  const rates: LiveRate[] = [];
  for (const group of Object.values(object(data.sizes))) {
    if (!Array.isArray(group)) throw new Error('Unexpected rate format');
    for (const item of group) {
      const unit = object(item);
      if (typeof unit.dimensions !== 'string' || !Array.isArray(unit.types)) throw new Error('Unexpected unit format');
      for (const itemType of unit.types) {
        const type = object(itemType);
        if (typeof type.unit_type !== 'string' || !['number', 'string'].includes(typeof type.id)) throw new Error('Missing unit type');
        const regular = price(object(type.regular_pricing).monthly);
        const available = Number(type.unit_type_available);
        if (regular <= 0 || !Number.isInteger(available) || available < 0) throw new Error('Invalid availability or rate');
        const promo = data.is_discount_enabled ? object(type.promotion) : {};
        const promotion = typeof promo.name === 'string' ? promo.name : '';
        const promotional = promotion ? price(object(promo.pricing).monthly) : null;
        const match = promotion.match(/^(\d+(?:\.\d+)?)%\s+Off\s+(\d+)\s+Weeks$/i);
        const percentage = match ? Number(match[1]) : 0;
        const weeks = match ? Number(match[2]) : 0;
        const recognized = !!match && percentage > 0 && percentage <= 100 && weeks > 0 && weeks % 4 === 0 && Math.abs(round(regular * (1 - percentage / 100)) - (promotional ?? regular)) < 0.011;
        rates.push({ id: `live-${unit.dimensions}-${type.id}`, size: unit.dimensions.replaceAll(' ', ''), type: type.unit_type, regular, available, promotion, promotional, discount: recognized ? percentage : 0, cycles: recognized ? weeks / 4 : 1, needsReview: !!promotion && !recognized });
      }
    }
  }
  if (!rates.length || new Set(rates.map(r => r.id)).size !== rates.length) throw new Error('The rate source returned no rates or duplicate units.');
  return rates.sort((a, b) => a.regular - b.regular);
}
export async function fetchRates(): Promise<LiveRate[]> {
  const response = await fetch(RATE_ENDPOINT, { headers: { 'X-Tenant': 'reservations.vaultrastorage.ca' }, credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Rate service returned ${response.status}.`);
  return parseRates(await response.json());
}
export function applyLiveRate(rate: LiveRate, fetchedAt: string): Partial<Quote> {
  if (rate.available < 1) throw new Error('This unit type is unavailable.');
  return { unitId: rate.id, size: rate.size, rate: rate.regular, rateSource: `Online rate · ${rate.type} · checked ${new Date(fetchedAt).toLocaleString()}`, preset: 'custom', cycles: rate.cycles, discount: rate.discount };
}
