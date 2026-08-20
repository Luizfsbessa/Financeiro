// ============================================================
// ordens-pagamento.js
// Tela de Ordens de Pagamento (OP). Uma OP é solicitada em outro
// sistema e chega aqui com um saldo próprio, vinculado a um
// Centro de Custo + Conta Contábil. Cada lançamento de NF feito
// contra essa OP consome parte do saldo (ver registrarLancamentoComOP
// em firestore.js — o débito acontece numa transação atômica).
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

/** Inicializa a tela — pode ser chamada toda vez que a aba é aberta; os
 * listeners só são conectados uma vez, mas a lista é sempre recarregada. */
export async function iniciarOrdensPagamento() {
  if (!listenersConectados) {
    try {
      await conectarFormulario();
      listenersConectados = true; // só marca como conectado se deu certo
    } catch (erro) {
      console.error("Erro ao conectar formulário de Ordem de Pagamento:", erro);
      const selCentro = document.getElementById("op-centro-custo");
      if (selCentro) selCentro.innerHTML = '<option value="">Erro ao carregar — veja o console (F12)</option>';
    }
  }

  try {
    await recarregarLista();
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
      await recarregarLista();
    } catch (erro) {
      console.error("Erro ao registrar Ordem de Pagamento:", erro);
      status.textContent = "Não foi possível registrar. Tente novamente.";
      status.classList.remove("sucesso");
    } finally {
      botao.disabled = false;
    }
  });
}

async function recarregarLista() {
  const container = document.getElementById("lista-ordens-pagamento");
  if (!container) return;

  container.innerHTML = '<p class="preview-vazio">Carregando...</p>';

  const [ordens, centros, contas] = await Promise.all([
    listarOrdensPagamento(),
    listarCentrosCusto(),
    listarTodasContas(),
  ]);

  if (ordens.length === 0) {
    container.innerHTML = '<div class="placeholder-modulo">Nenhuma Ordem de Pagamento cadastrada ainda.</div>';
    return;
  }

  const linhas = ordens
    .map((op) => {
      const conta = contas.find((c) => c.id === op.conta_contabil_id);
      const centro = centros.find((c) => c.id === conta?.centro_custo_id);
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

// --- Utilitários locais (mesmo padrão simples usado em form-lancamento.js) ---

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
