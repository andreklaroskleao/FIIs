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

const firebaseConfig = {
    apiKey: 'COLOQUE_AQUI_SUA_API_KEY',
    authDomain: 'COLOQUE_AQUI_SEU_AUTH_DOMAIN',
    projectId: 'COLOQUE_AQUI_SEU_PROJECT_ID',
    storageBucket: 'COLOQUE_AQUI_SEU_STORAGE_BUCKET',
    messagingSenderId: 'COLOQUE_AQUI_SEU_MESSAGING_SENDER_ID',
    appId: 'COLOQUE_AQUI_SEU_APP_ID'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: 'select_account'
});

export {
    app,
    db,
    auth,
    provider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
};