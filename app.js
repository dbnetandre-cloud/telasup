'use strict';

/* ══════════════════════════════════════════════════════
   ISP PORTAL — app.js
   Fluxo: Busca → Endereço → Login → Dashboard
══════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════
// TEMA — 5 opções, alternadas em sequência no mesmo botão
// (persistido em localStorage)
// ══════════════════════════════════════════════════════
const THEME_KEY = 'ideiaSupTema';
const TEMAS = ['dark', 'dim', 'light', 'sepia', 'green'];
const TEMA_LABEL = {
  dark:  'Escuro',
  dim:   'Escuro suave',
  light: 'Claro',
  sepia: 'Claro sépia',
  green: 'Verde',
};

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);
}

function themeIconsSvgHtml() {
  return `
      <svg class="icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="2"/>
        <path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12h2.5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <svg class="icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg class="icon-dim" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>
      </svg>
      <svg class="icon-sepia" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M8 3.5c-.5 1 .5 1.5 0 2.5M12 3.5c-.5 1 .5 1.5 0 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <svg class="icon-leaf" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M21 3c0 9-5 15-11 17-3 1-6 0-7-1s-2-4-1-7C4 6 10 3 21 3z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 19c2-5 6-9 11-11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`;
}

function themeToggleButtonHtml(id = 'btn-theme-toggle') {
  return `
    <button class="btn-theme-toggle" id="${id}" title="Alternar tema">
      ${themeIconsSvgHtml()}
    </button>`;
}

function themeMenuItemHtml(id) {
  return `
    <button type="button" class="header-menu-item btn-theme-toggle" id="${id}" role="menuitem" title="Alternar tema">
      ${themeIconsSvgHtml()}
      <span>Alternar tema</span>
    </button>`;
}

function alternarTema() {
  const atual = document.documentElement.getAttribute('data-theme');
  const idx   = TEMAS.includes(atual) ? TEMAS.indexOf(atual) : 0;
  const novo  = TEMAS[(idx + 1) % TEMAS.length];
  aplicarTema(novo);
  try { localStorage.setItem(THEME_KEY, novo); } catch (_) {}
  avisarShell({ type: 'tema', tema: novo });
}

function atualizarTituloTema() {
  const atual = document.documentElement.getAttribute('data-theme');
  const idx   = TEMAS.includes(atual) ? TEMAS.indexOf(atual) : 0;
  const proximo = TEMAS[(idx + 1) % TEMAS.length];
  const titulo = `Tema: ${TEMA_LABEL[TEMAS[idx]]} (clique para ${TEMA_LABEL[proximo]})`;
  document.querySelectorAll('.btn-theme-toggle').forEach(btn => { btn.title = titulo; });
}

function bindThemeToggleButton(btn) {
  if (!btn) return;
  btn.addEventListener('click', () => { alternarTema(); atualizarTituloTema(); });
}

// ══════════════════════════════════════════════════════
// ABAS — o app roda dentro de um iframe do index.html (uma aba = um iframe)
// ══════════════════════════════════════════════════════
const ABA_ID = new URLSearchParams(window.location.search).get('tab') || 'unica';

function avisarShell(msg) {
  if (window.parent === window) return;   // aberto direto (app.html), sem shell
  window.parent.postMessage({ ...msg, tab: ABA_ID }, '*');
}

window.addEventListener('message', e => {
  if (e.source !== window.parent) return;
  if (e.data?.type === 'tema' && TEMAS.includes(e.data.tema)) {
    aplicarTema(e.data.tema);
    atualizarTituloTema();
  }
});

// Atalhos de aba (Ctrl+Alt+T / Ctrl+Alt+W) com o foco dentro do iframe: repassa ao shell
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.altKey && ['t', 'w'].includes(e.key.toLowerCase())) {
    e.preventDefault();
    avisarShell({ type: 'atalho', tecla: e.key.toLowerCase() });
  }
});

// Aplica o tema salvo o quanto antes, para evitar flash de tela.
(function initTema() {
  let salvo = null;
  try { salvo = localStorage.getItem(THEME_KEY); } catch (_) {}
  aplicarTema(TEMAS.includes(salvo) ? salvo : 'dark');
})();

// ══════════════════════════════════════════════════════
// CONFIGURAÇÃO DOS WEBHOOKS
// ══════════════════════════════════════════════════════
// ── Detecta modo teste via URL: index.html?test ───────
const TEST_MODE = new URLSearchParams(window.location.search).has('test');

const WEBHOOK = {
  // Produção (padrão)
  busca_cliente  : 'https://n8n.dbnet.com.vc/webhook/ideia-busca-cliente',
  busca_logins   : 'https://n8n.dbnet.com.vc/webhook/ideia-busca-logins',
  busca_info     : 'https://n8n.dbnet.com.vc/webhook/ideia-busca-informacoes',
  busca_todas_os : 'https://n8n.dbnet.com.vc/webhook/ideia-busca-todas-os',
  // TODO: trocar para o webhook de produção quando estiver pronto
  abrir_atendimento : 'https://n8n.dbnet.com.vc/webhook-test/telasup-abrir-atendimento',
  historico_potencia : 'https://n8n.dbnet.com.vc/webhook/historico-potencia',
  pegar_url_acs : 'https://n8n.dbnet.com.vc/webhook/pegar-url-acs',
  // Ações do card Dados Gerais (enquanto a URL estiver vazia, o botão avisa que não está configurado)
  limpar_mac : 'https://n8n.dbnet.com.vc/webhook/limpar-mac',
  desconectar_login : 'https://n8n.dbnet.com.vc/webhook/desconectar-login',
  reiniciar_onu : 'https://n8n.dbnet.com.vc/webhook/reiniciar-onu',   // { id_onu, login_id, cliente_id }
  reiniciar_roteador : 'https://n8n.dbnet.com.vc/webhook/reiniciar-roteador',   // { login } → [{ content: [{ type:'text', text:'Device rebooted' }] }]
  potencia_atual : 'https://n8n.dbnet.com.vc/webhook/puxar-potencia-atual',   // { id_onu, login_id, cliente_id } → [{ data: "<html do IXC>" }] (só Sinal Rx/Tx, Temperatura e Voltagem são lidos)
  status_conexao : 'https://n8n.dbnet.com.vc/webhook/recarregar-ip',   // leve: { login_id, cliente_id } → { online: 'S'|'N', ip } (vazio = Recarregar refaz tudo)

  // Teste (ativo quando URL contém ?test)
  test_busca_cliente  : 'https://n8n.dbnet.com.vc/webhook-test/ideia-busca-cliente',
  test_busca_logins   : 'https://n8n.dbnet.com.vc/webhook-test/ideia-busca-logins',
  test_busca_info     : 'https://n8n.dbnet.com.vc/webhook-test/ideia-busca-informacoes',
  test_busca_todas_os : 'https://n8n.dbnet.com.vc/webhook-test/ideia-busca-todas-os',
  test_abrir_atendimento : 'https://n8n.dbnet.com.vc/webhook-test/telasup-abrir-atendimento',
  test_historico_potencia : 'https://n8n.dbnet.com.vc/webhook/historico-potencia',
  test_pegar_url_acs : 'https://n8n.dbnet.com.vc/webhook/pegar-url-acs',
  test_limpar_mac : 'https://n8n.dbnet.com.vc/webhook/limpar-mac',
  test_desconectar_login : 'https://n8n.dbnet.com.vc/webhook/desconectar-login',
  test_reiniciar_onu : 'https://n8n.dbnet.com.vc/webhook/reiniciar-onu',
  test_reiniciar_roteador : 'https://n8n.dbnet.com.vc/webhook/reiniciar-roteador',
  test_potencia_atual : 'https://n8n.dbnet.com.vc/webhook/puxar-potencia-atual',
  test_status_conexao : 'https://n8n.dbnet.com.vc/webhook/recarregar-ip',

  token : 'Bearer 6a9d4bda75d5c9a7c60d4f3d22cdc5c39a83bd27f3b5399bb027834e524d6dd4',

  // Retorna a URL correta conforme o modo
  url(key) { return TEST_MODE ? this[`test_${key}`] : this[key]; }
};

/*
  ─── O QUE CADA WEBHOOK ENVIA E RECEBE ───────────────

  [1] busca_cliente
      Envia:   { "nome": "João Silva" }
      Retorna: [{ "cliente_id": 1, "nome": "João...", "cpf": "...",
                  "enderecos": [{ "cidade":"SP", "bairro":"...", "rua":"...", "numero":"..." }] }]

  [2] busca_logins
      Envia:   { "cliente_id": 1 }
      Retorna: [{ "login_id": 101, "login": "joao.vm", "plano": "Fibra 500MB",
                  "status_conexao": "online", "status_acesso": "Ativo" }]
      → Se retornar 1 login, pula a tela de seleção automaticamente

  [3] busca_info
      Envia:   { "login_id": 101 }
      Retorna: { login, senha, plano, ip_roteador, status_conexao, status_acesso,
                 quedas, endereco, comodatos, produtos_contratados,
                 telefonia, fibra_onu, financeiro, ordens_servico,
                 regiao_manutencao }
      → regiao_manutencao: [{ "em_manutencao_s_n": "S" | "N" }] — último array,
        depois das ordens de serviço. "S" mostra aviso 🛠️ no card Avisos.

  [4] historico_potencia
      Envia:   { "login_id": 101 }
      Retorna: [{ "sinal_rx": "-22.59", "temperatura": "45.00", "data": "05/08/2026" }, ...]

  [5] pegar_url_acs
      Envia:   { "login": "23442andre" } — login PPPoE (número + nome), não o login_id
      Retorna: string/URL do ACS (aceita string direta, { "url": "..." } ou array de qualquer um dos dois)

  [6] status_conexao (recarregar-ip) — botão Recarregar do card Dados Gerais
      Envia:   { "login_id": 101, "cliente_id": 1, "login": "23442andre" }
      Retorna: { "online": "S" | "N", "ip": "177.52.30.142" } (ou array com um objeto)
*/

// ══════════════════════════════════════════════════════
// ESTADO
// ══════════════════════════════════════════════════════
const state = {
  clienteSelecionado: null,  // guarda { cliente_id, nome, cpf, contatos }
  loginSelecionado:   null,  // guarda { login_id } do login escolhido na etapa 3
  contratoId:         null   // guarda o id_contrato retornado pelo webhook busca_info
};

// ══════════════════════════════════════════════════════
// SESSÃO — mantém o cliente atual entre recarregamentos (F5)
// ══════════════════════════════════════════════════════
const SESSION_KEY = 'ideiaSupSessao:' + ABA_ID;

function salvarSessao() {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      cliente: state.clienteSelecionado,
      login:   state.loginSelecionado
    }));
  } catch (_) {}
}

function limparSessao() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
}

function lerSessao() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

async function restaurarSessao() {
  const sessao = lerSessao();
  if (!sessao || !sessao.login || !sessao.login.login_id) return;

  state.clienteSelecionado = sessao.cliente;
  setLoadingOverlay(true, 'Restaurando sessão...');
  try {
    await etapa4_carregarDashboard(sessao.login);
  } catch (err) {
    console.error('[restaurar sessão]', err);
    limparSessao();
  } finally {
    setLoadingOverlay(false);
  }
}

// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  setupSearch();
  setupBackButtons();
  setupModal();
  setupModalAtendimento();
  setupModalPotencia();

  // Botão de tema também na tela de busca
  const slotTemaBusca = document.getElementById('search-theme-toggle-slot');
  if (slotTemaBusca) {
    slotTemaBusca.innerHTML = themeToggleButtonHtml('btn-theme-toggle-search');
    bindThemeToggleButton(document.getElementById('btn-theme-toggle-search'));
  }
  atualizarTituloTema();

  // Exibe badge se estiver em modo teste
  if (TEST_MODE) {
    document.getElementById('test-mode-badge').classList.remove('hidden');
  }

  restaurarSessao();
});

// ══════════════════════════════════════════════════════
// ETAPA 1 — BUSCA POR NOME
// ══════════════════════════════════════════════════════
function setupSearch() {
  const input    = document.getElementById('search-input');
  const dropdown = document.getElementById('search-dropdown');
  const clearBtn = document.getElementById('search-clear');
  const noRes    = document.getElementById('no-results');
  const errBox   = document.getElementById('search-error');
  const btnBuscar= document.getElementById('btn-buscar');

  input.addEventListener('input', () => {
    clearBtn.classList.toggle('hidden', input.value.trim().length === 0);
    hide(dropdown); hide(noRes); hide(errBox);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter')  executarBusca();
    if (e.key === 'Escape') { hide(dropdown); input.blur(); }
  });

  btnBuscar.addEventListener('click', executarBusca);

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.add('hidden');
    hide(dropdown); hide(noRes); hide(errBox);
    input.focus();
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-box-wrapper')) hide(dropdown);
  });

  async function executarBusca() {
    const nome = input.value.trim();
    if (nome.length < 2) {
      mostrarErro('Digite pelo menos 2 caracteres.'); return;
    }

    hide(dropdown); hide(noRes); hide(errBox);
    setBuscando(true);

    try {
      // ── Webhook 1: recebe nome, devolve clientes + endereços ──
      const raw      = await postWebhook(WEBHOOK.url('busca_cliente'), { nome });
      console.log('[Webhook 1] raw:', JSON.stringify(raw, null, 2));
      const clientes = normalizarClientes(toArray(raw));
      console.log('[Webhook 1] normalizado:', clientes.length, 'clientes', clientes);

      if (!clientes || clientes.length === 0) {
        show(noRes); return;
      }

      renderDropdown(clientes, dropdown);
      show(dropdown);

    } catch (err) {
      console.error('[Webhook 1]', err);
      mostrarErro('Erro ao conectar com o servidor. Verifique o webhook.');
    } finally {
      setBuscando(false);
    }
  }
}

function isAtivo(val) {
  return val == 1 || val === true || val === 'true' || val === 'S';
}

