// ============================================================
// relatorios.js
// Módulo de Relatórios — cada relatório monta { titulo, arquivo,
// colunas, linhas } com valores JÁ FORMATADOS como texto (mesma
// estrutura serve pra renderizar a tabela em tela E pra exportar,
// tanto Excel quanto PDF, pelos mesmos dois botões).
// ============================================================

import { listarCentrosCusto, listarTodasContas, listarLancamentosPorConta, listarTodosLancamentos, listarOrdensPagamento } from "./firestore.js";
import { exportarExcel, exportarPDF } from "./exportadores.js";
import { montarLinkMovidesk } from "./integracoes.js";

const formatadorRS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatadorData = new Intl.DateTimeFormat("pt-BR");
const CHAVES_MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const NOMES_MES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

let listenersConectados = false;
let relatorioAtual = null; // { titulo, arquivo, colunas, linhas }

export function iniciarRelatorios() {
  if (listenersConectados) return;
  listenersConectados = true;

  document.querySelectorAll(".botao-relatorio").forEach((botao) => {
    botao.addEventListener("click", () => carregarRelatorio(botao.dataset.relatorio, botao));
  });

  document.getElementById("botao-exportar-excel")?.addEventListener("click", async (evento) => {
    if (!relatorioAtual) return;
    await comFeedback(evento.target, () => exportarExcel(relatorioAtual.arquivo, relatorioAtual.colunas, relatorioAtual.linhas));
  });

  document.getElementById("botao-exportar-pdf")?.addEventListener("click", async (evento) => {
    if (!relatorioAtual) return;
    await comFeedback(evento.target, () => exportarPDF(relatorioAtual.titulo, relatorioAtual.arquivo, relatorioAtual.colunas, relatorioAtual.linhas));
  });
}

async function comFeedback(botao, acao) {
  const textoOriginal = botao.textContent;
  botao.disabled = true;
  botao.textContent = "Gerando...";
  try {
    await acao();
  } catch (erro) {
    console.error("[relatorios] erro ao exportar:", erro);
    alert("Não foi possível exportar: " + (erro.message || "erro desconhecido."));
  } finally {
    botao.disabled = false;
    botao.textContent = textoOriginal;
  }
}

async function carregarRelatorio(tipo, botaoClicado, opcoes = {}) {
  document.querySelectorAll(".botao-relatorio").forEach((b) => b.classList.remove("ativo"));
  botaoClicado.classList.add("ativo");

  const container = document.getElementById("relatorio-conteudo");
  const acoes = document.getElementById("relatorio-acoes");
  container.innerHTML = '<p class="preview-vazio">Carregando...</p>';
  acoes.style.display = "none";
  relatorioAtual = null;

  try {
    if (tipo === "divergencias") relatorioAtual = await montarRelatorioDivergencias();
    else if (tipo === "ordens-pagamento") relatorioAtual = await montarRelatorioOrdensPagamento();
    else if (tipo === "painel-proprio") relatorioAtual = await montarRelatorioPainel("proprio");
    else if (tipo === "painel-terceiros") relatorioAtual = await montarRelatorioPainel("terceiros");
    else if (tipo === "realizado-aprovado") relatorioAtual = await montarRelatorioRealizadoAprovado(opcoes.ano);

    renderizarTabela(container, relatorioAtual);
    if (relatorioAtual.linhas.length > 0) acoes.style.display = "flex";

    const seletorAno = document.getElementById("relatorio-ano");
    seletorAno?.addEventListener("change", () => carregarRelatorio(tipo, botaoClicado, { ano: seletorAno.value }));
  } catch (erro) {
    console.error("[relatorios] erro ao carregar:", erro);
    container.innerHTML = `<div class="placeholder-modulo">Não foi possível carregar. Erro: ${erro.message || "veja o console (F12)"}.</div>`;
  }
}

function aDate(valor) {
  if (!valor) return null;
  if (typeof valor.toDate === "function") return valor.toDate(); // Firestore Timestamp
  return new Date(valor);
}

// --- Relatório: Divergências ---

