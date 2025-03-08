// Global audio variables
let audioCtx = null;
let masterGain = null;
let meterUpdateIntervalId = null;
let statusElement = document.getElementById('statusDisplay');
let channelLevels = [0, 0, 0, 0];
let currentSoundParameters = null;
let currentThemeSongParameters = null;
let activeNodes = [];
let currentlyPlayingMusic = false;
let currentMusicSequence = null;
let musicSchedulerId = null;

// Global variables for sound history
let soundHistory = [];
let recordedBlobs = {};

// UI Elements - Sound Effects
const generateButton = document.getElementById('generateButton');
const soundDescription = document.getElementById('soundDescription');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultPanel = document.getElementById('resultPanel');
const parametersOutput = document.getElementById('parametersOutput');
const parametersToggle = document.getElementById('parametersToggle');
const parametersHeader = document.getElementById('parametersHeader');
const exampleEffects = document.querySelectorAll('.example-effect');

// UI Elements - Theme Songs
const generateMusicButton = document.getElementById('generateMusicButton');
const musicDescription = document.getElementById('musicDescription');
const musicLoadingIndicator = document.getElementById('musicLoadingIndicator');
const musicResultPanel = document.getElementById('musicResultPanel');
const musicParametersOutput = document.getElementById('musicParametersOutput');
const musicParametersToggle = document.getElementById('musicParametersToggle');
const musicParametersHeader = document.getElementById('musicParametersHeader');
const exampleMusic = document.querySelectorAll('.example-music');
const musicTitle = document.getElementById('musicTitle');
const musicTempo = document.getElementById('musicTempo');

// Tab elements
const soundEffectTab = document.getElementById('soundEffectTab');
const themeSongTab = document.getElementById('themeSongTab');
const soundEffectPanel = document.getElementById('soundEffectPanel');
const themeSongPanel = document.getElementById('themeSongPanel');

// Channel meters
const meters = [
    document.getElementById('meter1'),
    document.getElementById('meter2'),
    document.getElementById('meter3'),
    document.getElementById('meter4')
];

// Note to frequency mapping
const noteToFreq = {
    'C0': 16.35, 'C#0': 17.32, 'Db0': 17.32, 'D0': 18.35, 'D#0': 19.45, 'Eb0': 19.45, 'E0': 20.60, 'F0': 21.83, 
    'F#0': 23.12, 'Gb0': 23.12, 'G0': 24.50, 'G#0': 25.96, 'Ab0': 25.96, 'A0': 27.50, 'A#0': 29.14, 'Bb0': 29.14, 'B0': 30.87,
    'C1': 32.70, 'C#1': 34.65, 'Db1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'Eb1': 38.89, 'E1': 41.20, 'F1': 43.65, 
    'F#1': 46.25, 'Gb1': 46.25, 'G1': 49.00, 'G#1': 51.91, 'Ab1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'Bb1': 58.27, 'B1': 61.74,
    'C2': 65.41, 'C#2': 69.30, 'Db2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31, 
    'F#2': 92.50, 'Gb2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'Ab2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'Bb2': 116.54, 'B2': 123.47,
    'C3': 130.81, 'C#3': 138.59, 'Db3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 
    'F#3': 185.00, 'Gb3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'Ab3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'Bb3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 
    'F#4': 369.99, 'Gb4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'Bb4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'Db5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 
    'F#5': 739.99, 'Gb5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'Ab5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'Bb5': 932.33, 'B5': 987.77,
    'C6': 1046.50, 'C#6': 1108.73, 'Db6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'Eb6': 1244.51, 'E6': 1318.51, 'F6': 1396.91, 
    'F#6': 1479.98, 'Gb6': 1479.98, 'G6': 1567.98, 'G#6': 1661.22, 'Ab6': 1661.22, 'A6': 1760.00, 'A#6': 1864.66, 'Bb6': 1864.66, 'B6': 1975.53,
    'C7': 2093.00, 'C#7': 2217.46, 'Db7': 2217.46, 'D7': 2349.32, 'D#7': 2489.02, 'Eb7': 2489.02, 'E7': 2637.02, 'F7': 2793.83, 
    'F#7': 2959.96, 'Gb7': 2959.96, 'G7': 3135.96, 'G#7': 3322.44, 'Ab7': 3322.44, 'A7': 3520.00, 'A#7': 3729.31, 'Bb7': 3729.31, 'B7': 3951.07,
    'C8': 4186.01,
    'rest': 0 // Silent note
};

// Tab switching
soundEffectTab.addEventListener('click', () => {
    soundEffectTab.classList.add('active');
    themeSongTab.classList.remove('active');
    soundEffectPanel.style.display = 'block';
    themeSongPanel.style.display = 'none';
});

themeSongTab.addEventListener('click', () => {
    themeSongTab.classList.add('active');
    soundEffectTab.classList.remove('active');
    themeSongPanel.style.display = 'block';
    soundEffectPanel.style.display = 'none';
});

// Initialize the sound engine
function initAudio() {
    if (audioCtx) return;
    
    try {
        // Create audio context
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master gain node
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.5;
        masterGain.connect(audioCtx.destination);
        
        // Start meter updates
        if (meterUpdateIntervalId) clearInterval(meterUpdateIntervalId);
        meterUpdateIntervalId = setInterval(updateMeters, 50);
        
        // Resume audio context if it's suspended
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(err => {
                updateStatus('Failed to resume audio context: ' + err.message);
            });
        }
    } catch (err) {
        updateStatus('Failed to initialize audio: ' + err.message);
        console.error('Audio initialization error:', err);
    }
}

// Update status display
function updateStatus(message) {
    if (statusElement) {
        statusElement.textContent = message;
        console.log('Status:', message);
    }
}

// Update visual meters
function updateMeters() {
    for (let i = 0; i < 4; i++) {
        // Apply decay
        channelLevels[i] = Math.max(0, channelLevels[i] - 0.05);
        meters[i].style.width = (channelLevels[i] * 100) + '%';
    }
}

// Set channel activity level
function setChannelLevel(channel, level) {
    if (channel >= 0 && channel < 4) {
        channelLevels[channel] = Math.min(1, level);
    }
}

// Event listeners - Sound Effects
generateButton.addEventListener('click', generateSoundEffect);
parametersHeader.addEventListener('click', () => {
    parametersOutput.style.display = parametersOutput.style.display === 'none' ? 'block' : 'none';
    parametersToggle.textContent = parametersOutput.style.display === 'none' ? 'Show' : 'Hide';
});

// Event listeners - Theme Songs
generateMusicButton.addEventListener('click', generateThemeSong);
musicParametersHeader.addEventListener('click', () => {
    musicParametersOutput.style.display = musicParametersOutput.style.display === 'none' ? 'block' : 'none';
    musicParametersToggle.textContent = musicParametersOutput.style.display === 'none' ? 'Show' : 'Hide';
});

// Example effect listeners
exampleEffects.forEach(example => {
    example.addEventListener('click', () => {
        const desc = example.getAttribute('data-desc');
        soundDescription.value = desc;
        generateSoundEffect();
    });
});

// Example music listeners
exampleMusic.forEach(example => {
    example.addEventListener('click', () => {
        const desc = example.getAttribute('data-desc');
        musicDescription.value = desc;
        generateThemeSong();
    });
});

// Generate sound effect
async function generateSoundEffect() {
    const description = soundDescription.value.trim();
    const modelSelect = document.getElementById('modelSelect');
    const selectedModel = modelSelect.value;
    
    if (!description) {
        updateStatus('Please enter a sound effect description');
        return;
    }
    
    // Show loading state
    generateButton.disabled = true;
    loadingIndicator.style.display = 'block';
    resultPanel.style.display = 'none';
    updateStatus('Generating sound effect parameters...');
    
    try {
        const apiUrl = '/api/generate-sound';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                description,
                mode: 'effect',
                model: selectedModel 
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        
        // Display the results
        parametersOutput.textContent = JSON.stringify(result.parameters, null, 2);
        
        // Store parameters for playback
        currentSoundParameters = result.parameters;
        
        // Show results
        loadingIndicator.style.display = 'none';
        resultPanel.style.display = 'block';
        updateStatus('Sound effect generated successfully!');
        
        // Initialize audio engine for playback
        initAudio();
        
        // Auto-play the sound
        playGeneratedSound();
        
        // Auto-save the sound
        saveSoundEffect();
    } catch (error) {
        updateStatus('Error: ' + error.message);
        console.error('Generation error:', error);
        loadingIndicator.style.display = 'none';
    } finally {
        generateButton.disabled = false;
    }
}

