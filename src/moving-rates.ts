export interface MovingRate { size: string; base: number; promotion: number; premium: number; staff: number; freeHours: number; overageRate: number }
export const movingRates: MovingRate[] = [
  { size: '5x5', base: 300, promotion: 350, premium: 350, staff: 1, freeHours: 2, overageRate: 50 },
  { size: '5x10', base: 425, promotion: 475, premium: 500, staff: 2, freeHours: 3, overageRate: 50 },
  { size: '10x10', base: 650, promotion: 750, premium: 750, staff: 2, freeHours: 4, overageRate: 75 },
  { size: '10x15', base: 800, promotion: 950, premium: 950, staff: 3, freeHours: 6, overageRate: 75 },
  { size: '10x20', base: 2500, promotion: 3000, premium: 3000, staff: 5, freeHours: 8, overageRate: 125 },
  { size: '10x30', base: 3000, promotion: 3500, premium: 3500, staff: 6, freeHours: 10, overageRate: 150 },
];
export const movingExtras = { fuelStandard: 39.99, fuelExtended: 79.99, afterHours: 250, premiumIncrease: 0.2, lateCancellation: 210, lateReschedule: 100, stairs: 125, unreturnedBin: 50 } as const;
export const binPackages = [{ bins: 5, perBin: 3, cycle: 15 }, { bins: 10, perBin: 2.5, cycle: 25 }, { bins: 20, perBin: 2, cycle: 40 }, { bins: 30, perBin: 1.75, cycle: 52.5 }, { bins: 40, perBin: 1.5, cycle: 60 }] as const;
export function movingRateFor(size: string, kind: 'base' | 'promotion' | 'premium' = 'base') { const normalized = size.replaceAll('×', 'x').replace(/\s+/g, '').toLowerCase().replace(/(pre)?ft$/, ''); const rate = movingRates.find(r => r.size === normalized); return rate ? rate[kind] : null; }
