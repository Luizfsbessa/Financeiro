// ============================================================
// rateio.js
// Rateio de uma NF entre vários Centros de Custo, quando a Conta
// Contábil é a mesma em todas as fatias (ex.: telefonia dividida
// entre filiais). Uma única Ordem de Pagamento cobre o valor total;
// cada fatia vira um lançamento próprio contra o Centro/Serviço
// certo (pra não gerar divergência artificial na linha de cada
// Centro), mas o débito de saldo na OP acontece uma vez só, pela
// soma de tudo — ver registrarLancamentoRateado em firestore.js.
// ============================================================

import {
  listarCentrosCusto,
  listarTodasContas,
  listarServicosPorConta,
  orcamentoProjetadoDoMes,
  buscarContaPorCentroECodigo,
  listarOrdensPagamentoRateioPorCodigo,
  registrarLancamentoRateado,
} from "./firestore.js";
import { processarLancamento } from "./conciliacao.js";
import { dadosDoLancador } from "./auth.js";
import { invalidarDashboard, invalidarPainelTerceiros } from "./dashboard.js";
import { montarLinkMovidesk } from "./integracoes.js";
import { lerCsv, decodificarCsv, encontrarCentro, encontrarServico, modeloCsv } from "./rateio-csv.js";

const formatadorRS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

let listenersConectados = false;
let usuarioAtual = null;
let contadorLinhas = 0;
let catalogoCodigos = []; // [{codigo, nome}] únicos, pra autocomplete do código da conta
let opsCarregadas = []; // Ordens de Pagamento de rateio da conta atualmente selecionada

export function iniciarRateio(user) {
  usuarioAtual = user;
  if (listenersConectados) return;
  listenersConectados = true;

  document.getElementById("rat-valor-total")?.addEventListener("input", recalcularTotais);

  const inputProtocoloRateio = document.getElementById("rat-protocolo-movidesk");
  const linkMovideskRateio = document.getElementById("rat-link-movidesk");
  inputProtocoloRateio?.addEventListener("input", () => {
    const link = montarLinkMovidesk(inputProtocoloRateio.value);
    linkMovideskRateio.hidden = !link;
    if (link) linkMovideskRateio.href = link;
  });

  conectarToggleModo();
  conectarBuscaConta();
  conectarBotaoAdicionarLinha();
  conectarSalvar();
  conectarAtalhosTeclado();
  conectarImportacaoCsv();
}

/**
 * Mesmos atalhos do lançamento único, adaptados aos campos fixos do
 * rateio (as linhas dinâmicas de Centro de Custo ficam fora do Enter-
 * avança, pra não pular de um jeito confuso entre elas).
 */
function conectarAtalhosTeclado() {
  const campoBusca = document.getElementById("rat-conta-codigo");
  const camposOrdem = () =>
    [
      document.getElementById("rat-conta-codigo"),
      document.getElementById("rat-ordem-pagamento"),
      document.getElementById("rat-nf-numero"),
      document.getElementById("rat-valor-total"),
      document.getElementById("rat-protocolo-movidesk"),
      document.getElementById("rat-data-emissao"),
      document.getElementById("rat-data-vencimento"),
    ].filter(Boolean);

  document.addEventListener("keydown", (evento) => {
    if (document.getElementById("lancamento-modo-rateio")?.hidden) return; // só no modo Rateio

    if (evento.altKey && evento.key.toLowerCase() === "n") {
      evento.preventDefault();
      campoBusca?.focus();
      return;
    }

    if (evento.key !== "Enter") return;

    if (evento.ctrlKey || evento.metaKey) {
      evento.preventDefault();
      document.getElementById("rat-botao-salvar")?.click();
      return;
    }

    const ordem = camposOrdem();
    const indiceAtual = ordem.indexOf(evento.target);
    if (indiceAtual === -1) return;
    evento.preventDefault();

    const proximoHabilitado = ordem.slice(indiceAtual + 1).find((campo) => !campo.disabled);
    if (proximoHabilitado) {
      proximoHabilitado.focus();
    } else {
      document.getElementById("rat-botao-salvar")?.click();
    }
  });
}

