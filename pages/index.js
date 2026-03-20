import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';

// ─── Currency helpers ────────────────────────────────────────
function toAUD(amt, cur, r) {
  if (cur === 'AUD') return amt;
  if (cur === 'THB') return amt / (r.AUD_THB || 22.8);
  if (cur === 'USD') return amt / (r.AUD_USD || 0.64);
  return amt;
}
function toTarget(aud, target, r) {
  if (target === 'AUD') return aud;
  if (target === 'THB') return aud * (r.AUD_THB || 22.8);
  if (target === 'USD') return aud * (r.AUD_USD || 0.64);
  return aud;
}
function fmt(amt, cur) {
  if (cur === 'AUD') return '$' + amt.toFixed(2);
  if (cur === 'THB') return '฿' + Math.round(amt).toLocaleString();
  if (cur === 'USD') return 'US$' + amt.toFixed(2);
  return amt.toFixed(2);
}
function today() { return new Date().toISOString().split('T')[0]; }
function nanoid() { return Math.random().toString(36).slice(2,10); }

const COLORS = ['#c4603a','#4a7c59','#7c5cbf','#d4a843','#3a7ca5','#c4844a','#7a5c7a','#4a8b7a'];
const CATEGORIES = ['🍽️ Food','🏨 Accommodation','🚌 Transport','🎟️ Activities','🛍️ Shopping','💊 Health','📱 Comms','🔧 Other'];

// ─── Settle algorithm ────────────────────────────────────────
function computeSettlements(expenses, members) {
  const paid = {}, owed = {};
  members.forEach(m => { paid[m.name] = 0; owed[m.name] = 0; });
  expenses.forEach(e => {
    const split = Array.isArray(e.split_with) ? e.split_with : JSON.parse(e.split_with || '[]');
    const share = e.aud_amount / (split.length || 1);
    paid[e.paid_by] = (paid[e.paid_by] || 0) + e.aud_amount;
    split.forEach(p => { owed[p] = (owed[p] || 0) + share; });
  });
  const net = {};
  members.forEach(m => { net[m.name] = (paid[m.name] || 0) - (owed[m.name] || 0); });
  let debtors = [], creditors = [];
  Object.entries(net).forEach(([name, v]) => {
    if (v < -0.01) debtors.push({ name, amt: -v });
    else if (v > 0.01) creditors.push({ name, amt: v });
  });
  debtors.sort((a,b) => b.amt - a.amt);
  creditors.sort((a,b) => b.amt - a.amt);
  const txns = []; let i=0, j=0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amt, creditors[j].amt);
    txns.push({ from: debtors[i].name, to: creditors[j].name, audAmt: pay });
    debtors[i].amt -= pay; creditors[j].amt -= pay;
    if (debtors[i].amt < 0.01) i++;
    if (creditors[j].amt < 0.01) j++;
  }
  return { net, txns };
}

