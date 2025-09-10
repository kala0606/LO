// STUDENT-FRIENDLY VERSION
// This explains the concepts step by step

let socket = null;
let bpm = 120;
let tickCount = 0;
let kickSynth = null;

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
      
      console.log(`🎶 Tick ${tickCount} at ${bpm} BPM`);
      
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
  
  // BASIC: Play kick drum on every tick
  kickSynth.triggerAttackRelease("C1", "8n");
  console.log('🥁 Kick played!');
  
  // STUDENT EXERCISES - Try uncommenting these one by one:
  
  // Exercise 1: Play kick only on even ticks (0, 2, 4, 6...)
  // if (tickCount % 2 === 0) {
  //   kickSynth.triggerAttackRelease("C1", "8n");
  // }
  
  // Exercise 2: Play kick only every 4 ticks (0, 4, 8, 12...)
  // if (tickCount % 4 === 0) {
  //   kickSynth.triggerAttackRelease("C1", "8n");
  // }
  
  // Exercise 3: Play different sounds based on tick number
  // if (tickCount % 4 === 0) {
  //   kickSynth.triggerAttackRelease("C1", "8n"); // Low kick
  // } else if (tickCount % 2 === 0) {
  //   kickSynth.triggerAttackRelease("C2", "8n"); // Higher kick
  // }
}