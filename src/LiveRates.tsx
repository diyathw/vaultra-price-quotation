import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { applyLiveRate, fetchRates, type LiveRate } from './live-rates';
import { money, type Quote } from './quote';

export default function LiveRates({ onApply }: { onApply: (values: Partial<Quote>) => void }) {
  const [rates, setRates] = useState<LiveRate[]>([]);
  const [fetchedAt, setFetchedAt] = useState('');
  const [selection, setSelection] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState('');
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer); }, []);
  const selected = rates.find(r => r.id === selection);
  const stale = !!fetchedAt && now - Date.parse(fetchedAt) > 15 * 60 * 1000;
  async function refresh() {
    setLoading(true); setError(''); setApplied('');
    try { const next = await fetchRates(); setRates(next); setFetchedAt(new Date().toISOString()); setSelection(id => next.some(r => r.id === id) ? id : ''); }
    catch (e) { setError(`Could not refresh rates. ${e instanceof Error && e.name !== 'TypeError' ? e.message : 'Check your connection or try again later.'} You can still enter a rate manually below.`); }
    finally { setLoading(false); }
  }
  return <div className="live-rates"><div className="live-rates-heading"><div><strong>Current online rates</strong><p>Markham · every 4 weeks</p></div><Button variant="outline" size="sm" disabled={loading} onClick={refresh}><RefreshCw size={13} className={loading ? 'animate-spin' : ''}/>{loading ? 'Refreshing…' : 'Refresh rates'}</Button></div>
    <p className="field-hint" role="status">{fetchedAt ? `Last updated: ${new Date(fetchedAt).toLocaleString()}${stale ? ' · Refresh before applying' : ''}` : 'Refresh to load current prices and availability.'}</p>
    {error && <p className="source-note" role="alert">{error}</p>}
    {!!rates.length && <><Select value={selection} onValueChange={value => { setSelection(value); setApplied(''); }}><SelectTrigger aria-label="Current online unit" className="live-rate-select"><SelectValue placeholder="Select a size and unit type…" /></SelectTrigger><SelectContent>{rates.map(rate => <SelectItem key={rate.id} value={rate.id} disabled={rate.available === 0}>{rate.size} · {rate.type} · {money(rate.regular)}{rate.available === 0 ? ' · Unavailable' : ''}</SelectItem>)}</SelectContent></Select>
    {selected && <div className="live-rate-details"><strong>{selected.size.replaceAll('x', ' × ')} · {selected.type}</strong><p>Regular rent: {money(selected.regular)} / 4 weeks · {selected.available} available</p>{selected.promotion && <p>{selected.promotion} · advertised rent {money(selected.promotional!)} / 4 weeks</p>}{selected.needsReview ? <p className="source-note">This offer needs staff confirmation. Applying uses the regular rent for 4 weeks without a discount; adjust the terms manually.</p> : selected.discount > 0 && <p>{selected.discount}% off for {selected.cycles * 4} weeks. Applied once to regular rent.</p>}<Button size="sm" disabled={loading || !!error || stale || selected.available < 1} onClick={() => { onApply(applyLiveRate(selected, fetchedAt)); setApplied('Online rent and promotion applied. Review insurance, fees, and eligibility before printing.'); }}>Use this rate</Button></div>}</>}
    {applied && <p className="field-hint" role="status">{applied}</p>}<p className="field-hint">Refreshing never changes an existing quote. Insurance, locks, administration and moving charges are reviewed separately.</p>
  </div>;
}