async function montarRelatorioDivergencias() {
  const [lancamentos, centros, contas] = await Promise.all([listarTodosLancamentos(), listarCentrosCusto(), listarTodasContas()]);
  const centrosPorId = new Map(centros.map((c) => [c.id, c]));
  const contasPorId = new Map(contas.map((c) => [c.id, c]));

  const divergentes = lancamentos.filter((l) => l.status_divergencia === "COM_DIVERGENCIA");

  const linhas = divergentes
    .map((l) => {
      const conta = contasPorId.get(l.conta_contabil_id);
      const centro = centrosPorId.get(l.centro_custo_id);
      const dataEmissao = aDate(l.data_emissao);
      return {
        _ordenar: l.divergencia_rs ?? 0,
        "Centro de Custo": centro?.nome ?? "—",
        "Conta Contábil": conta?.nome ?? "—",
        "Serviço/Prestador": l.servico_nome ?? "—",
        "NF": l.nf_numero ?? "—",
        "Valor NF": formatadorRS.format(l.valor_nf ?? 0),
        "Divergência R$": formatadorRS.format(l.divergencia_rs ?? 0),
        "Divergência %": ((l.divergencia_pct ?? 0) * 100).toFixed(1) + "%",
        "Data Emissão": dataEmissao ? formatadorData.format(dataEmissao) : "—",
        "Movidesk": montarLinkMovidesk(l.protocolo_movidesk) ?? "—",
        "Observação": l.observacao || "—",
      };
    })
    .sort((a, b) => b._ordenar - a._ordenar);

  const colunas = ["Centro de Custo", "Conta Contábil", "Serviço/Prestador", "NF", "Valor NF", "Divergência R$", "Divergência %", "Data Emissão", "Movidesk", "Observação"];
  return { titulo: `Divergências de NF — cada NF contra o orçamento projetado do Serviço (${linhas.length} lançamentos)`, arquivo: "divergencias", colunas, linhas };
}

// --- Relatório: Ordens de Pagamento ---

async function montarRelatorioOrdensPagamento() {
  const [ordens, centros, contas] = await Promise.all([listarOrdensPagamento(), listarCentrosCusto(), listarTodasContas()]);
  const centrosPorId = new Map(centros.map((c) => [c.id, c]));
  const contasPorId = new Map(contas.map((c) => [c.id, c]));

  const linhas = ordens
    .map((op) => {
      const conta = contasPorId.get(op.conta_contabil_id);
      const centro = centrosPorId.get(conta?.centro_custo_id);
      const saldoTotal = op.saldo_total ?? 0;
      const saldoDisponivel = op.saldo_disponivel ?? saldoTotal;
      const consumido = saldoTotal - saldoDisponivel;
      const pctConsumido = saldoTotal > 0 ? (consumido / saldoTotal) * 100 : 0;
      const status = pctConsumido >= 100 ? "Esgotado" : pctConsumido >= 80 ? "Saldo baixo" : "OK";

      return {
        _ordenar: pctConsumido,
        "Nº Solicitação": op.numero_solicitacao || "—",
        "Nº OP": op.numero_op || "—",
        "Centro de Custo": centro?.nome ?? "—",
        "Conta Contábil": conta?.nome ?? "—",
        "Saldo Total": formatadorRS.format(saldoTotal),
        "Saldo Disponível": formatadorRS.format(saldoDisponivel),
        "Consumido %": pctConsumido.toFixed(0) + "%",
        "Status": status,
      };
    })
    .sort((a, b) => b._ordenar - a._ordenar);

  const colunas = ["Nº Solicitação", "Nº OP", "Centro de Custo", "Conta Contábil", "Saldo Total", "Saldo Disponível", "Consumido %", "Status"];
  return { titulo: `Ordens de Pagamento (${linhas.length})`, arquivo: "ordens-pagamento", colunas, linhas };
}

// --- Relatório: Painel (Realizado x Aprovado), próprio ou terceiros ---

