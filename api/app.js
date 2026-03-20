export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>Wandersplit</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--sand:#f5f0e8;--ink:#1a1410;--terra:#c4603a;--gold:#d4a843;--sage:#4a7c59;--muted:#9e8e7a;--light:#faf8f4;--border:#e0d8cc;--card:#ffffff;--nav:64px;--safe:env(safe-area-inset-bottom,0px)}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{font-family:'DM Sans',sans-serif;background:var(--sand);color:var(--ink);min-height:100vh}
input,select,textarea{font-family:'DM Sans',sans-serif;font-size:1rem;-webkit-appearance:none;width:100%;padding:.7rem .875rem;border:1.5px solid var(--border);border-radius:7px;background:var(--light);color:var(--ink);outline:none;box-sizing:border-box}
input:focus,select:focus,textarea:focus{border-color:var(--terra)}
select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239e8e7a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .875rem center;padding-right:2.5rem;appearance:none}
textarea{resize:none;height:68px}
button{cursor:pointer;font-family:'DM Sans',sans-serif}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.mono{font-family:'DM Mono',monospace}
.serif{font-family:'Playfair Display',serif}
/* AUTH */
#auth{min-height:100vh;background:var(--ink);display:flex;align-items:center;justify-content:center;padding:1.5rem}
.auth-box{background:var(--light);border-radius:16px;padding:2rem;width:100%;max-width:400px}
.auth-title{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:900;margin-bottom:.25rem}
.auth-sub{color:var(--muted);font-size:.82rem;margin-bottom:1.5rem;font-family:'DM Mono',monospace}
.mode-row{display:flex;gap:.5rem;margin-bottom:1.25rem}
.mode-btn{flex:1;padding:.6rem;border-radius:7px;border:1.5px solid var(--border);font-family:'DM Mono',monospace;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;transition:all .15s;background:var(--light);color:var(--muted)}
.mode-btn.on{background:var(--ink);color:var(--sand);border-color:var(--ink)}
.fg{margin-bottom:.875rem}
.flbl{display:block;font-family:'DM Mono',monospace;font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:.3rem}
.btn-p{width:100%;padding:.875rem;background:var(--terra);color:white;border:none;border-radius:8px;font-family:'DM Mono',monospace;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;font-weight:500;transition:background .2s}
.btn-p:active{background:#b5532f}
.btn-p:disabled{background:var(--muted)}
.err{color:var(--terra);font-size:.82rem;margin-bottom:.75rem;font-family:'DM Mono',monospace}
/* HEADER */
.hdr{position:sticky;top:0;z-index:200;background:var(--ink);height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 1rem 0 1.25rem;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.logo{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:900;color:var(--sand);letter-spacing:-.02em}
.logo em{color:var(--gold);font-style:normal}
.hdr-sub{font-family:'DM Mono',monospace;font-size:.55rem;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin-top:2px}
.hdr-btns{display:flex;gap:.5rem;align-items:center}
.icon-btn{width:36px;height:36px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:6px;color:var(--sand);font-size:.95rem;display:flex;align-items:center;justify-content:center;transition:background .2s}
.icon-btn:active{background:rgba(255,255,255,.2)}
.rate-bar{background:#111009;border-bottom:1px solid rgba(255,255,255,.07);height:26px;display:flex;align-items:center;overflow:hidden;position:sticky;top:56px;z-index:190}
.rate-track{display:flex;gap:2.5rem;padding:0 2rem;white-space:nowrap;font-family:'DM Mono',monospace;font-size:.6rem;letter-spacing:.05em;animation:ticker 20s linear infinite}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.rate-live{color:var(--sage)}
.rate-off{color:var(--muted)}
/* TABS desktop */
.dtabs{display:none;border-bottom:2px solid var(--border);background:var(--light);position:sticky;top:82px;z-index:180;padding:0 1rem}
.dtab{font-family:'DM Mono',monospace;font-size:.65rem;letter-spacing:.09em;text-transform:uppercase;padding:.7rem 1rem;background:none;border:none;border-bottom:2px solid transparent;margin-bottom:-2px;color:var(--muted);transition:all .2s}
.dtab.on{color:var(--terra);border-bottom-color:var(--terra)}
/* MAIN */
.app-main{max-width:1080px;margin:0 auto;padding:1rem 1rem calc(var(--nav) + var(--safe) + 1rem)}
/* TOTALS */
.totals{background:var(--ink);border-radius:10px;padding:1rem 1.25rem;margin-bottom:.875rem;display:grid;grid-template-columns:repeat(3,1fr);text-align:center;gap:.5rem}
.tval{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:var(--gold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tlbl{font-family:'DM Mono',monospace;font-size:.52rem;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-top:.15rem}
/* SECTION HDR */
.shdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:.875rem}
.shdr h2{font-family:'Playfair Display',serif;font-size:1.05rem}
.badge{font-family:'DM Mono',monospace;font-size:.58rem;background:var(--border);color:var(--muted);padding:.15rem .55rem;border-radius:10px}
/* EXPENSE ITEMS */
.eitem{background:var(--card);border:1px solid var(--border);border-radius:8px;margin-bottom:.625rem;display:grid;grid-template-columns:1fr auto;padding:.875rem 1rem;gap:.5rem}
.edesc{font-weight:600;font-size:.92rem}
.emeta{font-family:'DM Mono',monospace;font-size:.6rem;color:var(--muted);margin-top:.2rem}
.esplit{font-size:.72rem;color:var(--muted);margin-top:.2rem}
.enote{font-size:.72rem;color:var(--muted);font-style:italic;margin-top:.2rem}
.eamt{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;text-align:right;white-space:nowrap}
.eeq{font-family:'DM Mono',monospace;font-size:.58rem;color:var(--muted);text-align:right}
.cbadge{display:inline-block;padding:.08rem .35rem;border-radius:3px;font-family:'DM Mono',monospace;font-size:.55rem;font-weight:500;margin-left:.3rem;vertical-align:middle}
.cb-AUD{background:#fde8df;color:#c4603a}.cb-THB{background:#ede9fe;color:#7c5cbf}.cb-USD{background:#e4ede8;color:#4a7c59}
.dbtn{background:none;border:none;color:var(--border);font-size:.9rem;padding:.2rem;line-height:1;transition:color .15s}
.dbtn:active{color:var(--terra)}
/* EMPTY */
.empty{text-align:center;padding:3rem 1rem;color:var(--muted)}
.empty-icon{font-size:2.5rem;margin-bottom:.75rem;opacity:.35}
/* CARD */
.card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:1.25rem;margin-bottom:.875rem}
.ctitle{font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;margin-bottom:1rem}
/* FORM */
.frow{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
.sgrid{display:flex;flex-wrap:wrap;gap:.45rem;margin-top:.4rem}
.schip{font-family:'DM Mono',monospace;font-size:.65rem;padding:.45rem .8rem;border:1.5px solid var(--border);border-radius:20px;background:var(--light);color:var(--muted);display:flex;align-items:center;gap:.35rem;user-select:none;transition:all .15s}
.schip.on{background:var(--ink);color:var(--sand);border-color:var(--ink)}
.sdot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.rnote{font-family:'DM Mono',monospace;font-size:.6rem;color:var(--muted);background:var(--light);border:1px solid var(--border);border-radius:6px;padding:.5rem .75rem;margin-bottom:.75rem;line-height:1.5}
/* CURRENCY PILLS */
.cprow{display:flex;gap:.5rem;margin-bottom:1rem}
.cpill{flex:1;font-family:'DM Mono',monospace;font-size:.65rem;letter-spacing:.07em;text-transform:uppercase;padding:.5rem;border:1.5px solid var(--border);border-radius:20px;background:var(--light);color:var(--muted);transition:all .2s;text-align:center}
.cpill.AUD.on{background:#c4603a;color:white;border-color:#c4603a}
.cpill.THB.on{background:#7c5cbf;color:white;border-color:#7c5cbf}
.cpill.USD.on{background:#4a7c59;color:white;border-color:#4a7c59}
/* BALANCE */
.brow{display:flex;justify-content:space-between;align-items:center;padding:.7rem 0;border-bottom:1px solid var(--border)}
.brow:last-child{border-bottom:none}
.bname{font-weight:500;font-size:.9rem;display:flex;align-items:center;gap:.5rem}
.bdot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.bsub{font-family:'DM Mono',monospace;font-size:.58rem;color:var(--muted)}
.bamt{font-family:'DM Mono',monospace;font-size:.88rem;font-weight:600}
.pos{color:#4a7c59}.neg{color:#c4603a}.zer{color:var(--muted)}
/* SETTLE */
.srow{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;padding:.7rem 0;border-bottom:1px solid var(--border);font-size:.875rem}
.srow:last-child{border-bottom:none}
.sarr{color:var(--muted);font-size:.7rem}
.samt{font-family:'DM Mono',monospace;font-weight:600;color:#c4603a;margin-left:auto}
/* MEMBERS */
.mtags{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.75rem}
.mtag{display:inline-flex;align-items:center;gap:.4rem;padding:.35rem .75rem;background:var(--light);border:1px solid var(--border);border-radius:20px;font-size:.82rem}
.mtagdot{width:8px;height:8px;border-radius:50%}
.mtagrm{background:none;border:none;color:var(--muted);font-size:.85rem;padding:0;line-height:1}
.amrow{display:flex;gap:.5rem}
.amrow input{flex:1}
.ambtn{padding:0 1rem;background:var(--ink);color:var(--sand);border:none;border-radius:7px;font-family:'DM Mono',monospace;font-size:.6rem;white-space:nowrap}
/* EXPORT BTNS */
.expbtn{font-family:'DM Mono',monospace;font-size:.62rem;letter-spacing:.07em;text-transform:uppercase;padding:.65rem 1rem;border:1.5px solid var(--border);background:var(--light);color:var(--ink);border-radius:7px;width:100%;margin-bottom:.5rem;text-align:left;display:flex;align-items:center;gap:.6rem;transition:all .15s}
.expbtn:active{background:var(--ink);color:var(--sand);border-color:var(--ink)}
/* BOTTOM NAV */
.bot-nav{position:fixed;bottom:0;left:0;right:0;z-index:200;background:var(--ink);border-top:1px solid rgba(255,255,255,.1);display:flex;padding-bottom:var(--safe);height:calc(var(--nav) + var(--safe))}
.nitem{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.2rem;padding:.5rem .25rem;background:none;border:none;color:rgba(245,240,232,.4);transition:color .2s;min-width:0}
.nitem.on{color:var(--gold)}
.nicon{font-size:1.2rem;line-height:1}
.nlabel{font-family:'DM Mono',monospace;font-size:.52rem;letter-spacing:.06em;text-transform:uppercase}
.nadd{background:var(--terra)!important;border-radius:14px!important;margin:.4rem .5rem!important;width:48px!important;flex:none!important;color:white!important;box-shadow:0 2px 8px rgba(196,96,58,.5)!important}
.nadd .nicon{font-size:1.5rem}
/* SHEET */
.overlay{display:none;position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.45)}
.overlay.open{display:flex;align-items:flex-end}
.sheet{background:var(--card);border-radius:16px 16px 0 0;padding:1.25rem;width:100%;padding-bottom:calc(1.25rem + var(--safe));max-height:80vh;overflow-y:auto}
.shandle{width:40px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 1.25rem}
.stitle{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;margin-bottom:1rem}
/* TOAST */
.toast{position:fixed;bottom:calc(var(--nav) + var(--safe) + .75rem);left:50%;transform:translateX(-50%) translateY(12px);background:var(--ink);color:var(--sand);padding:.65rem 1.25rem;border-radius:20px;font-family:'DM Mono',monospace;font-size:.72rem;opacity:0;transition:all .3s;pointer-events:none;z-index:400;white-space:nowrap}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
/* SYNC */
.sync-dot{position:fixed;top:90px;right:12px;background:var(--ink);color:var(--gold);padding:.3rem .7rem;border-radius:20px;font-family:'DM Mono',monospace;font-size:.6rem;z-index:300;display:none}
.sync-dot.show{display:block}
/* DESKTOP */
@media(min-width:768px){
  .bot-nav{display:none}
  .mob-only{display:none!important}
  .dtabs{display:flex}
  .app-main{padding-bottom:2rem;display:grid;grid-template-columns:1fr 300px;gap:1.5rem;padding-top:1.5rem}
  .main-col{min-width:0}
  .side-col{display:block}
}
@media(max-width:767px){
  .desk-only{display:none!important}
  .side-col{display:none}
  .app-main{display:block}
}
</style>
</head>
<body>

<!-- AUTH -->
<div id="auth">
  <div class="auth-box">
    <div class="auth-title">Wander<span style="color:#d4a843">split</span></div>
    <div class="auth-sub">Group travel expenses · shared in real time</div>
    <div class="mode-row">
      <button class="mode-btn on" id="mJoin" onclick="setMode('join')">Join trip</button>
      <button class="mode-btn" id="mCreate" onclick="setMode('create')">Create trip</button>
    </div>
    <div class="fg" id="nameField" style="display:none">
      <label class="flbl">Trip name</label>
      <input id="aName" placeholder="e.g. Thailand Adventure 2025"/>
    </div>
    <div class="fg">
      <label class="flbl" id="codeLabel">Trip code</label>
      <input id="aCode" placeholder="Enter trip code" style="font-family:'DM Mono',monospace;letter-spacing:.1em;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"/>
    </div>
    <div class="err" id="authErr" style="display:none"></div>
    <button class="btn-p" id="authBtn" onclick="doAuth()">Join Trip</button>
    <p style="margin-top:1rem;font-size:.75rem;color:var(--muted);text-align:center;font-family:'DM Mono',monospace" id="authHint">Get the trip code from whoever created the trip.</p>
  </div>
</div>

<!-- APP (hidden until auth) -->
<div id="appWrap" style="display:none">
  <!-- Header -->
  <header class="hdr">
    <div>
      <div class="logo">Wander<em>split</em></div>
      <div class="hdr-sub" id="hdrTripName"></div>
    </div>
    <div class="hdr-btns">
      <div id="rateStatus" style="font-family:'DM Mono',monospace;font-size:.58rem;color:var(--muted);letter-spacing:.05em"></div>
      <button class="icon-btn mob-only" onclick="openSheet('members')">👥</button>
      <button class="icon-btn" onclick="openSheet('export')">↗</button>
      <button class="icon-btn" onclick="leaveTrip()" title="Leave trip" style="font-size:.8rem">✕</button>
    </div>
  </header>

  <!-- Rate ticker -->
  <div class="rate-bar">
    <div class="rate-track" id="rateTicker">
      <span style="color:var(--muted)">AUD→THB <span id="r1" style="color:var(--sage)">…</span></span>
      <span style="color:var(--muted)">AUD→USD <span id="r2" style="color:var(--sage)">…</span></span>
      <span style="color:var(--muted)">THB→USD <span id="r3" style="color:var(--sage)">…</span></span>
      <span id="rtime" style="color:var(--muted)">Fetching rates…</span>
      <span style="color:var(--muted)">AUD→THB <span id="r1b" style="color:var(--sage)">…</span></span>
      <span style="color:var(--muted)">AUD→USD <span id="r2b" style="color:var(--sage)">…</span></span>
      <span style="color:var(--muted)">THB→USD <span id="r3b" style="color:var(--sage)">…</span></span>
      <span style="color:var(--muted)">Rates snapshot saved per expense</span>
    </div>
  </div>

  <!-- Desktop tabs -->
  <div class="dtabs" id="dtabs">
    <button class="dtab on" onclick="setPanel('expenses',this)">Expenses</button>
    <button class="dtab" onclick="setPanel('add',this)">+ Add</button>
    <button class="dtab" onclick="setPanel('balances',this)">Balances</button>
    <button class="dtab" onclick="setPanel('settle',this)">Settle Up</button>
  </div>

  <!-- Main -->
  <main class="app-main">
    <div class="main-col">
      <!-- EXPENSES -->
      <div id="pExpenses">
        <div class="totals">
          <div><div class="tval" id="tAUD">$0</div><div class="tlbl">AUD</div></div>
          <div><div class="tval" id="tTHB">฿0</div><div class="tlbl">THB</div></div>
          <div><div class="tval" id="tUSD">US$0</div><div class="tlbl">USD</div></div>
        </div>
        <div class="shdr"><h2>Expenses</h2><span class="badge" id="ecount">0 items</span></div>
        <div id="elist"></div>
      </div>

      <!-- ADD -->
      <div id="pAdd" style="display:none">
        <div class="card">
          <div class="ctitle">Record Expense</div>
          <div class="fg"><label class="flbl">Description</label><input id="fDesc" placeholder="e.g. Dinner at Thipsamai" autocomplete="off"/></div>
          <div class="frow" style="margin-bottom:.875rem">
            <div><label class="flbl">Amount</label><input id="fAmt" type="number" inputmode="decimal" step="0.01" placeholder="0.00"/></div>
            <div><label class="flbl">Currency</label><select id="fCur"><option value="AUD">🇦🇺 AUD</option><option value="THB">🇹🇭 THB</option><option value="USD">🇺🇸 USD</option></select></div>
          </div>
          <div class="frow" style="margin-bottom:.875rem">
            <div><label class="flbl">Paid By</label><select id="fPaidBy"></select></div>
            <div><label class="flbl">Category</label><select id="fCat"><option>🍽️ Food</option><option>🏨 Accommodation</option><option>🚌 Transport</option><option>🎟️ Activities</option><option>🛍️ Shopping</option><option>💊 Health</option><option>📱 Comms</option><option>🔧 Other</option></select></div>
          </div>
          <div class="fg"><label class="flbl">Date</label><input id="fDate" type="date"/></div>
          <div class="fg"><label class="flbl">Note (optional)</label><textarea id="fNote" placeholder="Any extra details…"></textarea></div>
          <div class="fg"><label class="flbl">Split Between</label><div class="sgrid" id="sgrid"></div></div>
          <div class="rnote" id="rnote">Exchange rate will be snapshot-saved at time of submission.</div>
          <button class="btn-p" id="saveBtn" onclick="addExpense()">Record Expense</button>
        </div>
      </div>

      <!-- BALANCES -->
      <div id="pBalances" style="display:none">
        <div class="card">
          <div class="ctitle">Net Balances</div>
          <div class="cprow">
            <button class="cpill AUD on" onclick="setBalCur('AUD',this)">AUD $</button>
            <button class="cpill THB" onclick="setBalCur('THB',this)">THB ฿</button>
            <button class="cpill USD" onclick="setBalCur('USD',this)">USD $</button>
          </div>
          <div id="blist"></div>
        </div>
      </div>

      <!-- SETTLE -->
      <div id="pSettle" style="display:none">
        <div class="card">
          <div class="ctitle">Settle Up</div>
          <div class="cprow">
            <button class="cpill AUD on" onclick="setSetCur('AUD',this)">AUD $</button>
            <button class="cpill THB" onclick="setSetCur('THB',this)">THB ฿</button>
            <button class="cpill USD" onclick="setSetCur('USD',this)">USD $</button>
          </div>
          <div id="slist"></div>
        </div>
      </div>
    </div>

    <!-- Sidebar desktop -->
    <div class="side-col desk-only">
      <div class="card">
        <div class="ctitle">Members</div>
        <div class="mtags" id="mtagsD"></div>
        <div class="amrow"><input id="nmD" placeholder="Add name…" onkeydown="if(event.key==='Enter')addMember('D')"/><button class="ambtn" onclick="addMember('D')">+ Add</button></div>
      </div>
      <div class="card" id="statsCard">
        <div class="ctitle">Quick Stats</div>
        <div id="statsD"></div>
      </div>
      <div class="card">
        <div class="ctitle">Export</div>
        <button class="expbtn" onclick="exportCSV()">📄 CSV — Spreadsheet</button>
        <button class="expbtn" onclick="exportJSON()">📋 JSON — Full data</button>
        <button class="expbtn" onclick="window.print()">🖨️ Print / Save PDF</button>
        <p style="font-family:'DM Mono',monospace;font-size:.58rem;color:var(--muted);line-height:1.6;margin-top:.5rem">Includes exchange rate per transaction.</p>
      </div>
    </div>
  </main>

  <!-- Bottom nav mobile -->
  <nav class="bot-nav mob-only">
    <button class="nitem on" id="nav-expenses" onclick="mobNav('expenses',this)"><span class="nicon">🧾</span><span class="nlabel">Expenses</span></button>
    <button class="nitem" id="nav-balances" onclick="mobNav('balances',this)"><span class="nicon">⚖️</span><span class="nlabel">Balances</span></button>
    <button class="nitem nadd" onclick="mobNav('add',document.getElementById('nav-add'))" id="nav-add"><span class="nicon">＋</span></button>
    <button class="nitem" id="nav-settle" onclick="mobNav('settle',this)"><span class="nicon">💸</span><span class="nlabel">Settle</span></button>
    <button class="nitem" onclick="openSheet('members')"><span class="nicon">👥</span><span class="nlabel">People</span></button>
  </nav>
</div>

<!-- Sheets -->
<div class="overlay" id="sheet-members" onclick="closeSheet('members')">
  <div class="sheet" onclick="event.stopPropagation()">
    <div class="shandle"></div>
    <div class="stitle">Trip Members</div>
    <div class="mtags" id="mtagsM"></div>
    <div class="amrow"><input id="nmM" placeholder="Add name…" onkeydown="if(event.key==='Enter')addMember('M')"/><button class="ambtn" onclick="addMember('M')">+ Add</button></div>
  </div>
</div>
<div class="overlay" id="sheet-export" onclick="closeSheet('export')">
  <div class="sheet" onclick="event.stopPropagation()">
    <div class="shandle"></div>
    <div class="stitle">Export Records</div>
    <button class="expbtn" onclick="exportCSV();closeSheet('export')">📄 CSV — Spreadsheet</button>
    <button class="expbtn" onclick="exportJSON();closeSheet('export')">📋 JSON — Full data</button>
    <button class="expbtn" onclick="window.print()">🖨️ Print / Save PDF</button>
    <p style="font-family:'DM Mono',monospace;font-size:.6rem;color:var(--muted);line-height:1.6;margin-top:.75rem">Includes exchange rate snapshot per transaction and settlement summary.</p>
  </div>
</div>

<div class="toast" id="toast"></div>
<div class="sync-dot" id="syncDot">Syncing…</div>

<script>
const COLORS=['#c4603a','#4a7c59','#7c5cbf','#d4a843','#3a7ca5','#c4844a','#7a5c7a','#4a8b7a'];
let tripId=null,tripName='',members=[],expenses=[],rates={AUD_THB:22.8,AUD_USD:0.64,THB_USD:0.028,live:false};
let balCur='AUD',setCur='AUD',activePanel='expenses',pollTimer=null;

// ── Helpers ──
function toAUD(a,c,r){r=r||rates;if(c==='AUD')return a;if(c==='THB')return a/(r.AUD_THB||22.8);if(c==='USD')return a/(r.AUD_USD||0.64);return a;}
function toT(a,t,r){r=r||rates;if(t==='AUD')return a;if(t==='THB')return a*(r.AUD_THB||22.8);if(t==='USD')return a*(r.AUD_USD||0.64);return a;}
function fmt(a,c){if(c==='AUD')return'$'+a.toFixed(2);if(c==='THB')return'฿'+Math.round(a).toLocaleString();if(c==='USD')return'US$'+a.toFixed(2);return a.toFixed(2);}
function today(){return new Date().toISOString().split('T')[0];}
function showToast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400);}
function showSync(v){document.getElementById('syncDot').classList.toggle('show',v);}

// ── Rates ──
async function fetchRates(){
  try{
    const r=await fetch('https://open.er-api.com/v6/latest/AUD');
    const d=await r.json();
    rates={AUD_THB:d.rates.THB,AUD_USD:d.rates.USD,THB_USD:d.rates.USD/d.rates.THB,live:true,updated:d.time_last_update_utc};
    updateRateTicker();
  }catch{updateRateTicker();}
}
function updateRateTicker(){
  const ids=[['r1','r1b'],['r2','r2b'],['r3','r3b']];
  const vals=[rates.AUD_THB?.toFixed(2),rates.AUD_USD?.toFixed(4),rates.THB_USD?.toFixed(5)];
  ids.forEach(([a,b],i)=>{[a,b].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=vals[i];});});
  const rt=document.getElementById('rtime');
  if(rt){rt.textContent=rates.live?('✓ '+new Date(rates.updated).toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit'})):'Offline fallback rates';rt.style.color=rates.live?'#4a7c59':'#9e8e7a';}
  const rs=document.getElementById('rateStatus');
  if(rs){rs.textContent=rates.live?'● Live rates':'○ Offline';rs.style.color=rates.live?'#4a7c59':'#9e8e7a';}
  const rn=document.getElementById('rnote');
  if(rn)rn.textContent='Rates at entry: 1 AUD = '+(rates.AUD_THB?.toFixed(2))+' THB = '+(rates.AUD_USD?.toFixed(4))+' USD'+(rates.live?'':' (offline fallback)');
}

// ── Auth ──
function setMode(m){
  const isCreate=m==='create';
  document.getElementById('nameField').style.display=isCreate?'block':'none';
  document.getElementById('codeLabel').textContent=isCreate?'Set a trip code (share this with friends)':'Trip code';
  document.getElementById('aCode').placeholder=isCreate?'e.g. THAI2025':'Enter trip code';
  document.getElementById('authBtn').textContent=isCreate?'Create Trip':'Join Trip';
  document.getElementById('authHint').textContent=isCreate?'Everyone will enter this code to join.':'Get the trip code from whoever created the trip.';
  document.getElementById('mJoin').classList.toggle('on',m==='join');
  document.getElementById('mCreate').classList.toggle('on',m==='create');
  document.getElementById('authErr').style.display='none';
  window._authMode=m;
}
window._authMode='join';

async function doAuth(){
  const code=document.getElementById('aCode').value.trim();
  const name=document.getElementById('aName').value.trim();
  const btn=document.getElementById('authBtn');
  const err=document.getElementById('authErr');
  err.style.display='none';
  if(!code){err.textContent='Please enter a trip code.';err.style.display='block';return;}
  btn.disabled=true;btn.textContent='Please wait…';
  try{
    const body=window._authMode==='create'?{action:'create',name,tripCode:code}:{action:'join',tripCode:code};
    const r=await fetch('/api/trip',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const d=await r.json();
    if(!r.ok){err.textContent=d.error||'Something went wrong.';err.style.display='block';btn.disabled=false;btn.textContent=window._authMode==='create'?'Create Trip':'Join Trip';return;}
    tripId=d.tripId;tripName=d.name;
    sessionStorage.setItem('ws_tid',tripId);sessionStorage.setItem('ws_tn',tripName);
    document.getElementById('auth').style.display='none';
    document.getElementById('appWrap').style.display='block';
    document.getElementById('hdrTripName').textContent=tripName;
    document.getElementById('fDate').value=today();
    await loadData();
    startPoll();
  }catch(e){err.textContent='Network error. Please try again.';err.style.display='block';btn.disabled=false;btn.textContent=window._authMode==='create'?'Create Trip':'Join Trip';}
}

function leaveTrip(){sessionStorage.clear();location.reload();}

// ── Data ──
async function loadData(){
  if(!tripId)return;
  try{
    const[mr,er]=await Promise.all([fetch('/api/members?tripId='+tripId),fetch('/api/expenses?tripId='+tripId)]);
    const[md,ed]=await Promise.all([mr.json(),er.json()]);
    if(Array.isArray(md))members=md;
    if(Array.isArray(ed))expenses=ed.map(e=>({...e,split_with:typeof e.split_with==='string'?JSON.parse(e.split_with):e.split_with}));
    renderAll();
  }catch{}
}

function startPoll(){if(pollTimer)clearInterval(pollTimer);pollTimer=setInterval(loadData,15000);}

// ── Members ──
function renderMembers(){
  ['D','M'].forEach(s=>{
    const c=document.getElementById('mtags'+s);
    if(!c)return;
    c.innerHTML=members.map((m,i)=>'<span class="mtag"><span class="mtagdot" style="background:'+COLORS[i%COLORS.length]+'"></span>'+m.name+'<button class="mtagrm" onclick="removeMember(\''+m.id+'\')">×</button></span>').join('');
  });
  const pb=document.getElementById('fPaidBy');
  if(pb){const prev=pb.value;pb.innerHTML=members.map(m=>'<option'+(m.name===prev?' selected':'')+'>'+m.name+'</option>').join('');}
  renderSplitGrid();
}
async function addMember(s){
  const inp=document.getElementById('nm'+s);
  const name=inp.value.trim();
  if(!name||members.find(m=>m.name===name)){showToast('Enter a unique name');return;}
  const r=await fetch('/api/members',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tripId,name})});
  const d=await r.json();
  members.push(d);inp.value='';renderMembers();showToast(name+' added ✓');
}
async function removeMember(id){
  await fetch('/api/members',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,tripId})});
  members=members.filter(m=>m.id!==id);renderMembers();
}
function renderSplitGrid(){
  const c=document.getElementById('sgrid');if(!c)return;
  c.innerHTML=members.map((m,i)=>'<div class="schip on" id="chip'+i+'" onclick="toggleChip('+i+')"><span class="sdot" style="background:'+COLORS[i%COLORS.length]+'"></span>'+m.name+'</div>').join('');
}
function toggleChip(i){document.getElementById('chip'+i)?.classList.toggle('on');}
function selectedSplit(){return members.filter((_,i)=>document.getElementById('chip'+i)?.classList.contains('on')).map(m=>m.name);}

// ── Expenses ──
async function addExpense(){
  const desc=document.getElementById('fDesc').value.trim();
  const amt=parseFloat(document.getElementById('fAmt').value);
  const cur=document.getElementById('fCur').value;
  const paid=document.getElementById('fPaidBy').value;
  const cat=document.getElementById('fCat').value;
  const date=document.getElementById('fDate').value||today();
  const note=document.getElementById('fNote').value.trim();
  const split=selectedSplit();
  if(!desc||isNaN(amt)||amt<=0){showToast('Fill description & amount');return;}
  if(!split.length){showToast('Select at least one person');return;}
  const btn=document.getElementById('saveBtn');
  btn.disabled=true;btn.textContent='Saving…';showSync(true);
  try{
    const r=await fetch('/api/expenses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tripId,description:desc,amount:amt,currency:cur,audAmount:toAUD(amt,cur,rates),paidBy:paid,category:cat,expenseDate:date,note,splitWith:split,rateAudThb:rates.AUD_THB,rateAudUsd:rates.AUD_USD})});
    if(!r.ok)throw 0;
    await loadData();
    document.getElementById('fDesc').value='';document.getElementById('fAmt').value='';document.getElementById('fNote').value='';
    renderSplitGrid();showToast('Expense saved ✓');
    mobNav('expenses',document.getElementById('nav-expenses'));
  }catch{showToast('Failed to save. Try again.');}
  btn.disabled=false;btn.textContent='Record Expense';showSync(false);
}
async function deleteExpense(id){
  await fetch('/api/expenses',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,tripId})});
  expenses=expenses.filter(e=>e.id!==id);renderExpenses();renderStats();showToast('Removed');
}