// Generate theme song
async function generateThemeSong() {
    const description = musicDescription.value.trim();
    const modelSelect = document.getElementById('musicModelSelect');
    const selectedModel = modelSelect.value;
    
    if (!description) {
        updateStatus('Please enter a theme song description');
        return;
    }
    
    // Show loading state
    generateMusicButton.disabled = true;
    musicLoadingIndicator.style.display = 'block';
    musicResultPanel.style.display = 'none';
    updateStatus('Composing theme song...');
    
    try {
        const apiUrl = '/api/generate-sound';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                description,
                mode: 'theme',
                model: selectedModel 
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        
        // Display the raw response for debugging
        console.log("Raw API response:", result);
        
        // Check if we have valid parameters
        if (!result.parameters) {
            throw new Error("No parameters received from API");
        }
        
        // Display the results with proper formatting
        const formattedJSON = JSON.stringify(result.parameters, null, 2);
        musicParametersOutput.textContent = formattedJSON;
        
        // Apply syntax highlighting and make it more readable
        musicParametersOutput.style.whiteSpace = "pre";
        musicParametersOutput.style.fontFamily = "monospace";
        
        // Validate the theme song parameters before storing
        if (!result.parameters.sections && !result.parameters.tracks) {
            throw new Error("Invalid theme song format: missing sections or tracks");
        }
        
        // Store parameters for playback
        currentThemeSongParameters = result.parameters;
        
        // Update UI with theme song info
        if (result.parameters && result.parameters.title) {
            musicTitle.textContent = result.parameters.title;
        } else {
            musicTitle.textContent = description;
        }
        
        if (result.parameters && result.parameters.tempo) {
            musicTempo.textContent = `${result.parameters.tempo} BPM`;
        } else {
            musicTempo.textContent = '120 BPM';
        }
        
        // Show results
        musicLoadingIndicator.style.display = 'none';
        musicResultPanel.style.display = 'block';
        updateStatus('Theme song composed successfully!');
        
        // Initialize audio engine for playback
        initAudio();
        
        // Auto-save the theme song
        saveThemeSong();

        // Reset channel meters to ensure clean visualization
        for (let i = 0; i < 4; i++) {
            channelLevels[i] = 0;
        }
        
        // Auto-play the theme song
        playThemeSong();
    } catch (error) {
        updateStatus('Error: ' + error.message);
        console.error('Theme generation error:', error);
        musicLoadingIndicator.style.display = 'none';
    } finally {
        generateMusicButton.disabled = false;
    }
}

function resetPlaybackProgress() {
    // Reset all progress bars in the sound history
    const progressBars = document.querySelectorAll('.sound-progress-fill');
    progressBars.forEach(bar => {
        bar.style.width = '0%';
    });
    
    // Remove any "Now Playing" indicators
    const playingIndicators = document.querySelectorAll('.now-playing');
    playingIndicators.forEach(indicator => {
        indicator.remove();
    });
    
    // Reset position displays
    const positionDisplays = document.querySelectorAll('[id^="position-"]');
    positionDisplays.forEach(display => {
        display.textContent = '0:00';
    });
}

// Create a square wave oscillator (for NES Square/Pulse channels)
function createSquareOscillator(options = {}) {
    if (!audioCtx) return null;
    
    const defaults = {
        frequency: 440,
        dutyCycle: 0.5,
        startTime: audioCtx.currentTime,
        stopTime: audioCtx.currentTime + 0.5,
        volume: 0.5
    };
    
    const opts = {...defaults, ...options};
    
    try {
        // Create oscillator
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.value = opts.frequency;
        
        // Create gain node for volume
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0; // Start silent
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        
        // Schedule start
        oscillator.start(opts.startTime);
        
        // Apply envelope
        const envelope = {
            attack: opts.attack || 0.01,
            decay: opts.decay || 0.1,
            sustain: opts.sustain || 0.7,
            release: opts.release || 0.1
        };
        
        // Calculate timings
        const attackEndTime = opts.startTime + envelope.attack;
        const decayEndTime = attackEndTime + envelope.decay;
        const releaseStartTime = opts.stopTime - envelope.release;
        
        // Schedule volume changes for ADSR envelope
        gainNode.gain.setValueAtTime(0, opts.startTime);
        gainNode.gain.linearRampToValueAtTime(opts.volume, attackEndTime);
        gainNode.gain.linearRampToValueAtTime(opts.volume * envelope.sustain, decayEndTime);
        gainNode.gain.setValueAtTime(opts.volume * envelope.sustain, releaseStartTime);
        gainNode.gain.linearRampToValueAtTime(0, opts.stopTime);
        
        // Schedule frequency sweep if needed
        if (opts.sweep) {
            oscillator.frequency.setValueAtTime(opts.frequency, opts.startTime);
            oscillator.frequency.linearRampToValueAtTime(
                opts.sweep.endFrequency,
                opts.startTime + (opts.sweep.duration || (opts.stopTime - opts.startTime))
            );
        }
        
        // Schedule stop
        oscillator.stop(opts.stopTime + 0.1); // Small buffer after release
        
        return {
            oscillator: oscillator,
            gain: gainNode,
            stop: function(time) {
                const now = time || audioCtx.currentTime;
                try {
                    gainNode.gain.cancelScheduledValues(now);
                    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                    gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
                    oscillator.stop(now + 0.1);
                } catch (e) {
                    console.error('Error stopping oscillator:', e);
                }
            }
        };
    } catch (err) {
        console.error('Error creating square oscillator:', err);
        return null;
    }
}

// Create a triangle wave oscillator (for NES Triangle channel)
function createTriangleOscillator(options = {}) {
    if (!audioCtx) return null;
    
    const defaults = {
        frequency: 220,
        startTime: audioCtx.currentTime,
        stopTime: audioCtx.currentTime + 0.5,
        volume: 0.5
    };
    
    const opts = {...defaults, ...options};
    
    try {
        // Create oscillator
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'triangle';
        oscillator.frequency.value = opts.frequency;
        
        // Create gain node for volume
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0; // Start silent
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        
        // Schedule start
        oscillator.start(opts.startTime);
        
        // Apply envelope
        const envelope = {
            attack: opts.attack || 0.01,
            decay: opts.decay || 0.1,
            sustain: opts.sustain || 0.8,
            release: opts.release || 0.1
        };
        
        // Calculate timings
        const attackEndTime = opts.startTime + envelope.attack;
        const decayEndTime = attackEndTime + envelope.decay;
        const releaseStartTime = opts.stopTime - envelope.release;
        
        // Schedule volume changes for ADSR envelope
        gainNode.gain.setValueAtTime(0, opts.startTime);
        gainNode.gain.linearRampToValueAtTime(opts.volume, attackEndTime);
        gainNode.gain.linearRampToValueAtTime(opts.volume * envelope.sustain, decayEndTime);
        gainNode.gain.setValueAtTime(opts.volume * envelope.sustain, releaseStartTime);
        gainNode.gain.linearRampToValueAtTime(0, opts.stopTime);
        
        // Schedule frequency sweep if needed
        if (opts.sweep) {
            oscillator.frequency.setValueAtTime(opts.frequency, opts.startTime);
            oscillator.frequency.linearRampToValueAtTime(
                opts.sweep.endFrequency,
                opts.startTime + (opts.sweep.duration || (opts.stopTime - opts.startTime))
            );
        }
        
        // Schedule stop
        oscillator.stop(opts.stopTime + 0.1); // Small buffer after release
        
        return {
            oscillator: oscillator,
            gain: gainNode,
            stop: function(time) {
                const now = time || audioCtx.currentTime;
                try {
                    gainNode.gain.cancelScheduledValues(now);
                    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                    gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
                    oscillator.stop(now + 0.1);
                } catch (e) {
                    console.error('Error stopping oscillator:', e);
                }
            }
        };
    } catch (err) {
        console.error('Error creating triangle oscillator:', err);
        return null;
    }
}

