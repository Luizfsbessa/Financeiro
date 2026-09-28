// ============================================================
// dados-fornecedores-importado.js
// GERADO AUTOMATICAMENTE a partir de seed2.xlsx (Planilha1):
// Fornecedor, Centro de Custo, Filial, Conta Contábil, Categoria.
//
// Contém: 11 Centros de Custo PRÓPRIOS (já existentes, só
// enriquecidos com tipo_gestao + código), 23 Centros de Custo de
// TERCEIROS (novos), 66 Contas Contábeis e 120 Serviços/Prestadores
// (fornecedor x centro x conta, deduplicado).
//
// IMPORTANTE: esta planilha não tinha nenhum valor de orçamento —
// todo Serviço nasce com Orçamento Projetado ZERADO (jan-dez = 0).
// Isso é esperado: até alguém preencher os valores reais, qualquer
// lançamento contra esses fornecedores vai cair em "COM DIVERGÊNCIA"
// automaticamente (valor > 0 projetado).
//
// Não edite este arquivo à mão — gere de novo a partir de uma
// planilha atualizada se os dados mudarem.
// ============================================================

export const CENTROS_FORNECEDORES = [
  {
    "id": "cc-filia-para",
    "nome": "Filial Pará",
    "tipo_gestao": "proprio",
    "codigo_centro": "11860"
  },
  {
    "id": "cc-trade-marketing",
    "nome": "Trade Marketing",
    "tipo_gestao": "terceiros",
    "codigo_centro": "11770"
  },
  {
    "id": "cc-compliance",
    "nome": "Compliance",
    "tipo_gestao": "terceiros",
    "codigo_centro": "130"
  },
  {
    "id": "cc-peixaria",
    "nome": "Peixaria",
    "tipo_gestao": "terceiros",
    "codigo_centro": "11780"
  },
  {
    "id": "cc-infraestrutura-de-ti",
    "nome": "Infraestrutura de TI",
    "tipo_gestao": "proprio",
    "codigo_centro": "180"
  },
  {
    "id": "cc-filial-pina",
    "nome": "Filial Pina",
    "tipo_gestao": "proprio",
    "codigo_centro": "11530"
  },
  {
    "id": "cc-filial-sao-paulo",
    "nome": "Filial São Paulo",
    "tipo_gestao": "proprio",
    "codigo_centro": "11500"
  },
  {
    "id": "cc-filial-contagem",
    "nome": "Filial Contagem",
    "tipo_gestao": "proprio",
    "codigo_centro": "11520"
  },
  {
    "id": "cc-filial-gama",
    "nome": "Filial Gama",
    "tipo_gestao": "proprio",
    "codigo_centro": "11510"
  },
  {
    "id": "cc-filial-ribeirao-pires",
    "nome": "Filial Ribeirão Pires",
    "tipo_gestao": "proprio",
    "codigo_centro": "12040"
  },
  {
    "id": "cc-marketing",
    "nome": "Marketing",
    "tipo_gestao": "terceiros",
    "codigo_centro": "1103"
  },
  {
    "id": "cc-contas-a-pagar",
    "nome": "Contas a pagar",
    "tipo_gestao": "terceiros",
    "codigo_centro": "920"
  },
  {
    "id": "cc-sistemas-de-ti",
    "nome": "Sistemas de TI",
    "tipo_gestao": "proprio",
    "codigo_centro": "170"
  },
  {
    "id": "cc-almoxarifado",
    "nome": "Almoxarifado",
    "tipo_gestao": "terceiros",
    "codigo_centro": "491"
  },
  {
    "id": "cc-contas-a-receber",
    "nome": "Contas a receber",
    "tipo_gestao": "terceiros",
    "codigo_centro": "930"
  },
  {
    "id": "cc-comex",
    "nome": "Comex",
    "tipo_gestao": "terceiros",
    "codigo_centro": "320"
  },
  {
    "id": "cc-projetos",
    "nome": "Projetos",
    "tipo_gestao": "terceiros",
    "codigo_centro": "9970"
  },
  {
    "id": "cc-nucleo-fiscal",
    "nome": "Núcleo Fiscal",
    "tipo_gestao": "terceiros",
    "codigo_centro": "950"
  },
  {
    "id": "cc-diretoria",
    "nome": "Diretoria",
    "tipo_gestao": "terceiros",
    "codigo_centro": "100"
  },
  {
    "id": "cc-controladoria-fiscal",
    "nome": "Controladoria Fiscal",
    "tipo_gestao": "terceiros",
    "codigo_centro": "10130"
  },
  {
    "id": "cc-auditoria-interna",
    "nome": "Auditoria interna",
    "tipo_gestao": "terceiros",
    "codigo_centro": "12300"
  },
  {
    "id": "cc-prime-recife",
    "nome": "Prime Recife",
    "tipo_gestao": "proprio",
    "codigo_centro": "10201009"
  },
  {
    "id": "cc-base-bahia-formosa",
    "nome": "Base Bahia Formosa",
    "tipo_gestao": "terceiros",
    "codigo_centro": "10905001"
  },
  {
    "id": "cc-base-icapui",
    "nome": "Base Icapuí",
    "tipo_gestao": "terceiros",
    "codigo_centro": "10605001"
  },
  {
    "id": "cc-base-piaui",
    "nome": "Base Piauí",
    "tipo_gestao": "terceiros",
    "codigo_centro": "10705001"
  },
  {
    "id": "cc-base-aranau",
    "nome": "Base Aranau",
    "tipo_gestao": "terceiros",
    "codigo_centro": "11805001"
  },
  {
    "id": "cc-base-touros",
    "nome": "Base Touros",
    "tipo_gestao": "terceiros",
    "codigo_centro": "11205001"
  },
  {
    "id": "cc-base-acau",
    "nome": "Base Acaú",
    "tipo_gestao": "terceiros",
    "codigo_centro": "10405001"
  },
  {
    "id": "cc-prime-alcobaca",
    "nome": "Prime Alcobaça",
    "tipo_gestao": "proprio",
    "codigo_centro": "10301002"
  },
  {
    "id": "cc-viveiro-bahia-pontal",
    "nome": "Viveiro Bahia Pontal",
    "tipo_gestao": "terceiros",
    "codigo_centro": "10805001"
  },
  {
    "id": "cc-prime-braganca",
    "nome": "Prime Bragança",
    "tipo_gestao": "proprio",
    "codigo_centro": "11001002"
  },
  {
    "id": "cc-logistica-pernambuco",
    "nome": "Logística Pernambuco",
    "tipo_gestao": "terceiros",
    "codigo_centro": "10204001"
  },
  {
    "id": "cc-base-natal",
    "nome": "Base Natal",
    "tipo_gestao": "terceiros",
    "codigo_centro": "11705005"
  },
  {
    "id": "cc-administrativo-acau",
    "nome": "Administrativo Acaú",
    "tipo_gestao": "terceiros",
    "codigo_centro": "10405004"
  }
];

