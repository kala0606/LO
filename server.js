// server.js
const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, { cors: { origin: "*" } });

let bpm = 120;
let interval = (60000 / bpm) / 4; // 16th note

setInterval(() => {
  io.emit("tick", {
    time: Date.now(),
    bpm: bpm
  });
}, interval);

server.listen(3000, () => {
  console.log("Clock server running on http://localhost:3000");
});