// Create a noise generator (for NES Noise channel)
function createNoiseGenerator(options = {}) {
    if (!audioCtx) return null;
    
    const defaults = {
        frequency: 500, // Controls filter frequency for noise tone
        startTime: audioCtx.currentTime,
        stopTime: audioCtx.currentTime + 0.5,
        volume: 0.5,
        metallic: false // NES had "metallic" and regular noise modes
    };
    
    const opts = {...defaults, ...options};
    
    try {
        // Create buffer for noise
        const bufferSize = audioCtx.sampleRate;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const outputData = noiseBuffer.getChannelData(0);
        
        // Fill buffer with noise
        if (opts.metallic) {
            // "Metallic" noise has a more regular pattern
            let shiftRegister = 1;
            for (let i = 0; i < bufferSize; i++) {
                // Simulate hardware shift register
                const bit0 = shiftRegister & 1;
                const bit1 = (shiftRegister >> 1) & 1;
                const newBit = bit0 ^ bit1;
                shiftRegister = (shiftRegister >> 1) | (newBit << 14);
                outputData[i] = (shiftRegister & 1) * 2 - 1;
            }
        } else {
            // Regular random noise
            for (let i = 0; i < bufferSize; i++) {
                outputData[i] = Math.random() * 2 - 1;
            }
        }
        
        // Create source from buffer
        const noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        
        // Create filter to shape noise and give it "tone"
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = opts.frequency;
        filter.Q.value = 1.0;
        
        // Create gain node for volume
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0; // Start silent
        
        // Connect nodes
        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(masterGain);
        
        // Schedule start
        noiseSource.start(opts.startTime);
        
        // Apply envelope
        const envelope = {
            attack: opts.attack || 0.01,
            decay: opts.decay || 0.1,
            sustain: opts.sustain || 0.5,
            release: opts.release || 0.1
        };
        
        // Calculate timings
        const attackEndTime = opts.startTime + envelope.attack;
        const decayEndTime = attackEndTime + envelope.decay;
        const releaseStartTime = opts.stopTime - envelope.release;
        
        // Schedule volume changes for ADSR envelope
        gainNode.gain.setValueAtTime(0, opts.startTime);
        gainNode.gain.linearRampToValueAtTime(opts.volume, attackEndTime);
        gainNode.gain.linearRampToValueAtTime(opts.volume * envelope.sustain, decayEndTime);
        gainNode.gain.setValueAtTime(opts.volume * envelope.sustain, releaseStartTime);
        gainNode.gain.linearRampToValueAtTime(0, opts.stopTime);
        
        // Schedule stop
        noiseSource.stop(opts.stopTime + 0.1); // Small buffer after release
        
        return {
            source: noiseSource,
            filter: filter,
            gain: gainNode,
            stop: function(time) {
                const now = time || audioCtx.currentTime;
                try {
                    gainNode.gain.cancelScheduledValues(now);
                    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                    gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
                    noiseSource.stop(now + 0.1);
                } catch (e) {
                    console.error('Error stopping noise generator:', e);
                }
            }
        };
    } catch (err) {
        console.error('Error creating noise generator:', err);
        return null;
    }
}

// Stop all active sound nodes
function stopAllSounds() {
    if (!audioCtx) return;
    
    const now = audioCtx.currentTime;
    
    // Stop all active nodes
    for (const node of activeNodes) {
        if (node && typeof node.stop === 'function') {
            try {
                node.stop(now);
            } catch (err) {
                console.error('Error stopping node:', err);
            }
        }
    }
    
    // Clear the active nodes array
    activeNodes = [];
    
    // Reset channel meters
    for (let i = 0; i < 4; i++) {
        channelLevels[i] = 0;
    }
    
    // Stop any scheduled music
    if (musicSchedulerId) {
        clearTimeout(musicSchedulerId);
        musicSchedulerId = null;
    }
    
    currentlyPlayingMusic = false;

    // Stop any currently playing sound elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    
    // Reset playback progress in the UI
    resetPlaybackProgress();
}

// Play the generated sound
function playGeneratedSound() {
    if (!currentSoundParameters || !currentSoundParameters.length) {
        updateStatus('No sound parameters available');
        return;
    }
    
    if (!audioCtx) {
        initAudio();
    }
    
    // Resume audio context if suspended
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            playGeneratedSound();
        }).catch(err => {
            updateStatus('Failed to resume audio: ' + err.message);
        });
        return;
    }
    
    // Stop any currently playing sounds
    stopAllSounds();
    
    // Play segments sequentially
    playNextSegment(0);
}

// Recursive function to play segments one after another
function playNextSegment(segmentIndex) {
    if (segmentIndex >= currentSoundParameters.length) {
        updateStatus('');
        return;
    }
    
    const segment = currentSoundParameters[segmentIndex];
    const now = audioCtx.currentTime;
    let segmentDuration = segment.duration || 0;
    
    // Get segment name for status display
    const segmentName = segment.name || `Part ${segmentIndex + 1}`;
    updateStatus(`Playing sound effect: ${segmentName}...`);
    
    // Create and play each channel in this segment
    segment.channels.forEach(params => {
        let node = null;
        
        // Common parameters
        const options = {
            frequency: params.frequency || 440,
            startTime: now,
            stopTime: now + (params.duration || 0.5),
            volume: params.volume || 0.5,
            attack: params.attack || 0.01,
            decay: params.decay || 0.1,
            sustain: params.sustain || 0.7,
            release: params.release || 0.1
        };
        
        // Update segment duration if any channel has longer duration
        if (params.duration && params.duration > segmentDuration) {
            segmentDuration = params.duration;
        }
        
        // Add sweep if present
        if (params.sweep) {
            options.sweep = {
                endFrequency: params.sweep.endFrequency,
                duration: params.sweep.duration
            };
        }
        
        // Create appropriate node based on type
        switch (params.type) {
            case 'square1':
                options.duty = params.duty || 0.5;
                node = createSquareOscillator(options);
                setChannelLevel(0, options.volume);
                break;
            case 'square2':
                options.duty = params.duty || 0.5;
                node = createSquareOscillator(options);
                setChannelLevel(1, options.volume);
                break;
            case 'triangle':
                node = createTriangleOscillator(options);
                setChannelLevel(2, options.volume);
                break;
            case 'noise':
                options.metallic = params.metallic || false;
                node = createNoiseGenerator(options);
                setChannelLevel(3, options.volume);
                break;
        }
        
        // Add node to active nodes if created successfully
        if (node) {
            activeNodes.push(node);
        }
    });
    
    // Schedule the next segment to play after this one finishes
    setTimeout(() => {
        playNextSegment(segmentIndex + 1);
    }, segmentDuration * 1000 + 50); // Small buffer between segments
}

// Play a single note for the theme song
function playMusicalNote(note, channel, startTime) {
    if (!audioCtx) return null;
    
    // Check for rest notes in multiple formats
    if (note.note === 'rest' || note.note === 'Rest' || note.note === 'REST' || note.note === 'R') {
        console.log("Skipping rest note at time", startTime);
        return null;
    }
    
    // Convert note name to frequency
    const frequency = noteToFreq[note.note] || 0;
    // Handle unknown notes or rests (frequency 0)
    if (frequency === 0) {
        console.log(`Skipping note with frequency 0: "${note.note}" at time ${startTime}`);
        return null;
    }
    
    // Calculate stop time based on tempo and note duration
    const tempo = currentThemeSongParameters.tempo || 120;
    const secondsPerBeat = 60 / tempo;
    const noteDuration = note.duration * secondsPerBeat;
    const stopTime = startTime + noteDuration;
    
    // Common parameters
    const options = {
        frequency: frequency,
        startTime: startTime,
        stopTime: stopTime,
        volume: note.volume || 0.5,
        attack: note.attack || 0.01,
        decay: note.decay || 0.1,
        sustain: note.sustain || 0.7,
        release: note.release || 0.1
    };
    
    let node = null;
    
    // Create appropriate node based on channel type
    switch (channel) {
        case 'square1':
            options.duty = note.duty || 0.5;
            node = createSquareOscillator(options);
            setChannelLevel(0, options.volume);
            break;
        case 'square2':
            options.duty = note.duty || 0.5;
            node = createSquareOscillator(options);
            setChannelLevel(1, options.volume);
            break;
        case 'triangle':
            node = createTriangleOscillator(options);
            setChannelLevel(2, options.volume);
            break;
        case 'noise':
            options.metallic = note.metallic || false;
            options.frequency = frequency; // Use this to control noise "tone"
            node = createNoiseGenerator(options);
            setChannelLevel(3, options.volume);
            break;
    }
    
    // Add node to active nodes if created successfully
    if (node) {
        activeNodes.push(node);
    }
    
    return {
        node,
        stopTime,
        noteDuration
    };
}

