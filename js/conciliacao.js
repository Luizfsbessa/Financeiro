// ============================================================
// conciliacao.js
// Motor de regras de negócio — portado das fórmulas do Google Sheets
// que desenhamos antes. Funções puras (sem dependência de DOM ou
// Firebase), fáceis de testar isoladamente.
// ============================================================

/** Retorna o mês (1–12) de uma data. */
export function mesReferencia(data) {
  return data.getMonth() + 1;
}

/**
 * Regra 2.1 — Verificação de Divergência Orçamentária.
 * Compara o valor da NF com o orçamento projetado do mês/serviço.
 */
export function calcularDivergencia(valorNF, orcamentoProjetado) {
  const divergenciaRS = valorNF > orcamentoProjetado ? valorNF - orcamentoProjetado : 0;
  const divergenciaPct =
    orcamentoProjetado > 0 && valorNF > orcamentoProjetado
      ? divergenciaRS / orcamentoProjetado
      : 0;
  const status = valorNF > orcamentoProjetado ? "COM_DIVERGENCIA" : "OK";

  return { divergenciaRS, divergenciaPct, status };
}

/**
 * Data limite para o lançamento ser feito com a antecedência mínima exigida
 * pela política (Data Sugerida de Pagamento − 10 dias corridos). Puramente
 * informativo — o status de alerta em si já vem de calcularAntecedencia.
 */
export function calcularDataLimiteLancamento(dataSugeridaPagamento) {
  const limite = new Date(dataSugeridaPagamento);
  limite.setDate(limite.getDate() - 10);
  return limite;
}

/**
 * Regra 2.2 — Verificação de Antecedência (< 10 dias).
 *
 * Função genérica: mede quantos dias faltam entre a Data de Entrada
 * (lançamento) e uma Data de Referência qualquer, sinalizando alerta se
 * faltarem menos de 10 dias. É reutilizada para duas métricas DISTINTAS
 * e propositalmente independentes (ver processarLancamento):
 *   - Antecedência até a Política de Pagamento (referência = data sugerida pela política)
 *   - Tempo Hábil até o Vencimento Real (referência = vencimento informado na NF)
 * Elas não são combinadas entre si — o vencimento real pode não bater com
 * o que a política sugeriria, e isso é esperado, não um erro.
 */
export function calcularAntecedencia(dataEntrada, dataReferencia) {
  const umDiaMs = 24 * 60 * 60 * 1000;
  const diasAntecedencia = Math.round(
    (new Date(dataReferencia).setHours(0, 0, 0, 0) - new Date(dataEntrada).setHours(0, 0, 0, 0)) / umDiaMs
  );
  const status = diasAntecedencia < 10 ? "ALERTA_MENOS_10_DIAS" : "OK";

  return { diasAntecedencia, status };
}

/** true se a data cai em sábado (6) ou domingo (0). */
function ehFimDeSemana(data) {
  const diaSemana = data.getDay();
  return diaSemana === 0 || diaSemana === 6;
}

/** Avança a data até o próximo dia útil, pulando sábado/domingo e feriados informados. */
function ajustarParaDiaUtil(data, feriadosISO = []) {
  const feriados = new Set(feriadosISO);
  const resultado = new Date(data);

  const formatarISO = (d) => d.toISOString().slice(0, 10);

  while (ehFimDeSemana(resultado) || feriados.has(formatarISO(resultado))) {
    resultado.setDate(resultado.getDate() + 1);
  }
  return resultado;
}

/**
 * Regra 2.3 — Matriz de Política de Pagamento.
 * Emissão 01–10  → pagamento dia 30 do mesmo mês
 * Emissão 11–20  → pagamento dia 10 do mês seguinte
 * Emissão 21–31  → pagamento dia 20 do mês seguinte
 * Se cair em fim de semana/feriado, avança para o próximo dia útil.
 *
 * @param {Date} dataEmissao
 * @param {string[]} feriadosISO - lista de feriados no formato "AAAA-MM-DD" (opcional)
 */
export function calcularDataSugeridaPagamento(dataEmissao, feriadosISO = []) {
  const dia = dataEmissao.getDate();
  const ano = dataEmissao.getFullYear();
  const mes = dataEmissao.getMonth(); // 0-indexado

  let dataBase;
  if (dia <= 10) {
    // Dia 30 do mesmo mês — em meses com menos de 30 dias (fevereiro),
    // o JS "rola" automaticamente para o início do mês seguinte, então
    // usamos o último dia real do mês nesse caso específico.
    const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
    const diaAlvo = Math.min(30, ultimoDiaDoMes);
    dataBase = new Date(ano, mes, diaAlvo);
  } else if (dia <= 20) {
    dataBase = new Date(ano, mes + 1, 10);
  } else {
    dataBase = new Date(ano, mes + 1, 20);
  }

  return ajustarParaDiaUtil(dataBase, feriadosISO);
}

/**
 * Executa todas as regras de uma vez para um lançamento — usado tanto
 * na pré-visualização do formulário quanto na gravação final no Firestore.
 *
 * Retorna DUAS métricas de prazo, deliberadamente separadas:
 *   1. Antecedência até a Política de Pagamento — emissão → data sugerida (dia 10/20/30)
 *   2. Tempo Hábil até o Vencimento Real — quantos dias existem entre o
 *      lançamento e o vencimento informado na própria NF, para dar tempo
 *      de gerar a ordem de pagamento. Não depende da política.
 */
export function processarLancamento({ valorNF, orcamentoProjetado, dataEmissao, dataVencimento, dataEntrada, feriadosISO }) {
  const entrada = dataEntrada ?? new Date();

  const divergencia = calcularDivergencia(valorNF, orcamentoProjetado);

  const dataSugeridaPagamento = calcularDataSugeridaPagamento(new Date(dataEmissao), feriadosISO);
  const antecedenciaPolitica = calcularAntecedencia(entrada, dataSugeridaPagamento);
  const dataLimiteLancamento = calcularDataLimiteLancamento(dataSugeridaPagamento);

  const tempoHabilVencimento = dataVencimento ? calcularAntecedencia(entrada, new Date(dataVencimento)) : null;

  return {
    mes_referencia: mesReferencia(new Date(dataEmissao)),
    divergencia_rs: divergencia.divergenciaRS,
    divergencia_pct: divergencia.divergenciaPct,
    status_divergencia: divergencia.status,

    data_sugerida_pagamento: dataSugeridaPagamento,
    dias_antecedencia_politica: antecedenciaPolitica.diasAntecedencia,
    status_antecedencia_politica: antecedenciaPolitica.status,
    data_limite_lancamento: dataLimiteLancamento,

    dias_tempo_habil_vencimento: tempoHabilVencimento?.diasAntecedencia ?? null,
    status_tempo_habil_vencimento: tempoHabilVencimento?.status ?? null,
  };
}
