
import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, BookOpen, MessageCircle, Activity, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  email: string;
  lastActive: any;
  readingStreak: number;
  totalReadingDays: number;
  messagesCount: number;
  postsCount: number;
  timeSpentReading: number; // in minutes
  currentlyOnline: boolean;
  readingProgress: number[];
}

const UserTrackingDashboard = () => {
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    currentlyOnline: 0,
    totalReadingTime: 0
  });

  useEffect(() => {
    // Listen to all users
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('lastActiveDate', 'desc')
    );

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.id,
        userName: doc.data().displayName || 'Unknown',
        email: doc.data().email || 'No email',
        lastActive: doc.data().lastActiveDate,
        readingStreak: doc.data().readingStreak || 0,
        totalReadingDays: doc.data().readingProgress?.length || 0,
        messagesCount: doc.data().messagesCount || 0,
        postsCount: doc.data().postsCount || 0,
        timeSpentReading: doc.data().timeSpentReading || 0,
        currentlyOnline: false,
        readingProgress: doc.data().readingProgress || []
      })) as UserActivity[];
      
      setUsers(userData);
      
      // Calculate stats
      const now = new Date();
      const today = now.toDateString();
      const activeToday = userData.filter(user => 
        user.lastActive && new Date(user.lastActive).toDateString() === today
      ).length;
      
      setStats({
        totalUsers: userData.length,
        activeToday,
        currentlyOnline: onlineUsers.length,
        totalReadingTime: userData.reduce((sum, user) => sum + user.timeSpentReading, 0)
      });
    });

    // Listen to online presence
    const presenceQuery = query(
      collection(db, 'presence'),
      where('online', '==', true)
    );

    const unsubscribePresence = onSnapshot(presenceQuery, (snapshot) => {
      const onlineUserIds = snapshot.docs.map(doc => doc.id);
      setOnlineUsers(onlineUserIds);
    });

    return () => {
      unsubscribeUsers();
      unsubscribePresence();
    };
  }, []);

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getActivityStatus = (user: UserActivity) => {
    if (onlineUsers.includes(user.userId)) return 'online';
    if (!user.lastActive) return 'inactive';
    
    const lastActive = new Date(user.lastActive);
    const now = new Date();
    const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'recent';
    if (diffHours < 24) return 'today';
    return 'inactive';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'recent': return 'bg-yellow-500';
      case 'today': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-gray-500">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.activeToday}</p>
                <p className="text-sm text-gray-500">Active Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="text-2xl font-bold">{stats.currentlyOnline}</p>
                <p className="text-sm text-gray-500">Online Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{formatTimeSpent(stats.totalReadingTime)}</p>
                <p className="text-sm text-gray-500">Total Reading</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity (Real-time)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {users.map((user) => {
              const status = getActivityStatus(user);
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>{user.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(status)}`} />
                    </div>
                    <div>
                      <p className="font-medium">{user.userName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm font-medium">{user.readingStreak}</p>
                      <p className="text-xs text-gray-500">Streak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{user.totalReadingDays}</p>
                      <p className="text-xs text-gray-500">Days Read</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{user.messagesCount}</p>
                      <p className="text-xs text-gray-500">Messages</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{formatTimeSpent(user.timeSpentReading)}</p>
                      <p className="text-xs text-gray-500">Time Spent</p>
                    </div>
                    <Badge variant={status === 'online' ? 'default' : 'secondary'}>
                      {status}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserTrackingDashboard;
