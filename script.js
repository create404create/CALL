import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// ✅ Your Firebase Config
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

// DOM elements
const createBtn = document.getElementById("createTeam");
const joinBtn = document.getElementById("joinTeam");
const teamSection = document.getElementById("teamSection");
const teamCodeDisplay = document.getElementById("teamCodeDisplay");
const teamCodeInput = document.getElementById("teamCodeInput");
const enterChatBtn = document.getElementById("enterChat");
const usernameInput = document.getElementById("username");
const chatSection = document.getElementById("chatSection");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessage");
const messagesDiv = document.getElementById("messages");

let teamCode = "";
let username = "";

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

enterChatBtn.onclick = () => {
  username = usernameInput.value.trim();
  teamCode = teamCode || teamCodeInput.value.trim();
  if (!username || !teamCode) return alert("Please enter name and code!");
  teamSection.classList.add("hidden");
  chatSection.classList.remove("hidden");

  const chatRef = ref(db, "chats/" + teamCode);
  onChildAdded(chatRef, (data) => {
    const msg = data.val();
    const msgEl = document.createElement("p");
    msgEl.textContent = `${msg.name}: ${msg.text}`;
    messagesDiv.appendChild(msgEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
};

sendMessageBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (!text) return;
  const chatRef = ref(db, "chats/" + teamCode);
  push(chatRef, { name: username, text });
  messageInput.value = "";
};
