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
import { listarCentrosCusto, listarTodasContas } from "./firestore.js";
import { iniciarFormLancamento } from "./form-lancamento.js";
import { iniciarRateio } from "./rateio.js";
import { iniciarDashboard, invalidarDashboard, dashboardJaCarregado, iniciarPainelTerceiros, invalidarPainelTerceiros, painelTerceirosJaCarregado } from "./dashboard.js";
import { iniciarOrdensPagamento } from "./ordens-pagamento.js";
import { iniciarOrcamento } from "./orcamento.js";
import { iniciarRelatorios } from "./relatorios.js";

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

// --- Roteamento simples entre seções (sem framework, só troca de "hidden") ---
function irParaSecao(nomeSecao, user) {
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
