import { useState, useEffect, useCallback } from 'react';
import { geminiService, UserInsight, ContentAnalysis } from '@/lib/gemini';
import { useAuth } from '@/lib/hooks/useAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useMLInsights = () => {
  const { user } = useAuth();
  const [userInsights, setUserInsights] = useState<UserInsight | null>(null);
  const [personalizedMessage, setPersonalizedMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const analyzeUserActivity = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user activity data
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      if (userData) {
        // Prepare activity data for analysis
        const activityData = {
          readingDays: userData.readingDays || 0,
          postsCount: userData.postsCount || 0,
          commentsCount: userData.commentsCount || 0,
          likesGiven: userData.likesGiven || 0,
          bookmarksCount: userData.bookmarksCount || 0,
          lastActiveDate: userData.lastActiveDate,
          recentActivities: userData.recentActivities || [],
          completedReadings: userData.completedReadings || [],
          preferences: userData.preferences || {}
        };

        // Get ML insights
        const insights = await geminiService.analyzeUserBehavior(activityData);
        setUserInsights(insights);

        // Generate personalized message
        const message = await geminiService.generatePersonalizedInsight(activityData);
        setPersonalizedMessage(message);

        // Get reading recommendations
        const readingRecs = await geminiService.generateReadingRecommendations(
          userData,
          { completedReadings: userData.completedReadings || [] }
        );
        setRecommendations(readingRecs);

        // Cache insights in Firestore
        await setDoc(doc(db, 'userInsights', user.uid), {
          insights,
          personalizedMessage: message,
          recommendations: readingRecs,
          lastUpdated: new Date(),
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error analyzing user activity:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const analyzeContent = useCallback(async (content: string, contentType: 'post' | 'comment'): Promise<ContentAnalysis | null> => {
    try {
      return await geminiService.analyzeContent(content, contentType);
    } catch (error) {
      console.error('Error analyzing content:', error);
      return null;
    }
  }, []);

  const moderateContent = useCallback(async (content: string) => {
    try {
      return await geminiService.moderateContent(content);
    } catch (error) {
      console.error('Error moderating content:', error);
      return { isAppropriate: true };
    }
  }, []);

  // Load cached insights on component mount
  useEffect(() => {
    const loadCachedInsights = async () => {
      if (!user) return;

      try {
        const insightsRef = doc(db, 'userInsights', user.uid);
        const insightsSnap = await getDoc(insightsRef);
        
        if (insightsSnap.exists()) {
          const data = insightsSnap.data();
          const lastUpdated = data.lastUpdated?.toDate();
          const now = new Date();
          const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

          // Use cached data if it's less than 24 hours old
          if (hoursSinceUpdate < 24) {
            setUserInsights(data.insights);
            setPersonalizedMessage(data.personalizedMessage);
            setRecommendations(data.recommendations || []);
            return;
          }
        }

        // If no cached data or it's old, analyze fresh data
        analyzeUserActivity();
      } catch (error) {
        console.error('Error loading cached insights:', error);
        analyzeUserActivity();
      }
    };

    loadCachedInsights();
  }, [user, analyzeUserActivity]);

  return {
    userInsights,
    personalizedMessage,
    recommendations,
    loading,
    analyzeUserActivity,
    analyzeContent,
    moderateContent,
    refreshInsights: analyzeUserActivity
  };
};