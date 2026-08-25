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
import { listarCentrosCusto, listarTodasContas, verificarUsuarioAutorizado } from "./firestore.js";
import { iniciarFormLancamento } from "./form-lancamento.js";
import { iniciarRateio } from "./rateio.js";
import { iniciarDashboard, invalidarDashboard, dashboardJaCarregado, iniciarPainelTerceiros, invalidarPainelTerceiros, painelTerceirosJaCarregado } from "./dashboard.js";
import { iniciarOrdensPagamento } from "./ordens-pagamento.js";
import { iniciarOrcamento } from "./orcamento.js";
import { iniciarRelatorios } from "./relatorios.js";
import { iniciarUsuarios } from "./usuarios.js";

const telaLogin = document.getElementById("tela-login");
const appShell = document.getElementById("app-shell");
const botaoEntrar = document.getElementById("botao-entrar-google");
const botaoSair = document.getElementById("botao-sair");
const loginErro = document.getElementById("login-erro");
const usuarioNomeEl = document.getElementById("usuario-nome");
const usuarioFotoEl = document.getElementById("usuario-foto");
const linksNav = document.querySelectorAll("#sidebar-nav a");
const botaoSidebarToggle = document.getElementById("sidebar-toggle");

// --- Sidebar retrátil (lembra a preferência entre sessões) ---
const CHAVE_SIDEBAR = "bills-sidebar-colapsada";
if (localStorage.getItem(CHAVE_SIDEBAR) === "true") {
  appShell.classList.add("sidebar-colapsada");
  if (botaoSidebarToggle) botaoSidebarToggle.title = "Expandir menu";
}
botaoSidebarToggle?.addEventListener("click", () => {
  const colapsada = appShell.classList.toggle("sidebar-colapsada");
  localStorage.setItem(CHAVE_SIDEBAR, String(colapsada));
  botaoSidebarToggle.title = colapsada ? "Expandir menu" : "Recolher menu";
});

let formLancamentoIniciado = false;
let usuarioAtual = null;
let papelAtual = null;

// Quais papéis podem ver cada seção do menu — só controla a VISIBILIDADE
// (conveniência de interface). A trava de verdade está nas Regras do
// Firestore; esconder um item aqui nunca substitui isso.
const PERMISSOES_NAV = {
  dashboard: ["administrador", "financeiro", "leitura"],
  terceiros: ["administrador", "financeiro", "leitura"],
  lancamento: ["administrador", "financeiro"],
  "ordens-pagamento": ["administrador", "financeiro"],
  orcamento: ["administrador"],
  relatorios: ["administrador", "financeiro", "leitura"],
  usuarios: ["administrador"],
};

function aplicarPermissoesNav(papel) {
  linksNav.forEach((link) => {
    const permitido = PERMISSOES_NAV[link.dataset.secao]?.includes(papel) ?? false;
    link.closest("li").hidden = !permitido;
  });
}

// --- Roteamento simples entre seções (sem framework, só troca de "hidden") ---
function irParaSecao(nomeSecao, user) {
  // Blindagem de UX (não é a segurança de verdade, isso está nas Regras do
  // Firestore) — evita cair numa tela vazia se o link nem devesse aparecer.
  if (!PERMISSOES_NAV[nomeSecao]?.includes(papelAtual)) {
    nomeSecao = "dashboard";
  }

  document.querySelectorAll(".secao-conteudo").forEach((secao) => {
    secao.hidden = secao.id !== `secao-${nomeSecao}`;
  });
  linksNav.forEach((link) => {
    link.classList.toggle("ativo", link.dataset.secao === nomeSecao);
  });

  if (nomeSecao === "lancamento" && !formLancamentoIniciado) {
    iniciarFormLancamento(user)
      .then(() => {
        formLancamentoIniciado = true;
      })
      .catch((erro) => {
        console.error("Erro ao iniciar tela de lançamento:", erro);
        // formLancamentoIniciado continua false — próxima visita à aba tenta de novo
      });
    iniciarRateio(user);
  }

  if (nomeSecao === "dashboard" && !dashboardJaCarregado()) {
    iniciarDashboard();
  }

  if (nomeSecao === "terceiros" && !painelTerceirosJaCarregado()) {
    iniciarPainelTerceiros();
  }

  if (nomeSecao === "ordens-pagamento") {
    iniciarOrdensPagamento();
  }

  if (nomeSecao === "orcamento") {
    iniciarOrcamento();
  }

  if (nomeSecao === "relatorios") {
    iniciarRelatorios();
  }

  if (nomeSecao === "usuarios") {
    iniciarUsuarios();
  }
}

linksNav.forEach((link) => {
  link.addEventListener("click", (evento) => {
    evento.preventDefault();
    irParaSecao(link.dataset.secao, usuarioAtual);
  });
});

function mostrarApp(user, papel) {
  usuarioAtual = user;
  papelAtual = papel;
  telaLogin.style.display = "none";
  appShell.classList.add("ativo");

  aplicarPermissoesNav(papel);

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
// A cada mudança, confere se o e-mail está na lista de autorizados ANTES
// de mostrar qualquer tela do app — quem não está na lista é deslogado
// na hora, sem ver nada além da mensagem de acesso negado.
observarAutenticacao(async (user) => {
  if (!user) {
    mostrarLogin();
    return;
  }

  try {
    const papel = await verificarUsuarioAutorizado(user.email);
    if (!papel) {
      await sair();
      mostrarLogin();
      loginErro.textContent = `O e-mail ${user.email} não está autorizado a acessar o Bills. Fale com o administrador.`;
      return;
    }
    mostrarApp(user, papel);
  } catch (erro) {
    console.error("Erro ao verificar autorização:", erro);
    await sair();
    mostrarLogin();
    loginErro.textContent = "Não foi possível confirmar sua autorização. Tente novamente.";
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

// --- Ferramenta de diagnóstico, chamável direto do console (F12) ---
// Digite: diagnosticarCentros()
// Lista todos os Centros de Custo, agrupa por nome e aponta duplicados —
// útil quando um Centro "some" numa tela mas aparece em outra, sinal
// clássico de dois documentos diferentes com o mesmo nome.
window.diagnosticarCentros = async () => {
  const [centros, contas] = await Promise.all([listarCentrosCusto(), listarTodasContas()]);
  const porNome = new Map();
  centros.forEach((c) => {
    const chave = c.nome.trim().toLowerCase();
    if (!porNome.has(chave)) porNome.set(chave, []);
    porNome.get(chave).push(c);
  });

  console.log(`Total de Centros de Custo: ${centros.length}`);
  const duplicados = [...porNome.entries()].filter(([, lista]) => lista.length > 1);

  if (duplicados.length === 0) {
    console.log("Nenhum nome duplicado encontrado.");
  } else {
    console.warn(`${duplicados.length} nome(s) de Centro duplicado(s) encontrado(s):`);
    duplicados.forEach(([nome, lista]) => {
      console.group(`"${lista[0].nome}" (${lista.length} documentos)`);
      lista.forEach((c) => {
        const contasDesse = contas.filter((conta) => conta.centro_custo_id === c.id);
        console.log(`ID: ${c.id} | tipo_gestao: ${c.tipo_gestao} | ${contasDesse.length} conta(s): ${contasDesse.map((cc) => cc.nome).join(", ") || "(nenhuma)"}`);
      });
      console.groupEnd();
    });
  }
  return { centros, duplicados };
};
