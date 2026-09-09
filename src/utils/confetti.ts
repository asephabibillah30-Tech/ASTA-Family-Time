import confetti from 'canvas-confetti';

export function fireBurstConfetti() {
  try {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#FF6B6B', '#4ECDC4', '#FFD166', '#9B5DE5', '#06D6A0', '#FF85A1']
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  } catch {
    // Graceful fallback
  }
}

export function fireVictoryShower() {
  try {
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;
    const colors = ['#FFD166', '#FF6B6B', '#4ECDC4', '#9B5DE5', '#06D6A0', '#FF85A1'];

    const interval: number = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors
      });
      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors
      });
    }, 250);
  } catch {
    // Graceful fallback
  }
}

export function fireSmallPop(x: number = 0.5, y: number = 0.5) {
  try {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x, y },
      colors: ['#FF6B6B', '#FFD166', '#4ECDC4', '#FF85A1'],
      scalar: 0.9,
      disableForReducedMotion: true
    });
  } catch {
    // Graceful fallback
  }
}