function renderDropdown(clientes, dropdown) {
  dropdown.innerHTML = '';
  clientes.forEach(c => {
    const enderecos = Array.isArray(c.enderecos) ? c.enderecos : [];
    const qtdEnd    = enderecos.length || 1;

    // Deriva status únicos a partir dos endereços; fallback para c.ativo
    const temAtivo   = enderecos.length
      ? enderecos.some(e => isAtivo(e.ativo))
      : isAtivo(c.ativo);
    const temInativo = enderecos.length
      ? enderecos.some(e => !isAtivo(e.ativo))
      : !isAtivo(c.ativo);

    const badges = [
      temAtivo   ? `<span class="dropdown-badge ativo">Ativo</span>`   : '',
      temInativo ? `<span class="dropdown-badge inativo">Inativo</span>` : '',
    ].join('');

    const li = document.createElement('li');
    li.className = 'dropdown-item';
    li.setAttribute('role', 'option');
    li.innerHTML = `
      <div class="dropdown-left">
        <div style="display:flex;gap:4px">${badges}</div>
        <span class="dropdown-name">${esc(c.nome)}</span>
      </div>
      <span class="dropdown-meta">${qtdEnd} endereço${qtdEnd > 1 ? 's' : ''}</span>
    `;
    li.addEventListener('click', () => {
      document.getElementById('search-input').value = c.nome;
      hide(dropdown);
      etapa2_selecionarEndereco(c);
    });
    dropdown.appendChild(li);
  });
}

// ══════════════════════════════════════════════════════
// ETAPA 2 — SELEÇÃO DE ENDEREÇO
// ══════════════════════════════════════════════════════
function etapa2_selecionarEndereco(cliente) {
  state.clienteSelecionado = cliente;

  const enderecos = Array.isArray(cliente.enderecos)
    ? cliente.enderecos
    : [cliente.endereco].filter(Boolean);

  if (enderecos.length === 0) {
    mostrarErro('Nenhum endereço encontrado para este cliente.'); return;
  }

  // Endereço único → pula seleção, vai direto buscar logins
  if (enderecos.length === 1) {
    const cardTemp = document.createElement('div');
    aoClicarEndereco(cardTemp, cliente, enderecos[0]);
    return;
  }

  document.getElementById('selection-header').innerHTML = `
    <h2>Selecionar Endereço</h2>
    <p>Cliente: <strong>${esc(cliente.nome)}</strong> — escolha o endereço para continuar.</p>
  `;

  const list = document.getElementById('selection-list');
  list.innerHTML = '';

  enderecos.forEach(addr => {
    // monta complemento (bloco / apartamento) se existirem
    const complementos = [
      addr.bloco       ? `Bloco ${esc(addr.bloco)}`       : '',
      addr.apartamento ? `Apto ${esc(addr.apartamento)}`  : ''
    ].filter(Boolean).join(' — ');

    const titulo = `${esc(addr.rua)}, ${esc(addr.numero)}${complementos ? ` — ${complementos}` : ''}`;
    const sub    = `${esc(addr.bairro)} — ${esc(addr.cidade)}`;

    const ativoAddr   = isAtivo(addr.ativo);
    const statusBadge = ativoAddr
      ? `<span class="dropdown-badge ativo">Ativo</span>`
      : `<span class="dropdown-badge inativo">Inativo</span>`;
    const idBadge = addr.cliente_id
      ? `<span class="dropdown-meta" style="font-size:11px">#${esc(String(addr.cliente_id))}</span>`
      : '';

    const card = criarCardSelecao({
      icone: iconPinSvg(),
      titulo,
      sub: `${esc(addr.bairro)} — ${esc(addr.cidade)}`,
      subExtra: `<div style="display:flex;gap:6px;align-items:center;margin-top:6px">${statusBadge}${idBadge}</div>`
    });

    card.addEventListener('click', () => aoClicarEndereco(card, cliente, addr));
    list.appendChild(card);
  });

  showScreen('screen-selection');
}

async function aoClicarEndereco(card, cliente, addr) {
  if (card.dataset.loading) return;
  setCardLoading(card, true);
  setLoadingStatus(true, 'Buscando logins...');

  try {
    const clienteId = addr.cliente_id || cliente.cliente_id;
    state.clienteSelecionado = { ...state.clienteSelecionado, cliente_id: clienteId };
    const raw    = await postWebhook(WEBHOOK.url('busca_logins'), { cliente_id: clienteId });
    console.log('[Webhook 2] raw:', JSON.stringify(raw, null, 2));
    const logins = normalizarLogins(raw);
    console.log('[Webhook 2] normalizado:', logins.length, 'logins', logins);

    if (!logins || logins.length === 0) {
      alert('Nenhum login encontrado para este cliente.'); return;
    }

    // Se tiver só 1 login → pula a seleção e vai direto ao dashboard
    if (logins.length === 1) {
      setLoadingStatus(true, 'Carregando dados do cliente...');
      await etapa4_carregarDashboard(logins[0]);
    } else {
      setLoadingStatus(false);
      etapa3_selecionarLogin(cliente, logins);
    }

  } catch (err) {
    console.error('[Webhook 2]', err);
    alert('Erro ao buscar os logins. Tente novamente.');
  } finally {
    setCardLoading(card, false);
    setLoadingStatus(false);
  }
}

