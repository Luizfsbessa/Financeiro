// ============================================================
// dashboard.js
// Motor de tabela matriz Centro de Custo → Conta Contábil → Serviço,
// com Jan–Dez, acumulados e heatmap de Index%. Reutilizado por DUAS
// telas diferentes:
//   - Painel (própio):        iniciarDashboard() / invalidarDashboard()
//   - Centros de Terceiros:   iniciarPainelTerceiros() / invalidarPainelTerceiros()
// Ambas chamam o mesmo motor genérico (iniciarPainelMatriz), só
// filtrando por tipo_gestao e apontando para containers diferentes.
// Centros sem tipo_gestao definido são tratados como "proprio" —
// isso preserva dados antigos criados antes desse campo existir.
//
// FILTROS (Ano, Centro de Custo, Usuário): os dados brutos (lançamentos
// e serviços de cada conta) são buscados uma vez e guardados em cache
// por containerId — trocar de filtro só reprocessa em memória, sem
// bater no Firestore de novo a cada clique.
//
// Regra do heatmap (igual ao Looker Studio que desenhamos):
//   Index <= 95%           → verde
//   95.1% < Index <= 100%  → amarelo
//   Index > 100%           → vermelho
// ============================================================

import { listarCentrosCusto, listarTodasContas, listarLancamentosPorConta, listarServicosPorConta } from "./firestore.js";

const NOMES_MES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const CHAVES_MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const formatadorRS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const estadoCarregado = new Map(); // containerId -> boolean
const cachePainel = new Map(); // containerId -> { centros, contasComDados }
const filtrosAtuais = new Map(); // containerId -> { ano, centroId, usuarioEmail }

function aDate(valor) {
  if (!valor) return null;
  if (typeof valor.toDate === "function") return valor.toDate();
  return new Date(valor);
}

async function iniciarPainelMatriz({ containerId, filtroTipoGestao, mensagemVazio }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<p class="preview-vazio">Carregando dados...</p>';

  try {
    const [todosCentros, todasContas] = await Promise.all([listarCentrosCusto(), listarTodasContas()]);

    const centros = todosCentros.filter((c) => (c.tipo_gestao ?? "proprio") === filtroTipoGestao);
    const centroIds = new Set(centros.map((c) => c.id));
    const contas = todasContas.filter((c) => centroIds.has(c.centro_custo_id));

    if (contas.length === 0) {
      container.innerHTML = `<div class="placeholder-modulo">${mensagemVazio}</div>`;
      estadoCarregado.set(containerId, true);
      return;
    }

    const contasComDados = await Promise.all(
      contas.map(async (conta) => {
        const [lancamentos, servicos] = await Promise.all([
          listarLancamentosPorConta(conta.id),
          listarServicosPorConta(conta.id),
        ]);
        const centro = centros.find((c) => c.id === conta.centro_custo_id);
        return { conta, centro, lancamentos, servicos };
      })
    );

    cachePainel.set(containerId, { centros, contasComDados });
    if (!filtrosAtuais.has(containerId)) {
      filtrosAtuais.set(containerId, { ano: "", centroId: "", usuarioEmail: "" });
    }
    estadoCarregado.set(containerId, true);

    montarEstruturaBase(container, containerId);
    renderizarFiltros(containerId);
    atualizarCorpo(containerId);
  } catch (erro) {
    console.error(`Erro ao carregar painel (${containerId}):`, erro);
    container.innerHTML = `<div class="placeholder-modulo">Não foi possível carregar. Erro: ${erro.message || "veja o console (F12)"}.</div>`;
  }
}

// --- Painel (Centros próprios) ---

export async function iniciarDashboard() {
  await iniciarPainelMatriz({
    containerId: "dashboard-conteudo",
    filtroTipoGestao: "proprio",
    mensagemVazio: 'Ainda não há Contas Contábeis próprias cadastradas.<br />Use o <code>seed.html</code> para criar dados, ou cadastre pelo console do Firebase.',
  });
}

export function invalidarDashboard() {
  estadoCarregado.delete("dashboard-conteudo");
}

export function dashboardJaCarregado() {
  return estadoCarregado.get("dashboard-conteudo") === true;
}

