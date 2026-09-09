import { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../utils/sound';

export function useTimer(initialSeconds: number = 10) {
  const [totalDuration, setTotalDuration] = useState<number>(initialSeconds);
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const clearTimerInterval = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback((newDuration?: number) => {
    clearTimerInterval();
    const duration = newDuration !== undefined ? newDuration : totalDuration;
    setTotalDuration(duration);
    setTimeLeft(duration);
    setIsRunning(false);
    setIsFinished(false);
  }, [clearTimerInterval, totalDuration]);

  const startTimer = useCallback(() => {
    if (timeLeft <= 0) {
      resetTimer();
    }
    setIsRunning(true);
    setIsFinished(false);
    sound.playClick();
  }, [timeLeft, resetTimer]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    clearTimerInterval();
    sound.playClick();
  }, [clearTimerInterval]);

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [isRunning, pauseTimer, startTimer]);

  const addExtraTime = useCallback((seconds: number = 5) => {
    setTimeLeft((prev) => {
      const updated = prev + seconds;
      setTotalDuration((oldTot) => Math.max(oldTot, updated));
      return updated;
    });
    setIsFinished(false);
    sound.playClick();
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimerInterval();
            setIsRunning(false);
            setIsFinished(true);
            sound.playTimerEnd();
            return 0;
          }
          const nextVal = prev - 1;
          if (nextVal <= 3) {
            sound.playTimerWarning();
          } else {
            sound.playTimerTick();
          }
          return nextVal;
        });
      }, 1000);
    } else {
      clearTimerInterval();
    }

    return () => clearTimerInterval();
  }, [isRunning, clearTimerInterval]);

  // Progress percentage (0 to 100)
  const progressPercent = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  return {
    timeLeft,
    totalDuration,
    isRunning,
    isFinished,
    progressPercent,
    startTimer,
    pauseTimer,
    toggleTimer,
    resetTimer,
    addExtraTime,
  };
}
