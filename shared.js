// ---- SHARED STATE (localStorage-backed) ----
function loadState() {
  try {
    const s = localStorage.getItem('cashflow_state');
    if (s) return JSON.parse(s);
  } catch {}
  return { expenses: [], friends: [], hisab: {}, received: [] };
}
function saveState() {
  localStorage.setItem('cashflow_state', JSON.stringify(state));
}
const state = loadState();

// ---- HELPERS ----
function today() { return new Date().toISOString().split('T')[0]; }
function fmt(n) { return '₹' + Number(n).toFixed(2); }
function nextId(arr) { return arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1; }
function trashIcon() {
  return `<svg viewBox="0 0 24 24"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
}
function showErr(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg; el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}
function calcBalances() {
  const bal = {};
  state.friends.forEach(f => {
    bal[f.id] = { friend_id: f.id, friend_name: f.name, you_owe: 0, owed_to_you: 0 };
  });
  Object.entries(state.hisab).forEach(([fid, entries]) => {
    const id = parseInt(fid);
    if (!bal[id]) {
      const fr = state.friends.find(f => f.id === id);
      bal[id] = { friend_id: id, friend_name: fr ? fr.name : 'Unknown', you_owe: 0, owed_to_you: 0 };
    }
    (entries || []).forEach(e => {
      if (e.direction === 'you_owe') bal[id].you_owe += e.amount;
      else bal[id].owed_to_you += e.amount;
    });
  });
  return Object.values(bal);
}

// ---- BOTTOM NAV ----
function bottomNav(active) {
  return `
  <nav class="bottom">
    <a href="dashboard.html" class="${active==='dashboard'?'active':''}">
      <svg viewBox="0 0 24 24"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
      Home
    </a>
    <a href="expenses.html" class="${active==='expenses'?'active':''}">
      <svg viewBox="0 0 24 24"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
      Expenses
    </a>
    <a href="friends.html" class="${active==='friends'?'active':''}">
      <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
      Friends
    </a>
    <a href="profile.html" class="${active==='profile'?'active':''}">
      <svg viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      Profile
    </a>
  </nav>`;
}