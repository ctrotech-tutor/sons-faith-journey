
import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp, query, collection, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/use-toast';

export interface UserActivity {
  type: 'reading_completed' | 'chat_message' | 'community_post' | 'profile_update' | 'login' | 'bible_reading' | 'system';
  timestamp: any;
  id?: string;
  data?: any;
}

export interface UserStats {
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

export interface ActivityFilter {
  type?: string | null;
  timeRange?: 'today' | 'week' | 'month' | 'all';
  searchTerm?: string;
}

export const useActivitySync = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track sync status
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Load user activities and stats
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
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
          
          // Process and sort activities
          const activities = data.recentActivities || [];
          const processedActivities = activities.map((activity: UserActivity, index: number) => ({
            ...activity,
            id: activity.id || `activity-${index}-${Date.now()}`
          })).sort((a: UserActivity, b: UserActivity) => {
            const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
            const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
            return dateB.getTime() - dateA.getTime();
          });
          
          setRecentActivities(processedActivities);
          setLastSync(new Date());
        }
        setLoading(false);
      }, (err) => {
        console.error("Error fetching user data:", err);
        setError("Failed to load activity data. Please try again later.");
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      console.error("Activity sync setup error:", err);
      setError("Failed to set up activity tracking. Please refresh the page.");
      setLoading(false);
    }
  }, [user]);

  const logActivity = useCallback(async (activity: UserActivity) => {
    if (!user) return;

    try {
      const activityWithId = {
        ...activity,
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: activity.timestamp || serverTimestamp()
      };
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        recentActivities: arrayUnion(activityWithId),
        lastActiveDate: new Date().toISOString(),
        [`${activity.type}_lastUpdate`]: serverTimestamp()
      });
      
      return activityWithId.id;
    } catch (error) {
      console.error('Error logging activity:', error);
      toast({
        title: "Failed to log activity",
        description: "Your action was completed, but we couldn't record it in your activity log.",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast]);

  const updateReadingProgress = useCallback(async (day: number, completed: boolean) => {
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
      toast({
        title: "Failed to update progress",
        description: "We couldn't save your reading progress. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, userStats.readingProgress, userStats.timeSpentReading, toast, logActivity]);

  const trackActivity = useCallback(async (activityType: string, details: any) => {
    if (!user) return;

    try {
      return await logActivity({
        type: activityType as any,
        timestamp: serverTimestamp(),
        data: details
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }, [user, logActivity]);

  const trackBibleReading = useCallback(async (day: number, timeSpent: number, passage?: string) => {
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
        data: { day, timeSpent, passage }
      });
    } catch (error) {
      console.error('Error tracking Bible reading:', error);
    }
  }, [user, userStats.timeSpentReading, logActivity]);

  const clearActivity = useCallback(async (activityId: string) => {
    if (!user) return;
    
    try {
      // Filter out the activity to remove
      const updatedActivities = recentActivities.filter(
        activity => activity.id !== activityId
      );
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        recentActivities: updatedActivities
      });
      
      toast({
        title: "Activity removed",
        description: "The activity has been removed from your history.",
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing activity:', error);
      toast({
        title: "Failed to remove activity",
        description: "We couldn't remove this activity. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, recentActivities, toast]);
  
  const clearAllActivities = useCallback(async () => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        recentActivities: []
      });
      
      toast({
        title: "Activity history cleared",
        description: "Your activity history has been successfully cleared.",
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing all activities:', error);
      toast({
        title: "Failed to clear history",
        description: "We couldn't clear your activity history. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

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

  const getTodayDayNumber = useCallback(() => {
    const startDate = new Date('2025-06-01');
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(diffDays, 90));
  }, []);

  const filterActivities = useCallback((activities: UserActivity[], filter: ActivityFilter) => {
    if (!activities) return [];
    
    let filtered = [...activities];

    // Filter by type
    if (filter.type && filter.type !== 'all') {
      filtered = filtered.filter(activity => activity.type === filter.type);
    }

    // Filter by search term
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.type.toLowerCase().includes(searchLower) ||
        JSON.stringify(activity.data || {}).toLowerCase().includes(searchLower)
      );
    }

    // Filter by time range
    if (filter.timeRange && filter.timeRange !== 'all') {
      const now = new Date();
      let timeLimit: Date;

      switch (filter.timeRange) {
        case 'today':
          timeLimit = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          timeLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          timeLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          timeLimit = new Date(0);
      }

      filtered = filtered.filter(activity => {
        const activityDate = activity.timestamp?.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp);
        return activityDate >= timeLimit;
      });
    }

    return filtered;
  }, []);

  return {
    userStats,
    recentActivities,
    logActivity,
    updateReadingProgress,
    getTodayDayNumber,
    trackActivity,
    trackBibleReading,
    clearActivity,
    clearAllActivities,
    filterActivities,
    loading,
    error,
    lastSync
  };
};