// ══════════════════════════════════════════════════════
// ETAPA 3 — SELEÇÃO DE LOGIN (só aparece se houver mais de 1)
// ══════════════════════════════════════════════════════
function etapa3_selecionarLogin(cliente, logins) {
  document.getElementById('selection-header').innerHTML = `
    <h2>Selecionar Login</h2>
    <p>Encontramos <strong>${logins.length} logins</strong> para este cliente. Escolha qual deseja visualizar.</p>
  `;

  const list = document.getElementById('selection-list');
  list.innerHTML = '';

  logins.forEach(l => {
    const stClass = l.status_conexao === 'online' ? 'badge-online' : 'badge-offline';
    const stLabel = l.status_conexao === 'online' ? 'Online'       : 'Offline';

    const card = document.createElement('div');
    card.className = 'selection-card login-card';
    card.innerHTML = `
      <div class="sel-icon" style="background:rgba(124,58,237,0.12);border-color:rgba(124,58,237,0.25);color:#a78bfa">
        ${iconLockSvg()}
      </div>
      <div class="sel-info">
        <div class="sel-title">${esc(l.login)}</div>
        <div class="sel-sub">${esc(l.plano || '—')}</div>
        <div class="login-badges">
          <span class="badge ${stClass}"><span class="badge-dot"></span>${stLabel}</span>
          <span class="badge ${l.status_internet.css}">${esc(l.status_internet.label)}</span>
        </div>
      </div>
      <div class="sel-loading hidden">
        <span class="spinner" style="width:18px;height:18px;border-color:rgba(255,255,255,0.2);border-top-color:var(--blue)"></span>
      </div>
      <svg class="sel-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    card.addEventListener('click', () => aoClicarLogin(card, l));
    list.appendChild(card);
  });

  showScreen('screen-selection');
}

async function aoClicarLogin(card, loginObj) {
  if (card.dataset.loading) return;
  setCardLoading(card, true);
  setLoadingOverlay(true, 'Carregando dados do cliente...');

  try {
    await etapa4_carregarDashboard(loginObj);
  } catch (err) {
    console.error('[Webhook 3 via login]', err);
    alert('Erro ao carregar os dados. Tente novamente.');
  } finally {
    setCardLoading(card, false);
    setLoadingOverlay(false);
  }
}

// ══════════════════════════════════════════════════════
// ETAPA 4 — CARREGAR DASHBOARD (Webhook 3)
// ══════════════════════════════════════════════════════
async function etapa4_carregarDashboard(loginObj) {
  state.loginSelecionado = { login_id: loginObj.login_id, plano: loginObj.plano };

  // ── Webhook 3: recebe login_id + cliente_id, devolve todos os dados ──
  const raw = await postWebhook(WEBHOOK.url('busca_info'), {
    login_id:   loginObj.login_id,
    cliente_id: state.clienteSelecionado?.cliente_id
  });

  if (!raw) throw new Error('Sem dados retornados pelo webhook 3');

  const contrato = normalizarContrato(raw);
  const cliente  = state.clienteSelecionado;
  state.contratoId = contrato.contrato_id;
  state.comodatos  = contrato.comodatos || [];
  renderDashboard(cliente, contrato);
  salvarSessao();
}

// ══════════════════════════════════════════════════════
// HELPERS DE SELEÇÃO
// ══════════════════════════════════════════════════════
function criarCardSelecao({ icone, iconeBg = '', titulo, sub, subExtra = '', badge = '' }) {
  const card = document.createElement('div');
  card.className = 'selection-card';
  card.innerHTML = `
    <div class="sel-icon" style="${iconeBg}">${icone}</div>
    <div class="sel-info">
      <div class="sel-title">${titulo}</div>
      <div class="sel-sub">${sub}</div>
      ${subExtra}
    </div>
    ${badge ? `<div class="sel-badge-wrap">${badge}</div>` : ''}
    <div class="sel-loading hidden">
      <span class="spinner" style="width:18px;height:18px;border-color:rgba(255,255,255,0.2);border-top-color:var(--blue)"></span>
    </div>
    <svg class="sel-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  return card;
}

function setCardLoading(card, on) {
  const loading = card.querySelector('.sel-loading');
  const arrow   = card.querySelector('.sel-arrow');
  if (on) {
    card.dataset.loading = '1';
    if (loading) loading.classList.remove('hidden');
    if (arrow)   arrow.style.visibility = 'hidden';
  } else {
    delete card.dataset.loading;
    if (loading) loading.classList.add('hidden');
    if (arrow)   arrow.style.visibility = '';
  }
}

// ══════════════════════════════════════════════════════
// DASHBOARD — renderiza todos os cards
// ══════════════════════════════════════════════════════
function renderDashboard(cliente, contrato) {
  document.getElementById('dashboard-topbar').innerHTML = `
    <div class="client-info">
      <div class="client-label">Cliente selecionado</div>
      <div class="client-name">${esc(cliente ? cliente.nome : contrato.nome || '')}</div>
    </div>
    <button class="btn-atendimento" id="btn-abrir-atendimento" title="Abrir atendimento">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Abrir atendimento</span>
    </button>
    <div class="header-menu" id="header-menu">
      <button class="btn-header-menu" id="btn-header-menu-toggle" title="Mais ações" aria-haspopup="true" aria-expanded="false">
        ${iconKebab()}
      </button>
      <div class="header-menu-dropdown hidden" id="header-menu-dropdown" role="menu">
        <button type="button" class="header-menu-item" id="menu-item-reload" role="menuitem" title="Recarregar dados do cliente">
          <span id="menu-item-reload-icon">${iconReload()}</span>
          <span>Atualizar</span>
        </button>
        ${themeMenuItemHtml('menu-item-theme')}
        <button type="button" class="header-menu-item" id="menu-item-acs" role="menuitem" title="Abrir ACS" data-login="${esc(contrato.login_pppoe || '')}">
          <span id="menu-item-acs-icon">${iconExternalLink()}</span>
          <span>Abrir ACS</span>
        </button>
      </div>
    </div>
  `;

  document.getElementById('dashboard-grid').innerHTML = [
    cardGeral(cliente, contrato),
    cardAvisos(contrato),
    cardFibraONU(contrato.fibra_onu || {}),
    cardAcesso(contrato),
    // Se o busca_info ainda trouxer as OS, mostra na hora; senão o card nasce em "carregando"
    cardOS(contrato.ordens_servico?.length ? contrato.ordens_servico : null),
    cardComodatos(contrato.comodatos || []),
    cardProdutos(contrato.produtos_contratados || []),
    cardTelefonia(contrato.telefonia || {}),
    cardMVNO(contrato.linhas_mvno || []),
    cardContatos(contrato.contatos || (cliente && cliente.contatos) || {}),
    cardEndereco(contrato.endereco),
    cardFinanceiro(contrato.financeiro || {})
  ].join('');

  showScreen('screen-dashboard');
  avisarShell({ type: 'titulo', titulo: (cliente ? cliente.nome : contrato.nome) || '' });
  bindDashboardEvents(contrato);
  carregarOs();
  consultarPotenciaAtual(true); // ao abrir o dashboard já puxa o estado atual da ONU
}

// ─── CONTADORES DE OS NO CARD AVISOS (últimos 3 meses) ────
// Para contar outro assunto basta incluir um item aqui. `marcador` é um trecho do
// assunto (sem acento, minúsculo) que o identifica.
const CONTADORES_OS = [
  { id: 'n1',       marcador: '[suporte n1]', label: 'OS de Suporte N1' },
  { id: 'retencao', marcador: '[retencao]',   label: 'OS de Retenção'   },
  { id: 'n3',       marcador: ['manutencao interna - n3', 'manutencao n3 - quarentena'], label: 'OS de Manutenção N3' },
];
const MESES_CONTADOR_OS = 3;

// minúsculo, sem acento e com espaços colapsados, para comparar assuntos
const semAcento = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/\s+/g, ' ');

// Recebe lista de { data, assunto } e conta as OS cujo assunto contém algum dos
// marcadores (texto ou lista de textos), abertas nos últimos 3 meses.
// A data vem como "YYYY-MM-DD HH:MM:SS".
function osPorAssunto(lista, marcador) {
  const marcadores = [].concat(marcador);
  const limite = new Date();
  limite.setMonth(limite.getMonth() - MESES_CONTADOR_OS);
  return (lista || []).filter(o => {
    const assunto = semAcento(o.assunto);
    if (!marcadores.some(m => assunto.includes(m))) return false;
    const aberta = new Date(String(o.data || '').replace(' ', 'T'));
    return !isNaN(aberta) && aberta >= limite;
  });
}

function contarOsPorAssunto(lista, marcador) {
  return osPorAssunto(lista, marcador).length;
}

// Se houve OS de Suporte N1 nos últimos 3 meses, mostra na lista de avisos (à esquerda)
// o diagnóstico da mais recente.
function atualizarAvisoDiagnosticoN1(lista) {
  const container = document.getElementById('avisos-lista');
  if (!container) return;
  container.querySelector('.aviso-diagnostico-n1')?.remove();

  const n1 = CONTADORES_OS.find(c => c.id === 'n1');
  const ultima = osPorAssunto(lista, n1.marcador)
    .sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')))[0];
  const diag = String(ultima?.diagnostico ?? '').trim();
  if (!ultima || !diag || diag === '—') return;

  container.querySelector('.no-boleto')?.remove(); // havia "Nenhum aviso no momento"
  container.insertAdjacentHTML('beforeend', `
    <div class="aviso-item aviso-atencao aviso-diagnostico-n1" title="${esc(diag)}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="aviso-texto">Último diagnóstico N1 (${formatDate(ultima.data)}): ${esc(diag)}</span>
    </div>`);
}

// Preenche os contadores. Até a lista chegar eles mostram "···" (carregando), nunca um 0;
// sem lista (falha na consulta) mostram "—".
function setContadoresOs(lista) {
  CONTADORES_OS.forEach(c => {
    const el = document.getElementById(`os-contador-${c.id}`);
    if (!el) return;
    el.classList.remove('os-contador-carregando');
    el.title = lista ? '' : 'Não foi possível consultar as OS';
    el.textContent = lista ? contarOsPorAssunto(lista, c.marcador) : '—';
  });
}

// As OS saíram do busca_info: depois que o dashboard aparece, busca a lista completa
// (busca_todas_os) em segundo plano e com ela preenche o card, os contadores do card
// Avisos e o modal "Ver todas" (state.osTodas fica em cache).
function normalizarOsLista(raw) {
  const bloco = Array.isArray(raw) ? (raw[0] || {}) : (raw || {});
  const osRaw = bloco['ordem_de_serviço'] || bloco.ordens_servico || [];
  return osRaw.map(o => ({
    os_id:    o.id_ordem            || '—',
    data:     o.data_abertura_ordem || '',
    assunto:  o.assunto_ordem       || o.id_assunto || '—',
    setor:    SETORES[String(o.setor_ordem)] || o.setor_ordem || '—',
    setor_id: String(o.setor_ordem ?? ''),
    status:   mapStatusOS(o.status_ordem),
    descricao: o.mensagem_ordem     || '—',
    resposta:  o.mensagem_resposta  || '—',
    diagnostico: o.diagnostico      || '—',
  }));
}

// Quantas OS aparecem no card (o resto fica em "Ver todas as OS"):
// 10 no notebook (OS ocupa as linhas 2-3, ao lado de Fibra + Acesso), 6 nas demais telas
const MQ_NOTEBOOK = window.matchMedia('(min-width: 1201px) and (max-width: 1699px)');
const osNoCard = () => (MQ_NOTEBOOK.matches ? 10 : 6);
// Ao cruzar o breakpoint (redimensionar a janela), redesenha as linhas do card
MQ_NOTEBOOK.addEventListener('change', () => {
  const tbody = document.getElementById('os-tbody');
  if (!tbody || !state.osTodas) return;
  const visiveis = osMaisRecentes(state.osTodas);
  tbody.innerHTML = visiveis.length ? visiveis.map(osRow).join('') : osMensagemLinha(osMensagemVazia(state.osTodas));
  const total = document.getElementById('os-total');
  if (total) total.textContent = `${visiveis.length} OS`;
});
// Setores (setor_ordem) que aparecem no card. O botão "Ver todas as OS" mostra todos.
const OS_SETORES_NO_CARD = ['58', '50', '48', '28'];

// As osNoCard() mais recentes dos setores acima, da mais nova para a mais antiga
// (data "YYYY-MM-DD HH:MM:SS")
function osMaisRecentes(lista) {
  return (lista || [])
    .filter(o => OS_SETORES_NO_CARD.includes(String(o.setor_id)))
    .sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')))
    .slice(0, osNoCard());
}

// Mensagem do card quando não há nada para listar
function osMensagemVazia(lista) {
  return lista?.length
    ? 'Nenhuma OS dos setores exibidos aqui. Use "Ver todas as OS" para ver as demais.'
    : 'Nenhuma OS encontrada.';
}

async function carregarOs() {
  const loginId = state.loginSelecionado?.login_id;
  state.osTodas = null;
  try {
    const raw = await postWebhook(WEBHOOK.url('busca_todas_os'), {
      login_id:   loginId,
      cliente_id: state.clienteSelecionado?.cliente_id
    });
    if (state.loginSelecionado?.login_id !== loginId) return; // trocou de cliente
    const todas = normalizarOsLista(raw);
    state.osTodas = todas;

    const tbody = document.getElementById('os-tbody');
    const total = document.getElementById('os-total');
    if (tbody) {
      const visiveis = osMaisRecentes(todas);
      tbody.innerHTML = visiveis.length ? visiveis.map(osRow).join('') : osMensagemLinha(osMensagemVazia(todas));
      if (total) total.textContent = `${visiveis.length} OS`;
    }
    setContadoresOs(todas);
    atualizarAvisoDiagnosticoN1(todas);
  } catch (err) {
    console.error('[busca_todas_os]', err);
    if (state.loginSelecionado?.login_id === loginId) setContadoresOs(null);
    const tbody = document.getElementById('os-tbody');
    if (tbody && !tbody.querySelector('.col-id')) {
      tbody.innerHTML = osMensagemLinha('Erro ao carregar as OS. <a href="#" id="os-retry">Tentar novamente</a>');
      document.getElementById('os-retry')?.addEventListener('click', e => {
        e.preventDefault();
        tbody.innerHTML = osMensagemLinha('Carregando ordens de serviço...');
        carregarOs();
      });
    }
  }
}

// ─── 1B. AVISOS ───────────────────────────────────────
// Lista de checagens — cada uma testa o contrato normalizado e, se disparar,
// gera um aviso. Para adicionar um novo aviso no futuro basta empurrar mais
// um objeto { sev, texto } neste array.
function cardAvisos(c) {
  const avisos = [];

  if (c.em_manutencao) {
    avisos.push({ sev: 'atencao', texto: '🛠️ Cliente em área de manutenção' });
  }

  if (c.status_acesso === 'Bloqueado') {
    avisos.push({ sev: 'critico', texto: 'Cadastro bloqueado' });
  }

  const STATUS_INTERNET = {
    D:  { sev: 'critico', texto: 'Internet desativada' },
    CM: { sev: 'critico', texto: 'Bloqueio manual' },
    CA: { sev: 'critico', texto: 'Bloqueio automático' },
    FA: { sev: 'atencao', texto: 'Financeiro em atraso' },
    AA: { sev: 'atencao', texto: 'Aguardando assinatura' },
  };
  if (c.status_internet && c.status_internet !== 'A') {
    avisos.push(STATUS_INTERNET[c.status_internet] || { sev: 'critico', texto: `Internet: status "${c.status_internet}"` });
  } else {
    // status_internet ainda não reflete o atraso (ex.: dentro da carência) —
    // olha direto pros boletos pra avisar mesmo assim.
    const hoje = new Date().toISOString().split('T')[0];
    const vencidos = (c.financeiro || []).filter(b => b.status === 'A' && b.data_vencimento < hoje);
    if (vencidos.length) {
      const diasMax = Math.max(...vencidos.map(b =>
        Math.round((new Date(hoje) - new Date(b.data_vencimento)) / 86400000)));
      avisos.push({
        sev: diasMax > 15 ? 'critico' : 'atencao',
        texto: vencidos.length > 1
          ? `${vencidos.length} boletos em atraso (até ${diasMax}d)`
          : `Boleto em atraso há ${diasMax}d`,
      });
    }
  }

  const potencia = c.fibra_onu ? parseFloat(c.fibra_onu.ultima_potencia) : NaN;
  if (!isNaN(potencia) && potencia < -27) {
    avisos.push({ sev: 'critico', texto: `Sinal óptico fraco (${potencia} dBm)` });
  }

  if (c.quedas > 10) {
    avisos.push({ sev: 'critico', texto: `Muitas quedas hoje (${c.quedas})` });
  }

  if (c.status_conexao === 'offline') {
    const duracao = formatDuracaoOffline(c.offline_desde);
    avisos.push({ sev: 'critico', texto: duracao ? `Cliente offline há ${duracao}` : 'Cliente está offline' });
  }

  const body = avisos.length
    ? avisos.map(a => `
      <div class="aviso-item aviso-${a.sev}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="aviso-texto">${esc(a.texto)}</span>
      </div>`).join('')
    : `
      <div class="no-boleto">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Nenhum aviso no momento
      </div>`;

  const contadoresOs = CONTADORES_OS.map(ct => `
      <div class="os-contador os-contador-${ct.id}" title="${ct.label} abertas nos últimos ${MESES_CONTADOR_OS} meses">
        <div class="os-contador-qtd os-contador-carregando" id="os-contador-${ct.id}" title="Carregando...">···</div>
        <div class="os-contador-texto">
          <div class="os-contador-label">${ct.label}</div>
          <div class="os-contador-periodo">últimos ${MESES_CONTADOR_OS} meses</div>
        </div>
      </div>`).join('');

  return `
  <div class="card card-avisos">
    <div class="card-header">
      <div class="card-icon" style="background:rgba(244,63,94,0.12);border:1px solid rgba(244,63,94,0.2)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="card-title">Avisos</span>
      ${avisos.length ? `<span class="badge badge-bloqueado" style="margin-left:auto">${avisos.length}</span>` : ''}
    </div>
    <div class="avisos-layout">
      <div class="avisos-lista" id="avisos-lista">${body}</div>
      <div class="os-contadores">${contadoresOs}</div>
    </div>
  </div>`;
}

// Recebe uma data ISO (string) e devolve "Xd Yh" / "Xh" / "X min" desde então.
// Retorna null se a data não vier preenchida ou for inválida.
// Roteadores cuja página de administração só abre em https (identificados pelo modelo no comodato)
const ROTEADORES_HTTPS = ['PSDN-AX30'];

function urlRoteador(ip, comodatos) {
  const lista = (comodatos || []).map(e => String(e).toUpperCase());
  const https = lista.some(e => ROTEADORES_HTTPS.some(m => e.includes(m)));
  return `${https ? 'https' : 'http'}://${ip}`;
}

function formatDuracaoOffline(dataISO) {
  if (!dataISO) return null;
  const inicio = new Date(dataISO).getTime();
  if (isNaN(inicio)) return null;

  const diffMs = Date.now() - inicio;
  if (diffMs < 0) return null;

  const minutos = Math.round(diffMs / 60000);
  if (minutos < 60) return `${Math.max(1, minutos)} min`;

  const horas = Math.round(diffMs / 3600000);
  if (horas < 24) return `${horas}h`;

  const dias   = Math.floor(diffMs / 86400000);
  const restoH = Math.round((diffMs - dias * 86400000) / 3600000);
  return restoH > 0 ? `${dias}d ${restoH}h` : `${dias}d`;
}

// ─── 1. GERAL ─────────────────────────────────────────
function cardGeral(cliente, c) {
  const nome = (cliente && cliente.nome) || c.nome || '—';
  const cpf  = (cliente && cliente.cpf)  || c.cpf  || '—';
  const initials = nome.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();

  const connBadge = c.status_conexao === 'online'
    ? `<span class="badge badge-online"><span class="badge-dot"></span>Online</span>`
    : `<span class="badge badge-offline"><span class="badge-dot"></span>Offline</span>`;

  const accessMap = { 'Ativo':'badge-ativo','Bloqueado':'badge-bloqueado','Aguardando Assinatura':'badge-aguardando' };
  const accessBadge = `<span class="badge ${accessMap[c.status_acesso]||'badge-aguardando'}">${esc(c.status_acesso||'—')}</span>`;
  const planBadge   = `<span class="badge badge-plano">${esc(c.plano||'—')}</span>`;

  const quedas = c.quedas || 0;
  const quedasClass = quedas >= 5 ? 'high' : quedas >= 2 ? 'med' : 'low';

  return `
  <div class="card card-geral ${c.status_conexao === 'online' ? 'conn-online' : 'conn-offline'}">
    <div class="card-header">
      <div class="card-icon" style="background:rgba(0,112,243,0.12);border:1px solid rgba(0,112,243,0.2)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#0070f3" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="7" r="4" stroke="#0070f3" stroke-width="2"/>
        </svg>
      </div>
      <span class="card-title">Dados Gerais</span>
      <span class="geral-conn" id="geral-conn">${connBadge}</span>
      <button type="button" class="btn-geral-acao btn-recarregar-icone" id="btn-recarregar" data-login="${esc(c.login_pppoe||'')}" title="Recarregar status online/offline e IP" aria-label="Recarregar">
        <span id="btn-recarregar-icon">${iconReload()}</span>
      </button>
    </div>
    <div class="geral-main">
      <div class="geral-avatar">${initials}</div>
      <div class="geral-info">
        <div class="geral-name">${esc(nome)}</div>
        <div class="geral-cpf">CPF: ${cpf}</div>
      </div>
    </div>
    <div class="geral-badges">${accessBadge}${planBadge}</div>
    <div class="geral-grid">
      <div class="geral-field">
        <span class="geral-field-label">IP do Roteador</span>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="geral-field-value" id="geral-ip-value">${esc(c.ip_roteador||'—')}</span>
          ${c.ip_roteador ? `<a href="${esc(urlRoteador(c.ip_roteador, c.comodatos))}" id="geral-ip-link" target="_blank" rel="noopener" class="btn-ip-open" title="Abrir no navegador">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <polyline points="15 3 21 3 21 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </a>` : ''}
        </div>
      </div>
      <div class="geral-field">
        <span class="geral-field-label">Quedas registradas hoje</span>
        <span class="geral-field-value quedas-val ${quedasClass}">${quedas}</span>
      </div>
      <div class="geral-field">
        <span class="geral-field-label">Data de Nascimento</span>
        <span class="geral-field-value">${c.data_nascimento ? formatDate(c.data_nascimento) : '—'}</span>
      </div>
      <div class="geral-field geral-field-cadastro">
        <span class="geral-field-label">Data de Cadastro</span>
        <span class="geral-field-value">${c.data_cadastro ? formatDate(c.data_cadastro) : '—'}</span>
      </div>
      <div class="geral-acoes">
        <button type="button" class="btn-geral-acao" id="btn-reiniciar-roteador" data-login="${esc(c.login_pppoe||'')}" title="Reiniciar o roteador do cliente">
          Reiniciar roteador
        </button>
        <button type="button" class="btn-geral-acao" id="btn-limpar-mac" data-login="${esc(c.login_pppoe||'')}" title="Limpar o MAC vinculado ao login">
          Limpar MAC
        </button>
        <button type="button" class="btn-geral-acao" id="btn-desconectar-login" data-login="${esc(c.login_pppoe||'')}" title="Derrubar a conexão do login">
          Desconectar login
        </button>
      </div>
    </div>
  </div>`;
}

// ─── 2. ENDEREÇO ──────────────────────────────────────
function cardEndereco(e) {
  if (!e) return '';

  const partes = [];
  if (e.rua)    partes.push(e.numero ? `${e.rua}, ${e.numero}` : e.rua);
  if (e.bairro) partes.push(e.bairro);
  if (e.cidade) partes.push(e.cidade);
  const enderecoCompleto = partes.join(' - ');
  const mapsUrl = enderecoCompleto
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`
    : '';

  return `
  <div class="card">
    <div class="card-header">
      <div class="card-icon" style="background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.2)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#7c3aed" stroke-width="2"/>
          <circle cx="12" cy="9" r="2.5" stroke="#7c3aed" stroke-width="2"/>
        </svg>
      </div>
      <span class="card-title">Endereço</span>
      ${mapsUrl ? `<a href="${mapsUrl}" target="_blank" rel="noopener" class="btn-card-icon" title="Abrir no Google Maps">
        ${iconMapPin()}
      </a>` : ''}
    </div>
    ${fieldRow(iconPin(), 'Cidade',      esc(e.cidade  ||'—'))}
    ${fieldRow(iconPin(), 'Bairro',      esc(e.bairro  ||'—'))}
    ${fieldRow(iconPin(), 'Logradouro',  `${esc(e.rua||'—')}, ${esc(e.numero||'')}`)}
  </div>`;
}

// ─── 3. CONTATOS ──────────────────────────────────────
function cardContatos(c) {
  const fones = Array.isArray(c.telefones) ? c.telefones : [];
  const phones = fones.map(t => fieldRow(iconPhone(), esc(t.label), esc(t.numero))).join('');
  return `
  <div class="card">
    <div class="card-header">
      <div class="card-icon" style="background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.2)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.17 12 19.79 19.79 0 0 1 1.11 3.4 2 2 0 0 1 3.09 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16l.92.92z" stroke="#00d4ff" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="card-title">Contatos</span>
    </div>
    ${phones || fieldRow(iconPhone(), 'Telefone', '—')}
    ${fieldRow(iconMail(), 'E-mail', c.email ? `<a href="mailto:${esc(c.email)}" style="color:var(--cyan)">${esc(c.email)}</a>` : '—')}
  </div>`;
}

// ─── 4. COMODATOS ─────────────────────────────────────
function cardComodatos(items) {
  const chips = items.length
    ? items.map(i => `<span class="chip">${esc(i)}</span>`).join('')
    : '<span style="color:var(--text-muted);font-size:13px">Nenhum equipamento em comodato</span>';
  return `
  <div class="card">
    <div class="card-header">
      <div class="card-icon" style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="#f59e0b" stroke-width="2"/>
          <path d="M8 21h8M12 17v4" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="card-title">Comodatos</span>
    </div>
    <div class="chip-list">${chips}</div>
  </div>`;
}

// ─── 5. CENTRAL DO ASSINANTE + PPPOE ──────────────────
// Um card só — os dois blocos sempre têm o mesmo tamanho,
// então cabem juntos com uma divisória entre eles.
function cardAcesso(c) {
  return `
  <div class="card card-acesso">
    <div class="card-header">
      <div class="card-icon" style="background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.2)">
        ${iconLockSvg('#a78bfa')}
      </div>
      <span class="card-title" style="color:#a78bfa">Central do Assinante</span>
      <button class="btn-card-icon" id="btn-copiar-acesso" title="Copiar login e senha" data-login="${esc(c.login||'')}" data-senha="${esc(c.senha||'')}">
        ${iconCopy()}
      </button>
    </div>
    <div class="login-field">
      <div>
        <div class="login-field-label">Login</div>
        <div class="login-field-value">${esc(c.login||'—')}</div>
      </div>
    </div>
    <div class="login-field">
      <div style="flex:1">
        <div class="login-field-label">Senha</div>
        <div class="login-field-value">${esc(c.senha||'—')}</div>
      </div>
    </div>

    <div class="card-divider"></div>

    <div class="card-header">
      <div class="card-icon" style="background:rgba(0,112,243,0.12);border:1px solid rgba(0,112,243,0.2)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="#0070f3" stroke-width="2"/>
          <path d="M8 21h8M12 17v4" stroke="#0070f3" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="card-title" style="color:#0070f3">PPPoE</span>
      <button class="btn-card-icon" id="btn-copiar-pppoe" title="Copiar login e senha PPPoE" data-login="${esc(c.login_pppoe||'')}" data-senha="${esc(c.senha_pppoe||'')}">
        ${iconCopy()}
      </button>
    </div>
    <div class="login-field">
      <div>
        <div class="login-field-label">Login</div>
        <div class="login-field-value">${esc(c.login_pppoe||'—')}</div>
      </div>
    </div>
    <div class="login-field">
      <div style="flex:1">
        <div class="login-field-label">Senha</div>
        <div class="login-field-value">${esc(c.senha_pppoe||'—')}</div>
      </div>
    </div>
  </div>`;
}

// ─── 6. PRODUTOS CONTRATADOS ──────────────────────────
function cardProdutos(items) {
  const chips = items.length
    ? items.map(i => `<span class="chip chip-product">${esc(i)}</span>`).join('')
    : '<span style="color:var(--text-muted);font-size:13px">Nenhum produto adicional</span>';
  return `
  <div class="card">
    <div class="card-header">
      <div class="card-icon" style="background:rgba(0,229,160,0.1);border:1px solid rgba(0,229,160,0.2)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="#00e5a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="card-title">Produtos Contratados</span>
    </div>
    <div class="chip-list">${chips}</div>
  </div>`;
}

// ─── 7. TELEFONIA ─────────────────────────────────────
// Estado vazio reutilizado pelos cards de produtos/linhas opcionais —
// deixa claro pro atendente que o cliente realmente não tem aquilo,
// em vez do card simplesmente sumir da tela.
function emptyCardState(texto) {
  return `
    <div class="no-boleto">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      ${esc(texto)}
    </div>`;
}

function cardTelefonia(t) {
  const semLinha = !t || !t.numero;
  const tipoBadge = t && t.tipo === 'Móvel'
    ? `<span class="badge badge-plano">📱 Móvel</span>`
    : `<span class="badge badge-aguardando">📞 Fixa</span>`;
  return `
  <div class="card">
    <div class="card-header">
      <div class="card-icon" style="background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.2)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="2" width="14" height="20" rx="2" stroke="#00d4ff" stroke-width="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18" stroke="#00d4ff" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="card-title">Telefonia</span>
    </div>
    ${semLinha ? emptyCardState('Nenhuma linha fixa encontrada') : `
    <div style="margin-bottom:12px">${tipoBadge}</div>
    ${fieldRow(iconPhone(), 'Número', esc(t.numero))}
    ${t.tipo === 'Móvel' ? fieldRow(iconChip(), 'ICCID', `<span class="mono">${esc(t.iccid||'—')}</span>`) : ''}
    ${t.tipo === 'Móvel' ? fieldRow(iconSignal(), 'Plano', esc(t.plano||'—')) : ''}
    ${t.tipo === 'Fixa'  ? fieldRow(iconKey(),   'Senha', `<span class="mono">${esc(t.senha||'—')}</span>`) : ''}
    `}
  </div>`;
}

// ─── 7b. LINHAS MÓVEIS (MVNO) ─────────────────────────
function cardMVNO(linhas) {
  linhas = linhas || [];

  const statusCss = s => ({
    'Ativo':          'badge-ativo',
    'Inativo':        'badge-bloqueado',
    'Cancelada':      'badge-bloqueado',
    'Ag. Ativação':   'badge-aguardando',
  }[s] || 'badge-bloqueado');

  const rows = linhas.map(l => `
    <div class="mvno-row">
      <div class="mvno-numero">${esc(l.numero)}</div>
      <div class="mvno-badges">
        <span class="badge ${statusCss(l.status)}">${esc(l.status)}</span>
        ${l.esim ? '<span class="badge badge-plano">eSIM</span>' : ''}
        ${l.portabilidade ? `<span class="badge badge-aguardando">Port. ${esc(l.status_portabilidade)}</span>` : ''}
      </div>
      <div class="mvno-simcard" style="font-size:11px;color:var(--text-muted);margin-top:4px">
        SIM: <span class="mono">${esc(l.simcard)}</span>
      </div>
    </div>
  `).join('');

  return `
  <div class="card">
    <div class="card-header">
      <div class="card-icon" style="background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.2)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="2" width="14" height="20" rx="2" stroke="#00d4ff" stroke-width="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18" stroke="#00d4ff" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="card-title">Linhas Móveis</span>
      ${linhas.length ? `<span style="margin-left:auto;font-size:12px;color:var(--text-muted)">${linhas.length} linha${linhas.length > 1 ? 's' : ''}</span>` : ''}
    </div>
    ${linhas.length ? `<div class="mvno-list">${rows}</div>` : emptyCardState('Nenhuma linha móvel encontrada')}
  </div>`;
}

// ─── 8. FIBRA / ONU ───────────────────────────────────
function cardFibraONU(f) {
  const semFibra = !f || !f.transmissor;
  const dbm = semFibra ? 0 : (parseFloat(f.ultima_potencia) || 0);
  const { sigClass, sigLabel, sigIcon } = classificarSinal(dbm);
  return `
  <div class="card card-fibra">
    <div class="card-header">
      <div class="card-icon" style="background:rgba(0,229,160,0.1);border:1px solid rgba(0,229,160,0.2)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke="#00e5a0" stroke-width="2" stroke-linecap="round"/>
          <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke="#00e5a0" stroke-width="2" stroke-linecap="round"/>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke="#00e5a0" stroke-width="2" stroke-linecap="round"/>
          <line x1="12" y1="20" x2="12.01" y2="20" stroke="#00e5a0" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="card-title">Fibra / ONU</span>
      ${semFibra ? '' : `
      <button class="btn-card-icon" id="btn-onu-historico" title="Ver histórico de potência">
        ${iconHistory()}
      </button>`}
    </div>
    ${semFibra ? emptyCardState('Nenhuma ONU encontrada para este cliente') : `
    <div class="signal-bar ${sigClass}" id="onu-signal-bar">
      <span class="signal-icon" id="onu-signal-icon">${sigIcon}</span>
      <div>
        <div class="signal-label" id="onu-signal-label">Última Potência</div>
        <div class="signal-value" id="onu-signal-value">${dbm} dBm</div>
      </div>
      <span class="signal-qual" id="onu-signal-qual">${sigLabel}</span>
    </div>
    <div class="onu-signal-extra" id="onu-signal-extra"></div>
    <button type="button" class="btn-geral-acao btn-geral-acao-icone btn-potencia-atual" id="btn-potencia-atual" data-id-onu="${esc(f.id_onu||'')}" title="Consultar a potência da ONU agora">
      <span id="btn-potencia-atual-icon">${iconReload()}</span>
      <span id="btn-potencia-atual-label">Potência atual</span>
    </button>
    <button type="button" class="btn-geral-acao btn-geral-acao-perigo btn-reiniciar-onu" id="btn-reiniciar-onu" data-id-onu="${esc(f.id_onu||'')}" title="Reiniciar a ONU do cliente">
      Reiniciar ONU
    </button>
    <details class="onu-detalhes"${window.matchMedia('(min-width: 1700px)').matches ? ' open' : ''}>
      <summary>Detalhes técnicos</summary>
      ${fieldRow(iconServer(), 'Transmissor', esc(f.transmissor))}
      ${fieldRow(iconHash(),   'PON ID',      `<span class="mono">${esc(f.pon_id||'—')}</span>`)}
      ${fieldRow(iconHash(),   'MAC',         `<span class="mono">${esc(f.mac||'—')}</span>`)}
      ${fieldRow(iconHash(),   'VLAN',        `<span class="mono">${esc(f.vlan||'—')}</span>`)}
    </details>
    `}
  </div>`;
}

// ─── 9. FINANCEIRO ────────────────────────────────────
function cardFinanceiro(fin) {
  const boletos = Array.isArray(fin) ? fin : (Array.isArray(fin?.boletos) ? fin.boletos : []);

  const statusMap = {
    'A': { label: 'A receber', css: 'badge-aguardando' },
    'R': { label: 'Recebido',  css: 'badge-ativo'      },
    'P': { label: 'Parcial',   css: 'badge-aguardando' },
    'C': { label: 'Cancelado', css: 'badge-bloqueado'  },
  };

  const hoje = new Date().toISOString().split('T')[0];

  if (!boletos.length) return `
  <div class="card">
    <div class="card-header">
      <div class="card-icon" style="background:rgba(0,229,160,0.1);border:1px solid rgba(0,229,160,0.2)">
        ${iconWallet('#00e5a0')}
      </div>
      <span class="card-title">Financeiro</span>
    </div>
    <div class="no-boleto">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      Nenhum boleto em aberto
    </div>
  </div>`;

  const rows = boletos.slice(0, 6).map(b => {
    const st = statusMap[b.status] || { label: b.status || '—', css: 'badge-bloqueado' };

    const diasAtraso = b.status === 'A'
      ? Math.round((new Date(hoje) - new Date(b.data_vencimento)) / 86400000)
      : 0;
    const vencido     = diasAtraso > 0;
    const vencidoLeve = vencido && diasAtraso <= 15;
    const vencidoGrave = vencido && diasAtraso > 15;

    const rowClass  = vencidoGrave ? 'boleto-row-vencido' : vencidoLeve ? 'boleto-row-vencido-leve' : '';
    const dateClass = vencidoGrave ? 'vencido' : vencidoLeve ? 'vencido-leve' : '';

    const valor = parseFloat(b.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    return `
    <div class="boleto-row ${rowClass}">
      <div class="boleto-row-left">
        <span class="badge ${st.css}" style="font-size:11px">${st.label}</span>
        <span class="boleto-row-date ${dateClass}">${vencido ? '⚠ ' : ''}${formatDate(b.data_vencimento)}</span>
      </div>
      <span class="boleto-row-valor">R$ ${valor}</span>
    </div>`;
  }).join('');

  return `
  <div class="card">
    <div class="card-header">
      <div class="card-icon" style="background:rgba(0,112,243,0.12);border:1px solid rgba(0,112,243,0.2)">
        ${iconWallet('#0070f3')}
      </div>
      <span class="card-title">Financeiro</span>
    </div>
    <div class="boleto-list">${rows}</div>
  </div>`;
}

// ─── 10. ORDENS DE SERVIÇO ────────────────────────────
// os_list = null → ainda carregando (a lista chega depois, via carregarOs)
function cardOS(os_list) {
  const carregando = os_list === null;
  const visible = osMaisRecentes(os_list);
  const tbody   = carregando
    ? osMensagemLinha('<span class="spinner" style="width:14px;height:14px;vertical-align:-2px;margin-right:8px"></span>Carregando ordens de serviço...')
    : visible.length
      ? visible.map(osRow).join('')
      : osMensagemLinha(osMensagemVazia(os_list));

  return `
  <div class="card card-os">
    <div class="card-header">
      <div class="card-icon" style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2)">
        ${iconOsSvg()}
      </div>
      <span class="card-title">Ordens de Serviço</span>
      <span id="os-total" style="margin-left:auto;font-size:12px;color:var(--text-muted)">${carregando ? '' : `${visible.length} OS`}</span>
    </div>
    <table class="os-table">
      <thead>
        <tr>
          <th class="col-id">Data</th><th class="col-type">Assunto</th><th class="col-diag">Diagnóstico</th><th class="col-status">Status</th><th class="col-desc">Descrição</th><th class="col-resp">Resposta técnico</th>
        </tr>
      </thead>
      <tbody id="os-tbody">${tbody}</tbody>
    </table>
    <div class="os-footer">
      <button class="btn-ver-todas" id="btn-ver-todas">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <line x1="8" y1="6"  x2="21" y2="6"  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="3" y1="6"  x2="3.01" y2="6"  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span id="btn-ver-todas-label">Ver todas as OS</span>
      </button>
    </div>
  </div>`;
}

function osMensagemLinha(html) {
  return `<tr><td colspan="6" style="color:var(--text-muted);padding:12px 0;font-size:13px">${html}</td></tr>`;
}

const OS_DESC_LIMITE = 120; // acima disso a descrição fica recolhida com "ver mais"

// Texto longo da OS (descrição / resposta do técnico): recolhido com "ver mais"
function osTextoLongo(texto) {
  const t = String(texto ?? '');
  const longa = t.length > OS_DESC_LIMITE || t.split(/\r?\n/).length > 2;
  // o botão fica em cima, à direita: não se desloca quando o texto expande
  return `
      ${longa ? '<button type="button" class="os-ver-mais">ver mais</button>' : ''}
      <div class="os-desc${longa ? ' os-desc-recolhida' : ''}"${longa ? ` title="${esc(t)}"` : ''}>${esc(t)}</div>`;
}

function osRow(os) {
  return `
  <tr>
    <td class="col-id os-data">${formatDate(os.data)}</td>
    <td class="col-type">
      <div class="os-assunto">${esc(os.assunto)}</div>
      <div class="os-setor">${esc(os.setor)}</div>
    </td>
    <td class="col-diag" title="${esc(os.diagnostico ?? '')}"><div class="os-diag">${esc(os.diagnostico || '—')}</div></td>
    <td class="col-status"><span class="os-status ${osStatusClass(os.status)}">${esc(os.status)}</span></td>
    <td class="col-desc">${osTextoLongo(os.descricao)}
    </td>
    <td class="col-resp">${osTextoLongo(os.resposta)}
    </td>
  </tr>`;
}

// "ver mais / ver menos" da descrição (delegado: vale para o card e para o modal)
document.addEventListener('click', e => {
  const btn = e.target.closest('.os-ver-mais');
  if (!btn) return;
  const desc = btn.nextElementSibling;
  const aberta = desc.classList.toggle('os-desc-recolhida') === false;
  btn.textContent = aberta ? 'ver menos' : 'ver mais';
});

// Aceita vários formatos de resposta do n8n
function normalizarHistoricoPotencia(raw) {
  if (Array.isArray(raw)) {
    if (raw[0]?.sinal_rx !== undefined) return raw;            // array de registros direto
    if (Array.isArray(raw[0]?.dados))   return raw[0].dados;   // [{ dados: [...] }]
    return [];
  }
  if (raw?.sinal_rx !== undefined) return [raw];               // objeto único direto
  if (Array.isArray(raw?.dados))   return raw.dados;           // { dados: [...] }
  return [];
}

// Aceita string direta, { url } ou array de qualquer um dos dois
function extrairUrlAcs(raw) {
  if (typeof raw === 'string') return raw || null;
  if (Array.isArray(raw)) return extrairUrlAcs(raw[0]);
  if (raw && typeof raw === 'object') return raw.acsUrl || raw.url || raw.link || raw.acs_url || null;
  return null;
}

function potenciaRow(p) {
  const dbm = parseFloat(p.sinal_rx);
  const cls = !isNaN(dbm) && dbm >= -26 ? 'pot-good' : 'pot-bad';
  return `
  <tr>
    <td class="col-pot-date">${esc(p.data ?? '—')}</td>
    <td class="col-pot-signal"><span class="${cls}">${esc(p.sinal_rx ?? '—')} dBm</span></td>
    <td class="col-pot-temp">${esc(p.temperatura ?? '—')} °C</td>
  </tr>`;
}

function osStatusClass(s) {
  return {
    'Finalizada':         'os-concluida',
    'Execução':           'os-andamento',
    'Deslocamento':       'os-andamento',
    'Assumida':           'os-andamento',
    'Agendada':           'os-agendada',
    'Ag. Agendamento':    'os-agendada',
    'Aberta':             'os-aguardando',
    'Análise':            'os-aguardando',
    'Encaminhada':        'os-aguardando',
    'Cancelada':          'os-cancelada',
  }[s] || 'os-aguardando';
}

// ══════════════════════════════════════════════════════
// MENU DE AÇÕES DO CABEÇALHO (⋮)
// ══════════════════════════════════════════════════════
function toggleHeaderMenu() {
  const dropdown = document.getElementById('header-menu-dropdown');
  const btn      = document.getElementById('btn-header-menu-toggle');
  if (!dropdown || !btn) return;
  const vaiAbrir = dropdown.classList.contains('hidden');
  dropdown.classList.toggle('hidden', !vaiAbrir);
  btn.setAttribute('aria-expanded', String(vaiAbrir));
}

function closeHeaderMenu() {
  const dropdown = document.getElementById('header-menu-dropdown');
  const btn      = document.getElementById('btn-header-menu-toggle');
  if (dropdown) dropdown.classList.add('hidden');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

// Listener único (independe de o topbar ser re-renderizado a cada troca de cliente)
document.addEventListener('click', (e) => {
  const wrap     = document.getElementById('header-menu');
  const dropdown = document.getElementById('header-menu-dropdown');
  if (!wrap || !dropdown || dropdown.classList.contains('hidden')) return;
  if (!wrap.contains(e.target)) closeHeaderMenu();
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const dropdown = document.getElementById('header-menu-dropdown');
  if (dropdown && !dropdown.classList.contains('hidden')) closeHeaderMenu();
});

// ══════════════════════════════════════════════════════
// BIND EVENTOS PÓS-RENDER
// ══════════════════════════════════════════════════════
function bindDashboardEvents(contrato) {
  // Menu de três pontos (ações secundárias do cabeçalho)
  const btnHeaderMenu = document.getElementById('btn-header-menu-toggle');
  if (btnHeaderMenu) {
    btnHeaderMenu.addEventListener('click', () => toggleHeaderMenu());
  }

  // Recarregar dados do cliente atual (sem perder a seleção)
  const menuItemReload = document.getElementById('menu-item-reload');
  if (menuItemReload) {
    menuItemReload.addEventListener('click', async () => {
      if (menuItemReload.dataset.loading) return;
      menuItemReload.dataset.loading = '1';
      document.getElementById('menu-item-reload-icon').classList.add('spinning');
      closeHeaderMenu();
      try {
        await etapa4_carregarDashboard(state.loginSelecionado);
      } catch (err) {
        console.error('[recarregar dashboard]', err);
        alert('Erro ao recarregar os dados. Tente novamente.');
      } finally {
        delete menuItemReload.dataset.loading;
      }
    });
  }

  // Alternar tema (5 opções em sequência)
  const menuItemTheme = document.getElementById('menu-item-theme');
  if (menuItemTheme) {
    menuItemTheme.addEventListener('click', () => {
      alternarTema();
      atualizarTituloTema();
      closeHeaderMenu();
    });
  }
  atualizarTituloTema();

  // Abrir ACS — busca a URL via webhook e abre em nova aba
  const menuItemAcs = document.getElementById('menu-item-acs');
  if (menuItemAcs) {
    menuItemAcs.addEventListener('click', async () => {
      if (menuItemAcs.dataset.loading) return;
      menuItemAcs.dataset.loading = '1';
      document.getElementById('menu-item-acs-icon').classList.add('spinning');
      closeHeaderMenu();

      // Abre a aba já no clique (senão o navegador bloqueia como pop-up
      // depois do await) e só navega para a URL quando ela chegar.
      const novaAba = window.open('', '_blank');
      if (novaAba) novaAba.opener = null;

      try {
        const raw = await postWebhook(WEBHOOK.url('pegar_url_acs'), {
          login: menuItemAcs.dataset.login
        });
        const url = extrairUrlAcs(raw);
        if (!url) throw new Error('URL do ACS não veio na resposta do webhook');
        if (novaAba) novaAba.location.href = url;
        else window.open(url, '_blank', 'noopener');
      } catch (err) {
        console.error('[pegar_url_acs]', err);
        if (novaAba) novaAba.close();
        alert('Erro ao abrir o ACS. Tente novamente.');
      } finally {
        delete menuItemAcs.dataset.loading;
        document.getElementById('menu-item-acs-icon').classList.remove('spinning');
      }
    });
  }

  // Recarregar — refaz a busca do cliente e redesenha o dashboard
  const btnRecarregar = document.getElementById('btn-recarregar');
  if (btnRecarregar) {
    btnRecarregar.addEventListener('click', async () => {
      if (btnRecarregar.dataset.loading) return;
      btnRecarregar.dataset.loading = '1';
      btnRecarregar.disabled = true;
      document.getElementById('btn-recarregar-icon').classList.add('spinning');
      const urlStatus = WEBHOOK.url('status_conexao');
      try {
        if (urlStatus) {
          // Leve: só online/offline e IP, sem redesenhar o dashboard
          const raw = await postWebhook(urlStatus, {
            login:      btnRecarregar.dataset.login,
            login_id:   state.loginSelecionado?.login_id,
            cliente_id: state.clienteSelecionado?.cliente_id
          });
          aplicarStatusConexao(raw);
        } else {
          // Webhook leve ainda não configurado: recarrega tudo (redesenha o card)
          await etapa4_carregarDashboard(state.loginSelecionado);
          return;
        }
      } catch (err) {
        console.error('[recarregar status]', err);
        alert('Erro ao recarregar os dados. Tente novamente.');
      }
      delete btnRecarregar.dataset.loading;
      btnRecarregar.disabled = false;
      document.getElementById('btn-recarregar-icon').classList.remove('spinning');
    });
  }

  // Potência atual — consulta o sinal da ONU na hora e atualiza só a barra de sinal
  const btnPotAtual = document.getElementById('btn-potencia-atual');
  if (btnPotAtual) btnPotAtual.addEventListener('click', () => consultarPotenciaAtual(false));

  // Limpar MAC / Desconectar login — pedem confirmação e chamam o webhook
  bindAcaoLogin('btn-reiniciar-roteador', 'reiniciar_roteador', 'Reiniciar o roteador do login', 'Roteador reiniciado com sucesso.', { soLogin: true });
  bindAcaoLogin('btn-limpar-mac',        'limpar_mac',        'Limpar o MAC do login',  'MAC limpo com sucesso.');
  bindAcaoLogin('btn-reiniciar-onu',     'reiniciar_onu',     'Reiniciar a ONU',        'ONU reiniciada com sucesso.');
  bindAcaoLogin('btn-desconectar-login', 'desconectar_login', 'Desconectar o login',    'Login desconectado com sucesso.');

  // Abrir atendimento — abre o modal de novo atendimento
  const btnAbrirAtendimento = document.getElementById('btn-abrir-atendimento');
  if (btnAbrirAtendimento) {
    btnAbrirAtendimento.addEventListener('click', () => {
      document.getElementById('form-atendimento').reset();
      document.getElementById('atendimento-descricao').style.height = '';
      document.getElementById('atendimento-aviso-330').classList.add('hidden');
      const erroEl = document.getElementById('atendimento-erro');
      erroEl.classList.add('hidden');
      erroEl.classList.remove('success');
      document.getElementById('modal-atendimento').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  }

  // Copiar login + senha — Central do Assinante e PPPoE
  bindBotaoCopiarAcesso('btn-copiar-acesso');
  bindBotaoCopiarAcesso('btn-copiar-pppoe');

  // Copiar PIX
  const btnPix = document.getElementById('btn-pix');
  if (btnPix) {
    btnPix.addEventListener('click', () => {
      const code  = btnPix.dataset.pix;
      const label = document.getElementById('pix-label');
      const copiar = () => {
        label.textContent = 'Copiado! ✓';
        btnPix.classList.add('copied');
        setTimeout(() => { label.textContent = 'Copiar PIX'; btnPix.classList.remove('copied'); }, 2500);
      };
      navigator.clipboard
        ? navigator.clipboard.writeText(code).then(copiar).catch(() => copiarFallback(code, copiar))
        : copiarFallback(code, copiar);
    });
  }

  // Histórico de potência da ONU — chama webhook separado
  const btnHistoricoPotencia = document.getElementById('btn-onu-historico');
  if (btnHistoricoPotencia) {
    btnHistoricoPotencia.addEventListener('click', async () => {
      if (btnHistoricoPotencia.dataset.loading) return;
      btnHistoricoPotencia.dataset.loading = '1';
      setLoadingOverlay(true, 'Consultando histórico de potência...');

      try {
        const raw = await postWebhook(WEBHOOK.url('historico_potencia'), {
          login_id: state.loginSelecionado?.login_id
        });

        potenciaHistoricoCompleto = normalizarHistoricoPotencia(raw);
        potenciaPaginaAtual = 1;
        renderPotenciaTabela();

        document.getElementById('modal-potencia').style.display = 'flex';
        document.body.style.overflow = 'hidden';
      } catch (err) {
        console.error('[historico_potencia]', err);
        alert('Erro ao consultar o histórico de potência. Tente novamente.');
      } finally {
        delete btnHistoricoPotencia.dataset.loading;
        setLoadingOverlay(false);
      }
    });
  }

  // Ver todas as OS — chama webhook separado
  const btnVerTodas = document.getElementById('btn-ver-todas');
  if (btnVerTodas) {
    btnVerTodas.addEventListener('click', async () => {
      const label = document.getElementById('btn-ver-todas-label');
      if (btnVerTodas.dataset.loading) return;
      btnVerTodas.dataset.loading = '1';
      label.textContent = 'Carregando...';

      try {
        // Usa a lista já carregada em segundo plano; só busca de novo se ela ainda não chegou
        const todas = state.osTodas || normalizarOsLista(await postWebhook(WEBHOOK.url('busca_todas_os'), {
          login_id:   state.loginSelecionado?.login_id,
          cliente_id: state.clienteSelecionado?.cliente_id
        }));

        // Abre o modal com todas as OS
        const modal = document.getElementById('modal-os');
        document.getElementById('modal-os-tbody').innerHTML = todas.map(osRow).join('');
        document.querySelector('.modal-os-title').textContent = `Todas as Ordens de Serviço (${todas.length})`;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        label.textContent = 'Ver todas as OS';
      } catch (err) {
        console.error('[busca_todas_os]', err);
        label.textContent = 'Erro ao carregar';
      } finally {
        delete btnVerTodas.dataset.loading;
      }
    });
  }
}

function bindBotaoCopiarAcesso(id) {
  const btn = document.getElementById(id);
  if (!btn) return;
  const iconOriginal  = btn.innerHTML;
  const tituloOriginal = btn.title;

  btn.addEventListener('click', () => {
    const texto = `Login: ${btn.dataset.login || '—'}\nSenha: ${btn.dataset.senha || '—'}`;
    const copiar = () => {
      btn.innerHTML = iconCheck();
      btn.classList.add('copied');
      btn.title = 'Copiado!';
      setTimeout(() => {
        btn.innerHTML = iconOriginal;
        btn.classList.remove('copied');
        btn.title = tituloOriginal;
      }, 2000);
    };
    navigator.clipboard
      ? navigator.clipboard.writeText(texto).then(copiar).catch(() => copiarFallback(texto, copiar))
      : copiarFallback(texto, copiar);
  });
}

function copiarFallback(text, cb) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); cb(); } catch(_) {}
  document.body.removeChild(ta);
}

// ══════════════════════════════════════════════════════
// MODAL TODAS AS OS
// ══════════════════════════════════════════════════════
function setupModal() {
  document.getElementById('modal-os-close').addEventListener('click', closeModalOS);
  document.getElementById('modal-os').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModalOS();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModalOS(); });
}

