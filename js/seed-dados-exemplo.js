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

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

// Valores de orçamento de exemplo — troque pelos reais quando cadastrar de verdade.
const orcamentoExemplo = { jan: 1000, fev: 1000, mar: 1000, abr: 1000, mai: 1000, jun: 1000, jul: 1000, ago: 1000, set: 1000, out: 1000, nov: 1000, dez: 1000 };

export async function popularDadosDeExemplo() {
  // Centro de Custo
  await setDoc(doc(db, "centros_custo", "cc-manutencao"), { nome: "Manutenção Predial" });

  // Conta Contábil (vinculada ao centro acima)
  await setDoc(doc(db, "contas_contabeis", "ct-elevadores"), {
    nome: "Elevadores",
    centro_custo_id: "cc-manutencao",
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

  return "Dados de exemplo criados: 1 Centro de Custo, 1 Conta Contábil, 2 Serviços.";
}
