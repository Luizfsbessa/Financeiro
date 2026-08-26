// ============================================================
// integracoes.js
// Integração com sistemas externos usados no fluxo de lançamento.
// Hoje só o Movidesk (o ticket/protocolo é aberto lá antes de vir
// pro Bills) — centralizado aqui pra trocar a URL num único lugar
// se a plataforma mudar no futuro.
// ============================================================

const BASE_MOVIDESK = "https://frescattocompany.movidesk.com/Ticket/EditByProtocol/";

/**
 * Monta o link direto pro ticket do Movidesk a partir do protocolo.
 * Retorna null se o protocolo estiver vazio (nada pra linkar ainda).
 */
export function montarLinkMovidesk(protocolo) {
  const valor = String(protocolo ?? "").trim();
  if (!valor) return null;
  return BASE_MOVIDESK + encodeURIComponent(valor);
}
