const socket = io("http://localhost:3000", {
  autoConnect: false,
});

socket.on("connect", () => {
  addMessage(`Conectado con el id ${socket.id}`);
  toggleStatusStyles();
});

socket.on("disconnect", () => {
  addMessage(`Desconectado del servidor`);
  toggleStatusStyles();
});

socket.on("server-message", (message, client) => {
  addMessage(message, "incomming", client);
});

socket.on("client-typing", (client) => {
  showClientStatus(client);
});

const btnConnect = document.getElementById("button-connect");
const btnDisconnect = document.getElementById("button-disconnect");
const chatBox = document.getElementById("chat-box");
const inputMessage = document.getElementById("input-message");
const btnSend = document.getElementById("button-send");
const btnSendRoom = document.getElementById("button-send-room");
const inputRoom = document.getElementById("input-room");
const btnJoin = document.getElementById("button-join");
const btnLeave = document.getElementById("button-leave");
const clientStatus = document.getElementById("client-status");

btnConnect.addEventListener("click", (e) => {
  e.preventDefault();
  socket.open();
});

btnDisconnect.addEventListener("click", (e) => {
  e.preventDefault();
  socket.close();
});

btnSend.addEventListener("click", (e) => {
  e.preventDefault();
  sendMessageToAll(inputMessage.value);
});

btnSendRoom.addEventListener("click", (e) => {
  e.preventDefault();
  sendMessageToRoom(inputMessage.value, inputRoom.value);
});

btnJoin.addEventListener("click", (e) => {
  e.preventDefault();
  joinRoom(inputRoom.value);
});

btnLeave.addEventListener("click", (e) => {
  e.preventDefault();
  leaveRoom(inputRoom.value);
});

inputMessage.addEventListener("keydown", (e) => {
  if (e.key >= "a" && e.key <= "z") {
    sendKeyPressToRoom(inputRoom.value);
  }
});

function sendMessageToAll(message) {
  if (message !== "") {
    console.log(`sending message "${message}" to all`);
    socket.emit("client-message-to-all", inputMessage.value);
    addMessage(inputMessage.value, "outgoing");
    inputMessage.value = "";
  }
}

function sendMessageToRoom(message, room) {
  if (message !== "") {
    console.log(`sending message "${message}" to room ${room}`);
    socket.emit("client-message-to-room", inputMessage.value, room);
    addMessage(inputMessage.value, "outgoing");
    inputMessage.value = "";
  }
}

function sendKeyPressToRoom(room) {
  if (room) {
    socket.emit("client-typing", room, socket.id);
  }
}

var timer;
function showClientStatus(client) {
  clientStatus.innerText = `${client} is typing...`;
  console.log(clientStatus.className);

  clearTimeout(timer);
  timer = setTimeout(() => {
    clientStatus.innerText = "";
    console.log(clientStatus.className);
  }, 500);
}

function addMessage(message, type, sender) {
  let div = newTextDiv(message);
  if (type === "outgoing") {
    div.className = "message-outgoing";
  } else if (type === "incomming") {
    div.prepend(newTextDiv(sender, "sender"));
    div.className = "message-incomming";
  } else {
    div.className = "message-info";
  }
  chatBox.appendChild(div);
  chatBox.scrollTo(0, chatBox.scrollHeight);
}

function newTextDiv(text, className) {
  let node = document.createTextNode(text);
  let div = document.createElement("div");
  if (className) {
    div.className = "sender";
  }
  div.appendChild(node);
  return div;
}

function joinRoom(room) {
  if (room !== "") {
    console.log(`joined to room ${room}`);
    socket.emit("client-join-room-request", room, () => {
      addMessage(`Te uniste a la sala "${room}"`);
    });
  }
}

function leaveRoom(room) {
  if (room !== "") {
    console.log(`leaved room ${room}`);
    socket.emit("client-leave-room-request", room, () => {
      addMessage(`Dejaste a la sala "${room}"`);
    });
  }
}

function toggleStatusStyles() {
  if (socket.connected) {
    btnConnect.classList.add("disabled");
    btnConnect.classList.remove("enabled");
    btnDisconnect.classList.add("enabled");
    btnDisconnect.classList.remove("disabled");
  } else if (socket.disconnected) {
    btnConnect.classList.add("enabled");
    btnConnect.classList.remove("disabled");
    btnDisconnect.classList.add("disabled");
    btnDisconnect.classList.remove("enabled");
  }
}

toggleStatusStyles();