// --- Alternância entre "Lançamento único" e "Rateio" ---

function conectarToggleModo() {
  document.querySelectorAll("[data-modo-lancamento]").forEach((botao) => {
    botao.addEventListener("click", () => {
      document.querySelectorAll("[data-modo-lancamento]").forEach((b) => b.classList.remove("ativo"));
      botao.classList.add("ativo");
      const modo = botao.dataset.modoLancamento;
      document.getElementById("lancamento-modo-unico").hidden = modo !== "unico";
      document.getElementById("lancamento-modo-rateio").hidden = modo !== "rateio";
    });
  });
}

// --- Busca do código da Conta Contábil (autocomplete) ---

function conectarBuscaConta() {
  const inputCodigo = document.getElementById("rat-conta-codigo");
  const listaSugestoes = document.getElementById("rat-conta-sugestoes");
  const selOP = document.getElementById("rat-ordem-pagamento");
  if (!inputCodigo) return;

  inputCodigo.addEventListener("input", async () => {
    if (catalogoCodigos.length === 0) await montarCatalogoCodigos();

    const termo = inputCodigo.value.trim().toLowerCase();
    if (!termo) {
      listaSugestoes.hidden = true;
      return;
    }
    const resultados = catalogoCodigos.filter((c) => c.codigo.toLowerCase().includes(termo) || c.nome.toLowerCase().includes(termo)).slice(0, 8);

    listaSugestoes.innerHTML = resultados.length
      ? resultados.map((c) => `<div class="autocomplete-item" data-codigo="${c.codigo}"><span class="codigo">${c.codigo}</span>${c.nome}</div>`).join("")
      : '<div class="autocomplete-vazio">Nenhum código encontrado.</div>';
    listaSugestoes.hidden = false;

    listaSugestoes.querySelectorAll("[data-codigo]").forEach((item) => {
      item.addEventListener("click", async () => {
        inputCodigo.value = item.dataset.codigo;
        listaSugestoes.hidden = true;
        await carregarOPsRateio(item.dataset.codigo);
      });
    });
  });

  document.addEventListener("click", (evento) => {
    if (!listaSugestoes.hidden && evento.target !== inputCodigo && !listaSugestoes.contains(evento.target)) {
      listaSugestoes.hidden = true;
    }
  });

  inputCodigo.addEventListener("change", () => {
    if (inputCodigo.value.trim()) carregarOPsRateio(inputCodigo.value.trim());
  });
}

async function montarCatalogoCodigos() {
  const todas = await listarTodasContas();
  const porCodigo = new Map();
  todas.forEach((c) => {
    if (!c.conta_codigo || porCodigo.has(c.conta_codigo)) return;
    porCodigo.set(c.conta_codigo, { codigo: c.conta_codigo, nome: c.nome });
  });
  catalogoCodigos = [...porCodigo.values()];
}

async function carregarOPsRateio(codigo) {
  const selOP = document.getElementById("rat-ordem-pagamento");
  selOP.innerHTML = '<option value="">Carregando...</option>';
  selOP.disabled = true;
  console.log(`[rateio] buscando OPs de rateio para o código: "${codigo}"`);

  try {
    opsCarregadas = await listarOrdensPagamentoRateioPorCodigo(codigo);
    if (opsCarregadas.length === 0) {
      selOP.innerHTML = '<option value="">Nenhuma OP de rateio para este código — cadastre em "Ordens de pagamento"</option>';
      return;
    }
    selOP.innerHTML = '<option value="">Selecione a Ordem de Pagamento</option>';
    opsCarregadas.forEach((op) => {
      const saldo = op.saldo_disponivel ?? op.saldo_total ?? 0;
      const option = document.createElement("option");
      option.value = op.id;
      option.textContent = `OP ${op.numero_op || op.id} · Saldo: ${formatadorRS.format(saldo)}`;
      if (saldo <= 0) option.disabled = true;
      selOP.appendChild(option);
    });
    selOP.disabled = false;
  } catch (erro) {
    console.error("[rateio] erro ao carregar OPs:", erro);
    selOP.innerHTML = '<option value="">Erro ao carregar — veja o console</option>';
  }
}

