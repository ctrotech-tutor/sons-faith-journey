
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
  const { userStats, updateReadingProgress, getTodayDayNumber, loading, error } = useActivitySync();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Function to check if a day is locked
  const isDayLocked = (dayNumber: number) => {
    return dayNumber > todayDay;
  };
  
  // Handle completion toggle with error handling
  const handleToggleComplete = async (day: number, completed: boolean) => {
    try {
      await updateReadingProgress(day, completed);
    } catch (err) {
      console.error("Error toggling completion:", err);
      toast({
        title: "Error updating progress",
        description: "There was a problem updating your reading progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900">
        <div className="max-w-4xl mx-auto pt-20">
          <Card className="shadow-xl dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <div className="mb-6">
                <BookOpen className="h-16 w-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Join Your Reading Journey</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Access your personalized 90-day Bible reading plan with progress tracking, 
                  community engagement, and spiritual growth insights.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Daily Readings</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Structured 90-day plan</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <Target className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Progress Tracking</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Monitor your journey</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Growth Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Insights & achievements</p>
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
        <div className="max-w-7xl mx-auto p-4 space-y-8">
          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 mb-8"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{userStats.totalReadingDays}</div>
                  <div className="text-sm opacity-90">Days Complete</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{userStats.readingStreak}</div>
                  <div className="text-sm opacity-90">Day Streak</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{todayDay}</div>
                  <div className="text-sm opacity-90">Today is Day</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{Math.round((userStats.totalReadingDays / 90) * 100)}%</div>
                  <div className="text-sm opacity-90">Progress</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
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
                className="text-center bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-700 dark:via-blue-700 dark:to-indigo-700 text-white p-8 rounded-2xl shadow-lg"
              >
                <Badge className="bg-white/20 text-white border-white/30 mb-4">
                  Month {currentMonth} of 3
                </Badge>
                <h2 className="text-3xl font-bold mb-3">
                  {getThemeForMonth(currentMonth)}
                </h2>
                <p className="text-purple-100 dark:text-purple-200 text-lg">
                  {monthData.length} days of spiritual growth and discovery
                </p>
                <div className="mt-4 flex justify-center space-x-4 text-sm">
                  <span className="bg-white/10 px-3 py-1 rounded-full">
                    Days {(currentMonth - 1) * 30 + 1}-{currentMonth * 30}
                  </span>
                </div>
              </motion.div>

              {/* Reading Days Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {monthData.map((dayData, index) => (
                  <ReadingDayCard
                    key={dayData.day}
                    dayData={dayData}
                    isCompleted={Array.isArray(userStats.readingProgress) && userStats.readingProgress.includes(dayData.day)}
                    isToday={dayData.day === todayDay}
                    isLocked={isDayLocked(dayData.day)}
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
