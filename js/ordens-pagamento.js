// ============================================================
// ordens-pagamento.js
// Tela de Ordens de Pagamento (OP). Uma OP é solicitada em outro
// sistema e chega aqui com um saldo próprio, vinculado a um
// Centro de Custo + Conta Contábil. Cada lançamento de NF feito
// contra essa OP consome parte do saldo (ver registrarLancamentoComOP
// em firestore.js — o débito acontece numa transação atômica).
//
// Com muitas OPs cadastradas, listar tudo solto não escala — a busca
// filtra CLIENT-SIDE sobre os dados já carregados (busca em texto
// livre por Nº OP / Nº Solicitação / Conta, + filtro por Centro de
// Custo). Suficiente até a casa de milhares de OPs; se crescer muito
// além disso, migrar para filtro via query no Firestore.
// ============================================================

import {
  listarCentrosCusto,
  listarContasPorCentro,
  listarTodasContas,
  listarOrdensPagamento,
  criarOrdemPagamento,
} from "./firestore.js";

const formatadorRS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

let listenersConectados = false;

// Cache em memória da última carga, para a busca filtrar sem refazer a consulta ao Firestore.
let cacheOrdens = [];
let cacheCentros = [];
let cacheContas = [];

export async function iniciarOrdensPagamento() {
  if (!listenersConectados) {
    try {
      await conectarFormulario();
      await conectarBusca();
      listenersConectados = true;
    } catch (erro) {
      console.error("Erro ao conectar tela de Ordem de Pagamento:", erro);
      const selCentro = document.getElementById("op-centro-custo");
      if (selCentro) selCentro.innerHTML = '<option value="">Erro ao carregar — veja o console (F12)</option>';
    }
  }

  try {
    await recarregarDados();
  } catch (erro) {
    console.error("Erro ao carregar lista de Ordens de Pagamento:", erro);
    const container = document.getElementById("lista-ordens-pagamento");
    if (container) {
      container.innerHTML = `<div class="placeholder-modulo">Não foi possível carregar. Erro: ${erro.message || "veja o console (F12)"}.</div>`;
    }
  }
}

async function conectarFormulario() {
  const form = document.getElementById("form-ordem-pagamento");
  if (!form) return;

  const selCentro = document.getElementById("op-centro-custo");
  const selConta = document.getElementById("op-conta-contabil");
  const inputSolicitacao = document.getElementById("op-numero-solicitacao");
  const inputNumeroOP = document.getElementById("op-numero-op");
  const inputSaldo = document.getElementById("op-saldo-total");
  const status = document.getElementById("form-op-status");

  const centros = await listarCentrosCusto();
  preencherSelect(selCentro, centros, "Selecione o Centro de Custo");

  selCentro.addEventListener("change", async () => {
    limparSelect(selConta, "Selecione a Conta Contábil");
    if (!selCentro.value) return;
    const contas = await listarContasPorCentro(selCentro.value);
    preencherSelect(selConta, contas, "Selecione a Conta Contábil");
  });

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    status.textContent = "";

    const saldoTotal = parseFloat(inputSaldo.value);
    if (!selConta.value || !saldoTotal || saldoTotal <= 0) {
      status.textContent = "Preencha todos os campos com valores válidos.";
      status.classList.remove("sucesso");
      return;
    }

    const botao = form.querySelector('button[type="submit"]');
    botao.disabled = true;

    try {
      await criarOrdemPagamento({
        numero_solicitacao: inputSolicitacao.value.trim(),
        numero_op: inputNumeroOP.value.trim(),
        centro_custo_id: selCentro.value,
        conta_contabil_id: selConta.value,
        saldo_total: saldoTotal,
      });

      form.reset();
      limparSelect(selConta, "Selecione a Conta Contábil");
      status.textContent = "Ordem de Pagamento registrada com sucesso.";
      status.classList.add("sucesso");
      await recarregarDados();
    } catch (erro) {
      console.error("Erro ao registrar Ordem de Pagamento:", erro);
      status.textContent = "Não foi possível registrar. Tente novamente.";
      status.classList.remove("sucesso");
    } finally {
      botao.disabled = false;
    }
  });
}

async function conectarBusca() {
  const inputBusca = document.getElementById("op-busca-texto");
  const selFiltroCentro = document.getElementById("op-filtro-centro");
  if (!inputBusca || !selFiltroCentro) return;

  inputBusca.addEventListener("input", aplicarFiltro);
  selFiltroCentro.addEventListener("change", aplicarFiltro);
}

