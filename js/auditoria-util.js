// ============================================================
// auditoria-util.js
// Funções puras da trilha de auditoria (sem Firebase e sem tela), pra
// poderem ser testadas isoladamente. Quem grava o log é o firestore.js,
// dentro da MESMA transação/batch da alteração; quem mostra é o auditoria.js.
// ============================================================

const formatadorRS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Rótulos das ações gravadas no log, e o grupo de cada uma (usado no filtro da tela). */
export const ACOES = {
  "lancamento.criar": { rotulo: "Lançamento criado", grupo: "lancamento" },
  "lancamento.rateio.criar": { rotulo: "Rateio lançado", grupo: "lancamento" },
  "op.criar": { rotulo: "Ordem de Pagamento criada", grupo: "op" },
  "centro.criar": { rotulo: "Centro de Custo criado", grupo: "cadastro" },
  "centro.alterar": { rotulo: "Centro de Custo alterado", grupo: "cadastro" },
  "conta.criar": { rotulo: "Conta Contábil criada", grupo: "cadastro" },
  "conta.alterar": { rotulo: "Conta Contábil alterada", grupo: "cadastro" },
  "servico.criar": { rotulo: "Serviço criado", grupo: "cadastro" },
  "servico.alterar": { rotulo: "Serviço alterado", grupo: "cadastro" },
  "usuario.criar": { rotulo: "Usuário autorizado", grupo: "usuario" },
  "usuario.alterar": { rotulo: "Usuário alterado", grupo: "usuario" },
  "usuario.desativar": { rotulo: "Usuário desativado", grupo: "usuario" },
  "usuario.reativar": { rotulo: "Usuário reativado", grupo: "usuario" },
};

export const GRUPOS = {
  lancamento: "Lançamentos",
  op: "Ordens de Pagamento",
  cadastro: "Cadastro e orçamento",
  usuario: "Usuários e acessos",
};

export function rotuloAcao(acao) {
  return ACOES[acao]?.rotulo ?? acao;
}
export function grupoDaAcao(acao) {
  return ACOES[acao]?.grupo ?? "outros";
}

const ROTULOS_CAMPO = {
  nome: "Nome",
  conta_codigo: "Código da conta",
  tipo_gestao: "Gestão",
  orcamento_aprovado: "Orçamento aprovado",
  orcamento_projetado: "Orçamento projetado",
  papel: "Papel",
  ativo: "Ativo",
};

/** "orcamento_aprovado.mar" -> "Orçamento aprovado · mar". */
export function rotuloCampo(campo) {
  const [raiz, ...resto] = String(campo).split(".");
  const base = ROTULOS_CAMPO[raiz] ?? raiz;
  return resto.length ? `${base} · ${resto.join(".")}` : base;
}

/** Valor legível: dinheiro nos orçamentos, Sim/Não em booleanos, "—" em vazio. */
export function formatarValorAuditoria(campo, valor) {
  if (valor === null || valor === undefined || valor === "") return "—";
  if (typeof valor === "boolean") return valor ? "Sim" : "Não";
  if (typeof valor === "number" && String(campo).startsWith("orcamento")) return formatadorRS.format(valor);
  return String(valor);
}

/** Date / Timestamp do Firestore / string -> "yyyy-mm-dd" (ou null). */
export function dataIso(valor) {
  if (!valor) return null;
  const data = typeof valor.toDate === "function" ? valor.toDate() : new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data.toISOString().slice(0, 10);
}

/** Tira undefined (o Firestore recusa) e troca datas por texto — o log guarda só o que se lê. */
export function limparParaLog(objeto) {
  const saida = {};
  for (const [chave, valor] of Object.entries(objeto ?? {})) {
    if (valor === undefined) continue;
    const ehData = valor instanceof Date || (valor !== null && typeof valor === "object" && typeof valor.toDate === "function");
    saida[chave] = ehData ? dataIso(valor) : valor;
  }
  return saida;
}

function achatar(objeto, prefixo = "", saida = {}) {
  for (const [chave, valor] of Object.entries(objeto ?? {})) {
    const caminho = prefixo ? `${prefixo}.${chave}` : chave;
    const ehMapa = valor !== null && typeof valor === "object" && !Array.isArray(valor) && typeof valor.toDate !== "function";
    if (ehMapa) achatar(valor, caminho, saida);
    else saida[caminho] = valor === undefined ? null : valor;
  }
  return saida;
}

/**
 * O que mudou entre o documento atual (`antes`) e o que vai ser gravado
 * (`depois`). Só olha as chaves de `depois`, que é o que o update mexe.
 * Mapas (orcamento_aprovado) são comparados mês a mês: "orcamento_aprovado.mar".
 * @returns {Array<{campo:string, antes:any, depois:any}>}
 */
export function diferencas(antes, depois) {
  const a = achatar(antes);
  const d = achatar(depois);
  return Object.keys(d)
    .filter((campo) => JSON.stringify(a[campo] ?? null) !== JSON.stringify(d[campo] ?? null))
    .map((campo) => ({ campo, antes: a[campo] ?? null, depois: d[campo] ?? null }));
}

/** "Orçamento aprovado (mar, abr); Nome" — usado no resumo do log. */
export function resumirAlteracoes(alteracoes) {
  const grupos = new Map();
  alteracoes.forEach(({ campo }) => {
    const [raiz, ...resto] = campo.split(".");
    if (!grupos.has(raiz)) grupos.set(raiz, []);
    if (resto.length) grupos.get(raiz).push(resto.join("."));
  });
  return [...grupos]
    .map(([raiz, subs]) => {
      const nome = ROTULOS_CAMPO[raiz] ?? raiz;
      return subs.length ? `${nome} (${subs.join(", ")})` : nome;
    })
    .join("; ");
}

export function formatarReais(valor) {
  return formatadorRS.format(valor ?? 0);
}
