// Laptop Orchestra - Drums Application
// Main JavaScript file with Socket.IO integration

let socket = null;
let bpm = 120;
let tickCount = 0;
let isConnected = false;

// DOM elements
const startBtn = document.getElementById('startBtn');
const bpmDisplay = document.getElementById('bpm');
const ticksDisplay = document.getElementById('ticks');
const statusDisplay = document.getElementById('status');

// Start button event listener
startBtn.addEventListener('click', async () => {
  try {
    // Start Tone.js
    await Tone.start();
    console.log('Tone.js started');
    
    // Connect to server
    socket = io('https://lo-smi.fly.dev/');
    
    // Socket event listeners
    socket.on('connect', () => {
      isConnected = true;
      statusDisplay.textContent = 'Connected';
      startBtn.disabled = true;
      startBtn.textContent = 'Connected';
      console.log('Connected to server');
    });
    
    socket.on('disconnect', () => {
      isConnected = false;
      statusDisplay.textContent = 'Disconnected';
      startBtn.disabled = false;
      startBtn.textContent = 'Reconnect';
    });
    
    socket.on('tick', (data) => {
      bpm = data.bpm;
      tickCount = data.count;
      
      // Update display
      bpmDisplay.textContent = bpm;
      ticksDisplay.textContent = tickCount;
      
      // Your drum code goes here!
      // This runs every tick from the conductor
      handleTick(tickCount, bpm);
    });
    
  } catch (error) {
    console.error('Error:', error);
    statusDisplay.textContent = 'Error: ' + error.message;
  }
});

// Handle each tick from the conductor
function handleTick(tick, currentBpm) {
  console.log('Tick:', tick, 'BPM:', currentBpm);
  
  // Add your drum logic here
  // For example:
  // - Trigger drum sounds based on tick patterns
  // - Respond to tempo changes
  // - Create rhythmic patterns
}

// p5.js setup
function setup() {
  createCanvas(windowWidth, windowHeight);
  console.log('p5.js canvas created');
}

function draw() {
  background(20);
  
  // Visual feedback
  if (isConnected) {
    // Connected state - pulsing green circle
    fill(0, 255, 0, 150);
    let pulse = sin(frameCount * 0.1) * 20;
    circle(width/2, height/2, 50 + pulse);
    
    // Show BPM as text
    fill(255);
    textAlign(CENTER);
    textSize(24);
    text(`BPM: ${bpm}`, width/2, height/2 + 50);
    text(`Tick: ${tickCount}`, width/2, height/2 + 80);
  } else {
    // Disconnected state - static red circle
    fill(255, 0, 0, 150);
    circle(width/2, height/2, 30);
    
    fill(255);
    textAlign(CENTER);
    textSize(18);
    text('Not Connected', width/2, height/2 + 50);
  }
}

// Handle window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
