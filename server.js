const { Server } = require("socket.io");
const http = require("http");

// create HTTP server for Render
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("🎵 Orchestra Conductor is running");
});

// create Socket.io server
const io = new Server(server, {
  cors: { origin: "*" }
});

let bpm = 120;
let interval = (60000 / bpm) / 4; // 16th note

setInterval(() => {
  io.emit("tick", {
    time: Date.now(),
    bpm: bpm
  });
}, interval);

// IMPORTANT: use process.env.PORT (Render gives you this)
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Conductor server running on port ${PORT}`);
});