// Start playing the theme song using section buffers
async function playThemeSong() {
    if (!currentThemeSongParameters || !currentThemeSongParameters.sections) {
        updateStatus('No theme song parameters available');
        return;
    }
    
    if (!audioCtx) {
        initAudio();
    }
    
    // Resume audio context if suspended
    if (audioCtx.state === 'suspended') {
        try {
            await audioCtx.resume();
        } catch (err) {
            updateStatus('Failed to resume audio: ' + err.message);
            return;
        }
    }
    
    // Stop any currently playing sounds
    stopAllSounds();
    
    currentlyPlayingMusic = true;
    updateStatus('Preparing theme song for playback...');
    
    try {
        const tempo = currentThemeSongParameters.tempo || 120;
        const timeSignature = currentThemeSongParameters.timeSignature || "4/4";
        const songTitle = currentThemeSongParameters.title || "Theme Song";
        
        // Render each section to a buffer (similar to saving)
        const sectionBuffers = [];
        
        // Process each section one-by-one
        for (let i = 0; i < currentThemeSongParameters.sections.length; i++) {
            const section = currentThemeSongParameters.sections[i];
            const sectionName = section.name || `Section ${i+1}`;
            
            updateStatus(`Preparing section ${i+1}/${currentThemeSongParameters.sections.length}: ${sectionName}`);
            
            // Render this section to its own buffer
            const sectionBuffer = await renderSectionToBuffer(
                section, 
                tempo, 
                timeSignature,
                audioCtx.sampleRate
            );
            
            // Add to our collection
            sectionBuffers.push(sectionBuffer);
        }
        
        updateStatus('All sections prepared, starting playback...');
        
        // Create a combined buffer for seamless playback
        console.log("Concatenating all section buffers for seamless playback...");
        const combinedBuffer = concatenateAudioBuffers(sectionBuffers, audioCtx);
        console.log(`Created combined buffer: ${combinedBuffer.duration.toFixed(3)}s, ${combinedBuffer.length} samples`);
        
        // Create a single source for the entire theme
        const source = audioCtx.createBufferSource();
        source.buffer = combinedBuffer;
        
        // Connect to master gain
        source.connect(masterGain);
        
        // Schedule playback with a small delay for clean start
        const startTime = audioCtx.currentTime + 0.1;
        source.start(startTime);
        console.log(`Scheduled combined theme song playback at time ${startTime}`);
        
        // Record source for cleanup
        activeNodes.push({
            stop: function(time) {
                try {
                    source.stop(time);
                } catch (e) {
                    console.error('Error stopping buffer source:', e);
                }
            }
        });
        
        // Schedule section status updates
        let sectionStartTime = startTime;
        sectionBuffers.forEach((buffer, index) => {
            const section = currentThemeSongParameters.sections[index];
            const sectionName = section.name || `Section ${index+1}`;
            
            // Schedule status update when this section starts
            setTimeout(() => {
                if (currentlyPlayingMusic) {
                    updateStatus(`Playing theme song: ${sectionName}...`);
                }
            }, (sectionStartTime - audioCtx.currentTime) * 1000);
            
            // Move start time forward for next section update
            sectionStartTime += buffer.duration;
        });
        
        // When the entire song is done
        setTimeout(() => {
            if (currentlyPlayingMusic) {
                updateStatus('Theme song completed');
                currentlyPlayingMusic = false;
            }
        }, (startTime - audioCtx.currentTime) * 1000);
        
    } catch (err) {
        console.error('Error playing theme song:', err);
        updateStatus('Error playing theme song: ' + err.message);
        currentlyPlayingMusic = false;
    }
}

// Prepare the complete music sequence with all sections combined
function prepareFullMusicSequence() {
    if (!currentThemeSongParameters || !currentThemeSongParameters.sections) return;
    
    const tempo = currentThemeSongParameters.tempo || 120;
    const secondsPerBeat = 60 / tempo;
    const timeSignature = currentThemeSongParameters.timeSignature || "4/4";
    const beatsPerMeasure = parseInt(timeSignature.split('/')[0]) || 4;
    
    // Initialize the full music sequence
    currentMusicSequence = [];
    
    // First, create a flat, unified song structure by combining all sections
    // This is a completely new approach to avoid gaps between sections
    const unifiedSong = {
        title: currentThemeSongParameters.title,
        tempo: currentThemeSongParameters.tempo,
        timeSignature: currentThemeSongParameters.timeSignature,
        tracks: {}  // Will hold merged tracks from all sections
    };
    
    // Track the current beat position for each section
    let currentBeatPosition = 0;
    
    // Get total number of measures/beats across all sections
    let totalBeats = 0;
    currentThemeSongParameters.sections.forEach(section => {
        if (section.measures && section.measures > 0) {
            totalBeats += section.measures * beatsPerMeasure;
        } else {
            let sectionBeats = 0;
            if (section.tracks) {
                section.tracks.forEach(track => {
                    if (!track.sequence) return;
                    let trackBeats = 0;
                    track.sequence.forEach(note => {
                        trackBeats += note.duration || 0.25;
                    });
                    if (trackBeats > sectionBeats) {
                        sectionBeats = trackBeats;
                    }
                });
            }
            totalBeats += sectionBeats;
        }
    });
    
    console.log(`Total song length: ${totalBeats} beats (${(totalBeats * secondsPerBeat).toFixed(2)}s)`);
    
    // Process each section and build merged tracks
    currentThemeSongParameters.sections.forEach((section, sectionIndex) => {
        // Calculate section duration in beats
        let sectionDuration = 0;
        
        // If section has measures defined, use that for consistent length
        if (section.measures && section.measures > 0) {
            sectionDuration = section.measures * beatsPerMeasure;
        } else {
            // Otherwise calculate based on track note durations
            if (section.tracks) {
                section.tracks.forEach(track => {
                    if (!track.sequence) return;
                    let trackBeats = 0;
                    track.sequence.forEach(note => {
                        trackBeats += note.duration || 0.25;
                    });
                    if (trackBeats > sectionDuration) {
                        sectionDuration = trackBeats;
                    }
                });
            }
        }
        
        console.log(`Section ${section.name || sectionIndex}: ${sectionDuration} beats, starts at beat ${currentBeatPosition}`);
        
        // Process each track in the section
        if (section.tracks) {
            section.tracks.forEach(track => {
                if (!track.sequence) return;
                
                const channel = track.channel;
                const trackId = `${channel}_${sectionIndex}`;
                
                // Make sure this track exists in our unified song
                if (!unifiedSong.tracks[channel]) {
                    unifiedSong.tracks[channel] = [];
                }
                
                // Process each note in the sequence
                let notePosition = currentBeatPosition;
                track.sequence.forEach(note => {
                    // Calculate timing precisely in seconds
                    const startTime = notePosition * secondsPerBeat;
                    
                    // Create a note event for the unified sequence
                    currentMusicSequence.push({
                        startBeat: notePosition,
                        startTime: startTime,
                        note: note,
                        channel: channel,
                        section: section.name || `Section ${sectionIndex + 1}`
                    });
                    
                    // Move position forward
                    notePosition += note.duration || 0.25;
                });
            });
        }
        
        // Advance to the next section with a small buffer to prevent silence gaps
        currentBeatPosition += sectionDuration + 0.25; // Add 1/4 beat buffer between sections
        console.log(`Added buffer after section ${section.name || sectionIndex}, next section starts at beat ${currentBeatPosition}`);
    });
    
    // Sort the complete sequence by start time
    currentMusicSequence.sort((a, b) => a.startTime - b.startTime);
    
    // Log the final sequence information
    console.log(`Unified sequence created with ${currentMusicSequence.length} notes spanning ${totalBeats} beats`);
    
    // Create artificial note connections by adjusting starting/ending times
    // This should eliminate gaps between sections
    for (let i = 1; i < currentMusicSequence.length; i++) {
        const prevEvent = currentMusicSequence[i-1];
        const currEvent = currentMusicSequence[i];
        
        // If same channel and there's a gap, adjust timing
        if (prevEvent.channel === currEvent.channel) {
            const prevDuration = prevEvent.note.duration || 0.25;
            const prevEndTime = prevEvent.startTime + (prevDuration * secondsPerBeat);
            
            // If there's a significant gap (more than 50ms), log it
            if (currEvent.startTime - prevEndTime > 0.05) {
                console.log(`Gap detected: ${(currEvent.startTime - prevEndTime).toFixed(3)}s between notes in ${currEvent.channel}`);
            }
        }
    }
}

// Stop the theme song
function stopThemeSong() {
    stopAllSounds();
    updateStatus('Theme song stopped');
}

// This function is no longer used - kept for reference
// Now we use prepareFullMusicSequence instead
function _prepareMusicSequenceForSection_DEPRECATED(section) {
    // This function is deprecated and no longer used
    // Keeping for reference
    console.warn("This function is deprecated - using prepareFullMusicSequence instead");
}

// Schedule and play the music sequence
function scheduleMusicSequence(onComplete) {
    if (!currentMusicSequence || !currentMusicSequence.length || !currentlyPlayingMusic) {
        if (typeof onComplete === 'function') onComplete();
        return;
    }
    
    const now = audioCtx.currentTime;
    const scheduleAheadTime = 0.2; // Schedule 200ms ahead
    
    // Find notes to play in the next schedule window
    const notesToPlay = [];
    let minNextTime = Infinity;
    let currentSection = "";
    
    for (let i = 0; i < currentMusicSequence.length; i++) {
        const event = currentMusicSequence[i];
        
        if (event.hasPlayed) continue;
        
        if (event.startTime <= now + scheduleAheadTime) {
            notesToPlay.push(event);
            event.hasPlayed = true;
            
            // Update status display when section changes
            if (event.section && event.section !== currentSection) {
                currentSection = event.section;
                updateStatus(`Playing theme song: ${currentSection}...`);
            }
        } else {
            minNextTime = Math.min(minNextTime, event.startTime);
            break;
        }
    }
    
    // Play the scheduled notes
    notesToPlay.forEach(event => {
        playMusicalNote(event.note, event.channel, Math.max(now, event.startTime));
    });
    
    // Schedule next update
    if (minNextTime < Infinity) {
        const timeUntilNext = (minNextTime - now) * 1000;
        musicSchedulerId = setTimeout(() => scheduleMusicSequence(onComplete), 
                                     Math.max(10, timeUntilNext - 50));
    } else {
        // Check if all notes have been played
        const allPlayed = currentMusicSequence.every(event => event.hasPlayed);
        
        if (allPlayed) {
            setTimeout(() => {
                if (currentlyPlayingMusic) {
                    updateStatus('Theme song completed');
                    currentlyPlayingMusic = false;
                    if (typeof onComplete === 'function') {
                        onComplete();
                    }
                }
            }, 500); // Small buffer after the last note
        } else {
            // Schedule next check
            musicSchedulerId = setTimeout(() => scheduleMusicSequence(onComplete), 100);
        }
    }
}