function closeModalOS() {
  document.getElementById('modal-os').style.display = 'none';
  document.body.style.overflow = '';
}

// ══════════════════════════════════════════════════════
// MODAL HISTÓRICO DE POTÊNCIA
// ══════════════════════════════════════════════════════
const POTENCIA_POR_PAGINA = 15;
let potenciaHistoricoCompleto = [];
let potenciaPaginaAtual = 1;

function setupModalPotencia() {
  document.getElementById('modal-potencia-close').addEventListener('click', closeModalPotencia);
  document.getElementById('modal-potencia').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModalPotencia();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('modal-potencia').style.display !== 'none') closeModalPotencia();
  });

  document.getElementById('pot-prev-page').addEventListener('click', () => {
    if (potenciaPaginaAtual > 1) { potenciaPaginaAtual--; renderPotenciaTabela(); }
  });
  document.getElementById('pot-next-page').addEventListener('click', () => {
    const totalPaginas = Math.max(1, Math.ceil(potenciaHistoricoCompleto.length / POTENCIA_POR_PAGINA));
    if (potenciaPaginaAtual < totalPaginas) { potenciaPaginaAtual++; renderPotenciaTabela(); }
  });
}

function renderPotenciaTabela() {
  const total = potenciaHistoricoCompleto.length;
  const totalPaginas = Math.max(1, Math.ceil(total / POTENCIA_POR_PAGINA));
  const inicio = (potenciaPaginaAtual - 1) * POTENCIA_POR_PAGINA;
  const pagina = potenciaHistoricoCompleto.slice(inicio, inicio + POTENCIA_POR_PAGINA);

  document.getElementById('modal-potencia-tbody').innerHTML = pagina.length
    ? pagina.map(potenciaRow).join('')
    : '<tr><td colspan="3" class="col-pot-vazio">Nenhum histórico encontrado</td></tr>';

  document.getElementById('pot-page-info').textContent = `Página ${potenciaPaginaAtual} de ${totalPaginas}`;
  document.getElementById('pot-prev-page').disabled = potenciaPaginaAtual <= 1;
  document.getElementById('pot-next-page').disabled = potenciaPaginaAtual >= totalPaginas;
  document.getElementById('modal-potencia-pagination').classList.toggle('hidden', total <= POTENCIA_POR_PAGINA);
}

