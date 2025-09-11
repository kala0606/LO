const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let bpm = 120;
let interval = null;
let expectedTime = 0;
let tickCount = 0;

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

// Precise ticking function with drift correction
function startTicking() {
  if (interval) clearInterval(interval);
  tickCount = 0;
  expectedTime = Date.now();
  
  // Calculate tick interval in milliseconds
  // 4 ticks per beat = 16 ticks per bar (4 beats)
  const tickInterval = (60000 / bpm); // Quarter note timing
  
  function tick() {
    const now = Date.now();
    const drift = now - expectedTime;
    
    // Send tick with precise timing info
    io.emit("tick", { 
      time: now, 
      bpm, 
      count: tickCount,
      drift: drift,
      expectedTime: expectedTime
    });
    
    tickCount++;
    expectedTime += tickInterval;
    
    // Schedule next tick with drift correction
    const nextTick = Math.max(0, tickInterval - drift);
    interval = setTimeout(tick, nextTick);
  }
  
  // Start the first tick
  tick();
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