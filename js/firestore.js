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
  getDoc,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  runTransaction,
  writeBatch,
  orderBy,
  limit,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db, auth } from "./firebase-config.js";
import { diferencas, resumirAlteracoes, limparParaLog, formatarReais } from "./auditoria-util.js";
import { normalizarNf } from "./nf-util.js";

// ============================================================
// Trilha de auditoria
//
// Cada alteração importante grava um documento em `logs_auditoria` NA MESMA
// transação/batch da alteração: não existe mudança sem log, nem log de uma
// mudança que falhou (saldo insuficiente, por exemplo, não deixa rastro).
// As Regras do Firestore carimbam o e-mail e a hora do servidor e proíbem
// editar ou apagar log. Limite honesto: quem gravar direto no banco, fora do
// app, não passa por aqui — a garantia total exigiria Cloud Functions.
// ============================================================

function montarLog({ acao, entidade, entidadeId, resumo, alteracoes = [], detalhes = {} }) {
  const usuario = auth.currentUser;
  return {
    usuario_email: (usuario?.email ?? "").toLowerCase(),
    usuario_nome: usuario?.displayName ?? "",
    data_hora: serverTimestamp(),
    acao,
    entidade,
    entidade_id: entidadeId ?? null,
    resumo,
    alteracoes: alteracoes.map(({ campo, antes, depois }) => ({ campo, antes: antes ?? null, depois: depois ?? null })),
    detalhes: limparParaLog(detalhes),
  };
}

function novoLogRef() {
  return doc(collection(db, "logs_auditoria"));
}

/** Cria um documento e o log da criação, juntos. */
async function criarComAuditoria({ colecao, dados, acao, resumo, detalhes = {} }) {
  const ref = doc(collection(db, colecao));
  const lote = writeBatch(db);
  lote.set(ref, dados);
  lote.set(novoLogRef(), montarLog({ acao, entidade: colecao, entidadeId: ref.id, resumo, detalhes }));
  await lote.commit();
  return ref.id;
}

/** Atualiza um documento e registra o que mudou (antes -> depois), numa transação. */
async function atualizarComAuditoria({ colecao, id, dados, acao, rotulo }) {
  const ref = doc(db, colecao, id);
  await runTransaction(db, async (transacao) => {
    const snap = await transacao.get(ref);
    const antes = snap.exists() ? snap.data() : {};
    const alteracoes = diferencas(antes, dados);
    transacao.update(ref, dados);
    if (alteracoes.length > 0) {
      transacao.set(
        novoLogRef(),
        montarLog({
          acao,
          entidade: colecao,
          entidadeId: id,
          resumo: `${rotulo} "${dados.nome ?? antes.nome ?? id}" — alterado: ${resumirAlteracoes(alteracoes)}`,
          alteracoes,
        })
      );
    }
  });
}

function somaDoAno(mapaMeses) {
  return Object.values(mapaMeses ?? {}).reduce((acc, v) => acc + (Number(v) || 0), 0);
}

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

/** Lista TODOS os Serviços (usado para exibir o fornecedor amarrado a cada OP). */
export async function listarTodosServicos() {
  const snap = await getDocs(collection(db, "servicos"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
  const ref = doc(collection(db, "ordens_pagamento"));
  const lote = writeBatch(db);
  lote.set(ref, { ...dados, saldo_disponivel: dados.saldo_total, criado_em: serverTimestamp() });
  lote.set(
    novoLogRef(),
    montarLog({
      acao: "op.criar",
      entidade: "ordens_pagamento",
      entidadeId: ref.id,
      resumo: `OP ${dados.numero_op} criada — saldo ${formatarReais(dados.saldo_total)}`,
      detalhes: {
        tipo: "normal",
        numero_solicitacao: dados.numero_solicitacao,
        numero_op: dados.numero_op,
        saldo_total: dados.saldo_total,
        centro_custo_id: dados.centro_custo_id,
        conta_contabil_id: dados.conta_contabil_id,
        servico_id: dados.servico_id,
      },
    })
  );
  await lote.commit();
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

    const numeroOP = opSnap.data().numero_op ?? ordemPagamentoId;
    transacao.set(
      novoLogRef(),
      montarLog({
        acao: "lancamento.criar",
        entidade: "lancamentos",
        entidadeId: lancamentoRef.id,
        resumo: `NF ${dadosLancamento.nf_numero || "s/n"} — ${dadosLancamento.servico_nome || "serviço"} — ${formatarReais(valor)} (OP ${numeroOP})`,
        detalhes: {
          nf_numero: dadosLancamento.nf_numero,
          valor_nf: valor,
          servico_nome: dadosLancamento.servico_nome,
          centro_custo_id: dadosLancamento.centro_custo_id,
          conta_contabil_id: dadosLancamento.conta_contabil_id,
          servico_id: dadosLancamento.servico_id,
          tipo_lancamento: dadosLancamento.tipo_lancamento,
          data_emissao: dadosLancamento.data_emissao,
          data_vencimento: dadosLancamento.data_vencimento,
          status_divergencia: dadosLancamento.status_divergencia,
          protocolo_movidesk: dadosLancamento.protocolo_movidesk,
          ordem_pagamento_id: ordemPagamentoId,
          numero_op: numeroOP,
          saldo_op_antes: saldoAtual,
          saldo_op_depois: saldoAtual - valor,
          duplicidade_confirmada: dadosLancamento.alerta_duplicidade_confirmado === true,
        },
      })
    );
  });

  return lancamentoRef.id;
}

