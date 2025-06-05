
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, MessageCircle, Users, TrendingUp, Calendar, Heart } from 'lucide-react';
import { useActivitySync } from '@/lib/hooks/useActivitySync';
import { useAuth } from '@/lib/hooks/useAuth';

const ActivityDashboard = () => {
  const { userStats, recentActivities } = useActivitySync();
  const { userProfile } = useAuth();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'reading_completed': return <BookOpen className="h-4 w-4" />;
      case 'chat_message': return <MessageCircle className="h-4 w-4" />;
      case 'community_post': return <Users className="h-4 w-4" />;
      case 'profile_update': return <Heart className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'reading_completed': 
        return `Completed Day ${activity.data?.day} reading`;
      case 'chat_message': 
        return 'Sent a message in chat';
      case 'community_post': 
        return 'Shared a community post';
      case 'profile_update': 
        return 'Updated profile';
      default: 
        return 'Recent activity';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {userStats.readingStreak}
              </div>
              <p className="text-sm text-gray-600">Day Streak</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {userStats.totalReadingDays}
              </div>
              <p className="text-sm text-gray-600">Days Read</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {userStats.messagesCount}
              </div>
              <p className="text-sm text-gray-600">Messages</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {userStats.postsCount}
              </div>
              <p className="text-sm text-gray-600">Posts</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span>Recent Activities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.slice(0, 5).map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 p-2 bg-purple-100 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {getActivityText(activity)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.timestamp?.toDate?.()?.toLocaleDateString() || 'Recently'}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {activity.type.replace('_', ' ')}
                </Badge>
              </motion.div>
            ))}

            {recentActivities.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activities</p>
                <p className="text-sm">Start reading or chatting to see your activities here!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Your Journey Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reading Completion</span>
              <span className="text-sm font-medium">
                {Math.round((userStats.totalReadingDays / 90) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((userStats.totalReadingDays / 90) * 100, 100)}%` }}
              />
            </div>
            
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Keep it up!</strong> You're {userStats.readingStreak} days into your streak. 
                {userStats.readingStreak >= 7 ? ' You\'re building amazing consistency!' : ' Every day counts!'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityDashboard;
