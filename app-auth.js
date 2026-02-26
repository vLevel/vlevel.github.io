import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Tabs UI
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Convertir username → email interno
function usernameToEmail(username) {
  return `${username}@vlevel.app`;
}

// LOGIN
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  loginError.textContent = '';

  const data = Object.fromEntries(new FormData(loginForm).entries());
  const email = usernameToEmail(data.username.trim());
  const password = data.password;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = 'dashboard.html';
  } catch (err) {
    loginError.textContent = 'Credenciales inválidas.';
  }
});

// REGISTRO
const registerForm = document.getElementById('registerForm');
const registerError = document.getElementById('registerError');
const registerSuccess = document.getElementById('registerSuccess');

registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  registerError.textContent = '';
  registerSuccess.textContent = '';

  const data = Object.fromEntries(new FormData(registerForm).entries());
  const email = usernameToEmail(data.username.trim());
  const password = data.password;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      username: data.username.trim(),
      createdAt: new Date()
    });
    registerSuccess.textContent = 'Cuenta creada correctamente.';
  } catch (err) {
    registerError.textContent = 'No se pudo crear la cuenta.';
  }
});

// Si ya está logueado → dashboard
onAuthStateChanged(auth, user => {
  if (user) window.location.href = 'dashboard.html';
});
