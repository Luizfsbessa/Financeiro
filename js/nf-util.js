// ============================================================
// nf-util.js
// Comparação de números de NF e texto do aviso de NF duplicada.
// Funções puras (sem Firebase e sem tela).
// ============================================================

const formatadorRS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatadorData = new Intl.DateTimeFormat("pt-BR");

/**
 * "0123", "123", "526.811.187" e "526811187" viram a mesma coisa:
 * minúsculas, só letras e números, sem zeros à esquerda. É a forma de achar
 * a nota digitada duas vezes com pequenas diferenças.
 */
export function normalizarNf(valor) {
  return String(valor ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/^0+(?=.)/, "");
}

function paraData(valor) {
  if (!valor) return null;
  const data = typeof valor.toDate === "function" ? valor.toDate() : new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

function descrever(l, incluirServico) {
  const data = paraData(l.data_emissao);
  const partes = [data ? formatadorData.format(data) : "sem data"];
  if (incluirServico && l.servico_nome) partes.push(l.servico_nome);
  partes.push(formatadorRS.format(l.valor_nf ?? 0));
  partes.push(`por ${l.usuario_nome || l.usuario_email || "—"}`);
  if (l.protocolo_movidesk) partes.push(`Protocolo ${l.protocolo_movidesk}`);
  return "• " + partes.join(" — ");
}

/**
 * Texto do aviso. `existentes` são lançamentos que já usam a mesma NF no(s)
 * mesmo(s) Serviço(s). Mostra até 3, do mais recente pro mais antigo.
 * Com { rateio: true }, mostra também o serviço de cada um (cada fatia tem o seu).
 */
export function montarAvisoDuplicidade(nf, existentes, { rateio = false } = {}) {
  const ordenados = [...existentes].sort((a, b) => (paraData(b.data_emissao)?.getTime() ?? 0) - (paraData(a.data_emissao)?.getTime() ?? 0));
  const linhas = ordenados.slice(0, 3).map((l) => descrever(l, rateio));
  if (ordenados.length > 3) linhas.push(`• e mais ${ordenados.length - 3}`);

  const abertura = rateio
    ? `A NF ${nf} já tem lançamento em ${existentes.length} fatia(s) deste rateio:`
    : `A NF ${nf} já foi lançada neste Serviço:`;
  return `${abertura}\n${linhas.join("\n")}`;
}

/** Texto do pedido de confirmação ao salvar. */
export function montarConfirmacaoDuplicidade(nf, existentes, opcoes) {
  return `${montarAvisoDuplicidade(nf, existentes, opcoes)}\n\nPode ser a mesma nota lançada duas vezes. Salvar mesmo assim?`;
}