// --- Linhas do rateio (uma por Centro de Custo) ---

function conectarBotaoAdicionarLinha() {
  document.getElementById("rat-botao-add-linha")?.addEventListener("click", () => adicionarLinha());
}

/**
 * Adiciona uma fatia. Sem `preset`, é a linha em branco do botão "+ Adicionar".
 * Com `preset` ({ centros, centroId, percentual, servicoTexto }), a linha já
 * nasce com Centro, percentual e Serviço escolhidos — usado pela importação
 * de CSV. Devolve os avisos que a importação precisa mostrar (vazia no uso manual).
 */
async function adicionarLinha(preset = null) {
  const container = document.getElementById("rat-linhas");
  const id = `rl${contadorLinhas++}`;

  const div = document.createElement("div");
  div.className = "rat-linha";
  div.dataset.linhaId = id;
  div.innerHTML = `
    <div class="campo">
      <label>Centro de Custo</label>
      <select class="rat-linha-centro"><option value="">Carregando...</option></select>
    </div>
    <div class="campo">
      <label>Percentual (%) — 4 casas</label>
      <input type="number" class="rat-linha-fracao" step="0.0001" min="0" max="100" value="0" placeholder="Ex.: 33.3333" />
    </div>
    <div class="campo">
      <label>Valor</label>
      <input type="text" class="rat-linha-valor numero-tabular" readonly value="R$ 0,00" />
    </div>
    <div class="campo">
      <label>Serviço/Prestador</label>
      <select class="rat-linha-servico" disabled><option value="">Selecione o Centro</option></select>
    </div>
    <button type="button" class="rat-linha-remover botao-link">Remover</button>
    <p class="rat-linha-aviso"></p>
  `;
  // Síncrono, antes de qualquer await: na importação, várias linhas carregam em
  // paralelo e é esta linha que já fixa a ordem em que elas aparecem na tela.
  container.appendChild(div);

  const centros = preset?.centros ?? (await listarCentrosCusto());
  const selCentro = div.querySelector(".rat-linha-centro");
  selCentro.innerHTML = '<option value="">Selecione o Centro de Custo</option>';
  [...centros]
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .forEach((c) => {
      const option = document.createElement("option");
      option.value = c.id;
      option.textContent = c.nome;
      selCentro.appendChild(option);
    });

  const selServico = div.querySelector(".rat-linha-servico");
  const inputFracao = div.querySelector(".rat-linha-fracao");
  const aviso = div.querySelector(".rat-linha-aviso");
  let servicosDaLinha = [];

  async function resolverContaEServicos() {
    const codigo = document.getElementById("rat-conta-codigo").value.trim();
    div.dataset.contaId = "";
    servicosDaLinha = [];
    selServico.innerHTML = '<option value="">Selecione o Centro</option>';
    selServico.disabled = true;
    aviso.textContent = "";

    if (!selCentro.value || !codigo) return;

    const conta = await buscarContaPorCentroECodigo(selCentro.value, codigo);
    if (!conta) {
      aviso.textContent = `Esta Conta Contábil (${codigo}) ainda não existe neste Centro — cadastre em "Orçamento & Contas" primeiro.`;
      return;
    }
    div.dataset.contaId = conta.id;

    servicosDaLinha = await listarServicosPorConta(conta.id);
    if (servicosDaLinha.length === 0) {
      selServico.innerHTML = '<option value="">Nenhum Serviço cadastrado nesta conta</option>';
      return;
    }
    selServico.innerHTML = '<option value="">Selecione o Serviço/Prestador</option>';
    servicosDaLinha.forEach((s) => {
      const option = document.createElement("option");
      option.value = s.id;
      option.textContent = s.nome;
      option.dataset.item = JSON.stringify(s);
      selServico.appendChild(option);
    });
    selServico.disabled = false;
  }

  selCentro.addEventListener("change", resolverContaEServicos);
  inputFracao.addEventListener("input", recalcularTotais);
  div.querySelector(".rat-linha-remover").addEventListener("click", () => {
    div.remove();
    recalcularTotais();
  });

  const avisosDaLinha = [];
  if (preset) {
    const nomeCentro = centros.find((c) => c.id === preset.centroId)?.nome ?? "Centro";
    selCentro.value = preset.centroId;
    inputFracao.value = String(preset.percentual);
    await resolverContaEServicos();

    if (!div.dataset.contaId) {
      avisosDaLinha.push(`${nomeCentro}: a Conta Contábil não existe neste Centro (cadastre em "Orçamento & Contas" antes de salvar).`);
    } else if (servicosDaLinha.length === 0) {
      avisosDaLinha.push(`${nomeCentro}: a conta não tem nenhum Serviço cadastrado.`);
    } else {
      let escolhido = null;
      if (preset.servicoTexto) {
        const achado = encontrarServico(preset.servicoTexto, servicosDaLinha);
        if (achado.servico) escolhido = achado.servico;
        else avisosDaLinha.push(`${nomeCentro}: ${achado.erro} — escolha o serviço na própria linha.`);
      } else if (servicosDaLinha.length === 1) {
        escolhido = servicosDaLinha[0]; // só existe um: não há o que adivinhar
      } else {
        avisosDaLinha.push(`${nomeCentro}: a conta tem ${servicosDaLinha.length} serviços e o CSV não diz qual — escolha na própria linha.`);
      }
      if (escolhido) selServico.value = escolhido.id;
    }
    recalcularTotais();
  }

  return avisosDaLinha;
}

