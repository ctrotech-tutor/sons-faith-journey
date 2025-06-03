
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, MessageCircle, Calendar, Trophy, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const UserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    readingStreak: 0,
    totalReadingDays: 0,
    messagesCount: 0,
    postsCount: 0,
    profileViews: 0,
    joinedDaysAgo: 0
  });

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const joinDate = data.createdAt?.toDate() || new Date();
        const daysDiff = Math.floor((new Date().getTime() - joinDate.getTime()) / (1000 * 3600 * 24));
        
        setStats({
          readingStreak: data.readingStreak || 0,
          totalReadingDays: Object.values(data.readingProgress || {}).filter(Boolean).length,
          messagesCount: data.messagesCount || 0,
          postsCount: data.postsCount || 0,
          profileViews: data.profileViews || 0,
          joinedDaysAgo: daysDiff
        });
      }
    });

    return unsubscribe;
  }, [user]);

  const statItems = [
    {
      label: 'Reading Streak',
      value: stats.readingStreak,
      icon: <TrendingUp className="h-5 w-5 text-orange-500" />,
      suffix: 'days'
    },
    {
      label: 'Days Read',
      value: stats.totalReadingDays,
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
      suffix: 'total'
    },
    {
      label: 'Messages Sent',
      value: stats.messagesCount,
      icon: <MessageCircle className="h-5 w-5 text-green-500" />,
      suffix: 'messages'
    },
    {
      label: 'Posts Created',
      value: stats.postsCount,
      icon: <Trophy className="h-5 w-5 text-purple-500" />,
      suffix: 'posts'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex justify-center mb-2">{item.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-600">{item.label}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-purple-800">
              Member for {stats.joinedDaysAgo} days
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStats;
