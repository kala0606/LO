const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let bpm = 120;
let interval = null;
let startTime = Date.now();
let isPlaying = false;

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
 you also          
          /* Visual Metronome Styles */
          #metronome { margin: 2em 0; }
          #beatIndicator { 
            display: flex; 
            justify-content: center; 
            gap: 20px; 
            margin: 2em 0; 
          }
          .beat-dot { 
            width: 60px; 
            height: 60px; 
            border-radius: 50%; 
            background: #333; 
            border: 2px solid #555;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.2em;
            transition: all 0.1s ease;
          }
          .beat-dot.active { 
            background: #0f0; 
            border-color: #0f0;
            color: #000;
            transform: scale(1.2);
            box-shadow: 0 0 20px #0f0;
            animation: pulse 0.1s ease-out;
          }
          .beat-dot.downbeat { 
            border-color: #f0f; 
          }
          .beat-dot.downbeat.active { 
            background: #f0f; 
            border-color: #f0f;
            box-shadow: 0 0 20px #f0f;
            animation: pulse-downbeat 0.2s ease-out;
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1.2); }
          }
          
          @keyframes pulse-downbeat {
            0% { transform: scale(1); }
            50% { transform: scale(1.4); }
            100% { transform: scale(1.2); }
          }
          
          #metronome h3 {
            color: #0f0;
            margin-bottom: 1em;
          }
          
          #transportInfo {
            background: #222;
            padding: 1em;
            border-radius: 10px;
            margin: 1em 0;
            display: inline-block;
          }
          
          .info-row {
            margin: 0.5em 0;
            font-size: 1.1em;
          }
        </style>
      </head>
      <body>
        <h1>🎵 Orchestra Conductor</h1>
        
        <div id="transportInfo">
          <div class="info-row">
            BPM: <input id="bpm" type="number" value="${bpm}">
            <button onclick="setBpm()">Set</button>
          </div>
          <div class="info-row" id="tick">Waiting for sync...</div>
        </div>
        
        <div id="metronome">
          <h3>Visual Metronome</h3>
          <div id="beatIndicator">
            <div class="beat-dot downbeat" id="beat1">1</div>
            <div class="beat-dot" id="beat2">2</div>
            <div class="beat-dot" id="beat3">3</div>
            <div class="beat-dot" id="beat4">4</div>
          </div>
          <div>
            <strong>Bar:</strong> <span id="barCount">1</span> | 
            <strong>Beat:</strong> <span id="beatCount">1</span> |
            <strong>Time:</strong> <span id="timeDisplay">0.000s</span>
          </div>
        </div>

        <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/tone@14.8.49/build/Tone.min.js"></script>
        <script>
          const socket = io();
          let isStarted = false;
          let lastBeat = -1;

          socket.on("sync", (msg) => {
            if (!isStarted) {
              initializeToneTransport(msg);
            } else {
              syncToneTransport(msg);
            }
            
            // Update transport info
            document.getElementById("tick").innerText = 
              "Time: " + msg.transportTime.toFixed(3) + "s @ " + msg.bpm + " BPM";
            
            // Update visual metronome
            updateVisualMetronome(msg.transportTime, msg.bpm);
          });

          function updateVisualMetronome(transportTime, bpm) {
            // Calculate current position in the music
            const beatsPerSecond = bpm / 60;
            const totalBeats = transportTime * beatsPerSecond;
            const currentBeat = Math.floor(totalBeats) % 4; // 0, 1, 2, 3
            const currentBar = Math.floor(totalBeats / 4) + 1;
            
            // Update display
            document.getElementById("barCount").textContent = currentBar;
            document.getElementById("beatCount").textContent = (currentBeat + 1);
            document.getElementById("timeDisplay").textContent = transportTime.toFixed(3) + "s";
            
            // Update visual beat indicators
            if (currentBeat !== lastBeat) {
              // Clear all active beats
              document.querySelectorAll('.beat-dot').forEach(dot => {
                dot.classList.remove('active');
              });
              
              // Highlight current beat
              const beatElement = document.getElementById('beat' + (currentBeat + 1));
              if (beatElement) {
                beatElement.classList.add('active');
                
                // Remove active class after pulse animation
                setTimeout(() => {
                  beatElement.classList.remove('active');
                }, currentBeat === 0 ? 200 : 100); // Downbeat lasts longer
              }
              
              lastBeat = currentBeat;
            }
          }

          async function initializeToneTransport(syncData) {
            await Tone.start();
            
            // Set BPM
            Tone.Transport.bpm.value = syncData.bpm;
            
            // Calculate the time offset
            const networkDelay = (Date.now() - syncData.serverTime) / 2;
            const transportTime = syncData.transportTime + (networkDelay / 1000);
            
            // Start transport at the correct time
            Tone.Transport.start("+0", transportTime);
            isStarted = true;
            
            console.log("🎵 Tone Transport synchronized!");
          }

          function syncToneTransport(syncData) {
            // Update BPM if changed
            if (Tone.Transport.bpm.value !== syncData.bpm) {
              Tone.Transport.bpm.value = syncData.bpm;
            }
            
            // Check sync drift and correct if needed
            const currentTime = Tone.Transport.seconds;
            const expectedTime = syncData.transportTime;
            const drift = Math.abs(currentTime - expectedTime);
            
            if (drift > 0.01) { // 10ms threshold
              console.log("🔄 Correcting sync drift:", drift.toFixed(3) + "s");
              Tone.Transport.seconds = expectedTime;
            }
          }

          function setBpm() {
            const newBpm = document.getElementById("bpm").value;
            socket.emit("setBpm", parseInt(newBpm));
          }
        </script>
      </body>
    </html>
  `);
});

// Tone.js Transport-based synchronization
function startTransportSync() {
  if (interval) clearInterval(interval);
  
  if (!isPlaying) {
    startTime = Date.now();
    isPlaying = true;
  }
  
  function sendSync() {
    const now = Date.now();
    const transportTime = (now - startTime) / 1000; // Convert to seconds
    
    // Calculate beat information
    const beatsPerSecond = bpm / 60;
    const totalBeats = transportTime * beatsPerSecond;
    const currentBeat = Math.floor(totalBeats) % 4; // 0, 1, 2, 3
    const currentBar = Math.floor(totalBeats / 4) + 1;
    const beatProgress = (totalBeats % 1); // 0.0 to 1.0 within current beat
    
    // Send sync data with beat information
    io.emit("sync", {
      serverTime: now,
      transportTime: transportTime,
      bpm: bpm,
      startTime: startTime,
      beat: {
        current: currentBeat + 1, // 1, 2, 3, 4 for display
        bar: currentBar,
        progress: beatProgress,
        totalBeats: Math.floor(totalBeats)
      }
    });
  }
  
  // Send sync every 100ms (much less frequent than ticks)
  interval = setInterval(sendSync, 100);
  
  // Send initial sync immediately
  sendSync();
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  
  // Send initial sync data
  const now = Date.now();
  const transportTime = isPlaying ? (now - startTime) / 1000 : 0;
  
  // Calculate initial beat information
  const beatsPerSecond = bpm / 60;
  const totalBeats = transportTime * beatsPerSecond;
  const currentBeat = Math.floor(totalBeats) % 4; // 0, 1, 2, 3
  const currentBar = Math.floor(totalBeats / 4) + 1;
  const beatProgress = (totalBeats % 1); // 0.0 to 1.0 within current beat
  
  socket.emit("sync", {
    serverTime: now,
    transportTime: transportTime,
    bpm: bpm,
    startTime: startTime,
    beat: {
      current: currentBeat + 1, // 1, 2, 3, 4 for display
      bar: currentBar,
      progress: beatProgress,
      totalBeats: Math.floor(totalBeats)
    }
  });

  socket.on("setBpm", (newBpm) => {
    bpm = newBpm;
    console.log("BPM set to", bpm);
    // No need to restart - just let sync messages update the BPM
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

startTransportSync();

const PORT = process.env.PORT || 3000;
console.log('🎵 Starting Orchestra Conductor...');
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🎶 Orchestra Conductor running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
  console.log(`🎵 Server is ready for connections!`);
});