function closeModalPotencia() {
  document.getElementById('modal-potencia').style.display = 'none';
  document.body.style.overflow = '';
}

// ══════════════════════════════════════════════════════
// MODAL ABRIR ATENDIMENTO
// ══════════════════════════════════════════════════════
// Modelo de descrição pré-preenchido por assunto (id → template)
const ASSUNTO_TEMPLATES = {
  '99':  'CLIENTE APRESENTA QUAL PROBLEMA?\nOUTROS (  ) - LENTIDÃO (  ) - QUEDAS (  ) - SEM CONEXÃO (  )\n--\nOBS.:',
  '264': 'PROTOCOLO DA OS ANTERIOR:\n--\nMOTIVO DO RETRABALHO:\n--\nTÉCNICO RESPONSÁVEL:\n--\nDATA DA ULTIMA VISITA:\nR:\n--\nINFORMAÇÕES DA OS ANTERIOR ANOTADAS PELOS TÉCNICOS EXTERNO:\nR:\n--\nQuedas nos últimos 7 Dias: \nR: ',
  '108': 'MOTIVO APRESENTANDO PELO CLIENTE:\nR:\n--\nOBSERVAÇÃO:',
  '330': 'QUAL A SOLICITAÇÃO?\nR.:\n\n*****ATENÇÃO: EM CASO DE ALTERAÇÃO DE VENCIMENTO, CONFIRMAR COM CLIENTE TELEFONE PARA CONTATO E CONFIRMAÇÃO DA SOLICITAÇÃO',
};

