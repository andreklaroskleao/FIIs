import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

/*
    Substitua pelos dados reais do seu projeto Firebase.
    Mantenha os nomes exatamente assim para compatibilidade total com o restante do projeto.
*/

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
const db = getFirestore(aplicacaoFirebase);
const auth = getAuth(aplicacaoFirebase);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: 'select_account'
});

export {
    db,
    auth,
    provider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
};