function recalcularTotais() {
  const valorTotal = parseFloat(document.getElementById("rat-valor-total").value) || 0;
  const linhas = document.querySelectorAll(".rat-linha");

  let somaPercentuais = 0;
  linhas.forEach((div) => {
    const percentual = parseFloat(div.querySelector(".rat-linha-fracao").value) || 0;
    somaPercentuais += percentual;
    const valorLinha = (percentual / 100) * valorTotal;
    div.querySelector(".rat-linha-valor").value = formatadorRS.format(valorLinha);
  });

  document.getElementById("rat-soma-fracoes").textContent = somaPercentuais.toFixed(4).replace(".", ",") + "%";
  document.getElementById("rat-soma-valores").textContent = formatadorRS.format((somaPercentuais / 100) * valorTotal);

  const elSoma = document.getElementById("rat-soma-fracoes");
  const dentroTolerancia = Math.abs(somaPercentuais - 100) < 0.05;
  elSoma.style.color = linhas.length > 0 && !dentroTolerancia ? "var(--status-divergencia-fg)" : "var(--status-ok-fg)";
}

function conectarSalvar() {
  document.getElementById("rat-botao-salvar")?.addEventListener("click", salvarRateio);
}

async function salvarRateio() {
  const status = document.getElementById("rat-status");
  const botao = document.getElementById("rat-botao-salvar");
  status.textContent = "";
  status.classList.remove("sucesso");

  const codigo = document.getElementById("rat-conta-codigo").value.trim();
  const selOP = document.getElementById("rat-ordem-pagamento");
  const nfNumero = document.getElementById("rat-nf-numero").value.trim();
  const protocoloMovidesk = document.getElementById("rat-protocolo-movidesk").value.trim();
  const valorTotal = parseFloat(document.getElementById("rat-valor-total").value);
  const dataEmissaoStr = document.getElementById("rat-data-emissao").value;
  const dataVencimentoStr = document.getElementById("rat-data-vencimento").value;
  const linhasEl = [...document.querySelectorAll(".rat-linha")];

  if (!codigo || !selOP.value) {
    status.textContent = "Informe o código da conta e selecione a Ordem de Pagamento.";
    return;
  }
  if (!nfNumero) {
    status.textContent = "Informe o Número da Nota Fiscal.";
    return;
  }
  if (!protocoloMovidesk) {
    status.textContent = "Informe o Protocolo Movidesk.";
    return;
  }
  if (!valorTotal || valorTotal <= 0) {
    status.textContent = "Informe o Valor Total da NF.";
    return;
  }
  if (!dataEmissaoStr || !dataVencimentoStr) {
    status.textContent = "Preencha as datas de emissão e vencimento.";
    return;
  }
  if (linhasEl.length < 2) {
    status.textContent = "Adicione pelo menos 2 Centros de Custo para ratear.";
    return;
  }

  const somaPercentuais = linhasEl.reduce((acc, div) => acc + (parseFloat(div.querySelector(".rat-linha-fracao").value) || 0), 0);
  if (Math.abs(somaPercentuais - 100) >= 0.05) {
    status.textContent = `A soma dos percentuais precisa fechar em 100,0000% (está em ${somaPercentuais.toFixed(4)}%).`;
    return;
  }

  for (const div of linhasEl) {
    const centroId = div.querySelector(".rat-linha-centro").value;
    const contaId = div.dataset.contaId;
    const servicoId = div.querySelector(".rat-linha-servico").value;
    if (!centroId || !contaId || !servicoId) {
      status.textContent = "Preencha Centro de Custo e Serviço em todas as linhas antes de salvar.";
      return;
    }
  }

  botao.disabled = true;
  try {
    const dataEmissao = new Date(dataEmissaoStr + "T00:00:00");
    const dataVencimento = new Date(dataVencimentoStr + "T00:00:00");
    const dadosLancador = dadosDoLancador(usuarioAtual);

    // Arredonda cada fatia em 2 casas, e ajusta a ÚLTIMA linha pra absorver
    // a sobra do arredondamento — garante que a soma bate exatamente com o
    // Valor Total da NF, mesmo com percentuais tipo 33,3333/33,3333/33,3334.
    let somaParcial = 0;
    const linhasParaGravar = linhasEl.map((div, indice) => {
      const centroId = div.querySelector(".rat-linha-centro").value;
      const contaId = div.dataset.contaId;
      const selServico = div.querySelector(".rat-linha-servico");
      const servicoId = selServico.value;
      const servicoObj = JSON.parse(selServico.options[selServico.selectedIndex].dataset.item);
      const percentual = parseFloat(div.querySelector(".rat-linha-fracao").value) || 0;

      let valorLinha = Math.round((percentual / 100) * valorTotal * 100) / 100;
      if (indice === linhasEl.length - 1) {
        valorLinha = Math.round((valorTotal - somaParcial) * 100) / 100;
      }
      somaParcial += valorLinha;

      const mes = dataEmissao.getMonth() + 1;
      const orcamentoProjetado = orcamentoProjetadoDoMes(servicoObj, mes);
      const calculado = processarLancamento({
        valorNF: valorLinha,
        orcamentoProjetado,
        dataEmissao,
        dataVencimento,
        dataEntrada: new Date(),
      });

      return {
        ...dadosLancador,
        centro_custo_id: centroId,
        conta_contabil_id: contaId,
        servico_id: servicoId,
        servico_nome: servicoObj.nome,
        tipo_lancamento: "rateio",
        nf_numero: nfNumero,
        percentual_rateio: percentual,
        valor_nf: valorLinha,
        data_emissao: dataEmissao,
        data_vencimento: dataVencimento,
        protocolo_movidesk: protocoloMovidesk,
        observacao: `Rateio da NF ${nfNumero || "—"} (${percentual.toFixed(4)}% do total ${formatadorRS.format(valorTotal)}).`,
        ...calculado,
      };
    });

    await registrarLancamentoRateado(linhasParaGravar, selOP.value);

    status.textContent = `Rateio salvo com sucesso: ${linhasParaGravar.length} lançamentos criados.`;
    status.classList.add("sucesso");
    invalidarDashboard();
    invalidarPainelTerceiros();

    document.getElementById("rat-linhas").innerHTML = "";
    limparResultadoCsv();
    document.getElementById("rat-nf-numero").value = "";
    document.getElementById("rat-valor-total").value = "";
    document.getElementById("rat-data-emissao").value = "";
    document.getElementById("rat-data-vencimento").value = "";
    document.getElementById("rat-protocolo-movidesk").value = "";
    document.getElementById("rat-link-movidesk").hidden = true;
    recalcularTotais();
  } catch (erro) {
    console.error("[rateio] erro ao salvar:", erro);
    status.textContent = "Erro: " + (erro.message || "não foi possível salvar, tente novamente.");
  } finally {
    botao.disabled = false;
  }
}


