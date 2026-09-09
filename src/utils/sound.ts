/**
 * Universal Mobile-Ready Audio Engine
 * Uses in-memory synthesized WAV HTML5 audio elements for 100% reliable mobile speaker playback.
 */

import {
  generateClickWav,
  generateFlipWav,
  generateShuffleWav,
  generateTickWav,
  generateWarningWav,
  generateTimerEndWav,
  generateSuccessWav,
  generateFunnyBonusWav,
  generateSkipWav,
  generateTurnWav,
  generateVictoryWav,
} from './wavGenerator';

class SoundEngine {
  private enabled: boolean = true;
  private volume: number = 0.9;
  private audioCache: Map<string, string> = new Map();
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.preloadAudio();
      this.attachUnlockListeners();
    }
  }

  private preloadAudio() {
    try {
      this.audioCache.set('click', generateClickWav());
      this.audioCache.set('flip', generateFlipWav());
      this.audioCache.set('shuffle', generateShuffleWav());
      this.audioCache.set('tick', generateTickWav());
      this.audioCache.set('warning', generateWarningWav());
      this.audioCache.set('timerEnd', generateTimerEndWav());
      this.audioCache.set('success', generateSuccessWav());
      this.audioCache.set('bonus', generateFunnyBonusWav());
      this.audioCache.set('skip', generateSkipWav());
      this.audioCache.set('turn', generateTurnWav());
      this.audioCache.set('victory', generateVictoryWav());
    } catch {
      // Ignore
    }
  }

  public init() {
    this.unlock();
  }

  public unlock() {
    if (this.isUnlocked || typeof window === 'undefined') return;
    try {
      const clickUrl = this.audioCache.get('click');
      if (clickUrl) {
        const audio = new Audio(clickUrl);
        audio.volume = 0.01;
        audio.play().then(() => {
          this.isUnlocked = true;
        }).catch(() => {});
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
      window.addEventListener(evt, handleTouch, { passive: true, once: true });
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

  private playSound(key: string, volMultiplier: number = 1.0) {
    if (!this.enabled || typeof window === 'undefined') return;

    try {
      let url = this.audioCache.get(key);
      if (!url) {
        this.preloadAudio();
        url = this.audioCache.get(key);
      }

      if (url) {
        const audio = new Audio(url);
        audio.volume = Math.min(1, this.volume * volMultiplier);
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay restriction fallback
          });
        }
      }
    } catch {
      // Ignore
    }
  }

  public playClick() {
    this.playSound('click', 0.8);
  }

  public playCardFlip() {
    this.playSound('flip', 0.9);
  }

  public playCardShuffle() {
    this.playSound('shuffle', 0.85);
  }

  public playTimerTick() {
    this.playSound('tick', 0.6);
  }

  public playTimerWarning() {
    this.playSound('warning', 0.9);
  }

  public playTimerEnd() {
    this.playSound('timerEnd', 1.0);
  }

  public playSuccess() {
    this.playSound('success', 1.0);
  }

  public playFunnyBonus() {
    this.playSound('bonus', 1.0);
  }

  public playSkip() {
    this.playSound('skip', 0.8);
  }

  public playTurnSwitch() {
    this.playSound('turn', 0.95);
  }

  public playVictory() {
    this.playSound('victory', 1.0);
  }
}

export const sound = new SoundEngine();
