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

const firebaseConfig = {
  apiKey: "AIzaSyCpS-T6XkvilXKxehbpHOjU6Z2A-d3DAzI",
  authDomain: "financeiro-707f0.firebaseapp.com",
  projectId: "financeiro-707f0",
  storageBucket: "financeiro-707f0.firebasestorage.app",
  messagingSenderId: "577905703133",
  appId: "1:577905703133:web:570912c5e1970f58fc8334",
  measurementId: "G-3N2BKVLSNC"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Restringe o login a um domínio específico do condomínio/administradora,
// se aplicável. Deixe comentado se o login deve aceitar qualquer conta Google.
// googleProvider.setCustomParameters({ hd: "seudominio.com.br" });