function renderExpenses(){
  const c=document.getElementById('elist');
  document.getElementById('ecount').textContent=expenses.length+' item'+(expenses.length!==1?'s':'');
  if(!expenses.length){c.innerHTML='<div class="empty"><div class="empty-icon">🧾</div><p style="font-size:.82rem;line-height:1.6">No expenses yet.<br>Tap <b>+</b> to add the first one.</p></div>';['tAUD','tTHB','tUSD'].forEach((id,i)=>document.getElementById(id).textContent=['$0','฿0','US$0'][i]);return;}
  const sorted=[...expenses].sort((a,b)=>b.expense_date?.localeCompare(a.expense_date));
  c.innerHTML=sorted.map(e=>{
    const eq=e.currency!=='AUD'?'≈ '+fmt(e.aud_amount,'AUD'):'';
    return '<div class="eitem"><div><div class="edesc">'+(e.category?.split(' ')[0]||'')+' '+e.description+'</div><div class="emeta">'+e.expense_date+' · <b>'+e.paid_by+'</b> paid</div><div class="esplit">Split: '+e.split_with.join(', ')+'</div>'+(e.note?'<div class="enote">'+e.note+'</div>':'')+'</div><div><div class="eamt">'+fmt(e.amount,e.currency)+'<span class="cbadge cb-'+e.currency+'">'+e.currency+'</span></div>'+(eq?'<div class="eeq">'+eq+'</div>':'')+'<div style="text-align:right;margin-top:.35rem"><button class="dbtn" onclick="deleteExpense(\''+e.id+'\')">🗑</button></div></div></div>';
  }).join('');
  let tA=0,tT=0,tU=0;
  expenses.forEach(e=>{tA+=e.aud_amount||0;tT+=toT(e.aud_amount||0,'THB',{AUD_THB:e.rate_aud_thb||rates.AUD_THB});tU+=toT(e.aud_amount||0,'USD',{AUD_USD:e.rate_aud_usd||rates.AUD_USD});});
  document.getElementById('tAUD').textContent=fmt(tA,'AUD');
  document.getElementById('tTHB').textContent=fmt(tT,'THB');
  document.getElementById('tUSD').textContent=fmt(tU,'USD');
}