// Create a square wave oscillator for offline rendering
function createSquareOscillatorOffline(offlineCtx, masterGain, options = {}) {
    try {
        // Create oscillator
        const oscillator = offlineCtx.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.value = options.frequency;
        
        // Create gain node for volume
        const gainNode = offlineCtx.createGain();
        gainNode.gain.value = 0; // Start silent
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        
        // Schedule start
        oscillator.start(options.startTime);
        
        // Apply envelope
        const envelope = {
            attack: options.attack || 0.01,
            decay: options.decay || 0.1,
            sustain: options.sustain || 0.7,
            release: options.release || 0.05
        };
        
        // Calculate timings
        const attackEndTime = options.startTime + envelope.attack;
        const decayEndTime = attackEndTime + envelope.decay;
        const releaseStartTime = options.stopTime - envelope.release;
        
        // Schedule volume changes for ADSR envelope
        gainNode.gain.setValueAtTime(0, options.startTime);
        gainNode.gain.linearRampToValueAtTime(options.volume, attackEndTime);
        gainNode.gain.linearRampToValueAtTime(options.volume * envelope.sustain, decayEndTime);
        gainNode.gain.setValueAtTime(options.volume * envelope.sustain, releaseStartTime);
        gainNode.gain.linearRampToValueAtTime(0, options.stopTime);
        
        // Schedule frequency sweep if needed
        if (options.sweep) {
            oscillator.frequency.setValueAtTime(options.frequency, options.startTime);
            oscillator.frequency.linearRampToValueAtTime(
                options.sweep.endFrequency,
                options.startTime + (options.sweep.duration || (options.stopTime - options.startTime))
            );
        }
        
        // Schedule stop
        oscillator.stop(options.stopTime + 0.05); // Small buffer after release
    } catch (err) {
        console.error('Error creating square oscillator for offline rendering:', err);
    }
}

// Create a triangle wave oscillator for offline rendering
function createTriangleOscillatorOffline(offlineCtx, masterGain, options = {}) {
    try {
        // Create oscillator
        const oscillator = offlineCtx.createOscillator();
        oscillator.type = 'triangle';
        oscillator.frequency.value = options.frequency;
        
        // Create gain node for volume
        const gainNode = offlineCtx.createGain();
        gainNode.gain.value = 0; // Start silent
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        
        // Schedule start
        oscillator.start(options.startTime);
        
        // Apply envelope
        const envelope = {
            attack: options.attack || 0.01,
            decay: options.decay || 0.1,
            sustain: options.sustain || 0.8,
            release: options.release || 0.05
        };
        
        // Calculate timings
        const attackEndTime = options.startTime + envelope.attack;
        const decayEndTime = attackEndTime + envelope.decay;
        const releaseStartTime = options.stopTime - envelope.release;
        
        // Schedule volume changes for ADSR envelope
        gainNode.gain.setValueAtTime(0, options.startTime);
        gainNode.gain.linearRampToValueAtTime(options.volume, attackEndTime);
        gainNode.gain.linearRampToValueAtTime(options.volume * envelope.sustain, decayEndTime);
        gainNode.gain.setValueAtTime(options.volume * envelope.sustain, releaseStartTime);
        gainNode.gain.linearRampToValueAtTime(0, options.stopTime);
        
        // Schedule frequency sweep if needed
        if (options.sweep) {
            oscillator.frequency.setValueAtTime(options.frequency, options.startTime);
            oscillator.frequency.linearRampToValueAtTime(
                options.sweep.endFrequency,
                options.startTime + (options.sweep.duration || (options.stopTime - options.startTime))
            );
        }
        
        // Schedule stop
        oscillator.stop(options.stopTime + 0.05); // Small buffer after release
    } catch (err) {
        console.error('Error creating triangle oscillator for offline rendering:', err);
    }
}

// Create a noise generator for offline rendering
function createNoiseGeneratorOffline(offlineCtx, masterGain, options = {}) {
    try {
        // Create buffer for noise
        const bufferSize = offlineCtx.sampleRate;
        const noiseBuffer = offlineCtx.createBuffer(1, bufferSize, offlineCtx.sampleRate);
        const outputData = noiseBuffer.getChannelData(0);
        
        // Fill buffer with noise
        if (options.metallic) {
            // "Metallic" noise has a more regular pattern
            let shiftRegister = 1;
            for (let i = 0; i < bufferSize; i++) {
                // Simulate hardware shift register
                const bit0 = shiftRegister & 1;
                const bit1 = (shiftRegister >> 1) & 1;
                const newBit = bit0 ^ bit1;
                shiftRegister = (shiftRegister >> 1) | (newBit << 14);
                outputData[i] = (shiftRegister & 1) * 2 - 1;
            }
        } else {
            // Regular random noise
            for (let i = 0; i < bufferSize; i++) {
                outputData[i] = Math.random() * 2 - 1;
            }
        }
        
        // Create source from buffer
        const noiseSource = offlineCtx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        
        // Create filter to shape noise and give it "tone"
        const filter = offlineCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = options.frequency;
        filter.Q.value = 1.0;
        
        // Create gain node for volume
        const gainNode = offlineCtx.createGain();
        gainNode.gain.value = 0; // Start silent
        
        // Connect nodes
        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(masterGain);
        
        // Schedule start
        noiseSource.start(options.startTime);
        
        // Apply envelope
        const envelope = {
            attack: options.attack || 0.01,
            decay: options.decay || 0.1,
            sustain: options.sustain || 0.5,
            release: options.release || 0.05
        };
        
        // Calculate timings
        const attackEndTime = options.startTime + envelope.attack;
        const decayEndTime = attackEndTime + envelope.decay;
        const releaseStartTime = options.stopTime - envelope.release;
        
        // Schedule volume changes for ADSR envelope
        gainNode.gain.setValueAtTime(0, options.startTime);
        gainNode.gain.linearRampToValueAtTime(options.volume, attackEndTime);
        gainNode.gain.linearRampToValueAtTime(options.volume * envelope.sustain, decayEndTime);
        gainNode.gain.setValueAtTime(options.volume * envelope.sustain, releaseStartTime);
        gainNode.gain.linearRampToValueAtTime(0, options.stopTime);
        
        // Schedule stop
        noiseSource.stop(options.stopTime + 0.05); // Small buffer after release
    } catch (err) {
        console.error('Error creating noise generator for offline rendering:', err);
    }
}

// Convert AudioBuffer to WAV Blob
function audioBufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2;
    const sampleRate = buffer.sampleRate;
    const wavDataView = new DataView(new ArrayBuffer(44 + length));
    
    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
    
    // RIFF identifier
    writeString(wavDataView, 0, 'RIFF');
    // file length
    wavDataView.setUint32(4, 36 + length, true);
    // RIFF type
    writeString(wavDataView, 8, 'WAVE');
    // format chunk identifier
    writeString(wavDataView, 12, 'fmt ');
    // format chunk length
    wavDataView.setUint32(16, 16, true);
    // sample format (raw)
    wavDataView.setUint16(20, 1, true);
    // channel count
    wavDataView.setUint16(22, numOfChan, true);
    // sample rate
    wavDataView.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    wavDataView.setUint32(28, sampleRate * 2 * numOfChan, true);
    // block align (channels * bytes per sample)
    wavDataView.setUint16(32, numOfChan * 2, true);
    // bits per sample
    wavDataView.setUint16(34, 16, true);
    // data chunk identifier
    writeString(wavDataView, 36, 'data');
    // data chunk length
    wavDataView.setUint32(40, length, true);
    
    // Write actual audio data
    const channelData = [];
    for (let i = 0; i < numOfChan; i++) {
        channelData.push(buffer.getChannelData(i));
    }
    
    // Interleave channels
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
        for (let j = 0; j < numOfChan; j++) {
            // Convert float to int16
            const sample = Math.max(-1, Math.min(1, channelData[j][i]));
            const int16Sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            wavDataView.setInt16(offset, int16Sample, true);
            offset += 2;
        }
    }
    
    return new Blob([wavDataView], { type: 'audio/wav' });
}