// --- Importação de CSV ---

function limparResultadoCsv() {
  const caixa = document.getElementById("rat-csv-resultado");
  if (!caixa) return;
  caixa.hidden = true;
  caixa.replaceChildren();
}

/** tipo: "sucesso" | "alerta" | "erro". Usa textContent: o conteúdo vem do arquivo da pessoa. */
function mostrarResultadoCsv(tipo, titulo, itens = []) {
  const caixa = document.getElementById("rat-csv-resultado");
  if (!caixa) return;
  caixa.className = `rat-csv-resultado ${tipo}`;
  caixa.replaceChildren();

  const strong = document.createElement("strong");
  strong.textContent = titulo;
  caixa.appendChild(strong);

  if (itens.length > 0) {
    const ul = document.createElement("ul");
    itens.forEach((texto) => {
      const li = document.createElement("li");
      li.textContent = texto;
      ul.appendChild(li);
    });
    caixa.appendChild(ul);
  }
  caixa.hidden = false;
}

function baixarModeloCsv() {
  // BOM no começo: sem ele o Excel abre o arquivo como ANSI e estraga os acentos.
  const blob = new Blob(["\uFEFF" + modeloCsv()], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "modelo-rateio.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function importarArquivoCsv(arquivo) {
  const codigo = document.getElementById("rat-conta-codigo").value.trim();
  if (!codigo) {
    mostrarResultadoCsv("erro", "Preencha o código da Conta Contábil antes de importar", [
      "É ele que define de qual conta de cada Centro de Custo as fatias serão puxadas.",
    ]);
    return;
  }

  const leitura = lerCsv(decodificarCsv(await arquivo.arrayBuffer()));
  if (leitura.erroFatal) {
    mostrarResultadoCsv("erro", "Não foi possível importar o arquivo", [leitura.erroFatal]);
    return;
  }

  const centros = await listarCentrosCusto();
  const naoImportadas = leitura.erros.map((e) => `Linha ${e.numero}: ${e.mensagem}`);
  const validas = [];

  leitura.linhas.forEach((linha) => {
    const achado = encontrarCentro(linha.centro, centros);
    if (achado.erro) naoImportadas.push(`Linha ${linha.numero}: ${achado.erro}`);
    else validas.push({ ...linha, centroObj: achado.centro });
  });

  if (validas.length === 0) {
    mostrarResultadoCsv("erro", "Nenhuma linha pôde ser importada", naoImportadas);
    return;
  }

  const existentes = document.querySelectorAll(".rat-linha").length;
  if (existentes > 0 && !window.confirm(`Já existem ${existentes} fatia(s) na tela. Importar vai substituí-las por ${validas.length}. Continuar?`)) {
    return;
  }

  document.getElementById("rat-linhas").innerHTML = "";
  const avisosDasLinhas = (
    await Promise.all(
      validas.map((v) => adicionarLinha({ centros, centroId: v.centroObj.id, percentual: v.percentual, servicoTexto: v.servico }))
    )
  ).flat();

  const avisos = [...leitura.avisos];
  const repeticoes = new Map();
  validas.forEach((v) => repeticoes.set(v.centroObj.id, (repeticoes.get(v.centroObj.id) ?? 0) + 1));
  repeticoes.forEach((vezes, centroId) => {
    if (vezes > 1) avisos.push(`${centros.find((c) => c.id === centroId)?.nome} aparece ${vezes} vezes no arquivo — confira se não é duplicidade.`);
  });
  avisos.push(...avisosDasLinhas);

  const soma = validas.reduce((acc, v) => acc + v.percentual, 0);
  if (Math.abs(soma - 100) >= 0.05) {
    avisos.push(`A soma dos percentuais importados é ${soma.toFixed(4).replace(".", ",")}% — precisa fechar em 100% para salvar.`);
  }

  const lembrete = "Nada foi salvo ainda: confira as fatias e clique em Salvar Rateio.";
  if (naoImportadas.length > 0) {
    mostrarResultadoCsv(
      "alerta",
      `${validas.length} fatia(s) importada(s); ${naoImportadas.length} linha(s) do arquivo NÃO entraram`,
      [...naoImportadas.map((t) => `Não importada — ${t}`), ...avisos, lembrete]
    );
  } else if (avisos.length > 0) {
    mostrarResultadoCsv("alerta", `${validas.length} fatia(s) importada(s), com avisos`, [...avisos, lembrete]);
  } else {
    mostrarResultadoCsv("sucesso", `${validas.length} fatia(s) importada(s) sem pendências`, [lembrete]);
  }
}

function conectarImportacaoCsv() {
  const botaoImportar = document.getElementById("rat-botao-importar-csv");
  const inputArquivo = document.getElementById("rat-input-csv");
  const botaoDica = document.getElementById("rat-dica-csv-botao");
  const painelDica = document.getElementById("rat-dica-csv");
  if (!botaoImportar || !inputArquivo) return;

  botaoImportar.addEventListener("click", () => inputArquivo.click());

  inputArquivo.addEventListener("change", async () => {
    const arquivo = inputArquivo.files[0];
    inputArquivo.value = ""; // permite escolher o mesmo arquivo de novo depois de corrigi-lo
    if (!arquivo) return;

    botaoImportar.disabled = true;
    try {
      await importarArquivoCsv(arquivo);
    } catch (erro) {
      console.error("[rateio] erro ao importar CSV:", erro);
      mostrarResultadoCsv("erro", "Erro ao importar", [erro.message || "Não foi possível ler o arquivo."]);
    } finally {
      botaoImportar.disabled = false;
    }
  });

  // Dica: abre no CLIQUE (e não no hover) — funciona no celular e no teclado,
  // e dá pra selecionar/copiar o texto sem ele sumir quando o mouse se mexe.
  if (botaoDica && painelDica) {
    const alternar = (abrir) => {
      painelDica.hidden = !abrir;
      botaoDica.setAttribute("aria-expanded", String(abrir));
    };
    botaoDica.addEventListener("click", (evento) => {
      evento.stopPropagation();
      alternar(painelDica.hidden);
    });
    document.addEventListener("click", (evento) => {
      if (!painelDica.hidden && !painelDica.contains(evento.target)) alternar(false);
    });
    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape" && !painelDica.hidden) {
        alternar(false);
        botaoDica.focus();
      }
    });
    document.getElementById("rat-baixar-modelo")?.addEventListener("click", baixarModeloCsv);
  }
}
