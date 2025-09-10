const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let bpm = 120;
let interval = null;

// Serve UI
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>🎵 Orchestra Conductor</title>
        <style>
          body { font-family: sans-serif; background: #111; color: #eee; text-align: center; padding: 2em; }
          h1 { color: #0f0; }
          input { font-size: 1.2em; padding: 0.2em; width: 80px; text-align: center; }
          button { font-size: 1.2em; margin-left: 1em; padding: 0.3em 1em; }
          #tick { font-size: 2em; margin-top: 1em; color: #0f0; }
        </style>
      </head>
      <body>
        <h1>🎵 Orchestra Conductor</h1>
        <p>
          BPM: <input id="bpm" type="number" value="${bpm}">
          <button onclick="setBpm()">Set</button>
        </p>
        <p id="tick">Waiting for ticks...</p>

        <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
        <script>
          const socket = io();

          socket.on("tick", (msg) => {
            document.getElementById("tick").innerText =
              "Tick " + msg.count + " @ " + msg.bpm + " BPM";
          });

          function setBpm() {
            const newBpm = document.getElementById("bpm").value;
            socket.emit("setBpm", parseInt(newBpm));
          }
        </script>
      </body>
    </html>
  `);
});

// Ticking function
function startTicking() {
  if (interval) clearInterval(interval);
  let count = 0;
  const step = (60000 / bpm) * 4; // Once per bar (4 beats)
  interval = setInterval(() => {
    count++;
    io.emit("tick", { time: Date.now(), bpm, count });
  }, step);
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.emit("tick", { bpm, count: 0, time: Date.now() });

  socket.on("setBpm", (newBpm) => {
    bpm = newBpm;
    console.log("BPM set to", bpm);
    startTicking();
    io.emit("bpmChange", bpm);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

startTicking();

const PORT = process.env.PORT || 3000;
console.log('🎵 Starting Orchestra Conductor...');
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🎶 Orchestra Conductor running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
  console.log(`🎵 Server is ready for connections!`);
});