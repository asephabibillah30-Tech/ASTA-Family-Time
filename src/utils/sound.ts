/**
 * Mobile-First Synthesized Sound Effects Engine
 * Specifically designed to unlock and play audio seamlessly on Android & iOS Safari / Chrome mobile browsers.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.9;
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.attachUnlockListeners();
    }
  }

  /**
   * Synchronously creates and unlocks AudioContext on user interaction
   */
  public init() {
    this.unlock();
  }

  public unlock() {
    if (typeof window === 'undefined') return;

    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }

      if (this.ctx) {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }

        if (!this.isUnlocked) {
          // Play silent 1-sample buffer to unlock iOS & Android audio hardware pipeline
          const buffer = this.ctx.createBuffer(1, 1, 22050);
          const source = this.ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(this.ctx.destination);
          source.start(0);
          this.isUnlocked = true;
        }
      }
    } catch {
      // Ignore
    }
  }

  private attachUnlockListeners() {
    const handleTouch = () => {
      this.unlock();
    };

    ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'click'].forEach(evt => {
      window.addEventListener(evt, handleTouch, { passive: true });
    });
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (val) this.unlock();
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  public getVolume(): number {
    return this.volume;
  }

  private ensureContext(callback: (ctx: AudioContext) => void) {
    if (!this.enabled) return;
    this.unlock();
    const ctx = this.ctx;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        try {
          callback(ctx);
        } catch {
          // Ignore
        }
      }).catch(() => {});
    } else {
      try {
        callback(ctx);
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Tap / Click Pop Sound
   */
  public playClick() {
    this.ensureContext((ctx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.05);

      gain.gain.setValueAtTime(this.volume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    });
  }

  /**
   * Card Flip Whoosh
   */
  public playCardFlip() {
    this.ensureContext((ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);

      gain.gain.setValueAtTime(this.volume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    });
  }

  /**
   * Card Shuffle flutter
   */
  public playCardShuffle() {
    this.ensureContext((ctx) => {
      const now = ctx.currentTime;
      [0, 0.05, 0.1, 0.15, 0.2].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const freq = 350 + idx * 100 + (Math.random() * 60);
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(this.volume * 0.5, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.05);
      });
    });
  }

  /**
   * Regular Timer Tick
   */
  public playTimerTick() {
    this.ensureContext((ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, now);
      gain.gain.setValueAtTime(this.volume * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    });
  }

  /**
   * Urgent Timer Warning (< 3 seconds)
   */
  public playTimerWarning() {
    this.ensureContext((ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now); // C6
      gain.gain.setValueAtTime(this.volume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    });
  }

  /**
   * Timer Finished Bell
   */
  public playTimerEnd() {
    this.ensureContext((ctx) => {
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const delay = idx * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(this.volume * 0.65, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.35);
      });
    });
  }

  /**
   * Success Chime (Major Chord)
   */
  public playSuccess() {
    this.ensureContext((ctx) => {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const delay = i * 0.08;
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(this.volume * 0.65, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.45);
      });
    });
  }

  /**
   * "Lucu Banget!" Bonus Sound (Playful cartoon sparkle)
   */
  public playFunnyBonus() {
    this.ensureContext((ctx) => {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const delay = i * 0.05;
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(this.volume * 0.65, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.35);
      });
    });
  }

  /**
   * Skip Card Sound (Gentle Descending)
   */
  public playSkip() {
    this.ensureContext((ctx) => {
      const now = ctx.currentTime;
      const notes = [659.25, 493.88]; // E5, B4
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const delay = i * 0.1;
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(this.volume * 0.5, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.25);
      });
    });
  }

  /**
   * Turn Switch Cheer
   */
  public playTurnSwitch() {
    this.ensureContext((ctx) => {
      const now = ctx.currentTime;
      const notes = [587.33, 739.99, 880.00]; // D5, F#5, A5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const delay = i * 0.07;
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(this.volume * 0.6, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.35);
      });
    });
  }

  /**
   * Grand Victory Fanfare for Game Result Screen
   */
  public playVictory() {
    this.ensureContext((ctx) => {
      const now = ctx.currentTime;
      const fanfare = [
        { f: 523.25, t: 0, d: 0.12 },
        { f: 523.25, t: 0.12, d: 0.12 },
        { f: 523.25, t: 0.24, d: 0.12 },
        { f: 659.25, t: 0.36, d: 0.25 },
        { f: 783.99, t: 0.65, d: 0.25 },
        { f: 1046.50, t: 0.95, d: 0.6 },
      ];

      fanfare.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        gain.gain.setValueAtTime(this.volume * 0.7, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d);
      });
    });
  }
}

export const sound = new SoundEngine();
