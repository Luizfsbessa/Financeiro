// ============================================================
// rateio-csv.js
// Leitura e validação do CSV de importação das fatias do rateio.
// Funções puras (sem DOM e sem Firebase), pra poderem ser testadas
// isoladamente. Quem desenha a tela e consulta o banco é o rateio.js.
//
// Princípio: em dado financeiro, nunca adivinhar. Centro que não bate
// exatamente (por código ou por nome), percentual ilegível ou linha com
// colunas a mais vira ERRO na lista — a linha é pulada e a pessoa decide,
// em vez de o sistema escolher um Centro "parecido" por conta própria.
// ============================================================

/** Minúsculas, sem acento, espaços colapsados — usado pra comparar textos. */
export function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizarCabecalho(valor) {
  return normalizarTexto(valor).replace(/[_\-]+/g, " ");
}

// Nomes de coluna aceitos (já normalizados). A coluna "servico" é opcional.
const ALIASES = {
  centro: ["centro", "centro custo", "centro de custo", "cc", "codigo centro", "codigo do centro", "cod centro"],
  percentual: ["percentual", "percentual (%)", "%", "perc", "percentagem", "rateio"],
  servico: ["servico", "servico prestador", "servico/prestador", "prestador", "fornecedor"],
};

/**
 * Lê o arquivo como texto. Tenta UTF-8 e, se houver bytes inválidos, cai pra
 * Windows-1252 — que é como o Excel em português salva "CSV" por padrão.
 * Sem isso, "São Paulo" chegaria como "S�o Paulo" e nunca bateria com o cadastro.
 */
export function decodificarCsv(buffer) {
  const bytes = new Uint8Array(buffer);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

function detectarSeparador(linha) {
  const contagem = { ";": 0, ",": 0, "\t": 0 };
  let dentroDeAspas = false;
  for (const ch of linha) {
    if (ch === '"') dentroDeAspas = !dentroDeAspas;
    else if (!dentroDeAspas && ch in contagem) contagem[ch]++;
  }
  const [melhor, quantidade] = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0];
  return quantidade > 0 ? melhor : ";";
}

function dividirLinha(linha, separador) {
  const campos = [];
  let atual = "";
  let dentroDeAspas = false;
  for (let i = 0; i < linha.length; i++) {
    const ch = linha[i];
    if (ch === '"') {
      if (dentroDeAspas && linha[i + 1] === '"') {
        atual += '"';
        i++;
      } else {
        dentroDeAspas = !dentroDeAspas;
      }
    } else if (ch === separador && !dentroDeAspas) {
      campos.push(atual);
      atual = "";
    } else {
      atual += ch;
    }
  }
  campos.push(atual);
  return campos.map((c) => c.trim());
}

/** "33,3333", "33.3333" e "33,3333%" viram 33.3333. Devolve null se vazio e NaN se ilegível. */
function lerPercentual(bruto) {
  let texto = String(bruto ?? "").replace(/%/g, "").replace(/\s/g, "");
  if (!texto) return null;
  if (texto.includes(",")) texto = texto.replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(texto)) return NaN;
  return Number(texto);
}

/**
 * @returns {{ erroFatal: string } | { separador: string, linhas: Array<{numero:number, centro:string, percentual:number, servico:string}>, erros: Array<{numero:number, mensagem:string}>, avisos: string[], soma: number }}
 * `numero` é a linha do arquivo (1 = cabeçalho), igual ao que o Excel mostra.
 */
