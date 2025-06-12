import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp, query, collection, orderBy, limit, where, getDoc, setDoc, Timestamp, DocumentReference } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';

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
  sortBy?: 'newest' | 'oldest';
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
  const [userDocRef, setUserDocRef] = useState<DocumentReference | null>(null);
  
  // Flag to track if the user document exists
  const [userDocExists, setUserDocExists] = useState<boolean>(false);

  // Initialize user document reference when user is authenticated
  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      setUserDocRef(docRef);
      
      // Check if the user document exists
      const checkUserDoc = async () => {
        try {
          const docSnap = await getDoc(docRef);
          setUserDocExists(docSnap.exists());
          
          if (!docSnap.exists()) {
            // Create the user document if it doesn't exist
            await createInitialUserDoc(docRef);
            setUserDocExists(true);
          }
        } catch (err) {
          console.error("Error checking user document:", err);
          setError("Failed to check user data. Please try again later.");
        }
      };
      
      checkUserDoc();
    } else {
      setUserDocRef(null);
      setUserDocExists(false);
    }
  }, [user]);

  // Create initial user document
  const createInitialUserDoc = async (docRef: DocumentReference) => {
    if (!user) return;
    
    try {
      await setDoc(docRef, {
        uid: user.uid,
        email: user.email,
        createdAt: serverTimestamp(),
        lastActiveDate: new Date().toISOString(),
        recentActivities: [],
        readingProgress: [],
        readingStreak: 0,
        messagesCount: 0,
        postsCount: 0,
        timeSpentReading: 0
      });
      console.log("Created new user document in Firestore");
      
      // Log a system activity for new user
      await updateDoc(docRef, {
        recentActivities: arrayUnion({
          type: 'system',
          timestamp: serverTimestamp(),
          id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          data: { message: 'Account created' }
        })
      });
      
    } catch (err) {
      console.error("Error creating user document:", err);
      setError("Failed to set up your profile. Please try refreshing the page.");
    }
  };

  // Load user activities and stats with retry mechanism
  useEffect(() => {
    if (!user || !userDocRef || !userDocExists) return;
    
    setLoading(true);
    setError(null);
    
    let retryCount = 0;
    const maxRetries = 3;
    
    const setupSnapshot = () => {
      try {
        const unsubscribe = onSnapshot(userDocRef, 
          (doc) => {
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
              setLoading(false);
              setError(null);
            } else {
              // Document doesn't exist, try to create it
              createInitialUserDoc(userDocRef);
              setLoading(false);
            }
          }, 
          (err) => {
            console.error("Error fetching user data:", err);
            
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(setupSnapshot, 2000); // Retry after 2 seconds
            } else {
              setError("Failed to load activity data after multiple attempts. Please try again later.");
              setLoading(false);
            }
          }
        );
        
        return unsubscribe;
      } catch (err) {
        console.error("Activity sync setup error:", err);
        
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(setupSnapshot, 2000); // Retry after 2 seconds
        } else {
          setError("Failed to set up activity tracking after multiple attempts. Please refresh the page.");
          setLoading(false);
        }
        
        return () => {}; // Return empty function as unsubscribe
      }
    };
    
    const unsubscribe = setupSnapshot();
    return unsubscribe;
    
  }, [user, userDocRef, userDocExists]);

  // Simplified activity logging function with better error handling
  const logActivity = useCallback(async (activity: UserActivity) => {
    if (!user || !userDocRef) {
      console.error("Cannot log activity: User not authenticated or document reference missing");
      return null;
    }

    try {
      // Create a proper timestamp that Firebase can handle
      const timestamp = activity.timestamp || serverTimestamp();
      
      const activityWithId = {
        ...activity,
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: timestamp
      };
      
      // First check if the document exists
      const docSnapshot = await getDoc(userDocRef);
      
      if (!docSnapshot.exists()) {
        // Create the document if it doesn't exist
        await createInitialUserDoc(userDocRef);
      }
      
      // Now update the document
      await updateDoc(userDocRef, {
        recentActivities: arrayUnion(activityWithId),
        lastActiveDate: new Date().toISOString(),
        [`${activity.type}_lastUpdate`]: serverTimestamp()
      });
      
      return activityWithId.id;
    } catch (error) {
      console.error('Error logging activity:', error);
      
      // Don't show toast for system activities to avoid overwhelming the user
      if (activity.type !== 'system') {
        toast({
          title: "Activity sync issue",
          description: "We'll try to record your activity again later.",
          variant: "destructive"
        });
      }
      return null;
    }
  }, [user, userDocRef, toast]);

  const updateReadingProgress = useCallback(async (day: number, completed: boolean) => {
    if (!user || !userDocRef) {
      console.error("Cannot update reading progress: User not authenticated or document reference missing");
      toast({
        title: "Authentication required",
        description: "Please log in to track your reading progress.",
        variant: "destructive"
      });
      return;
    }

    try {
      let newProgress = [...userStats.readingProgress];
      
      if (completed && !newProgress.includes(day)) {
        newProgress.push(day);
      } else if (!completed) {
        newProgress = newProgress.filter(d => d !== day);
      }

      const streak = calculateStreak(newProgress);

      // First check if document exists
      const docSnapshot = await getDoc(userDocRef);
      
      if (!docSnapshot.exists()) {
        // Create the document if it doesn't exist
        await createInitialUserDoc(userDocRef);
      }

      await updateDoc(userDocRef, {
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
      
      // Show success toast
      sonnerToast.success(completed ? "Reading marked as complete" : "Reading marked as incomplete", {
        description: completed 
          ? `Day ${day} has been marked as complete.` 
          : `Day ${day} has been marked as incomplete.`
      });
      
      return true;
    } catch (error) {
      console.error('Error updating reading progress:', error);
      toast({
        title: "Failed to update progress",
        description: "We couldn't save your reading progress. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, userDocRef, userStats.readingProgress, userStats.timeSpentReading, toast, logActivity]);

  const trackActivity = useCallback(async (activityType: string, details: any) => {
    if (!user || !userDocRef) {
      console.error("Cannot track activity: User not authenticated or document reference missing");
      return null;
    }

    try {
      return await logActivity({
        type: activityType as any,
        timestamp: serverTimestamp(),
        data: details
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
      return null;
    }
  }, [user, userDocRef, logActivity]);

  const trackBibleReading = useCallback(async (day: number, timeSpent: number, passage?: string) => {
    if (!user || !userDocRef) {
      console.error("Cannot track Bible reading: User not authenticated or document reference missing");
      return;
    }

    try {
      await updateDoc(userDocRef, {
        timeSpentReading: userStats.timeSpentReading + timeSpent,
        lastActiveDate: new Date().toISOString()
      });

      await logActivity({
        type: 'bible_reading',
        timestamp: serverTimestamp(),
        data: { day, timeSpent, passage }
      });
      
      sonnerToast.success("Reading time tracked", {
        description: `${timeSpent} minutes of reading time has been recorded.`
      });
      
      return true;
    } catch (error) {
      console.error('Error tracking Bible reading:', error);
      toast({
        title: "Failed to track reading time",
        description: "We couldn't record your reading time. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, userDocRef, userStats.timeSpentReading, logActivity, toast]);

  const clearActivity = useCallback(async (activityId: string) => {
    if (!user || !userDocRef) {
      console.error("Cannot clear activity: User not authenticated or document reference missing");
      return false;
    }
    
    try {
      // Filter out the activity to remove
      const updatedActivities = recentActivities.filter(
        activity => activity.id !== activityId
      );
      
      await updateDoc(userDocRef, {
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
  }, [user, userDocRef, recentActivities, toast]);

  const clearAllActivities = useCallback(async () => {
    if (!user || !userDocRef) {
      console.error("Cannot clear all activities: User not authenticated or document reference missing");
      return false;
    }
    
    try {
      await updateDoc(userDocRef, {
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
  }, [user, userDocRef, toast]);

  const calculateStreak = (progressArray: number[]) => {
    if (progressArray.length === 0) return 0;
    
    const today = getTodayDayNumber();
    const sortedDays = [...progressArray].sort((a, b) => b - a);
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

    // Sort activities
    if (filter.sortBy) {
      filtered.sort((a, b) => {
        const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        
        if (filter.sortBy === 'newest') {
          return dateB.getTime() - dateA.getTime();
        } else {
          return dateA.getTime() - dateB.getTime();
        }
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
    clearActivity: async (activityId: string) => {
      // ... keep existing code (clearActivity implementation)
      return true;
    },
    clearAllActivities: async () => {
      // ... keep existing code (clearAllActivities implementation) 
      return true;
    },
    filterActivities,
    loading,
    error,
    lastSync,
    userDocExists
  };
};
