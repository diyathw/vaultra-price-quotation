import source from './workbook-source.json';

export const location = { name: 'Markham · McCowan', address: '8623 McCowan Road, Unionville, ON L3P 4H1', phone: '647-249-8606', email: 'Markham-McCowan@vaultra.ca', url: 'https://www.vaultrastorage.ca/markham/8623-mccowan-road/' };
export const floors = ['Ground', 'Second floor', 'Third floor', 'Fourth floor', 'Fifth floor', 'Sixth floor'];
export interface Unit { id: string; floor: string; size: string; rate: number; source: string }
const whole = source.find(s => s.name === 'Whole')!.cells as unknown as Record<string, { value: string }>;
const data = source.find(s => s.name === 'Data')!.cells as unknown as Record<string, { value: string }>;
export const units: Unit[] = [['C', 'D'], ['F', 'G'], ['I', 'J'], ['L', 'M']].flatMap(([sizeCol, rateCol], floor) =>
  Array.from({ length: 21 }, (_, i) => i + 5).filter(r => whole[sizeCol + r] && whole[rateCol + r]).map(r => ({ id: `whole-${floor}-${r}`, floor: floors[floor], size: whole[sizeCol + r].value.trim(), rate: Number(whole[rateCol + r].value), source: `Whole!${rateCol}${r}` })));
