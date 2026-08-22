// ============================================================
// firestore.js
// Toda a leitura/escrita no Firestore passa por aqui — nenhum outro
// módulo importa "firebase-firestore" diretamente. Isso mantém as
// coleções e o formato dos documentos num único lugar para manter.
// ============================================================

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  runTransaction,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

const NOMES_MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** Lista todos os Centros de Custo cadastrados. */
export async function listarCentrosCusto() {
  const snap = await getDocs(collection(db, "centros_custo"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Lista as Contas Contábeis de um Centro de Custo específico. */
export async function listarContasPorCentro(centroCustoId) {
  const q = query(collection(db, "contas_contabeis"), where("centro_custo_id", "==", centroCustoId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Lista os Serviços/Prestadores de uma Conta Contábil específica. */
export async function listarServicosPorConta(contaContabilId) {
  const q = query(collection(db, "servicos"), where("conta_contabil_id", "==", contaContabilId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Retorna o Orçamento Projetado de um serviço para um mês (1–12).
 * Espera que o documento do serviço tenha um mapa `orcamento_projetado`
 * com chaves "jan".."dez" (mesmo padrão da aba Cadastros_E_Orcamento).
 */
export function orcamentoProjetadoDoMes(servico, mesNumero) {
  if (!servico?.orcamento_projetado) return 0;
  const chave = NOMES_MES[mesNumero - 1];
  return servico.orcamento_projetado[chave] ?? 0;
}

/** Lista TODAS as Contas Contábeis (todas os centros), usado para montar o dashboard inteiro. */
export async function listarTodasContas() {
  const snap = await getDocs(collection(db, "contas_contabeis"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Lista todos os lançamentos de uma Conta Contábil (para agregação mensal no dashboard). */
export async function listarLancamentosPorConta(contaContabilId) {
  const q = query(collection(db, "lancamentos"), where("conta_contabil_id", "==", contaContabilId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
/**
 * Grava um lançamento já processado (com os campos calculados do
 * conciliacao.js) na coleção `lancamentos`.
 * @deprecated desde a introdução de Ordens de Pagamento, use
 * registrarLancamentoComOP — mantida apenas por compatibilidade.
 */
export async function registrarLancamento(dados) {
  const ref = await addDoc(collection(db, "lancamentos"), {
    ...dados,
    criado_em: serverTimestamp(),
  });
  return ref.id;
}

// ============================================================
// Ordens de Pagamento
//
// O lançamento de uma NF só existe amarrado a uma Ordem de Pagamento (OP)
// — a OP é solicitada em outro sistema e tem um saldo próprio, vinculado a
// um Centro de Custo + Conta Contábil. Cada lançamento consome parte desse
// saldo. Como duas pessoas podem lançar ao mesmo tempo contra a mesma OP,
// a gravação do lançamento + o débito do saldo acontecem numa ÚNICA
// transação atômica (registrarLancamentoComOP), evitando saldo negativo
// por condição de corrida.
// ============================================================

/** Lista todas as Ordens de Pagamento cadastradas. */
export async function listarOrdensPagamento() {
  const snap = await getDocs(collection(db, "ordens_pagamento"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Lista as Ordens de Pagamento vinculadas a uma Conta Contábil específica. */
export async function listarOrdensPagamentoPorConta(contaContabilId) {
  const q = query(collection(db, "ordens_pagamento"), where("conta_contabil_id", "==", contaContabilId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Cria uma nova Ordem de Pagamento — o saldo disponível nasce igual ao saldo total. */
export async function criarOrdemPagamento(dados) {
  const ref = await addDoc(collection(db, "ordens_pagamento"), {
    ...dados,
    saldo_disponivel: dados.saldo_total,
    criado_em: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Grava um lançamento E debita o valor do saldo da Ordem de Pagamento
 * escolhida, numa única transação. Se o saldo disponível no momento da
 * transação for menor que o valor da NF, a operação inteira é abortada
 * (nada é gravado) e um erro é lançado com a mensagem para o usuário.
 */
export async function registrarLancamentoComOP(dadosLancamento, ordemPagamentoId) {
  const lancamentoRef = doc(collection(db, "lancamentos"));
  const opRef = doc(db, "ordens_pagamento", ordemPagamentoId);

  await runTransaction(db, async (transacao) => {
    const opSnap = await transacao.get(opRef);
    if (!opSnap.exists()) {
      throw new Error("Ordem de Pagamento não encontrada — pode ter sido removida.");
    }

    const saldoAtual = opSnap.data().saldo_disponivel ?? 0;
    const valor = dadosLancamento.valor_nf;

    if (valor > saldoAtual) {
      throw new Error(
        `Saldo insuficiente nessa Ordem de Pagamento (disponível: ${saldoAtual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}).`
      );
    }

    transacao.set(lancamentoRef, {
      ...dadosLancamento,
      ordem_pagamento_id: ordemPagamentoId,
      criado_em: serverTimestamp(),
    });

    transacao.update(opRef, { saldo_disponivel: saldoAtual - valor });
  });

  return lancamentoRef.id;
}

/** Lista TODOS os lançamentos (usado pelo relatório de Divergências). */
export async function listarTodosLancamentos() {
  const snap = await getDocs(collection(db, "lancamentos"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ============================================================
// Cadastro — Centro de Custo, Conta Contábil, Serviço
// (usado pela tela "Orçamento & Contas", que substitui a
// necessidade de cadastrar isso via seed.html/console do Firebase)
// ============================================================

/** Cria um novo Centro de Custo. tipoGestao: "proprio" | "terceiros". */
export async function criarCentroCusto({ nome, tipoGestao }) {
  const ref = await addDoc(collection(db, "centros_custo"), {
    nome: nome.trim(),
    tipo_gestao: tipoGestao,
  });
  return ref.id;
}

/** Atualiza campos de um Centro de Custo existente. */
export async function atualizarCentroCusto(id, dados) {
  await updateDoc(doc(db, "centros_custo", id), dados);
}

/**
 * Cria uma nova Conta Contábil sob um Centro de Custo, com o
 * Orçamento Aprovado já preenchido (objeto {jan..dez}).
 */
export async function criarContaContabil({ nome, contaCodigo, centroCustoId, orcamentoAprovado }) {
  const ref = await addDoc(collection(db, "contas_contabeis"), {
    nome: nome.trim(),
    conta_codigo: contaCodigo?.trim() || null,
    centro_custo_id: centroCustoId,
    orcamento_aprovado: orcamentoAprovado,
  });
  return ref.id;
}

/** Atualiza nome/código/orçamento aprovado de uma Conta Contábil existente. */
export async function atualizarContaContabil(id, dados) {
  await updateDoc(doc(db, "contas_contabeis", id), dados);
}

/**
 * Cria um novo Serviço/Prestador sob uma Conta Contábil, com o
 * Orçamento Projetado já preenchido (objeto {jan..dez}).
 */
export async function criarServico({ nome, contaContabilId, orcamentoProjetado }) {
  const ref = await addDoc(collection(db, "servicos"), {
    nome: nome.trim(),
    conta_contabil_id: contaContabilId,
    orcamento_projetado: orcamentoProjetado,
  });
  return ref.id;
}

/** Atualiza nome/orçamento projetado de um Serviço existente. */
export async function atualizarServico(id, dados) {
  await updateDoc(doc(db, "servicos", id), dados);
}
