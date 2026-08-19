// ============================================================
// auth.js
// Login/logout via Google e observador de estado de autenticação.
// Este é o módulo que substitui a "coleta automática de e-mail"
// que o Google Forms fazia — aqui o e-mail e UID do usuário
// ficam disponíveis em qualquer lançamento gravado no Firestore.
// ============================================================

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { auth, googleProvider } from "./firebase-config.js";

/**
 * Inicia o login com popup do Google.
 * Retorna o objeto do usuário autenticado ou lança erro (tratado pelo chamador).
 */
export async function entrarComGoogle() {
  const resultado = await signInWithPopup(auth, googleProvider);
  return resultado.user;
}

/** Encerra a sessão do usuário atual. */
export async function sair() {
  await signOut(auth);
}

/**
 * Registra um callback chamado sempre que o estado de login muda
 * (ao carregar a página, ao logar, ao deslogar).
 * callback(user) recebe `null` quando não há usuário autenticado.
 */
export function observarAutenticacao(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Retorna um objeto simplificado com os dados que vamos gravar
 * em todo lançamento, equivalente à coluna "e-mail do lançador"
 * que o Google Forms preenchia automaticamente.
 */
export function dadosDoLancador(user) {
  if (!user) return null;
  return {
    usuario_uid: user.uid,
    usuario_email: user.email,
    usuario_nome: user.displayName,
    usuario_foto: user.photoURL,
  };
}