// Function to render and save sound effect
async function saveSoundEffect() {
    if (!currentSoundParameters || !currentSoundParameters.length) {
        updateStatus('No sound to save');
        return;
    }
    
    const description = soundDescription.value.trim();
    const timestamp = new Date().toISOString();
    const soundId = 'sound-' + Date.now();
    
    try {
        // Calculate total duration of all segments
        let totalDuration = 0;
        currentSoundParameters.forEach(segment => {
            // Get segment duration (either directly from segment or from the longest channel)
            let segmentDuration = segment.duration || 0;
            
            // If segment has channels, check their durations too
            if (segment.channels) {
                segment.channels.forEach(channel => {
                    const channelDuration = channel.duration || 0.5;
                    if (channelDuration > segmentDuration) {
                        segmentDuration = channelDuration;
                    }
                });
            }
            
            totalDuration += segmentDuration;
        });
        
        // Add a small buffer to ensure we capture the full sound
        totalDuration += 0.05; // Reduced buffer for smoother transitions
        
        // Create an offline audio context for rendering with a more precise length
        const offlineCtx = new OfflineAudioContext({
            numberOfChannels: 1,
            length: Math.ceil(44100 * totalDuration),
            sampleRate: 44100
        });
        
        // Create master gain
        const offlineGain = offlineCtx.createGain();
        offlineGain.gain.value = 0.5;
        offlineGain.connect(offlineCtx.destination);
        
        // Render each segment sequentially
        let currentTime = 0;
        
        for (const segment of currentSoundParameters) {
            let segmentDuration = segment.duration || 0;
            
            // Recreate all channels in this segment
            segment.channels.forEach(params => {
                // Common parameters
                const options = {
                    frequency: params.frequency || 440,
                    startTime: currentTime,
                    stopTime: currentTime + (params.duration || 0.5),
                    volume: params.volume || 0.5,
                    attack: params.attack || 0.01,
                    decay: params.decay || 0.1,
                    sustain: params.sustain || 0.7,
                    release: params.release || 0.1
                };
                
                // Update segment duration if any channel has longer duration
                if (params.duration && params.duration > segmentDuration) {
                    segmentDuration = params.duration;
                }
                
                // Add sweep if present
                if (params.sweep) {
                    options.sweep = {
                        endFrequency: params.sweep.endFrequency,
                        duration: params.sweep.duration
                    };
                }
                
                // Create appropriate node based on type
                switch (params.type) {
                    case 'square1':
                    case 'square2':
                        options.duty = params.duty || 0.5;
                        createSquareOscillatorOffline(offlineCtx, offlineGain, options);
                        break;
                    case 'triangle':
                        createTriangleOscillatorOffline(offlineCtx, offlineGain, options);
                        break;
                    case 'noise':
                        options.metallic = params.metallic || false;
                        createNoiseGeneratorOffline(offlineCtx, offlineGain, options);
                        break;
                }
            });
            
            // Move time cursor forward by this segment's duration
            currentTime += segmentDuration;
        }
        
        // Start rendering
        updateStatus('Rendering sound for download...');
        const renderedBuffer = await offlineCtx.startRendering();
        
        // Trim silence from the end of the buffer
        const trimmedBuffer = trimSilenceFromEnd(renderedBuffer);
        
        // Convert buffer to WAV
        const wavBlob = audioBufferToWav(trimmedBuffer);
        
        // Store in our history
        recordedBlobs[soundId] = wavBlob;
        
        // Add to sound history
        const soundItem = {
            id: soundId,
            description: description,
            timestamp: timestamp,
            type: 'effect',
            parameters: JSON.parse(JSON.stringify(currentSoundParameters))
        };
        
        soundHistory.unshift(soundItem);
        updateSoundHistory();
        
        updateStatus('Sound saved!');
    } catch (err) {
        console.error('Error saving sound:', err);
        updateStatus('Failed to save sound: ' + err.message);
    }
}

// Function to trim silence from the end of an audio buffer
function trimSilenceFromEnd(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    
    // Find the last non-silent sample across all channels
    let lastNonSilentSample = 0;
    
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        
        // Start from the end and work backwards
        let i = channelData.length - 1;
        
        // Skip very quiet noise (anything below -60dB or 0.001 amplitude)
        const silenceThreshold = 0.001;
        
        while (i >= 0 && Math.abs(channelData[i]) < silenceThreshold) {
            i--;
        }
        
        // Add a short tail of about 100ms to avoid abrupt cutoffs
        const tailSamples = Math.min(sampleRate * 0.1, 4410);
        i = Math.min(channelData.length - 1, i + tailSamples);
        
        // Update the last non-silent sample position
        lastNonSilentSample = Math.max(lastNonSilentSample, i);
    }
    
    // If we found a good trim point
    if (lastNonSilentSample > 0 && lastNonSilentSample < buffer.length - 1) {
        console.log(`Trimming silence: removing ${buffer.length - lastNonSilentSample - 1} samples (${((buffer.length - lastNonSilentSample - 1) / sampleRate).toFixed(3)}s)`);
        
        // Create a new buffer with the trimmed length
        const trimmedBuffer = new AudioContext().createBuffer(
            numChannels,
            lastNonSilentSample + 1,
            sampleRate
        );
        
        // Copy data from original buffer to the trimmed buffer
        for (let channel = 0; channel < numChannels; channel++) {
            const originalData = buffer.getChannelData(channel);
            const trimmedData = trimmedBuffer.getChannelData(channel);
            
            // Apply a short fade out at the end to avoid clicks (5ms)
            const fadeOutSamples = Math.min(sampleRate * 0.005, trimmedData.length);
            
            for (let i = 0; i < trimmedData.length; i++) {
                // Apply fade out if we're in the last few samples
                if (i > trimmedData.length - fadeOutSamples) {
                    const fadeOutFactor = (trimmedData.length - i) / fadeOutSamples;
                    trimmedData[i] = originalData[i] * fadeOutFactor;
                } else {
                    trimmedData[i] = originalData[i];
                }
            }
        }
        
        return trimmedBuffer;
    }
    
    // If we couldn't find a good trim point, return the original buffer
    return buffer;
}

// Helper function to concatenate audio buffers - with better tone handling
function concatenateAudioBuffers(buffers, audioContext) {
    // Calculate total length, properly handling section transitions
    let totalLength = 0;
    const effectiveLengths = [];
    const effectiveStarts = [];
    
    // First pass: analyze buffers to find audio boundaries
    for (let i = 0; i < buffers.length; i++) {
        const buffer = buffers[i];
        const channelData = buffer.getChannelData(0);
        let effectiveStart = 0;
        let effectiveLength = buffer.length;
        
        // Find non-silent start (for sections after the first)
        if (i > 0) {
            // Skip very low amplitude noise at the start
            while (effectiveStart < buffer.length && Math.abs(channelData[effectiveStart]) < 0.005) {
                effectiveStart++;
            }
            
            if (effectiveStart > 0) {
                console.log(`Buffer ${i+1} has silent start, skipping ${effectiveStart} samples`);
            }
        }
        
        // Find where audio effectively ends (for all sections except last)
        if (i < buffers.length - 1) {
            // Start from the end and work backwards
            let audioEnd = buffer.length - 1;
            
            // First, skip very quiet noise
            while (audioEnd > 0 && Math.abs(channelData[audioEnd]) < 0.005) {
                audioEnd--;
            }
            
            // Then look for sustained tone - if we have a sequence of similar amplitude samples
            // this might be a sustained tone that should be cut off
            if (audioEnd > 0) {
                const amplitudeAtEnd = Math.abs(channelData[audioEnd]);
                let sustainedToneStart = audioEnd;
                
                // Check for a sustained tone by looking for consistent amplitude
                // over a period of time (more than 100ms of similar amplitude is likely a held note)
                const sampleThreshold = buffer.sampleRate * 0.1; // 100ms
                
                while (sustainedToneStart > 0 &&
                       Math.abs(Math.abs(channelData[sustainedToneStart]) - amplitudeAtEnd) < 0.01 &&
                       audioEnd - sustainedToneStart < sampleThreshold) {
                    sustainedToneStart--;
                }
                
                // If we found a sustained tone of significant length
                if (audioEnd - sustainedToneStart > buffer.sampleRate * 0.05) { // At least 50ms
                    console.log(`Buffer ${i+1} has sustained tone at end, may trim it`);
                    
                    // Check if the next buffer starts with similar tone - if not, we should trim this
                    if (i + 1 < buffers.length) {
                        const nextBuffer = buffers[i + 1];
                        const nextData = nextBuffer.getChannelData(0);
                        
                        // Skip silence at start of next buffer
                        let nextStart = 0;
                        while (nextStart < nextBuffer.length && Math.abs(nextData[nextStart]) < 0.005) {
                            nextStart++;
                        }
                        
                        // If next buffer starts with a different amplitude (not the same sustained tone)
                        // then we'll trim the current buffer's sustained tone
                        if (nextStart < nextBuffer.length) {
                            const nextAmplitude = Math.abs(nextData[nextStart]);
                            if (Math.abs(nextAmplitude - amplitudeAtEnd) > 0.1) {
                                // Find a good place to fade out - about 50ms before the end
                                const fadePoint = Math.max(0, sustainedToneStart - Math.floor(buffer.sampleRate * 0.05));
                                effectiveLength = fadePoint;
                                console.log(`Trimming sustained tone in buffer ${i+1}, removed ${buffer.length - effectiveLength} samples`);
                            } else {
                                console.log(`Sustained tone continues in next section, keeping it`);
                            }
                        }
                    }
                } else {
                    effectiveLength = audioEnd + 1;
                    if (buffer.length - effectiveLength > 0) {
                        console.log(`Buffer ${i+1} trimmed ${buffer.length - effectiveLength} silent samples from end`);
                    }
                }
            }
        }
        
        effectiveStarts.push(effectiveStart);
        effectiveLengths.push(effectiveLength - effectiveStart);
        totalLength += effectiveLength - effectiveStart;
    }
    
    console.log(`Creating buffer for ${buffers.length} sections, total length: ${totalLength} samples`);
    
    // Create new buffer with combined length
    const result = audioContext.createBuffer(
        buffers[0].numberOfChannels,
        totalLength,
        buffers[0].sampleRate
    );
    
    // Copy data from each buffer
    let offset = 0;
    for (let i = 0; i < buffers.length; i++) {
        const buffer = buffers[i];
        const effectiveStart = effectiveStarts[i];
        const effectiveLength = effectiveLengths[i];
        
        console.log(`Concatenating buffer ${i+1}/${buffers.length}: ${(effectiveLength/buffer.sampleRate).toFixed(3)}s (from ${(effectiveStart/buffer.sampleRate).toFixed(3)}s)`);
        
        // Copy this buffer's data to the correct offset
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const resultData = result.getChannelData(channel);
            const bufferData = buffer.getChannelData(channel);
            
            // Use a very short fade-in and fade-out to avoid clicks (1ms)
            const fadeInSamples = Math.min(10, effectiveLength);
            const fadeOutSamples = Math.min(50, effectiveLength);
            
            // Copy samples with precise trimming
            for (let j = 0; j < effectiveLength; j++) {
                const sourceSample = bufferData[effectiveStart + j];
                
                // Apply very subtle fade-in if not the first section
                if (i > 0 && j < fadeInSamples) {
                    const fadeInFactor = j / fadeInSamples;
                    resultData[offset + j] = sourceSample * fadeInFactor;
                }
                // Apply very subtle fade-out if not the last section
                else if (i < buffers.length - 1 && j > effectiveLength - fadeOutSamples - 1) {
                    const fadeOutFactor = (effectiveLength - j) / fadeOutSamples;
                    resultData[offset + j] = sourceSample * fadeOutFactor;
                }
                // Normal copy
                else {
                    resultData[offset + j] = sourceSample;
                }
            }
        }
        
        // Advance offset by the effective length
        offset += effectiveLength;
    }
    
    return result;
}