async function montarRelatorioPainel(tipoGestao) {
  const [todosCentros, todasContas] = await Promise.all([listarCentrosCusto(), listarTodasContas()]);
  const centros = todosCentros.filter((c) => (c.tipo_gestao ?? "proprio") === tipoGestao);
  const centroIds = new Set(centros.map((c) => c.id));
  const contas = todasContas.filter((c) => centroIds.has(c.centro_custo_id));

  const linhas = [];
  for (const conta of contas) {
    const lancamentos = await listarLancamentosPorConta(conta.id);
    const realizadoPorMes = Array(12).fill(0);
    lancamentos.forEach((l) => {
      const idx = (l.mes_referencia ?? 1) - 1;
      if (idx >= 0 && idx < 12) realizadoPorMes[idx] += l.valor_nf ?? 0;
    });

    const acumuladoRealizado = realizadoPorMes.reduce((a, b) => a + b, 0);
    const aprovadoPorMes = CHAVES_MES.map((k) => conta.orcamento_aprovado?.[k] ?? 0);
    const acumuladoAprovado = aprovadoPorMes.reduce((a, b) => a + b, 0);
    const variacao = acumuladoAprovado - acumuladoRealizado;
    const indexPct = acumuladoAprovado > 0 ? (acumuladoRealizado / acumuladoAprovado) * 100 : 0;
    const centro = centros.find((c) => c.id === conta.centro_custo_id);

    const linha = { "Centro de Custo": centro?.nome ?? "—", "Conta Contábil": conta.nome };
    NOMES_MES_ABREV.forEach((nome, i) => (linha[nome] = formatadorRS.format(realizadoPorMes[i])));
    linha["Acum. Realizado"] = formatadorRS.format(acumuladoRealizado);
    linha["Acum. Aprovado"] = acumuladoAprovado > 0 ? formatadorRS.format(acumuladoAprovado) : "—";
    linha["Variação R$"] = formatadorRS.format(variacao);
    linha["Index %"] = acumuladoAprovado > 0 ? indexPct.toFixed(1) + "%" : "—";
    linhas.push(linha);
  }

  const colunas = ["Centro de Custo", "Conta Contábil", ...NOMES_MES_ABREV, "Acum. Realizado", "Acum. Aprovado", "Variação R$", "Index %"];
  const rotulo = tipoGestao === "proprio" ? "Centros Próprios" : "Centros de Terceiros";
  return { titulo: `Painel — ${rotulo}`, arquivo: `painel-${tipoGestao}`, colunas, linhas };
}

// --- Relatório: Realizado x Aprovado (estouros mês a mês) ---

/**
 * Lista cada Conta + mês em que o realizado passou do aprovado, do maior
 * estouro para o menor. O aprovado não tem ano no banco (é por mês), então o
 * relatório é sempre de UM ano — por padrão o mais recente — pra não comparar
 * lançamentos de 2025 contra o orçamento de 2026.
 * Contas sem nenhum orçamento no ano ficam no fim, marcadas como tal: é falta
 * de cadastro, não estouro, e misturar as duas coisas esconderia o problema real.
 */
