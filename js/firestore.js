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

/**
 * Grava um lançamento já processado (com os campos calculados do
 * conciliacao.js) na coleção `lancamentos`.
 */
export async function registrarLancamento(dados) {
  const ref = await addDoc(collection(db, "lancamentos"), {
    ...dados,
    criado_em: serverTimestamp(),
  });
  return ref.id;
}