export const CONTAS_FORNECEDORES = [
  {
    "id": "cc-filia-para__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-filia-para"
  },
  {
    "id": "cc-trade-marketing__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-trade-marketing"
  },
  {
    "id": "cc-compliance__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-compliance"
  },
  {
    "id": "cc-peixaria__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-peixaria"
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3170004",
    "nome": "MANUTENÇÃO MÁQUINAS E EQUIPAMENTOS PROCESSAMENTO DE DADOS",
    "conta_codigo": "3170004",
    "centro_custo_id": "cc-infraestrutura-de-ti"
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-infraestrutura-de-ti"
  },
  {
    "id": "cc-filial-pina__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-filial-pina"
  },
  {
    "id": "cc-filial-sao-paulo__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-filial-sao-paulo"
  },
  {
    "id": "cc-filial-contagem__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-filial-contagem"
  },
  {
    "id": "cc-filial-gama__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-filial-gama"
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200001",
    "nome": "TELEFONIA (FIXA E MÓVEL)",
    "conta_codigo": "3200001",
    "centro_custo_id": "cc-infraestrutura-de-ti"
  },
  {
    "id": "cc-filial-ribeirao-pires__ct-3200001",
    "nome": "TELEFONIA (FIXA E MÓVEL)",
    "conta_codigo": "3200001",
    "centro_custo_id": "cc-filial-ribeirao-pires"
  },
  {
    "id": "cc-filial-pina__ct-3200001",
    "nome": "TELEFONIA (FIXA E MÓVEL)",
    "conta_codigo": "3200001",
    "centro_custo_id": "cc-filial-pina"
  },
  {
    "id": "cc-filial-contagem__ct-3200001",
    "nome": "TELEFONIA (FIXA E MÓVEL)",
    "conta_codigo": "3200001",
    "centro_custo_id": "cc-filial-contagem"
  },
  {
    "id": "cc-filial-contagem__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-filial-contagem"
  },
  {
    "id": "cc-filial-gama__ct-3200001",
    "nome": "TELEFONIA (FIXA E MÓVEL)",
    "conta_codigo": "3200001",
    "centro_custo_id": "cc-filial-gama"
  },
  {
    "id": "cc-filial-gama__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-filial-gama"
  },
  {
    "id": "cc-filial-pina__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-filial-pina"
  },
  {
    "id": "cc-filial-ribeirao-pires__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-filial-ribeirao-pires"
  },
  {
    "id": "cc-filial-sao-paulo__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-filial-sao-paulo"
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-infraestrutura-de-ti"
  },
  {
    "id": "cc-marketing__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-marketing"
  },
  {
    "id": "cc-contas-a-pagar__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-contas-a-pagar"
  },
  {
    "id": "cc-sistemas-de-ti__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-sistemas-de-ti"
  },
  {
    "id": "cc-almoxarifado__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-almoxarifado"
  },
  {
    "id": "cc-contas-a-receber__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-contas-a-receber"
  },
  {
    "id": "cc-filial-sao-paulo__ct-3170004",
    "nome": "MANUTENÇÃO MÁQUINAS E EQUIPAMENTOS PROCESSAMENTO DE DADOS",
    "conta_codigo": "3170004",
    "centro_custo_id": "cc-filial-sao-paulo"
  },
  {
    "id": "cc-comex__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-comex"
  },
  {
    "id": "cc-filial-ribeirao-pires__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-filial-ribeirao-pires"
  },
  {
    "id": "cc-filial-pina__ct-3170004",
    "nome": "MANUTENÇÃO MÁQUINAS E EQUIPAMENTOS PROCESSAMENTO DE DADOS",
    "conta_codigo": "3170004",
    "centro_custo_id": "cc-filial-pina"
  },
  {
    "id": "cc-filial-contagem__ct-3170004",
    "nome": "MANUTENÇÃO MÁQUINAS E EQUIPAMENTOS PROCESSAMENTO DE DADOS",
    "conta_codigo": "3170004",
    "centro_custo_id": "cc-filial-contagem"
  },
  {
    "id": "cc-filial-gama__ct-3170004",
    "nome": "MANUTENÇÃO MÁQUINAS E EQUIPAMENTOS PROCESSAMENTO DE DADOS",
    "conta_codigo": "3170004",
    "centro_custo_id": "cc-filial-gama"
  },
  {
    "id": "cc-projetos__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-projetos"
  },
  {
    "id": "cc-nucleo-fiscal__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-nucleo-fiscal"
  },
  {
    "id": "cc-diretoria__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-diretoria"
  },
  {
    "id": "cc-controladoria-fiscal__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-controladoria-fiscal"
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200003",
    "nome": "TRANSFERENCIA DE DADOS",
    "conta_codigo": "3200003",
    "centro_custo_id": "cc-infraestrutura-de-ti"
  },
  {
    "id": "cc-sistemas-de-ti__ct-3200003",
    "nome": "TRANSFERENCIA DE DADOS",
    "conta_codigo": "3200003",
    "centro_custo_id": "cc-sistemas-de-ti"
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-infraestrutura-de-ti"
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3220004",
    "nome": "MATERIAIS SUPRIMENTOS DE INFORMÁTICA",
    "conta_codigo": "3220004",
    "centro_custo_id": "cc-infraestrutura-de-ti"
  },
  {
    "id": "cc-auditoria-interna__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-auditoria-interna"
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3190004",
    "nome": "ALUGUEL DE MÁQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3190004",
    "centro_custo_id": "cc-infraestrutura-de-ti"
  },
  {
    "id": "cc-prime-recife__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-prime-recife"
  },
  {
    "id": "cc-base-bahia-formosa__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-base-bahia-formosa"
  },
  {
    "id": "cc-prime-recife__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-prime-recife"
  },
  {
    "id": "cc-base-icapui__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-base-icapui"
  },
  {
    "id": "cc-prime-recife__ct-3200001",
    "nome": "TELEFONIA (FIXA E MÓVEL)",
    "conta_codigo": "3200001",
    "centro_custo_id": "cc-prime-recife"
  },
  {
    "id": "cc-base-piaui__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-base-piaui"
  },
  {
    "id": "cc-base-aranau__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-base-aranau"
  },
  {
    "id": "cc-base-touros__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-base-touros"
  },
  {
    "id": "cc-base-acau__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-base-acau"
  },
  {
    "id": "cc-prime-alcobaca__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-prime-alcobaca"
  },
  {
    "id": "cc-viveiro-bahia-pontal__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-viveiro-bahia-pontal"
  },
  {
    "id": "cc-prime-recife__ct-3190004",
    "nome": "ALUGUEL DE MÁQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3190004",
    "centro_custo_id": "cc-prime-recife"
  },
  {
    "id": "cc-prime-braganca__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-prime-braganca"
  },
  {
    "id": "cc-viveiro-bahia-pontal__ct-3190004",
    "nome": "ALUGUEL DE MÁQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3190004",
    "centro_custo_id": "cc-viveiro-bahia-pontal"
  },
  {
    "id": "cc-prime-recife__ct-3200003",
    "nome": "TRANSFERENCIA DE DADOS",
    "conta_codigo": "3200003",
    "centro_custo_id": "cc-prime-recife"
  },
  {
    "id": "cc-prime-recife__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-prime-recife"
  },
  {
    "id": "cc-logistica-pernambuco__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-logistica-pernambuco"
  },
  {
    "id": "cc-base-natal__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-base-natal"
  },
  {
    "id": "cc-prime-alcobaca__ct-3190004",
    "nome": "ALUGUEL DE MÁQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3190004",
    "centro_custo_id": "cc-prime-alcobaca"
  },
  {
    "id": "cc-prime-alcobaca__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-prime-alcobaca"
  },
  {
    "id": "cc-prime-alcobaca__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-prime-alcobaca"
  },
  {
    "id": "cc-viveiro-bahia-pontal__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-viveiro-bahia-pontal"
  },
  {
    "id": "cc-administrativo-acau__ct-3220004",
    "nome": "MATERIAIS SUPRIMENTOS DE INFORMÁTICA",
    "conta_codigo": "3220004",
    "centro_custo_id": "cc-administrativo-acau"
  },
  {
    "id": "cc-base-acau__ct-3220004",
    "nome": "MATERIAIS SUPRIMENTOS DE INFORMÁTICA",
    "conta_codigo": "3220004",
    "centro_custo_id": "cc-base-acau"
  }
];

