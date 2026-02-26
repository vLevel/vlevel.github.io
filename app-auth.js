import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

await setPersistence(auth, browserLocalPersistence);

onAuthStateChanged(auth, user => {
  if (user) {
    window.location.href = "dashboard.html";
  }
});

const tabs = document.querySelectorAll(".tab-btn");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(btn => {
  btn.onclick = () => {
    tabs.forEach(b => b.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  };
});

document.getElementById("loginForm").onsubmit = async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  try {
    await signInWithEmailAndPassword(auth, data.email, data.password);
    window.location.href = "dashboard.html";
  } catch (err) {
    document.getElementById("loginError").textContent = err.message;
  }
};

document.getElementById("registerForm").onsubmit = async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  try {
    await createUserWithEmailAndPassword(auth, data.email, data.password);
    document.getElementById("registerSuccess").textContent = "Account created successfully";
  } catch (err) {
    document.getElementById("registerError").textContent = err.message;
  }
};
