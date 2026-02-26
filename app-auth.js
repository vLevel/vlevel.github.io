import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
// Si quieres guardar info extra de usuario:
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Config (ajusta apiKey, authDomain, projectId)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "vlevel.firebaseapp.com",
  projectId: "vlevel",
  appId: "1:728207102095:web:9f7d1e3ff1614b7505e0fa",
  messagingSenderId: "728207102095"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Tabs
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

// Helper: convertir username a email interno
function usernameToEmail(username) {
  return `${username}@vlevel.app`;
}

// Login
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
    loginError.textContent = 'Credenciales inválidas o usuario no existe.';
  }
});

// Registro
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
    registerSuccess.textContent = 'Cuenta creada, ahora puedes iniciar sesión.';
  } catch (err) {
    registerError.textContent = 'No se pudo crear la cuenta (quizá ya existe).';
  }
});

// Si ya está logueado, ir directo al dashboard
onAuthStateChanged(auth, user => {
  if (user) {
    window.location.href = 'dashboard.html';
  }
});
