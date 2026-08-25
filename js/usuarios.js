// ============================================================
// usuarios.js
// Tela "Usuários & Permissões" — cadastro de quem pode acessar o
// Bills e com qual papel. Só visível/utilizável por Administradores
// (tanto na interface quanto, de verdade, nas Regras do Firestore).
// ============================================================

import { listarUsuariosAutorizados, salvarUsuarioAutorizado } from "./firestore.js";

const RÓTULOS_PAPEL = {
  administrador: "Administrador",
  financeiro: "Financeiro",
  leitura: "Leitura",
};

let listenersConectados = false;
let emailEmEdicao = null; // null = cadastrando novo

export async function iniciarUsuarios() {
  if (!listenersConectados) {
    conectarFormulario();
    listenersConectados = true;
  }

  try {
    await recarregarLista();
  } catch (erro) {
    console.error("[usuarios] erro ao carregar lista:", erro);
    const container = document.getElementById("lista-usuarios");
    if (container) {
      container.innerHTML = `<div class="placeholder-modulo">Não foi possível carregar. Erro: ${erro.message || "veja o console (F12)"}.</div>`;
    }
  }
}

function conectarFormulario() {
  const form = document.getElementById("form-usuario");
  if (!form) return;

  document.getElementById("usr-cancelar")?.addEventListener("click", () => resetarFormulario());

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const inputEmail = document.getElementById("usr-email");
    const inputNome = document.getElementById("usr-nome");
    const selPapel = document.getElementById("usr-papel");
    const status = document.getElementById("usr-status");
    const botao = document.getElementById("usr-salvar");

    if (!inputEmail.value.trim()) {
      status.textContent = "Digite o e-mail.";
      status.classList.remove("sucesso");
      return;
    }

    botao.disabled = true;
    try {
      await salvarUsuarioAutorizado({
        email: inputEmail.value,
        nome: inputNome.value,
        papel: selPapel.value,
        ativo: true,
      });
      status.textContent = emailEmEdicao ? "Usuário atualizado." : "Usuário autorizado com sucesso.";
      status.classList.add("sucesso");
      resetarFormulario();
      await recarregarLista();
    } catch (erro) {
      console.error("[usuarios] erro ao salvar:", erro);
      status.textContent = "Erro: " + (erro.message || "não foi possível salvar, tente novamente.");
      status.classList.remove("sucesso");
    } finally {
      botao.disabled = false;
    }
  });
}

function resetarFormulario() {
  emailEmEdicao = null;
  document.getElementById("form-usuario").reset();
  document.getElementById("usr-email").disabled = false;
  document.getElementById("usr-titulo").textContent = "Autorizar novo e-mail";
  document.getElementById("usr-status").textContent = "";
}

function preencherParaEdicao(usuario) {
  emailEmEdicao = usuario.email;
  document.getElementById("usr-email").value = usuario.email;
  document.getElementById("usr-email").disabled = true; // e-mail é o ID do documento, não dá pra trocar
  document.getElementById("usr-nome").value = usuario.nome || "";
  document.getElementById("usr-papel").value = usuario.papel || "leitura";
  document.getElementById("usr-titulo").textContent = `Editando: ${usuario.email}`;
  document.getElementById("usr-status").textContent = "";
  document.getElementById("usr-email").scrollIntoView({ behavior: "smooth", block: "center" });
}

async function alternarAtivo(usuario) {
  const status = document.getElementById("usr-status");
  try {
    await salvarUsuarioAutorizado({ ...usuario, ativo: !usuario.ativo });
    await recarregarLista();
  } catch (erro) {
    console.error("[usuarios] erro ao alternar acesso:", erro);
    status.textContent = "Erro: " + (erro.message || "não foi possível salvar, tente novamente.");
    status.classList.remove("sucesso");
  }
}

async function recarregarLista() {
  const container = document.getElementById("lista-usuarios");
  if (!container) return;

  container.innerHTML = '<p class="preview-vazio">Carregando...</p>';
  const usuarios = await listarUsuariosAutorizados();

  if (usuarios.length === 0) {
    container.innerHTML = '<div class="placeholder-modulo">Nenhum usuário autorizado ainda.</div>';
    return;
  }

  const linhas = usuarios
    .sort((a, b) => (a.nome || a.email).localeCompare(b.nome || b.email))
    .map(
      (u) => `
      <tr>
        <td class="col-conta">${u.nome || "—"}</td>
        <td>${u.email}</td>
        <td>${RÓTULOS_PAPEL[u.papel] ?? u.papel}</td>
        <td>${u.ativo ? '<span class="chip chip-ok">Ativo</span>' : '<span class="chip chip-divergencia">Inativo</span>'}</td>
        <td><button type="button" class="botao-link" data-acao="editar" data-email="${u.email}">Editar</button></td>
        <td><button type="button" class="botao-link" data-acao="alternar" data-email="${u.email}">${u.ativo ? "Desativar" : "Reativar"}</button></td>
      </tr>`
    )
    .join("");

  container.innerHTML = `
    <div class="tabela-scroll">
      <table class="tabela-matriz">
        <thead>
          <tr><th class="col-conta">Nome</th><th>E-mail</th><th>Papel</th><th>Status</th><th></th><th></th></tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>
    </div>`;

  container.querySelectorAll("[data-acao='editar']").forEach((botao) => {
    botao.addEventListener("click", () => {
      const usuario = usuarios.find((u) => u.email === botao.dataset.email);
      if (usuario) preencherParaEdicao(usuario);
    });
  });

  container.querySelectorAll("[data-acao='alternar']").forEach((botao) => {
    botao.addEventListener("click", () => {
      const usuario = usuarios.find((u) => u.email === botao.dataset.email);
      if (usuario) alternarAtivo(usuario);
    });
  });
}
