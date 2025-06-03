
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useActivitySync } from '@/lib/hooks/useActivitySync';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, MessageSquare, Calendar, Trophy, Plus, Edit3, Target, Clock, Flame } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {timeGreeting()}, {userProfile?.displayName || 'Friend'}! 👋
                </h1>
                <p className="text-gray-600">Welcome back to your faith journey</p>
              </div>
              <Button
                onClick={() => navigate('/create-post')}
                className="bg-[#FF9606] hover:bg-[#FF9606]/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Flame className="h-8 w-8 text-orange-300" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{userStats.readingStreak}</div>
                    <p className="text-purple-100">Day Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <BookOpen className="h-8 w-8 text-green-300" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{userStats.totalReadingDays}</div>
                    <p className="text-purple-100">Days Completed</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="h-8 w-8 text-blue-300" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{Math.round(progressPercentage)}%</div>
                    <p className="text-purple-100">Progress</p>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-100">Journey Progress</span>
                    <span className="text-sm text-purple-100">{userStats.totalReadingDays}/90 days</span>
                  </div>
                  <Progress value={progressPercentage} className="bg-purple-800/30" />
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
