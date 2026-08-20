// ============================================================
// importar-orcamento.js
// Grava em lote (writeBatch) os Centros de Custo e Contas Contábeis
// extraídos da planilha real, com o Orçamento Aprovado já calculado
// mês a mês. Idempotente: usa IDs fixos (baseados no nome do centro
// e no código da conta), então rodar de novo só atualiza os mesmos
// documentos — não duplica nada.
// ============================================================

import { doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { CENTROS_IMPORTADOS, CONTAS_IMPORTADAS } from "./dados-orcamento-importado.js";

export async function importarOrcamentoDaPlanilha() {
  const lote = writeBatch(db);

  CENTROS_IMPORTADOS.forEach((centro) => {
    const ref = doc(db, "centros_custo", centro.id);
    lote.set(ref, { nome: centro.nome });
  });

  CONTAS_IMPORTADAS.forEach((conta) => {
    const ref = doc(db, "contas_contabeis", conta.id);
    lote.set(ref, {
      nome: conta.nome,
      conta_codigo: conta.conta_codigo,
      centro_custo_id: conta.centro_custo_id,
      orcamento_aprovado: conta.orcamento_aprovado,
    });
  });

  await lote.commit();

  return `Importado: ${CENTROS_IMPORTADOS.length} Centros de Custo e ${CONTAS_IMPORTADAS.length} Contas Contábeis (com Orçamento Aprovado). Falta cadastrar os Serviços/Prestadores dentro de cada conta — a planilha não tinha esse nível de detalhe.`;
}
