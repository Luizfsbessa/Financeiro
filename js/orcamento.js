// ============================================================
// orcamento.js
// Tela "Orçamento & Contas" — cadastro de Centro de Custo, Conta
// Contábil (com Orçamento Aprovado mês a mês) e Serviço/Prestador
// (com Orçamento Projetado mês a mês), direto no app. Substitui a
// necessidade de usar seed.html ou o console do Firebase no dia a dia.
// ============================================================

import {
  listarCentrosCusto,
  listarContasPorCentro,
  listarTodasContas,
  listarServicosPorConta,
  criarCentroCusto,
  criarContaContabil,
  atualizarContaContabil,
  criarServico,
  atualizarServico,
} from "./firestore.js";
import { invalidarDashboard, invalidarPainelTerceiros } from "./dashboard.js";

const NOMES_MES = [
  ["jan", "Jan"], ["fev", "Fev"], ["mar", "Mar"], ["abr", "Abr"],
  ["mai", "Mai"], ["jun", "Jun"], ["jul", "Jul"], ["ago", "Ago"],
  ["set", "Set"], ["out", "Out"], ["nov", "Nov"], ["dez", "Dez"],
];

const formatadorRS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

let listenersConectados = false;
let centroSelecionadoId = null;
let contaSelecionadaId = null; // conta cujos Serviços estão sendo exibidos
let contaEmEdicaoId = null; // null = criando nova Conta
let catalogoContas = []; // {chave, codigo, nome} únicos, extraídos de todas as Contas já cadastradas
let timeoutFecharPainelConta = null;
let timeoutFecharPainelServico = null;
let servicoEmEdicaoId = null; // null = criando novo Serviço

export async function iniciarOrcamento() {
  if (!listenersConectados) {
    try {
      conectarFormularioCentro();
      conectarFormularioConta();
      conectarFormularioServico();
      listenersConectados = true;
    } catch (erro) {
      console.error("Erro ao conectar tela de Orçamento & Contas:", erro);
    }
  }

  try {
    await recarregarCentros();
  } catch (erro) {
    console.error("Erro ao carregar Centros de Custo:", erro);
    const sel = document.getElementById("orc-select-centro");
    if (sel) sel.innerHTML = '<option value="">Erro ao carregar — veja o console (F12)</option>';
  }
}

// --- Grid de 12 meses (reutilizado para Aprovado e Projetado) ---

function montarGradeMeses(idPrefixo, valoresIniciais = {}) {
  return `
    <div class="grade-meses">
      ${NOMES_MES.map(
        ([chave, label]) => `
        <div class="grade-mes-item">
          <label for="${idPrefixo}-${chave}">${label}</label>
          <input type="number" id="${idPrefixo}-${chave}" min="0" step="0.01" value="${valoresIniciais[chave] ?? 0}" />
        </div>`
      ).join("")}
    </div>`;
}

function lerGradeMeses(idPrefixo) {
  const resultado = {};
  NOMES_MES.forEach(([chave]) => {
    const input = document.getElementById(`${idPrefixo}-${chave}`);
    resultado[chave] = parseFloat(input?.value) || 0;
  });
  return resultado;
}

// --- Centro de Custo ---

function conectarFormularioCentro() {
  const form = document.getElementById("form-novo-centro");
  if (!form) return;

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const inputNome = document.getElementById("orc-novo-centro-nome");
    const selTipo = document.getElementById("orc-novo-centro-tipo");
    const status = document.getElementById("orc-status-centro");
    const botao = form.querySelector('button[type="submit"]');

    if (!inputNome.value.trim()) {
      status.textContent = "Digite um nome.";
      return;
    }

    botao.disabled = true;
    try {
      await criarCentroCusto({ nome: inputNome.value, tipoGestao: selTipo.value });
      inputNome.value = "";
      status.textContent = "Centro de Custo criado.";
      status.classList.add("sucesso");
      invalidarDashboard();
      invalidarPainelTerceiros();
      await recarregarCentros();
    } catch (erro) {
      console.error(erro);
      status.textContent = "Erro: " + (erro.message || "não foi possível criar, tente novamente.");
      status.classList.remove("sucesso");
    } finally {
      botao.disabled = false;
    }
  });
}