export function lerCsv(texto) {
  const linhasBrutas = String(texto).replace(/^\uFEFF/, "").split(/\r\n|\n|\r/);
  const indiceCabecalho = linhasBrutas.findIndex((l) => l.trim() !== "");
  if (indiceCabecalho === -1) return { erroFatal: "O arquivo está vazio." };

  const separador = detectarSeparador(linhasBrutas[indiceCabecalho]);
  const cabecalhoOriginal = dividirLinha(linhasBrutas[indiceCabecalho], separador);
  const cabecalho = cabecalhoOriginal.map(normalizarCabecalho);

  const coluna = {};
  for (const [campo, aliases] of Object.entries(ALIASES)) {
    coluna[campo] = cabecalho.findIndex((h) => aliases.includes(h));
  }

  const faltando = ["centro", "percentual"].filter((campo) => coluna[campo] === -1);
  if (faltando.length > 0) {
    return {
      erroFatal: `Faltam colunas no cabeçalho (primeira linha): ${faltando.join(", ")}. Colunas encontradas: ${cabecalhoOriginal.join(" | ") || "nenhuma"}.`,
    };
  }

  const linhas = [];
  const erros = [];
  const avisos = [];

  for (let i = indiceCabecalho + 1; i < linhasBrutas.length; i++) {
    const numero = i + 1;
    if (linhasBrutas[i].trim() === "") continue;

    const campos = dividirLinha(linhasBrutas[i], separador);
    if (campos.every((c) => c === "")) continue;

    if (campos.length > cabecalho.length) {
      erros.push({
        numero,
        mensagem: `tem ${campos.length} colunas e o cabeçalho tem ${cabecalho.length}. Se o separador é vírgula, o percentual com vírgula decimal precisa estar entre aspas — ou salve o arquivo com ponto e vírgula como separador.`,
      });
      continue;
    }

    const centro = campos[coluna.centro] ?? "";
    const percentualBruto = campos[coluna.percentual] ?? "";
    const servico = coluna.servico === -1 ? "" : campos[coluna.servico] ?? "";

    if (!centro) {
      erros.push({ numero, mensagem: "o centro está em branco." });
      continue;
    }

    const percentual = lerPercentual(percentualBruto);
    if (percentual === null) {
      erros.push({ numero, mensagem: `o percentual do centro "${centro}" está em branco.` });
      continue;
    }
    if (Number.isNaN(percentual)) {
      erros.push({ numero, mensagem: `percentual "${percentualBruto}" não é um número válido (use algo como 33,3333).` });
      continue;
    }
    if (percentual <= 0 || percentual > 100) {
      erros.push({ numero, mensagem: `percentual ${percentualBruto} fora do intervalo (precisa ser maior que 0 e no máximo 100).` });
      continue;
    }

    const arredondado = Math.round(percentual * 10000) / 10000;
    if (arredondado !== percentual) {
      avisos.push(`Linha ${numero}: "${percentualBruto}" tem mais de 4 casas decimais e foi arredondado para ${arredondado.toFixed(4).replace(".", ",")}.`);
    }

    linhas.push({ numero, centro, percentual: arredondado, servico });
  }

  if (linhas.length === 0 && erros.length === 0) {
    return { erroFatal: "O arquivo só tem o cabeçalho — não há nenhuma linha de dados." };
  }

  const soma = linhas.reduce((acc, l) => acc + l.percentual, 0);
  return { separador, linhas, erros, avisos, soma };
}

/**
 * Acha o Centro de Custo pelo código OU pelo nome, comparando sem acento e
 * sem diferença de maiúscula — mas sempre exato. Nunca escolhe "o mais
 * parecido": se não achar, só sugere.
 * @returns {{ centro: object } | { erro: string }}
 */
export function encontrarCentro(texto, centros) {
  const alvo = normalizarTexto(texto);

  const porCodigo = centros.filter((c) => c.codigo_centro && normalizarTexto(c.codigo_centro) === alvo);
  if (porCodigo.length === 1) return { centro: porCodigo[0] };
  if (porCodigo.length > 1) {
    return { erro: `o código "${texto}" existe em mais de um Centro de Custo — use o nome exato.` };
  }

  const porNome = centros.filter((c) => normalizarTexto(c.nome) === alvo);
  if (porNome.length === 1) return { centro: porNome[0] };
  if (porNome.length > 1) {
    return { erro: `existe mais de um Centro de Custo chamado "${texto}" — use o código.` };
  }

  const sugestoes =
    alvo.length >= 3
      ? centros.filter((c) => normalizarTexto(c.nome).includes(alvo) || alvo.includes(normalizarTexto(c.nome))).slice(0, 3)
      : [];
  return {
    erro:
      `centro "${texto}" não encontrado — use o código ou o nome exato do cadastro.` +
      (sugestoes.length ? ` Parecidos: ${sugestoes.map((c) => c.nome).join("; ")}.` : ""),
  };
}

/**
 * Acha o Serviço/Prestador pelo nome ou pelo código do fornecedor.
 * @returns {{ servico: object } | { erro: string }}
 */
export function encontrarServico(texto, servicos) {
  const alvo = normalizarTexto(texto);
  const achados = servicos.filter(
    (s) => normalizarTexto(s.nome) === alvo || (s.cod_fornecedor && normalizarTexto(s.cod_fornecedor) === alvo)
  );
  if (achados.length === 1) return { servico: achados[0] };
  if (achados.length > 1) return { erro: `mais de um serviço bate com "${texto}"` };
  return { erro: `serviço "${texto}" não encontrado nesta conta` };
}

/** Conteúdo do arquivo-modelo que a pessoa baixa pela dica. */
export function modeloCsv() {
  return ["centro;percentual;servico", "Filial Exemplo A;50,0000;", "Filial Exemplo B;50,0000;"].join("\r\n") + "\r\n";
}