function setupModalAtendimento() {
  const modal = document.getElementById('modal-atendimento');
  document.getElementById('modal-atendimento-close').addEventListener('click', closeModalAtendimento);
  modal.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModalAtendimento();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.style.display !== 'none') closeModalAtendimento();
  });

  // Preenche a descrição com o modelo do assunto escolhido
  const descricaoEl = document.getElementById('atendimento-descricao');
  document.getElementById('atendimento-assunto').addEventListener('change', (e) => {
    descricaoEl.value = ASSUNTO_TEMPLATES[e.target.value] || '';
    autoResizeTextarea(descricaoEl);
    document.getElementById('atendimento-aviso-330').classList.toggle('hidden', e.target.value !== '330');
  });

  // Ajusta a altura automaticamente conforme o texto digitado
  descricaoEl.addEventListener('input', () => autoResizeTextarea(descricaoEl));

  document.getElementById('form-atendimento').addEventListener('submit', async (e) => {
    e.preventDefault();

    const assunto   = document.getElementById('atendimento-assunto').value;
    const descricao = document.getElementById('atendimento-descricao').value.trim();
    const erroEl    = document.getElementById('atendimento-erro');
    const btn       = document.getElementById('btn-enviar-atendimento');
    const label     = document.getElementById('btn-enviar-atendimento-label');
    const spinner   = document.getElementById('btn-enviar-atendimento-spinner');

    erroEl.classList.add('hidden');
    erroEl.classList.remove('success');

    if (!assunto || !descricao) {
      erroEl.textContent = 'Preencha o assunto e a descrição.';
      erroEl.classList.remove('hidden');
      return;
    }

    if (btn.dataset.loading) return;
    btn.dataset.loading = '1';
    btn.disabled = true;
    label.textContent = 'Enviando...';
    spinner.classList.remove('hidden');

    try {
      const resposta = await postWebhook(WEBHOOK.url('abrir_atendimento'), {
        login_id:    state.loginSelecionado?.login_id,
        cliente_id:  state.clienteSelecionado?.cliente_id,
        contrato_id: state.contratoId,
        assunto,
        mensagem: escapeParaJsonBruto(descricao)
      });
      const bloco = Array.isArray(resposta) ? (resposta[0] || {}) : (resposta || {});
      erroEl.textContent = bloco.message || 'Atendimento aberto com sucesso!';
      erroEl.classList.add('success');
      erroEl.classList.remove('hidden');
      setTimeout(closeModalAtendimento, 1800);
    } catch (err) {
      console.error('[abrir_atendimento]', err);
      erroEl.textContent = 'Erro ao enviar. Tente novamente.';
      erroEl.classList.remove('hidden');
    } finally {
      delete btn.dataset.loading;
      btn.disabled = false;
      label.textContent = 'Abrir atendimento';
      spinner.classList.add('hidden');
    }
  });
}

function closeModalAtendimento() {
  document.getElementById('modal-atendimento').style.display = 'none';
  document.body.style.overflow = '';
}

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

// Escapa a mensagem para sobreviver à interpolação de texto cru feita no n8n
// (o fluxo insere o valor direto dentro de um JSON escrito à mão, sem
// serializar de novo — quebras de linha/aspas reais quebram o JSON resultante).
function escapeParaJsonBruto(texto) {
  return String(texto)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r\n|\r|\n/g, '\\n');
}

// ══════════════════════════════════════════════════════
// BACK BUTTONS
// ══════════════════════════════════════════════════════
function setupBackButtons() {
  document.getElementById('btn-back-selection').addEventListener('click', () => {
    showScreen('screen-search');
  });
}

// ══════════════════════════════════════════════════════
// SCREEN TRANSITIONS
// ══════════════════════════════════════════════════════
function showScreen(id) {
  if (id === 'screen-search') avisarShell({ type: 'titulo', titulo: '' });
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}

// ══════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════

// ── Normaliza resposta do Webhook 1 ──────────────────
// Agrupa por nome — nomes iguais = mesmo cliente com múltiplos endereços
// Aceita tanto o formato bruto do banco quanto o formato já tratado pelo n8n
function normalizarClientes(raw) {
  const map = {}; // chave = nome em lowercase

  raw.forEach(item => {
    const nome = item.nome || item.razao || '—';
    const key  = nome.toLowerCase().trim();

    if (!map[key]) {
      map[key] = {
        cliente_id: String(item.cliente_id ?? item.id ?? ''),
        nome,
        cpf:        item.cpf || item.cnpj_cpf || '—',
        ativo:      item.ativo,
        enderecos:  []
      };
    } else if (map[key].cpf === '—' && (item.cpf || item.cnpj_cpf)) {
      // Registros duplicados do mesmo cliente podem vir com CPF vazio;
      // aproveita o CPF assim que algum registro do grupo o trouxer.
      map[key].cpf = item.cpf || item.cnpj_cpf;
    }

    const clienteId = String(item.cliente_id ?? item.id ?? '');
    const itemAtivo = item.ativo;

    // Se já veio com array de endereços formatado (pelo Code do n8n)
    if (Array.isArray(item.enderecos)) {
      item.enderecos.forEach(e => map[key].enderecos.push({
        ...e,
        cidade:     CIDADES[String(e.cidade)] || e.cidade || '—',
        ativo:      e.ativo ?? itemAtivo,
        cliente_id: e.cliente_id || clienteId
      }));

    // Se veio flat (direto do banco)
    } else if (item.endereco || item.rua) {
      map[key].enderecos.push({
        cliente_id:    clienteId,
        ativo:         itemAtivo,
        cidade:        CIDADES[String(item.cidade)] || item.cidade || '—',
        bairro:        item.bairro        || '—',
        rua:           item.endereco      || item.rua || '—',
        numero:        item.numero        || '—',
        id_condominio: item.id_condominio || '',
        bloco:         item.bloco         || '',
        apartamento:   item.apartamento   || ''
      });
    }
  });

  return Object.values(map);
}

// ── Mapeia status_internet ────────────────────────────
function mapStatusInternet(val) {
  const map = {
    'A':  { label: 'Ativo',               css: 'badge-ativo'      },
    'D':  { label: 'Desativado',          css: 'badge-bloqueado'  },
    'CM': { label: 'Bloqueio Manual',     css: 'badge-bloqueado'  },
    'CA': { label: 'Bloqueio Automático', css: 'badge-bloqueado'  },
    'FA': { label: 'Fin. em Atraso',      css: 'badge-aguardando' },
    'AA': { label: 'Ag. Assinatura',      css: 'badge-aguardando' },
  };
  return map[val] ?? { label: val || '—', css: 'badge-aguardando' };
}

// ── Map de Segmentos ──────────────────────────────────
const SEGMENTOS = {
  '1': 'Loja',
  '2': 'PAP',
  '3': 'Vendas Interna',
  '4': 'E-Commerce',
  '5': 'Vendas PJ',
};

// ── Map de Canais de Venda ─────────────────────────────
const CANAIS_VENDA = {
  '83':  'Indicação de Não Clientes',
  '84':  'Vendedor PJ',
  '94':  'Segundo Ponto',
  '95':  'Disparo',
  '97':  'Recontratação de Cliente de Renegociação',
  '98':  'Parceria - The House',
  '99':  'Parceria - KNN',
  '100': 'Indique e Ganhe + Google',
  '101': 'Indique e Ganhe + Meta',
  '102': 'Indique e Ganhe + Site',
  '103': 'Reduz',
  '104': 'Parceria Rede Neutra',
  '105': 'Indique e Ganhe + Disparo',
  '106': 'Mudança de Endereço',
  '107': 'E-Commerce',
};

// ── Map de Cidades ────────────────────────────────────
const CIDADES = {
  '3293': 'Aparecida',
  '3363': 'Cachoeira Paulista',
  '3379': 'Canas',
  '3414': 'Cruzeiro',
  '3474': 'Guaratinguetá',
  '3566': 'Lavrinhas',
  '3572': 'Lorena',
  '3693': 'Pindamonhangaba',
  '3697': 'Piquete',
  '3736': 'Queluz',
  '3763': 'Roseira',
};

// ── Map de Setores ────────────────────────────────────
const SETORES = {
  '8':  'Almoxarifado',
  '10': 'Financeiro',
  '19': 'Manutenção e Projetos FO',
  '24': 'Ativação Interna',
  '25': 'Pós Vendas',
  '26': 'Pesquisa de Qualidade',
  '27': 'Ouvidoria',
  '28': 'Retenção',
  '31': 'Vendas',
  '32': 'Auditoria Comercial',
  '34': 'Atendimento',
  '35': 'Administração Financeira',
  '36': 'Faturamento',
  '38': 'Cancelamento',
  '39': 'Negociação',
  '41': 'Cobrança',
  '42': 'Controller Operacional',
  '43': 'Controller de Estoque',
  '44': 'Auditoria Operacional',
  '45': 'Backoffice de Suporte',
  '46': 'SAC de Suporte',
  '47': 'Supervisão Técnica',
  '48': 'Suporte N1',
  '49': 'Suporte N2',
  '50': 'Suporte N3',
  '53': 'Fiscal N3',
  '54': 'Gestor N3 - Douglas',
  '55': 'RH',
  '57': 'Gestor N3 - Circio',
  '58': 'CS Técnico',
  '59': 'Design Gráfico',
  '60': 'Suporte Emergencial',
  '61': 'Operacional',
  '62': 'Contas a Pagar',
  '63': 'Auditoria Técnica - FO',
  '64': 'Retirada',
  '65': 'Controle e Gerenciamento de Redes',
  '66': 'ADM Marketing',
  '67': 'Operações de Marketing',
  '68': 'Vendas Externas PAP',
  '69': 'Departamento Pessoal',
  '70': 'Técnico',
  '71': 'Fiscal e Tributário',
  '72': 'Ativação Terceiro',
  '73': 'Faturamento - Grupo AGE',
  '74': 'Projetos - Grupo AGE',
  '75': 'Auditoria de Projetos - Grupo AGE',
  '76': 'Monitoramento Proativo',
};

