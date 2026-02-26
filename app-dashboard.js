import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const currentUserSpan = document.getElementById("currentUser");
const logoutBtn = document.getElementById("logoutBtn");

let currentUser = null;

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
  currentUserSpan.textContent = user.email;
  await loadFlights();
  await loadBookings();
  await loadLogbook();
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.section).classList.add("active");
  });
});

const flightForm = document.getElementById("flightForm");
flightForm.addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(flightForm).entries());
  await addDoc(collection(db, "flights"), {
    ...data,
    createdBy: currentUser.uid,
    createdAt: serverTimestamp()
  });
  flightForm.reset();
  await loadFlights();
});

async function loadFlights() {
  const tbody = document.querySelector("#flightsTable tbody");
  tbody.innerHTML = "";
  const snap = await getDocs(collection(db, "flights"));
  snap.forEach(docSnap => {
    const f = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.flight_number}</td>
      <td>${f.origin}</td>
      <td>${f.destination}</td>
      <td>${f.departure_time || ""}</td>
      <td>${f.arrival_time || ""}</td>
      <td><button class="book-btn" data-id="${docSnap.id}">Book</button></td>
    `;
    tbody.appendChild(tr);
  });
  document.querySelectorAll(".book-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await addDoc(collection(db, "bookings"), {
        userId: currentUser.uid,
        flightId: btn.dataset.id,
        status: "BOOKED",
        bookedAt: serverTimestamp()
      });
      await loadBookings();
    });
  });
}

async function loadBookings() {
  const tbody = document.querySelector("#bookingsTable tbody");
  tbody.innerHTML = "";
  const q = query(collection(db, "bookings"), where("userId", "==", currentUser.uid));
  const snap = await getDocs(q);
  snap.forEach(docSnap => {
    const b = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${docSnap.id}</td>
      <td>${b.status}</td>
      <td>${b.flightId}</td>
      <td>${b.bookedAt ? "Confirmed" : ""}</td>
      <td></td>
      <td></td>
    `;
    tbody.appendChild(tr);
  });
}

const logbookForm = document.getElementById("logbookForm");
logbookForm.addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(logbookForm).entries());
  await addDoc(collection(db, "logbook"), {
    ...data,
    userId: currentUser.uid,
    createdAt: serverTimestamp()
  });
  logbookForm.reset();
  await loadLogbook();
});

async function loadLogbook() {
  const tbody = document.querySelector("#logbookTable tbody");
  tbody.innerHTML = "";
  const q = query(collection(db, "logbook"), where("userId", "==", currentUser.uid));
  const snap = await getDocs(q);
  snap.forEach(docSnap => {
    const e = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.date}</td>
      <td>${e.flight_id || ""}</td>
      <td>${e.aircraft || ""}</td>
      <td>${e.block_time || ""}</td>
      <td>${e.remarks || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}
