// ============================================================
// firebase-config.js
// Inicialização central do Firebase (app, auth, firestore, storage).
// Todos os outros módulos importam as instâncias daqui — nunca
// chame initializeApp() em mais de um lugar.
//
// COMO OBTER ESTES VALORES:
// 1. console.firebase.google.com → crie um projeto (gratuito, plano Spark)
// 2. Adicione um app da Web (ícone </>) dentro do projeto
// 3. Copie o objeto "firebaseConfig" que aparece e cole abaixo
// 4. Ative no console: Authentication → Sign-in method → Google
// 5. Ative no console: Firestore Database → Criar banco de dados
// 6. Ative no console: Storage → Começar (para upload de NFs)
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

// >>> SUBSTITUA pelos valores do seu projeto Firebase <<<
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Restringe o login a um domínio específico do condomínio/administradora,
// se aplicável. Deixe comentado se o login deve aceitar qualquer conta Google.
// googleProvider.setCustomParameters({ hd: "seudominio.com.br" });
