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
  listarServicosPorConta,
  listarTodasContas,
  listarTodosServicos,
  listarOrdensPagamento,
  criarOrdemPagamento,
  criarOrdemPagamentoRateio,
} from "./firestore.js";

const formatadorRS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

let listenersConectados = false;

// Cache em memória da última carga, para a busca filtrar sem refazer a consulta ao Firestore.
let cacheOrdens = [];
let cacheCentros = [];
let cacheContas = [];
let cacheServicos = [];

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

  const checkboxRateio = document.getElementById("op-eh-rateio");
  const grupoNormal = document.getElementById("op-grupo-normal");
  const grupoRateio = document.getElementById("op-grupo-rateio");
  const selCentro = document.getElementById("op-centro-custo");
  const selConta = document.getElementById("op-conta-contabil");
  const selServicoOP = document.getElementById("op-servico");
  const inputContaCodigo = document.getElementById("op-conta-codigo-rateio");
  const inputSolicitacao = document.getElementById("op-numero-solicitacao");
  const inputNumeroOP = document.getElementById("op-numero-op");
  const inputSaldo = document.getElementById("op-saldo-total");
  const status = document.getElementById("form-op-status");

  const centros = await listarCentrosCusto();
  preencherSelect(selCentro, centros, "Selecione o Centro de Custo");

  selCentro.addEventListener("change", async () => {
    limparSelect(selConta, "Selecione a Conta Contábil");
    limparSelect(selServicoOP, "Selecione a Conta Contábil primeiro");
    if (!selCentro.value) return;
    const contas = await listarContasPorCentro(selCentro.value);
    preencherSelect(selConta, contas, "Selecione a Conta Contábil");
  });

  selConta.addEventListener("change", async () => {
    limparSelect(selServicoOP, "Selecione o Serviço/Prestador");
    if (!selConta.value) return;
    const servicos = await listarServicosPorConta(selConta.value);
    if (servicos.length === 0) {
      selServicoOP.innerHTML = '<option value="">Nenhum Serviço cadastrado nesta conta — cadastre em "Orçamento & Contas"</option>';
      return;
    }
    preencherSelect(selServicoOP, servicos, "Selecione o Serviço/Prestador");
  });

  checkboxRateio?.addEventListener("change", () => {
    const ehRateio = checkboxRateio.checked;
    grupoNormal.hidden = ehRateio;
    grupoRateio.hidden = !ehRateio;
    selCentro.required = !ehRateio;
    selConta.required = !ehRateio;
    selServicoOP.required = !ehRateio;
    inputContaCodigo.required = ehRateio;
  });

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    status.textContent = "";

    const saldoTotal = parseFloat(inputSaldo.value);
    const ehRateio = checkboxRateio?.checked;

    console.log("[ordens-pagamento] submit — ehRateio:", ehRateio, "| centro:", selCentro.value, "| conta:", selConta.value, "| saldo:", saldoTotal);

    if (!saldoTotal || saldoTotal <= 0) {
      status.textContent = "Informe um saldo total válido.";
      status.classList.remove("sucesso");
      return;
    }
    if (!ehRateio && (!selCentro.value || !selConta.value)) {
      status.textContent = "Selecione o Centro de Custo e a Conta Contábil antes de registrar.";
      status.classList.remove("sucesso");
      return;
    }
    if (ehRateio && !inputContaCodigo.value.trim()) {
      status.textContent = "Informe o código da Conta Contábil (deve ser o mesmo em todas as fatias do rateio).";
      status.classList.remove("sucesso");
      return;
    }
    if (!ehRateio && selServicoOP && !selServicoOP.value) {
      status.textContent = "Selecione o Serviço/Prestador — cada OP fica presa a um fornecedor específico.";
      status.classList.remove("sucesso");
      return;
    }

    const botao = form.querySelector('button[type="submit"]');
    botao.disabled = true;

    try {
      if (ehRateio) {
        await criarOrdemPagamentoRateio({
          numeroSolicitacao: inputSolicitacao.value.trim(),
          numeroOP: inputNumeroOP.value.trim(),
          contaCodigo: inputContaCodigo.value.trim(),
          saldoTotal,
        });
      } else {
        // Segunda camada de validação, redundante de propósito — nunca grava
        // uma OP "normal" sem Centro/Conta, mesmo que algo escape acima.
        if (!selCentro.value || !selConta.value) {
          throw new Error("Centro de Custo ou Conta Contábil vazios no momento de gravar — isso não deveria acontecer.");
        }
        await criarOrdemPagamento({
          numero_solicitacao: inputSolicitacao.value.trim(),
          numero_op: inputNumeroOP.value.trim(),
          centro_custo_id: selCentro.value,
          conta_contabil_id: selConta.value,
          servico_id: selServicoOP?.value || null,
          saldo_total: saldoTotal,
        });
      }

      form.reset();
      grupoNormal.hidden = false;
      grupoRateio.hidden = true;
      limparSelect(selConta, "Selecione a Conta Contábil");
      limparSelect(selServicoOP, "Selecione a Conta Contábil primeiro");
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

  const [ordens, centros, contas, servicos] = await Promise.all([
    listarOrdensPagamento(),
    listarCentrosCusto(),
    listarTodasContas(),
    listarTodosServicos(),
  ]);

  cacheOrdens = ordens;
  cacheCentros = centros;
  cacheContas = contas;
  cacheServicos = servicos;

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
  const servicosPorId = new Map(cacheServicos.map((s) => [s.id, s]));

  const filtradas = cacheOrdens.filter((op) => {
    const conta = contasPorId.get(op.conta_contabil_id);
    const centro = centrosPorId.get(conta?.centro_custo_id);
    const servico = servicosPorId.get(op.servico_id);

    if (centroFiltro && centro?.id !== centroFiltro) return false;

    if (termo) {
      const alvo = `${op.numero_op ?? ""} ${op.numero_solicitacao ?? ""} ${conta?.nome ?? ""} ${centro?.nome ?? ""} ${op.conta_codigo ?? ""} ${servico?.nome ?? ""}`.toLowerCase();
      if (!alvo.includes(termo)) return false;
    }

    return true;
  });

  renderizarLista(filtradas, contasPorId, centrosPorId, servicosPorId);
}

function renderizarLista(ordens, contasPorId, centrosPorId, servicosPorId) {
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
      const servico = servicosPorId.get(op.servico_id);
      const ehRateio = op.tipo === "rateio";
      const saldoTotal = op.saldo_total ?? 0;
      const saldoDisponivel = op.saldo_disponivel ?? saldoTotal;
      const consumido = saldoTotal - saldoDisponivel;
      const pctConsumido = saldoTotal > 0 ? (consumido / saldoTotal) * 100 : 0;
      const classeHeat = pctConsumido >= 100 ? "heat-vermelho" : pctConsumido >= 80 ? "heat-amarelo" : "heat-verde";

      return `
        <tr>
          <td class="col-conta">${op.numero_solicitacao || "—"}</td>
          <td>${op.numero_op || "—"}${ehRateio ? ' <span class="chip chip-alerta" style="margin-left:4px">rateio</span>' : ""}</td>
          <td>${ehRateio ? "— (várias)" : centro?.nome ?? "—"}</td>
          <td>${ehRateio ? op.conta_codigo ?? "—" : conta?.nome ?? "—"}</td>
          <td>${ehRateio ? "— (várias)" : servico?.nome ?? "—"}</td>
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
            <th>Fornecedor</th>
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
  select.disabled = itens.length === 0;
}

function limparSelect(select, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  select.disabled = true;
}