// ── Balances & Settle ──
function computeNet(){
  const paid={},owed={};
  members.forEach(m=>{paid[m.name]=0;owed[m.name]=0;});
  expenses.forEach(e=>{const share=e.aud_amount/(e.split_with.length||1);paid[e.paid_by]=(paid[e.paid_by]||0)+e.aud_amount;e.split_with.forEach(p=>{owed[p]=(owed[p]||0)+share;});});
  const net={};members.forEach(m=>{net[m.name]=(paid[m.name]||0)-(owed[m.name]||0);});return net;
}
function getSettleTxns(){
  const net=computeNet();
  let d=[],cr=[];
  Object.entries(net).forEach(([n,v])=>{if(v<-0.01)d.push({name:n,amt:-v});else if(v>0.01)cr.push({name:n,amt:v});});
  d.sort((a,b)=>b.amt-a.amt);cr.sort((a,b)=>b.amt-a.amt);
  const t=[];let i=0,j=0;
  while(i<d.length&&j<cr.length){const p=Math.min(d[i].amt,cr[j].amt);t.push({from:d[i].name,to:cr[j].name,audAmt:p});d[i].amt-=p;cr[j].amt-=p;if(d[i].amt<0.01)i++;if(cr[j].amt<0.01)j++;}
  return t;
}
function renderBalances(){
  const net=computeNet();
  document.getElementById('blist').innerHTML=members.map((m,i)=>{
    const v=net[m.name]||0,cv=toT(v,balCur,rates);
    const cls=v>0.01?'pos':v<-0.01?'neg':'zer';
    const lbl=v>0.01?'gets back':v<-0.01?'owes':'settled ✓';
    return '<div class="brow"><div class="bname"><span class="bdot" style="background:'+COLORS[i%COLORS.length]+'"></span>'+m.name+' <span class="bsub">'+lbl+'</span></div><div class="bamt '+cls+'">'+(v>0.01?'+':'')+fmt(cv,balCur)+'</div></div>';
  }).join('');
}
function renderSettlements(){
  const t=getSettleTxns();
  document.getElementById('slist').innerHTML=t.length?t.map(x=>'<div class="srow"><b>'+x.from+'</b><span class="sarr">→ pays →</span><b>'+x.to+'</b><span class="samt">'+fmt(toT(x.audAmt,setCur,rates),setCur)+'</span></div>').join(''):'<div style="text-align:center;padding:2rem;color:var(--muted);font-family:\'DM Mono\',monospace;font-size:.8rem">✓ Everyone is settled up!</div>';
}
function setBalCur(c,btn){balCur=c;btn.parentElement.querySelectorAll('.cpill').forEach(b=>b.classList.remove('on'));btn.classList.add('on');renderBalances();}
function setSetCur(c,btn){setCur=c;btn.parentElement.querySelectorAll('.cpill').forEach(b=>b.classList.remove('on'));btn.classList.add('on');renderSettlements();}

