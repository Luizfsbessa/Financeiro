// ============================================================
// form-lancamento.js
// Tela de lançamento de NF — substitui o Google Forms.
// Listas dependentes (Centro de Custo → Conta Contábil → Serviço)
// e pré-visualização ao vivo do resultado das regras de conciliação.
// ============================================================

import {
  listarCentrosCusto,
  listarContasPorCentro,
  listarServicosPorConta,
  orcamentoProjetadoDoMes,
  registrarLancamento,
} from "./firestore.js";
import { processarLancamento } from "./conciliacao.js";
import { dadosDoLancador } from "./auth.js";
import { invalidarDashboard } from "./dashboard.js";

const formatadorRS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatadorData = new Intl.DateTimeFormat("pt-BR");

let servicoSelecionado = null; // guarda o objeto completo (não só o id), para ler o orçamento

/**
 * Inicializa a tela de lançamento. Deve ser chamada uma vez, depois
 * do login, passando o usuário autenticado (para gravar como lançador).
 */
export async function iniciarFormLancamento(user) {
  const form = document.getElementById("form-lancamento");
  if (!form) return; // seção ainda não está no DOM (ex.: outra aba ativa)

  const selCentro = document.getElementById("campo-centro-custo");
  const selConta = document.getElementById("campo-conta-contabil");
  const selServico = document.getElementById("campo-servico");
  const inputValor = document.getElementById("campo-valor-nf");
  const inputEmissao = document.getElementById("campo-data-emissao");
  const inputVencimento = document.getElementById("campo-data-vencimento");
  const campoObservacao = document.getElementById("campo-observacao");
  const grupoObservacao = document.getElementById("grupo-observacao");
  const preview = document.getElementById("preview-conciliacao");
  const mensagemStatus = document.getElementById("form-lancamento-status");

  // --- Popular Centros de Custo ---
  const centros = await listarCentrosCusto();
  preencherSelect(selCentro, centros, "Selecione o Centro de Custo");

  selCentro.addEventListener("change", async () => {
    servicoSelecionado = null;
    limparSelect(selConta, "Selecione a Conta Contábil");
    limparSelect(selServico, "Selecione o Serviço/Prestador");
    atualizarPreview(null);
    if (!selCentro.value) return;
    const contas = await listarContasPorCentro(selCentro.value);
    preencherSelect(selConta, contas, "Selecione a Conta Contábil");
  });

  selConta.addEventListener("change", async () => {
    servicoSelecionado = null;
    limparSelect(selServico, "Selecione o Serviço/Prestador");
    atualizarPreview(null);
    if (!selConta.value) return;
    const servicos = await listarServicosPorConta(selConta.value);
    preencherSelect(selServico, servicos, "Selecione o Serviço/Prestador");
  });

  selServico.addEventListener("change", () => {
    servicoSelecionado = obterDadosSelecionados(selServico);
    recalcularPreview();
  });

  [inputValor, inputEmissao, inputVencimento].forEach((campo) =>
    campo.addEventListener("input", recalcularPreview)
  );

  function recalcularPreview() {
    const valorNF = parseFloat(inputValor.value);
    const dataEmissao = inputEmissao.value ? new Date(inputEmissao.value + "T00:00:00") : null;
    const dataVencimento = inputVencimento.value ? new Date(inputVencimento.value + "T00:00:00") : null;

    if (!servicoSelecionado || !valorNF || !dataEmissao || !dataVencimento) {
      atualizarPreview(null);
      return;
    }

    const mes = dataEmissao.getMonth() + 1;
    const orcamentoProjetado = orcamentoProjetadoDoMes(servicoSelecionado, mes);

    const resultado = processarLancamento({
      valorNF,
      orcamentoProjetado,
      dataEmissao,
      dataVencimento,
      dataEntrada: new Date(),
    });

    grupoObservacao.style.display = resultado.status_divergencia === "COM_DIVERGENCIA" ? "block" : "none";
    atualizarPreview(resultado, orcamentoProjetado);
  }

  function atualizarPreview(resultado, orcamentoProjetado) {
    if (!resultado) {
      preview.innerHTML = '<p class="preview-vazio">Preencha os campos acima para ver a conciliação em tempo real.</p>';
      return;
    }

    const usouVencimentoComoReferencia =
      resultado.data_referencia_pagamento.getTime() !== resultado.data_sugerida_pagamento.getTime();

    preview.innerHTML = `
      <div class="preview-linha">
        <span>Orçamento projetado do mês</span>
        <strong class="valor-monetario">${formatadorRS.format(orcamentoProjetado)}</strong>
      </div>
      <div class="preview-linha">
        <span>Divergência</span>
        <strong class="valor-monetario">${formatadorRS.format(resultado.divergencia_rs)} (${(resultado.divergencia_pct * 100).toFixed(1)}%)</strong>
      </div>
      <div class="preview-linha">
        <span>Status orçamentário</span>
        ${chip(resultado.status_divergencia)}
      </div>
      <div class="preview-linha">
        <span>Antecedência até o pagamento</span>
        ${chip(resultado.status_antecedencia, `${resultado.dias_antecedencia} dia(s)`)}
      </div>
      <div class="preview-linha">
        <span>Data limite para lançar (10 dias antes)</span>
        <strong class="numero-tabular">${formatadorData.format(resultado.data_limite_lancamento)}</strong>
      </div>
      <div class="preview-linha">
        <span>Data sugerida de pagamento (política)</span>
        <strong class="numero-tabular">${formatadorData.format(resultado.data_sugerida_pagamento)}</strong>
      </div>
      ${usouVencimentoComoReferencia ? `
      <div class="preview-linha preview-nota">
        <span>Vencimento real deu mais prazo — usando ${formatadorData.format(resultado.data_referencia_pagamento)} como referência da antecedência.</span>
      </div>` : ""}
    `;
  }

  function chip(status, textoExtra) {
    const mapa = {
      OK: { classe: "chip-ok", texto: "OK" },
      COM_DIVERGENCIA: { classe: "chip-divergencia", texto: "Com divergência" },
      ALERTA_MENOS_10_DIAS: { classe: "chip-alerta", texto: "Alerta: menos de 10 dias" },
    };
    const info = mapa[status] ?? { classe: "chip-ok", texto: status };
    return `<span class="chip ${info.classe}">${textoExtra ? `${textoExtra} · ` : ""}${info.texto}</span>`;
  }

  // --- Envio do formulário ---
  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensagemStatus.textContent = "";

    if (!servicoSelecionado) {
      mensagemStatus.textContent = "Selecione o serviço/prestador.";
      return;
    }

    const valorNF = parseFloat(inputValor.value);
    const dataEmissao = new Date(inputEmissao.value + "T00:00:00");
    const dataVencimento = new Date(inputVencimento.value + "T00:00:00");
    const mes = dataEmissao.getMonth() + 1;
    const orcamentoProjetado = orcamentoProjetadoDoMes(servicoSelecionado, mes);

    const calculado = processarLancamento({
      valorNF,
      orcamentoProjetado,
      dataEmissao,
      dataVencimento,
      dataEntrada: new Date(),
    });

    if (calculado.status_divergencia === "COM_DIVERGENCIA" && !campoObservacao.value.trim()) {
      mensagemStatus.textContent = "Este lançamento está com divergência — a observação é obrigatória.";
      return;
    }

    const botaoSalvar = form.querySelector('button[type="submit"]');
    botaoSalvar.disabled = true;

    try {
      await registrarLancamento({
        ...dadosDoLancador(user),
        centro_custo_id: selCentro.value,
        conta_contabil_id: selConta.value,
        servico_id: selServico.value,
        servico_nome: servicoSelecionado.nome,
        valor_nf: valorNF,
        data_emissao: dataEmissao,
        data_vencimento: dataVencimento,
        observacao: campoObservacao.value.trim(),
        ...calculado,
      });

      form.reset();
      servicoSelecionado = null;
      limparSelect(selConta, "Selecione a Conta Contábil");
      limparSelect(selServico, "Selecione o Serviço/Prestador");
      atualizarPreview(null);
      invalidarDashboard();
      mensagemStatus.textContent = "Lançamento salvo com sucesso.";
      mensagemStatus.classList.add("sucesso");
    } catch (erro) {
      console.error("Erro ao salvar lançamento:", erro);
      mensagemStatus.textContent = "Não foi possível salvar. Tente novamente.";
      mensagemStatus.classList.remove("sucesso");
    } finally {
      botaoSalvar.disabled = false;
    }
  });
}

// --- Utilitários locais ---

function preencherSelect(select, itens, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  itens.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.nome;
    option.dataset.item = JSON.stringify(item);
    select.appendChild(option);
  });
  select.disabled = itens.length === 0;
}

function limparSelect(select, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  select.disabled = true;
}

function obterDadosSelecionados(select) {
  const option = select.options[select.selectedIndex];
  if (!option || !option.dataset.item) return null;
  return JSON.parse(option.dataset.item);
}