async function montarRelatorioRealizadoAprovado(anoEscolhido) {
  const [lancamentos, centros, contas] = await Promise.all([listarTodosLancamentos(), listarCentrosCusto(), listarTodasContas()]);
  const centrosPorId = new Map(centros.map((c) => [c.id, c]));

  const anos = [...new Set(lancamentos.map((l) => aDate(l.data_emissao)?.getFullYear()).filter(Boolean))].sort((a, b) => b - a);
  const ano = anoEscolhido ? Number(anoEscolhido) : anos[0] ?? new Date().getFullYear();

  const realizadoPorConta = new Map();
  lancamentos.forEach((l) => {
    const data = aDate(l.data_emissao);
    if (!data || data.getFullYear() !== ano) return;
    const idx = (l.mes_referencia ?? 1) - 1;
    if (idx < 0 || idx > 11) return;
    if (!realizadoPorConta.has(l.conta_contabil_id)) realizadoPorConta.set(l.conta_contabil_id, Array(12).fill(0));
    realizadoPorConta.get(l.conta_contabil_id)[idx] += l.valor_nf ?? 0;
  });

  const linhas = [];
  contas.forEach((conta) => {
    const realizadoPorMes = realizadoPorConta.get(conta.id);
    if (!realizadoPorMes) return;

    const aprovadoPorMes = CHAVES_MES.map((k) => conta.orcamento_aprovado?.[k] ?? 0);
    const temOrcamento = aprovadoPorMes.some((v) => v > 0);
    const centro = centrosPorId.get(conta.centro_custo_id);

    realizadoPorMes.forEach((realizado, i) => {
      if (realizado <= 0) return;
      const aprovado = aprovadoPorMes[i];

      let situacao;
      if (!temOrcamento) situacao = "Conta sem orçamento";
      else if (aprovado === 0) situacao = "Sem aprovado no mês";
      else if (realizado > aprovado) situacao = "Acima do aprovado";
      else return; // dentro do aprovado: não é divergência

      linhas.push({
        _grupo: temOrcamento ? 0 : 1,
        _ordenar: temOrcamento ? realizado - aprovado : realizado,
        "Centro de Custo": centro?.nome ?? "—",
        "Gestão": (centro?.tipo_gestao ?? "proprio") === "terceiros" ? "Terceiros" : "Próprio",
        "Conta Contábil": conta.nome,
        "Mês": `${NOMES_MES_ABREV[i]}/${ano}`,
        "Aprovado": aprovado > 0 ? formatadorRS.format(aprovado) : "—",
        "Realizado": formatadorRS.format(realizado),
        "Estouro R$": temOrcamento ? formatadorRS.format(realizado - aprovado) : "—",
        "Index %": aprovado > 0 ? ((realizado / aprovado) * 100).toFixed(1) + "%" : "—",
        "Situação": situacao,
      });
    });
  });

  linhas.sort((a, b) => a._grupo - b._grupo || b._ordenar - a._ordenar);

  const acima = linhas.filter((l) => l._grupo === 0).length;
  const semOrcamento = linhas.length - acima;
  const colunas = ["Centro de Custo", "Gestão", "Conta Contábil", "Mês", "Aprovado", "Realizado", "Estouro R$", "Index %", "Situação"];
  return {
    titulo: `Realizado × Aprovado ${ano} — ${acima} mês(es) acima do aprovado · ${semOrcamento} em contas sem orçamento`,
    arquivo: `realizado-aprovado-${ano}`,
    colunas,
    linhas,
    anos,
    ano,
  };
}

// --- Renderização em tela (genérica pra qualquer relatório) ---

function renderizarTabela(container, relatorio) {
  const filtroHtml = relatorio.anos
    ? `<div class="relatorio-filtro">
         <label for="relatorio-ano">Ano</label>
         <select id="relatorio-ano">
           ${(relatorio.anos.length ? relatorio.anos : [relatorio.ano]).map((a) => `<option value="${a}" ${a === relatorio.ano ? "selected" : ""}>${a}</option>`).join("")}
         </select>
         <span class="relatorio-filtro-nota">Estouro = realizado maior que o aprovado do mês. Contas sem nenhum orçamento no ano ficam no fim.</span>
       </div>`
    : "";

  if (relatorio.linhas.length === 0) {
    container.innerHTML = filtroHtml + '<div class="placeholder-modulo">Nenhum dado encontrado para este relatório.</div>';
    return;
  }

  const cabecalho = relatorio.colunas.map((c) => `<th>${c}</th>`).join("");
  const linhasHtml = relatorio.linhas
    .map(
      (linha) =>
        `<tr>${relatorio.colunas
          .map((c) => {
            const valor = linha[c] ?? "—";
            if (c === "Movidesk" && typeof valor === "string" && valor.startsWith("http")) {
              return `<td><a href="${valor}" target="_blank" rel="noopener" class="link-movidesk">Abrir ↗</a></td>`;
            }
            if (c === "Situação") {
              const classe = valor === "Acima do aprovado" ? "chip-divergencia" : valor === "Sem aprovado no mês" ? "chip-alerta" : "heat-sem-orcamento";
              return `<td><span class="chip ${classe}">${valor}</span></td>`;
            }
            return `<td>${valor}</td>`;
          })
          .join("")}</tr>`
    )
    .join("");

  container.innerHTML = `
    ${filtroHtml}
    <p class="relatorio-titulo">${relatorio.titulo}</p>
    <div class="tabela-scroll">
      <table class="tabela-matriz">
        <thead><tr>${cabecalho}</tr></thead>
        <tbody>${linhasHtml}</tbody>
      </table>
    </div>`;
}
