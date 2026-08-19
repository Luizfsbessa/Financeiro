// ============================================================
// app.js
// Ponto de entrada. Liga o módulo de autenticação à interface:
// alterna entre a tela de login e o app shell, e popula os
// dados do usuário logado na sidebar.
//
// Próximos módulos a conectar aqui (ainda não construídos):
//   - conciliacao.js   → motor de fórmulas (divergência, antecedência, pagamento)
//   - form-lancamento.js → tela de lançamento de NF
//   - dashboard.js     → tabela matriz + heatmap
// ============================================================

import { entrarComGoogle, sair, observarAutenticacao, dadosDoLancador } from "./auth.js";
import { iniciarFormLancamento } from "./form-lancamento.js";

const telaLogin = document.getElementById("tela-login");
const appShell = document.getElementById("app-shell");
const botaoEntrar = document.getElementById("botao-entrar-google");
const botaoSair = document.getElementById("botao-sair");
const loginErro = document.getElementById("login-erro");
const usuarioNomeEl = document.getElementById("usuario-nome");
const usuarioFotoEl = document.getElementById("usuario-foto");
const linksNav = document.querySelectorAll("#sidebar-nav a");

let formLancamentoIniciado = false;
let usuarioAtual = null;

// --- Roteamento simples entre seções (sem framework, só troca de "hidden") ---
function irParaSecao(nomeSecao, user) {
  document.querySelectorAll(".secao-conteudo").forEach((secao) => {
    secao.hidden = secao.id !== `secao-${nomeSecao}`;
  });
  linksNav.forEach((link) => {
    link.classList.toggle("ativo", link.dataset.secao === nomeSecao);
  });

  if (nomeSecao === "lancamento" && !formLancamentoIniciado) {
    formLancamentoIniciado = true;
    iniciarFormLancamento(user);
  }
}

linksNav.forEach((link) => {
  link.addEventListener("click", (evento) => {
    evento.preventDefault();
    irParaSecao(link.dataset.secao, usuarioAtual);
  });
});

function mostrarApp(user) {
  usuarioAtual = user;
  telaLogin.style.display = "none";
  appShell.classList.add("ativo");

  const lancador = dadosDoLancador(user);
  usuarioNomeEl.textContent = lancador.usuario_nome || lancador.usuario_email;
  if (lancador.usuario_foto) {
    usuarioFotoEl.src = lancador.usuario_foto;
    usuarioFotoEl.style.display = "block";
  }

  irParaSecao("dashboard", user);
}

function mostrarLogin() {
  appShell.classList.remove("ativo");
  telaLogin.style.display = "flex";
}

botaoEntrar.addEventListener("click", async () => {
  loginErro.textContent = "";
  botaoEntrar.disabled = true;
  try {
    await entrarComGoogle();
    // A UI é atualizada pelo observador abaixo, não é preciso fazer nada aqui.
  } catch (erro) {
    console.error("Falha no login:", erro);
    loginErro.textContent = "Não foi possível entrar. Tente novamente.";
  } finally {
    botaoEntrar.disabled = false;
  }
});

botaoSair.addEventListener("click", async () => {
  await sair();
});

// Observa o estado de login em todo carregamento da página —
// mantém o usuário logado entre sessões (comportamento padrão do Firebase Auth).
observarAutenticacao((user) => {
  if (user) {
    mostrarApp(user);
  } else {
    mostrarLogin();
  }
});

// Registro do service worker (funcionamento offline do "shell" do app)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((erro) => {
      console.warn("Service worker não registrado:", erro);
    });
  });
}
