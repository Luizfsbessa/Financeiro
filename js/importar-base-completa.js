// ============================================================
// importar-base-completa.js
// Importação DEFINITIVA — substitui importar-orcamento.js e
// importar-fornecedores.js (mantidos no repo só por histórico, não
// use mais). Grava, em lotes sequenciais de até 400 operações
// (limite do Firestore é 500 por writeBatch):
//   - Centros de Custo (própios + terceiros, campo tipo_gestao)
//   - Contas Contábeis (com Orçamento Aprovado onde disponível)
//   - Serviços/Prestadores (Orçamento Projetado nasce zerado)
//   - Ordens de Pagamento históricas
//   - 1.175 Lançamentos reais (2025/2026), com os campos calculados
//     (divergência, antecedência, política de pagamento) processados
//     pelo mesmo motor de regras usado no lançamento manual.
// ============================================================

import { doc, collection, writeBatch, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { processarLancamento } from "./conciliacao.js";
import {
  CENTROS_BASE,
  CONTAS_BASE,
  SERVICOS_BASE,
  ORDENS_BASE,
  LANCAMENTOS_BASE,
} from "./dados-base-completa-importado.js";

const TAMANHO_LOTE = 400; // margem de segurança abaixo do limite de 500 do Firestore

async function gravarEmLotes(operacoes) {
  for (let i = 0; i < operacoes.length; i += TAMANHO_LOTE) {
    const lote = writeBatch(db);
    operacoes.slice(i, i + TAMANHO_LOTE).forEach((montarOperacao) => montarOperacao(lote));
    await lote.commit();
  }
}

export async function importarBaseCompleta(onProgresso) {
  onProgresso?.("Gravando cadastros (Centros, Contas, Serviços, Ordens de Pagamento)...");

  const operacoesCadastro = [];

  CENTROS_BASE.forEach((centro) => {
    const ref = doc(db, "centros_custo", centro.id);
    operacoesCadastro.push((lote) =>
      lote.set(ref, { nome: centro.nome, tipo_gestao: centro.tipo_gestao, codigo_centro: centro.codigo_centro }, { merge: true })
    );
  });

  CONTAS_BASE.forEach((conta) => {
    const ref = doc(db, "contas_contabeis", conta.id);
    operacoesCadastro.push((lote) =>
      lote.set(
        ref,
        { nome: conta.nome, conta_codigo: conta.conta_codigo, centro_custo_id: conta.centro_custo_id, orcamento_aprovado: conta.orcamento_aprovado },
        { merge: true }
      )
    );
  });

  SERVICOS_BASE.forEach((servico) => {
    const ref = doc(db, "servicos", servico.id);
    operacoesCadastro.push((lote) =>
      lote.set(
        ref,
        { nome: servico.nome, cod_fornecedor: servico.cod_fornecedor, conta_contabil_id: servico.conta_contabil_id, orcamento_projetado: servico.orcamento_projetado },
        { merge: true }
      )
    );
  });

  ORDENS_BASE.forEach((op) => {
    const ref = doc(db, "ordens_pagamento", op.id);
    operacoesCadastro.push((lote) =>
      lote.set(
        ref,
        {
          numero_solicitacao: op.numero_solicitacao,
          numero_op: op.numero_op,
          centro_custo_id: op.centro_custo_id,
          conta_contabil_id: op.conta_contabil_id,
          saldo_total: op.saldo_total,
          saldo_disponivel: op.saldo_disponivel,
        },
        { merge: true }
      )
    );
  });

  await gravarEmLotes(operacoesCadastro);

  onProgresso?.(`Cadastros ok (${CENTROS_BASE.length} centros, ${CONTAS_BASE.length} contas, ${SERVICOS_BASE.length} serviços, ${ORDENS_BASE.length} OPs). Gravando ${LANCAMENTOS_BASE.length} lançamentos...`);

  const operacoesLancamentos = LANCAMENTOS_BASE.map((l) => {
    const ref = doc(collection(db, "lancamentos"));
    const dataEmissao = new Date(l.data_emissao);
    const dataVencimento = new Date(l.data_vencimento);
    const dataEntrada = new Date(l.data_lancamento);

    const calculado = processarLancamento({
      valorNF: l.valor_nf,
      orcamentoProjetado: 0, // ainda não existe Orçamento Projetado por Serviço nos dados reais
      dataEmissao,
      dataVencimento,
      dataEntrada,
    });

    return (lote) =>
      lote.set(ref, {
        usuario_email: "importacao@seed",
        usuario_nome: "Importação (histórico)",
        centro_custo_id: l.centro_custo_id,
        conta_contabil_id: l.conta_contabil_id,
        servico_id: l.servico_id,
        servico_nome: l.servico_nome,
        ordem_pagamento_id: l.ordem_pagamento_id,
        nf_numero: l.nf_numero,
        valor_nf: l.valor_nf,
        data_emissao: dataEmissao,
        data_vencimento: dataVencimento,
        observacao: "Importado do histórico — Orçamento Projetado do Serviço ainda não cadastrado.",
        ...calculado,
        criado_em: serverTimestamp(),
      });
  });

  await gravarEmLotes(operacoesLancamentos);

  return `Importação completa: ${CENTROS_BASE.length} Centros de Custo, ${CONTAS_BASE.length} Contas Contábeis, ${SERVICOS_BASE.length} Serviços, ${ORDENS_BASE.length} Ordens de Pagamento e ${LANCAMENTOS_BASE.length} Lançamentos históricos.`;
}