// --- Centros de Terceiros ---

export async function iniciarPainelTerceiros() {
  await iniciarPainelMatriz({
    containerId: "terceiros-conteudo",
    filtroTipoGestao: "terceiros",
    mensagemVazio: "Ainda não há Centros de Custo de terceiros cadastrados.",
  });
}

export function invalidarPainelTerceiros() {
  estadoCarregado.delete("terceiros-conteudo");
}

export function painelTerceirosJaCarregado() {
  return estadoCarregado.get("terceiros-conteudo") === true;
}

// --- Estrutura base: filtros (fixos) + corpo (recalculado a cada filtro) ---

function montarEstruturaBase(container, containerId) {
  container.innerHTML = `
    <div id="${containerId}-filtros" class="painel-filtros"></div>
    <div id="${containerId}-corpo"></div>
  `;
}

function renderizarFiltros(containerId) {
  const cache = cachePainel.get(containerId);
  const filtroEl = document.getElementById(`${containerId}-filtros`);
  if (!cache || !filtroEl) return;

  const anosDisponiveis = new Set();
  const usuariosDisponiveis = new Map(); // email -> nome

  cache.contasComDados.forEach(({ lancamentos }) => {
    lancamentos.forEach((l) => {
      const data = aDate(l.data_emissao);
      if (data) anosDisponiveis.add(data.getFullYear());
      if (l.usuario_email) usuariosDisponiveis.set(l.usuario_email, l.usuario_nome || l.usuario_email);
    });
  });

  const anosOrdenados = [...anosDisponiveis].sort((a, b) => b - a);
  const usuariosOrdenados = [...usuariosDisponiveis.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const filtro = filtrosAtuais.get(containerId);

  filtroEl.innerHTML = `
    <div class="campo">
      <label for="${containerId}-filtro-ano">Ano</label>
      <select id="${containerId}-filtro-ano">
        <option value="">Todos os anos</option>
        ${anosOrdenados.map((ano) => `<option value="${ano}" ${String(ano) === filtro.ano ? "selected" : ""}>${ano}</option>`).join("")}
      </select>
    </div>
    <div class="campo">
      <label for="${containerId}-filtro-centro">Centro de Custo</label>
      <select id="${containerId}-filtro-centro">
        <option value="">Todos os Centros de Custo</option>
        ${cache.centros
          .slice()
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((c) => `<option value="${c.id}" ${c.id === filtro.centroId ? "selected" : ""}>${c.nome}</option>`)
          .join("")}
      </select>
    </div>
    <div class="campo">
      <label for="${containerId}-filtro-usuario">Usuário</label>
      <select id="${containerId}-filtro-usuario">
        <option value="">Todos os usuários</option>
        ${usuariosOrdenados.map(([email, nome]) => `<option value="${email}" ${email === filtro.usuarioEmail ? "selected" : ""}>${nome}</option>`).join("")}
      </select>
    </div>
  `;

  document.getElementById(`${containerId}-filtro-ano`).addEventListener("change", (e) => {
    filtrosAtuais.get(containerId).ano = e.target.value;
    atualizarCorpo(containerId);
  });
  document.getElementById(`${containerId}-filtro-centro`).addEventListener("change", (e) => {
    filtrosAtuais.get(containerId).centroId = e.target.value;
    atualizarCorpo(containerId);
  });
  document.getElementById(`${containerId}-filtro-usuario`).addEventListener("change", (e) => {
    filtrosAtuais.get(containerId).usuarioEmail = e.target.value;
    atualizarCorpo(containerId);
  });
}

function atualizarCorpo(containerId) {
  const cache = cachePainel.get(containerId);
  const corpoEl = document.getElementById(`${containerId}-corpo`);
  if (!cache || !corpoEl) return;

  const { ano, centroId, usuarioEmail } = filtrosAtuais.get(containerId);

  const linhas = cache.contasComDados
    .filter(({ centro }) => !centroId || centro?.id === centroId)
    .map(({ conta, centro, lancamentos, servicos }) => {
      const lancamentosFiltrados = lancamentos.filter((l) => {
        if (ano) {
          const data = aDate(l.data_emissao);
          if (!data || String(data.getFullYear()) !== ano) return false;
        }
        if (usuarioEmail && l.usuario_email !== usuarioEmail) return false;
        return true;
      });

      const realizadoPorMes = agregarRealizadoPorMes(lancamentosFiltrados);

      const lancamentosPorServico = new Map();
      lancamentosFiltrados.forEach((l) => {
        const chave = l.servico_id || "_sem_servico";
        if (!lancamentosPorServico.has(chave)) lancamentosPorServico.set(chave, []);
        lancamentosPorServico.get(chave).push(l);
      });

      const servicosDetalhe = servicos.map((servico) => ({
        servico,
        realizadoPorMes: agregarRealizadoPorMes(lancamentosPorServico.get(servico.id) || []),
      }));

      return { conta, centro, realizadoPorMes, servicosDetalhe };
    });

  const centrosFiltrados = centroId ? cache.centros.filter((c) => c.id === centroId) : cache.centros;

  renderizarTabela(corpoEl, centrosFiltrados, linhas);
  ativarScrollDuplo(corpoEl);
}

// --- Compartilhado ---

function agregarRealizadoPorMes(lancamentos) {
  const totais = Array(12).fill(0);
  lancamentos.forEach((l) => {
    const idx = (l.mes_referencia ?? 1) - 1;
    if (idx >= 0 && idx < 12) totais[idx] += l.valor_nf ?? 0;
  });
  return totais;
}

function classificarIndex(indexPct) {
  if (indexPct <= 95) return "heat-verde";
  if (indexPct <= 100) return "heat-amarelo";
  return "heat-vermelho";
}

/** Variante para texto sobre fundo escuro (linha de subtotal do Centro de Custo). */
function classificarIndexCentro(indexPct) {
  if (indexPct <= 95) return "heat-centro-verde";
  if (indexPct <= 100) return "heat-centro-amarelo";
  return "heat-centro-vermelho";
}

/**
 * Sincroniza uma barra de rolagem horizontal fina e fixa no topo (que fica
 * "grudada" ao rolar a página, position: sticky) com a rolagem real da
 * tabela — evita ter que descer até o fim de uma tabela gigante só pra
 * conseguir puxar ela pros lados.
 */
function ativarScrollDuplo(corpoEl) {
  const scrollTopo = corpoEl.querySelector(".scroll-topo");
  const scrollTopoInterno = corpoEl.querySelector(".scroll-topo-interno");
  const tabelaScroll = corpoEl.querySelector(".tabela-scroll");
  const tabela = tabelaScroll?.querySelector("table");
  if (!scrollTopo || !scrollTopoInterno || !tabelaScroll || !tabela) return;

  scrollTopoInterno.style.width = tabela.scrollWidth + "px";

  let sincronizando = false;
  scrollTopo.addEventListener("scroll", () => {
    if (sincronizando) return;
    sincronizando = true;
    tabelaScroll.scrollLeft = scrollTopo.scrollLeft;
    sincronizando = false;
  });
  tabelaScroll.addEventListener("scroll", () => {
    if (sincronizando) return;
    sincronizando = true;
    scrollTopo.scrollLeft = tabelaScroll.scrollLeft;
    sincronizando = false;
  });
}

function renderizarTabela(container, centros, linhas) {
  const gruposPorCentro = centros
    .map((centro) => {
      const contasDoGrupo = linhas.filter((l) => l.conta?.centro_custo_id === centro.id);

      const somaRealizadoPorMes = Array(12).fill(0);
      let somaRealizado = 0;
      let somaAprovado = 0;

      contasDoGrupo.forEach(({ conta, realizadoPorMes }) => {
        realizadoPorMes.forEach((valor, i) => (somaRealizadoPorMes[i] += valor));
        somaRealizado += realizadoPorMes.reduce((a, b) => a + b, 0);
        somaAprovado += CHAVES_MES.reduce((acc, chave) => acc + (conta.orcamento_aprovado?.[chave] ?? 0), 0);
      });

      return { centro, contasDoGrupo, somaRealizadoPorMes, somaRealizado, somaAprovado };
    })
    .sort((a, b) => b.somaAprovado - a.somaAprovado);

  const cabecalhoMeses = NOMES_MES_ABREV.map((m) => `<th class="col-mes">${m}</th>`).join("");

  const corpo = gruposPorCentro
    .map(({ centro, contasDoGrupo, somaRealizadoPorMes, somaRealizado, somaAprovado }) => {
      const variacaoCentro = somaAprovado - somaRealizado;
      const indexCentro = somaAprovado > 0 ? (somaRealizado / somaAprovado) * 100 : 0;
      const classeHeatCentro = somaAprovado > 0 ? classificarIndexCentro(indexCentro) : "";

      const celulasMesesCentro = somaRealizadoPorMes
        .map((valor) => `<td class="col-mes numero-tabular">${valor > 0 ? formatadorRS.format(valor) : "—"}</td>`)
        .join("");

      const linhaCentro = `
        <tr class="linha-centro" data-grupo-toggle="${centro.id}">
          <td class="col-conta"><span class="icone-toggle">▾</span>${centro.nome}${centro.codigo_centro ? ` <span class="centro-codigo">— ${centro.codigo_centro}</span>` : ""}</td>
          ${celulasMesesCentro}
          <td class="numero-tabular">${formatadorRS.format(somaRealizado)}</td>
          <td class="numero-tabular">${somaAprovado > 0 ? formatadorRS.format(somaAprovado) : "—"}</td>
          <td class="numero-tabular">${formatadorRS.format(variacaoCentro)}</td>
          <td class="numero-tabular ${classeHeatCentro}">${somaAprovado > 0 ? indexCentro.toFixed(1) + "%" : "—"}</td>
        </tr>`;

      const linhasConta = contasDoGrupo.length === 0
        ? `<tr data-centro="${centro.id}"><td colspan="${5 + 12}" style="color: var(--ink-400); font-style: italic">Nenhuma Conta Contábil cadastrada ainda.</td></tr>`
        : contasDoGrupo
        .map(({ conta, realizadoPorMes, servicosDetalhe }) => {
          const acumuladoRealizado = realizadoPorMes.reduce((a, b) => a + b, 0);
          const aprovadoPorMes = CHAVES_MES.map((chave) => conta.orcamento_aprovado?.[chave] ?? 0);
          const acumuladoAprovado = aprovadoPorMes.reduce((a, b) => a + b, 0);
          const variacao = acumuladoAprovado - acumuladoRealizado;
          const indexPct = acumuladoAprovado > 0 ? (acumuladoRealizado / acumuladoAprovado) * 100 : 0;
          const classeHeat = acumuladoAprovado > 0 ? classificarIndex(indexPct) : "heat-sem-dados";

          const celulasMeses = realizadoPorMes
            .map((valor) => `<td class="col-mes numero-tabular">${valor > 0 ? formatadorRS.format(valor) : "—"}</td>`)
            .join("");

          const linhaConta = `
            <tr class="linha-conta" data-centro="${centro.id}" data-grupo-toggle-conta="${conta.id}">
              <td class="col-conta"><span class="icone-toggle">▸</span>${conta.nome}</td>
              ${celulasMeses}
              <td class="numero-tabular">${formatadorRS.format(acumuladoRealizado)}</td>
              <td class="numero-tabular">${acumuladoAprovado > 0 ? formatadorRS.format(acumuladoAprovado) : "—"}</td>
              <td class="numero-tabular">${formatadorRS.format(variacao)}</td>
              <td class="numero-tabular celula-heat ${classeHeat}">${acumuladoAprovado > 0 ? indexPct.toFixed(1) + "%" : "—"}</td>
            </tr>`;

          const linhasServico = servicosDetalhe.length === 0
            ? `<tr data-centro="${centro.id}" data-conta="${conta.id}" style="display:none"><td colspan="${5 + 12}" style="color: var(--ink-400); font-style: italic; padding-left: 32px">Nenhum Serviço cadastrado nesta conta ainda.</td></tr>`
            : servicosDetalhe
                .map(({ servico, realizadoPorMes: realizadoServico }) => {
                  const acumuladoServico = realizadoServico.reduce((a, b) => a + b, 0);
                  const projetadoPorMes = CHAVES_MES.map((chave) => servico.orcamento_projetado?.[chave] ?? 0);
                  const acumuladoProjetado = projetadoPorMes.reduce((a, b) => a + b, 0);
                  const variacaoServico = acumuladoProjetado - acumuladoServico;
                  const indexServico = acumuladoProjetado > 0 ? (acumuladoServico / acumuladoProjetado) * 100 : 0;
                  const classeHeatServico = acumuladoProjetado > 0 ? classificarIndex(indexServico) : "heat-sem-dados";

                  const celulasServico = realizadoServico
                    .map((valor) => `<td class="col-mes numero-tabular">${valor > 0 ? formatadorRS.format(valor) : "—"}</td>`)
                    .join("");

                  return `
                    <tr class="linha-servico" data-centro="${centro.id}" data-conta="${conta.id}" style="display:none">
                      <td class="col-conta">${servico.nome}</td>
                      ${celulasServico}
                      <td class="numero-tabular">${formatadorRS.format(acumuladoServico)}</td>
                      <td class="numero-tabular">${acumuladoProjetado > 0 ? formatadorRS.format(acumuladoProjetado) : "—"}</td>
                      <td class="numero-tabular">${formatadorRS.format(variacaoServico)}</td>
                      <td class="numero-tabular celula-heat ${classeHeatServico}">${acumuladoProjetado > 0 ? indexServico.toFixed(1) + "%" : "—"}</td>
                    </tr>`;
                })
                .join("");

          return linhaConta + linhasServico;
        })
        .join("");

      return linhaCentro + linhasConta;
    })
    .join("");

  container.innerHTML = `
    <div class="scroll-topo"><div class="scroll-topo-interno"></div></div>
    <div class="tabela-scroll">
      <table class="tabela-matriz">
        <thead>
          <tr>
            <th class="col-conta">Centro de Custo / Conta Contábil / Serviço</th>
            ${cabecalhoMeses}
            <th>Acum. Realizado</th>
            <th>Acum. Aprovado</th>
            <th>Variação R$</th>
            <th>Index %</th>
          </tr>
        </thead>
        <tbody>
          ${corpo}
        </tbody>
      </table>
    </div>
    <div class="legenda-heatmap">
      <span class="chip heat-verde">Index ≤ 95%</span>
      <span class="chip heat-amarelo">95,1% – 100%</span>
      <span class="chip heat-vermelho">Index &gt; 100%</span>
      <span style="margin-left: auto; color: var(--ink-400); font-size: var(--text-xs)">Clique no Centro ou na Conta para recolher/expandir</span>
    </div>
  `;

  // --- Visibilidade orientada a estado: um Set guarda quais Centros estão
  // recolhidos e outro quais Contas estão EXPANDIDAS (o padrão é recolhida).
  // Recalcula tudo a cada clique, então a combinação Centro+Conta nunca
  // fica inconsistente, não importa a ordem dos cliques. ---
  const centrosColapsados = new Set();
  const contasExpandidas = new Set();

  function atualizarVisibilidade() {
    container.querySelectorAll("tr[data-centro]").forEach((linha) => {
      const centroId = linha.dataset.centro;
      const contaId = linha.dataset.conta; // só existe em linhas de Serviço

      if (centrosColapsados.has(centroId)) {
        linha.style.display = "none";
        return;
      }
      linha.style.display = contaId ? (contasExpandidas.has(contaId) ? "" : "none") : "";
    });
  }

  container.querySelectorAll("[data-grupo-toggle]").forEach((linhaCentroEl) => {
    linhaCentroEl.addEventListener("click", () => {
      const centroId = linhaCentroEl.dataset.grupoToggle;
      const colapsado = linhaCentroEl.classList.toggle("colapsado");
      colapsado ? centrosColapsados.add(centroId) : centrosColapsados.delete(centroId);
      atualizarVisibilidade();
    });
  });

  container.querySelectorAll("[data-grupo-toggle-conta]").forEach((linhaContaEl) => {
    linhaContaEl.addEventListener("click", () => {
      const contaId = linhaContaEl.dataset.grupoToggleConta;
      const expandido = linhaContaEl.classList.toggle("expandido");
      expandido ? contasExpandidas.add(contaId) : contasExpandidas.delete(contaId);
      atualizarVisibilidade();
    });
  });
}