async function recarregarCentros() {
  const sel = document.getElementById("orc-select-centro");
  if (!sel) return;

  const centros = await listarCentrosCusto();
  const valorAnterior = sel.value;
  sel.innerHTML = '<option value="">Selecione um Centro de Custo</option>';
  centros
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .forEach((centro) => {
      const option = document.createElement("option");
      option.value = centro.id;
      option.textContent = `${centro.nome} (${centro.tipo_gestao === "terceiros" ? "Terceiros" : "Próprio"})`;
      sel.appendChild(option);
    });

  if (valorAnterior && centros.some((c) => c.id === valorAnterior)) {
    sel.value = valorAnterior;
    centroSelecionadoId = valorAnterior; // sel.value = ... não dispara 'change', então sincroniza manualmente
  }
  if (!sel.dataset.listenerAdicionado) {
    sel.addEventListener("change", () => {
      centroSelecionadoId = sel.value || null;
      contaSelecionadaId = null;
      esconderFormConta();
      esconderFormServico();
      recarregarContas();
    });
    sel.dataset.listenerAdicionado = "true";
  }

  if (centroSelecionadoId) await recarregarContas();
}

// --- Conta Contábil ---

async function montarCatalogoContas() {
  try {
    const todas = await listarTodasContas();
    const porChave = new Map();
    todas.forEach((c) => {
      if (!c.conta_codigo) return;
      const chave = String(c.conta_codigo);
      if (!porChave.has(chave)) porChave.set(chave, { chave, codigo: c.conta_codigo, nome: c.nome });
    });
    catalogoContas = [...porChave.values()].sort((a, b) => a.codigo.localeCompare(b.codigo));
    console.log(`[orcamento] catálogo de contas: ${todas.length} contas no total, ${catalogoContas.length} códigos únicos`);
  } catch (erro) {
    console.error("[orcamento] erro ao montar catálogo de contas:", erro);
    catalogoContas = [];
  }
}

