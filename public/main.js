const local = document.querySelector("video#local");
const remote = document.querySelector("video#remote");
const span = document.querySelector("span");

const peer = new Peer({ key: "lwjd5qra8257b9" });
peer.on("open", function (id) {
  span.innerHTML = id;
  console.log(`My peer ID is ${id}`);
});

let conn = null;
let destPeerId = null;
let localStream = null;
let remoteStream = null;

peer.on("connection", function (connection) {
  conn = connection;
  conn.on("data", receiveData);
});

peer.on("call", (call) => {
  console.log(call);
  call.answer(localStream);
  call.on("stream", receiveStream);
});

window.addEventListener("load", () => {
  const btnConnect = document.querySelector("button#connect");
  const btnSend = document.querySelector("button#send");
  const text = document.querySelector("input");
  const iptMessage = document.querySelector("textarea");

  navigator.mediaDevices
    .getUserMedia({ video: { width: 420, height: 340 }, audio: true })
    .then(success)
    .catch(fail);

  btnConnect.addEventListener("click", () => {
    conn = peer.connect(text.value);
    destPeerId = text.value;

    conn.on("open", () => {
      remote.setAttribute("muted", true);
      const call = peer.call(destPeerId, localStream);
      call.on("stream", receiveStream);

      conn.on("data", receiveData);
    });
  });

  btnSend.addEventListener("click", () => {
    const message = iptMessage.value;
    iptMessage.value = "";
    sendData(message);
  });
});

const receiveData = (data) => {
  console.log("Received", data);
  const li = document.createElement("li");
  const messages = document.querySelector("ul");
  li.innerHTML = data;
  messages.appendChild(li);
};
const sendData = (message) => {
  conn.send(message);
};

const success = (stream) => {
  localStream = stream;
  local.srcObject = stream;
};

const fail = () => console.log("A Camera não está conectada!");

const receiveStream = (stream) => {
  remoteStream = stream;
  remote.srcObject = stream;
};
