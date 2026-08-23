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
  listarOrdensPagamentoPorConta,
  registrarLancamentoComOP,
} from "./firestore.js";
import { processarLancamento } from "./conciliacao.js";
import { dadosDoLancador } from "./auth.js";
import { invalidarDashboard, invalidarPainelTerceiros } from "./dashboard.js";

const formatadorRS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatadorData = new Intl.DateTimeFormat("pt-BR");

let servicoSelecionado = null; // guarda o objeto completo (não só o id), para ler o orçamento
let ordemPagamentoSelecionada = null; // idem, para validar o saldo disponível antes de enviar

/**
 * Inicializa a tela de lançamento. Deve ser chamada uma vez, depois
 * do login, passando o usuário autenticado (para gravar como lançador).
 */
export async function iniciarFormLancamento(user) {
  const form = document.getElementById("form-lancamento");
  if (!form) return; // seção ainda não está no DOM (ex.: outra aba ativa)

  const selCentro = document.getElementById("campo-centro-custo");
  const selTipoLancamento = document.getElementById("campo-tipo-lancamento");
  const selConta = document.getElementById("campo-conta-contabil");
  const selServico = document.getElementById("campo-servico");
  const selOP = document.getElementById("campo-ordem-pagamento");
  const inputValor = document.getElementById("campo-valor-nf");
  const inputEmissao = document.getElementById("campo-data-emissao");
  const inputVencimento = document.getElementById("campo-data-vencimento");
  const campoObservacao = document.getElementById("campo-observacao");
  const grupoObservacao = document.getElementById("grupo-observacao");
  const preview = document.getElementById("preview-conciliacao");
  const mensagemStatus = document.getElementById("form-lancamento-status");

  // --- Popular Centros de Custo ---
  try {
    const centros = await listarCentrosCusto();
    preencherSelect(selCentro, centros, "Selecione o Centro de Custo");
  } catch (erro) {
    console.error("Erro ao carregar Centros de Custo:", erro);
    selCentro.innerHTML = '<option value="">Erro ao carregar — veja o console (F12)</option>';
    throw erro; // propaga para o app.js não marcar a tela como "iniciada com sucesso"
  }

  selCentro.addEventListener("change", async () => {
    servicoSelecionado = null;
    ordemPagamentoSelecionada = null;
    limparSelect(selConta, "Selecione a Conta Contábil");
    limparSelect(selServico, "Selecione o Serviço/Prestador");
    limparSelect(selOP, "Selecione o Serviço/Prestador primeiro");
    atualizarPreview(null);
    if (!selCentro.value) return;
    const contas = await listarContasPorCentro(selCentro.value);
    preencherSelect(selConta, contas, "Selecione a Conta Contábil");
  });

  selConta.addEventListener("change", async () => {
    servicoSelecionado = null;
    ordemPagamentoSelecionada = null;
    limparSelect(selServico, "Selecione o Serviço/Prestador");
    limparSelect(selOP, "Selecione o Serviço/Prestador primeiro");
    atualizarPreview(null);
    if (!selConta.value) return;
    const servicos = await listarServicosPorConta(selConta.value);
    preencherSelect(selServico, servicos, "Selecione o Serviço/Prestador");
  });

  selOP.addEventListener("change", () => {
    ordemPagamentoSelecionada = obterDadosSelecionados(selOP);
  });

  selServico.addEventListener("change", async () => {
    servicoSelecionado = obterDadosSelecionados(selServico);
    ordemPagamentoSelecionada = null;
    limparSelect(selOP, "Carregando Ordens de Pagamento...");

    if (selServico.value && selConta.value) {
      const todasOPs = await listarOrdensPagamentoPorConta(selConta.value);
      // Uma OP só é elegível pra este lançamento se estiver presa a ESTE
      // Serviço/Fornecedor específico. OPs sem servico_id são dados
      // antigos (importados antes dessa trava existir) — continuam
      // aparecendo, mas isso é uma exceção histórica, não a regra.
      const elegiveis = todasOPs.filter((op) => !op.servico_id || op.servico_id === selServico.value);
      preencherSelectOP(selOP, elegiveis);
    }

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

      <div class="preview-secao-titulo">Vencimento da NF</div>
      <div class="preview-linha">
        <span>Tempo hábil até o vencimento</span>
        ${chip(resultado.status_tempo_habil_vencimento, `${resultado.dias_tempo_habil_vencimento} dia(s)`)}
      </div>
      <div class="preview-linha">
        <span>Data limite para lançamento</span>
        <strong class="numero-tabular">${formatadorData.format(resultado.data_limite_lancamento)}</strong>
      </div>

      <div class="preview-secao-titulo">Política de pagamento</div>
      <div class="preview-linha">
        <span>Data sugerida de pagamento</span>
        <strong class="numero-tabular">${formatadorData.format(resultado.data_sugerida_pagamento)}</strong>
      </div>
      <div class="preview-linha">
        <span>Antecedência conforme política</span>
        ${chip(resultado.status_antecedencia_politica, `${resultado.dias_antecedencia_politica} dia(s)`)}
      </div>
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

    if (!ordemPagamentoSelecionada) {
      mensagemStatus.textContent = "Selecione a Ordem de Pagamento que vai custear este lançamento.";
      return;
    }

    if (!selTipoLancamento.value) {
      mensagemStatus.textContent = "Selecione o Tipo de Lançamento (recorrente ou avulso).";
      return;
    }

    const valorNF = parseFloat(inputValor.value);
    const saldoDisponivelOP = ordemPagamentoSelecionada.saldo_disponivel ?? ordemPagamentoSelecionada.saldo_total ?? 0;

    if (valorNF > saldoDisponivelOP) {
      mensagemStatus.textContent = `Saldo insuficiente na Ordem de Pagamento selecionada (disponível: ${formatadorRS.format(saldoDisponivelOP)}).`;
      return;
    }

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
      await registrarLancamentoComOP(
        {
          ...dadosDoLancador(user),
          centro_custo_id: selCentro.value,
          conta_contabil_id: selConta.value,
          servico_id: selServico.value,
          servico_nome: servicoSelecionado.nome,
          tipo_lancamento: selTipoLancamento.value,
          valor_nf: valorNF,
          data_emissao: dataEmissao,
          data_vencimento: dataVencimento,
          observacao: campoObservacao.value.trim(),
          ...calculado,
        },
        selOP.value
      );

      form.reset();
      servicoSelecionado = null;
      ordemPagamentoSelecionada = null;
      limparSelect(selConta, "Selecione a Conta Contábil");
      limparSelect(selServico, "Selecione o Serviço/Prestador");
      limparSelect(selOP, "Selecione o Serviço/Prestador primeiro");
      atualizarPreview(null);
      invalidarDashboard();
      invalidarPainelTerceiros();
      mensagemStatus.textContent = "Lançamento salvo com sucesso.";
      mensagemStatus.classList.add("sucesso");
    } catch (erro) {
      console.error("Erro ao salvar lançamento:", erro);
      mensagemStatus.textContent = erro.message || "Não foi possível salvar. Tente novamente.";
      mensagemStatus.classList.remove("sucesso");
    } finally {
      botaoSalvar.disabled = false;
    }
  });
}

// --- Utilitários locais ---

function preencherSelectOP(select, ordens) {
  select.innerHTML = '<option value="">Selecione a Ordem de Pagamento</option>';
  ordens.forEach((op) => {
    const saldo = op.saldo_disponivel ?? op.saldo_total ?? 0;
    const option = document.createElement("option");
    option.value = op.id;
    option.textContent = `OP ${op.numero_op || op.id} · Saldo: ${formatadorRS.format(saldo)}`;
    option.dataset.item = JSON.stringify(op);
    if (saldo <= 0) option.disabled = true;
    select.appendChild(option);
  });
  select.disabled = ordens.length === 0;
}

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
