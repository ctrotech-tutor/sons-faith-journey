
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, MessageCircle, Calendar, Trophy, TrendingUp, Target, Award, Clock, BarChart3 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useActivitySync } from '@/lib/hooks/useActivitySync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const UserStats = () => {
  const { user } = useAuth();
  const { userStats, getTodayDayNumber } = useActivitySync();
  const [todayDay, setTodayDay] = useState(1);

  useEffect(() => {
    setTodayDay(getTodayDayNumber());
  }, [getTodayDayNumber]);

  // Calculate accurate completion percentage
  const completionPercentage = Math.round((userStats.totalReadingDays / 90) * 100);
  
  // Calculate days remaining
  const daysRemaining = 90 - todayDay + 1;
  
  // Calculate average reading time per day
  const avgReadingTime = userStats.totalReadingDays > 0 
    ? Math.round(userStats.timeSpentReading / userStats.totalReadingDays) 
    : 0;

  const statItems = [
    {
      label: 'Current Streak',
      value: userStats.readingStreak,
      icon: <TrendingUp className="h-5 w-5 text-orange-500" />,
      suffix: 'days',
      color: 'from-orange-400 to-red-500'
    },
    {
      label: 'Days Complete',
      value: userStats.totalReadingDays,
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
      suffix: 'of 90',
      color: 'from-blue-400 to-purple-500'
    },
    {
      label: 'Progress',
      value: completionPercentage,
      icon: <Target className="h-5 w-5 text-green-500" />,
      suffix: '%',
      color: 'from-green-400 to-emerald-500'
    },
    {
      label: 'Messages Sent',
      value: userStats.messagesCount,
      icon: <MessageCircle className="h-5 w-5 text-purple-500" />,
      suffix: 'total',
      color: 'from-purple-400 to-pink-500'
    }
  ];

  const additionalStats = [
    {
      label: 'Current Day',
      value: todayDay,
      description: 'Day of the 90-day journey',
      icon: <Calendar className="h-4 w-4 text-indigo-500" />
    },
    {
      label: 'Days Remaining',
      value: daysRemaining,
      description: 'Until challenge completion',
      icon: <Clock className="h-4 w-4 text-gray-500" />
    },
    {
      label: 'Avg. Reading Time',
      value: avgReadingTime,
      description: 'Minutes per completed day',
      icon: <BookOpen className="h-4 w-4 text-blue-500" />
    },
    {
      label: 'Achievement Level',
      value: userStats.readingStreak >= 7 ? 'Committed' : userStats.readingStreak >= 3 ? 'Growing' : 'Starting',
      description: 'Based on current streak',
      icon: <Award className="h-4 w-4 text-yellow-500" />
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Progress Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {statItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 rounded-xl bg-gradient-to-br ${item.color} text-white overflow-hidden`}
              >
                <div className="relative z-10">
                  <div className="flex justify-center mb-2">{item.icon}</div>
                  <p className="text-2xl font-bold text-center">{item.value}</p>
                  <p className="text-xs text-center opacity-90">{item.label}</p>
                  <p className="text-xs text-center opacity-75">{item.suffix}</p>
                </div>
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
              </motion.div>
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">90-Day Challenge Progress</span>
              <span className="text-sm text-gray-500">{userStats.totalReadingDays}/90 days</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Detailed Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {additionalStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {stat.icon}
                  <div>
                    <p className="font-medium text-gray-900">{stat.label}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Journey Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Journey Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Current Status</span>
            </div>
            <p className="text-sm text-green-700">
              {userStats.readingStreak >= 7 
                ? "You're on fire! 🔥 Keep up this amazing consistency."
                : userStats.readingStreak >= 3
                ? "Great momentum! 📈 You're building a strong habit."
                : "Every journey starts with a single step. 🌟 Keep going!"}
            </p>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Reading Pace</span>
            </div>
            <p className="text-sm text-blue-700">
              {completionPercentage >= todayDay / 90 * 100
                ? "You're ahead of schedule! 🎯 Excellent discipline."
                : "Stay consistent to reach your 90-day goal. 💪 You've got this!"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStats;
