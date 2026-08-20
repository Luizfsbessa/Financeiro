// ============================================================
// seed-dados-exemplo.js
// Script de USO ÚNICO para popular Centros de Custo, Contas
// Contábeis e Serviços de exemplo — só para você conseguir testar
// a tela de lançamento sem precisar cadastrar tudo manualmente
// no console do Firebase. Rode uma vez, depois pode apagar.
//
// Acesse ./seed.html já logado e clique no botão. Os IDs são fixos
// (setDoc, não addDoc) então rodar duas vezes só sobrescreve os
// mesmos documentos — não duplica nada.
// ============================================================

import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

// Valores de orçamento de exemplo — troque pelos reais quando cadastrar de verdade.
const orcamentoExemplo = { jan: 1000, fev: 1000, mar: 1000, abr: 1000, mai: 1000, jun: 1000, jul: 1000, ago: 1000, set: 1000, out: 1000, nov: 1000, dez: 1000 };

// Orçamento Aprovado de exemplo — no nível da Conta Contábil (regra de negócio:
// o corte do Aprovado é na SOMATÓRIA da conta, não por serviço).
const aprovadoExemplo = { jan: 1400, fev: 1400, mar: 1400, abr: 1400, mai: 1400, jun: 1400, jul: 1400, ago: 1400, set: 1400, out: 1400, nov: 1400, dez: 1400 };

export async function popularDadosDeExemplo() {
  // Centro de Custo
  await setDoc(doc(db, "centros_custo", "cc-manutencao"), { nome: "Manutenção Predial" });

  // Conta Contábil (vinculada ao centro acima)
  await setDoc(doc(db, "contas_contabeis", "ct-elevadores"), {
    nome: "Elevadores",
    centro_custo_id: "cc-manutencao",
    orcamento_aprovado: aprovadoExemplo,
  });

  // Serviços (vinculados à conta acima)
  await setDoc(doc(db, "servicos", "sv-manutencao-mensal"), {
    nome: "Manutenção mensal — Otis",
    conta_contabil_id: "ct-elevadores",
    orcamento_projetado: orcamentoExemplo,
  });

  await setDoc(doc(db, "servicos", "sv-peca-avulsa"), {
    nome: "Peças avulsas",
    conta_contabil_id: "ct-elevadores",
    orcamento_projetado: { ...orcamentoExemplo, jan: 500, fev: 500, mar: 500 },
  });

  // Ordem de Pagamento de exemplo — vinculada à Conta Contábil acima.
  // Só cria se ainda não existir: rodar o seed de novo NÃO deve resetar o
  // saldo_disponivel de uma OP que você já usou em testes de lançamento.
  const opRef = doc(db, "ordens_pagamento", "op-exemplo-0001");
  const opSnap = await getDoc(opRef);
  if (!opSnap.exists()) {
    await setDoc(opRef, {
      numero_solicitacao: "SOL-0001",
      numero_op: "OP-0001",
      centro_custo_id: "cc-manutencao",
      conta_contabil_id: "ct-elevadores",
      saldo_total: 5000,
      saldo_disponivel: 5000,
    });
  }

  return "Dados de exemplo criados/atualizados: Centro de Custo, Conta Contábil, Serviços e Ordem de Pagamento (se ainda não existia).";
}