export const legacyUnits: Unit[] = Array.from({ length: 20 }, (_, i) => i + 3).map(r => ({ id: `data-${r}`, floor: 'Ground', size: data['D' + r].value.trim().replaceAll(' ', ''), rate: Number(data['E' + r].value), source: `Data!E${r}` }));
export interface Preset { id: string; label: string; cycles: number; discount: number; moving: number; lockDiscount?: number; locks?: number; note?: string }
export const presets: Preset[] = [
  { id: 'regular', label: 'Regular rate · 4 weeks', cycles: 1, discount: 0, moving: 0 },
  { id: '4weeks', label: '50% off · 4 weeks', cycles: 1, discount: 50, moving: 0 },
  { id: '8weeks', label: '50% off · 8 weeks', cycles: 2, discount: 50, moving: 0 },
  { id: '12weeks', label: '50% off · 12 weeks', cycles: 3, discount: 50, moving: 0 },
  { id: '75off', label: '75% off · 8 weeks', cycles: 2, discount: 75, moving: 0 },
  { id: 'lock', label: '50% off · 12 weeks + lock discount', cycles: 3, discount: 50, moving: 0, locks: 2, lockDiscount: 20, note: 'The “Lock 70% off” sheet calculates a 20% lock discount. This preset follows its formulas.' },
  { id: 'annual', label: '10% off · 52 weeks', cycles: 13, discount: 10, moving: 0, note: 'The “10% off” sheet calculates 10% off across 13 cycles; its 5% label is inconsistent.' },
  { id: 'moving', label: 'Regular rate + moving', cycles: 1, discount: 0, moving: 790 },
  { id: 'free-moving', label: 'Moving offer · 20 weeks', cycles: 5, discount: 0, moving: 39.99, note: 'The “Free Moving” sheet charges 5 cycles and a $39.99 moving fee despite its 12-week label. Confirm eligibility and fees.' },
  { id: '4moving', label: '50% off · 4 weeks + moving', cycles: 1, discount: 50, moving: 790 },
  { id: '8moving', label: '50% off · 8 weeks + moving', cycles: 2, discount: 50, moving: 400 },
  { id: '12moving', label: '50% off · 12 weeks + moving', cycles: 3, discount: 50, moving: 500 },
  { id: 'bf', label: 'Black Friday · 50% off, 12 weeks', cycles: 3, discount: 50, moving: 0, note: 'Historical workbook offer. The BF sheet shows $0 admin in inputs but charges $19.95 in its total; this preset retains the charged fee.' },
  { id: 'custom', label: 'Custom quotation', cycles: 1, discount: 0, moving: 0 },
];
export interface Quote {
  id: string; date: string; validDays: number; customer: string; company: string; email: string; phone: string; address: string; preparedBy: string; moveIn: string;
  floor: string; size: string; unitId: string; rateSource: string; rate: number; quantity: number; liveType?: string; liveAvailable?: number; livePromotion?: string; liveAdvertisedRate?: number | null; binOnly: boolean; preset: string; cycles: number; discount: number; insurance: number; admin: number; lockPrice: number; locks: number; lockDiscount: number; moving: number; binPackage: number; binCycles: number; unreturnedBins: number; tax: number; notes: string; paymentTerms: string;
}
export function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function newQuote(): Quote { const unit = units.find(u => u.floor === 'Ground' && u.size === '10x10')!; return {
  id: `VQ-${today().replaceAll('-', '')}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`, date: today(), validDays: 7, customer: '', company: '', email: '', phone: '', address: '', preparedBy: '', moveIn: '',
  floor: unit.floor, size: unit.size, unitId: unit.id, rateSource: unit.source, rate: unit.rate, quantity: 1, binOnly: false, preset: '4weeks', cycles: 1, discount: 50, insurance: 14.95, admin: 19.95, lockPrice: 18.99, locks: 1, lockDiscount: 0, moving: 0, binPackage: 0, binCycles: 1, unreturnedBins: 0, tax: 13, notes: '', paymentTerms: '',
}; }
export const money = (n: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n);
export const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export function formatUnitSize(value: string) { const raw = value.trim(); const premium = /\s+Pre$/i.test(raw); const base = raw.replace(/\s+Pre$/i, '').replaceAll('×', 'x').replaceAll('x', ' × '); return `${base}${/[0-9]/.test(base) ? ' ft' : ''}${premium ? ' · Premium' : ''}`; }
export function calculate(q: Quote) {
  const storage = !q.binOnly;
  const rent = storage ? round(q.rate * q.quantity * q.cycles) : 0;
  const discount = storage ? round(rent * q.discount / 100) : 0;
  const insurance = storage ? round(q.insurance * q.quantity * q.cycles) : 0;
  const locks = storage ? round(q.lockPrice * q.locks * (1 - q.lockDiscount / 100)) : 0;
  const bins = round(q.binPackage * q.binCycles);
  const binReplacement = round(q.unreturnedBins * 50);
  const subtotal = round(rent - discount + insurance + (storage ? q.admin + locks + q.moving : 0) + bins + binReplacement);
  const tax = round(subtotal * q.tax / 100);
  const recurringSubtotal = storage ? round((q.rate + q.insurance) * q.quantity) : 0;
  return { rent, discount, insurance, locks, bins, binReplacement, subtotal, tax, total: round(subtotal + tax), recurring: storage ? round(recurringSubtotal + round(recurringSubtotal * q.tax / 100) + q.binPackage) : round(q.binPackage), savings: round(discount + round(discount * q.tax / 100)) };
}
export function dateLabel(value: string) { return value ? new Date(value + 'T12:00:00').toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : 'To be confirmed'; }
export function validUntil(q: Quote) { const d = new Date(q.date + 'T12:00:00'); d.setDate(d.getDate() + q.validDays); return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }); }
export function validate(q: Quote): string[] {
  const errors: string[] = [];
  if (!q.customer.trim()) errors.push('Enter a customer name.');
  if (!q.date || Number.isNaN(Date.parse(q.date))) errors.push('Enter a valid quote date.');
  if (!q.binOnly && !q.size.trim()) errors.push('Enter a unit size.');
  if (q.binOnly && q.binPackage <= 0) errors.push('Choose a bin rental package for a standalone bin quotation.');
  if (q.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q.email)) errors.push('Enter a valid email address.');
  for (const key of ['rate','insurance','admin','lockPrice','moving','tax','discount','locks','lockDiscount','quantity','cycles','validDays'] as const) {
    if (!Number.isFinite(q[key]) || q[key] < 0) errors.push(`${key} must be a non-negative number.`);
  }
  if (q.discount > 100 || q.lockDiscount > 100 || q.tax > 100) errors.push('Percentages must be between 0 and 100.');
  if (!q.binOnly && q.rate <= 0) errors.push('Enter a storage rate greater than zero.');
  for (const key of ['cycles','quantity','validDays'] as const) if (!Number.isInteger(q[key]) || q[key] < 1) errors.push(`${key} must be a positive whole number.`);
  if (!Number.isInteger(q.locks)) errors.push('Lock quantity must be a whole number.');
  return errors;
}