// Function to render a single section to an AudioBuffer
async function renderSectionToBuffer(section, tempo, timeSignature, sampleRate = 44100) {
    const sectionName = section.name || 'Unnamed Section';
    updateStatus(`Rendering section: ${sectionName}...`);
    
    const secondsPerBeat = 60 / tempo;
    const beatsPerMeasure = parseInt(timeSignature.split('/')[0]) || 4;
    
    // Calculate section duration
    let sectionDuration = 0;
    if (section.measures && section.measures > 0) {
        sectionDuration = section.measures * beatsPerMeasure * secondsPerBeat;
    } else if (section.tracks) {
        section.tracks.forEach(track => {
            if (!track.sequence) return;
            let trackBeats = 0;
            track.sequence.forEach(note => {
                trackBeats += note.duration || 0.25;
            });
            const trackDuration = trackBeats * secondsPerBeat;
            if (trackDuration > sectionDuration) {
                sectionDuration = trackDuration;
            }
        });
    }
    
    // Add minimal buffer to capture all audio without excess silence
    sectionDuration += 0.02;
    
    console.log(`Section ${sectionName}: ${sectionDuration.toFixed(3)}s`);
    
    // Create a dedicated offline context just for this section
    const offlineCtx = new OfflineAudioContext({
        numberOfChannels: 1,
        length: Math.ceil(sampleRate * sectionDuration),
        sampleRate: sampleRate
    });
    
    // Create master gain
    const offlineGain = offlineCtx.createGain();
    offlineGain.gain.value = 0.5;
    offlineGain.connect(offlineCtx.destination);
    
    // Render each track in this section
    if (section.tracks) {
        section.tracks.forEach(track => {
            if (!track.sequence) return;
            
            const channel = track.channel;
            let beatPosition = 0; // Start at 0 for this section
            
            // Process each note
            track.sequence.forEach(note => {
                if (note.note === 'rest') {
                    beatPosition += note.duration || 0.25;
                    return;
                }
                
                // Convert note to frequency
                const frequency = noteToFreq[note.note] || 440;
                
                // Calculate timing
                const startTime = beatPosition * secondsPerBeat;
                const noteDuration = (note.duration || 0.25) * secondsPerBeat;
                const stopTime = startTime + noteDuration;
                
                // Create oscillator with standard settings
                const options = {
                    frequency: frequency,
                    startTime: startTime,
                    stopTime: stopTime,
                    volume: note.volume || 0.5,
                    attack: note.attack || 0.01,
                    decay: note.decay || 0.1,
                    sustain: note.sustain || 0.7,
                    release: note.release || 0.05
                };
                
                // Add oscillator based on channel type
                switch (channel) {
                    case 'square1':
                    case 'square2':
                        options.duty = note.duty || 0.5;
                        createSquareOscillatorOffline(offlineCtx, offlineGain, options);
                        break;
                    case 'triangle':
                        createTriangleOscillatorOffline(offlineCtx, offlineGain, options);
                        break;
                    case 'noise':
                        options.metallic = note.metallic || false;
                        options.frequency = frequency;
                        createNoiseGeneratorOffline(offlineCtx, offlineGain, options);
                        break;
                }
                
                // Advance position
                beatPosition += note.duration || 0.25;
            });
        });
    }
    
    // Render this section to a buffer
    try {
        const buffer = await offlineCtx.startRendering();
        console.log(`Rendered section "${sectionName}": ${buffer.duration.toFixed(3)}s, ${buffer.length} samples`);
        return buffer;
    } catch (err) {
        console.error(`Error rendering section "${sectionName}":`, err);
        throw err;
    }
}

// Function to render and save theme song
async function saveThemeSong() {
    if (!currentThemeSongParameters || !currentThemeSongParameters.sections) {
        updateStatus('No theme song to save');
        return;
    }
    
    const description = musicDescription.value.trim();
    const timestamp = new Date().toISOString();
    const soundId = 'music-' + Date.now();
    const sampleRate = 44100;
    
    try {
        const tempo = currentThemeSongParameters.tempo || 120;
        const timeSignature = currentThemeSongParameters.timeSignature || "4/4";
        const songTitle = currentThemeSongParameters.title || description;
        
        updateStatus(`Starting section-by-section rendering for "${songTitle}"...`);
        
        // Create a temporary audio context for buffer manipulation
        const tempCtx = new AudioContext({ sampleRate });
        
        // IMPORTANT NEW APPROACH: Render each section separately
        const sectionBuffers = [];
        
        // Process each section one-by-one
        for (let i = 0; i < currentThemeSongParameters.sections.length; i++) {
            const section = currentThemeSongParameters.sections[i];
            const sectionName = section.name || `Section ${i+1}`;
            
            updateStatus(`Rendering section ${i+1}/${currentThemeSongParameters.sections.length}: ${sectionName}`);
            
            // Render this section to its own buffer
            const sectionBuffer = await renderSectionToBuffer(
                section, 
                tempo, 
                timeSignature,
                sampleRate
            );
            
            // Add to our collection
            sectionBuffers.push(sectionBuffer);
        }
        
        updateStatus('All sections rendered, combining...');
        
        // Combine all section buffers into one complete song
        const combinedBuffer = concatenateAudioBuffers(sectionBuffers, tempCtx);
        
        console.log(`Combined buffer created: ${combinedBuffer.duration.toFixed(2)}s, ${combinedBuffer.length} samples`);
        
        // Trim silence from the end of the buffer
        const trimmedBuffer = trimSilenceFromEnd(combinedBuffer);
        console.log(`Trimmed buffer: ${trimmedBuffer.duration.toFixed(2)}s, ${trimmedBuffer.length} samples`);
        
        // Convert the combined buffer to WAV
        const wavBlob = audioBufferToWav(trimmedBuffer);
        
        // Store in history
        recordedBlobs[soundId] = wavBlob;
        
        // Add to sound history
        const soundItem = {
            id: soundId,
            description: songTitle,
            timestamp: timestamp,
            type: 'theme',
            parameters: JSON.parse(JSON.stringify(currentThemeSongParameters))
        };
        
        soundHistory.unshift(soundItem);
        updateSoundHistory();
        
        // Clean up
        tempCtx.close();
        
        updateStatus('Theme song saved!');
    } catch (err) {
        console.error('Error saving theme song:', err);
        updateStatus('Failed to save theme song: ' + err.message);
    }
}

