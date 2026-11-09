import { useEffect, useState } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { money, round } from './quote';
import { fetchRates, fallbackRates, fallbackRatesCheckedAt, type LiveRate } from './live-rates';
import snapshot from './competitor-rates.json';

type CompetitorRate = { size: string; price: number; regular?: number; period: string; details: string };
const sizes = ['5x5', '5x10', '10x10'];
const fourWeeks = (monthly: number) => round(monthly * 28 / (365.2425 / 12));
export default function CompetitorCompare() {
  const [size, setSize] = useState('5x5');
  const [rates, setRates] = useState<LiveRate[]>([]);
  const [checkedAt, setCheckedAt] = useState('');
  const [fallback, setFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  async function refresh() {
    setLoading(true);
    try { setRates(await fetchRates()); setCheckedAt(new Date().toLocaleString()); setFallback(false); }
    catch { setRates(fallbackRates); setCheckedAt(new Date(fallbackRatesCheckedAt).toLocaleString()); setFallback(true); }
    finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);
  const vaultra = rates.filter(rate => rate.size === size && rate.available > 0 && /climate/i.test(rate.type) && !/moving|stacked|locker|mailbox/i.test(rate.type)).sort((a, b) => a.regular - b.regular)[0];
  return <section className="compare-page">
    <div className="lookup-hero"><div><div className="eyebrow">MARKHAM MARKET</div><h2>Nearby storage prices</h2><p>Publicly advertised rates from provider websites. Confirm availability, features, fees and offers before using a price match.</p></div><span className="lookup-badge">Latest scrape {snapshot.checkedAt}</span></div>
    <div className="compare-controls"><label htmlFor="compare-size">Compare unit size</label><select id="compare-size" value={size} onChange={event => setSize(event.target.value)}>{sizes.map(value => <option key={value} value={value}>{value.replace('x', ' × ')} ft</option>)}</select><span>Approximate rent per 4 weeks · CAD · before tax, insurance and fees</span></div>
    <div className="compare-list">
      <article className="compare-row own"><div><strong>Vaultra Storage</strong><p>8623 McCowan Road · {vaultra?.type ?? 'Climate controlled unit'}</p><a href="https://www.vaultrastorage.ca/markham/8623-mccowan-road/" target="_blank" rel="noreferrer">View facility <ArrowUpRight size={13}/></a></div><div className="compare-price"><strong>{vaultra ? money(vaultra.regular) : 'Check rate'}</strong><span>per 4 weeks</span>{vaultra?.promotion && <small>{vaultra.promotion} · check eligibility</small>}</div></article>
      {snapshot.facilities.map(facility => { const rate = (facility.rates as CompetitorRate[]).find(item => item.size === size); return <article className="compare-row" key={facility.id}><div><strong>{facility.name}</strong><p>{facility.address}</p><a href={facility.url} target="_blank" rel="noreferrer">View source <ArrowUpRight size={13}/></a></div><div className="compare-price"><strong>{rate ? money(fourWeeks(rate.price)) : 'Check site'}</strong><span>{rate ? `≈ / 4 weeks · ${money(rate.price)}/month advertised` : 'No exact size rate captured'}</span>{rate?.regular && <small>Regular {money(rate.regular)}/month</small>}</div><p className="compare-detail">{rate?.details ?? facility.note} · Last captured {('checkedAt' in facility ? facility.checkedAt : snapshot.checkedAt)}</p></article>; })}
    </div>
    <div className="compare-foot"><p>Competitor monthly prices are converted using 28 days ÷ the average calendar month (365.2425 ÷ 12 days). This is a comparison estimate, not a competitor billing amount. Unit floors, climate control, promotions and availability may differ. Public Storage’s facility page lists category starting prices, so it has no exact-size comparison here.</p><p>Vaultra rate: {loading ? 'loading…' : `${fallback ? 'fallback snapshot' : 'live inventory'} · checked ${checkedAt}`}. Competitor prices are refreshed by the scheduled site build when exact-size rates can be validated. Prices may change; open each source before quoting.</p><Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}><RefreshCw size={14}/>{loading ? 'Refreshing…' : 'Refresh Vaultra rate'}</Button></div>
  </section>;
}
