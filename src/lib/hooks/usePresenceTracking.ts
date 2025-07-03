import { useEffect, useRef, useCallback } from 'react';
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  updateDoc,
  arrayUnion,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';

interface PresenceData {
  online: boolean;
  lastSeen: any;
  currentPage: string;
  sessionStart: any;
  deviceInfo: {
    userAgent: string;
    platform: string;
    language: string;
    screen: string;
  };
  location?: {
    country?: string;
    city?: string;
    timezone: string;
  };
}

interface ActivityData {
  type: 'page_view' | 'interaction' | 'reading' | 'posting' | 'messaging';
  timestamp: any;
  details: any;
  sessionId: string;
  duration?: number;
}

export const usePresenceTracking = () => {
  const { user } = useAuth();
  const sessionIdRef = useRef<string>('');
  const pageStartTimeRef = useRef<number>(0);
  const lastActivityRef = useRef<number>(Date.now());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get device info
  const getDeviceInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: `${screen.width}x${screen.height}`,
    };
  }, []);

  // Get location info
  const getLocationInfo = useCallback(async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        country: data.country_name,
        city: data.city,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    } catch (error) {
      return {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
  }, []);

  // Update presence
  const updatePresence = useCallback(async (isOnline: boolean, currentPage?: string) => {
    if (!user) return;

    try {
      const presenceRef = doc(db, 'presence', user.uid);
      const userRef = doc(db, 'users', user.uid);
      const locationInfo = await getLocationInfo();

      const presenceData: PresenceData = {
        online: isOnline,
        lastSeen: serverTimestamp(),
        currentPage: currentPage || window.location.pathname,
        sessionStart: sessionIdRef.current ? serverTimestamp() : null,
        deviceInfo: getDeviceInfo(),
        location: locationInfo,
      };

      await setDoc(presenceRef, presenceData, { merge: true });

      // Update user document
      await updateDoc(userRef, {
        lastActiveDate: serverTimestamp(),
        currentPage: currentPage || window.location.pathname,
        totalSessions: increment(1),
      });

      // Note: onDisconnect requires Firebase Realtime Database
      // For now, we'll rely on heartbeat and visibility change for offline detection
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [user, getDeviceInfo, getLocationInfo]);

  // Track activity
  const trackActivity = useCallback(async (activityData: Omit<ActivityData, 'timestamp' | 'sessionId'>) => {
    if (!user || !sessionIdRef.current) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const activity: ActivityData = {
        ...activityData,
        timestamp: serverTimestamp(),
        sessionId: sessionIdRef.current,
      };

      await updateDoc(userRef, {
        recentActivities: arrayUnion(activity),
        lastActiveDate: serverTimestamp(),
        [`${activityData.type}_count`]: increment(1),
      });

      lastActivityRef.current = Date.now();
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }, [user]);

  // Track page view
  const trackPageView = useCallback((page: string) => {
    if (pageStartTimeRef.current > 0) {
      const duration = Date.now() - pageStartTimeRef.current;
      trackActivity({
        type: 'page_view',
        details: { 
          page: window.location.pathname, 
          duration: Math.round(duration / 1000) // in seconds
        },
      });
    }
    
    pageStartTimeRef.current = Date.now();
    updatePresence(true, page);
    
    trackActivity({
      type: 'page_view',
      details: { page, referrer: document.referrer },
    });
  }, [trackActivity, updatePresence]);

  // Track interaction
  const trackInteraction = useCallback((action: string, details: any = {}) => {
    trackActivity({
      type: 'interaction',
      details: { action, ...details, page: window.location.pathname },
    });
  }, [trackActivity]);

  // Track reading activity
  const trackReading = useCallback((passage: string, timeSpent: number) => {
    trackActivity({
      type: 'reading',
      details: { passage, timeSpent },
      duration: timeSpent,
    });
  }, [trackActivity]);

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      if (timeSinceLastActivity < 30000) { // 30 seconds
        updatePresence(true);
      } else {
        updatePresence(false);
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
      }
    }, 10000); // Every 10 seconds
  }, [updatePresence]);

  // Handle activity detection
  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    // Mark as inactive after 5 minutes of no activity
    activityTimeoutRef.current = setTimeout(() => {
      updatePresence(false);
    }, 300000);

    // Restart heartbeat if it was stopped
    if (!heartbeatIntervalRef.current) {
      startHeartbeat();
    }
  }, [updatePresence, startHeartbeat]);

  // Initialize presence tracking
  useEffect(() => {
    if (!user) return;

    sessionIdRef.current = generateSessionId();
    
    // Initial presence update
    updatePresence(true);
    startHeartbeat();
    
    // Track page view
    trackPageView(window.location.pathname);

    // Activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence(false);
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
      } else {
        updatePresence(true);
        startHeartbeat();
        handleActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      updatePresence(false);
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }

      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, generateSessionId, updatePresence, startHeartbeat, handleActivity, trackPageView]);

  // Listen for route changes
  useEffect(() => {
    trackPageView(window.location.pathname);
  }, [window.location.pathname, trackPageView]);

  return {
    trackActivity,
    trackInteraction,
    trackReading,
    trackPageView,
    updatePresence,
  };
};