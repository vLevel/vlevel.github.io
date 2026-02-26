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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI
const currentUserSpan = document.getElementById('currentUser');
const logoutBtn = document.getElementById('logoutBtn');

// Navegación
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');

navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    navItems.forEach(b => b.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.section).classList.add('active');
  });
});

// Estado de usuario
let currentUser = null;

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = user;
  currentUserSpan.textContent = `Conectado como ${user.email.split('@')[0]}`;

  await loadFlights();
  await loadBookings();
  await loadLogbook();
});

// Logout
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'index.html';
});

// Crear vuelo
const flightForm = document.getElementById('flightForm');
const flightMsg = document.getElementById('flightMsg');

flightForm.addEventListener('submit', async e => {
  e.preventDefault();
  flightMsg.textContent = '';

  const data = Object.fromEntries(new FormData(flightForm).entries());

  try {
    await addDoc(collection(db, "flights"), {
      flight_number: data.flight_number,
      origin: data.origin,
      destination: data.destination,
      departure_time: data.departure_time || null,
      arrival_time: data.arrival_time || null,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp()
    });

    flightMsg.textContent = 'Ruta creada.';
    flightForm.reset();
    await loadFlights();
  } catch (err) {
    flightMsg.textContent = 'Error al crear la ruta.';
  }
});

// Logbook
const logbookForm = document.getElementById('logbookForm');
const logbookMsg = document.getElementById('logbookMsg');

logbookForm.addEventListener('submit', async e => {
  e.preventDefault();
  logbookMsg.textContent = '';

  const data = Object.fromEntries(new FormData(logbookForm).entries());

  try {
    await addDoc(collection(db, "logbook"), {
      userId: currentUser.uid,
      date: data.date,
      flight_id: data.flight_id || null,
      aircraft: data.aircraft || '',
      block_time: data.block_time || '',
      remarks: data.remarks || '',
      createdAt: serverTimestamp()
    });

    logbookMsg.textContent = 'Entrada añadida.';
    logbookForm.reset();
    await loadLogbook();
  } catch (err) {
    logbookMsg.textContent = 'Error al añadir entrada.';
  }
});

// Cargar vuelos
async function loadFlights() {
  const tbody = document.querySelector('#flightsTable tbody');
  tbody.innerHTML = '';

  const snap = await getDocs(collection(db, "flights"));

  snap.forEach(docSnap => {
    const f = docSnap.data();
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${f.flight_number}</td>
      <td>${f.origin}</td>
      <td>${f.destination}</td>
      <td>${f.departure_time || ''}</td>
      <td>${f.arrival_time || ''}</td>
      <td><button class="book-btn" data-id="${docSnap.id}">Book</button></td>
    `;

    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.book-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const flightId = btn.dataset.id;

      await addDoc(collection(db, "bookings"), {
        userId: currentUser.uid,
        flightId,
        status: 'BOOKED',
        bookedAt: serverTimestamp()
      });

      await loadBookings();
    });
  });
}

// Cargar bookings
async function loadBookings() {
  const tbody = document.querySelector('#bookingsTable tbody');
  tbody.innerHTML = '';

  const q = query(
    collection(db, "bookings"),
    where("userId", "==", currentUser.uid)
  );

  const snap = await getDocs(q);

  const flightsSnap = await getDocs(collection(db, "flights"));
  const flightsMap = {};
  flightsSnap.forEach(f => flightsMap[f.id] = f.data());

  snap.forEach(docSnap => {
    const b = docSnap.data();
    const f = flightsMap[b.flightId] || {};

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${docSnap.id}</td>
      <td>${f.flight_number || ''}</td>
      <td>${f.origin || ''}</td>
      <td>${f.destination || ''}</td>
      <td>${b.status}</td>
      <td>${b.bookedAt ? '' : ''}</td>
    `;

    tbody.appendChild(tr);
  });
}

// Cargar logbook
async function loadLogbook() {
  const tbody = document.querySelector('#logbookTable tbody');
  tbody.innerHTML = '';

  const q = query(
    collection(db, "logbook"),
    where("userId", "==", currentUser.uid)
  );

  const snap = await getDocs(q);

  const flightsSnap = await getDocs(collection(db, "flights"));
  const flightsMap = {};
  flightsSnap.forEach(f => flightsMap[f.id] = f.data());

  snap.forEach(docSnap => {
    const e = docSnap.data();
    const f = e.flight_id ? flightsMap[e.flight_id] : null;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.date}</td>
      <td>${f ? f.flight_number : ''}</td>
      <td>${e.aircraft || ''}</td>
      <td>${e.block_time || ''}</td>
      <td>${e.remarks || ''}</td>
    `;

    tbody.appendChild(tr);
  });
}
