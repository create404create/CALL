const firebaseConfig = {
  apiKey: "AIzaSyBGuOdiiaHrQrRtCRY4iNSlRUH2eAyBADw",
  authDomain: "team-call-demo.firebaseapp.com",
  databaseURL: "https://team-call-demo-default-rtdb.firebaseio.com",
  projectId: "team-call-demo",
  storageBucket: "team-call-demo.appspot.com",
  messagingSenderId: "313963560533",
  appId: "1:313963560533:web:2483af5d6008ba4f61dedc",
  measurementId: "G-41CG7X1KJ0"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const messagesContainer = document.getElementById("messages");
const fileInput = document.getElementById("file-input");
const attachBtn = document.getElementById("attach");
const toggleThemeBtn = document.getElementById("toggleTheme");
const logoutBtn = document.getElementById("logout");
const searchInput = document.getElementById("search-input");

let username = prompt("Enter your username:");
if (!username) username = "Anonymous";

function appendMessage(data, isOwnMessage) {
  const msg = document.createElement("div");
  msg.classList.add("message", isOwnMessage ? "sent" : "received");

  msg.innerHTML = `<strong>${data.username}</strong>: ${data.message} <br><small>${data.timestamp}</small>`;
  
  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value;
  const timestamp = new Date().toLocaleTimeString();
  if (message.trim() !== "") {
    db.ref("messages").push({ username, message, timestamp });
    messageInput.value = "";
  }
});

db.ref("messages").on("child_added", (snapshot) => {
  const data = snapshot.val();
  appendMessage(data, data.username === username);
});

attachBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    db.ref("messages").push({
      username,
      message: `File: ${file.name}`,
      timestamp: new Date().toLocaleTimeString(),
    });
  };
  reader.readAsDataURL(file);
});

toggleThemeBtn.addEventListener("click", () => document.body.classList.toggle("dark-mode"));

logoutBtn.addEventListener("click", () => {
  firebase.auth().signOut();
  window.location.reload();
});

searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const messages = document.querySelectorAll(".message");
  messages.forEach((msg) => {
    if (msg.innerText.toLowerCase().includes(query)) {
      msg.style.display = "block";
    } else {
      msg.style.display = "none";
    }
  });
});