/** Lista TODOS os lançamentos (usado pelo relatório de Divergências). */
export async function listarTodosLancamentos() {
  const snap = await getDocs(collection(db, "lancamentos"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Busca a Conta Contábil de um Centro específico que tenha um dado código (usado no rateio). */
export async function buscarContaPorCentroECodigo(centroCustoId, contaCodigo) {
  const q = query(
    collection(db, "contas_contabeis"),
    where("centro_custo_id", "==", centroCustoId),
    where("conta_codigo", "==", contaCodigo)
  );
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

/**
 * Cria uma Ordem de Pagamento do tipo "rateio" — NÃO amarrada a um único
 * Centro de Custo (diferente da OP normal). Fica vinculada só ao código
 * da Conta Contábil, que é o que se repete em todas as fatias do rateio.
 */
export async function criarOrdemPagamentoRateio({ numeroSolicitacao, numeroOP, contaCodigo, saldoTotal }) {
  return criarComAuditoria({
    colecao: "ordens_pagamento",
    dados: {
      numero_solicitacao: numeroSolicitacao,
      numero_op: numeroOP,
      conta_codigo: contaCodigo,
      tipo: "rateio",
      saldo_total: saldoTotal,
      saldo_disponivel: saldoTotal,
    },
    acao: "op.criar",
    resumo: `OP ${numeroOP} (rateio) criada — saldo ${formatarReais(saldoTotal)}`,
    detalhes: { tipo: "rateio", numero_solicitacao: numeroSolicitacao, numero_op: numeroOP, conta_codigo: contaCodigo, saldo_total: saldoTotal },
  });
}

/**
 * Lista Ordens de Pagamento do tipo "rateio" vinculadas a um código de
 * Conta Contábil. Busca por um único filtro de igualdade (tipo == "rateio",
 * sempre coberto por índice automático do Firestore, sem risco de precisar
 * de índice composto) e filtra o código no cliente — também blinda contra
 * espaço em branco ou diferença de maiúscula/minúscula na comparação.
 */
export async function listarOrdensPagamentoRateioPorCodigo(contaCodigo) {
  const alvo = String(contaCodigo).trim().toLowerCase();
  const q = query(collection(db, "ordens_pagamento"), where("tipo", "==", "rateio"));
  const snap = await getDocs(q);
  const todas = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log(`[firestore] OPs de rateio no total: ${todas.length}`, todas.map((o) => o.conta_codigo));
  return todas.filter((op) => String(op.conta_codigo ?? "").trim().toLowerCase() === alvo);
}

/**
 * Grava TODAS as linhas de um rateio (um lançamento por Centro de Custo) e
 * debita o saldo da Ordem de Pagamento UMA ÚNICA VEZ (soma de todas as
 * linhas) — tudo numa transação atômica só. Se o saldo não cobrir a soma,
 * nada é gravado. `linhas` já vem com os campos calculados (divergência,
 * antecedência etc.) de processarLancamento, um objeto por Centro de Custo.
 */
export async function registrarLancamentoRateado(linhas, ordemPagamentoId) {
  const opRef = doc(db, "ordens_pagamento", ordemPagamentoId);
  const rateioGrupoId = doc(collection(db, "lancamentos")).id; // gera um ID só pra agrupar, sem gravar nada

  await runTransaction(db, async (transacao) => {
    const opSnap = await transacao.get(opRef);
    if (!opSnap.exists()) {
      throw new Error("Ordem de Pagamento não encontrada — pode ter sido removida.");
    }

    const saldoAtual = opSnap.data().saldo_disponivel ?? 0;
    const somaTotal = linhas.reduce((acc, l) => acc + l.valor_nf, 0);

    if (somaTotal > saldoAtual) {
      throw new Error(
        `Saldo insuficiente na Ordem de Pagamento (disponível: ${saldoAtual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}, necessário: ${somaTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}).`
      );
    }

    linhas.forEach((linha) => {
      const ref = doc(collection(db, "lancamentos"));
      transacao.set(ref, {
        ...linha,
        ordem_pagamento_id: ordemPagamentoId,
        rateio_grupo_id: rateioGrupoId,
        criado_em: serverTimestamp(),
      });
    });

    transacao.update(opRef, { saldo_disponivel: saldoAtual - somaTotal });

    const numeroOP = opSnap.data().numero_op ?? ordemPagamentoId;
    transacao.set(
      novoLogRef(),
      montarLog({
        acao: "lancamento.rateio.criar",
        entidade: "lancamentos",
        entidadeId: rateioGrupoId,
        resumo: `Rateio da NF ${linhas[0]?.nf_numero || "s/n"} — ${linhas.length} fatias — ${formatarReais(somaTotal)} (OP ${numeroOP})`,
        detalhes: {
          nf_numero: linhas[0]?.nf_numero,
          valor_total: somaTotal,
          fatias: linhas.length,
          centros_ids: linhas.map((l) => l.centro_custo_id).join(", "),
          protocolo_movidesk: linhas[0]?.protocolo_movidesk,
          rateio_grupo_id: rateioGrupoId,
          ordem_pagamento_id: ordemPagamentoId,
          numero_op: numeroOP,
          saldo_op_antes: saldoAtual,
          saldo_op_depois: saldoAtual - somaTotal,
          duplicidade_confirmada: linhas.some((l) => l.alerta_duplicidade_confirmado === true),
        },
      })
    );
  });

  return rateioGrupoId;
}

// ============================================================
// Cadastro — Centro de Custo, Conta Contábil, Serviço
// (usado pela tela "Orçamento & Contas", que substitui a
// necessidade de cadastrar isso via seed.html/console do Firebase)
// ============================================================

/** Cria um novo Centro de Custo. tipoGestao: "proprio" | "terceiros". */
export async function criarCentroCusto({ nome, tipoGestao }) {
  const nomeLimpo = nome.trim();
  return criarComAuditoria({
    colecao: "centros_custo",
    dados: { nome: nomeLimpo, tipo_gestao: tipoGestao },
    acao: "centro.criar",
    resumo: `Centro de Custo "${nomeLimpo}" criado (${tipoGestao === "terceiros" ? "terceiros" : "próprio"})`,
    detalhes: { nome: nomeLimpo, tipo_gestao: tipoGestao },
  });
}

/** Atualiza campos de um Centro de Custo existente. */
export async function atualizarCentroCusto(id, dados) {
  await atualizarComAuditoria({ colecao: "centros_custo", id, dados, acao: "centro.alterar", rotulo: "Centro de Custo" });
}

/**
 * Cria uma nova Conta Contábil sob um Centro de Custo, com o
 * Orçamento Aprovado já preenchido (objeto {jan..dez}).
 */
export async function criarContaContabil({ nome, contaCodigo, centroCustoId, orcamentoAprovado }) {
  const nomeLimpo = nome.trim();
  const codigo = contaCodigo?.trim() || null;
  return criarComAuditoria({
    colecao: "contas_contabeis",
    dados: { nome: nomeLimpo, conta_codigo: codigo, centro_custo_id: centroCustoId, orcamento_aprovado: orcamentoAprovado },
    acao: "conta.criar",
    resumo: `Conta Contábil "${nomeLimpo}" criada (código ${codigo ?? "—"}) — aprovado no ano: ${formatarReais(somaDoAno(orcamentoAprovado))}`,
    detalhes: { nome: nomeLimpo, conta_codigo: codigo, centro_custo_id: centroCustoId, orcamento_aprovado_ano: somaDoAno(orcamentoAprovado) },
  });
}

/** Atualiza nome/código/orçamento aprovado de uma Conta Contábil existente. */
export async function atualizarContaContabil(id, dados) {
  await atualizarComAuditoria({ colecao: "contas_contabeis", id, dados, acao: "conta.alterar", rotulo: "Conta Contábil" });
}

/**
 * Cria um novo Serviço/Prestador sob uma Conta Contábil, com o
 * Orçamento Projetado já preenchido (objeto {jan..dez}).
 */
export async function criarServico({ nome, contaContabilId, orcamentoProjetado }) {
  const nomeLimpo = nome.trim();
  return criarComAuditoria({
    colecao: "servicos",
    dados: { nome: nomeLimpo, conta_contabil_id: contaContabilId, orcamento_projetado: orcamentoProjetado },
    acao: "servico.criar",
    resumo: `Serviço "${nomeLimpo}" criado — projetado no ano: ${formatarReais(somaDoAno(orcamentoProjetado))}`,
    detalhes: { nome: nomeLimpo, conta_contabil_id: contaContabilId, orcamento_projetado_ano: somaDoAno(orcamentoProjetado) },
  });
}

/** Atualiza nome/orçamento projetado de um Serviço existente. */
export async function atualizarServico(id, dados) {
  await atualizarComAuditoria({ colecao: "servicos", id, dados, acao: "servico.alterar", rotulo: "Serviço" });
}

// ============================================================
// Controle de Acesso — usuários autorizados e papéis
//
// O e-mail (normalizado em minúsculas) é o próprio ID do documento —
// isso permite cadastrar alguém ANTES de essa pessoa nunca ter logado
// (não dependemos do UID, que só existe depois do primeiro login), e
// permite que as Regras do Firestore façam a checagem de autorização
// com um único get() direto pelo e-mail do token, sem precisar de
// Cloud Functions nem custom claims.
// ============================================================

function normalizarEmail(email) {
  return email.trim().toLowerCase();
}

/** Lista todos os usuários autorizados (a leitura da coleção inteira exige papel Administrador, pelas regras). */
export async function listarUsuariosAutorizados() {
  const snap = await getDocs(collection(db, "usuarios_autorizados"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Verifica se um e-mail está autorizado e ativo, devolvendo o papel
 * ("administrador" | "financeiro" | "leitura") ou null se não autorizado.
 * Qualquer usuário logado pode ler o PRÓPRIO registro (mesmo antes de
 * estar autorizado) — é assim que o app decide se deixa a pessoa entrar.
 */
export async function verificarUsuarioAutorizado(email) {
  const emailNormalizado = normalizarEmail(email);
  const snap = await getDoc(doc(db, "usuarios_autorizados", emailNormalizado));
  if (!snap.exists() || snap.data().ativo !== true) return null;
  const papel = snap.data().papel;
  return papel ? String(papel).trim().toLowerCase() : null;
}

/** Cria ou atualiza um usuário autorizado — só quem já é Administrador consegue (pelas regras). */
export async function salvarUsuarioAutorizado({ email, nome, papel, ativo }) {
  const emailNormalizado = normalizarEmail(email);
  const ref = doc(db, "usuarios_autorizados", emailNormalizado);
  const novo = { email: emailNormalizado, nome: nome?.trim() || "", papel: String(papel).trim().toLowerCase(), ativo };

  await runTransaction(db, async (transacao) => {
    const snap = await transacao.get(ref);
    const existia = snap.exists();
    const antes = existia ? snap.data() : {};
    const alteracoes = existia ? diferencas(antes, novo) : [];

    transacao.set(ref, novo, { merge: true });
    if (existia && alteracoes.length === 0) return; // nada mudou: sem log

    let acao;
    let resumo;
    if (!existia) {
      acao = "usuario.criar";
      resumo = `${emailNormalizado} autorizado como ${novo.papel}`;
    } else if (antes.ativo === true && novo.ativo === false) {
      acao = "usuario.desativar";
      resumo = `Acesso de ${emailNormalizado} desativado`;
    } else if (antes.ativo === false && novo.ativo === true) {
      acao = "usuario.reativar";
      resumo = `Acesso de ${emailNormalizado} reativado`;
    } else {
      acao = "usuario.alterar";
      resumo = `${emailNormalizado}: ${resumirAlteracoes(alteracoes)}`;
    }

    transacao.set(
      novoLogRef(),
      montarLog({
        acao,
        entidade: "usuarios_autorizados",
        entidadeId: emailNormalizado,
        resumo,
        alteracoes,
        detalhes: existia ? {} : { papel: novo.papel, nome: novo.nome },
      })
    );
  });
  return emailNormalizado;
}

/** Últimos registros da trilha de auditoria (mais recentes primeiro). Só Administrador lê, pelas regras. */
export async function listarLogsAuditoria(limite = 500) {
  const q = query(collection(db, "logs_auditoria"), orderBy("data_hora", "desc"), limit(limite));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Lançamentos que já usam esta NF neste Serviço — base do alerta de NF
 * duplicada. Busca os lançamentos do Serviço (uma única igualdade, sempre
 * coberta por índice automático) e compara o número da NF já normalizado:
 * "0123", "123" e "526.811.187"/"526811187" contam como a mesma nota.
 */
export async function listarLancamentosPorNf(nfNumero, servicoId) {
  const alvo = normalizarNf(nfNumero);
  if (!alvo || !servicoId) return [];
  const snap = await getDocs(query(collection(db, "lancamentos"), where("servico_id", "==", servicoId)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((l) => normalizarNf(l.nf_numero) === alvo);
}