// ── Normaliza resposta do Webhook 3 ──────────────────
// O n8n retorna [{ "data": [...] }] com itens identificados pelo conteúdo:
// voip: tem telefone_voip | contrato: tem id_contrato | mvno: tem id_linha_mvno
// produtos: tem produtos | info_cliente: tem info_cliente | onu: tem id_onu | os: tem ordem_de_serviço
function normalizarContrato(raw) {
  const wrapper = Array.isArray(raw) ? raw[0] : raw;
  const arr     = Array.isArray(wrapper?.data) ? wrapper.data : (Array.isArray(raw) ? raw : [raw]);

  // Normaliza cada item (pode vir como objeto direto ou array-com-um-objeto)
  const items = arr.map(v => Array.isArray(v) ? (v[0] || {}) : (v || {}));

  // Identifica cada bloco pelo conteúdo
  const voip           = items.find(i => 'telefone_voip'    in i) || {};
  // índice 1 = dados PPPoE/acesso; índice 3 = dados do contrato (plano, vendedor, etc.)
  const contrato       = items.find(i => 'senhaPppoe' in i) || {};
  const dadosContrato  = items.find(i => 'plano_venda' in i || 'status_contrato' in i) || {};
  const infoBloco      = items.find(i => 'info_cliente'     in i) || {};
  const onu            = items.find(i => 'id_onu'           in i) || {};
  const osBloco        = items.find(i => 'ordem_de_serviço' in i) || {};

  // MVNO: vêm dentro de { mvnos: [...] } ou como itens flat com id_linha_mvno
  const mvnosBloco = items.find(i => Array.isArray(i.mvnos));
  const mvnoArr    = mvnosBloco ? mvnosBloco.mvnos : items.filter(i => i.id_linha_mvno);

  // Produtos: vêm dentro de { produtos: [{produtos: "..."}, ...] } ou como itens flat
  const produtosBloco = items.find(i => Array.isArray(i.produtos));
  const produtosArr   = produtosBloco
    ? produtosBloco.produtos.map(p => p.produtos).filter(Boolean)
    : items.filter(i => typeof i.produtos === 'string').map(i => i.produtos);

  // Comodatos: vêm dentro de { comodatos: [{equipamento: "..."}, ...] } ou como itens flat
  const comodatosBloco = items.find(i => Array.isArray(i.comodatos));
  const comodatosArr   = comodatosBloco
    ? comodatosBloco.comodatos.map(c => c.equipamento).filter(Boolean)
    : items.filter(i => typeof i.comodatos === 'string').map(i => i.comodatos);

  // Boletos: vêm dentro de um objeto { boletos: [...] }
  const boletosBloco = items.find(i => Array.isArray(i.boletos));
  const fin = boletosBloco ? boletosBloco.boletos : [];

  // Região de manutenção: vem dentro de um objeto { regiao_manutencao: [{ em_manutencao_s_n: "S" }] }
  const manutencaoBloco = items.find(i => Array.isArray(i.regiao_manutencao));
  const manutencaoArr   = manutencaoBloco ? manutencaoBloco.regiao_manutencao : [];
  const emManutencao    = (manutencaoArr[0] || {}).em_manutencao_s_n === 'S';

  // info_cliente
  const infoArr         = Array.isArray(infoBloco.info_cliente) ? infoBloco.info_cliente : [infoBloco];
  const cliente         = infoArr[0] || {};
  const nomeFuncionario = (infoArr[1] || {}).nome_funcionario || '';
  const nomeVendedor    = (infoArr[2] || {}).nome_vendedor    || '';
  const canalVendas     = (infoArr[3] || {}).canal_vendas     || '';
  const indicadoPor     = (infoArr[4] || {}).indicado_por     || '';

  // ── Fibra / ONU ──
  const TRANSMISSORES = {
    '1':   '5_FH_OLT_01_BARAO',
    '2':   'OLT-Fiberhome Pinda',
    '7':   'OLT Fiberhome Cruzeiro 2',
    '14':  'OLT Huawei Moreira Cesar',
    '17':  'OLT Huawei Queluz',
    '396': 'OLT BC - 03',
    '397': 'OLT Huawei Piquete',
    '405': 'OLT BC - 02',
    '429': 'OLT Huawei POP Guaratinguetá Beira',
    '432': 'OLT Huawei Aparecida 02',
    '436': 'OLT Huawei Guaratinguetá Centro',
    '439': 'OLT Fiberhome 6000 Cruzeiro',
    '440': 'OLT Huawei Aparecida 01',
  };

  const fibraOnu = onu.id_onu ? {
    transmissor: TRANSMISSORES[String(onu.id_transmissor)] || `#${onu.id_transmissor || '—'}`,
    pon_id:          onu.ponid    || '—',
    mac:             onu.mac      || '—',
    vlan:            onu.vlan     || '—',
    ultima_potencia: onu.sinal_rx || '0',
    id_onu:          onu.id_onu,
  } : null;

  // ── Telefonia VoIP ──
  const telefonia = voip.telefone_voip ? {
    numero: voip.telefone_voip,
    tipo:   'Fixa',
    plano:  '—',
    senha:  voip.senha_voip || '',
  } : null;

  // ── Linhas MVNO ──
  const linhasMvno = mvnoArr
    .filter(l => l.id_linha_mvno)
    .map(l => ({
      id:                   l.id_linha_mvno,
      numero:               (l.ddd_telefone && l.numero_telefone)
                              ? `(${l.ddd_telefone}) ${l.numero_telefone}` : '—',
      status:               mapStatusLinhaMvno(l.status_linha),
      simcard:              l.simcard || '—',
      esim:                 l.esim_s_n === 'S',
      portabilidade:        !!(l.status_portabilidade),
      status_portabilidade: mapStatusPortabilidade(l.status_portabilidade),
    }));

  // ── OS ──
  const osRaw = Array.isArray(osBloco['ordem_de_serviço']) ? osBloco['ordem_de_serviço'] : [];
  const ordensServico = osRaw.map(o => ({
    os_id:    o.id_ordem            || '—',
    data:     o.data_abertura_ordem || '',
    assunto:  o.assunto_ordem       || o.id_assunto || '—',
    setor:    SETORES[String(o.setor_ordem)] || o.setor_ordem || '—',
    setor_id: String(o.setor_ordem ?? ''),
    status:   mapStatusOS(o.status_ordem),
    descricao: o.mensagem_ordem     || '—',
    resposta:  o.mensagem_resposta  || '—',
  }));

  return {
    // Identificadores
    contrato_id: contrato.id_contrato || '—',

    // Geral
    status_conexao: contrato.online === 'S' ? 'online' : 'offline',
    status_acesso:  contrato.ativo  === 'S' ? 'Ativo'  : 'Bloqueado',
    status_internet: dadosContrato.status_internet || 'A',
    plano:          contrato.plano  || state.loginSelecionado?.plano || '—',
    ip_roteador:    contrato.ip     || '—',
    quedas:         Number(contrato.quedas_hoje) || 0,
    offline_desde:  contrato.conexao_final || null,
    em_manutencao:  emManutencao,

    // Central do assinante (portal hotsite)
    login: cliente.hotsite_email || '—',
    senha: cliente.hotsite_senha || '—',

    // PPPoE
    login_pppoe: contrato.login      || '—',
    senha_pppoe: contrato.senhaPppoe || '—',

    // Endereço
    endereco: {
      cidade: CIDADES[String(cliente.cidade)] || cliente.cidade || '—',
      bairro: cliente.bairro      || '—',
      rua:    cliente.rua         || '—',
      numero: cliente.numero_casa || '—',
      cep:    cliente.cep         || '—',
    },

    // Contatos
    contatos: {
      email: cliente.email_principal || '',
      telefones: [
        { label: 'Celular',      numero: cliente.telefone_celular     },
        { label: 'WhatsApp',     numero: cliente.telefone_whatsapp    },
        { label: 'Comercial',    numero: cliente.telefone_comercial   },
        { label: 'Residencial',  numero: cliente.telefone_residencial },
      ].filter(t => t.numero),
    },

    // Produtos
    produtos_contratados: produtosArr,

    // Sub-objetos
    fibra_onu:      fibraOnu,
    telefonia:      telefonia,
    linhas_mvno:    linhasMvno,
    ordens_servico: ordensServico,

    // Financeiro
    financeiro: Array.isArray(fin) ? fin : [],
    comodatos:  comodatosArr,
    dados_contrato: {
      plano_venda: dadosContrato.plano_venda || '—',
      status: ({
        'P': 'Pré-contrato', 'A': 'Ativo', 'I': 'Inativo',
        'N': 'Negativado',   'D': 'Desistiu',
      }[dadosContrato.status_contrato] || dadosContrato.status_contrato || '—'),
      tipo_cobranca: ({
        'P': 'Configuração padrão', 'I': 'Impresso', 'E': 'E-mail',
      }[dadosContrato['tipo_cobrança'] || dadosContrato.tipo_cobranca] || '—'),
      motivo_inclusao: ({
        'I': 'Instalação',          'U': 'Upgrade',              'D': 'Downgrade',
        'M': 'Mudança de Endereço', 'T': 'Mudança de Tecnologia','L': 'Mudança de titularidade',
        'N': 'Negociação',          'R': 'Reativação',
      }[dadosContrato.motivo_inclusao] || dadosContrato.motivo_inclusao || '—'),
      vendedor_faturamento: dadosContrato.vendedor          || '—',
      vendedor_ativacao:    dadosContrato.vendedor_ativacao || '—',
      data_expiracao:       dadosContrato.data_expiracao    || '',
    },
    crm: {
      segmento:     SEGMENTOS[String(cliente.id_segmento)]       || cliente.id_segmento    || '—',
      canal_venda:  canalVendas || CANAIS_VENDA[String(cliente.id_canal_vendas)] || cliente.id_canal_vendas || '—',
      responsavel:  nomeFuncionario || '—',
      indicado_por: (cliente.indicado_por_id && indicadoPor)
        ? `${cliente.indicado_por_id} - ${indicadoPor}`
        : indicadoPor || cliente.indicado_por_id || '—',
      vendedor: (cliente.id_vendedor && nomeVendedor)
        ? `${cliente.id_vendedor} - ${nomeVendedor}`
        : nomeVendedor || cliente.id_vendedor || '—',
    },

    // Dados cadastrais extras
    nome:            cliente.nomeCompleto    || '',
    cpf:             cliente.cnpj_cpf        || '',
    data_cadastro:   cliente.data_cadastro   || '',
    data_nascimento: cliente.data_nascimento || '',
    genero:          ({ 'M': 'Masculino', 'F': 'Feminino' }[cliente.genero_cliente] || cliente.genero_cliente || ''),
    rg:              cliente.ie_identidade   || '',
  };
}

function mapStatusOS(val) {
  const map = {
    'A':   'Aberta',
    'AN':  'Análise',
    'EN':  'Encaminhada',
    'AS':  'Assumida',
    'AG':  'Agendada',
    'DS':  'Deslocamento',
    'EX':  'Execução',
    'F':   'Finalizada',
    'RAG': 'Ag. Agendamento',
  };
  return map[val] || val || '—';
}

function mapStatusLinhaMvno(val) {
  const map = {
    'A':  'Ativo',
    'BR': 'Bloq. Roubo',
    'BP': 'Bloq. Perda',
    'BA': 'Bloq. Parcial',
    'I':  'Inativo',
    'BI': 'Bloq. Indevido',
    'BT': 'Bloq. Total',
    'C':  'Cancelada',
    'AA': 'Ag. Ativação',
  };
  return map[val] || val || '—';
}

function mapStatusPortabilidade(val) {
  const map = {
    'A':  'Aguardando',
    'R':  'Recusado',
    'CO': 'Concluído',
    'CA': 'Cancelado',
  };
  return map[val] || val || '—';
}

// ── Normaliza resposta do Webhook 2 ──────────────────
function normalizarLogins(raw) {
  // Aceita vários formatos de resposta do n8n
  let lista = [];
  if (Array.isArray(raw)) {
    if (raw[0]?.resultado)               lista = raw[0].resultado;
    else if (raw[0]?.login_id || raw[0]?.login) lista = raw;
    else if (raw[0]?.data)               lista = raw[0].data;
    else                                 lista = raw;
  } else if (raw?.resultado)             lista = Array.isArray(raw.resultado) ? raw.resultado : [raw.resultado];
  else if (raw?.data)                    lista = Array.isArray(raw.data)      ? raw.data      : [raw.data];
  else if (raw?.login_id || raw?.login)  lista = [raw]; // objeto único direto

  // Deduplica por login_id — mantém o mais recente (último da lista)
  const vistos = new Map();
  lista.forEach(r => {
    const id = String(r.login_id ?? r.id ?? '');
    if (id) vistos.set(id, r); // sobrescreve, ficando com o último
  });

  return Array.from(vistos.values()).map(r => ({
    login_id:        String(r.login_id ?? r.id ?? ''),
    login:           r.login  ?? '—',
    plano:           r.plano  ?? '—',
    status_conexao:  r.online === 'S' ? 'online' : 'offline',
    status_acesso:   r.ativo  === 'S' ? 'Ativo'  : 'Inativo',
    status_internet: mapStatusInternet(r.status_internet)
  }));
}

// Garante que o retorno sempre seja array,
// independente do formato que o n8n devolver
function toArray(data) {
  if (Array.isArray(data))           return data;
  if (Array.isArray(data?.clientes)) return data.clientes;
  if (Array.isArray(data?.data))     return data.data;
  if (data && typeof data === 'object') return [data];
  return [];
}

// Classificação do sinal óptico (≥ -26 dBm é boa)
function classificarSinal(dbm) {
  const boa = dbm >= -26;
  return {
    sigClass: boa ? 'signal-good' : 'signal-bad',
    sigLabel: boa ? 'Boa'         : 'Atenção',
    sigIcon:  boa ? '📶'          : '⚠️',
  };
}