// ─── Auth screen ─────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('join'); // 'join' | 'create'
  const [tripName, setTripName] = useState('');
  const [tripCode, setTripCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const body = mode === 'create'
        ? { action: 'create', name: tripName, tripCode }
        : { action: 'join', tripCode };
      const r = await fetch('/api/trip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await r.json();
      if (!r.ok) { setError(data.error || 'Something went wrong'); setLoading(false); return; }
      onAuth(data.tripId, data.name);
    } catch { setError('Network error. Please try again.'); setLoading(false); }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#1a1410', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ background:'#faf8f4', borderRadius:16, padding:'2rem', width:'100%', maxWidth:400 }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.8rem', fontWeight:900, marginBottom:'0.25rem' }}>
          Wander<span style={{ color:'#d4a843' }}>split</span>
        </div>
        <p style={{ color:'#9e8e7a', fontSize:'0.85rem', marginBottom:'1.5rem', fontFamily:"'DM Mono',monospace" }}>Group travel expenses, shared in real time</p>

        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem' }}>
          {['join','create'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{ flex:1, padding:'0.6rem', borderRadius:7, border:'1.5px solid', cursor:'pointer', fontFamily:"'DM Mono',monospace", fontSize:'0.7rem', letterSpacing:'0.08em', textTransform:'uppercase', transition:'all 0.15s',
                background: mode===m ? '#1a1410' : '#f5f0e8',
                color: mode===m ? '#f5f0e8' : '#9e8e7a',
                borderColor: mode===m ? '#1a1410' : '#e0d8cc' }}>
              {m === 'join' ? 'Join trip' : 'Create trip'}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          {mode === 'create' && (
            <div style={{ marginBottom:'0.875rem' }}>
              <label style={{ display:'block', fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'#9e8e7a', marginBottom:'0.3rem' }}>Trip Name</label>
              <input value={tripName} onChange={e => setTripName(e.target.value)} placeholder="e.g. Thailand Adventure 2025"
                style={{ width:'100%', padding:'0.7rem 0.875rem', border:'1.5px solid #e0d8cc', borderRadius:7, fontSize:'1rem', fontFamily:"'DM Sans',sans-serif", outline:'none', background:'white', boxSizing:'border-box' }} required />
            </div>
          )}
          <div style={{ marginBottom:'0.875rem' }}>
            <label style={{ display:'block', fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'#9e8e7a', marginBottom:'0.3rem' }}>
              {mode === 'create' ? 'Set a trip code (share this with friends)' : 'Trip code'}
            </label>
            <input value={tripCode} onChange={e => setTripCode(e.target.value.toUpperCase())} placeholder={mode === 'create' ? 'e.g. THAI2025' : 'Enter trip code'}
              style={{ width:'100%', padding:'0.7rem 0.875rem', border:'1.5px solid #e0d8cc', borderRadius:7, fontSize:'1rem', fontFamily:"'DM Mono',monospace", outline:'none', background:'white', boxSizing:'border-box', letterSpacing:'0.1em' }} required />
          </div>
          {error && <p style={{ color:'#c4603a', fontSize:'0.82rem', marginBottom:'0.75rem', fontFamily:"'DM Mono',monospace" }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:'0.875rem', background: loading ? '#9e8e7a' : '#c4603a', color:'white', border:'none', borderRadius:8, cursor: loading ? 'default' : 'pointer', fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:500 }}>
            {loading ? 'Please wait…' : mode === 'create' ? 'Create Trip' : 'Join Trip'}
          </button>
        </form>
        {mode === 'join' && <p style={{ marginTop:'1rem', fontSize:'0.75rem', color:'#9e8e7a', textAlign:'center', fontFamily:"'DM Mono',monospace" }}>Get the trip code from whoever created the trip.</p>}
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────
export default function App() {
  const [tripId, setTripId] = useState(null);
  const [tripName, setTripName] = useState('');
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [rates, setRates] = useState({ AUD_THB: 22.8, AUD_USD: 0.64, THB_USD: 0.028, live: false });
  const [activePanel, setActivePanel] = useState('expenses');
  const [balCur, setBalCur] = useState('AUD');
  const [setCur, setSetCur] = useState('AUD');
  const [toast, setToast] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [sheet, setSheet] = useState(null); // 'members' | 'export' | null
  const [newMemberName, setNewMemberName] = useState('');
  const pollRef = useRef(null);

  // Form state
  const [fDesc, setFDesc] = useState('');
  const [fAmt, setFAmt] = useState('');
  const [fCur, setFCur] = useState('AUD');
  const [fPaidBy, setFPaidBy] = useState('');
  const [fCat, setFCat] = useState(CATEGORIES[0]);
  const [fDate, setFDate] = useState(today());
  const [fNote, setFNote] = useState('');
  const [fSplit, setFSplit] = useState([]);

  // ── Initialise split when members load ──
  useEffect(() => {
    if (members.length && !fSplit.length) setFSplit(members.map(m => m.name));
    if (members.length && !fPaidBy) setFPaidBy(members[0].name);
  }, [members]);

  // ── Show toast ──
  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  // ── Fetch exchange rates ──
  async function fetchRates() {
    try {
      const r = await fetch('https://open.er-api.com/v6/latest/AUD');
      const d = await r.json();
      setRates({ AUD_THB: d.rates.THB, AUD_USD: d.rates.USD, THB_USD: d.rates.USD / d.rates.THB, live: true, updated: d.time_last_update_utc });
    } catch { /* keep defaults */ }
  }

  // ── Fetch from DB ──
  const fetchData = useCallback(async (id) => {
    if (!id) return;
    try {
      const [mRes, eRes] = await Promise.all([
        fetch(`/api/members?tripId=${id}`),
        fetch(`/api/expenses?tripId=${id}`),
      ]);
      const [mData, eData] = await Promise.all([mRes.json(), eRes.json()]);
      if (Array.isArray(mData)) setMembers(mData);
      if (Array.isArray(eData)) setExpenses(eData);
    } catch {}
  }, []);

  // ── Auth ──
  function handleAuth(id, name) {
    setTripId(id);
    setTripName(name);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ws_trip_id', id);
      sessionStorage.setItem('ws_trip_name', name);
    }
  }

  // ── Restore session ──
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = sessionStorage.getItem('ws_trip_id');
      const name = sessionStorage.getItem('ws_trip_name');
      if (id) { setTripId(id); setTripName(name || ''); }
    }
    fetchRates();
    const rateInterval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(rateInterval);
  }, []);

  useEffect(() => {
    if (!tripId) return;
    fetchData(tripId);
    // Poll every 15 seconds for real-time feel
    pollRef.current = setInterval(() => fetchData(tripId), 15000);
    return () => clearInterval(pollRef.current);
  }, [tripId, fetchData]);

  // ── Add expense ──
  async function addExpense(e) {
    e.preventDefault();
    if (!fDesc.trim() || !fAmt || !fSplit.length) { showToast('Fill in all required fields'); return; }
    const amount = parseFloat(fAmt);
    if (isNaN(amount) || amount <= 0) { showToast('Enter a valid amount'); return; }
    const audAmount = toAUD(amount, fCur, rates);
    setSyncing(true);
    try {
      const r = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId, description: fDesc.trim(), amount, currency: fCur,
          audAmount, paidBy: fPaidBy, category: fCat,
          expenseDate: fDate, note: fNote.trim(), splitWith: fSplit,
          rateAudThb: rates.AUD_THB, rateAudUsd: rates.AUD_USD,
        }),
      });
      if (!r.ok) throw new Error();
      await fetchData(tripId);
      setFDesc(''); setFAmt(''); setFNote(''); setFSplit(members.map(m => m.name)); setFDate(today());
      showToast('Expense saved ✓');
      setActivePanel('expenses');
    } catch { showToast('Failed to save. Try again.'); }
    setSyncing(false);
  }

  // ── Delete expense ──
  async function deleteExpense(id) {
    await fetch('/api/expenses', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, tripId }) });
    setExpenses(prev => prev.filter(e => e.id !== id));
    showToast('Removed');
  }

  // ── Add member ──
  async function addMember() {
    const name = newMemberName.trim();
    if (!name || members.find(m => m.name === name)) { showToast('Enter a unique name'); return; }
    const r = await fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tripId, name }) });
    const data = await r.json();
    setMembers(prev => [...prev, data]);
    setNewMemberName('');
    showToast(name + ' added ✓');
  }

  // ── Remove member ──
  async function removeMember(id) {
    await fetch('/api/members', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, tripId }) });
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  // ── Export CSV ──
  function exportCSV() {
    let csv = 'Date,Description,Category,Currency,Amount,AUD Equivalent,Paid By,Split Between,Note,Rate AUD→THB,Rate AUD→USD\n';
    expenses.forEach(e => {
      const split = Array.isArray(e.split_with) ? e.split_with : JSON.parse(e.split_with || '[]');
      csv += `"${e.expense_date}","${e.description}","${e.category}","${e.currency}","${e.amount}","${e.aud_amount?.toFixed(2)}","${e.paid_by}","${split.join('; ')}","${e.note || ''}","${e.rate_aud_thb || ''}","${e.rate_aud_usd || ''}"\n`;
    });
    const { txns } = computeSettlements(expenses, members);
    csv += '\nSettlement Summary\nFrom,To,AUD Amount\n';
    txns.forEach(t => csv += `"${t.from}","${t.to}","${t.audAmt.toFixed(2)}"\n`);
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'wandersplit.csv' });
    a.click();
    showToast('CSV downloaded ✓');
  }

  function exportJSON() {
    const { txns } = computeSettlements(expenses, members);
    const data = { tripName, exportedAt: new Date().toISOString(), members, expenses, rates, settlements: txns };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'wandersplit.json' });
    a.click();
    showToast('JSON downloaded ✓');
  }

  // ── Balances ──
  const { net, txns } = computeSettlements(expenses, members);

  // ── Totals ──
  const totAUD = expenses.reduce((s, e) => s + (e.aud_amount || 0), 0);
  const totTHB = expenses.reduce((s, e) => s + toTarget(e.aud_amount || 0, 'THB', { AUD_THB: e.rate_aud_thb || rates.AUD_THB }), 0);
  const totUSD = expenses.reduce((s, e) => s + toTarget(e.aud_amount || 0, 'USD', { AUD_USD: e.rate_aud_usd || rates.AUD_USD }), 0);

  if (!tripId) return <AuthScreen onAuth={handleAuth} />;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <>
      <Head>
        <title>Wandersplit – {tripName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        body{font-family:'DM Sans',sans-serif;background:#f5f0e8;color:#1a1410;min-height:100vh}
        input,select,textarea{font-family:'DM Sans',sans-serif;font-size:1rem;-webkit-appearance:none;appearance:none}
        input:focus,select:focus,textarea:focus{outline:none;border-color:#c4603a!important}
        select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239e8e7a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 0.875rem center;padding-right:2.5rem}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#e0d8cc;border-radius:2px}
        @media(min-width:768px){.mob-only{display:none!important}}
        @media(max-width:767px){.desk-only{display:none!important}}
      `}</style>

      {/* Header */}
      <header style={{ position:'sticky', top:0, zIndex:200, background:'#1a1410', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1rem 0 1.25rem', boxShadow:'0 2px 8px rgba(0,0,0,.3)' }}>
        <div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', fontWeight:900, color:'#f5f0e8', letterSpacing:'-0.02em' }}>
            Wander<span style={{ color:'#d4a843' }}>split</span>
          </div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', color:'#9e8e7a', letterSpacing:'0.06em', textTransform:'uppercase' }}>{tripName}</div>
        </div>
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', color: rates.live ? '#4a7c59' : '#9e8e7a', letterSpacing:'0.05em' }}>
            {rates.live ? '● Live rates' : '○ Offline rates'}
          </div>
          <button className="mob-only" onClick={() => setSheet('members')}
            style={{ width:36, height:36, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)', borderRadius:6, color:'#f5f0e8', fontSize:'1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>👥</button>
          <button onClick={() => setSheet('export')}
            style={{ width:36, height:36, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)', borderRadius:6, color:'#f5f0e8', fontSize:'1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>↗</button>
          <button onClick={() => { sessionStorage.clear(); setTripId(null); }}
            style={{ width:36, height:36, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)', borderRadius:6, color:'#f5f0e8', fontSize:'0.8rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} title="Leave trip">✕</button>
        </div>
      </header>

      {/* Rate ticker */}
      <div style={{ background:'#111009', borderBottom:'1px solid rgba(255,255,255,.07)', height:28, display:'flex', alignItems:'center', overflow:'hidden', position:'sticky', top:56, zIndex:190 }}>
        <div style={{ display:'flex', gap:'2.5rem', padding:'0 2rem', whiteSpace:'nowrap', fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', letterSpacing:'0.05em', animation:'ticker 20s linear infinite' }}>
          {[1,2].map(k => (
            <span key={k} style={{ display:'flex', gap:'1.5rem' }}>
              <span style={{ color:'#9e8e7a' }}>AUD → THB <span style={{ color: rates.live ? '#4a7c59' : '#9e8e7a' }}>{rates.AUD_THB?.toFixed(2)}</span></span>
              <span style={{ color:'#9e8e7a' }}>AUD → USD <span style={{ color: rates.live ? '#4a7c59' : '#9e8e7a' }}>{rates.AUD_USD?.toFixed(4)}</span></span>
              <span style={{ color:'#9e8e7a' }}>THB → USD <span style={{ color: rates.live ? '#4a7c59' : '#9e8e7a' }}>{rates.THB_USD?.toFixed(5)}</span></span>
              <span style={{ color:'#9e8e7a' }}>{rates.live ? `✓ Updated ${rates.updated ? new Date(rates.updated).toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit'}) : ''}` : 'Offline fallback rates'}</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      </div>

      {/* Desktop tabs */}
      <div className="desk-only" style={{ display:'flex', borderBottom:'2px solid #e0d8cc', background:'#faf8f4', position:'sticky', top:84, zIndex:180, paddingLeft:'calc((100% - 1080px) / 2 + 0px)', paddingRight:'calc((100% - 1080px) / 2)' }}>
        {[['expenses','Expenses'],['add','+ Add'],['balances','Balances'],['settle','Settle Up']].map(([id, label]) => (
          <button key={id} onClick={() => setActivePanel(id)}
            style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', letterSpacing:'0.09em', textTransform:'uppercase', padding:'0.7rem 1.1rem', cursor:'pointer', background:'none', border:'none', borderBottom:'2px solid transparent', marginBottom:-2, color: activePanel===id ? '#c4603a' : '#9e8e7a', borderBottomColor: activePanel===id ? '#c4603a' : 'transparent', transition:'all .2s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <main style={{ maxWidth:1080, margin:'0 auto', padding:'1rem 1rem calc(80px + env(safe-area-inset-bottom, 0px)) 1rem', display:'grid', gridTemplateColumns:'1fr', gap:'1.25rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'1.25rem' }} className="desk-only" />

        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* EXPENSES panel */}
          {activePanel === 'expenses' && (
            <div>
              {/* Totals */}
              <div style={{ background:'#1a1410', borderRadius:10, padding:'1rem 1.25rem', marginBottom:'0.875rem', display:'grid', gridTemplateColumns:'repeat(3,1fr)', textAlign:'center', gap:'0.5rem' }}>
                {[['tAUD', fmt(totAUD,'AUD'), 'AUD'], ['tTHB', fmt(totTHB,'THB'), 'THB'], ['tUSD', fmt(totUSD,'USD'), 'USD']].map(([k, val, lbl]) => (
                  <div key={k}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', fontWeight:700, color:'#d4a843', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{val}</div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', color:'#9e8e7a', textTransform:'uppercase', letterSpacing:'0.07em', marginTop:'0.15rem' }}>{lbl}</div>
                  </div>
                ))}
              </div>
              {/* List */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.875rem' }}>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.05rem' }}>Expenses</h2>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', background:'#e0d8cc', color:'#9e8e7a', padding:'0.15rem 0.55rem', borderRadius:10 }}>{expenses.length} items</span>
              </div>
              {!expenses.length ? (
                <div style={{ textAlign:'center', padding:'3rem 1rem', color:'#9e8e7a' }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem', opacity:0.35 }}>🧾</div>
                  <p style={{ fontSize:'0.82rem', lineHeight:1.6 }}>No expenses yet.<br/>Tap <b>+</b> to add the first one.</p>
                </div>
              ) : expenses.map(e => {
                const split = Array.isArray(e.split_with) ? e.split_with : JSON.parse(e.split_with || '[]');
                const eq = e.currency !== 'AUD' ? `≈ ${fmt(e.aud_amount,'AUD')}` : '';
                return (
                  <div key={e.id} style={{ background:'white', border:'1px solid #e0d8cc', borderRadius:8, marginBottom:'0.625rem', display:'grid', gridTemplateColumns:'1fr auto', padding:'0.875rem 1rem', gap:'0.5rem' }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.92rem' }}>{e.category?.split(' ')[0]} {e.description}</div>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', color:'#9e8e7a', marginTop:'0.2rem' }}>{e.expense_date} · <b>{e.paid_by}</b> paid</div>
                      <div style={{ fontSize:'0.72rem', color:'#9e8e7a', marginTop:'0.2rem' }}>Split: {split.join(', ')}</div>
                      {e.note && <div style={{ fontSize:'0.72rem', color:'#9e8e7a', fontStyle:'italic', marginTop:'0.2rem' }}>{e.note}</div>}
                    </div>
                    <div>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}>
                        {fmt(e.amount, e.currency)}
                        <span style={{ display:'inline-block', padding:'0.08rem 0.35rem', borderRadius:3, fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', fontWeight:500, marginLeft:'0.3rem', verticalAlign:'middle', background: e.currency==='AUD'?'#fde8df':e.currency==='THB'?'#ede9fe':'#e4ede8', color: e.currency==='AUD'?'#c4603a':e.currency==='THB'?'#7c5cbf':'#4a7c59' }}>{e.currency}</span>
                      </div>
                      {eq && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', color:'#9e8e7a', textAlign:'right' }}>{eq}</div>}
                      <div style={{ textAlign:'right', marginTop:'0.35rem' }}>
                        <button onClick={() => deleteExpense(e.id)} style={{ background:'none', border:'none', color:'#e0d8cc', fontSize:'0.9rem', cursor:'pointer', padding:'0.2rem', transition:'color .15s' }} onMouseOver={ev=>ev.target.style.color='#c4603a'} onMouseOut={ev=>ev.target.style.color='#e0d8cc'}>🗑</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ADD EXPENSE panel */}
          {activePanel === 'add' && (
            <div style={{ background:'white', border:'1px solid #e0d8cc', borderRadius:10, padding:'1.25rem' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Record Expense</div>
              <form onSubmit={addExpense}>
                <div style={{ marginBottom:'0.875rem' }}>
                  <label style={lbl}>Description</label>
                  <input value={fDesc} onChange={e=>setFDesc(e.target.value)} placeholder="e.g. Dinner at Thipsamai" style={inp} required />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'0.875rem' }}>
                  <div><label style={lbl}>Amount</label><input value={fAmt} onChange={e=>setFAmt(e.target.value)} type="number" inputMode="decimal" step="0.01" placeholder="0.00" style={inp} required /></div>
                  <div><label style={lbl}>Currency</label><select value={fCur} onChange={e=>setFCur(e.target.value)} style={inp}><option value="AUD">🇦🇺 AUD</option><option value="THB">🇹🇭 THB</option><option value="USD">🇺🇸 USD</option></select></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'0.875rem' }}>
                  <div><label style={lbl}>Paid By</label>
                    <select value={fPaidBy} onChange={e=>setFPaidBy(e.target.value)} style={inp}>
                      {members.map(m => <option key={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Category</label><select value={fCat} onChange={e=>setFCat(e.target.value)} style={inp}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
                </div>
                <div style={{ marginBottom:'0.875rem' }}>
                  <label style={lbl}>Date</label>
                  <input type="date" value={fDate} onChange={e=>setFDate(e.target.value)} style={inp} />
                </div>
                <div style={{ marginBottom:'0.875rem' }}>
                  <label style={lbl}>Note (optional)</label>
                  <textarea value={fNote} onChange={e=>setFNote(e.target.value)} placeholder="Any extra details…" style={{ ...inp, height:68, resize:'none' }} />
                </div>
                <div style={{ marginBottom:'0.875rem' }}>
                  <label style={lbl}>Split Between</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.45rem', marginTop:'0.4rem' }}>
                    {members.map((m,i) => (
                      <div key={m.id} onClick={() => setFSplit(prev => prev.includes(m.name) ? prev.filter(x=>x!==m.name) : [...prev, m.name])}
                        style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', padding:'0.45rem 0.8rem', border:`1.5px solid ${fSplit.includes(m.name)?'#1a1410':'#e0d8cc'}`, borderRadius:20, cursor:'pointer', background: fSplit.includes(m.name)?'#1a1410':'#faf8f4', color: fSplit.includes(m.name)?'#f5f0e8':'#9e8e7a', display:'flex', alignItems:'center', gap:'0.35rem', userSelect:'none', transition:'all .15s' }}>
                        <span style={{ width:7, height:7, borderRadius:'50%', background: COLORS[i%COLORS.length], display:'inline-block', flexShrink:0 }}/>
                        {m.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', color:'#9e8e7a', background:'#faf8f4', border:'1px solid #e0d8cc', borderRadius:6, padding:'0.5rem 0.75rem', marginBottom:'0.75rem', lineHeight:1.5 }}>
                  Rates at entry: 1 AUD = {rates.AUD_THB?.toFixed(2)} THB = {rates.AUD_USD?.toFixed(4)} USD{!rates.live ? ' (offline fallback)' : ''}
                </div>
                <button type="submit" disabled={syncing} style={{ width:'100%', padding:'0.875rem', background: syncing?'#9e8e7a':'#c4603a', color:'white', border:'none', borderRadius:8, cursor: syncing?'default':'pointer', fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:500 }}>
                  {syncing ? 'Saving…' : 'Record Expense'}
                </button>
              </form>
            </div>
          )}

          {/* BALANCES panel */}
          {activePanel === 'balances' && (
            <div style={{ background:'white', border:'1px solid #e0d8cc', borderRadius:10, padding:'1.25rem' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Net Balances</div>
              <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1rem' }}>
                {['AUD','THB','USD'].map(c => (
                  <button key={c} onClick={() => setBalCur(c)} style={{ flex:1, fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', letterSpacing:'0.07em', textTransform:'uppercase', padding:'0.5rem', border:`1.5px solid ${balCur===c ? ({AUD:'#c4603a',THB:'#7c5cbf',USD:'#4a7c59'}[c]) : '#e0d8cc'}`, borderRadius:20, cursor:'pointer', background: balCur===c ? ({AUD:'#c4603a',THB:'#7c5cbf',USD:'#4a7c59'}[c]) : '#faf8f4', color: balCur===c ? 'white' : '#9e8e7a', transition:'all .2s', textAlign:'center' }}>
                    {c} {c==='AUD'?'$':c==='THB'?'฿':'$'}
                  </button>
                ))}
              </div>
              {members.map((m, i) => {
                const v = net[m.name] || 0;
                const cv = toTarget(v, balCur, rates);
                const cls = v > 0.01 ? '#4a7c59' : v < -0.01 ? '#c4603a' : '#9e8e7a';
                const lbl2 = v > 0.01 ? 'gets back' : v < -0.01 ? 'owes' : 'settled ✓';
                return (
                  <div key={m.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.7rem 0', borderBottom:'1px solid #e0d8cc' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:500, fontSize:'0.9rem' }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background: COLORS[i%COLORS.length], display:'inline-block' }}/>
                      {m.name} <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', color:'#9e8e7a' }}>{lbl2}</span>
                    </div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.88rem', fontWeight:600, color: cls }}>{v > 0.01 ? '+' : ''}{fmt(cv, balCur)}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SETTLE panel */}
          {activePanel === 'settle' && (
            <div style={{ background:'white', border:'1px solid #e0d8cc', borderRadius:10, padding:'1.25rem' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Settle Up</div>
              <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1rem' }}>
                {['AUD','THB','USD'].map(c => (
                  <button key={c} onClick={() => setSetCur(c)} style={{ flex:1, fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', letterSpacing:'0.07em', textTransform:'uppercase', padding:'0.5rem', border:`1.5px solid ${setCur===c ? ({AUD:'#c4603a',THB:'#7c5cbf',USD:'#4a7c59'}[c]) : '#e0d8cc'}`, borderRadius:20, cursor:'pointer', background: setCur===c ? ({AUD:'#c4603a',THB:'#7c5cbf',USD:'#4a7c59'}[c]) : '#faf8f4', color: setCur===c ? 'white' : '#9e8e7a', transition:'all .2s', textAlign:'center' }}>
                    {c} {c==='AUD'?'$':c==='THB'?'฿':'$'}
                  </button>
                ))}
              </div>
              {!txns.length ? (
                <div style={{ textAlign:'center', padding:'2rem', color:'#9e8e7a', fontFamily:"'DM Mono',monospace", fontSize:'0.8rem' }}>✓ Everyone is settled up!</div>
              ) : txns.map((t, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.4rem', flexWrap:'wrap', padding:'0.7rem 0', borderBottom:'1px solid #e0d8cc', fontSize:'0.875rem' }}>
                  <b>{t.from}</b>
                  <span style={{ color:'#9e8e7a', fontSize:'0.7rem' }}>→ pays →</span>
                  <b>{t.to}</b>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:600, color:'#c4603a', marginLeft:'auto' }}>{fmt(toTarget(t.audAmt, setCur, rates), setCur)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop sidebar */}
        <div className="desk-only" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <SidebarMembers members={members} newMemberName={newMemberName} setNewMemberName={setNewMemberName} addMember={addMember} removeMember={removeMember} />
          <SidebarStats expenses={expenses} members={members} />
          <SidebarExport exportCSV={exportCSV} exportJSON={exportJSON} />
        </div>
      </main>

      {/* Bottom nav — mobile */}
      <nav className="mob-only" style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, background:'#1a1410', borderTop:'1px solid rgba(255,255,255,.1)', display:'flex', paddingBottom:'env(safe-area-inset-bottom,0px)' }}>
        {[['expenses','🧾','Expenses'],['balances','⚖️','Balances'],['add','＋',''],['settle','💸','Settle'],['members','👥','People']].map(([id, icon, label]) => (
          <button key={id} onClick={() => id==='members' ? setSheet('members') : setActivePanel(id)}
            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.2rem', cursor:'pointer', padding:'0.5rem 0.25rem', background: id==='add'?'#c4603a':'none', borderRadius: id==='add'?14:0, margin: id==='add'?'0.4rem 0.5rem':0, width: id==='add'?48:'auto', flexShrink: id==='add'?0:1, border:'none', color: activePanel===id && id!=='members' ? '#d4a843' : 'rgba(245,240,232,.4)', boxShadow: id==='add'?'0 2px 8px rgba(196,96,58,.5)':undefined, transition:'color .2s' }}>
            <span style={{ fontSize: id==='add'?'1.5rem':'1.2rem', lineHeight:1 }}>{icon}</span>
            {label && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.53rem', letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Sheets */}
      {sheet && (
        <div onClick={() => setSheet(null)} style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,.45)', backdropFilter:'blur(3px)', display:'flex', alignItems:'flex-end' }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'white', borderRadius:'16px 16px 0 0', padding:'1.25rem', width:'100%', paddingBottom:`calc(1.25rem + env(safe-area-inset-bottom,0px))`, maxHeight:'80vh', overflowY:'auto' }}>
            <div style={{ width:40, height:4, background:'#e0d8cc', borderRadius:2, margin:'0 auto 1.25rem' }}/>
            {sheet === 'members' && <>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', fontWeight:700, marginBottom:'1rem' }}>Trip Members</div>
              <SidebarMembers members={members} newMemberName={newMemberName} setNewMemberName={setNewMemberName} addMember={addMember} removeMember={removeMember} />
            </>}
            {sheet === 'export' && <>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', fontWeight:700, marginBottom:'1rem' }}>Export Records</div>
              <SidebarExport exportCSV={() => { exportCSV(); setSheet(null); }} exportJSON={() => { exportJSON(); setSheet(null); }} />
            </>}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:'calc(72px + env(safe-area-inset-bottom,0px) + 0.75rem)', left:'50%', transform:'translateX(-50%)', background:'#1a1410', color:'#f5f0e8', padding:'0.65rem 1.25rem', borderRadius:20, fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', zIndex:400, whiteSpace:'nowrap', pointerEvents:'none' }}>
          {toast}
        </div>
      )}

      {syncing && (
        <div style={{ position:'fixed', top:84+28+8, right:12, background:'#1a1410', color:'#d4a843', padding:'0.35rem 0.75rem', borderRadius:20, fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', zIndex:300 }}>
          Syncing…
        </div>
      )}
    </>
  );
}

// ── Style helpers ──
const inp = { width:'100%', padding:'0.7rem 0.875rem', border:'1.5px solid #e0d8cc', borderRadius:7, fontSize:'1rem', background:'#faf8f4', color:'#1a1410', display:'block', boxSizing:'border-box' };
const lbl = { display:'block', fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'#9e8e7a', marginBottom:'0.3rem' };

// ── Sidebar sub-components ──
function SidebarMembers({ members, newMemberName, setNewMemberName, addMember, removeMember }) {
  return (
    <div style={{ background:'white', border:'1px solid #e0d8cc', borderRadius:10, padding:'1.25rem' }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Members</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'0.75rem' }}>
        {members.map((m, i) => (
          <span key={m.id} style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.35rem 0.75rem', background:'#faf8f4', border:'1px solid #e0d8cc', borderRadius:20, fontSize:'0.82rem' }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background: COLORS[i%COLORS.length], display:'inline-block' }}/>
            {m.name}
            <button onClick={() => removeMember(m.id)} style={{ background:'none', border:'none', color:'#9e8e7a', cursor:'pointer', fontSize:'0.85rem', padding:0, lineHeight:1 }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display:'flex', gap:'0.5rem' }}>
        <input value={newMemberName} onChange={e=>setNewMemberName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addMember()} placeholder="Add name…" style={{ flex:1, padding:'0.7rem 0.875rem', border:'1.5px solid #e0d8cc', borderRadius:7, fontSize:'0.9rem', background:'#faf8f4', outline:'none' }}/>
        <button onClick={addMember} style={{ padding:'0 1rem', background:'#1a1410', color:'#f5f0e8', border:'none', borderRadius:7, cursor:'pointer', fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', whiteSpace:'nowrap' }}>+ Add</button>
      </div>
    </div>
  );
}

function SidebarStats({ expenses, members }) {
  if (!expenses.length) return (
    <div style={{ background:'white', border:'1px solid #e0d8cc', borderRadius:10, padding:'1.25rem' }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontWeight:700, marginBottom:'0.75rem' }}>Quick Stats</div>
      <p style={{ color:'#9e8e7a', fontSize:'0.82rem' }}>Add expenses to see stats.</p>
    </div>
  );
  const cats = {};
  expenses.forEach(e => { cats[e.category] = (cats[e.category]||0) + e.aud_amount; });
  const top = Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const total = expenses.reduce((s,e)=>s+e.aud_amount,0);
  const pp = total / (members.length || 1);
  return (
    <div style={{ background:'white', border:'1px solid #e0d8cc', borderRadius:10, padding:'1.25rem' }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontWeight:700, marginBottom:'0.75rem' }}>Quick Stats</div>
      {top.map(([k,v]) => (
        <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid #e0d8cc', fontSize:'0.83rem' }}>
          <span>{k}</span><span style={{ fontFamily:"'DM Mono',monospace", fontWeight:500 }}>{fmt(v,'AUD')}</span>
        </div>
      ))}
      <div style={{ display:'flex', justifyContent:'space-between', background:'#faf8f4', borderRadius:7, padding:'0.6rem 0.875rem', marginTop:'0.6rem', fontSize:'0.83rem' }}>
        <span>Avg per person</span>
        <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:600, color:'#c4603a' }}>{fmt(pp,'AUD')}</span>
      </div>
    </div>
  );
}

function SidebarExport({ exportCSV, exportJSON }) {
  const btnStyle = { fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', letterSpacing:'0.07em', textTransform:'uppercase', padding:'0.65rem 1rem', border:'1.5px solid #e0d8cc', background:'#faf8f4', color:'#1a1410', borderRadius:7, cursor:'pointer', width:'100%', marginBottom:'0.5rem', textAlign:'left', display:'flex', alignItems:'center', gap:'0.6rem' };
  return (
    <div style={{ background:'white', border:'1px solid #e0d8cc', borderRadius:10, padding:'1.25rem' }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontWeight:700, marginBottom:'0.75rem' }}>Export</div>
      <button style={btnStyle} onClick={exportCSV}>📄 CSV — Spreadsheet</button>
      <button style={btnStyle} onClick={exportJSON}>📋 JSON — Full data</button>
      <button style={btnStyle} onClick={() => window.print()}>🖨️ Print / Save PDF</button>
      <p style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', color:'#9e8e7a', lineHeight:1.6, marginTop:'0.5rem' }}>Includes exchange rate snapshot per transaction.</p>
    </div>
  );
}