function conectarFormularioConta() {
  const form = document.getElementById("form-conta-contabil");
  if (!form) return;

  const inputBusca = document.getElementById("orc-conta-busca");
  const listaSugestoes = document.getElementById("orc-conta-sugestoes");

  document.getElementById("orc-botao-nova-conta")?.addEventListener("click", async () => {
    contaEmEdicaoId = null;
    await montarCatalogoContas(); // já trata erro internamente, nunca lança
    mostrarFormConta();
  });

  inputBusca?.addEventListener("input", () => {
    const termo = inputBusca.value.trim().toLowerCase();
    if (!termo) {
      listaSugestoes.hidden = true;
      return;
    }
    const resultados = catalogoContas
      .filter((c) => c.nome.toLowerCase().includes(termo) || c.codigo.toLowerCase().includes(termo))
      .slice(0, 8);

    listaSugestoes.innerHTML = resultados.length
      ? resultados
          .map(
            (item) =>
              `<div class="autocomplete-item" data-chave="${item.chave}"><span class="codigo">${item.codigo}</span>${item.nome}</div>`
          )
          .join("")
      : '<div class="autocomplete-vazio">Nenhuma conta encontrada — pode digitar uma nova abaixo.</div>';
    listaSugestoes.hidden = false;

    listaSugestoes.querySelectorAll("[data-chave]").forEach((item) => {
      item.addEventListener("click", () => {
        const dados = catalogoContas.find((c) => c.chave === item.dataset.chave);
        document.getElementById("orc-conta-nome").value = dados?.nome ?? "";
        document.getElementById("orc-conta-codigo").value = dados?.codigo ?? "";
        inputBusca.value = "";
        listaSugestoes.hidden = true;
      });
    });
  });

  // Esconde a lista de sugestões ao clicar fora dela
  document.addEventListener("click", (evento) => {
    if (!listaSugestoes || listaSugestoes.hidden) return;
    if (evento.target !== inputBusca && !listaSugestoes.contains(evento.target)) {
      listaSugestoes.hidden = true;
    }
  });

  document.getElementById("orc-cancelar-conta")?.addEventListener("click", () => esconderFormConta());

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const inputNome = document.getElementById("orc-conta-nome");
    const inputCodigo = document.getElementById("orc-conta-codigo");
    const status = document.getElementById("orc-status-conta");
    const botao = document.getElementById("orc-conta-salvar");

    if (!centroSelecionadoId) {
      status.textContent = "Nenhum Centro de Custo selecionado — selecione um antes de criar a conta.";
      status.classList.remove("sucesso");
      return;
    }
    if (!inputNome.value.trim()) {
      status.textContent = "Digite o nome da conta.";
      status.classList.remove("sucesso");
      return;
    }
    if (!inputCodigo.value.trim()) {
      status.textContent = "O código da Conta Contábil é obrigatório (necessário para a conciliação).";
      status.classList.remove("sucesso");
      return;
    }

    const orcamentoAprovado = lerGradeMeses("orc-conta-mes");
    botao.disabled = true;

    try {
      if (contaEmEdicaoId) {
        console.log("[orcamento] atualizando conta", contaEmEdicaoId, { nome: inputNome.value, codigo: inputCodigo.value });
        await atualizarContaContabil(contaEmEdicaoId, {
          nome: inputNome.value.trim(),
          conta_codigo: inputCodigo.value.trim(),
          orcamento_aprovado: orcamentoAprovado,
        });
        status.textContent = "Conta Contábil atualizada.";
      } else {
        console.log("[orcamento] criando conta", { nome: inputNome.value, codigo: inputCodigo.value, centro: centroSelecionadoId });
        const novoId = await criarContaContabil({
          nome: inputNome.value,
          contaCodigo: inputCodigo.value,
          centroCustoId: centroSelecionadoId,
          orcamentoAprovado,
        });
        console.log("[orcamento] conta criada com sucesso, id:", novoId);
        status.textContent = "Conta Contábil criada.";
      }
      status.classList.add("sucesso");
      invalidarDashboard();
      invalidarPainelTerceiros();
      await recarregarContas();
      // Mantém a mensagem de sucesso visível por um instante antes de fechar
      // o painel — antes disso, um sucesso "silencioso" era indistinguível
      // de uma falha, porque o painel (com a mensagem) sumia na mesma hora.
      timeoutFecharPainelConta = setTimeout(() => esconderFormConta(), 1400);
    } catch (erro) {
      console.error("[orcamento] erro ao salvar conta:", erro);
      status.textContent = "Erro: " + (erro.message || "não foi possível salvar, tente novamente.");
      status.classList.remove("sucesso");
    } finally {
      botao.disabled = false;
    }
  });
}

function mostrarFormConta(conta = null) {
  if (timeoutFecharPainelConta) {
    clearTimeout(timeoutFecharPainelConta);
    timeoutFecharPainelConta = null;
  }
  const painel = document.getElementById("orc-painel-conta");
  const titulo = document.getElementById("orc-conta-titulo");
  const gradeContainer = document.getElementById("orc-conta-grade-container");
  const status = document.getElementById("orc-status-conta");
  const selCatalogo = document.getElementById("orc-conta-busca");
  const listaSugestoes = document.getElementById("orc-conta-sugestoes");
  const inputNome = document.getElementById("orc-conta-nome");
  const inputCodigo = document.getElementById("orc-conta-codigo");

  // Limpeza explícita de TODOS os campos antes de preencher — evita resíduo
  // de uma edição anterior (ou autofill do navegador) vazando pro formulário.
  inputNome.value = "";
  inputCodigo.value = "";
  if (selCatalogo) selCatalogo.value = "";
  if (listaSugestoes) listaSugestoes.hidden = true;

  inputNome.value = conta?.nome ?? "";
  inputCodigo.value = conta?.conta_codigo ?? "";
  gradeContainer.innerHTML = montarGradeMeses("orc-conta-mes", conta?.orcamento_aprovado ?? {});
  titulo.textContent = conta ? `Editando: ${conta.nome}` : "Nova Conta Contábil";
  status.textContent = "";
  painel.hidden = false;
  inputNome.focus();
}

