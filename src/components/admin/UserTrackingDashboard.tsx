
import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, where, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, BookOpen, MessageCircle, Activity, Clock, Calendar, Search, Filter, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/lib/hooks/use-toast';

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
  profilePhoto?: string;
}

const UserTrackingDashboard = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserActivity[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    currentlyOnline: 0,
    totalReadingTime: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lastActive');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [userActivitiesLoading, setUserActivitiesLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    try {
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
          readingProgress: doc.data().readingProgress || [],
          profilePhoto: doc.data().profilePhoto
        })) as UserActivity[];
        
        setUsers(userData);
        applyFilters(userData, searchTerm, activityFilter, sortBy);
        
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
        
        setLoading(false);
      }, (err) => {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again.");
        setLoading(false);
      });

      // Listen to online presence
      const presenceQuery = query(
        collection(db, 'presence'),
        where('online', '==', true)
      );

      const unsubscribePresence = onSnapshot(presenceQuery, (snapshot) => {
        const onlineUserIds = snapshot.docs.map(doc => doc.id);
        setOnlineUsers(onlineUserIds);
        
        // Update the online status in the users list
        setUsers(prevUsers => 
          prevUsers.map(user => ({
            ...user,
            currentlyOnline: onlineUserIds.includes(user.userId)
          }))
        );
      });

      return () => {
        unsubscribeUsers();
        unsubscribePresence();
      };
    } catch (err) {
      console.error("Error setting up user tracking:", err);
      setError("An error occurred while setting up user tracking.");
      setLoading(false);
    }
  }, []);

  // Apply filters when filter criteria change
  useEffect(() => {
    applyFilters(users, searchTerm, activityFilter, sortBy);
  }, [searchTerm, activityFilter, sortBy, users, onlineUsers]);

  const applyFilters = (users: UserActivity[], search: string, activity: string, sort: string) => {
    let filtered = [...users];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user => 
        user.userName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply activity filter
    if (activity === 'online') {
      filtered = filtered.filter(user => onlineUsers.includes(user.userId));
    } else if (activity === 'active-today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(user => 
        user.lastActive && new Date(user.lastActive).toDateString() === today
      );
    } else if (activity === 'inactive') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(user => 
        !user.lastActive || new Date(user.lastActive) < oneWeekAgo
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case 'lastActive':
          const dateA = a.lastActive ? new Date(a.lastActive) : new Date(0);
          const dateB = b.lastActive ? new Date(b.lastActive) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        case 'readingStreak':
          return b.readingStreak - a.readingStreak;
        case 'totalReadingDays':
          return b.totalReadingDays - a.totalReadingDays;
        case 'messagesCount':
          return b.messagesCount - a.messagesCount;
        default:
          return 0;
      }
    });
    
    setFilteredUsers(filtered);
  };

  const loadUserActivities = async (userId: string) => {
    if (!userId) return;
    
    setUserActivitiesLoading(true);
    setSelectedUser(userId);
    
    try {
      const userRef = doc(db, 'users', userId);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const activities = data.recentActivities || [];
          
          // Sort activities by timestamp (newest first)
          const sortedActivities = [...activities].sort((a, b) => {
            const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
            const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
            return dateB.getTime() - dateA.getTime();
          });
          
          setUserActivities(sortedActivities);
        }
        setUserActivitiesLoading(false);
      });
      
      // Return unsubscribe function to be called when dialog is closed
      return unsubscribe;
    } catch (err) {
      console.error("Error loading user activities:", err);
      toast({
        title: "Error",
        description: "Failed to load user activities",
        variant: "destructive"
      });
      setUserActivitiesLoading(false);
      return () => {};
    }
  };

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
    if (diffHours < 168) return 'this week';
    return 'inactive';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'recent': return 'bg-yellow-500';
      case 'today': return 'bg-blue-500';
      case 'this week': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'reading_completed': return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'bible_reading': return <BookOpen className="h-4 w-4 text-purple-500" />;
      case 'chat_message': return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'community_post': return <Users className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return 'Unknown time';
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-3">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Error</h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

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

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="online">Online Now</SelectItem>
                  <SelectItem value="active-today">Active Today</SelectItem>
                  <SelectItem value="inactive">Inactive (1 week+)</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastActive">Last Active</SelectItem>
                  <SelectItem value="readingStreak">Reading Streak</SelectItem>
                  <SelectItem value="totalReadingDays">Reading Days</SelectItem>
                  <SelectItem value="messagesCount">Messages Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity (Real-time)</CardTitle>
          <CardDescription>
            {loading ? "Loading users..." : 
              `Showing ${filteredUsers.length} of ${users.length} users`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => {
                const status = getActivityStatus(user);
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30 cursor-pointer"
                    onClick={() => loadUserActivities(user.userId)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={user.profilePhoto} />
                          <AvatarFallback>{user.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(status)}`} />
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
                      <div className="text-center hidden md:block">
                        <p className="text-sm font-medium">{formatTimeSpent(user.timeSpentReading)}</p>
                        <p className="text-xs text-gray-500">Time Spent</p>
                      </div>
                      <Badge variant={status === 'online' ? 'default' : 'secondary'} className={status === 'online' ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {status}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No users match your filters.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Activity Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold">User Activity History</h3>
              <Button variant="ghost" onClick={() => setSelectedUser(null)}>×</Button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-grow">
              {userActivitiesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
                </div>
              ) : userActivities.length > 0 ? (
                <div className="space-y-4">
                  {userActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium capitalize">{activity.type.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                        </div>
                        {activity.data && (
                          <div className="mt-2 text-sm bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(activity.data, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">No activity history available</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t dark:border-gray-700 flex justify-end">
              <Button onClick={() => setSelectedUser(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTrackingDashboard;
