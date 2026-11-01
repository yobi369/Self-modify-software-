// Web Audio API lightweight synthesizer for crisp cyberpunk CPU audio feedback

let audioCtx: AudioContext | null = null;
let soundEnabled = false;

export function toggleSound(enabled?: boolean): boolean {
  if (typeof enabled === 'boolean') {
    soundEnabled = enabled;
  } else {
    soundEnabled = !soundEnabled;
  }
  if (soundEnabled && !audioCtx) {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioContextClass();
    } catch {
      // AudioContext not supported
    }
  }
  if (audioCtx && audioCtx.state === 'suspended' && soundEnabled) {
    audioCtx.resume();
  }
  return soundEnabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

function playTone(freq: number, type: OscillatorType, duration: number, gainVal: number = 0.05) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    // Ignore audio errors silently
  }
}

export const sounds = {
  click: () => playTone(800, 'sine', 0.04, 0.03),
  step: () => playTone(540, 'triangle', 0.06, 0.04),
  memoryWrite: () => {
    playTone(320, 'sawtooth', 0.08, 0.04);
    setTimeout(() => playTone(640, 'sine', 0.08, 0.04), 40);
  },
  execute: () => {
    playTone(440, 'sine', 0.06, 0.04);
    setTimeout(() => playTone(880, 'sine', 0.12, 0.05), 60);
  },
  permissionChange: () => {
    playTone(280, 'square', 0.08, 0.03);
    setTimeout(() => playTone(420, 'square', 0.1, 0.03), 70);
  },
  reset: () => playTone(300, 'sine', 0.12, 0.04),
  success: () => {
    playTone(523.25, 'sine', 0.08, 0.04);
    setTimeout(() => playTone(659.25, 'sine', 0.08, 0.04), 70);
    setTimeout(() => playTone(783.99, 'sine', 0.14, 0.05), 140);
  },
  error: () => {
    playTone(220, 'sawtooth', 0.1, 0.05);
    setTimeout(() => playTone(180, 'sawtooth', 0.15, 0.05), 90);
  },
};
