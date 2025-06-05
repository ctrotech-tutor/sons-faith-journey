
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useActivitySync } from '@/lib/hooks/useActivitySync';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, MessageSquare, Calendar, Trophy, Plus, Edit3, Target, Clock, Flame, Book } from 'lucide-react';
import Layout from '@/components/Layout';
import ActivityDashboard from '@/components/ActivityDashboard';

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { userStats } = useActivitySync();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) {
    navigate('/');
    return null;
  }

  const progressPercentage = (userStats.totalReadingDays / 90) * 100;
  const timeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-8 pt-20 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Enhanced Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative mb-10 sm:px-6 lg:px-8"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700 dark:bg-gray-900/60 transition-all">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">

                {/* Left - Greeting */}
                <div>
                  <div className="inline-flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-400 flex items-center justify-center text-white font-semibold shadow-inner flex-shrink-0">
                      👋
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {timeGreeting()}, {userProfile?.displayName || 'Friend'}!
                    </h1>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    Welcome back to your <span className="font-medium text-purple-600 dark:text-purple-400">faith journey</span>. Let’s grow together.
                  </p>
                </div>

                {/* Right - Action Button */}
                <div className="flex justify-around sm:justify-end items-center">
                  <Button
                    onClick={() => navigate('/create-post')}
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 active:from-purple-700 hover:to-indigo-700 text-white px-5 py-2 rounded-full shadow-md transition-all"
                  >
                    <Plus className="h-4 w-4 group-active:scale-110 transition-transform" />
                    <span className="font-semibold">Create Post</span>
                  </Button>
                  <Button
                    onClick={() => navigate('/reading')}
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 active:from-purple-700 hover:to-indigo-700 text-white px-5 py-2 rounded-full shadow-md transition-all"
                  >
                    <Book className="h-4 w-4 group-active:scale-110 transition-transform" />
                    <span className="font-semibold">Reading</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Progress Overview (Refined Version) */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1, duration: 0.5 }}
  className="mb-10"
>
  <Card className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg py-6 sm:p-8 border border-gray-200 dark:border-gray-700 dark:bg-gray-900/60 transition-all">
    <CardContent className="p-6 sm:p-8">
      {/* Stat Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Day Streak */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {userStats.readingStreak}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Day Streak</p>
        </div>

        {/* Days Completed */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <BookOpen className="h-8 w-8 text-green-500" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {userStats.totalReadingDays}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">D-completed</p>
        </div>

        {/* Progress */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Target className="h-8 w-8 text-blue-500" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {Math.round(progressPercentage)}%
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Journey Progress</span>
          <span>{userStats.totalReadingDays}/90 days</span>
        </div>
        <Progress
          value={progressPercentage}
          className="h-3 bg-gray-200 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </Progress>
      </div>
    </CardContent>
  </Card>
</motion.div>

          
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Link to="/reading">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Today's Reading</h3>
                  <p className="text-sm text-gray-600">Continue your journey</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/community">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Community</h3>
                  <p className="text-sm text-gray-600">Connect with others</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/church-room">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Church Room</h3>
                  <p className="text-sm text-gray-600">Join the conversation</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/profile">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                    <Trophy className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">My Profile</h3>
                  <p className="text-sm text-gray-600">View achievements</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ActivityDashboard />
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