// ── Stats ──
function renderStats(){
  const c=document.getElementById('statsD');if(!c)return;
  if(!expenses.length){c.innerHTML='<p style="color:var(--muted);font-size:.8rem">Add expenses to see stats.</p>';return;}
  const cats={};expenses.forEach(e=>{cats[e.category]=(cats[e.category]||0)+(e.aud_amount||0);});
  const top=Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const total=expenses.reduce((s,e)=>s+(e.aud_amount||0),0),pp=total/(members.length||1);
  c.innerHTML=top.map(([k,v])=>'<div style="display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--border);font-size:.83rem"><span>'+k+'</span><span style="font-family:\'DM Mono\',monospace;font-weight:500">'+fmt(v,'AUD')+'</span></div>').join('')+'<div style="display:flex;justify-content:space-between;background:var(--light);border-radius:7px;padding:.6rem .875rem;margin-top:.6rem;font-size:.83rem"><span>Avg per person</span><span style="font-family:\'DM Mono\',monospace;font-weight:600;color:#c4603a">'+fmt(pp,'AUD')+'</span></div>';
}

// ── Navigation ──
function setPanel(name,btn){
  ['Expenses','Add','Balances','Settle'].forEach(p=>document.getElementById('p'+p).style.display='none');
  document.getElementById('p'+name.charAt(0).toUpperCase()+name.slice(1)).style.display='block';
  activePanel=name;
  if(name==='balances')renderBalances();
  if(name==='settle')renderSettlements();
  if(btn){document.querySelectorAll('.dtab').forEach(b=>b.classList.remove('on'));btn.classList.add('on');}
}
function mobNav(name,btn){
  setPanel(name,null);
  document.querySelectorAll('.nitem').forEach(b=>b.classList.remove('on'));
  if(btn)btn.classList.add('on');
  window.scrollTo({top:0,behavior:'smooth'});
}

