// ============================================================
// dados-orcamento-importado.js
// GERADO AUTOMATICAMENTE a partir da planilha enviada
// (seed_orcamento_aprovado.xlsx) — 11 Centros de Custo, 80
// combinações de Conta Contábil, com Orçamento Aprovado mês a mês.
//
// Este arquivo é só DADOS (nenhuma lógica), consumido pela
// importação em seed.html. Se precisar atualizar os números,
// gere este arquivo de novo a partir de uma planilha nova — não
// edite os valores aqui manualmente linha por linha.
//
// IMPORTANTE: esta planilha só tinha dados de Centro de Custo +
// Conta Contábil + Orçamento Aprovado. Ainda NÃO existe nenhum
// Serviço/Prestador (nível de Orçamento Projetado) vinculado a
// essas contas — sem isso, a tela "Novo Lançamento" não vai ter
// o que listar no campo Serviço para essas contas novas. Isso
// precisa ser cadastrado à parte (manual ou outra planilha).
// ============================================================

export const CENTROS_IMPORTADOS = [
  {
    "id": "cc-infraestrutura-de-ti",
    "nome": "Infraestrutura de TI"
  },
  {
    "id": "cc-sistemas-de-ti",
    "nome": "Sistemas de TI"
  },
  {
    "id": "cc-filial-sao-paulo",
    "nome": "Filial São Paulo"
  },
  {
    "id": "cc-filial-gama",
    "nome": "Filial Gama"
  },
  {
    "id": "cc-filial-contagem",
    "nome": "Filial Contagem"
  },
  {
    "id": "cc-filial-pina",
    "nome": "Filial Pina"
  },
  {
    "id": "cc-filia-para",
    "nome": "Filia Pará"
  },
  {
    "id": "cc-prime-recife",
    "nome": "Prime Recife"
  },
  {
    "id": "cc-prime-alcobaca",
    "nome": "Prime Alcobaça"
  },
  {
    "id": "cc-prime-braganca",
    "nome": "Prime Bragança"
  },
  {
    "id": "cc-filial-ribeirao-pires",
    "nome": "Filial Ribeirão Pires"
  }
];

