// STUDENT-FRIENDLY VERSION
// This explains the concepts step by step

let socket = null;
let bpm = 120;
let tickCount = 0;
let kickSynth = null;
let lastTickTime = 0;
let timingStats = { min: Infinity, max: -Infinity, avg: 0, count: 0 };

// STEP 1: What happens when you click "Start"
startBtn.addEventListener('click', async () => {
  try {
    // Start Tone.js (this lets us make sounds)
    await Tone.start();
    console.log('🎵 Tone.js started!');
    
    // Connect to the conductor server
    socket = io('http://localhost:3000/');
    
    // Listen for ticks from the conductor
    socket.on('tick', (data) => {
      bpm = data.bpm;        // How fast the music is
      tickCount = data.count; // Which beat we're on
      
      // Analyze timing precision
      if (lastTickTime > 0) {
        const interval = data.time - lastTickTime;
        const expectedInterval = (60000 / bpm) / 4; // Quarter note timing
        const drift = interval - expectedInterval;
        
        // Update timing stats
        timingStats.min = Math.min(timingStats.min, drift);
        timingStats.max = Math.max(timingStats.max, drift);
        timingStats.count++;
        timingStats.avg = (timingStats.avg * (timingStats.count - 1) + drift) / timingStats.count;
        
        // Log timing info (only every 16th tick to avoid spam)
        if (tickCount % 16 === 0) {
          console.log(`🎶 Tick ${tickCount} | Drift: ${drift.toFixed(1)}ms | Avg: ${timingStats.avg.toFixed(1)}ms`);
        }
      }
      
      lastTickTime = data.time;
      
      // This is where YOU add your music!
      playYourMusic();
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
});

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

// STEP 3: This function runs every time you get a tick
function playYourMusic() {
  // Create kick drum if we haven't yet
  if (!kickSynth) {
    createKickDrum();
  }
  
  // BASIC: Play kick drum on every tick (now 16 ticks per bar!)
  // kickSynth.triggerAttackRelease("C1", "8n");
  // console.log('🥁 Kick played!');
  
  // STUDENT EXERCISES - Now with 16 ticks per bar:
  
  // Exercise 1: Play kick on beat 1 of every bar (tick 0, 16, 32...)
  if (tickCount % 16 === 0) {
    kickSynth.triggerAttackRelease("C1", "8n");
    console.log('🥁 Kick on beat 1!');
  }
  
  // Exercise 2: Play kick on beats 1 and 3 (tick 0, 8, 16, 24...)
  // if (tickCount % 8 === 0) {
  //   kickSynth.triggerAttackRelease("C1", "8n");
  //   console.log('🥁 Kick on beat 1 or 3!');
  // }
  
  // Exercise 3: Play kick on every beat (tick 0, 4, 8, 12...)
  // if (tickCount % 4 === 0) {
  //   kickSynth.triggerAttackRelease("C1", "8n");
  //   console.log('🥁 Kick on every beat!');
  // }
  
  // Exercise 4: Play kick on every quarter note (tick 0, 1, 2, 3...)
  // kickSynth.triggerAttackRelease("C1", "8n");
  // console.log('🥁 Kick on every quarter note!');
  
  // Exercise 5: Create a drum pattern
  // if (tickCount % 16 === 0) {
  //   kickSynth.triggerAttackRelease("C1", "8n"); // Kick on beat 1
  // } else if (tickCount % 8 === 0) {
  //   kickSynth.triggerAttackRelease("C2", "8n"); // Snare on beat 3
  // } else if (tickCount % 4 === 0) {
  //   kickSynth.triggerAttackRelease("C3", "8n"); // Hi-hat on every beat
  // }
}