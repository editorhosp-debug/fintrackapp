// --- Helpers ---
const money = v => Number(v).toFixed(2).replace('.', ',');
const formatBRL = v => `R$ ${money(v)}`;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// --- Storage ---
const KEY = 'controle_financeiro_v1';
let state = { transactions: [] };
function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.transactions) state = s; } catch (e) {} }

// --- Elements ---
const txList = document.getElementById('txList');
const balanceEl = document.getElementById('balance');
const summaryEl = document.getElementById('summary');
const chartCtx = document.getElementById('summaryChart');
let chart;

// --- Render ---
function render() {
  const filterType = document.getElementById('filterType').value;
  const filterText = (document.getElementById('filterText').value || '').toLowerCase();
  txList.innerHTML = '';
  const arr = state.transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterText && !(t.desc || '').toLowerCase().includes(filterText)) return false;
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  let entradas = 0, saidas = 0;
  arr.forEach(t => {
    const div = document.createElement('div');
    div.className = `tx ${t.type}`;
    div.innerHTML = `
      <div>
        <div><strong>${t.desc || (t.type === 'entrada' ? 'Entrada' : 'Saída')}</strong></div>
        <div class="small">${t.date ? new Date(t.date).toLocaleDateString() : ''}</div>
      </div>
      <div style="text-align:right">
        <div><strong>${formatBRL(t.amount)}</strong></div>
        <div class="small">${t.recurring ? 'Recorrente • ' + t.recurrence : ''}</div>
        <div style="margin-top:6px">
          <button data-id="${t.id}" class="btn ghost" onclick="removeTx('${t.id}')">Apagar</button>
        </div>
      </div>`;
    txList.appendChild(div);
    if (t.type === 'entrada') entradas += Number(t.amount);
    else saidas += Number(t.amount);
  });

  const balance = entradas - saidas;
  balanceEl.textContent = formatBRL(balance);
  summaryEl.textContent = `Entradas: ${formatBRL(entradas)} • Saídas: ${formatBRL(saidas)}`;

  const data = { labels: ['Entradas', 'Saídas'], datasets: [{ label: 'Resumo', data: [entradas, saidas] }] };
  if (chart) { chart.data = data; chart.update(); }
  else { chart = new Chart(chartCtx, { type: 'bar', data, options: { responsive: true, plugins: { legend: { display: false } } } }); }
}

function addTx(tx) { state.transactions.push(tx); save(); render(); }
function removeTx(id) { state.transactions = state.transactions.filter(t => t.id !== id); save(); render(); }

// --- Recurrence ---
function expandRecurrence(tx) {
  if (!tx.recurrence || tx.recurrence === 'none') return [tx];
  const out = [];
  let d = tx.date ? new Date(tx.date) : new Date();
  for (let i = 0; i < 6; i++) {
    const nxt = { ...tx, id: uid(), date: d.toISOString().slice(0, 10) };
    out.push(nxt);
    if (tx.recurrence === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (tx.recurrence === 'weekly') d.setDate(d.getDate() + 7);
  }
  return out;
}

// --- Form ---
document.getElementById('txForm').addEventListener('submit', e => {
  e.preventDefault();
  const type = document.getElementById('type').value;
  const amount = Math.abs(Number(document.getElementById('amount').value) || 0).toFixed(2);
  const desc = document.getElementById('desc').value.trim();
  const date = document.getElementById('date').value || new Date().toISOString().slice(0, 10);
  const recurrence = document.getElementById('recurrence').value;
  const recurring = recurrence !== 'none';
  if (!amount || Number(amount) === 0) return alert('Insira um valor válido');
  const base = { id: uid(), type, amount, desc, date, recurring, recurrence };
  const items = expandRecurrence(base);
  items.forEach(it => addTx(it));
  e.target.reset();
});

// --- Amostra ---
document.getElementById('addSample').addEventListener('click', () => {
  const now = new Date().toISOString().slice(0, 10);
  addTx({ id: uid(), type: 'entrada', amount: 2500.00, desc: 'Salário', date: now, recurring: false, recurrence: 'none' });
  addTx({ id: uid(), type: 'saida', amount: 120.50, desc: 'Supermercado', date: now, recurring: false, recurrence: 'none' });
});

// --- Filtros ---
document.getElementById('applyFilter').addEventListener('click', render);
document.getElementById('resetFilter').addEventListener('click', () => {
  document.getElementById('filterType').value = 'all';
  document.getElementById('filterText').value = '';
  render();
});

// --- Exportar CSV ---
document.getElementById('exportBtn').addEventListener('click', () => {
  const rows = [['id', 'tipo', 'valor', 'descricao', 'data', 'recorrente', 'periodo']];
  state.transactions.forEach(t => rows.push([t.id, t.type, t.amount, t.desc, t.date, t.recurring, t.recurrence]));
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'transacoes.csv'; a.click(); URL.revokeObjectURL(url);
});

// --- Limpar ---
document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm('Remover todos os dados salvos?')) {
    state.transactions = [];
    save();
    render();
  }
});

// --- Tema ---
const themeToggle = document.getElementById('themeToggle');
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
}
themeToggle.addEventListener('click', () =>
  setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')
);

(function init() {
  load();
  const saved = localStorage.getItem('theme') ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  setTheme(saved);
  render();
})();
