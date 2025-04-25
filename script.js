import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBGuOdiiaHrQrRtCRY4iNSlRUH2eAyBADw",
  authDomain: "team-call-demo.firebaseapp.com",
  databaseURL: "https://team-call-demo-default-rtdb.firebaseio.com",
  projectId: "team-call-demo",
  storageBucket: "team-call-demo.firebasestorage.app",
  messagingSenderId: "313963560533",
  appId: "1:313963560533:web:2483af5d6008ba4f61dedc",
  measurementId: "G-41CG7X1KJ0"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🔹 DOM elements
const createBtn = document.getElementById("createTeam");
const joinBtn = document.getElementById("joinTeam");
const teamSection = document.getElementById("teamSection");
const teamCodeDisplay = document.getElementById("teamCodeDisplay");
const teamCodeInput = document.getElementById("teamCodeInput");
const startCallBtn = document.getElementById("startCall");
const callTypeSelect = document.getElementById("callType");
const callArea = document.getElementById("callArea");
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

let teamCode = "";

createBtn.onclick = () => {
  teamCode = Math.floor(10000 + Math.random() * 90000).toString();
  teamCodeDisplay.textContent = "Your Team Code: " + teamCode;
  teamCodeDisplay.classList.remove("hidden");
  teamCodeInput.classList.add("hidden");
  teamSection.classList.remove("hidden");
};

joinBtn.onclick = () => {
  teamCodeDisplay.classList.add("hidden");
  teamCodeInput.classList.remove("hidden");
  teamSection.classList.remove("hidden");
};

startCallBtn.onclick = async () => {
  const code = teamCode || teamCodeInput.value;
  const callType = callTypeSelect.value;
  if (!code) return alert("Please enter a team code!");

  const stream = await navigator.mediaDevices.getUserMedia({
    video: callType === "video",
    audio: true,
  });

  localVideo.srcObject = stream;
  callArea.classList.remove("hidden");

  // Store team info in Firebase (basic signaling idea placeholder)
  set(ref(db, "teams/" + code), {
    callType: callType,
    active: true,
  });

  // Listen for partner
  onValue(ref(db, "teams/" + code), (snapshot) => {
    const data = snapshot.val();
    if (data && data.active) {
      console.log("Team active:", data.callType);
    }
  });
};
