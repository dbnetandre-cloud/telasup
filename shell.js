'use strict';

/* ══════════════════════════════════════════════════════
   SHELL — barra de abas estilo navegador.
   Cada aba é um <iframe src="app.html?tab=ID">, então tem DOM, estado,
   requisições em andamento e rolagem próprios: dá para deixar um cliente
   aberto e fazer outra busca na aba ao lado sem perder nada.
══════════════════════════════════════════════════════ */

const ABAS_KEY      = 'ideiaSupAbas';
const TITULO_VAZIO  = 'Nova busca';
const TITULO_SITE   = 'Portal DBNET';
const MAX_ABAS      = 12;
const MODO_TESTE    = new URLSearchParams(location.search).has('test');

const elTabs   = document.getElementById('tabs');
const elFrames = document.getElementById('tab-frames');
const btnNova  = document.getElementById('tab-new');

// abas = [{ id, titulo }] na ordem exibida; cada uma pode ter .frame (criado só quando abre)
let abas  = [];
let ativa = null;

// ─── persistência (só da sessão do navegador, igual ao app) ───────────
function salvar() {
  try {
    sessionStorage.setItem(ABAS_KEY, JSON.stringify({
      ativa,
      abas: abas.map(a => ({ id: a.id, titulo: a.titulo }))
    }));
  } catch (_) {}
}

function carregar() {
  try {
    const d = JSON.parse(sessionStorage.getItem(ABAS_KEY) || 'null');
    if (d && Array.isArray(d.abas) && d.abas.length) {
      abas  = d.abas.map(a => ({ id: String(a.id), titulo: String(a.titulo || '') }));
      ativa = abas.some(a => a.id === d.ativa) ? d.ativa : abas[0].id;
      return;
    }
  } catch (_) {}
  abas  = [novaAba()];
  ativa = abas[0].id;
}

function novaAba() {
  return { id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), titulo: '' };
}

// ─── iframe da aba ────────────────────────────────────────────────────
function garantirFrame(aba) {
  if (aba.frame) return aba.frame;
  const f = document.createElement('iframe');
  f.className = 'tab-frame';
  f.title = aba.titulo || TITULO_VAZIO;
  f.src = 'app.html?tab=' + encodeURIComponent(aba.id) + (MODO_TESTE ? '&test' : '');
  elFrames.appendChild(f);
  aba.frame = f;
  return f;
}

// ─── ações ────────────────────────────────────────────────────────────
function abrirAba() {
  if (abas.length >= MAX_ABAS) { alert(`Limite de ${MAX_ABAS} abas abertas.`); return; }
  const aba = novaAba();
  // entra logo depois da ativa, como no navegador
  const i = abas.findIndex(a => a.id === ativa);
  abas.splice(i + 1, 0, aba);
  ativar(aba.id, true);
}

function ativar(id, focarBusca) {
  const aba = abas.find(a => a.id === id);
  if (!aba) return;
  ativa = id;
  garantirFrame(aba);
  abas.forEach(a => a.frame && a.frame.classList.toggle('ativo', a.id === id));
  render();
  salvar();
  if (focarBusca) {
    // a aba nova abre na busca: já deixa o cursor no campo
    const f = aba.frame;
    f.addEventListener('load', () => {
      try { f.contentDocument.getElementById('search-input')?.focus(); } catch (_) {}
    }, { once: true });
  } else {
    try { aba.frame.contentWindow.focus(); } catch (_) {}
  }
}

function fecharAba(id) {
  const i = abas.findIndex(a => a.id === id);
  if (i < 0) return;
  const aba = abas[i];

  // aba com cliente aberto: pede confirmação para não perder sem querer
  if (aba.titulo && !confirm(`Fechar a aba de "${aba.titulo}"?`)) return;

  if (aba.frame) aba.frame.remove();
  try { sessionStorage.removeItem('ideiaSupSessao:' + aba.id); } catch (_) {}
  abas.splice(i, 1);

  if (!abas.length) {              // fechou a última: sobra uma busca vazia
    abas.push(novaAba());
    ativar(abas[0].id, true);
    return;
  }
  if (ativa === id) ativar(abas[Math.min(i, abas.length - 1)].id);
  else { render(); salvar(); }
}

// ─── barra ────────────────────────────────────────────────────────────
function render() {
  elTabs.innerHTML = '';
  abas.forEach(aba => {
    const el = document.createElement('div');
    el.className = 'tab' + (aba.id === ativa ? ' ativa' : '') + (aba.titulo ? '' : ' vazia');
    el.setAttribute('role', 'tab');
    el.setAttribute('aria-selected', String(aba.id === ativa));
    el.title = aba.titulo || TITULO_VAZIO;
    el.dataset.id = aba.id;

    const ico = document.createElement('span');
    ico.className = 'tab-ico';
    ico.innerHTML = aba.titulo
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

    const txt = document.createElement('span');
    txt.className = 'tab-titulo';
    txt.textContent = aba.titulo || TITULO_VAZIO;

    const x = document.createElement('button');
    x.className = 'tab-fechar';
    x.title = 'Fechar aba';
    x.setAttribute('aria-label', 'Fechar aba');
    x.innerHTML = '<svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    x.addEventListener('click', e => { e.stopPropagation(); fecharAba(aba.id); });

    el.append(ico, txt, x);
    el.addEventListener('click', () => { if (aba.id !== ativa) ativar(aba.id); });
    el.addEventListener('auxclick', e => { if (e.button === 1) { e.preventDefault(); fecharAba(aba.id); } });
    elTabs.appendChild(el);
  });

  const atual = abas.find(a => a.id === ativa);
  document.title = atual && atual.titulo ? `${atual.titulo} — ${TITULO_SITE}` : `${TITULO_SITE} — Consulta de Clientes`;
}

// ─── mensagens vindas das abas ────────────────────────────────────────
window.addEventListener('message', e => {
  const aba = abas.find(a => a.frame && a.frame.contentWindow === e.source);
  if (!aba) return;                                  // só aceita de iframes nossos
  const d = e.data || {};

  if (d.type === 'titulo') {
    aba.titulo = String(d.titulo || '').trim();
    aba.frame.title = aba.titulo || TITULO_VAZIO;
    render(); salvar();
  }

  if (d.type === 'atalho') {
    if (d.tecla === 't') abrirAba();
    if (d.tecla === 'w') fecharAba(aba.id);
  }

  if (d.type === 'tema') {                           // tema vale para todas as abas
    document.documentElement.setAttribute('data-theme', d.tema);
    abas.forEach(a => {
      if (a !== aba && a.frame) a.frame.contentWindow.postMessage({ type: 'tema', tema: d.tema }, '*');
    });
  }
});

// ─── atalhos (estilo navegador) ───────────────────────────────────────
// Ctrl+Alt+T = nova aba, Ctrl+Alt+W = fechar aba. (Ctrl+T/W puros o navegador não deixa interceptar.)
function atalhos(e) {
  if (!(e.ctrlKey && e.altKey)) return;
  const k = e.key.toLowerCase();
  if (k === 't') { e.preventDefault(); abrirAba(); }
  if (k === 'w') { e.preventDefault(); fecharAba(ativa); }
}
document.addEventListener('keydown', atalhos);

btnNova.addEventListener('click', abrirAba);

carregar();
ativar(ativa);
