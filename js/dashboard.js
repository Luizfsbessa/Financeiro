// ============================================================
// dashboard.js
// Painel de Conciliação — tabela matriz Centro de Custo → Conta
// Contábil, com Jan–Dez, acumulados e heatmap de Index%.
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

let carregado = false;

/** Inicializa o dashboard — chamado uma vez ao entrar na aba "Painel". */
export async function iniciarDashboard() {
  const container = document.getElementById("dashboard-conteudo");
  if (!container) return;

  container.innerHTML = '<p class="preview-vazio">Carregando dados do painel...</p>';

  try {
    const [centros, contas] = await Promise.all([listarCentrosCusto(), listarTodasContas()]);

    if (contas.length === 0) {
      container.innerHTML = `
        <div class="placeholder-modulo">
          Ainda não há Contas Contábeis cadastradas.<br />
          Use o <code>seed.html</code> para criar dados de exemplo, ou cadastre pelo console do Firebase.
        </div>`;
      return;
    }

    // Para cada conta, busca os lançamentos e agrega por mês.
    const linhas = await Promise.all(
      contas.map(async (conta) => {
        const lancamentos = await listarLancamentosPorConta(conta.id);
        const realizadoPorMes = agregarRealizadoPorMes(lancamentos);
        const centro = centros.find((c) => c.id === conta.centro_custo_id);
        return { conta, centro, realizadoPorMes };
      })
    );

    renderizarTabela(container, centros, linhas);
    carregado = true;
  } catch (erro) {
    console.error("Erro ao carregar dashboard:", erro);
    container.innerHTML = '<div class="placeholder-modulo">Não foi possível carregar o painel. Veja o console (F12) para detalhes.</div>';
  }
}

/** Força recarregar mesmo se já tiver carregado antes (ex.: após novo lançamento). */
export function invalidarDashboard() {
  carregado = false;
}

export function dashboardJaCarregado() {
  return carregado;
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
  // Agrupa linhas por centro de custo, na ordem em que os centros foram cadastrados.
  const gruposPorCentro = centros.map((centro) => ({
    centro,
    contasDoGrupo: linhas.filter((l) => l.conta?.centro_custo_id === centro.id),
  })).filter((g) => g.contasDoGrupo.length > 0);

  const cabecalhoMeses = NOMES_MES_ABREV.map((m) => `<th class="col-mes">${m}</th>`).join("");

  const corpo = gruposPorCentro
    .map(({ centro, contasDoGrupo }) => {
      const linhaCentro = `
        <tr class="linha-centro">
          <td colspan="${5 + 12}">${centro.nome}</td>
        </tr>`;

      const linhasConta = contasDoGrupo
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
