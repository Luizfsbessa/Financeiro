// ============================================================
// exportadores.js
// Exportação genérica de qualquer relatório (colunas + linhas já
// formatadas como texto) para .xlsx (SheetJS) e .pdf (jsPDF +
// autoTable). As bibliotecas são carregadas via CDN sob demanda —
// só quando o usuário realmente clica em exportar, não no
// carregamento inicial do app.
// ============================================================

let sheetJsPromise = null;
let jsPdfPromise = null;

function carregarScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Falha ao carregar biblioteca externa (${src}). Verifique sua conexão.`));
    document.head.appendChild(script);
  });
}

function carregarSheetJS() {
  if (window.XLSX) return Promise.resolve();
  if (!sheetJsPromise) {
    sheetJsPromise = carregarScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");
  }
  return sheetJsPromise;
}

function carregarJsPDF() {
  if (window.jspdf?.jsPDF?.API?.autoTable) return Promise.resolve();
  if (!jsPdfPromise) {
    jsPdfPromise = carregarScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js").then(() =>
      carregarScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js")
    );
  }
  return jsPdfPromise;
}

/**
 * @param {string} nomeArquivo - sem extensão
 * @param {string[]} colunas - cabeçalhos, na ordem desejada
 * @param {Object[]} linhas - cada linha é um objeto { [coluna]: valorJaFormatado }
 */
export async function exportarExcel(nomeArquivo, colunas, linhas) {
  await carregarSheetJS();
  const dados = linhas.map((linha) => {
    const objOrdenado = {};
    colunas.forEach((c) => (objOrdenado[c] = linha[c] ?? ""));
    return objOrdenado;
  });
  const planilha = window.XLSX.utils.json_to_sheet(dados, { header: colunas });
  const livro = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(livro, planilha, "Relatório");
  window.XLSX.writeFile(livro, `${nomeArquivo}.xlsx`);
}

/**
 * @param {string} titulo - exibido no topo do PDF
 * @param {string} nomeArquivo - sem extensão
 * @param {string[]} colunas
 * @param {Object[]} linhas
 */
export async function exportarPDF(titulo, nomeArquivo, colunas, linhas) {
  await carregarJsPDF();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: colunas.length > 6 ? "landscape" : "portrait" });

  doc.setFontSize(13);
  doc.text(titulo, 14, 15);
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(`Gerado em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date())}`, 14, 20);

  doc.autoTable({
    startY: 24,
    head: [colunas],
    body: linhas.map((linha) => colunas.map((c) => String(linha[c] ?? ""))),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [27, 58, 63] }, // var(--brand-900) aproximado
    alternateRowStyles: { fillColor: [246, 245, 241] }, // var(--paper-0) aproximado
  });

  doc.save(`${nomeArquivo}.pdf`);
}
