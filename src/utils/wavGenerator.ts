/**
 * In-Memory WAV PCM Audio Synthesizer
 * Generates true HTML5-compatible WAV audio files on-the-fly.
 * 100% compatible with all mobile phone speakers (Android & iOS) via standard HTML5 Audio.
 */

function createWavDataUrl(samples: Float32Array, sampleRate: number = 44100): string {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Write RIFF header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM 16-bit integer audio samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// 1. Pop / Click Sound
export function generateClickWav(): string {
  const sampleRate = 44100;
  const duration = 0.08;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = 500 + (t / duration) * 600; // Pitch ramp
    const envelope = Math.exp(-t * 35); // Fast decay
    samples[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.9;
  }
  return createWavDataUrl(samples, sampleRate);
}

// 2. Card Flip Whoosh
export function generateFlipWav(): string {
  const sampleRate = 44100;
  const duration = 0.22;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = 280 + Math.sin((t / duration) * Math.PI) * 450;
    const envelope = Math.sin((t / duration) * Math.PI);
    const noise = (Math.random() * 2 - 1) * 0.15;
    samples[i] = (Math.sin(2 * Math.PI * freq * t) + noise) * envelope * 0.85;
  }
  return createWavDataUrl(samples, sampleRate);
}

// 3. Card Shuffle Flutter
export function generateShuffleWav(): string {
  const sampleRate = 44100;
  const duration = 0.28;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sub = Math.sin(t * 120);
    const noise = (Math.random() * 2 - 1) * 0.4;
    const env = Math.exp(-((t - 0.14) ** 2) / 0.01);
    samples[i] = (Math.sin(2 * Math.PI * 400 * t) * 0.4 + sub * 0.3 + noise) * env * 0.8;
  }
  return createWavDataUrl(samples, sampleRate);
}

// 4. Timer Tick (Woodblock style)
export function generateTickWav(): string {
  const sampleRate = 44100;
  const duration = 0.05;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 70);
    samples[i] = (Math.sin(2 * Math.PI * 900 * t) + Math.sin(2 * Math.PI * 1800 * t) * 0.3) * env * 0.9;
  }
  return createWavDataUrl(samples, sampleRate);
}

// 5. Timer Warning (< 3s)
export function generateWarningWav(): string {
  const sampleRate = 44100;
  const duration = 0.1;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 25);
    samples[i] = Math.sin(2 * Math.PI * 1046.5 * t) * env * 0.9;
  }
  return createWavDataUrl(samples, sampleRate);
}

// 6. Timer End Alarm (Triple Chime)
export function generateTimerEndWav(): string {
  const sampleRate = 44100;
  const duration = 0.45;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, idx) => {
    const start = idx * 0.1;
    for (let i = Math.floor(start * sampleRate); i < numSamples; i++) {
      const t = (i - start * sampleRate) / sampleRate;
      if (t >= 0 && t < 0.25) {
        const env = Math.exp(-t * 12);
        samples[i] += Math.sin(2 * Math.PI * freq * t) * env * 0.35;
      }
    }
  });
  return createWavDataUrl(samples, sampleRate);
}

// 7. Success Chime (Bright Major Triad)
export function generateSuccessWav(): string {
  const sampleRate = 44100;
  const duration = 0.55;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const start = idx * 0.08;
    for (let i = Math.floor(start * sampleRate); i < numSamples; i++) {
      const t = (i - start * sampleRate) / sampleRate;
      if (t >= 0 && t < 0.35) {
        const env = Math.exp(-t * 8);
        samples[i] += (Math.sin(2 * Math.PI * freq * t) + Math.sin(2 * Math.PI * freq * 2 * t) * 0.2) * env * 0.3;
      }
    }
  });
  return createWavDataUrl(samples, sampleRate);
}

// 8. "Lucu Banget!" Bonus Sound (Cartoon Sparkle Fanfare)
export function generateFunnyBonusWav(): string {
  const sampleRate = 44100;
  const duration = 0.55;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
  notes.forEach((freq, idx) => {
    const start = idx * 0.06;
    for (let i = Math.floor(start * sampleRate); i < numSamples; i++) {
      const t = (i - start * sampleRate) / sampleRate;
      if (t >= 0 && t < 0.25) {
        const env = Math.exp(-t * 10);
        samples[i] += Math.sin(2 * Math.PI * freq * t) * env * 0.25;
      }
    }
  });
  return createWavDataUrl(samples, sampleRate);
}

// 9. Skip Sound
export function generateSkipWav(): string {
  const sampleRate = 44100;
  const duration = 0.25;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  const notes = [659.25, 493.88];
  notes.forEach((freq, idx) => {
    const start = idx * 0.1;
    for (let i = Math.floor(start * sampleRate); i < numSamples; i++) {
      const t = (i - start * sampleRate) / sampleRate;
      if (t >= 0 && t < 0.18) {
        const env = Math.exp(-t * 12);
        samples[i] += Math.sin(2 * Math.PI * freq * t) * env * 0.4;
      }
    }
  });
  return createWavDataUrl(samples, sampleRate);
}

// 10. Turn Switch Cheer
export function generateTurnWav(): string {
  const sampleRate = 44100;
  const duration = 0.35;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  const notes = [587.33, 739.99, 880.00];
  notes.forEach((freq, idx) => {
    const start = idx * 0.08;
    for (let i = Math.floor(start * sampleRate); i < numSamples; i++) {
      const t = (i - start * sampleRate) / sampleRate;
      if (t >= 0 && t < 0.25) {
        const env = Math.exp(-t * 9);
        samples[i] += Math.sin(2 * Math.PI * freq * t) * env * 0.35;
      }
    }
  });
  return createWavDataUrl(samples, sampleRate);
}

// 11. Grand Victory Fanfare
export function generateVictoryWav(): string {
  const sampleRate = 44100;
  const duration = 1.4;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  const fanfare = [
    { f: 523.25, t: 0, d: 0.15 },
    { f: 523.25, t: 0.14, d: 0.15 },
    { f: 523.25, t: 0.28, d: 0.15 },
    { f: 659.25, t: 0.42, d: 0.28 },
    { f: 783.99, t: 0.72, d: 0.28 },
    { f: 1046.50, t: 1.02, d: 0.65 },
  ];

  fanfare.forEach((n) => {
    const startIdx = Math.floor(n.t * sampleRate);
    for (let i = startIdx; i < numSamples; i++) {
      const t = (i - startIdx) / sampleRate;
      if (t >= 0 && t < n.d) {
        const env = Math.exp(-t * 3.5);
        samples[i] += (Math.sin(2 * Math.PI * n.f * t) + Math.sin(2 * Math.PI * n.f * 2 * t) * 0.25) * env * 0.35;
      }
    }
  });
  return createWavDataUrl(samples, sampleRate);
}
