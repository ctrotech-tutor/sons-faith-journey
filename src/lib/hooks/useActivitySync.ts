
import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';

interface UserActivity {
  type: 'reading_completed' | 'chat_message' | 'community_post' | 'profile_update' | 'login';
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
}

export const useActivitySync = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    readingStreak: 0,
    totalReadingDays: 0,
    messagesCount: 0,
    postsCount: 0,
    lastActiveDate: '',
    readingProgress: []
  });
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserStats({
          readingStreak: data.readingStreak || 0,
          totalReadingDays: Object.values(data.readingProgress || {}).filter(Boolean).length,
          messagesCount: data.messagesCount || 0,
          postsCount: data.postsCount || 0,
          lastActiveDate: data.lastActiveDate || '',
          readingProgress: data.readingProgress || []
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
      const newProgress = completed 
        ? [...new Set([...userStats.readingProgress, day])]
        : userStats.readingProgress.filter(d => d !== day);

      await updateDoc(userRef, {
        readingProgress: newProgress,
        totalReadingDays: newProgress.length,
        readingStreak: calculateStreak(newProgress),
        lastActiveDate: new Date().toISOString()
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

  const calculateStreak = (progressArray: number[]) => {
    if (progressArray.length === 0) return 0;
    
    const sortedDays = progressArray.sort((a, b) => b - a);
    let streak = 1;
    
    for (let i = 1; i < sortedDays.length; i++) {
      if (sortedDays[i-1] - sortedDays[i] === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  return {
    userStats,
    recentActivities,
    logActivity,
    updateReadingProgress
  };
};