export const SERVICOS_FORNECEDORES = [
  {
    "id": "cc-filia-para__ct-3200004__sv-jn-informatica",
    "nome": "JN Informática",
    "conta_contabil_id": "cc-filia-para__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-trade-marketing__ct-3170008__sv-involves",
    "nome": "Involves",
    "conta_contabil_id": "cc-trade-marketing__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-compliance__ct-3170008__sv-privacy-tool",
    "nome": "Privacy Tool",
    "conta_contabil_id": "cc-compliance__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-peixaria__ct-3170008__sv-vtex",
    "nome": "Vtex",
    "conta_contabil_id": "cc-peixaria__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3170004__sv-sek",
    "nome": "SEK",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3170004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200004__sv-afinet",
    "nome": "Afinet",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-pina__ct-3200004__sv-algar",
    "nome": "Algar",
    "conta_contabil_id": "cc-filial-pina__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-sao-paulo__ct-3200004__sv-algar",
    "nome": "Algar",
    "conta_contabil_id": "cc-filial-sao-paulo__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200004__sv-algar",
    "nome": "Algar",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-contagem__ct-3200004__sv-algar",
    "nome": "Algar",
    "conta_contabil_id": "cc-filial-contagem__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-gama__ct-3200004__sv-algar",
    "nome": "Algar",
    "conta_contabil_id": "cc-filial-gama__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200001__sv-algar-0800",
    "nome": "Algar - 0800",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3200001",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-ribeirao-pires__ct-3200001__sv-algar-telefonia",
    "nome": "Algar - Telefonia",
    "conta_contabil_id": "cc-filial-ribeirao-pires__ct-3200001",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200001__sv-algar-telefonia",
    "nome": "Algar - Telefonia",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3200001",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-pina__ct-3200001__sv-algar-telefonia",
    "nome": "Algar - Telefonia",
    "conta_contabil_id": "cc-filial-pina__ct-3200001",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-contagem__ct-3200001__sv-algar-telefonia",
    "nome": "Algar - Telefonia",
    "conta_contabil_id": "cc-filial-contagem__ct-3200001",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-contagem__ct-3200004__sv-noctel",
    "nome": "Noctel",
    "conta_contabil_id": "cc-filial-contagem__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-gama__ct-3200004__sv-opentel",
    "nome": "Opentel",
    "conta_contabil_id": "cc-filial-gama__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-contagem__ct-3220013__sv-rbprint",
    "nome": "RBPRINT",
    "conta_contabil_id": "cc-filial-contagem__ct-3220013",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-gama__ct-3200001__sv-algar-telefonia",
    "nome": "Algar - Telefonia",
    "conta_contabil_id": "cc-filial-gama__ct-3200001",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-gama__ct-3220013__sv-rbprint",
    "nome": "RBPRINT",
    "conta_contabil_id": "cc-filial-gama__ct-3220013",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-pina__ct-3220013__sv-rbprint",
    "nome": "RBPRINT",
    "conta_contabil_id": "cc-filial-pina__ct-3220013",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-ribeirao-pires__ct-3220013__sv-rbprint",
    "nome": "RBPRINT",
    "conta_contabil_id": "cc-filial-ribeirao-pires__ct-3220013",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-sao-paulo__ct-3220013__sv-rbprint",
    "nome": "RBPRINT",
    "conta_contabil_id": "cc-filial-sao-paulo__ct-3220013",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3220013__sv-rbprint-scaner",
    "nome": "RBPRINT - Scaner",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3220013",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-marketing__ct-3170008__sv-rd-station",
    "nome": "RD Station",
    "conta_contabil_id": "cc-marketing__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200004__sv-claro",
    "nome": "Claro",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3170004__sv-zetech",
    "nome": "Zetech",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3170004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-contas-a-pagar__ct-3170008__sv-movidesk",
    "nome": "Movidesk",
    "conta_contabil_id": "cc-contas-a-pagar__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-contas-a-pagar__ct-3170008__sv-movidesk-whatsapp",
    "nome": "Movidesk whatsapp",
    "conta_contabil_id": "cc-contas-a-pagar__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3220013__sv-rbprint",
    "nome": "RBPRINT",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3220013",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-sistemas-de-ti__ct-3170008__sv-senior",
    "nome": "Senior",
    "conta_contabil_id": "cc-sistemas-de-ti__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-almoxarifado__ct-3170008__sv-sismetro",
    "nome": "Sismetro",
    "conta_contabil_id": "cc-almoxarifado__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-contas-a-pagar__ct-3170008__sv-accesstage",
    "nome": "Accesstage",
    "conta_contabil_id": "cc-contas-a-pagar__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-gama__ct-3200004__sv-sitelbra",
    "nome": "Sitelbra",
    "conta_contabil_id": "cc-filial-gama__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-sistemas-de-ti__ct-3170008__sv-clavis",
    "nome": "Clavis",
    "conta_contabil_id": "cc-sistemas-de-ti__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-contas-a-receber__ct-3170008__sv-cobmais",
    "nome": "Cobmais",
    "conta_contabil_id": "cc-contas-a-receber__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-peixaria__ct-3170008__sv-economafilia-paras",
    "nome": "EconomaFilia Parás",
    "conta_contabil_id": "cc-peixaria__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-sao-paulo__ct-3170004__sv-infopower",
    "nome": "Infopower",
    "conta_contabil_id": "cc-filial-sao-paulo__ct-3170004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-peixaria__ct-3170008__sv-meest",
    "nome": "Meest",
    "conta_contabil_id": "cc-peixaria__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-marketing__ct-3170008__sv-mmcafe",
    "nome": "MMCafé",
    "conta_contabil_id": "cc-marketing__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-comex__ct-3170008__sv-narwal",
    "nome": "Narwal",
    "conta_contabil_id": "cc-comex__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-ribeirao-pires__ct-3200004__sv-tesa",
    "nome": "Tesa",
    "conta_contabil_id": "cc-filial-ribeirao-pires__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3170004__sv-engti",
    "nome": "Engti",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3170004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-sao-paulo__ct-3170004__sv-engti",
    "nome": "Engti",
    "conta_contabil_id": "cc-filial-sao-paulo__ct-3170004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-pina__ct-3170004__sv-engti",
    "nome": "Engti",
    "conta_contabil_id": "cc-filial-pina__ct-3170004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-contagem__ct-3170004__sv-engti",
    "nome": "Engti",
    "conta_contabil_id": "cc-filial-contagem__ct-3170004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-gama__ct-3170004__sv-engti",
    "nome": "Engti",
    "conta_contabil_id": "cc-filial-gama__ct-3170004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-ribeirao-pires__ct-3200004__sv-starlink",
    "nome": "Starlink",
    "conta_contabil_id": "cc-filial-ribeirao-pires__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-gama__ct-3170004__sv-t4b",
    "nome": "T4B",
    "conta_contabil_id": "cc-filial-gama__ct-3170004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-projetos__ct-3170008__sv-vela",
    "nome": "Vela",
    "conta_contabil_id": "cc-projetos__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200004__sv-vivo",
    "nome": "Vivo",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-sistemas-de-ti__ct-3170008__sv-antharys",
    "nome": "Antharys",
    "conta_contabil_id": "cc-sistemas-de-ti__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200001__sv-ascorp",
    "nome": "Ascorp",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3200001",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-sao-paulo__ct-3200004__sv-cti-comunicacao",
    "nome": "CTI Comunicação",
    "conta_contabil_id": "cc-filial-sao-paulo__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-sao-paulo__ct-3200004__sv-ctinet",
    "nome": "CTINET",
    "conta_contabil_id": "cc-filial-sao-paulo__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-contagem__ct-3170004__sv-d-castro",
    "nome": "D´Castro",
    "conta_contabil_id": "cc-filial-contagem__ct-3170004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-marketing__ct-3170008__sv-rubrum",
    "nome": "Rubrum",
    "conta_contabil_id": "cc-marketing__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-ribeirao-pires__ct-3200004__sv-giga",
    "nome": "Giga+",
    "conta_contabil_id": "cc-filial-ribeirao-pires__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200004__sv-oi",
    "nome": "OI",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-nucleo-fiscal__ct-3170008__sv-myrp",
    "nome": "Myrp",
    "conta_contabil_id": "cc-nucleo-fiscal__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-diretoria__ct-3200004__sv-net-richelieu",
    "nome": "Net - Richelieu",
    "conta_contabil_id": "cc-diretoria__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-trade-marketing__ct-3170008__sv-wmw",
    "nome": "WMW",
    "conta_contabil_id": "cc-trade-marketing__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-controladoria-fiscal__ct-3170008__sv-asis",
    "nome": "ASIS",
    "conta_contabil_id": "cc-controladoria-fiscal__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3170004__sv-axians",
    "nome": "Axians",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3170004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-filial-pina__ct-3200004__sv-evolnet",
    "nome": "Evolnet",
    "conta_contabil_id": "cc-filial-pina__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-nucleo-fiscal__ct-3170008__sv-inventti",
    "nome": "Inventti",
    "conta_contabil_id": "cc-nucleo-fiscal__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-trade-marketing__ct-3170008__sv-neogrid",
    "nome": "Neogrid",
    "conta_contabil_id": "cc-trade-marketing__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200004__sv-rede-on-corp",
    "nome": "Rede on corp",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200003__sv-skymail",
    "nome": "Skymail",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3200003",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-sistemas-de-ti__ct-3200003__sv-skysoftware",
    "nome": "Skysoftware",
    "conta_contabil_id": "cc-sistemas-de-ti__ct-3200003",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-diretoria__ct-3200004__sv-telecall-diretoria",
    "nome": "Telecall - Diretoria",
    "conta_contabil_id": "cc-diretoria__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-diretoria__ct-3200004__sv-telecall-inreach",
    "nome": "Telecall - InReach",
    "conta_contabil_id": "cc-diretoria__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3170008__sv-microsoft",
    "nome": "Microsoft",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3170004__sv-mesiscom",
    "nome": "Mesiscom",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3170004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3220004__sv-skymail",
    "nome": "Skymail",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3220004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-auditoria-interna__ct-3170008__sv-perinity",
    "nome": "Perinity",
    "conta_contabil_id": "cc-auditoria-interna__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200004__sv-mundivox",
    "nome": "Mundivox",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3170004__sv-brasil-ponto-com",
    "nome": "Brasil Ponto Com",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3170004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-auditoria-interna__ct-3170008__sv-vennx",
    "nome": "Vennx",
    "conta_contabil_id": "cc-auditoria-interna__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3190004__sv-simpress",
    "nome": "Simpress",
    "conta_contabil_id": "cc-infraestrutura-de-ti__ct-3190004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-recife__ct-3200004__sv-1telecom",
    "nome": "1Telecom",
    "conta_contabil_id": "cc-prime-recife__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-base-bahia-formosa__ct-3200004__sv-net4you",
    "nome": "Net4you",
    "conta_contabil_id": "cc-base-bahia-formosa__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-recife__ct-3170008__sv-sankhya",
    "nome": "Sankhya",
    "conta_contabil_id": "cc-prime-recife__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-base-icapui__ct-3200004__sv-tera-network",
    "nome": "Tera Network",
    "conta_contabil_id": "cc-base-icapui__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-recife__ct-3200001__sv-ascorp",
    "nome": "Ascorp",
    "conta_contabil_id": "cc-prime-recife__ct-3200001",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-base-piaui__ct-3200004__sv-brisanet",
    "nome": "Brisanet",
    "conta_contabil_id": "cc-base-piaui__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-base-aranau__ct-3200004__sv-fox-net",
    "nome": "Fox Net",
    "conta_contabil_id": "cc-base-aranau__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-base-touros__ct-3200004__sv-gigabom",
    "nome": "Gigabom",
    "conta_contabil_id": "cc-base-touros__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-base-icapui__ct-3200004__sv-litoral-net",
    "nome": "Litoral Net",
    "conta_contabil_id": "cc-base-icapui__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-base-acau__ct-3200004__sv-mega-telecom",
    "nome": "Mega Telecom",
    "conta_contabil_id": "cc-base-acau__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-base-icapui__ct-3200004__sv-giga-fibra",
    "nome": "Giga + Fibra",
    "conta_contabil_id": "cc-base-icapui__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-alcobaca__ct-3200004__sv-itl",
    "nome": "ITL",
    "conta_contabil_id": "cc-prime-alcobaca__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-alcobaca__ct-3200004__sv-dstech",
    "nome": "DSTech",
    "conta_contabil_id": "cc-prime-alcobaca__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-viveiro-bahia-pontal__ct-3200004__sv-dstech",
    "nome": "DSTech",
    "conta_contabil_id": "cc-viveiro-bahia-pontal__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-recife__ct-3190004__sv-rb-code",
    "nome": "RB Code",
    "conta_contabil_id": "cc-prime-recife__ct-3190004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-recife__ct-3190004__sv-infofilia-parartner",
    "nome": "InfoFilia Parártner",
    "conta_contabil_id": "cc-prime-recife__ct-3190004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-braganca__ct-3200004__sv-m2-telecom",
    "nome": "M2 Telecom",
    "conta_contabil_id": "cc-prime-braganca__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-viveiro-bahia-pontal__ct-3190004__sv-maximmus",
    "nome": "Maximmus",
    "conta_contabil_id": "cc-viveiro-bahia-pontal__ct-3190004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-base-touros__ct-3200004__sv-maxinet",
    "nome": "Maxinet",
    "conta_contabil_id": "cc-base-touros__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-recife__ct-3200003__sv-nuvem-datacom",
    "nome": "Nuvem Datacom",
    "conta_contabil_id": "cc-prime-recife__ct-3200003",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-base-touros__ct-3200004__sv-qero",
    "nome": "Qero",
    "conta_contabil_id": "cc-base-touros__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-base-bahia-formosa__ct-3200004__sv-qero",
    "nome": "Qero",
    "conta_contabil_id": "cc-base-bahia-formosa__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-recife__ct-3220013__sv-teclink",
    "nome": "Teclink",
    "conta_contabil_id": "cc-prime-recife__ct-3220013",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-alcobaca__ct-3200004__sv-wkve-telecom",
    "nome": "WKVE Telecom",
    "conta_contabil_id": "cc-prime-alcobaca__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-braganca__ct-3200004__sv-portal-eletronico",
    "nome": "Portal Eletrônico",
    "conta_contabil_id": "cc-prime-braganca__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-braganca__ct-3200004__sv-portal-telecom",
    "nome": "Portal Telecom",
    "conta_contabil_id": "cc-prime-braganca__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-braganca__ct-3200004__sv-starlink",
    "nome": "Starlink",
    "conta_contabil_id": "cc-prime-braganca__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-logistica-pernambuco__ct-3170008__sv-hivelog",
    "nome": "Hivelog",
    "conta_contabil_id": "cc-logistica-pernambuco__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-base-acau__ct-3200004__sv-gildo-skynet",
    "nome": "Gildo - Skynet",
    "conta_contabil_id": "cc-base-acau__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-base-natal__ct-3200004__sv-brisanet",
    "nome": "Brisanet",
    "conta_contabil_id": "cc-base-natal__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-recife__ct-3170008__sv-code-tecnologia",
    "nome": "Code Tecnologia",
    "conta_contabil_id": "cc-prime-recife__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-alcobaca__ct-3190004__sv-rb-code",
    "nome": "RB Code",
    "conta_contabil_id": "cc-prime-alcobaca__ct-3190004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-alcobaca__ct-3220013__sv-andrade",
    "nome": "Andrade",
    "conta_contabil_id": "cc-prime-alcobaca__ct-3220013",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-alcobaca__ct-3170008__sv-diego",
    "nome": "Diego",
    "conta_contabil_id": "cc-prime-alcobaca__ct-3170008",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-viveiro-bahia-pontal__ct-3220013__sv-andrade",
    "nome": "Andrade",
    "conta_contabil_id": "cc-viveiro-bahia-pontal__ct-3220013",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-alcobaca__ct-3200004__sv-starlink",
    "nome": "Starlink",
    "conta_contabil_id": "cc-prime-alcobaca__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-administrativo-acau__ct-3220004__sv-pgi-servicos-de-telecomunicacoes-ltda-me",
    "nome": "PGI SERVIÇOS DE TELECOMUNICAÇÕES LTDA - ME",
    "conta_contabil_id": "cc-administrativo-acau__ct-3220004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-prime-recife__ct-3200004__sv-compuservice",
    "nome": "COMPUSERVICE",
    "conta_contabil_id": "cc-prime-recife__ct-3200004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  },
  {
    "id": "cc-base-acau__ct-3220004__sv-pgi-servicos-de-telecomunicacoes-ltda-me",
    "nome": "PGI SERVIÇOS DE TELECOMUNICAÇÕES LTDA - ME",
    "conta_contabil_id": "cc-base-acau__ct-3220004",
    "orcamento_projetado": {
      "jan": 0,
      "fev": 0,
      "mar": 0,
      "abr": 0,
      "mai": 0,
      "jun": 0,
      "jul": 0,
      "ago": 0,
      "set": 0,
      "out": 0,
      "nov": 0,
      "dez": 0
    }
  }
];
