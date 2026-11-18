// ============================================================
// auditoria.js
// Tela "Auditoria" — leitura da trilha gravada em `logs_auditoria`.
// Só Administrador vê (menu e Regras do Firestore). Mostra os 500 registros
// mais recentes, com filtro por tipo, por usuário e por texto, e abre cada
// linha pra mostrar o que mudou (antes -> depois) ou os detalhes da operação.
// ============================================================

import { listarLogsAuditoria } from "./firestore.js";
import { GRUPOS, rotuloAcao, grupoDaAcao, rotuloCampo, formatarValorAuditoria, rotuloDetalhe, formatarDetalhe } from "./auditoria-util.js";

const LIMITE = 500;
const formatadorDataHora = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" });

let logs = [];
const filtros = { grupo: "", usuario: "", texto: "" };

// O que vem do banco (nomes, resumos) é texto de pessoas: nunca entra como HTML.
function esc(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function dataHora(log) {
  const data = typeof log.data_hora?.toDate === "function" ? log.data_hora.toDate() : null;
  return data ? formatadorDataHora.format(data) : "—";
}

export async function iniciarAuditoria() {
  const container = document.getElementById("auditoria-conteudo");
  if (!container) return;
  container.innerHTML = '<p class="preview-vazio">Carregando...</p>';

  try {
    logs = await listarLogsAuditoria(LIMITE);
  } catch (erro) {
    console.error("[auditoria] erro ao carregar:", erro);
    container.innerHTML = `<div class="placeholder-modulo">Não foi possível carregar. Erro: ${esc(erro.message || "veja o console (F12)")}.</div>`;
    return;
  }

  const usuarios = new Map();
  logs.forEach((l) => usuarios.set(l.usuario_email, l.usuario_nome || l.usuario_email));

  container.innerHTML = `
    <div class="painel-filtros">
      <div class="campo">
        <label for="aud-filtro-grupo">Tipo</label>
        <select id="aud-filtro-grupo">
          <option value="">Todos</option>
          ${Object.entries(GRUPOS).map(([id, nome]) => `<option value="${id}">${esc(nome)}</option>`).join("")}
        </select>
      </div>
      <div class="campo">
        <label for="aud-filtro-usuario">Usuário</label>
        <select id="aud-filtro-usuario">
          <option value="">Todos</option>
          ${[...usuarios].sort((a, b) => a[1].localeCompare(b[1])).map(([email, nome]) => `<option value="${esc(email)}">${esc(nome)}</option>`).join("")}
        </select>
      </div>
      <div class="campo">
        <label for="aud-filtro-texto">Buscar no resumo</label>
        <input type="search" id="aud-filtro-texto" autocomplete="off" placeholder="NF, conta, e-mail..." />
      </div>
    </div>
    <div class="painel-corpo" id="aud-corpo"></div>
  `;

  const selGrupo = document.getElementById("aud-filtro-grupo");
  const selUsuario = document.getElementById("aud-filtro-usuario");
  const inputTexto = document.getElementById("aud-filtro-texto");
  selGrupo.value = filtros.grupo;
  selUsuario.value = filtros.usuario;
  inputTexto.value = filtros.texto;

  selGrupo.addEventListener("change", () => { filtros.grupo = selGrupo.value; renderizarTabela(); });
  selUsuario.addEventListener("change", () => { filtros.usuario = selUsuario.value; renderizarTabela(); });
  inputTexto.addEventListener("input", () => { filtros.texto = inputTexto.value; renderizarTabela(); });

  renderizarTabela();
}

function detalheHtml(log) {
  const alteracoes = log.alteracoes ?? [];
  if (alteracoes.length > 0) {
    return `<ul class="aud-lista">${alteracoes
      .map((a) => `<li><b>${esc(rotuloCampo(a.campo))}:</b> ${esc(formatarValorAuditoria(a.campo, a.antes))} → ${esc(formatarValorAuditoria(a.campo, a.depois))}</li>`)
      .join("")}</ul>`;
  }
  const entradas = Object.entries(log.detalhes ?? {});
  if (entradas.length === 0) return '<span class="aud-vazio">Sem detalhes adicionais.</span>';
  return `<dl class="aud-detalhes">${entradas
    .map(([chave, valor]) => `<dt>${esc(rotuloDetalhe(chave))}</dt><dd>${esc(formatarDetalhe(chave, valor))}</dd>`)
    .join("")}</dl>`;
}

function renderizarTabela() {
  const corpo = document.getElementById("aud-corpo");
  if (!corpo) return;

  const texto = filtros.texto.trim().toLowerCase();
  const visiveis = logs.filter((l) => {
    if (filtros.grupo && grupoDaAcao(l.acao) !== filtros.grupo) return false;
    if (filtros.usuario && l.usuario_email !== filtros.usuario) return false;
    if (texto && !`${l.resumo ?? ""} ${l.usuario_email ?? ""}`.toLowerCase().includes(texto)) return false;
    return true;
  });

  if (visiveis.length === 0) {
    corpo.innerHTML = '<div class="placeholder-modulo">Nenhum registro encontrado com esses filtros.</div>';
    return;
  }

  const linhas = visiveis
    .map(
      (l) => `
      <tr class="aud-linha">
        <td>${esc(dataHora(l))}</td>
        <td>${esc(l.usuario_nome || l.usuario_email)}</td>
        <td><span class="chip">${esc(rotuloAcao(l.acao))}</span></td>
        <td class="aud-resumo">${esc(l.resumo)}</td>
        <td class="aud-seta"><span class="icone-toggle">▸</span></td>
      </tr>
      <tr class="aud-detalhe" hidden><td colspan="5">${detalheHtml(l)}</td></tr>`
    )
    .join("");

  corpo.innerHTML = `
    <div class="tabela-scroll">
      <table class="tabela-matriz tabela-texto">
        <thead><tr><th>Data e hora</th><th>Usuário</th><th>Ação</th><th>Resumo</th><th></th></tr></thead>
        <tbody>${linhas}</tbody>
      </table>
    </div>
    <div class="legenda-heatmap">
      <span class="legenda-nota" style="text-align: left">${visiveis.length} registro(s)${logs.length >= LIMITE ? ` — mostrando os ${LIMITE} mais recentes` : ""}. Clique numa linha para ver o que mudou.</span>
    </div>`;

  corpo.querySelector("tbody").addEventListener("click", (evento) => {
    const linha = evento.target.closest("tr.aud-linha");
    if (!linha) return;
    const detalhe = linha.nextElementSibling;
    detalhe.hidden = !detalhe.hidden;
    linha.classList.toggle("expandido", !detalhe.hidden);
  });
}
