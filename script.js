// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD-EXAMPLEKEY1234567890abcdefg",
  authDomain: "team-call-app.firebaseapp.com",
  databaseURL: "https://team-call-app.firebaseio.com",
  projectId: "team-call-app",
  storageBucket: "team-call-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let localStream, remoteStream, peerConnection;
const servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

function generateCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

function createTeam() {
  const code = generateCode();
  document.getElementById("teamCode").innerText = code;
  document.getElementById("choice").classList.add("hidden");
  document.getElementById("createSection").classList.remove("hidden");
  window.roomCode = code;
}

function showJoin() {
  document.getElementById("choice").classList.add("hidden");
  document.getElementById("joinSection").classList.remove("hidden");
}

async function startCall(isCreator) {
  const code = isCreator ? window.roomCode : document.getElementById("codeInput").value;
  const callType = isCreator
    ? document.getElementById("callTypeCreate").value
    : document.getElementById("callTypeJoin").value;

  const constraints = callType === "video" 
    ? { video: true, audio: true }
    : { video: false, audio: true };

  localStream = await navigator.mediaDevices.getUserMedia(constraints);
  document.getElementById("callArea").classList.remove("hidden");
  document.getElementById("localVideo").srcObject = localStream;

  peerConnection = new RTCPeerConnection(servers);
  remoteStream = new MediaStream();
  document.getElementById("remoteVideo").srcObject = remoteStream;

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = event => {
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
  };

  const callRef = db.ref("calls/" + code);

  if (isCreator) {
    peerConnection.onicecandidate = e => {
      if (e.candidate) {
        callRef.child("offerCandidates").push(JSON.stringify(e.candidate));
      }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    await callRef.set({ offer: JSON.stringify(offer) });

    callRef.child("answer").on("value", async snapshot => {
      const data = snapshot.val();
      if (data && !peerConnection.currentRemoteDescription) {
        const answer = JSON.parse(data);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    callRef.child("answerCandidates").on("child_added", async snapshot => {
      const candidate = new RTCIceCandidate(JSON.parse(snapshot.val()));
      await peerConnection.addIceCandidate(candidate);
    });
  } else {
    peerConnection.onicecandidate = e => {
      if (e.candidate) {
        callRef.child("answerCandidates").push(JSON.stringify(e.candidate));
      }
    };

    const snapshot = await callRef.child("offer").once("value");
    const offer = JSON.parse(snapshot.val());
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    await callRef.child("answer").set(JSON.stringify(answer));

    callRef.child("offerCandidates").on("child_added", async snapshot => {
      const candidate = new RTCIceCandidate(JSON.parse(snapshot.val()));
      await peerConnection.addIceCandidate(candidate);
    });
  }
}
