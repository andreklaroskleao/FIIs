import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyD4Yq5QBh84yox8-yLS6mxqP3o0vpHQUb4",
  authDomain: "appfiis-ii.firebaseapp.com",
  projectId: "appfiis-ii",
  storageBucket: "appfiis-ii.firebasestorage.app",
  messagingSenderId: "735639659271",
  appId: "1:735639659271:web:14174f2a9acb9eefd95ba2",
  measurementId: "G-DC17FH54CE"
};

const aplicacaoFirebase = initializeApp(configuracaoFirebase);

const bancoDeDados = getFirestore(aplicacaoFirebase);
const autenticacao = getAuth(aplicacaoFirebase);
const provedorGoogle = new GoogleAuthProvider();

provedorGoogle.setCustomParameters({
    prompt: 'select_account'
});

export const db = bancoDeDados;
export const auth = autenticacao;
export const provider = provedorGoogle;

export {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
};
