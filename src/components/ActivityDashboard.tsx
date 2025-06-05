
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, MessageCircle, Users, TrendingUp, Calendar, Heart, Flame, FileText } from 'lucide-react';
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
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {[
    {
      label: "Day Streak",
      value: userStats.readingStreak,
      color: "green",
      icon: <Flame className="w-5 h-5" />,
    },
    {
      label: "Days Read",
      value: userStats.totalReadingDays,
      color: "purple",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      label: "Messages",
      value: userStats.messagesCount,
      color: "blue",
      icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      label: "Posts",
      value: userStats.postsCount,
      color: "orange",
      icon: <FileText className="w-5 h-5" />,
    },
  ].map((stat, index) => (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * (index + 1) }}
    >
      <Card className="bg-white/60 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
        <CardContent className="p-4 text-center space-y-2">
          {/* Icon */}
          <div
            className={`mx-auto w-10 h-10 flex items-center justify-center rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-800/30 text-${stat.color}-600 dark:text-${stat.color}-300 shadow-sm`}
          >
            {stat.icon}
          </div>

          {/* Stat Number */}
          <div
            className={`text-2xl font-extrabold text-${stat.color}-600 dark:text-${stat.color}-300`}
          >
            {stat.value}
          </div>

          {/* Label */}
          <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
        </CardContent>
      </Card>
    </motion.div>
  ))}
</div>


      <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
>
  <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 text-lg font-semibold">
        <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
            transition={{ delay: index * 0.1 + 0.3 }}
            className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            {/* Icon Badge */}
            <div className="flex-shrink-0 p-2 rounded-full bg-gradient-to-br from-purple-200 to-purple-400 dark:from-purple-600 dark:to-purple-700 shadow-inner">
              {getActivityIcon(activity.type)}
            </div>

            {/* Activity Text */}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {getActivityText(activity)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activity.timestamp?.toDate?.()?.toLocaleDateString?.() ?? "Just now"}
              </p>
              {/* Optional: use dayjs for better UX */}
              {/* dayjs(activity.timestamp.toDate()).fromNow() */}
            </div>

            {/* Type Badge */}
            <Badge variant="secondary" className="text-xs capitalize">
              {activity.type.replace('_', ' ')}
            </Badge>
          </motion.div>
        ))}

        {/* Empty State */}
        {recentActivities.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-6 text-gray-500 dark:text-gray-400"
          >
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="font-medium">No recent activities</p>
            <p className="text-sm">Start reading or chatting to see your journey unfold.</p>
          </motion.div>
        )}
      </div>
    </CardContent>
  </Card>
</motion.div>


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      >
        <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-purple-700 dark:text-purple-300">
              Your Journey Insights
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Completion Percentage */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Reading Completion</span>
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                {Math.round((userStats.totalReadingDays / 90) * 100)}%
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min((userStats.totalReadingDays / 90) * 100, 100)}%`,
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="bg-gradient-to-r from-purple-500 to-purple-700 h-2 rounded-full"
              />
            </div>

            {/* Streak Encouragement */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20"
            >
              <p className="text-sm text-purple-800 dark:text-purple-200">
                <strong>Keep it up!</strong> You're on a {userStats.readingStreak}-day streak.
                {userStats.readingStreak >= 7
                  ? " You're building amazing consistency!"
                  : " Every day counts!"}
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>


    </div>
  );
};

export default ActivityDashboard;
