import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useActivitySync } from '@/lib/hooks/useActivitySync'
import { motion } from 'framer-motion'
import { getMonthData, getThemeForMonth } from '@/data/readingPlan'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Calendar, Target, TrendingUp, AlertCircle, ArrowLeft, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { toast as sonnerToast } from 'sonner'
import MonthNavigation from '@/components/reading/MonthNavigation'
import ReadingDayCard from '@/components/reading/ReadingDayCard'
import ProgressDrawer from '@/components/community/ProgressStats'
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
      <div className="min-h-screen bg-white dark:bg-gray-900">
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
    <>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-0 left-0 w-full z-40 backdrop-blur-md bg-white/70 dark:bg-gray-900/60 border-b border-white/20 dark:border-white/10 shadow-sm"
        >
          <div className="max-w-md mx-auto px-2 py-3">
            <div className="flex items-center justify-between">
              {/* Back button and title */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="text-black dark:text-white ripple-effect rounded-full w-8 h-8 bg-transparent active:bg-purple-600 active:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 via-purple-700 to-fuchsia-600 bg-clip-text text-transparent">
                  My Readings
                </h1>
              </div>

              {/* Progress trigger button */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {`${Math.round((userStats.totalReadingDays / 90) * 100)}%`}
                </Badge>

                <ProgressDrawer
                  stats={{
                    totalReadingDays: userStats.totalReadingDays,
                    readingStreak: userStats.readingStreak,
                    todayDay: todayDay,
                  }}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-black dark:text-white ripple-effect rounded-full w-8 h-8 bg-transparent active:bg-purple-600 active:text-white transition-colors"
                    >
                      <BarChart2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </motion.div>
        <div className="max-w-7xl mx-auto p-4 space-y-6 md:space-y-8">
          {/* Progress Overview */}
          <ProgressDrawer
            stats={{
              totalReadingDays: userStats.totalReadingDays,
              readingStreak: userStats.readingStreak,
              todayDay: todayDay,
            }}
          />

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
    </>
  );
}