function esconderFormConta() {
  const painel = document.getElementById("orc-painel-conta");
  if (painel) painel.hidden = true;
  contaEmEdicaoId = null;
}

async function recarregarContas() {
  const container = document.getElementById("orc-lista-contas");
  if (!container) return;

  if (!centroSelecionadoId) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = '<p class="preview-vazio">Carregando...</p>';
  const contas = await listarContasPorCentro(centroSelecionadoId);

  const linhas = contas
    .map((conta) => {
      const acumulado = Object.values(conta.orcamento_aprovado ?? {}).reduce((a, b) => a + (b || 0), 0);
      return `
        <tr data-conta-id="${conta.id}">
          <td class="col-conta">${conta.nome}</td>
          <td>${conta.conta_codigo ?? "—"}</td>
          <td class="numero-tabular">${formatadorRS.format(acumulado)}</td>
          <td><button type="button" class="botao-link" data-acao="editar-conta">Editar</button></td>
          <td><button type="button" class="botao-link" data-acao="ver-servicos">Serviços</button></td>
        </tr>`;
    })
    .join("");

  container.innerHTML = contas.length
    ? `<div class="tabela-scroll"><table class="tabela-matriz">
        <thead><tr><th class="col-conta">Conta Contábil</th><th>Código</th><th>Acum. Aprovado</th><th></th><th></th></tr></thead>
        <tbody>${linhas}</tbody>
      </table></div>`
    : '<p class="preview-vazio">Nenhuma Conta Contábil neste Centro de Custo ainda.</p>';

  container.querySelectorAll("[data-acao='editar-conta']").forEach((botao) => {
    botao.addEventListener("click", async (evento) => {
      const contaId = evento.target.closest("tr").dataset.contaId;
      const conta = contas.find((c) => c.id === contaId);
      contaEmEdicaoId = contaId;
      await montarCatalogoContas();
      mostrarFormConta(conta);
    });
  });

  container.querySelectorAll("[data-acao='ver-servicos']").forEach((botao) => {
    botao.addEventListener("click", (evento) => {
      const contaId = evento.target.closest("tr").dataset.contaId;
      contaSelecionadaId = contaId;
      esconderFormServico();
      document.getElementById("orc-servicos-titulo").textContent = `Serviços de: ${contas.find((c) => c.id === contaId)?.nome ?? ""}`;
      document.getElementById("orc-bloco-servicos").hidden = false;
      recarregarServicos();
    });
  });
}

// --- Serviço / Prestador ---

