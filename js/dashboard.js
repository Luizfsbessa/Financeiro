// ============================================================
// dashboard.js
// Motor de tabela matriz Centro de Custo → Conta Contábil, com
// Jan–Dez, acumulados e heatmap de Index%. Reutilizado por DUAS
// telas diferentes:
//   - Painel (própio):        iniciarDashboard() / invalidarDashboard()
//   - Centros de Terceiros:   iniciarPainelTerceiros() / invalidarPainelTerceiros()
// Ambas chamam o mesmo motor genérico (iniciarPainelMatriz), só
// filtrando por tipo_gestao e apontando para containers diferentes.
// Centros sem tipo_gestao definido são tratados como "proprio" —
// isso preserva dados antigos criados antes desse campo existir.
//
// Regra do heatmap (igual ao Looker Studio que desenhamos):
//   Index <= 95%           → verde
//   95.1% < Index <= 100%  → amarelo
//   Index > 100%           → vermelho
// ============================================================

import { listarCentrosCusto, listarTodasContas, listarLancamentosPorConta } from "./firestore.js";

const NOMES_MES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const CHAVES_MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const formatadorRS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const estadoCarregado = new Map(); // containerId -> boolean

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

    const linhas = await Promise.all(
      contas.map(async (conta) => {
        const lancamentos = await listarLancamentosPorConta(conta.id);
        const realizadoPorMes = agregarRealizadoPorMes(lancamentos);
        const centro = centros.find((c) => c.id === conta.centro_custo_id);
        return { conta, centro, realizadoPorMes };
      })
    );

    renderizarTabela(container, centros, linhas);
    estadoCarregado.set(containerId, true);
  } catch (erro) {
    console.error(`Erro ao carregar painel (${containerId}):`, erro);
    container.innerHTML = `<div class="placeholder-modulo">Não foi possível carregar. Erro: ${erro.message || "veja o console (F12)"}.</div>`;
  }
}

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

function renderizarTabela(container, centros, linhas) {
  const gruposPorCentro = centros.map((centro) => ({
    centro,
    contasDoGrupo: linhas.filter((l) => l.conta?.centro_custo_id === centro.id),
  }));
  // Nota: centros sem nenhuma Conta Contábil ainda aparecem (com uma linha
  // avisando que estão vazios) — antes eram escondidos por completo, o que
  // fazia parecer que um Centro recém-criado "sumia" do Painel.

  const cabecalhoMeses = NOMES_MES_ABREV.map((m) => `<th class="col-mes">${m}</th>`).join("");

  const corpo = gruposPorCentro
    .map(({ centro, contasDoGrupo }) => {
      const linhaCentro = `
        <tr class="linha-centro">
          <td colspan="${5 + 12}">${centro.nome}${centro.codigo_centro ? ` <span class="centro-codigo">— ${centro.codigo_centro}</span>` : ""}</td>
        </tr>`;

      const linhasConta = contasDoGrupo.length === 0
        ? `<tr><td colspan="${5 + 12}" style="color: var(--ink-400); font-style: italic">Nenhuma Conta Contábil cadastrada ainda.</td></tr>`
        : contasDoGrupo
        .map(({ conta, realizadoPorMes }) => {
          const acumuladoRealizado = realizadoPorMes.reduce((a, b) => a + b, 0);
          const aprovadoPorMes = CHAVES_MES.map((chave) => conta.orcamento_aprovado?.[chave] ?? 0);
          const acumuladoAprovado = aprovadoPorMes.reduce((a, b) => a + b, 0);
          const variacao = acumuladoAprovado - acumuladoRealizado;
          const indexPct = acumuladoAprovado > 0 ? (acumuladoRealizado / acumuladoAprovado) * 100 : 0;
          const classeHeat = acumuladoAprovado > 0 ? classificarIndex(indexPct) : "heat-sem-dados";

          const celulasMeses = realizadoPorMes
            .map((valor) => `<td class="col-mes numero-tabular">${valor > 0 ? formatadorRS.format(valor) : "—"}</td>`)
            .join("");

          return `
            <tr>
              <td class="col-conta">${conta.nome}</td>
              ${celulasMeses}
              <td class="numero-tabular">${formatadorRS.format(acumuladoRealizado)}</td>
              <td class="numero-tabular">${acumuladoAprovado > 0 ? formatadorRS.format(acumuladoAprovado) : "—"}</td>
              <td class="numero-tabular">${formatadorRS.format(variacao)}</td>
              <td class="numero-tabular celula-heat ${classeHeat}">${acumuladoAprovado > 0 ? indexPct.toFixed(1) + "%" : "—"}</td>
            </tr>`;
        })
        .join("");

      return linhaCentro + linhasConta;
    })
    .join("");

  container.innerHTML = `
    <div class="tabela-scroll">
      <table class="tabela-matriz">
        <thead>
          <tr>
            <th class="col-conta">Centro de Custo / Conta Contábil</th>
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
    </div>
  `;
}
