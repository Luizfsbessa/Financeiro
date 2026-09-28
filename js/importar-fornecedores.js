// ============================================================
// importar-fornecedores.js
// Grava em lote os Centros de Custo (próprios + terceiros), Contas
// Contábeis e Serviços extraídos da planilha de fornecedores.
//
// CUIDADO especial: os 11 Centros de Custo "próprios" e suas Contas
// Contábeis JÁ EXISTEM (vieram da importação de orçamento) e já têm
// Orçamento Aprovado preenchido. Esta importação usa { merge: true }
// nesses casos para SOMAR campos novos (tipo_gestao, codigo_centro)
// sem apagar o orcamento_aprovado que já estava lá. Os Centros de
// Custo de terceiros e suas Contas são inteiramente novos.
// ============================================================

import { doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { CENTROS_FORNECEDORES, CONTAS_FORNECEDORES, SERVICOS_FORNECEDORES } from "./dados-fornecedores-importado.js";

export async function importarFornecedoresDaPlanilha() {
  // Firestore permite no máximo 500 operações por lote — 11 + 23 + 66 + 120
  // = 220, cabe tranquilo num único writeBatch.
  const lote = writeBatch(db);

  CENTROS_FORNECEDORES.forEach((centro) => {
    const ref = doc(db, "centros_custo", centro.id);
    lote.set(
      ref,
      { nome: centro.nome, tipo_gestao: centro.tipo_gestao, codigo_centro: centro.codigo_centro },
      { merge: true } // preserva outros campos se o centro já existir
    );
  });

  CONTAS_FORNECEDORES.forEach((conta) => {
    const ref = doc(db, "contas_contabeis", conta.id);
    lote.set(
      ref,
      { nome: conta.nome, conta_codigo: conta.conta_codigo, centro_custo_id: conta.centro_custo_id },
      { merge: true } // NÃO inclui orcamento_aprovado — preserva o que já existir
    );
  });

  SERVICOS_FORNECEDORES.forEach((servico) => {
    const ref = doc(db, "servicos", servico.id);
    lote.set(
      ref,
      {
        nome: servico.nome,
        conta_contabil_id: servico.conta_contabil_id,
        orcamento_projetado: servico.orcamento_projetado,
      },
      { merge: true }
    );
  });

  await lote.commit();

  const proprios = CENTROS_FORNECEDORES.filter((c) => c.tipo_gestao === "proprio").length;
  const terceiros = CENTROS_FORNECEDORES.filter((c) => c.tipo_gestao === "terceiros").length;

  return `Importado: ${CENTROS_FORNECEDORES.length} Centros de Custo (${proprios} próprios + ${terceiros} terceiros), ${CONTAS_FORNECEDORES.length} Contas Contábeis, ${SERVICOS_FORNECEDORES.length} Serviços/Prestadores. Orçamento Projetado desses serviços nasceu zerado — precisa ser preenchido.`;
}