async function recarregarDados() {
  const container = document.getElementById("lista-ordens-pagamento");
  if (!container) return;

  container.innerHTML = '<p class="preview-vazio">Carregando...</p>';

  const [ordens, centros, contas] = await Promise.all([
    listarOrdensPagamento(),
    listarCentrosCusto(),
    listarTodasContas(),
  ]);

  cacheOrdens = ordens;
  cacheCentros = centros;
  cacheContas = contas;

  const selFiltroCentro = document.getElementById("op-filtro-centro");
  if (selFiltroCentro && selFiltroCentro.options.length <= 1) {
    preencherSelect(selFiltroCentro, [...centros].sort((a, b) => a.nome.localeCompare(b.nome)), "Todos os Centros de Custo");
    selFiltroCentro.disabled = false;
  }

  aplicarFiltro();
}

function aplicarFiltro() {
  const inputBusca = document.getElementById("op-busca-texto");
  const selFiltroCentro = document.getElementById("op-filtro-centro");
  const termo = (inputBusca?.value ?? "").trim().toLowerCase();
  const centroFiltro = selFiltroCentro?.value ?? "";

  const contasPorId = new Map(cacheContas.map((c) => [c.id, c]));
  const centrosPorId = new Map(cacheCentros.map((c) => [c.id, c]));

  const filtradas = cacheOrdens.filter((op) => {
    const conta = contasPorId.get(op.conta_contabil_id);
    const centro = centrosPorId.get(conta?.centro_custo_id);

    if (centroFiltro && centro?.id !== centroFiltro) return false;

    if (termo) {
      const alvo = `${op.numero_op ?? ""} ${op.numero_solicitacao ?? ""} ${conta?.nome ?? ""} ${centro?.nome ?? ""}`.toLowerCase();
      if (!alvo.includes(termo)) return false;
    }

    return true;
  });

  renderizarLista(filtradas, contasPorId, centrosPorId);
}

function renderizarLista(ordens, contasPorId, centrosPorId) {
  const container = document.getElementById("lista-ordens-pagamento");
  if (!container) return;

  if (cacheOrdens.length === 0) {
    container.innerHTML = '<div class="placeholder-modulo">Nenhuma Ordem de Pagamento cadastrada ainda.</div>';
    return;
  }

  if (ordens.length === 0) {
    container.innerHTML = '<div class="placeholder-modulo">Nenhuma OP encontrada com esse filtro.</div>';
    return;
  }

  const linhas = ordens
    .map((op) => {
      const conta = contasPorId.get(op.conta_contabil_id);
      const centro = centrosPorId.get(conta?.centro_custo_id);
      const saldoTotal = op.saldo_total ?? 0;
      const saldoDisponivel = op.saldo_disponivel ?? saldoTotal;
      const consumido = saldoTotal - saldoDisponivel;
      const pctConsumido = saldoTotal > 0 ? (consumido / saldoTotal) * 100 : 0;
      const classeHeat = pctConsumido >= 100 ? "heat-vermelho" : pctConsumido >= 80 ? "heat-amarelo" : "heat-verde";

      return `
        <tr>
          <td class="col-conta">${op.numero_solicitacao || "—"}</td>
          <td>${op.numero_op || "—"}</td>
          <td>${centro?.nome ?? "—"}</td>
          <td>${conta?.nome ?? "—"}</td>
          <td class="numero-tabular">${formatadorRS.format(saldoTotal)}</td>
          <td class="numero-tabular">${formatadorRS.format(saldoDisponivel)}</td>
          <td class="numero-tabular celula-heat ${classeHeat}">${pctConsumido.toFixed(0)}%</td>
        </tr>`;
    })
    .join("");

  container.innerHTML = `
    <p style="color: var(--ink-400); font-size: var(--text-xs); margin-bottom: var(--space-2)">${ordens.length} de ${cacheOrdens.length} OPs</p>
    <div class="tabela-scroll">
      <table class="tabela-matriz">
        <thead>
          <tr>
            <th class="col-conta">Nº Solicitação</th>
            <th>Nº OP</th>
            <th>Centro de Custo</th>
            <th>Conta Contábil</th>
            <th>Saldo Total</th>
            <th>Saldo Disponível</th>
            <th>Consumido</th>
          </tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>
    </div>`;
}

// --- Utilitários locais ---

function preencherSelect(select, itens, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  itens.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.nome;
    select.appendChild(option);
  });
}

function limparSelect(select, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  select.disabled = true;
}
