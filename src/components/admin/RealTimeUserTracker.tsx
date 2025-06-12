import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Users, MapPin, Clock, BookOpen, MessageCircle, Activity, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserData {
  id: string;
  displayName: string;
  email: string;
  location?: string;
  lastActive: any;
  currentlyOnline: boolean;
  readingStreak: number;
  totalReadingDays: number;
  messagesCount: number;
  timeSpentReading: number;
  currentPage?: string;
  sessionStart?: any;
  totalSessions: number;
}

interface ProfileData {
  displayName?: string;
  location?: string;
  [key: string]: any;
}

const RealTimeUserTracker = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');

  useEffect(() => {
    // Listen to all users
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('lastActiveDate', 'desc')
    );

    const unsubscribeUsers = onSnapshot(usersQuery, async (snapshot) => {
      const userData = await Promise.all(
        snapshot.docs.map(async (userDoc) => {
          const data = userDoc.data();
          
          // Get additional profile data
          let profileData: ProfileData = {};
          try {
            const profileDoc = await getDoc(doc(db, 'userProfiles', userDoc.id));
            if (profileDoc.exists()) {
              profileData = profileDoc.data() as ProfileData;
            }
          } catch (error) {
            console.log('No profile data for user:', userDoc.id);
          }

          return {
            id: userDoc.id,
            displayName: data.displayName || profileData.displayName || 'Unknown User',
            email: data.email || 'No email',
            location: profileData.location || data.location || 'Unknown',
            lastActive: data.lastActiveDate,
            currentlyOnline: false,
            readingStreak: data.readingStreak || 0,
            totalReadingDays: Array.isArray(data.readingProgress) ? data.readingProgress.length : 0,
            messagesCount: data.messagesCount || 0,
            timeSpentReading: data.timeSpentReading || 0,
            currentPage: data.currentPage || 'Unknown',
            sessionStart: data.sessionStart,
            totalSessions: data.totalSessions || 0
          } as UserData;
        })
      );
      
      setUsers(userData);
    });

    // Listen to online presence
    const presenceQuery = query(
      collection(db, 'presence'),
      where('online', '==', true)
    );

    const unsubscribePresence = onSnapshot(presenceQuery, (snapshot) => {
      const onlineUserIds = snapshot.docs.map(doc => doc.id);
      setOnlineUsers(onlineUserIds);
      
      // Update users online status
      setUsers(prevUsers => 
        prevUsers.map(user => ({
          ...user,
          currentlyOnline: onlineUserIds.includes(user.id)
        }))
      );
    });

    return () => {
      unsubscribeUsers();
      unsubscribePresence();
    };
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'online' && user.currentlyOnline) ||
                         (filterStatus === 'offline' && !user.currentlyOnline);
    
    return matchesSearch && matchesFilter;
  });

  const getActivityStatus = (user: UserData) => {
    if (user.currentlyOnline) return 'online';
    if (!user.lastActive) return 'inactive';
    
    const lastActive = new Date(user.lastActive);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60);
    
    if (diffMinutes < 5) return 'recent';
    if (diffMinutes < 60) return 'away';
    return 'offline';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'recent': return 'bg-yellow-500';
      case 'away': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getSessionDuration = (user: UserData) => {
    if (!user.currentlyOnline || !user.sessionStart) return '0m';
    const now = new Date();
    const sessionStart = new Date(user.sessionStart);
    const duration = Math.floor((now.getTime() - sessionStart.getTime()) / (1000 * 60));
    return formatTime(duration);
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
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-gray-500">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="text-2xl font-bold">{onlineUsers.length}</p>
                <p className="text-sm text-gray-500">Online Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {users.reduce((sum, user) => sum + user.totalReadingDays, 0)}
                </p>
                <p className="text-sm text-gray-500">Total Reading Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {users.reduce((sum, user) => sum + user.messagesCount, 0)}
                </p>
                <p className="text-sm text-gray-500">Total Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Real-Time User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by name, email, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              {['all', 'online', 'offline'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredUsers.map((user, index) => {
              const status = getActivityStatus(user);
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(status)}`} />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{user.displayName}</p>
                        <Badge variant={user.currentlyOnline ? 'default' : 'secondary'}>
                          {status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{user.location}</span>
                        </div>
                        {user.currentlyOnline && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Session: {getSessionDuration(user)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm font-medium">{user.readingStreak}</p>
                      <p className="text-xs text-gray-500">Streak</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.totalReadingDays}</p>
                      <p className="text-xs text-gray-500">Days Read</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{formatTime(user.timeSpentReading)}</p>
                      <p className="text-xs text-gray-500">Reading Time</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.messagesCount}</p>
                      <p className="text-xs text-gray-500">Messages</p>
                    </div>
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

export default RealTimeUserTracker;