function conectarFormularioServico() {
  const form = document.getElementById("form-servico");
  if (!form) return;

  document.getElementById("orc-botao-novo-servico")?.addEventListener("click", () => {
    servicoEmEdicaoId = null;
    mostrarFormServico();
  });

  document.getElementById("orc-cancelar-servico")?.addEventListener("click", () => esconderFormServico());

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const inputNome = document.getElementById("orc-servico-nome");
    const status = document.getElementById("orc-status-servico");
    const botao = document.getElementById("orc-servico-salvar");

    if (!contaSelecionadaId) {
      status.textContent = "Nenhuma Conta Contábil selecionada — clique em 'Serviços' numa conta antes.";
      status.classList.remove("sucesso");
      return;
    }
    if (!inputNome.value.trim()) {
      status.textContent = "Digite o nome do serviço/prestador.";
      status.classList.remove("sucesso");
      return;
    }

    const orcamentoProjetado = lerGradeMeses("orc-servico-mes");
    botao.disabled = true;

    try {
      if (servicoEmEdicaoId) {
        console.log("[orcamento] atualizando serviço", servicoEmEdicaoId);
        await atualizarServico(servicoEmEdicaoId, { nome: inputNome.value.trim(), orcamento_projetado: orcamentoProjetado });
        status.textContent = "Serviço atualizado.";
      } else {
        console.log("[orcamento] criando serviço", { nome: inputNome.value, conta: contaSelecionadaId });
        const novoId = await criarServico({ nome: inputNome.value, contaContabilId: contaSelecionadaId, orcamentoProjetado });
        console.log("[orcamento] serviço criado com sucesso, id:", novoId);
        status.textContent = "Serviço criado.";
      }
      status.classList.add("sucesso");
      await recarregarServicos();
      timeoutFecharPainelServico = setTimeout(() => esconderFormServico(), 1400);
    } catch (erro) {
      console.error("[orcamento] erro ao salvar serviço:", erro);
      status.textContent = "Erro: " + (erro.message || "não foi possível salvar, tente novamente.");
      status.classList.remove("sucesso");
    } finally {
      botao.disabled = false;
    }
  });
}

function mostrarFormServico(servico = null) {
  if (timeoutFecharPainelServico) {
    clearTimeout(timeoutFecharPainelServico);
    timeoutFecharPainelServico = null;
  }
  const painel = document.getElementById("orc-painel-servico");
  const titulo = document.getElementById("orc-servico-titulo-form");
  const gradeContainer = document.getElementById("orc-servico-grade-container");
  const status = document.getElementById("orc-status-servico");

  document.getElementById("orc-servico-nome").value = servico?.nome ?? "";
  gradeContainer.innerHTML = montarGradeMeses("orc-servico-mes", servico?.orcamento_projetado ?? {});
  titulo.textContent = servico ? `Editando: ${servico.nome}` : "Novo Serviço/Prestador";
  status.textContent = "";
  painel.hidden = false;
}

function esconderFormServico() {
  const painel = document.getElementById("orc-painel-servico");
  if (painel) painel.hidden = true;
  servicoEmEdicaoId = null;
}

async function recarregarServicos() {
  const container = document.getElementById("orc-lista-servicos");
  if (!container || !contaSelecionadaId) return;

  container.innerHTML = '<p class="preview-vazio">Carregando...</p>';
  const servicos = await listarServicosPorConta(contaSelecionadaId);

  const linhas = servicos
    .map((servico) => {
      const acumulado = Object.values(servico.orcamento_projetado ?? {}).reduce((a, b) => a + (b || 0), 0);
      return `
        <tr data-servico-id="${servico.id}">
          <td class="col-conta">${servico.nome}</td>
          <td class="numero-tabular">${formatadorRS.format(acumulado)}</td>
          <td><button type="button" class="botao-link" data-acao="editar-servico">Editar</button></td>
        </tr>`;
    })
    .join("");

  container.innerHTML = servicos.length
    ? `<div class="tabela-scroll"><table class="tabela-matriz">
        <thead><tr><th class="col-conta">Serviço/Prestador</th><th>Acum. Projetado</th><th></th></tr></thead>
        <tbody>${linhas}</tbody>
      </table></div>`
    : '<p class="preview-vazio">Nenhum Serviço cadastrado nesta conta ainda.</p>';

  container.querySelectorAll("[data-acao='editar-servico']").forEach((botao) => {
    botao.addEventListener("click", (evento) => {
      const servicoId = evento.target.closest("tr").dataset.servicoId;
      const servico = servicos.find((s) => s.id === servicoId);
      servicoEmEdicaoId = servicoId;
      mostrarFormServico(servico);
    });
  });
}
