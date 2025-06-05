
import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';

interface UserActivity {
  type: 'reading_completed' | 'chat_message' | 'community_post' | 'profile_update' | 'login' | 'bible_reading';
  timestamp: any;
  data?: any;
}

interface UserStats {
  readingStreak: number;
  totalReadingDays: number;
  messagesCount: number;
  postsCount: number;
  lastActiveDate: string;
  readingProgress: number[];
  timeSpentReading: number;
  currentPage?: string;
  sessionStart?: any;
}

export const useActivitySync = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    readingStreak: 0,
    totalReadingDays: 0,
    messagesCount: 0,
    postsCount: 0,
    lastActiveDate: '',
    readingProgress: [],
    timeSpentReading: 0
  });
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        
        // Ensure readingProgress is always an array
        let readingProgress = data.readingProgress || [];
        if (!Array.isArray(readingProgress)) {
          readingProgress = [];
        }
        
        setUserStats({
          readingStreak: data.readingStreak || 0,
          totalReadingDays: readingProgress.length,
          messagesCount: data.messagesCount || 0,
          postsCount: data.postsCount || 0,
          lastActiveDate: data.lastActiveDate || '',
          readingProgress: readingProgress,
          timeSpentReading: data.timeSpentReading || 0,
          currentPage: data.currentPage,
          sessionStart: data.sessionStart
        });
        setRecentActivities(data.recentActivities || []);
      }
    });

    return unsubscribe;
  }, [user]);

  const logActivity = async (activity: UserActivity) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        recentActivities: arrayUnion({
          ...activity,
          timestamp: serverTimestamp()
        }),
        lastActiveDate: new Date().toISOString(),
        [`${activity.type}_lastUpdate`]: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const updateReadingProgress = async (day: number, completed: boolean) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      let newProgress = [...userStats.readingProgress];
      
      if (completed && !newProgress.includes(day)) {
        newProgress.push(day);
      } else if (!completed) {
        newProgress = newProgress.filter(d => d !== day);
      }

      const streak = calculateStreak(newProgress);

      await updateDoc(userRef, {
        readingProgress: newProgress,
        totalReadingDays: newProgress.length,
        readingStreak: streak,
        lastActiveDate: new Date().toISOString(),
        timeSpentReading: userStats.timeSpentReading + (completed ? 15 : 0)
      });

      if (completed) {
        await logActivity({
          type: 'reading_completed',
          timestamp: serverTimestamp(),
          data: { day }
        });
      }
    } catch (error) {
      console.error('Error updating reading progress:', error);
    }
  };

  const trackActivity = async (activityType: string, details: any) => {
    if (!user) return;

    try {
      await logActivity({
        type: activityType as any,
        timestamp: serverTimestamp(),
        data: details
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  const trackBibleReading = async (day: number, timeSpent: number) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        timeSpentReading: userStats.timeSpentReading + timeSpent,
        lastActiveDate: new Date().toISOString()
      });

      await logActivity({
        type: 'bible_reading',
        timestamp: serverTimestamp(),
        data: { day, timeSpent }
      });
    } catch (error) {
      console.error('Error tracking Bible reading:', error);
    }
  };

  const calculateStreak = (progressArray: number[]) => {
    if (progressArray.length === 0) return 0;
    
    const today = getTodayDayNumber();
    const sortedDays = progressArray.sort((a, b) => b - a);
    let streak = 0;
    
    // Check from today backwards
    for (let i = today; i >= 1; i--) {
      if (sortedDays.includes(i)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getTodayDayNumber = () => {
    const startDate = new Date('2025-06-01');
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(diffDays, 90));
  };

  return {
    userStats,
    recentActivities,
    logActivity,
    updateReadingProgress,
    getTodayDayNumber,
    trackActivity,
    trackBibleReading,
    loading
  };
};