// Update the sound history display
function updateSoundHistory() {
    const soundHistoryElement = document.getElementById('soundHistory');
    
    if (soundHistory.length === 0) {
        soundHistoryElement.innerHTML = '<div class="empty-state">No sounds generated yet</div>';
        return;
    }
    
    // Clear the history element
    soundHistoryElement.innerHTML = '';
    
    // Add each sound
    soundHistory.forEach((sound, index) => {
        const soundElement = document.createElement('div');
        soundElement.className = 'sound-item';
        if (sound.type === 'theme') {
            soundElement.className += ' music-item';
        }
        
        // Create date string
        const date = new Date(sound.timestamp);
        const dateString = date.toLocaleTimeString();
        
        // Calculate duration for the sound
        let duration = 0;
        let durationText = "0:00";
        
        if (sound.type === 'theme') {
            // For theme songs, calculate based on tempo, time signature, and notes
            const tempo = sound.parameters.tempo || 120;
            const loopCount = sound.parameters.loopCount || 1;
            let totalBeats = 0;
            
            if (sound.parameters.tracks) {
                sound.parameters.tracks.forEach(track => {
                    if (track.sequence) {
                        let trackBeats = 0;
                        track.sequence.forEach(note => {
                            trackBeats += note.duration || 0.25;
                        });
                        totalBeats = Math.max(totalBeats, trackBeats);
                    }
                });
            }
            
            // Calculate duration in seconds
            duration = (totalBeats * 60 / tempo) * loopCount;
        } else {
            // For sound effects, use the longest channel duration
            if (sound.parameters) {
                sound.parameters.forEach(param => {
                    duration = Math.max(duration, param.duration || 0.5);
                });
            }
        }
        
        // Format duration as mm:ss
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60).toString().padStart(2, '0');
        durationText = `${minutes}:${seconds}`;
        
        // Truncate description if needed
        const shortDesc = sound.description.length > 30 
            ? sound.description.substring(0, 27) + '...' 
            : sound.description;
        
        soundElement.innerHTML = `
            <div class="sound-info">
                <div class="sound-name">${shortDesc}${sound.type === 'theme' ? ' 🎵' : ''}</div>
                <div class="sound-desc">${dateString}</div>
                <div class="sound-progress">
                    <div class="sound-progress-fill${sound.type === 'theme' ? ' music-progress-fill' : ''}" id="progress-${sound.id}"></div>
                </div>
                <div class="sound-meta">
                    <div class="sound-duration">${durationText}</div>
                    <div class="sound-position" id="position-${sound.id}">0:00</div>
                </div>
            </div>
            <div class="sound-actions">
                <button class="btn btn-play-saved" data-sound-id="${sound.id}">Play</button>
                <button class="btn btn-download" data-sound-id="${sound.id}">Download</button>
            </div>
        `;
        
        soundHistoryElement.appendChild(soundElement);
    });
    
    // Add event listeners for play buttons
    const playButtons = document.querySelectorAll('.btn-play-saved');
    playButtons.forEach(button => {
        button.addEventListener('click', () => {
            const soundId = button.getAttribute('data-sound-id');
            playStoredSound(soundId);
        });
    });
    
    // Add event listeners for download buttons
    const downloadButtons = document.querySelectorAll('.btn-download');
    downloadButtons.forEach(button => {
        button.addEventListener('click', () => {
            const soundId = button.getAttribute('data-sound-id');
            downloadSound(soundId);
        });
    });
}

// Play a stored sound
function playStoredSound(soundId) {
    const sound = soundHistory.find(s => s.id === soundId);
    if (!sound) {
        updateStatus('Sound not found');
        return;
    }
    
    // Initialize audio context if needed
    if (!audioCtx) {
        initAudio();
    }
    
    // Resume audio context if suspended
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(err => {
            updateStatus('Failed to resume audio context: ' + err.message);
        });
        return;
    }
    
    try {
        // Stop any currently playing sounds
        stopAllSounds();
        
        // Get the stored blob
        const blob = recordedBlobs[soundId];
        if (!blob) {
            updateStatus('Sound data not found');
            return;
        }
        
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        
        // Create an audio element
        const audioElement = new Audio();
        
        // Calculate total duration for progress tracking
        let totalDuration = 0;
        
        if (sound.type === 'theme') {
            const tempo = sound.parameters.tempo || 120;
            const loopCount = sound.parameters.loopCount || 1;
            let totalBeats = 0;
            
            if (sound.parameters.tracks) {
                sound.parameters.tracks.forEach(track => {
                    if (track.sequence) {
                        let trackBeats = 0;
                        track.sequence.forEach(note => {
                            trackBeats += note.duration || 0.25;
                        });
                        totalBeats = Math.max(totalBeats, trackBeats);
                    }
                });
            }
            
            totalDuration = (totalBeats * 60 / tempo) * loopCount;
        } else {
            if (sound.parameters) {
                sound.parameters.forEach(param => {
                    totalDuration = Math.max(totalDuration, param.duration || 0.5);
                });
            }
        }
        
        // Get UI elements for progress display
        const progressBar = document.getElementById(`progress-${soundId}`);
        const positionDisplay = document.getElementById(`position-${soundId}`);
        
        // Add "Now Playing" indicator
        const soundItems = document.querySelectorAll('.sound-item');
        let nameElement = null;
        
        // Find the sound item that corresponds to this sound ID
        soundItems.forEach(item => {
            const playButton = item.querySelector('.btn-play-saved');
            if (playButton && playButton.getAttribute('data-sound-id') === soundId) {
                nameElement = item.querySelector('.sound-name');
            }
        });
            
        // Remove any existing "Now Playing" indicators
        const existingIndicators = document.querySelectorAll('.now-playing');
        existingIndicators.forEach(el => el.remove());
        
        if (nameElement) {
            const playingIndicator = document.createElement('span');
            playingIndicator.className = 'now-playing';
            playingIndicator.textContent = ' ▶ Playing';
            nameElement.appendChild(playingIndicator);
        }
        
        // Set up progress updating
        let progressInterval = null;
        if (progressBar && positionDisplay) {
            progressInterval = setInterval(() => {
                const currentTime = audioElement.currentTime;
                const progress = (currentTime / audioElement.duration) * 100;
                
                progressBar.style.width = `${progress}%`;
                
                // Format current time
                const minutes = Math.floor(currentTime / 60);
                const seconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
                positionDisplay.textContent = `${minutes}:${seconds}`;
                
                // Update channel meters based on progress
                if (sound.type === 'theme') {
                    // For theme songs, pulse the channels randomly to visualize music
                    for (let i = 0; i < 4; i++) {
                        if (Math.random() > 0.7) {
                            channelLevels[i] = Math.random() * 0.8;
                        }
                    }
                } else {
                    // For sound effects, just show activity on all channels
                    const activityLevel = Math.min(1, progress / 50);
                    for (let i = 0; i < 4; i++) {
                        channelLevels[i] = Math.max(0, activityLevel - (i * 0.2));
                    }
                }
            }, 100);
        }
        
        // Set up event handlers
        audioElement.onended = () => {
            URL.revokeObjectURL(url);
            updateStatus('');
            
            // Clear progress interval
            if (progressInterval) {
                clearInterval(progressInterval);
            }
            
            // Reset progress and "Now Playing" indicator
            resetPlaybackProgress();
            
            // Reset channel meters
            for (let i = 0; i < 4; i++) {
                channelLevels[i] = 0;
            }
        };
        
        audioElement.onerror = (err) => {
            console.error('Audio playback error:', err);
            URL.revokeObjectURL(url);
            updateStatus('Error playing sound');
            
            // Clear progress interval
            if (progressInterval) {
                clearInterval(progressInterval);
            }
            
            // Reset progress
            resetPlaybackProgress();
        };
        
        // Load and play the sound
        audioElement.src = url;
        audioElement.play();
        updateStatus(`Playing "${sound.description}"...`);
    } catch (err) {
        console.error('Error playing stored sound:', err);
        updateStatus('Failed to play sound: ' + err.message);
    }
}

// Download a stored sound
function downloadSound(soundId) {
    const sound = soundHistory.find(s => s.id === soundId);
    if (!sound) {
        updateStatus('Sound not found');
        return;
    }
    
    try {
        // Get the stored blob
        const blob = recordedBlobs[soundId];
        if (!blob) {
            updateStatus('Sound data not found');
            return;
        }
        
        // Create a safe filename
        // Create a safe filename
        const safeDesc = sound.description.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const prefix = sound.type === 'theme' ? 'nes_theme_' : 'nes_sfx_';
        const filename = `${prefix}${safeDesc}_${soundId}.wav`;
        
        // Create a download link
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
        }, 100);
        
        updateStatus(`Downloaded "${sound.description}"`);
    } catch (err) {
        console.error('Error downloading sound:', err);
        updateStatus('Failed to download sound: ' + err.message);
    }
}

// Initialize event listeners on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set initial focus
    soundDescription.focus();
});