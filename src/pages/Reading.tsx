import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useActivitySync } from '@/lib/hooks/useActivitySync'
import { motion } from 'framer-motion'
import { readingPlan, getMonthData, getThemeForMonth } from '@/data/readingPlan'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Calendar, Target, TrendingUp, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { toast as sonnerToast } from 'sonner'
import MonthNavigation from '@/components/reading/MonthNavigation'
import ReadingDayCard from '@/components/reading/ReadingDayCard'
import Layout from '@/components/Layout'
import { useNavigate } from 'react-router-dom'

export default function ReadingPage() {
  const { user } = useAuth();
  const { userStats, updateReadingProgress, getTodayDayNumber, loading, error, trackActivity } = useActivitySync();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [processingDay, setProcessingDay] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Track page view
  useEffect(() => {
    if (user) {
      // Use a delayed tracking to ensure user document exists
      const timer = setTimeout(() => {
        trackActivity('system', { 
          message: 'Viewed reading plan',
          pageType: 'reading'
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, trackActivity]);

  // Show error toast when there's an error with activity data
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading activities",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const monthData = getMonthData(currentMonth);
  const todayDay = getTodayDayNumber();

  // Transform reading plan data to match ReadingDayCard props
  const transformedDayData = monthData.map(day => ({
    day: day.day,
    title: `Day ${day.day} - ${day.theme}`,
    description: `Continue your journey through ${day.passages.join(', ')}. Today's focus: ${day.theme}`,
    passages: day.passages,
    theme: day.theme
  }));

  // Function to check if a day is locked
  const isDayLocked = (dayNumber: number) => {
    return dayNumber > todayDay;
  };
  
  // Handle completion toggle with enhanced error handling and retry logic
  const handleToggleComplete = async (day: number, completed: boolean) => {
    setProcessingDay(day);
    try {
      const success = await updateReadingProgress(day, completed);
      
      if (!success) {
        // Show a message that we'll retry automatically
        sonnerToast.warning("Sync issue", {
          description: "We're having trouble syncing. We'll try again shortly."
        });
        
        // Retry once after a short delay
        setTimeout(async () => {
          try {
            await updateReadingProgress(day, completed);
          } catch (err) {
            console.error("Error in retry attempt:", err);
          } finally {
            setProcessingDay(null);
          }
        }, 2000);
      } else {
        setProcessingDay(null);
      }
    } catch (err) {
      console.error("Error toggling completion:", err);
      toast({
        title: "Error updating progress",
        description: "There was a problem updating your reading progress. Please try again.",
        variant: "destructive"
      });
      setProcessingDay(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900">
        <div className="max-w-4xl mx-auto pt-10 px-4 md:pt-20">
          <Card className="shadow-xl dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6 md:p-12 text-center">
              <div className="mb-6">
                <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Join Your Reading Journey</h2>
                <p className="text-md md:text-lg text-gray-600 dark:text-gray-300 mb-6 md:mb-8">
                  Access your personalized 90-day Bible reading plan with progress tracking, 
                  community engagement, and spiritual growth insights.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="text-center p-3 md:p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <Calendar className="h-6 w-6 md:h-8 md:w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Daily Readings</h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Structured 90-day plan</p>
                </div>
                <div className="text-center p-3 md:p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <Target className="h-6 w-6 md:h-8 md:w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Progress Tracking</h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Monitor your journey</p>
                </div>
                <div className="text-center p-3 md:p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Growth Analytics</h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Insights & achievements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="max-w-7xl mx-auto p-4 space-y-6 md:space-y-8">
          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 mb-6 md:mb-8"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <Card className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white">
                <CardContent className="p-3 md:p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold">{userStats.totalReadingDays}</div>
                  <div className="text-xs md:text-sm opacity-90">Days Complete</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 text-white">
                <CardContent className="p-3 md:p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold">{userStats.readingStreak}</div>
                  <div className="text-xs md:text-sm opacity-90">Day Streak</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white">
                <CardContent className="p-3 md:p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold">{todayDay}</div>
                  <div className="text-xs md:text-sm opacity-90">Today is Day</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white">
                <CardContent className="p-3 md:p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold">{Math.round((userStats.totalReadingDays / 90) * 100)}%</div>
                  <div className="text-xs md:text-sm opacity-90">Progress</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              <MonthNavigation
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                totalDaysCompleted={userStats.totalReadingDays}
              />

              {/* Month Theme Header */}
              <motion.div
                key={currentMonth}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-700 dark:via-blue-700 dark:to-indigo-700 text-white p-6 md:p-8 rounded-2xl shadow-lg"
              >
                <Badge className="bg-white/20 text-white border-white/30 mb-4">
                  Month {currentMonth} of 3
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3">
                  {getThemeForMonth(currentMonth)}
                </h2>
                <p className="text-purple-100 dark:text-purple-200 text-base md:text-lg">
                  {monthData.length} days of spiritual growth and discovery
                </p>
                <div className="mt-3 md:mt-4 flex justify-center space-x-4 text-xs md:text-sm">
                  <span className="bg-white/10 px-3 py-1 rounded-full">
                    Days {(currentMonth - 1) * 30 + 1}-{currentMonth * 30}
                  </span>
                </div>
              </motion.div>

              {/* Reading Days Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {transformedDayData.map((dayData, index) => (
                  <ReadingDayCard
                    key={dayData.day}
                    dayData={dayData}
                    isCompleted={Array.isArray(userStats.readingProgress) && userStats.readingProgress.includes(dayData.day)}
                    isToday={dayData.day === todayDay}
                    isLocked={isDayLocked(dayData.day)}
                    isProcessing={processingDay === dayData.day}
                    onToggleComplete={(completed) => handleToggleComplete(dayData.day, completed)}
                    animationDelay={index * 0.05}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
