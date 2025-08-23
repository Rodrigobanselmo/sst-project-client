import { useCallback, useEffect, useRef, useState } from 'react';

interface UseActiveTimeTrackerOptions {
  /**
   * Time in milliseconds after which user is considered inactive
   * @default 30000 (30 seconds)
   */
  inactivityThreshold?: number;

  /**
   * Whether to start tracking immediately
   * @default true
   */
  autoStart?: boolean;

  /**
   * Events that indicate user activity
   * @default ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
   */
  activityEvents?: string[];
}

interface UseActiveTimeTrackerReturn {
  /** Total active time in milliseconds */
  activeTime: number;
  /** Whether the tracker is currently running */
  isTracking: boolean;
  /** Whether the user is currently considered active */
  isActive: boolean;
  /** Start tracking time */
  start: () => void;
  /** Stop tracking time */
  stop: () => void;
  /** Reset the timer to 0 */
  reset: () => void;
  /** Get the current active time in seconds */
  getActiveTimeInSeconds: () => number;
}

/**
 * Hook for tracking active time spent by a user, excluding periods of inactivity.
 *
 * This hook monitors user activity through various events (mouse, keyboard, touch, scroll)
 * and only counts time when the user is actively interacting with the page.
 *
 * @param options Configuration options for the time tracker
 * @returns Object with time tracking state and controls
 */
export const useActiveTimeTracker = (
  options: UseActiveTimeTrackerOptions = {},
): UseActiveTimeTrackerReturn => {
  const {
    inactivityThreshold = 30000, // 30 seconds
    autoStart = true,
    activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ],
  } = options;

  const [activeTime, setActiveTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Refs to store values that don't trigger re-renders
  const startTimeRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update active time when user becomes inactive
  const updateActiveTime = useCallback(() => {
    if (startTimeRef.current && isActive) {
      const now = Date.now();
      const sessionTime = now - startTimeRef.current;
      setActiveTime((prev) => prev + sessionTime);
      startTimeRef.current = now;
    }
  }, [isActive]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;

    // If user was inactive, restart the active session
    if (!isActive && isTracking) {
      setIsActive(true);
      startTimeRef.current = now;
    }

    // Clear existing inactivity timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    // Set new inactivity timeout
    inactivityTimeoutRef.current = setTimeout(() => {
      if (isTracking) {
        updateActiveTime();
        setIsActive(false);
        startTimeRef.current = null;
      }
    }, inactivityThreshold);
  }, [isActive, isTracking, inactivityThreshold, updateActiveTime]);

  // Start tracking
  const start = useCallback(() => {
    if (!isTracking) {
      setIsTracking(true);
      setIsActive(true);
      startTimeRef.current = Date.now();
      lastActivityRef.current = Date.now();

      // Trigger initial activity to set up inactivity timeout
      handleActivity();
    }
  }, [isTracking, handleActivity]);

  // Stop tracking
  const stop = useCallback(() => {
    if (isTracking) {
      updateActiveTime();
      setIsTracking(false);
      setIsActive(false);
      startTimeRef.current = null;

      // Clear timeouts
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
    }
  }, [isTracking, updateActiveTime]);

  // Reset timer
  const reset = useCallback(() => {
    setActiveTime(0);
    if (isTracking) {
      startTimeRef.current = Date.now();
      lastActivityRef.current = Date.now();
    }
  }, [isTracking]);

  // Get active time in seconds
  const getActiveTimeInSeconds = useCallback(() => {
    let currentActiveTime = activeTime;

    // Add current session time if actively tracking
    if (isTracking && isActive && startTimeRef.current) {
      currentActiveTime += Date.now() - startTimeRef.current;
    }

    return Math.floor(currentActiveTime / 1000);
  }, [activeTime, isTracking, isActive]);

  // Set up event listeners
  useEffect(() => {
    if (isTracking) {
      activityEvents.forEach((event) => {
        document.addEventListener(event, handleActivity, { passive: true });
      });

      // Also listen for visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          updateActiveTime();
          setIsActive(false);
          startTimeRef.current = null;
        } else {
          handleActivity();
        }
      });

      return () => {
        activityEvents.forEach((event) => {
          document.removeEventListener(event, handleActivity);
        });
        document.removeEventListener('visibilitychange', handleActivity);
      };
    }
  }, [isTracking, activityEvents, handleActivity, updateActiveTime]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !isTracking) {
      start();
    }
  }, [autoStart, isTracking, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

  return {
    activeTime,
    isTracking,
    isActive,
    start,
    stop,
    reset,
    getActiveTimeInSeconds,
  };
};