export const CONTAS_IMPORTADAS = [
  {
    "id": "cc-infraestrutura-de-ti__ct-3170002",
    "nome": "MANUTENÇÃO DE MAQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3170002",
    "centro_custo_id": "cc-infraestrutura-de-ti",
    "orcamento_aprovado": {
      "jan": 1000.0,
      "fev": 1000.0,
      "mar": 1000.0,
      "abr": 1000.0,
      "mai": 1000.0,
      "jun": 1000.0,
      "jul": 1000.0,
      "ago": 1000.0,
      "set": 1000.0,
      "out": 1000.0,
      "nov": 1000.0,
      "dez": 1000.0
    }
  },
  {
    "id": "cc-sistemas-de-ti__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-sistemas-de-ti",
    "orcamento_aprovado": {
      "jan": 266796.52,
      "fev": 192028.02,
      "mar": 209186.02,
      "abr": 192425.47,
      "mai": 381805.47,
      "jun": 193349.84,
      "jul": 242425.47,
      "ago": 192425.47,
      "set": 229425.47,
      "out": 279034.67,
      "nov": 282654.47,
      "dez": 206638.67
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3170003",
    "nome": "MANUTENÇÃO MAQUINAS E EQUIPAMENTOS DE TELEFONIA",
    "conta_codigo": "3170003",
    "centro_custo_id": "cc-infraestrutura-de-ti",
    "orcamento_aprovado": {
      "jan": 300.0,
      "fev": 300.0,
      "mar": 300.0,
      "abr": 300.0,
      "mai": 300.0,
      "jun": 300.0,
      "jul": 300.0,
      "ago": 300.0,
      "set": 300.0,
      "out": 300.0,
      "nov": 300.0,
      "dez": 300.0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3170004",
    "nome": "MANUTENÇÃO MÁQUINAS E EQUIPAMENTOS PROCESSAMENTO DE DADOS",
    "conta_codigo": "3170004",
    "centro_custo_id": "cc-infraestrutura-de-ti",
    "orcamento_aprovado": {
      "jan": 80592.35,
      "fev": 80725.19,
      "mar": 100815.1,
      "abr": 81015.1,
      "mai": 81193.04,
      "jun": 81193.04,
      "jul": 81193.04,
      "ago": 83478.73,
      "set": 83478.73,
      "out": 83478.73,
      "nov": 83478.73,
      "dez": 83478.73
    }
  },
  {
    "id": "cc-filial-sao-paulo__ct-3170002",
    "nome": "MANUTENÇÃO DE MAQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3170002",
    "centro_custo_id": "cc-filial-sao-paulo",
    "orcamento_aprovado": {
      "jan": 350.0,
      "fev": 350.0,
      "mar": 350.0,
      "abr": 350.0,
      "mai": 350.0,
      "jun": 350.0,
      "jul": 350.0,
      "ago": 350.0,
      "set": 350.0,
      "out": 350.0,
      "nov": 350.0,
      "dez": 350.0
    }
  },
  {
    "id": "cc-filial-sao-paulo__ct-3170004",
    "nome": "MANUTENÇÃO MÁQUINAS E EQUIPAMENTOS PROCESSAMENTO DE DADOS",
    "conta_codigo": "3170004",
    "centro_custo_id": "cc-filial-sao-paulo",
    "orcamento_aprovado": {
      "jan": 4389.58,
      "fev": 4389.58,
      "mar": 4389.58,
      "abr": 4389.58,
      "mai": 4424.69,
      "jun": 4424.69,
      "jul": 4424.69,
      "ago": 4424.69,
      "set": 4424.69,
      "out": 4609.05,
      "nov": 4609.05,
      "dez": 4609.05
    }
  },
  {
    "id": "cc-filial-gama__ct-3170002",
    "nome": "MANUTENÇÃO DE MAQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3170002",
    "centro_custo_id": "cc-filial-gama",
    "orcamento_aprovado": {
      "jan": 350.0,
      "fev": 350.0,
      "mar": 350.0,
      "abr": 350.0,
      "mai": 350.0,
      "jun": 350.0,
      "jul": 350.0,
      "ago": 350.0,
      "set": 350.0,
      "out": 350.0,
      "nov": 350.0,
      "dez": 350.0
    }
  },
  {
    "id": "cc-filial-gama__ct-3170004",
    "nome": "MANUTENÇÃO MÁQUINAS E EQUIPAMENTOS PROCESSAMENTO DE DADOS",
    "conta_codigo": "3170004",
    "centro_custo_id": "cc-filial-gama",
    "orcamento_aprovado": {
      "jan": 1661.12,
      "fev": 1661.12,
      "mar": 1661.12,
      "abr": 1661.12,
      "mai": 1699.67,
      "jun": 1699.67,
      "jul": 1699.67,
      "ago": 1699.67,
      "set": 1699.67,
      "out": 1699.67,
      "nov": 1699.67,
      "dez": 1699.67
    }
  },
  {
    "id": "cc-filial-contagem__ct-3170002",
    "nome": "MANUTENÇÃO DE MAQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3170002",
    "centro_custo_id": "cc-filial-contagem",
    "orcamento_aprovado": {
      "jan": 350.0,
      "fev": 350.0,
      "mar": 350.0,
      "abr": 350.0,
      "mai": 350.0,
      "jun": 350.0,
      "jul": 350.0,
      "ago": 350.0,
      "set": 350.0,
      "out": 350.0,
      "nov": 350.0,
      "dez": 350.0
    }
  },
  {
    "id": "cc-filial-contagem__ct-3170004",
    "nome": "MANUTENÇÃO MÁQUINAS E EQUIPAMENTOS PROCESSAMENTO DE DADOS",
    "conta_codigo": "3170004",
    "centro_custo_id": "cc-filial-contagem",
    "orcamento_aprovado": {
      "jan": 2976.12,
      "fev": 2976.12,
      "mar": 2976.12,
      "abr": 2976.12,
      "mai": 3014.67,
      "jun": 3014.67,
      "jul": 3014.67,
      "ago": 3014.67,
      "set": 3014.67,
      "out": 3014.67,
      "nov": 3014.67,
      "dez": 3124.92
    }
  },
  {
    "id": "cc-filial-contagem__ct-3190004",
    "nome": "ALUGUEL DE MÁQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3190004",
    "centro_custo_id": "cc-filial-contagem",
    "orcamento_aprovado": {
      "jan": 1999.1,
      "fev": 2099.05,
      "mar": 2099.05,
      "abr": 2099.05,
      "mai": 2099.05,
      "jun": 2099.05,
      "jul": 2099.05,
      "ago": 2099.05,
      "set": 2099.05,
      "out": 2099.05,
      "nov": 2099.05,
      "dez": 2099.05
    }
  },
  {
    "id": "cc-filial-contagem__ct-3200001",
    "nome": "TELEFONIA (FIXA E MÓVEL)",
    "conta_codigo": "3200001",
    "centro_custo_id": "cc-filial-contagem",
    "orcamento_aprovado": {
      "jan": 469.78,
      "fev": 469.78,
      "mar": 469.78,
      "abr": 469.78,
      "mai": 469.78,
      "jun": 469.78,
      "jul": 469.78,
      "ago": 469.78,
      "set": 469.78,
      "out": 493.26,
      "nov": 493.26,
      "dez": 493.26
    }
  },
  {
    "id": "cc-filial-pina__ct-3170002",
    "nome": "MANUTENÇÃO DE MAQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3170002",
    "centro_custo_id": "cc-filial-pina",
    "orcamento_aprovado": {
      "jan": 350.0,
      "fev": 350.0,
      "mar": 350.0,
      "abr": 350.0,
      "mai": 350.0,
      "jun": 350.0,
      "jul": 350.0,
      "ago": 350.0,
      "set": 350.0,
      "out": 350.0,
      "nov": 350.0,
      "dez": 350.0
    }
  },
  {
    "id": "cc-filial-pina__ct-3170004",
    "nome": "MANUTENÇÃO MÁQUINAS E EQUIPAMENTOS PROCESSAMENTO DE DADOS",
    "conta_codigo": "3170004",
    "centro_custo_id": "cc-filial-pina",
    "orcamento_aprovado": {
      "jan": 771.12,
      "fev": 771.12,
      "mar": 771.12,
      "abr": 771.12,
      "mai": 809.67,
      "jun": 809.67,
      "jul": 809.67,
      "ago": 809.67,
      "set": 809.67,
      "out": 809.67,
      "nov": 809.67,
      "dez": 809.67
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3190004",
    "nome": "ALUGUEL DE MÁQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3190004",
    "centro_custo_id": "cc-infraestrutura-de-ti",
    "orcamento_aprovado": {
      "jan": 7996.38,
      "fev": 8396.19,
      "mar": 8396.19,
      "abr": 8396.19,
      "mai": 8396.19,
      "jun": 8396.19,
      "jul": 8396.19,
      "ago": 8396.19,
      "set": 8396.19,
      "out": 8396.19,
      "nov": 8396.19,
      "dez": 8396.19
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200001",
    "nome": "TELEFONIA (FIXA E MÓVEL)",
    "conta_codigo": "3200001",
    "centro_custo_id": "cc-infraestrutura-de-ti",
    "orcamento_aprovado": {
      "jan": 828.45,
      "fev": 828.45,
      "mar": 828.45,
      "abr": 828.45,
      "mai": 897.84,
      "jun": 897.84,
      "jul": 897.84,
      "ago": 897.84,
      "set": 897.84,
      "out": 897.84,
      "nov": 897.84,
      "dez": 897.84
    }
  },
  {
    "id": "cc-filial-sao-paulo__ct-3190004",
    "nome": "ALUGUEL DE MÁQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3190004",
    "centro_custo_id": "cc-filial-sao-paulo",
    "orcamento_aprovado": {
      "jan": 5997.29,
      "fev": 6297.15,
      "mar": 6297.15,
      "abr": 6297.15,
      "mai": 6297.15,
      "jun": 6297.15,
      "jul": 6297.15,
      "ago": 6297.15,
      "set": 6297.15,
      "out": 6297.15,
      "nov": 6297.15,
      "dez": 6297.15
    }
  },
  {
    "id": "cc-filial-sao-paulo__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-filial-sao-paulo",
    "orcamento_aprovado": {
      "jan": 5158.45,
      "fev": 5158.45,
      "mar": 5158.45,
      "abr": 5255.67,
      "mai": 5255.67,
      "jun": 5255.67,
      "jul": 5255.67,
      "ago": 5386.36,
      "set": 5416.36,
      "out": 5416.36,
      "nov": 5416.36,
      "dez": 5416.36
    }
  },
  {
    "id": "cc-filial-gama__ct-3190004",
    "nome": "ALUGUEL DE MÁQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3190004",
    "centro_custo_id": "cc-filial-gama",
    "orcamento_aprovado": {
      "jan": 3998.19,
      "fev": 4198.09,
      "mar": 4198.09,
      "abr": 4198.09,
      "mai": 4198.09,
      "jun": 4198.09,
      "jul": 4198.09,
      "ago": 4198.09,
      "set": 4198.09,
      "out": 4198.09,
      "nov": 4198.09,
      "dez": 4198.09
    }
  },
  {
    "id": "cc-filial-gama__ct-3200001",
    "nome": "TELEFONIA (FIXA E MÓVEL)",
    "conta_codigo": "3200001",
    "centro_custo_id": "cc-filial-gama",
    "orcamento_aprovado": {
      "jan": 788.48,
      "fev": 788.48,
      "mar": 788.48,
      "abr": 788.48,
      "mai": 788.48,
      "jun": 788.48,
      "jul": 788.48,
      "ago": 788.48,
      "set": 788.48,
      "out": 788.48,
      "nov": 788.48,
      "dez": 788.48
    }
  },
  {
    "id": "cc-filial-pina__ct-3190004",
    "nome": "ALUGUEL DE MÁQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3190004",
    "centro_custo_id": "cc-filial-pina",
    "orcamento_aprovado": {
      "jan": 1999.1,
      "fev": 2099.05,
      "mar": 2099.05,
      "abr": 2099.05,
      "mai": 2099.05,
      "jun": 2099.05,
      "jul": 2099.05,
      "ago": 2099.05,
      "set": 2099.05,
      "out": 2099.05,
      "nov": 2099.05,
      "dez": 2099.05
    }
  },
  {
    "id": "cc-filial-pina__ct-3200001",
    "nome": "TELEFONIA (FIXA E MÓVEL)",
    "conta_codigo": "3200001",
    "centro_custo_id": "cc-filial-pina",
    "orcamento_aprovado": {
      "jan": 479.03,
      "fev": 479.03,
      "mar": 479.03,
      "abr": 500.0,
      "mai": 500.0,
      "jun": 500.0,
      "jul": 500.0,
      "ago": 500.0,
      "set": 500.0,
      "out": 500.0,
      "nov": 500.0,
      "dez": 500.0
    }
  },
  {
    "id": "cc-filial-contagem__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-filial-contagem",
    "orcamento_aprovado": {
      "jan": 2798.58,
      "fev": 2798.58,
      "mar": 2798.58,
      "abr": 2798.58,
      "mai": 2798.58,
      "jun": 2798.58,
      "jul": 2798.58,
      "ago": 2798.58,
      "set": 2798.58,
      "out": 2883.5,
      "nov": 3029.8,
      "dez": 3029.8
    }
  },
  {
    "id": "cc-filial-pina__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-filial-pina",
    "orcamento_aprovado": {
      "jan": 2564.73,
      "fev": 2564.73,
      "mar": 2564.73,
      "abr": 2617.96,
      "mai": 2617.96,
      "jun": 2617.96,
      "jul": 2617.96,
      "ago": 2617.96,
      "set": 2617.96,
      "out": 2692.96,
      "nov": 2692.96,
      "dez": 2692.96
    }
  },
  {
    "id": "cc-filia-para__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-filia-para",
    "orcamento_aprovado": {
      "jan": 950.0,
      "fev": 950.0,
      "mar": 950.0,
      "abr": 950.0,
      "mai": 950.0,
      "jun": 997.5,
      "jul": 997.5,
      "ago": 997.5,
      "set": 997.5,
      "out": 997.5,
      "nov": 997.5,
      "dez": 997.5
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-infraestrutura-de-ti",
    "orcamento_aprovado": {
      "jan": 7235.8,
      "fev": 7235.8,
      "mar": 7235.8,
      "abr": 7235.8,
      "mai": 7343.83,
      "jun": 7343.83,
      "jul": 7343.83,
      "ago": 7393.83,
      "set": 7437.4,
      "out": 7437.4,
      "nov": 7637.4,
      "dez": 7674.91
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3200003",
    "nome": "TRANSFERENCIA DE DADOS",
    "conta_codigo": "3200003",
    "centro_custo_id": "cc-infraestrutura-de-ti",
    "orcamento_aprovado": {
      "jan": 9000.0,
      "fev": 9000.0,
      "mar": 9000.0,
      "abr": 9000.0,
      "mai": 9000.0,
      "jun": 9000.0,
      "jul": 9000.0,
      "ago": 9000.0,
      "set": 9000.0,
      "out": 9000.0,
      "nov": 9000.0,
      "dez": 9000.0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3220003",
    "nome": "MATERIAIS DE ESCRITÓRIO",
    "conta_codigo": "3220003",
    "centro_custo_id": "cc-infraestrutura-de-ti",
    "orcamento_aprovado": {
      "jan": 80.0,
      "fev": 80.0,
      "mar": 80.0,
      "abr": 80.0,
      "mai": 80.0,
      "jun": 80.0,
      "jul": 80.0,
      "ago": 80.0,
      "set": 80.0,
      "out": 80.0,
      "nov": 80.0,
      "dez": 80.0
    }
  },
  {
    "id": "cc-sistemas-de-ti__ct-3200001",
    "nome": "TELEFONIA (FIXA E MÓVEL)",
    "conta_codigo": "3200001",
    "centro_custo_id": "cc-sistemas-de-ti",
    "orcamento_aprovado": {
      "jan": 130.08,
      "fev": 130.08,
      "mar": 130.08,
      "abr": 130.08,
      "mai": 130.08,
      "jun": 130.08,
      "jul": 130.08,
      "ago": 130.08,
      "set": 130.08,
      "out": 130.08,
      "nov": 130.08,
      "dez": 130.08
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3220004",
    "nome": "MATERIAIS SUPRIMENTOS DE INFORMÁTICA",
    "conta_codigo": "3220004",
    "centro_custo_id": "cc-infraestrutura-de-ti",
    "orcamento_aprovado": {
      "jan": 3200.0,
      "fev": 3200.0,
      "mar": 3200.0,
      "abr": 3200.0,
      "mai": 3200.0,
      "jun": 3200.0,
      "jul": 3200.0,
      "ago": 3200.0,
      "set": 3200.0,
      "out": 3200.0,
      "nov": 3200.0,
      "dez": 3200.0
    }
  },
  {
    "id": "cc-filial-sao-paulo__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-filial-sao-paulo",
    "orcamento_aprovado": {
      "jan": 5200.0,
      "fev": 5200.0,
      "mar": 5200.0,
      "abr": 5200.0,
      "mai": 5200.0,
      "jun": 5200.0,
      "jul": 5200.0,
      "ago": 5200.0,
      "set": 5200.0,
      "out": 5200.0,
      "nov": 5200.0,
      "dez": 5200.0
    }
  },
  {
    "id": "cc-filial-gama__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-filial-gama",
    "orcamento_aprovado": {
      "jan": 5174.72,
      "fev": 5174.72,
      "mar": 5174.72,
      "abr": 5174.72,
      "mai": 5174.72,
      "jun": 5194.72,
      "jul": 5194.72,
      "ago": 5194.72,
      "set": 5194.72,
      "out": 5194.72,
      "nov": 5446.09,
      "dez": 5446.09
    }
  },
  {
    "id": "cc-filial-contagem__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-filial-contagem",
    "orcamento_aprovado": {
      "jan": 1850.0,
      "fev": 1850.0,
      "mar": 1850.0,
      "abr": 1850.0,
      "mai": 1850.0,
      "jun": 1850.0,
      "jul": 1850.0,
      "ago": 1850.0,
      "set": 1850.0,
      "out": 1850.0,
      "nov": 1850.0,
      "dez": 1850.0
    }
  },
  {
    "id": "cc-filial-pina__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-filial-pina",
    "orcamento_aprovado": {
      "jan": 1500.0,
      "fev": 1500.0,
      "mar": 1500.0,
      "abr": 1500.0,
      "mai": 1500.0,
      "jun": 1500.0,
      "jul": 1500.0,
      "ago": 1500.0,
      "set": 1500.0,
      "out": 1500.0,
      "nov": 1500.0,
      "dez": 1500.0
    }
  },
  {
    "id": "cc-sistemas-de-ti__ct-3200003",
    "nome": "TRANSFERENCIA DE DADOS",
    "conta_codigo": "3200003",
    "centro_custo_id": "cc-sistemas-de-ti",
    "orcamento_aprovado": {
      "jan": 43462.16,
      "fev": 43615.09,
      "mar": 44463.25,
      "abr": 43644.59,
      "mai": 43886.53,
      "jun": 44096.79,
      "jul": 44706.44,
      "ago": 44706.44,
      "set": 43528.38,
      "out": 43938.95,
      "nov": 43938.95,
      "dez": 43938.95
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-infraestrutura-de-ti",
    "orcamento_aprovado": {
      "jan": 13500.0,
      "fev": 13500.0,
      "mar": 13500.0,
      "abr": 13500.0,
      "mai": 13500.0,
      "jun": 13500.0,
      "jul": 13500.0,
      "ago": 13500.0,
      "set": 13500.0,
      "out": 13500.0,
      "nov": 13500.0,
      "dez": 13500.0
    }
  },
  {
    "id": "cc-sistemas-de-ti__ct-3220003",
    "nome": "MATERIAIS DE ESCRITÓRIO",
    "conta_codigo": "3220003",
    "centro_custo_id": "cc-sistemas-de-ti",
    "orcamento_aprovado": {
      "jan": 80.0,
      "fev": 80.0,
      "mar": 80.0,
      "abr": 80.0,
      "mai": 80.0,
      "jun": 80.0,
      "jul": 80.0,
      "ago": 80.0,
      "set": 80.0,
      "out": 80.0,
      "nov": 80.0,
      "dez": 80.0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3220015",
    "nome": "MÓVEIS E UTENSÍLIOS",
    "conta_codigo": "3220015",
    "centro_custo_id": "cc-infraestrutura-de-ti",
    "orcamento_aprovado": {
      "jan": 1000.0,
      "fev": 1000.0,
      "mar": 1000.0,
      "abr": 1000.0,
      "mai": 1000.0,
      "jun": 1000.0,
      "jul": 1000.0,
      "ago": 1000.0,
      "set": 1000.0,
      "out": 1000.0,
      "nov": 1000.0,
      "dez": 1000.0
    }
  },
  {
    "id": "cc-prime-recife__ct-3190004",
    "nome": "ALUGUEL DE MÁQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3190004",
    "centro_custo_id": "cc-prime-recife",
    "orcamento_aprovado": {
      "jan": 29500.0,
      "fev": 29500.0,
      "mar": 29500.0,
      "abr": 29500.0,
      "mai": 29500.0,
      "jun": 29500.0,
      "jul": 29500.0,
      "ago": 29500.0,
      "set": 29500.0,
      "out": 29500.0,
      "nov": 29500.0,
      "dez": 29500.0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3240009",
    "nome": "CÓPIAS, AUTENTICAÇÕES E ENCADERNAÇÕES",
    "conta_codigo": "3240009",
    "centro_custo_id": "cc-infraestrutura-de-ti",
    "orcamento_aprovado": {
      "jan": 0.0,
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
    "id": "cc-sistemas-de-ti__ct-3220004",
    "nome": "MATERIAIS SUPRIMENTOS DE INFORMÁTICA",
    "conta_codigo": "3220004",
    "centro_custo_id": "cc-sistemas-de-ti",
    "orcamento_aprovado": {
      "jan": 2000.0,
      "fev": 2000.0,
      "mar": 2000.0,
      "abr": 2000.0,
      "mai": 2000.0,
      "jun": 2000.0,
      "jul": 2000.0,
      "ago": 2000.0,
      "set": 2000.0,
      "out": 2000.0,
      "nov": 2000.0,
      "dez": 2000.0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3250003",
    "nome": "REFEIÇÕES E LANCHES",
    "conta_codigo": "3250003",
    "centro_custo_id": "cc-infraestrutura-de-ti",
    "orcamento_aprovado": {
      "jan": 1500.0,
      "fev": 1500.0,
      "mar": 1500.0,
      "abr": 1500.0,
      "mai": 1500.0,
      "jun": 1500.0,
      "jul": 1500.0,
      "ago": 1500.0,
      "set": 1500.0,
      "out": 1500.0,
      "nov": 1500.0,
      "dez": 1500.0
    }
  },
  {
    "id": "cc-sistemas-de-ti__ct-3220015",
    "nome": "MÓVEIS E UTENSÍLIOS",
    "conta_codigo": "3220015",
    "centro_custo_id": "cc-sistemas-de-ti",
    "orcamento_aprovado": {
      "jan": 1500.0,
      "fev": 1500.0,
      "mar": 1500.0,
      "abr": 1500.0,
      "mai": 1500.0,
      "jun": 1500.0,
      "jul": 1500.0,
      "ago": 1500.0,
      "set": 1500.0,
      "out": 1500.0,
      "nov": 1500.0,
      "dez": 1500.0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3250004",
    "nome": "DESPESAS DE TÁXI, TRANSPCOLET E ESTAC",
    "conta_codigo": "3250004",
    "centro_custo_id": "cc-infraestrutura-de-ti",
    "orcamento_aprovado": {
      "jan": 1000.0,
      "fev": 1000.0,
      "mar": 1000.0,
      "abr": 1000.0,
      "mai": 1000.0,
      "jun": 1000.0,
      "jul": 1000.0,
      "ago": 1000.0,
      "set": 1000.0,
      "out": 1000.0,
      "nov": 1000.0,
      "dez": 1000.0
    }
  },
  {
    "id": "cc-sistemas-de-ti__ct-3250003",
    "nome": "REFEIÇÕES E LANCHES",
    "conta_codigo": "3250003",
    "centro_custo_id": "cc-sistemas-de-ti",
    "orcamento_aprovado": {
      "jan": 500.0,
      "fev": 500.0,
      "mar": 500.0,
      "abr": 500.0,
      "mai": 500.0,
      "jun": 500.0,
      "jul": 500.0,
      "ago": 500.0,
      "set": 500.0,
      "out": 500.0,
      "nov": 500.0,
      "dez": 500.0
    }
  },
  {
    "id": "cc-prime-recife__ct-3250003",
    "nome": "REFEIÇÕES E LANCHES",
    "conta_codigo": "3250003",
    "centro_custo_id": "cc-prime-recife",
    "orcamento_aprovado": {
      "jan": 350.0,
      "fev": 350.0,
      "mar": 350.0,
      "abr": 350.0,
      "mai": 350.0,
      "jun": 350.0,
      "jul": 350.0,
      "ago": 350.0,
      "set": 350.0,
      "out": 350.0,
      "nov": 350.0,
      "dez": 350.0
    }
  },
  {
    "id": "cc-filial-gama__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-filial-gama",
    "orcamento_aprovado": {
      "jan": 1650.0,
      "fev": 1650.0,
      "mar": 1650.0,
      "abr": 1650.0,
      "mai": 1650.0,
      "jun": 1650.0,
      "jul": 1650.0,
      "ago": 1650.0,
      "set": 1650.0,
      "out": 1650.0,
      "nov": 1650.0,
      "dez": 1650.0
    }
  },
  {
    "id": "cc-sistemas-de-ti__ct-3250004",
    "nome": "DESPESAS DE TÁXI, TRANSPCOLET E ESTAC",
    "conta_codigo": "3250004",
    "centro_custo_id": "cc-sistemas-de-ti",
    "orcamento_aprovado": {
      "jan": 1000.0,
      "fev": 1000.0,
      "mar": 1000.0,
      "abr": 1000.0,
      "mai": 1000.0,
      "jun": 1000.0,
      "jul": 1000.0,
      "ago": 1000.0,
      "set": 1000.0,
      "out": 1000.0,
      "nov": 1000.0,
      "dez": 1000.0
    }
  },
  {
    "id": "cc-sistemas-de-ti__ct-3250005",
    "nome": "VIAGENS E ESTADAS",
    "conta_codigo": "3250005",
    "centro_custo_id": "cc-sistemas-de-ti",
    "orcamento_aprovado": {
      "jan": 3500.0,
      "fev": 3500.0,
      "mar": 3500.0,
      "abr": 3500.0,
      "mai": 3500.0,
      "jun": 3500.0,
      "jul": 3500.0,
      "ago": 3500.0,
      "set": 3500.0,
      "out": 3500.0,
      "nov": 3500.0,
      "dez": 3500.0
    }
  },
  {
    "id": "cc-infraestrutura-de-ti__ct-3250005",
    "nome": "VIAGENS E ESTADAS",
    "conta_codigo": "3250005",
    "centro_custo_id": "cc-infraestrutura-de-ti",
    "orcamento_aprovado": {
      "jan": 3500.0,
      "fev": 3500.0,
      "mar": 3500.0,
      "abr": 3500.0,
      "mai": 3500.0,
      "jun": 3500.0,
      "jul": 3500.0,
      "ago": 3500.0,
      "set": 3500.0,
      "out": 3500.0,
      "nov": 3500.0,
      "dez": 3500.0
    }
  },
  {
    "id": "cc-prime-recife__ct-3250005",
    "nome": "VIAGENS E ESTADAS",
    "conta_codigo": "3250005",
    "centro_custo_id": "cc-prime-recife",
    "orcamento_aprovado": {
      "jan": 3000.0,
      "fev": 3000.0,
      "mar": 3000.0,
      "abr": 3000.0,
      "mai": 3000.0,
      "jun": 3000.0,
      "jul": 3000.0,
      "ago": 3000.0,
      "set": 3000.0,
      "out": 3000.0,
      "nov": 3000.0,
      "dez": 3000.0
    }
  },
  {
    "id": "cc-prime-alcobaca__ct-3250005",
    "nome": "VIAGENS E ESTADAS",
    "conta_codigo": "3250005",
    "centro_custo_id": "cc-prime-alcobaca",
    "orcamento_aprovado": {
      "jan": 0.0,
      "fev": 0.0,
      "mar": 0.0,
      "abr": 0.0,
      "mai": 0.0,
      "jun": 0.0,
      "jul": 0.0,
      "ago": 0.0,
      "set": 0.0,
      "out": 0.0,
      "nov": 0.0,
      "dez": 0.0
    }
  },
  {
    "id": "cc-prime-braganca__ct-3250005",
    "nome": "VIAGENS E ESTADAS",
    "conta_codigo": "3250005",
    "centro_custo_id": "cc-prime-braganca",
    "orcamento_aprovado": {
      "jan": 0.0,
      "fev": 0.0,
      "mar": 0.0,
      "abr": 0.0,
      "mai": 0.0,
      "jun": 0.0,
      "jul": 0.0,
      "ago": 0.0,
      "set": 0.0,
      "out": 0.0,
      "nov": 0.0,
      "dez": 0.0
    }
  },
  {
    "id": "cc-prime-recife__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-prime-recife",
    "orcamento_aprovado": {
      "jan": 14863.36,
      "fev": 14863.36,
      "mar": 14863.36,
      "abr": 14863.36,
      "mai": 14863.36,
      "jun": 14863.36,
      "jul": 22500.0,
      "ago": 19500.0,
      "set": 19500.0,
      "out": 19500.0,
      "nov": 19500.0,
      "dez": 19500.0
    }
  },
  {
    "id": "cc-prime-recife__ct-3170011",
    "nome": "MANUTENÇÃO DE SISTEMA CFTV",
    "conta_codigo": "3170011",
    "centro_custo_id": "cc-prime-recife",
    "orcamento_aprovado": {
      "jan": 0.0,
      "fev": 0.0,
      "mar": 0.0,
      "abr": 0.0,
      "mai": 0.0,
      "jun": 0.0,
      "jul": 0.0,
      "ago": 0.0,
      "set": 0.0,
      "out": 0.0,
      "nov": 0.0,
      "dez": 0.0
    }
  },
  {
    "id": "cc-prime-recife__ct-3200001",
    "nome": "TELEFONIA (FIXA E MÓVEL)",
    "conta_codigo": "3200001",
    "centro_custo_id": "cc-prime-recife",
    "orcamento_aprovado": {
      "jan": 2500.0,
      "fev": 2500.0,
      "mar": 2500.0,
      "abr": 2500.0,
      "mai": 2500.0,
      "jun": 2500.0,
      "jul": 2500.0,
      "ago": 2500.0,
      "set": 2500.0,
      "out": 2500.0,
      "nov": 2500.0,
      "dez": 2500.0
    }
  },
  {
    "id": "cc-prime-recife__ct-3200003",
    "nome": "TRANSFERENCIA DE DADOS",
    "conta_codigo": "3200003",
    "centro_custo_id": "cc-prime-recife",
    "orcamento_aprovado": {
      "jan": 275.0,
      "fev": 275.0,
      "mar": 275.0,
      "abr": 275.0,
      "mai": 275.0,
      "jun": 275.0,
      "jul": 626.43,
      "ago": 275.0,
      "set": 275.0,
      "out": 275.0,
      "nov": 275.0,
      "dez": 275.0
    }
  },
  {
    "id": "cc-prime-recife__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-prime-recife",
    "orcamento_aprovado": {
      "jan": 1424.9,
      "fev": 1424.9,
      "mar": 1424.9,
      "abr": 1424.9,
      "mai": 1424.9,
      "jun": 1424.9,
      "jul": 1424.9,
      "ago": 1424.9,
      "set": 1424.9,
      "out": 1424.9,
      "nov": 1424.9,
      "dez": 1424.9
    }
  },
  {
    "id": "cc-prime-recife__ct-3220004",
    "nome": "MATERIAIS SUPRIMENTOS DE INFORMÁTICA",
    "conta_codigo": "3220004",
    "centro_custo_id": "cc-prime-recife",
    "orcamento_aprovado": {
      "jan": 1000.0,
      "fev": 1000.0,
      "mar": 1000.0,
      "abr": 1000.0,
      "mai": 1000.0,
      "jun": 1000.0,
      "jul": 1000.0,
      "ago": 1000.0,
      "set": 1000.0,
      "out": 1000.0,
      "nov": 1000.0,
      "dez": 1000.0
    }
  },
  {
    "id": "cc-prime-recife__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-prime-recife",
    "orcamento_aprovado": {
      "jan": 6450.0,
      "fev": 6450.0,
      "mar": 6450.0,
      "abr": 6450.0,
      "mai": 6450.0,
      "jun": 6450.0,
      "jul": 6450.0,
      "ago": 6450.0,
      "set": 6450.0,
      "out": 6450.0,
      "nov": 6450.0,
      "dez": 6450.0
    }
  },
  {
    "id": "cc-prime-recife__ct-3250004",
    "nome": "DESPESAS DE TÁXI, TRANSPCOLET E ESTAC",
    "conta_codigo": "3250004",
    "centro_custo_id": "cc-prime-recife",
    "orcamento_aprovado": {
      "jan": 900.0,
      "fev": 900.0,
      "mar": 900.0,
      "abr": 900.0,
      "mai": 900.0,
      "jun": 900.0,
      "jul": 900.0,
      "ago": 900.0,
      "set": 900.0,
      "out": 900.0,
      "nov": 900.0,
      "dez": 900.0
    }
  },
  {
    "id": "cc-prime-alcobaca__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-prime-alcobaca",
    "orcamento_aprovado": {
      "jan": 2450.0,
      "fev": 2450.0,
      "mar": 2450.0,
      "abr": 2450.0,
      "mai": 2450.0,
      "jun": 2450.0,
      "jul": 3000.12,
      "ago": 2450.0,
      "set": 2450.0,
      "out": 2450.0,
      "nov": 2450.0,
      "dez": 2450.0
    }
  },
  {
    "id": "cc-prime-alcobaca__ct-3190004",
    "nome": "ALUGUEL DE MÁQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3190004",
    "centro_custo_id": "cc-prime-alcobaca",
    "orcamento_aprovado": {
      "jan": 350.0,
      "fev": 350.0,
      "mar": 350.0,
      "abr": 350.0,
      "mai": 350.0,
      "jun": 350.0,
      "jul": 350.0,
      "ago": 350.0,
      "set": 350.0,
      "out": 350.0,
      "nov": 350.0,
      "dez": 350.0
    }
  },
  {
    "id": "cc-prime-alcobaca__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-prime-alcobaca",
    "orcamento_aprovado": {
      "jan": 6280.0,
      "fev": 6280.0,
      "mar": 6280.0,
      "abr": 6280.0,
      "mai": 6280.0,
      "jun": 6280.0,
      "jul": 6280.0,
      "ago": 6280.0,
      "set": 6280.0,
      "out": 6280.0,
      "nov": 6280.0,
      "dez": 6280.0
    }
  },
  {
    "id": "cc-prime-alcobaca__ct-3220004",
    "nome": "MATERIAIS SUPRIMENTOS DE INFORMÁTICA",
    "conta_codigo": "3220004",
    "centro_custo_id": "cc-prime-alcobaca",
    "orcamento_aprovado": {
      "jan": 500.0,
      "fev": 500.0,
      "mar": 500.0,
      "abr": 500.0,
      "mai": 500.0,
      "jun": 500.0,
      "jul": 500.0,
      "ago": 500.0,
      "set": 500.0,
      "out": 500.0,
      "nov": 500.0,
      "dez": 500.0
    }
  },
  {
    "id": "cc-prime-alcobaca__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-prime-alcobaca",
    "orcamento_aprovado": {
      "jan": 1470.0,
      "fev": 1470.0,
      "mar": 1470.0,
      "abr": 1470.0,
      "mai": 1470.0,
      "jun": 1470.0,
      "jul": 1470.0,
      "ago": 1470.0,
      "set": 1470.0,
      "out": 1470.0,
      "nov": 1470.0,
      "dez": 1470.0
    }
  },
  {
    "id": "cc-filial-ribeirao-pires__ct-3170002",
    "nome": "MANUTENÇÃO DE MAQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3170002",
    "centro_custo_id": "cc-filial-ribeirao-pires",
    "orcamento_aprovado": {
      "jan": 350.0,
      "fev": 350.0,
      "mar": 350.0,
      "abr": 350.0,
      "mai": 350.0,
      "jun": 350.0,
      "jul": 350.0,
      "ago": 350.0,
      "set": 350.0,
      "out": 350.0,
      "nov": 350.0,
      "dez": 350.0
    }
  },
  {
    "id": "cc-filial-ribeirao-pires__ct-3170004",
    "nome": "MANUTENÇÃO MÁQUINAS E EQUIPAMENTOS PROCESSAMENTO DE DADOS",
    "conta_codigo": "3170004",
    "centro_custo_id": "cc-filial-ribeirao-pires",
    "orcamento_aprovado": {
      "jan": 1999.1,
      "fev": 2099.05,
      "mar": 2099.05,
      "abr": 2099.05,
      "mai": 2099.05,
      "jun": 2099.05,
      "jul": 2099.05,
      "ago": 2099.05,
      "set": 2099.05,
      "out": 2099.05,
      "nov": 2099.05,
      "dez": 2099.05
    }
  },
  {
    "id": "cc-filial-ribeirao-pires__ct-3190004",
    "nome": "ALUGUEL DE MÁQUINAS E EQUIPAMENTOS",
    "conta_codigo": "3190004",
    "centro_custo_id": "cc-filial-ribeirao-pires",
    "orcamento_aprovado": {
      "jan": 0.0,
      "fev": 0.0,
      "mar": 0.0,
      "abr": 0.0,
      "mai": 0.0,
      "jun": 0.0,
      "jul": 0.0,
      "ago": 0.0,
      "set": 0.0,
      "out": 0.0,
      "nov": 0.0,
      "dez": 0.0
    }
  },
  {
    "id": "cc-filial-ribeirao-pires__ct-3200001",
    "nome": "TELEFONIA (FIXA E MÓVEL)",
    "conta_codigo": "3200001",
    "centro_custo_id": "cc-filial-ribeirao-pires",
    "orcamento_aprovado": {
      "jan": 449.99,
      "fev": 449.99,
      "mar": 479.03,
      "abr": 479.03,
      "mai": 479.03,
      "jun": 479.03,
      "jul": 479.03,
      "ago": 479.03,
      "set": 479.03,
      "out": 479.03,
      "nov": 479.03,
      "dez": 479.03
    }
  },
  {
    "id": "cc-filial-ribeirao-pires__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-filial-ribeirao-pires",
    "orcamento_aprovado": {
      "jan": 3914.18,
      "fev": 3755.18,
      "mar": 3836.67,
      "abr": 3876.67,
      "mai": 3876.67,
      "jun": 3876.67,
      "jul": 3876.67,
      "ago": 3876.67,
      "set": 3876.67,
      "out": 3876.67,
      "nov": 3961.62,
      "dez": 3961.62
    }
  },
  {
    "id": "cc-filial-ribeirao-pires__ct-3220004",
    "nome": "MATERIAIS SUPRIMENTOS DE INFORMÁTICA",
    "conta_codigo": "3220004",
    "centro_custo_id": "cc-filial-ribeirao-pires",
    "orcamento_aprovado": {
      "jan": 0.0,
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
    "id": "cc-filial-ribeirao-pires__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-filial-ribeirao-pires",
    "orcamento_aprovado": {
      "jan": 3800.0,
      "fev": 3800.0,
      "mar": 3800.0,
      "abr": 3800.0,
      "mai": 3800.0,
      "jun": 3800.0,
      "jul": 3800.0,
      "ago": 3800.0,
      "set": 3800.0,
      "out": 3800.0,
      "nov": 3800.0,
      "dez": 3800.0
    }
  },
  {
    "id": "cc-prime-braganca__ct-3120006",
    "nome": "PRESTADOR SERVIÇO PESSOA JURÍDICA",
    "conta_codigo": "3120006",
    "centro_custo_id": "cc-prime-braganca",
    "orcamento_aprovado": {
      "jan": 2500.0,
      "fev": 2500.0,
      "mar": 2500.0,
      "abr": 2916.67,
      "mai": 2916.67,
      "jun": 2916.67,
      "jul": 2916.67,
      "ago": 2916.67,
      "set": 2916.67,
      "out": 2916.67,
      "nov": 2916.67,
      "dez": 2916.67
    }
  },
  {
    "id": "cc-prime-braganca__ct-3170008",
    "nome": "MANUTENÇÃO DE SOFTWARE",
    "conta_codigo": "3170008",
    "centro_custo_id": "cc-prime-braganca",
    "orcamento_aprovado": {
      "jan": 2300.0,
      "fev": 2300.0,
      "mar": 2300.0,
      "abr": 2300.0,
      "mai": 2300.0,
      "jun": 2300.0,
      "jul": 2300.0,
      "ago": 2300.0,
      "set": 2300.0,
      "out": 2300.0,
      "nov": 2300.0,
      "dez": 2300.0
    }
  },
  {
    "id": "cc-prime-braganca__ct-3200003",
    "nome": "TRANSFERENCIA DE DADOS",
    "conta_codigo": "3200003",
    "centro_custo_id": "cc-prime-braganca",
    "orcamento_aprovado": {
      "jan": 280.0,
      "fev": 280.0,
      "mar": 280.0,
      "abr": 280.0,
      "mai": 280.0,
      "jun": 280.0,
      "jul": 280.0,
      "ago": 280.0,
      "set": 280.0,
      "out": 280.0,
      "nov": 280.0,
      "dez": 280.0
    }
  },
  {
    "id": "cc-prime-braganca__ct-3200004",
    "nome": "LINKS E INTERNET",
    "conta_codigo": "3200004",
    "centro_custo_id": "cc-prime-braganca",
    "orcamento_aprovado": {
      "jan": 2790.0,
      "fev": 2790.0,
      "mar": 2790.0,
      "abr": 2790.0,
      "mai": 2790.0,
      "jun": 2790.0,
      "jul": 2790.0,
      "ago": 2790.0,
      "set": 2790.0,
      "out": 2790.0,
      "nov": 2790.0,
      "dez": 2790.0
    }
  },
  {
    "id": "cc-prime-braganca__ct-3220004",
    "nome": "MATERIAIS SUPRIMENTOS DE INFORMÁTICA",
    "conta_codigo": "3220004",
    "centro_custo_id": "cc-prime-braganca",
    "orcamento_aprovado": {
      "jan": 500.0,
      "fev": 500.0,
      "mar": 500.0,
      "abr": 500.0,
      "mai": 500.0,
      "jun": 500.0,
      "jul": 500.0,
      "ago": 500.0,
      "set": 500.0,
      "out": 500.0,
      "nov": 500.0,
      "dez": 500.0
    }
  },
  {
    "id": "cc-prime-braganca__ct-3220013",
    "nome": "IMPRESSOS",
    "conta_codigo": "3220013",
    "centro_custo_id": "cc-prime-braganca",
    "orcamento_aprovado": {
      "jan": 1000.0,
      "fev": 1000.0,
      "mar": 1000.0,
      "abr": 1000.0,
      "mai": 1000.0,
      "jun": 1000.0,
      "jul": 1000.0,
      "ago": 1000.0,
      "set": 1000.0,
      "out": 1000.0,
      "nov": 1000.0,
      "dez": 1000.0
    }
  },
  {
    "id": "cc-prime-braganca__ct-3240002",
    "nome": "CONSULTORIA, DESPACHANTES E AUDITORIA",
    "conta_codigo": "3240002",
    "centro_custo_id": "cc-prime-braganca",
    "orcamento_aprovado": {
      "jan": 2625.0,
      "fev": 2625.0,
      "mar": 2625.0,
      "abr": 2625.0,
      "mai": 2625.0,
      "jun": 2625.0,
      "jul": 2625.0,
      "ago": 2625.0,
      "set": 2625.0,
      "out": 2625.0,
      "nov": 2625.0,
      "dez": 2625.0
    }
  }
];
