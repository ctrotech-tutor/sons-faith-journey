
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getChallengeDay } from '@/lib/getChallengeDay';

interface UserStats {
  totalReadingDays: number;
  readingStreak: number;
  messagesCount: number;
  postsCount: number;
  timeSpentReading: number;
  readingProgress: number[];
}

interface Activity {
  type: string;
  data?: any;
  timestamp: any;
}

const defaultStats: UserStats = {
  totalReadingDays: 0,
  readingStreak: 0,
  messagesCount: 0,
  postsCount: 0,
  timeSpentReading: 0,
  readingProgress: [],
};

export const useActivitySync = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>(defaultStats);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserStats();
      loadRecentActivities();
    } else {
      setUserStats(defaultStats);
      setRecentActivities([]);
      setLoading(false);
    }
  }, [user]);

  const loadUserStats = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserStats({
          totalReadingDays: data.totalReadingDays || 0,
          readingStreak: data.readingStreak || 0,
          messagesCount: data.messagesCount || 0,
          postsCount: data.postsCount || 0,
          timeSpentReading: data.timeSpentReading || 0,
          readingProgress: data.readingProgress || [],
        });
      } else {
        console.log("No such document!");
        setUserStats(defaultStats);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivities = () => {
    if (!user) return;

    try {
      const activitiesRef = collection(db, 'users', user.uid, 'activities');
      const q = query(activitiesRef, orderBy('timestamp', 'desc'), limit(10));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const activities: Activity[] = [];
        snapshot.forEach((doc) => {
          activities.push({
            type: doc.data().type || 'activity',
            data: doc.data().data,
            timestamp: doc.data().timestamp,
          });
        });
        setRecentActivities(activities);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error loading recent activities:", error);
      setRecentActivities([]);
    }
  };

  const updateReadingProgress = useCallback(async (day: number, completed: boolean) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      let currentProgress = userDoc.exists() && userDoc.data().readingProgress ? userDoc.data().readingProgress : [];

      if (completed) {
        currentProgress = Array.isArray(currentProgress) ? [...currentProgress, day] : [day];
        await updateDoc(userRef, {
          readingProgress: currentProgress,
          totalReadingDays: increment(1),
          readingStreak: increment(1),
        });
        setUserStats(prevState => ({
          ...prevState,
          totalReadingDays: prevState.totalReadingDays + 1,
          readingStreak: prevState.readingStreak + 1,
          readingProgress: currentProgress,
        }));
      } else {
        currentProgress = Array.isArray(currentProgress) ? currentProgress.filter((d: number) => d !== day) : [];
        await updateDoc(userRef, {
          readingProgress: currentProgress,
          totalReadingDays: increment(-1),
          readingStreak: 0,
        });
        setUserStats(prevState => ({
          ...prevState,
          totalReadingDays: prevState.totalReadingDays - 1,
          readingStreak: 0,
          readingProgress: currentProgress,
        }));
      }
    } catch (error) {
      console.error("Error updating reading progress:", error);
    }
  }, [user]);

  const getTodayDayNumber = useCallback(() => {
    return getChallengeDay();
  }, []);

  const trackActivity = useCallback(async (activityType: string, details: any) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [`activity.${Date.now()}`]: {
          type: activityType,
          details,
          timestamp: new Date().toISOString()
        }
      });
      console.log(`Tracked activity: ${activityType}`);
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }, [user]);

  const trackBibleReading = useCallback(async (day: number, timeSpent: number) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [`bibleReading.day${day}`]: {
          timeSpent,
          timestamp: new Date().toISOString()
        },
        totalBibleReadingTime: increment(timeSpent)
      });

      console.log(`Tracked Bible reading for day ${day}: ${timeSpent} seconds`);
    } catch (error) {
      console.error('Error tracking Bible reading:', error);
    }
  }, [user]);

  return {
    userStats,
    recentActivities,
    updateReadingProgress,
    getTodayDayNumber,
    trackActivity,
    trackBibleReading,
    loading
  };
};
