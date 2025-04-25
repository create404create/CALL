import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, set, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// ✅ Firebase Config
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
const usernameInput = document.getElementById("username");
const enterChatBtn = document.getElementById("enterChat");
const chatSection = document.getElementById("chatSection");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessage");
const teamNameLabel = document.getElementById("teamNameLabel");
const copyCodeBtn = document.getElementById("copyCode");
const clearChatBtn = document.getElementById("clearChat");
const leaveChatBtn = document.getElementById("leaveChat");
const typingDiv = document.getElementById("typing");

let teamCode = "";
let username = "";
let typingRef;

// Load from localStorage
usernameInput.value = localStorage.getItem("chatUsername") || "";

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
  if (!username || !teamCode) return alert("Please enter name and team code");
  localStorage.setItem("chatUsername", username);

  teamSection.classList.add("hidden");
  chatSection.classList.remove("hidden");
  teamNameLabel.textContent = "Team Code: " + teamCode;

  const chatRef = ref(db, "chats/" + teamCode);

  onChildAdded(chatRef, (data) => {
    const msg = data.val();
    const msgEl = document.createElement("div");
    msgEl.classList.add("message");
    if (msg.name === username) msgEl.classList.add("self");
    msgEl.innerHTML = `<strong>${msg.name}</strong>: ${msg.text}<span class="time">${msg.time}</span>`;
    messagesDiv.appendChild(msgEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  // Typing status
  typingRef = ref(db, "typing/" + teamCode);
  onValue(typingRef, (snapshot) => {
    const val = snapshot.val();
    typingDiv.classList.toggle("hidden", !val || val === username);
  });
};

sendMessageBtn.onclick = sendMessage;
messageInput.onkeydown = (e) => {
  set(typingRef, username);
  if (e.key === "Enter") sendMessage();
};
messageInput.onblur = () => set(typingRef, "");

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  const chatRef = ref(db, "chats/" + teamCode);
  const time = new Date().toLocaleTimeString();
  push(chatRef, { name: username, text, time });
  messageInput.value = "";
  set(typingRef, "");
}

copyCodeBtn.onclick = () => {
  navigator.clipboard.writeText(teamCode);
  alert("Team Code copied!");
};

clearChatBtn.onclick = () => {
  if (confirm("Clear all messages?")) {
    const chatRef = ref(db, "chats/" + teamCode);
    set(chatRef, null);
    messagesDiv.innerHTML = "";
  }
};

leaveChatBtn.onclick = () => {
  location.reload();
};
