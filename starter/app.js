// STUDENT-FRIENDLY VERSION
// This explains the concepts step by step

let socket = null;
let bpm = 120;
let kickSynth = null;
let transportSynced = false;
let scheduledEvents = [];
let lastBeat = -1;

// Get DOM elements
const startBtn = document.getElementById('startBtn');
const statusEl = document.getElementById('status');
const bpmEl = document.getElementById('bpm');
const ticksEl = document.getElementById('ticks');

// STEP 1: What happens when you click "Start"
startBtn.addEventListener('click', async () => {
  try {
    // Start Tone.js (this lets us make sounds)
    await Tone.start();
    console.log('🎵 Tone.js started!');
    
    // Update status
    statusEl.textContent = 'Connecting...';
    
    // Connect to the conductor server
    socket = io('http://localhost:3000/');
    
    // Handle connection events
    socket.on('connect', () => {
      console.log('✅ Connected to conductor');
      statusEl.textContent = 'Connected';
      statusEl.style.color = '#0f0';
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Disconnected from conductor');
      statusEl.textContent = 'Disconnected';
      statusEl.style.color = '#f00';
      transportSynced = false;
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      statusEl.textContent = 'Connection Error';
      statusEl.style.color = '#f00';
    });
    
    // Listen for sync messages from the conductor
    socket.on('sync', (data) => {
      if (!transportSynced) {
        initializeTransport(data);
      } else {
        syncTransport(data);
      }
      
      // Update UI
      bpmEl.textContent = data.bpm;
      ticksEl.textContent = `Bar ${data.beat.bar}, Beat ${data.beat.current} (${data.transportTime.toFixed(3)}s)`;
      
      // Handle beat changes for musical triggers
      if (data.beat && data.beat.current !== lastBeat) {
        onBeatChange(data.beat);
        lastBeat = data.beat.current;
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    statusEl.textContent = 'Error: ' + error.message;
    statusEl.style.color = '#f00';
  }
});

// Initialize Tone.js Transport with server sync
function initializeTransport(syncData) {
  bpm = syncData.bpm;
  Tone.Transport.bpm.value = bpm;
  
  // Calculate network delay and sync transport time
  const networkDelay = (Date.now() - syncData.serverTime) / 2;
  const transportTime = syncData.transportTime + (networkDelay / 1000);
  
  // Start transport at the correct time
  Tone.Transport.start("+0", transportTime);
  transportSynced = true;
  
  // Update status to show sync success
  statusEl.textContent = 'Synchronized';
  statusEl.style.color = '#0a0';
  
  // Schedule your musical events using Tone.js Timeline
  scheduleMusic();
  
  console.log(`🎵 Transport synchronized! Time: ${transportTime.toFixed(3)}s @ ${bpm} BPM`);
}

// Sync transport with server updates
function syncTransport(syncData) {
  // Update BPM if changed
  if (Tone.Transport.bpm.value !== syncData.bpm) {
    bpm = syncData.bpm;
    Tone.Transport.bpm.value = bpm;
    console.log(`🎵 BPM updated to ${bpm}`);
  }
  
  // Check for drift and correct if necessary
  const currentTime = Tone.Transport.seconds;
  const expectedTime = syncData.transportTime;
  const drift = Math.abs(currentTime - expectedTime);
  
  if (drift > 0.01) { // 10ms threshold
    console.log(`🔄 Correcting drift: ${drift.toFixed(3)}s`);
    Tone.Transport.seconds = expectedTime;
  }
}

// STEP 2: Create a simple kick drum sound
function createKickDrum() {
  kickSynth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 10,
    oscillator: { type: "square" },
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0.01,
      release: 1.4
    }
  }).toDestination();
  
  console.log('🥁 Kick drum created!');
}

// STEP 3: Schedule music using Tone.js Timeline (much more precise!)
function scheduleMusic() {
  // Create kick drum if we haven't yet
  if (!kickSynth) {
    createKickDrum();
  }
  
  // Clear any existing scheduled events
  scheduledEvents.forEach(eventId => Tone.Transport.clear(eventId));
  scheduledEvents = [];
  
  // STUDENT EXERCISES - Now using precise Tone.js scheduling:
  
  // Exercise 1: Play kick on beat 1 of every bar (every "1m" = 1 measure)
  const kickEvent1 = Tone.Transport.scheduleRepeat((time) => {
    kickSynth.triggerAttackRelease("C1", "8n", time);
    console.log('🥁 Kick on beat 1! Time:', time.toFixed(3));
  }, "1m", "0"); // Every measure, starting at 0
  scheduledEvents.push(kickEvent1);
  
  // Exercise 2: Play kick on beats 1 and 3 (every "2n" = half note)
  const kickEvent2 = Tone.Transport.scheduleRepeat((time) => {
    kickSynth.triggerAttackRelease("C1", "8n", time);
    console.log('🥁 Kick on beat 1 or 3! Time:', time.toFixed(3));
  }, "4n", "0"); // Every half note
  scheduledEvents.push(kickEvent2);
  
  // Exercise 3: Play kick on every beat (every "4n" = quarter note)
  // const kickEvent3 = Tone.Transport.scheduleRepeat((time) => {
  //   kickSynth.triggerAttackRelease("C1", "8n", time);
  //   console.log('🥁 Kick on every beat! Time:', time.toFixed(3));
  // }, "4n", "0"); // Every quarter note
  // scheduledEvents.push(kickEvent3);
  
  // Exercise 4: Play kick on every 16th note
  // const kickEvent4 = Tone.Transport.scheduleRepeat((time) => {
  //   kickSynth.triggerAttackRelease("C1", "8n", time);
  //   console.log('🥁 Kick on 16th note! Time:', time.toFixed(3));
  // }, "16n", "0"); // Every 16th note
  // scheduledEvents.push(kickEvent4);
  
  // Exercise 5: Create a complex drum pattern
  // const kickPattern = Tone.Transport.scheduleRepeat((time) => {
  //   kickSynth.triggerAttackRelease("C1", "8n", time); // Kick
  // }, "1m", "0"); // Beat 1
  // 
  // const snarePattern = Tone.Transport.scheduleRepeat((time) => {
  //   kickSynth.triggerAttackRelease("C2", "8n", time); // Snare
  // }, "1m", "2n"); // Beat 3 (half note offset)
  // 
  // const hihatPattern = Tone.Transport.scheduleRepeat((time) => {
  //   kickSynth.triggerAttackRelease("C3", "32n", time); // Hi-hat
  // }, "8n", "0"); // Every 8th note
  // 
  // scheduledEvents.push(kickPattern, snarePattern, hihatPattern);
  
  console.log('🎵 Music scheduled using Tone.js Timeline!');
}

// STEP 4: Handle beat changes from server (for UI updates only, not audio)
function onBeatChange(beatInfo) {
  // Just log for debugging - don't trigger audio here (use Timeline instead)
  console.log(`🎶 Beat ${beatInfo.current} | Bar ${beatInfo.bar} | Total: ${beatInfo.totalBeats}`);
  
  // NOTE: Audio should be triggered by Tone.js Timeline in scheduleMusic()
  // for precise timing, not by these server messages which have network latency
}