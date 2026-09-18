import { useEffect, useRef } from 'react';

interface AutoLockOptions {
  isAuthenticated: boolean;
  onLock: () => void;
  timeoutMinutes?: number;
}

const INACTIVITY_TIMEOUT_DEFAULT = 15; // 15 minutes default timeout

export function useAutoLock({ isAuthenticated, onLock, timeoutMinutes = INACTIVITY_TIMEOUT_DEFAULT }: AutoLockOptions) {
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const onLockRef = useRef(onLock);
  onLockRef.current = onLock;

  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return;

    const recordActivity = () => {
      localStorage.setItem('asta_last_activity_time', Date.now().toString());
    };

    // Initialize activity timestamp if not present
    if (!localStorage.getItem('asta_last_activity_time')) {
      recordActivity();
    }

    const checkLockStatus = () => {
      const lastActiveRaw = localStorage.getItem('asta_last_activity_time');
      if (!lastActiveRaw) return;

      const lastActive = parseInt(lastActiveRaw, 10);
      if (isNaN(lastActive)) return;

      const elapsed = Date.now() - lastActive;
      if (elapsed >= timeoutMs) {
        sessionStorage.setItem('asta_autolock_notice', 'true');
        onLockRef.current();
      }
    };

    // Throttled activity event handler
    let lastThrottle = 0;
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastThrottle > 5000) { // Update at most once every 5 seconds
        lastThrottle = now;
        recordActivity();
      }
    };

    // Events to track user presence and activity
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Check on visibility change (e.g. user returns to app after leaving screen/tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkLockStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic heartbeat check every 15 seconds
    const interval = setInterval(checkLockStatus, 15000);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [isAuthenticated, timeoutMs]);
}
