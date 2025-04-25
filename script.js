// Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let username = "";

window.login = function () {
  const input = document.getElementById("usernameInput");
  if (input.value.trim()) {
    username = input.value.trim();
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("chatContainer").style.display = "flex";
  }
};

window.sendMessage = function () {
  const messageInput = document.getElementById("messageInput");
  const text = messageInput.value.trim();
  if (text) {
    push(ref(db, "messages"), {
      sender: username,
      text,
      type: "text"
    });
    messageInput.value = "";
  }
};

const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    let type = "text";
    if (file.type.startsWith("image")) type = "image";
    else if (file.type.startsWith("video")) type = "video";
    else if (file.type.startsWith("audio")) type = "audio";

    push(ref(db, "messages"), {
      sender: username,
      file: reader.result,
      type,
      name: file.name
    });
  };
  reader.readAsDataURL(file);
});

const messagesRef = ref(db, "messages");
onChildAdded(messagesRef, (data) => {
  const msg = data.val();
  const div = document.createElement("div");
  div.className = "message";
  if (msg.sender === username) div.classList.add("self");

  if (msg.type === "text") {
    div.textContent = `${msg.sender}: ${msg.text}`;
  } else if (msg.type === "image") {
    div.innerHTML = `<strong>${msg.sender}:</strong><br><img src="${msg.file}" style="max-width: 200px;" />`;
  } else if (msg.type === "video") {
    div.innerHTML = `<strong>${msg.sender}:</strong><br><video src="${msg.file}" controls style="max-width: 200px;"></video>`;
  } else if (msg.type === "audio") {
    div.innerHTML = `<strong>${msg.sender}:</strong><br><audio src="${msg.file}" controls></audio>`;
  }

  document.getElementById("messages").appendChild(div);
  document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
});