// O webhook devolve [{ data: "<html>…" }] (painel do IXC com linhas "Sinal Rx: -20.55").
// O HTML só é lido com DOMParser (não executa scripts) e dele saem apenas os valores.
function extrairPotenciaAtual(raw) {
  const item = Array.isArray(raw) ? raw[0] : raw;
  const html = typeof item === 'string' ? item : item?.data;
  if (typeof html !== 'string') throw new Error('Resposta sem HTML');

  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const campos = {};
  doc.querySelectorAll('.panel-body div').forEach(d => {
    const t = d.textContent;
    const i = t.indexOf(':');
    if (i > 0) campos[norm(t.slice(0, i))] = t.slice(i + 1).trim();
  });

  const rx = parseFloat(campos['sinal rx']);
  if (isNaN(rx)) {
    // O IXC avisa "Onu Offline!" quando não consegue ler a ONU
    // e, nesse caso, traz a causa da última queda (LOS, Dying Gasp…) e quando ela ocorreu
    if (norm(doc.body?.textContent || '').includes('onu offline')) {
      const m = (campos['last down time'] || '').match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2})/);
      return {
        offline: true,
        causa: campos['causa da ultima queda'],
        ultimaQueda: m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}` : '',
      };
    }
    throw new Error('Sinal Rx não encontrado na resposta');
  }
  return {
    rx,
    tx:          campos['sinal tx'],
    temperatura: campos['temperatura'],
    voltagem:    campos['voltagem'],
  };
}

// Consulta a ONU na hora e atualiza só a barra de sinal. Roda sozinha ao abrir o
// dashboard (silencioso: se falhar, fica o valor antigo sem alerta) e a cada clique.
async function consultarPotenciaAtual(silencioso) {
  const btn = document.getElementById('btn-potencia-atual');
  if (!btn || btn.dataset.loading) return;   // cliente sem ONU, ou já consultando

  const url = WEBHOOK.url('potencia_atual');
  if (!url) {
    if (!silencioso) alert('Webhook da potência atual ainda não foi configurado.');
    return;
  }

  const icone  = btn.querySelector('#btn-potencia-atual-icon');
  const rotulo = btn.querySelector('#btn-potencia-atual-label');
  const loginId = state.loginSelecionado?.login_id;

  btn.dataset.loading = '1';
  btn.disabled = true;
  icone.classList.add('spinning');
  rotulo.textContent = 'Consultando...';
  try {
    const raw = await postWebhook(url, {
      id_onu:     btn.dataset.idOnu,
      login_id:   loginId,
      cliente_id: state.clienteSelecionado?.cliente_id
    });
    // Se o dashboard foi redesenhado ou trocou de cliente enquanto esperava, descarta
    if (!btn.isConnected || state.loginSelecionado?.login_id !== loginId) return;
    aplicarPotenciaAtual(extrairPotenciaAtual(raw));
  } catch (err) {
    console.error('[potencia_atual]', err);
    if (!silencioso) alert('Erro ao consultar a potência. Tente novamente.');
  } finally {
    delete btn.dataset.loading;
    btn.disabled = false;
    icone.classList.remove('spinning');
    rotulo.textContent = 'Potência atual';
  }
}

function aplicarPotenciaAtual(info) {
  const rotuloBarra = document.getElementById('onu-signal-label');
  if (rotuloBarra) rotuloBarra.textContent = info.offline ? 'Estado da ONU' : 'Potência Atual';

  if (info.offline) {
    document.getElementById('onu-signal-bar').className = 'signal-bar signal-bad';
    document.getElementById('onu-signal-icon').textContent  = '🔌';
    // A causa (LOS, Dying Gasp…) toma o lugar de "Onu Offline!" para ficar bem à vista
    document.getElementById('onu-signal-value').textContent = info.causa || 'Onu Offline!';
    document.getElementById('onu-signal-qual').textContent  = 'Offline';
    document.getElementById('onu-signal-extra').textContent = [
      info.causa       ? 'Onu Offline — causa da última queda' : '',
      info.ultimaQueda ? `caiu em ${info.ultimaQueda}`         : '',
    ].filter(Boolean).join(' · ');
    return;
  }

  const { sigClass, sigLabel, sigIcon } = classificarSinal(info.rx);
  document.getElementById('onu-signal-bar').className = `signal-bar ${sigClass}`;
  document.getElementById('onu-signal-icon').textContent  = sigIcon;
  document.getElementById('onu-signal-value').textContent = `${info.rx} dBm`;
  document.getElementById('onu-signal-qual').textContent  = sigLabel;

  const extra = [
    info.tx          ? `Tx ${info.tx} dBm`      : '',
    info.temperatura ? `${info.temperatura} °C` : '',
    info.voltagem    ? `${info.voltagem} V`     : '',
  ].filter(Boolean).join(' · ');
  document.getElementById('onu-signal-extra').textContent = extra;
}

// Atualiza no card Dados Gerais só o badge online/offline e o IP do roteador.
// Aceita objeto ou array de um objeto: { online: 'S'|'N', ip: '...' } (mesmos nomes do busca_info)
function aplicarStatusConexao(raw) {
  const r = Array.isArray(raw) ? (raw[0] || {}) : (raw || {});
  if (r.online === undefined && r.ip === undefined) throw new Error('Resposta sem online/ip');

  if (r.online !== undefined) {
    const on = r.online === 'S' || r.online === true || r.online === 'true' || r.online === 'online';
    const cardGeralEl = document.getElementById('geral-conn').closest('.card-geral');
    if (cardGeralEl) {
      cardGeralEl.classList.toggle('conn-online', on);
      cardGeralEl.classList.toggle('conn-offline', !on);
    }
    document.getElementById('geral-conn').innerHTML = on
      ? `<span class="badge badge-online"><span class="badge-dot"></span>Online</span>`
      : `<span class="badge badge-offline"><span class="badge-dot"></span>Offline</span>`;
  }

  if (r.ip !== undefined) {
    const ip = r.ip || '';
    document.getElementById('geral-ip-value').textContent = ip || '—';
    const link = document.getElementById('geral-ip-link');
    if (link) {
      link.href = urlRoteador(ip, state.comodatos);
      link.style.display = ip ? '' : 'none';
    }
  }
}

// O IXC responde [{ data: "<json>" }] em dois formatos:
//   { type, message }                       (Limpar MAC)
//   { msg: [{ type, message, titulo }] }    (Desconectar login)
// A mensagem pode ter <br />. Devolve { type, message } em texto puro;
// se falhar qualquer item, type é o do primeiro que falhou. Sem esses formatos, vem vazio.
function extrairResultadoAcao(raw) {
  try {
    const item = Array.isArray(raw) ? raw[0] : raw;

    // Formato { content: [{ type: 'text', text }] } (ex.: reiniciar roteador → "Device rebooted")
    if (Array.isArray(item?.content)) {
      const textos = item.content.map(c => String(c?.text ?? '').trim()).filter(Boolean);
      // "Device rebooted" é só confirmação: devolve vazio para valer a mensagem de sucesso do botão
      const sucesso = !item.isError && textos.length > 0;
      const confirmacao = /^device rebooted$/i.test(textos.join(' '));
      return { type: sucesso ? 'success' : 'error', message: confirmacao ? '' : textos.join('\n') };
    }

    let obj = item?.data ?? item;
    if (typeof obj === 'string') obj = JSON.parse(obj);
    if (!obj || typeof obj !== 'object') return {};

    const itens = Array.isArray(obj.msg) ? obj.msg : [obj];
    const texto = m => new DOMParser()
      .parseFromString(String(m ?? '').replace(/<br\s*\/?>/gi, '\n'), 'text/html')
      .body.textContent.trim();

    const falha = itens.find(i => i?.type && i.type !== 'success');
    return {
      type:    (falha || itens[0] || {}).type,
      message: itens.map(i => texto(i?.message)).filter(Boolean).join('\n'),
    };
  } catch (_) {
    return {};
  }
}

// Botão que dispara uma ação sobre o login PPPoE do cliente (webhook key = chave em WEBHOOK)
// opcoes.soLogin: envia só { login } (como o pegar_url_acs), sem os demais campos
function bindAcaoLogin(btnId, webhookKey, descricao, msgSucesso, opcoes = {}) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener('click', async () => {
    if (btn.dataset.loading) return;
    // Botões de login levam data-login; o da ONU leva data-id-onu
    const login = btn.dataset.login;
    const idOnu = btn.dataset.idOnu;
    if (login !== undefined && (!login || login === '—')) { alert('Login PPPoE não encontrado para este cliente.'); return; }
    if (idOnu !== undefined && !idOnu) { alert('ID da ONU não encontrado para este cliente.'); return; }

    const url = WEBHOOK.url(webhookKey);
    if (!url) { alert('Webhook desta ação ainda não foi configurado.'); return; }
    if (!confirm(login ? `${descricao} "${login}"?` : `${descricao}?`)) return;

    const rotulo = btn.textContent;
    btn.dataset.loading = '1';
    btn.disabled = true;
    btn.textContent = 'Aguarde...';
    try {
      const raw = await postWebhook(url, opcoes.soLogin ? { login } : {
        login,
        id_onu:     idOnu,
        login_id:   state.loginSelecionado?.login_id,
        cliente_id: state.clienteSelecionado?.cliente_id
      });
      const res = extrairResultadoAcao(raw);
      if (res.type && res.type !== 'success') alert(res.message || 'A ação não foi concluída.');
      else alert(res.message || msgSucesso);
    } catch (err) {
      console.error(`[${webhookKey}]`, err);
      alert('Erro ao executar a ação. Tente novamente.');
    } finally {
      delete btn.dataset.loading;
      btn.disabled = false;
      btn.textContent = rotulo;
    }
  });
}

// POST genérico para webhooks
async function postWebhook(url, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (WEBHOOK.token) headers['Authorization'] = WEBHOOK.token;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// UI helpers
function setBuscando(on) {
  const btn     = document.getElementById('btn-buscar');
  const label   = document.getElementById('buscar-label');
  const spinner = document.getElementById('buscar-spinner');
  const icon    = document.getElementById('buscar-icon');
  btn.disabled  = on;
  label.textContent  = on ? 'Buscando...' : 'Buscar';
  spinner.classList.toggle('hidden', !on);
  if (icon) icon.style.display = on ? 'none' : '';
  if (!on) setLoadingStatus(false);
}

function setLoadingStatus(on, msg = 'Carregando...') {
  const el  = document.getElementById('loading-status');
  const txt = document.getElementById('loading-status-msg');
  if (el) {
    el.classList.toggle('hidden', !on);
    if (txt) txt.textContent = msg;
  }
  setLoadingOverlay(on, msg);
}

function setLoadingOverlay(on, msg = 'Carregando...') {
  const el  = document.getElementById('loading-overlay');
  const txt = document.getElementById('loading-overlay-msg');
  if (!el) return;
  el.classList.toggle('hidden', !on);
  if (txt) txt.textContent = msg;
}

function mostrarErro(msg) {
  document.getElementById('search-error-msg').textContent = msg;
  show(document.getElementById('search-error'));
}

function maskCPF(cpf) {
  return String(cpf).replace(/^(\d{3})\.\d{3}\.\d{3}(-\d{2})$/, '$1.***.***$2');
}

function formatDate(iso) {
  if (!iso || iso === '—') return iso || '—';
  const datePart = iso.split(' ')[0];
  const [y, m, d] = datePart.split('-');
  return `${d}/${m}/${y}`;
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function show(el) { el && el.classList.remove('hidden'); }
function hide(el) { el && el.classList.add('hidden'); }

function fieldRow(iconSvg, label, value) {
  return `
  <div class="field-row">
    <div class="field-icon">${iconSvg}</div>
    <div class="field-content">
      <div class="field-label">${label}</div>
      <div class="field-value">${value}</div>
    </div>
  </div>`;
}

// SVG icons
function iconPinSvg() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" stroke-width="2"/>
    <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="2"/>
  </svg>`;
}
function iconLockSvg(color = 'currentColor') {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="${color}" stroke-width="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}
function iconOsSvg() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M9 11l3 3L22 4" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}
function iconPin() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="var(--text-muted)" stroke-width="1.8"/>
    <circle cx="12" cy="10" r="3" stroke="var(--text-muted)" stroke-width="1.8"/>
  </svg>`;
}
function iconMapPin() {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.8"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.8"/>
  </svg>`;
}
function iconPhone() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.17 12 19.79 19.79 0 0 1 1.11 3.4 2 2 0 0 1 3.09 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16l.92.92z" stroke="var(--text-muted)" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}
function iconMail() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="var(--text-muted)" stroke-width="1.8"/>
    <polyline points="22,6 12,13 2,6" stroke="var(--text-muted)" stroke-width="1.8"/>
  </svg>`;
}
function iconChip() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="7" y="7" width="10" height="10" rx="1" stroke="var(--text-muted)" stroke-width="1.8"/>
    <path d="M9 7V4M15 7V4M9 20v-3M15 20v-3M4 9h3M4 15h3M17 9h3M17 15h3" stroke="var(--text-muted)" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}
function iconSignal() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="var(--text-muted)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
function iconKey() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="8" cy="15" r="5" stroke="var(--text-muted)" stroke-width="1.8"/>
    <path d="M13 10l8-8M17 6l2 2" stroke="var(--text-muted)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
function iconServer() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="8" rx="2" stroke="var(--text-muted)" stroke-width="1.8"/>
    <rect x="2" y="14" width="20" height="8" rx="2" stroke="var(--text-muted)" stroke-width="1.8"/>
    <line x1="6" y1="6"  x2="6.01" y2="6"  stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round"/>
    <line x1="6" y1="18" x2="6.01" y2="18" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}
function iconHash() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <line x1="4" y1="9"  x2="20" y2="9"  stroke="var(--text-muted)" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="4" y1="15" x2="20" y2="15" stroke="var(--text-muted)" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="10" y1="3" x2="8"  y2="21" stroke="var(--text-muted)" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="16" y1="3" x2="14" y2="21" stroke="var(--text-muted)" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}
function iconHistory() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M3 12a9 9 0 1 0 3-6.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <polyline points="3 4 3 9 8 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
function iconCopy() {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.8"/>
  </svg>`;
}
function iconCheck() {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
function iconKebab() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="5"  r="1.8" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.8" fill="currentColor"/>
    <circle cx="12" cy="19" r="1.8" fill="currentColor"/>
  </svg>`;
}
function iconReload() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
function iconExternalLink() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <polyline points="15 3 21 3 21 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}
function iconWallet(color) {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" stroke="${color}" stroke-width="2"/>
  </svg>`;
}
