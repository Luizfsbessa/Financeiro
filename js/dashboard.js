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
import { montarLinkMovidesk } from "./integracoes.js";

const NOMES_MES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const CHAVES_MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const formatadorRS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const formatadorData = new Intl.DateTimeFormat("pt-BR");

const estadoCarregado = new Map(); // containerId -> boolean
const cachePainel = new Map(); // containerId -> { centros, contasComDados }
const filtrosAtuais = new Map(); // containerId -> { ano, centroId, usuarioEmail, visao, mesCorte }
const estadosExpansao = new Map(); // containerId -> quais Centros/Contas/Serviços estão abertos

function obterEstadoExpansao(containerId) {
  if (!estadosExpansao.has(containerId)) {
    estadosExpansao.set(containerId, {
      centrosColapsados: new Set(),
      contasExpandidas: new Set(),
      servicosExpandidos: new Set(),
    });
  }
  return estadosExpansao.get(containerId);
}

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
      // ano: null = ainda não escolhido -> assume o ano mais recente dos dados.
      // ("" significa que a pessoa escolheu "Todos os anos" de propósito.)
      filtrosAtuais.set(containerId, { ano: null, centroId: "", usuarioEmail: "", visao: "realizado", mesCorte: "" });
    }
    const filtroInicial = filtrosAtuais.get(containerId);
    if (filtroInicial.ano === null) {
      const anos = [...anosDisponiveisNosDados(cachePainel.get(containerId))];
      filtroInicial.ano = anos.length ? String(Math.max(...anos)) : "";
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
    <div id="${containerId}-corpo" class="painel-corpo"></div>
  `;
}

function anosDisponiveisNosDados(cache) {
  const anos = new Set();
  cache.contasComDados.forEach(({ lancamentos }) =>
    lancamentos.forEach((l) => {
      const data = aDate(l.data_emissao);
      if (data) anos.add(data.getFullYear());
    })
  );
  return anos;
}

function renderizarFiltros(containerId) {
  const cache = cachePainel.get(containerId);
  const filtroEl = document.getElementById(`${containerId}-filtros`);
  if (!cache || !filtroEl) return;

  const usuariosDisponiveis = new Map(); // email -> nome
  cache.contasComDados.forEach(({ lancamentos }) =>
    lancamentos.forEach((l) => {
      if (l.usuario_email) usuariosDisponiveis.set(l.usuario_email, l.usuario_nome || l.usuario_email);
    })
  );

  const anosOrdenados = [...anosDisponiveisNosDados(cache)].sort((a, b) => b - a);
  const usuariosOrdenados = [...usuariosDisponiveis.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const filtro = filtrosAtuais.get(containerId);

  filtroEl.innerHTML = `
    <div class="campo">
      <label for="${containerId}-filtro-ano">Ano</label>
      <select id="${containerId}-filtro-ano">
        <option value="" ${filtro.ano === "" ? "selected" : ""}>Todos os anos</option>
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
    <div class="campo">
      <label for="${containerId}-filtro-visao">O que mostrar nos meses</label>
      <select id="${containerId}-filtro-visao">
        <option value="realizado" ${filtro.visao === "realizado" ? "selected" : ""}>Realizado</option>
        <option value="aprovado" ${filtro.visao === "aprovado" ? "selected" : ""}>Aprovado</option>
        <option value="variacao" ${filtro.visao === "variacao" ? "selected" : ""}>Variação (Aprovado − Realizado)</option>
      </select>
    </div>
    <div class="campo">
      <label for="${containerId}-filtro-corte">Acumulado até</label>
      <select id="${containerId}-filtro-corte">
        <option value="" ${filtro.mesCorte === "" ? "selected" : ""}>Último mês com lançamento</option>
        ${NOMES_MES_ABREV.map((nome, i) => `<option value="${i + 1}" ${String(i + 1) === filtro.mesCorte ? "selected" : ""}>${nome}</option>`).join("")}
      </select>
    </div>
  `;

  const ligar = (sufixo, propriedade) => {
    document.getElementById(`${containerId}-filtro-${sufixo}`).addEventListener("change", (e) => {
      filtrosAtuais.get(containerId)[propriedade] = e.target.value;
      atualizarCorpo(containerId);
    });
  };
  ligar("ano", "ano");
  ligar("centro", "centroId");
  ligar("usuario", "usuarioEmail");
  ligar("visao", "visao");
  ligar("corte", "mesCorte");
}

function atualizarCorpo(containerId) {
  const cache = cachePainel.get(containerId);
  const corpoEl = document.getElementById(`${containerId}-corpo`);
  if (!cache || !corpoEl) return;

  const { ano, centroId, usuarioEmail, visao, mesCorte } = filtrosAtuais.get(containerId);

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

      const servicosDetalhe = servicos.map((servico) => {
        const lancamentosDoServico = lancamentosPorServico.get(servico.id) || [];
        return {
          servico,
          realizadoPorMes: agregarRealizadoPorMes(lancamentosDoServico),
          lancamentos: lancamentosDoServico,
        };
      });

      return { conta, centro, realizadoPorMes, servicosDetalhe };
    });

  const centrosFiltrados = centroId ? cache.centros.filter((c) => c.id === centroId) : cache.centros;

  // Mês de corte do acumulado: o escolhido, ou o último mês que já tem
  // lançamento. Sem isso, o Index comparava o ano inteiro de gasto até agora
  // contra o orçamento dos 12 meses — e parecia sempre melhor do que é.
  let ultimoMesComLancamento = 0;
  linhas.forEach(({ realizadoPorMes }) =>
    realizadoPorMes.forEach((valor, i) => {
      if (valor > 0) ultimoMesComLancamento = Math.max(ultimoMesComLancamento, i + 1);
    })
  );
  const corte = mesCorte ? Number(mesCorte) : ultimoMesComLancamento || 12;
  const avisoMultiplosAnos = !ano && anosDisponiveisNosDados(cache).size > 1;

  renderizarTabela(corpoEl, centrosFiltrados, linhas, { visao, corte, avisoMultiplosAnos }, obterEstadoExpansao(containerId));
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

function somarAte(valores, corte) {
  return valores.slice(0, corte).reduce((a, b) => a + b, 0);
}

/**
 * Célula de um mês, nas linhas de Centro e de Conta. O texto depende da
 * visão escolhida (Realizado / Aprovado / Variação), mas a COR é sempre o
 * Index do mês (Realizado ÷ Aprovado) — assim o vermelho aparece sozinho,
 * qualquer que seja a visão. Conta sem nenhum orçamento no ano fica cinza,
 * em vez de vermelha, pra não parecer estouro o que é falta de cadastro.
 */
function montarCelulaMes({ realizado, aprovado, mes, visao, corte, temOrcamento, escuro }) {
  let texto;
  if (visao === "aprovado") {
    texto = aprovado > 0 ? formatadorRS.format(aprovado) : "—";
  } else if (visao === "variacao") {
    texto = mes <= corte && (aprovado > 0 || realizado > 0) ? formatadorRS.format(aprovado - realizado) : "—";
  } else {
    texto = realizado > 0 ? formatadorRS.format(realizado) : "—";
  }

  let classe = "";
  if (realizado > 0) {
    if (!temOrcamento) {
      classe = escuro ? "" : "celula-heat heat-sem-orcamento";
    } else {
      const pct = aprovado > 0 ? (realizado / aprovado) * 100 : Infinity; // gasto sem aprovado no mês
      classe = escuro ? classificarIndexCentro(pct) : `celula-heat ${classificarIndex(pct)}`;
    }
  }

  const tooltip =
    `Aprovado: ${formatadorRS.format(aprovado)} · Realizado: ${formatadorRS.format(realizado)} · Variação: ${formatadorRS.format(aprovado - realizado)}` +
    (temOrcamento ? "" : " · Sem orçamento aprovado cadastrado");

  return `<td class="col-mes numero-tabular ${classe}" title="${tooltip}">${texto}</td>`;
}

function renderizarTabela(container, centros, linhas, { visao, corte, avisoMultiplosAnos }, estado) {
  const nomeCorte = NOMES_MES_ABREV[corte - 1];

  const gruposPorCentro = centros
    .map((centro) => {
      const contasDoGrupo = linhas.filter((l) => l.conta?.centro_custo_id === centro.id);

      const somaRealizadoPorMes = Array(12).fill(0);
      const somaAprovadoPorMes = Array(12).fill(0);

      contasDoGrupo.forEach(({ conta, realizadoPorMes }) => {
        realizadoPorMes.forEach((valor, i) => (somaRealizadoPorMes[i] += valor));
        CHAVES_MES.forEach((chave, i) => (somaAprovadoPorMes[i] += conta.orcamento_aprovado?.[chave] ?? 0));
      });

      const somaAprovadoAno = somaAprovadoPorMes.reduce((a, b) => a + b, 0);
      return { centro, contasDoGrupo, somaRealizadoPorMes, somaAprovadoPorMes, somaAprovadoAno };
    })
    // Prioriza quem tem mais orçamento em jogo (total do ano) — "big numbers" primeiro.
    .sort((a, b) => b.somaAprovadoAno - a.somaAprovadoAno);

  const cabecalhoMeses = NOMES_MES_ABREV.map((m) => `<th class="col-mes">${m}</th>`).join("");

  const corpo = gruposPorCentro
    .map(({ centro, contasDoGrupo, somaRealizadoPorMes, somaAprovadoPorMes, somaAprovadoAno }) => {
      const acumRealizadoCentro = somarAte(somaRealizadoPorMes, corte);
      const acumAprovadoCentro = somarAte(somaAprovadoPorMes, corte);
      const variacaoCentro = acumAprovadoCentro - acumRealizadoCentro;
      const indexCentro = acumAprovadoCentro > 0 ? (acumRealizadoCentro / acumAprovadoCentro) * 100 : 0;
      const classeHeatCentro = acumAprovadoCentro > 0 ? classificarIndexCentro(indexCentro) : "";

      const celulasMesesCentro = somaRealizadoPorMes
        .map((realizado, i) =>
          montarCelulaMes({ realizado, aprovado: somaAprovadoPorMes[i], mes: i + 1, visao, corte, temOrcamento: somaAprovadoAno > 0, escuro: true })
        )
        .join("");

      const linhaCentro = `
        <tr class="linha-centro" data-grupo-toggle="${centro.id}">
          <td class="col-conta"><span class="icone-toggle">▾</span>${centro.nome}${centro.codigo_centro ? ` <span class="centro-codigo">— ${centro.codigo_centro}</span>` : ""}</td>
          ${celulasMesesCentro}
          <td class="numero-tabular">${formatadorRS.format(acumRealizadoCentro)}</td>
          <td class="numero-tabular" title="Aprovado no ano: ${formatadorRS.format(somaAprovadoAno)}">${acumAprovadoCentro > 0 ? formatadorRS.format(acumAprovadoCentro) : "—"}</td>
          <td class="numero-tabular">${formatadorRS.format(variacaoCentro)}</td>
          <td class="numero-tabular ${classeHeatCentro}">${acumAprovadoCentro > 0 ? indexCentro.toFixed(1) + "%" : "—"}</td>
        </tr>`;

      const linhasConta = contasDoGrupo.length === 0
        ? `<tr data-centro="${centro.id}"><td colspan="${5 + 12}" style="color: var(--ink-400); font-style: italic">Nenhuma Conta Contábil cadastrada ainda.</td></tr>`
        : contasDoGrupo
        .map(({ conta, realizadoPorMes, servicosDetalhe }) => {
          const aprovadoPorMes = CHAVES_MES.map((chave) => conta.orcamento_aprovado?.[chave] ?? 0);
          const aprovadoAno = aprovadoPorMes.reduce((a, b) => a + b, 0);
          const temOrcamento = aprovadoAno > 0;

          const acumuladoRealizado = somarAte(realizadoPorMes, corte);
          const acumuladoAprovado = somarAte(aprovadoPorMes, corte);
          const variacao = acumuladoAprovado - acumuladoRealizado;
          const indexPct = acumuladoAprovado > 0 ? (acumuladoRealizado / acumuladoAprovado) * 100 : 0;
          const classeHeat = acumuladoAprovado > 0 ? classificarIndex(indexPct) : "heat-sem-dados";

          const celulasMeses = realizadoPorMes
            .map((realizado, i) => montarCelulaMes({ realizado, aprovado: aprovadoPorMes[i], mes: i + 1, visao, corte, temOrcamento, escuro: false }))
            .join("");

          const linhaConta = `
            <tr class="linha-conta" data-centro="${centro.id}" data-grupo-toggle-conta="${conta.id}">
              <td class="col-conta"><span class="icone-toggle">▸</span>${conta.nome}</td>
              ${celulasMeses}
              <td class="numero-tabular">${formatadorRS.format(acumuladoRealizado)}</td>
              <td class="numero-tabular" title="Aprovado no ano: ${formatadorRS.format(aprovadoAno)}">${acumuladoAprovado > 0 ? formatadorRS.format(acumuladoAprovado) : "—"}</td>
              <td class="numero-tabular">${formatadorRS.format(variacao)}</td>
              <td class="numero-tabular celula-heat ${classeHeat}">${acumuladoAprovado > 0 ? indexPct.toFixed(1) + "%" : "—"}</td>
            </tr>`;

          const linhasServico = servicosDetalhe.length === 0
            ? `<tr data-centro="${centro.id}" data-conta="${conta.id}" style="display:none"><td colspan="${5 + 12}" style="color: var(--ink-400); font-style: italic; padding-left: 32px">Nenhum Serviço cadastrado nesta conta ainda.</td></tr>`
            : servicosDetalhe
                .map(({ servico, realizadoPorMes: realizadoServico, lancamentos: lancamentosDoServico }) => {
                  const projetadoPorMes = CHAVES_MES.map((chave) => servico.orcamento_projetado?.[chave] ?? 0);
                  const acumuladoServico = somarAte(realizadoServico, corte);
                  const acumuladoProjetado = somarAte(projetadoPorMes, corte);
                  const variacaoServico = acumuladoProjetado - acumuladoServico;
                  const indexServico = acumuladoProjetado > 0 ? (acumuladoServico / acumuladoProjetado) * 100 : 0;
                  const classeHeatServico = acumuladoProjetado > 0 ? classificarIndex(indexServico) : "heat-sem-dados";

                  // Serviço não tem Aprovado (só a Conta tem) — nas visões
                  // Aprovado/Variação os meses ficam em branco.
                  const celulasServico = realizadoServico
                    .map((valor) => `<td class="col-mes numero-tabular">${visao === "realizado" && valor > 0 ? formatadorRS.format(valor) : "—"}</td>`)
                    .join("");

                  const linhaServico = `
                    <tr class="linha-servico" data-centro="${centro.id}" data-conta="${conta.id}" data-grupo-toggle-servico="${servico.id}" style="display:none">
                      <td class="col-conta"><span class="icone-toggle">▸</span>${servico.nome}</td>
                      ${celulasServico}
                      <td class="numero-tabular">${formatadorRS.format(acumuladoServico)}</td>
                      <td class="numero-tabular">${acumuladoProjetado > 0 ? formatadorRS.format(acumuladoProjetado) : "—"}</td>
                      <td class="numero-tabular">${formatadorRS.format(variacaoServico)}</td>
                      <td class="numero-tabular celula-heat ${classeHeatServico}">${acumuladoProjetado > 0 ? indexServico.toFixed(1) + "%" : "—"}</td>
                    </tr>`;

                  return linhaServico + montarLinhasNf(lancamentosDoServico, centro.id, conta.id, servico.id, { visao, corte });
                })
                .join("");

          return linhaConta + linhasServico;
        })
        .join("");

      return linhaCentro + linhasConta;
    })
    .join("");

  const avisoHtml = avisoMultiplosAnos
    ? `<div class="aviso-painel">Há lançamentos de mais de um ano nos dados. Com "Todos os anos", cada coluna de mês soma anos diferentes contra um único orçamento aprovado — escolha um ano para comparar com segurança.</div>`
    : "";

  container.innerHTML = `
    ${avisoHtml}
    <div class="tabela-scroll">
      <table class="tabela-matriz">
        <thead>
          <tr>
            <th class="col-conta">Centro de Custo / Conta Contábil / Serviço</th>
            ${cabecalhoMeses}
            <th>Acum. Realizado (até ${nomeCorte})</th>
            <th>Acum. Aprovado (até ${nomeCorte})</th>
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
      <span class="chip heat-sem-orcamento">Sem orçamento cadastrado</span>
      <span class="legenda-nota">A cor de cada mês é Realizado ÷ Aprovado do mês, em qualquer visão. Serviço e NF não têm Aprovado: ficam em branco nas visões Aprovado e Variação. Clique no Centro, na Conta ou no Serviço para recolher/expandir.</span>
    </div>
  `;

  // --- Visibilidade orientada a estado. Os Sets vivem fora desta função
  // (estado), então o que a pessoa abriu sobrevive a trocar de filtro ou de
  // visão — antes, cada troca recolhia tudo de novo. ---
  const { centrosColapsados, contasExpandidas, servicosExpandidos } = estado;

  function atualizarVisibilidade() {
    container.querySelectorAll("tr[data-centro]").forEach((linha) => {
      const centroId = linha.dataset.centro;
      const contaId = linha.dataset.conta; // existe em linhas de Serviço e de NF
      const servicoId = linha.dataset.servico; // só existe em linhas de NF

      if (centrosColapsados.has(centroId)) {
        linha.style.display = "none";
        return;
      }
      if (contaId && !contasExpandidas.has(contaId)) {
        linha.style.display = "none";
        return;
      }
      if (servicoId && !servicosExpandidos.has(servicoId)) {
        linha.style.display = "none";
        return;
      }
      linha.style.display = "";
    });
  }

  // Em todos os três níveis, "a classe está no elemento" e "o id está no Set"
  // significam a mesma coisa (colapsado, no caso do Centro; expandido, nos demais).
  const ligarToggle = (seletor, atributo, conjunto, classe) => {
    container.querySelectorAll(seletor).forEach((el) => {
      const id = el.dataset[atributo];
      if (conjunto.has(id)) el.classList.add(classe); // restaura o estado ao redesenhar
      el.addEventListener("click", () => {
        const ligado = el.classList.toggle(classe);
        if (ligado) conjunto.add(id);
        else conjunto.delete(id);
        atualizarVisibilidade();
      });
    });
  };

  ligarToggle("[data-grupo-toggle]", "grupoToggle", centrosColapsados, "colapsado");
  ligarToggle("[data-grupo-toggle-conta]", "grupoToggleConta", contasExpandidas, "expandido");
  ligarToggle("[data-grupo-toggle-servico]", "grupoToggleServico", servicosExpandidos, "expandido");

  atualizarVisibilidade();
}

/**
 * 4º nível da hierarquia: uma linha por NF (lançamento individual) de um
 * Serviço. O valor aparece só na coluna do mês de emissão — as outras
 * ficam em branco, pra não parecer que a NF se repete em vários meses.
 * Colunas de Aprovado/Variação/Index não se aplicam no nível de NF
 * (orçamento só existe por Conta e por Serviço, não por nota).
 */
function montarLinhasNf(lancamentos, centroId, contaId, servicoId, { visao, corte }) {
  if (!lancamentos || lancamentos.length === 0) {
    return `<tr class="linha-nf" data-centro="${centroId}" data-conta="${contaId}" data-servico="${servicoId}" style="display:none"><td colspan="${5 + 12}" style="color: var(--ink-400); font-style: italic; padding-left: 64px">Nenhuma NF lançada neste período.</td></tr>`;
  }

  return [...lancamentos]
    .sort((a, b) => (aDate(b.data_emissao)?.getTime() ?? 0) - (aDate(a.data_emissao)?.getTime() ?? 0))
    .map((l) => {
      const mes = l.mes_referencia ?? 1;
      const celulasMeses = Array.from({ length: 12 }, (_, i) =>
        `<td class="col-mes numero-tabular">${visao === "realizado" && i === mes - 1 ? formatadorRS.format(l.valor_nf ?? 0) : "—"}</td>`
      ).join("");

      const dataEmissao = aDate(l.data_emissao);
      const linkMovidesk = montarLinkMovidesk(l.protocolo_movidesk);
      const divergente = l.status_divergencia === "COM_DIVERGENCIA";

      return `
        <tr class="linha-nf" data-centro="${centroId}" data-conta="${contaId}" data-servico="${servicoId}" style="display:none">
          <td class="col-conta">
            NF ${l.nf_numero || "s/n"}
            <span class="nf-detalhe">${dataEmissao ? formatadorData.format(dataEmissao) : ""}</span>
            ${divergente ? '<span class="chip chip-divergencia">divergência</span>' : ""}
            ${linkMovidesk ? `<a href="${linkMovidesk}" target="_blank" rel="noopener" class="link-movidesk" onclick="event.stopPropagation()">Movidesk ↗</a>` : ""}
          </td>
          ${celulasMeses}
          <td class="numero-tabular">${mes <= corte ? formatadorRS.format(l.valor_nf ?? 0) : "—"}</td>
          <td class="numero-tabular">—</td>
          <td class="numero-tabular">—</td>
          <td class="numero-tabular">—</td>
        </tr>`;
    })
    .join("");
}
