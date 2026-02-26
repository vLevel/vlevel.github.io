import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async user => {
if (!user) window.location.href="index.html";

document.getElementById("currentUser").textContent=user.email;

loadStats(user.uid);
loadFlights();
loadBookings(user.uid);
loadLogbook(user.uid);
});

document.getElementById("logoutBtn").onclick=async()=>{
await signOut(auth);
window.location.href="index.html";
};

document.querySelectorAll(".nav-item").forEach(btn=>{
btn.onclick=()=>{
document.querySelectorAll(".nav-item").forEach(b=>b.classList.remove("active"));
document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
btn.classList.add("active");
document.getElementById(btn.dataset.section).classList.add("active");
};
});

async function loadStats(uid){
const flightsSnap=await getDocs(collection(db,"flights"));
document.getElementById("totalFlights").textContent=flightsSnap.size;

const bookingsSnap=await getDocs(query(collection(db,"bookings"),where("userId","==",uid)));
document.getElementById("totalBookings").textContent=bookingsSnap.size;

const logSnap=await getDocs(query(collection(db,"logbook"),where("userId","==",uid)));
document.getElementById("totalHours").textContent=logSnap.size;
}

async function loadFlights(){
const tbody=document.querySelector("#flightsTable tbody");
tbody.innerHTML="";
const snap=await getDocs(collection(db,"flights"));
snap.forEach(doc=>{
const f=doc.data();
const tr=document.createElement("tr");
tr.innerHTML=`<td>${f.flight_number}</td><td>${f.origin}</td><td>${f.destination}</td><td></td>`;
tbody.appendChild(tr);
});
}

async function loadBookings(uid){
const tbody=document.querySelector("#bookingsTable tbody");
tbody.innerHTML="";
const snap=await getDocs(query(collection(db,"bookings"),where("userId","==",uid)));
snap.forEach(doc=>{
const b=doc.data();
const tr=document.createElement("tr");
tr.innerHTML=`<td>${doc.id}</td><td>${b.status}</td><td>${b.flightId}</td>`;
tbody.appendChild(tr);
});
}

async function loadLogbook(uid){
const tbody=document.querySelector("#logbookTable tbody");
tbody.innerHTML="";
const snap=await getDocs(query(collection(db,"logbook"),where("userId","==",uid)));
snap.forEach(doc=>{
const e=doc.data();
const tr=document.createElement("tr");
tr.innerHTML=`<td>${e.date}</td><td>${e.aircraft}</td><td>${e.block_time}</td>`;
tbody.appendChild(tr);
});
}
