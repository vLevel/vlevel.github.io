import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let authChecked = false;

onAuthStateChanged(auth, user => {
  if (authChecked) return;
  authChecked = true;

  if (user) {
    window.location.replace("dashboard.html");
  }
});

const tabs = document.querySelectorAll(".tab-button");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  loginError.textContent = "";
  const data = Object.fromEntries(new FormData(loginForm).entries());
  try {
    await signInWithEmailAndPassword(auth, data.email, data.password);
    window.location.replace("dashboard.html");
  } catch {
    loginError.textContent = "Invalid credentials";
  }
});

const registerForm = document.getElementById("registerForm");
const registerError = document.getElementById("registerError");
const registerSuccess = document.getElementById("registerSuccess");

registerForm.addEventListener("submit", async e => {
  e.preventDefault();
  registerError.textContent = "";
  registerSuccess.textContent = "";
  const data = Object.fromEntries(new FormData(registerForm).entries());
  try {
    await createUserWithEmailAndPassword(auth, data.email, data.password);
    registerSuccess.textContent = "Account created";
  } catch {
    registerError.textContent = "Registration error";
  }
});