// ── Sheets ──
function openSheet(n){document.getElementById('sheet-'+n).classList.add('open');document.body.style.overflow='hidden';}
function closeSheet(n){document.getElementById('sheet-'+n).classList.remove('open');document.body.style.overflow='';}

// ── Export ──
function exportCSV(){
  let csv='Date,Description,Category,Currency,Amount,AUD Equivalent,Paid By,Split Between,Note,Rate AUD→THB,Rate AUD→USD\\n';
  expenses.forEach(e=>{csv+='"'+e.expense_date+'","'+e.description+'","'+e.category+'","'+e.currency+'","'+e.amount+'","'+(e.aud_amount?.toFixed(2))+'","'+e.paid_by+'","'+e.split_with.join('; ')+'","'+(e.note||'')+'","'+(e.rate_aud_thb||'')+'","'+(e.rate_aud_usd||'')+'"\\n';});
  csv+='\\nSettlement Summary\\nFrom,To,AUD Amount\\n';
  getSettleTxns().forEach(t=>{csv+='"'+t.from+'","'+t.to+'","'+t.audAmt.toFixed(2)+'"\\n';});
  const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([csv],{type:'text/csv'})),download:'wandersplit.csv'});a.click();
  showToast('CSV downloaded ✓');
}
function exportJSON(){
  const data={tripName,exportedAt:new Date().toISOString(),members,expenses,rates,settlements:getSettleTxns()};
  const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),download:'wandersplit.json'});a.click();
  showToast('JSON downloaded ✓');
}

// ── Render all ──
function renderAll(){renderExpenses();renderMembers();renderStats();if(activePanel==='balances')renderBalances();if(activePanel==='settle')renderSettlements();}

// ── Init ──
(function init(){
  const tid=sessionStorage.getItem('ws_tid'),tn=sessionStorage.getItem('ws_tn');
  if(tid){
    tripId=tid;tripName=tn||'';
    document.getElementById('auth').style.display='none';
    document.getElementById('appWrap').style.display='block';
    document.getElementById('hdrTripName').textContent=tripName;
    document.getElementById('fDate').value=today();
    loadData();startPoll();
  }
  fetchRates();
  setInterval(fetchRates,5*60*1000);
})();
</script>
</body>
</html>`);
}
