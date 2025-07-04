import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  where, 
  doc,
  limit,
  startAfter,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Activity, 
  Clock, 
  MapPin, 
  Smartphone, 
  Globe,
  TrendingUp,
  Eye,
  MessageCircle,
  BookOpen,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
// Charts temporarily disabled due to build issues
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface EnhancedUserData {
  id: string;
  displayName: string;
  email: string;
  location?: string;
  lastActive: any;
  currentlyOnline: boolean;
  currentPage?: string;
  sessionStart?: any;
  deviceInfo?: {
    platform: string;
    userAgent: string;
    screen: string;
  };
  readingStreak: number;
  totalReadingDays: number;
  messagesCount: number;
  timeSpentReading: number;
  totalSessions: number;
  engagementScore: number;
  recentActivities: any[];
}

interface ActivityStats {
  totalUsers: number;
  onlineUsers: number;
  activeToday: number;
  activeThisWeek: number;
  totalSessions: number;
  avgSessionDuration: number;
  topPages: { page: string; views: number }[];
  engagementTrends: { date: string; users: number; sessions: number }[];
}

const AdvancedUserDashboard = () => {
  const [users, setUsers] = useState<EnhancedUserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<EnhancedUserData[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalUsers: 0,
    onlineUsers: 0,
    activeToday: 0,
    activeThisWeek: 0,
    totalSessions: 0,
    avgSessionDuration: 0,
    topPages: [],
    engagementTrends: []
  });
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('lastActive');
  const [selectedUser, setSelectedUser] = useState<EnhancedUserData | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Real-time user tracking
  useEffect(() => {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('lastActiveDate', 'desc')
    );

    const unsubscribeUsers = onSnapshot(usersQuery, async (snapshot) => {
      const userData = await Promise.all(
        snapshot.docs.map(async (userDoc) => {
          const data = userDoc.data();
          
          // Calculate engagement score
          const engagementScore = calculateEngagementScore(data);
          
          return {
            id: userDoc.id,
            displayName: data.displayName || 'Unknown User',
            email: data.email || 'No email',
            location: data.location || 'Unknown',
            lastActive: data.lastActiveDate,
            currentlyOnline: false,
            currentPage: data.currentPage,
            sessionStart: data.sessionStart,
            deviceInfo: data.deviceInfo,
            readingStreak: data.readingStreak || 0,
            totalReadingDays: Array.isArray(data.readingProgress) ? data.readingProgress.length : 0,
            messagesCount: data.messagesCount || 0,
            timeSpentReading: data.timeSpentReading || 0,
            totalSessions: data.totalSessions || 0,
            engagementScore,
            recentActivities: data.recentActivities || []
          } as EnhancedUserData;
        })
      );
      
      setUsers(userData);
      applyFilters(userData);
      calculateStats(userData);
      setLoading(false);
    });

    // Real-time presence tracking
    const presenceQuery = query(
      collection(db, 'presence'),
      where('online', '==', true)
    );

    const unsubscribePresence = onSnapshot(presenceQuery, (snapshot) => {
      const onlineUserIds = snapshot.docs.map(doc => doc.id);
      setOnlineUsers(onlineUserIds);
      
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

  // Apply filters and search
  useEffect(() => {
    applyFilters(users);
  }, [searchTerm, filterBy, sortBy, users, onlineUsers]);

  const calculateEngagementScore = (userData: any) => {
    const readingWeight = 0.3;
    const messagesWeight = 0.2;
    const sessionsWeight = 0.2;
    const streakWeight = 0.3;

    const readingScore = (userData.timeSpentReading || 0) / 60; // hours
    const messagesScore = (userData.messagesCount || 0) / 10;
    const sessionsScore = (userData.totalSessions || 0) / 5;
    const streakScore = (userData.readingStreak || 0);

    return (
      readingScore * readingWeight +
      messagesScore * messagesWeight +
      sessionsScore * sessionsWeight +
      streakScore * streakWeight
    );
  };

  const applyFilters = (usersData: EnhancedUserData[]) => {
    let filtered = [...usersData];
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.displayName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.location && user.location.toLowerCase().includes(searchLower))
      );
    }
    
    // Activity filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    switch (filterBy) {
      case 'online':
        filtered = filtered.filter(user => onlineUsers.includes(user.id));
        break;
      case 'active-today':
        filtered = filtered.filter(user => 
          user.lastActive && new Date(user.lastActive) >= today
        );
        break;
      case 'active-week':
        filtered = filtered.filter(user => 
          user.lastActive && new Date(user.lastActive) >= weekAgo
        );
        break;
      case 'high-engagement':
        filtered = filtered.filter(user => user.engagementScore > 5);
        break;
      case 'inactive':
        filtered = filtered.filter(user => 
          !user.lastActive || new Date(user.lastActive) < weekAgo
        );
        break;
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'engagement':
          return b.engagementScore - a.engagementScore;
        case 'readingStreak':
          return b.readingStreak - a.readingStreak;
        case 'timeSpent':
          return b.timeSpentReading - a.timeSpentReading;
        case 'sessions':
          return b.totalSessions - a.totalSessions;
        default: // lastActive
          const dateA = a.lastActive ? new Date(a.lastActive) : new Date(0);
          const dateB = b.lastActive ? new Date(b.lastActive) : new Date(0);
          return dateB.getTime() - dateA.getTime();
      }
    });
    
    setFilteredUsers(filtered);
  };

  const calculateStats = (usersData: EnhancedUserData[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeToday = usersData.filter(user => 
      user.lastActive && new Date(user.lastActive) >= today
    ).length;

    const activeThisWeek = usersData.filter(user => 
      user.lastActive && new Date(user.lastActive) >= weekAgo
    ).length;

    const totalSessions = usersData.reduce((sum, user) => sum + user.totalSessions, 0);
    const totalTime = usersData.reduce((sum, user) => sum + user.timeSpentReading, 0);
    const avgSessionDuration = totalSessions > 0 ? totalTime / totalSessions : 0;

    // Generate engagement trends (mock data for now)
    const engagementTrends = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      return {
        date: date.toLocaleDateString(),
        users: Math.floor(Math.random() * activeToday) + activeToday * 0.7,
        sessions: Math.floor(Math.random() * totalSessions * 0.2) + totalSessions * 0.1
      };
    });

    setStats({
      totalUsers: usersData.length,
      onlineUsers: onlineUsers.length,
      activeToday,
      activeThisWeek,
      totalSessions,
      avgSessionDuration,
      topPages: [], // Would be calculated from page view data
      engagementTrends
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusColor = (user: EnhancedUserData) => {
    if (onlineUsers.includes(user.id)) return 'bg-green-500';
    if (!user.lastActive) return 'bg-gray-500';
    
    const lastActive = new Date(user.lastActive);
    const now = new Date();
    const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'bg-yellow-500';
    if (diffHours < 24) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const exportData = () => {
    const dataToExport = filteredUsers.map(user => ({
      Name: user.displayName,
      Email: user.email,
      Location: user.location,
      'Last Active': user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never',
      'Reading Streak': user.readingStreak,
      'Total Reading Days': user.totalReadingDays,
      'Messages Count': user.messagesCount,
      'Time Spent Reading': formatTime(user.timeSpentReading),
      'Total Sessions': user.totalSessions,
      'Engagement Score': user.engagementScore.toFixed(2),
      'Currently Online': onlineUsers.includes(user.id) ? 'Yes' : 'No'
    }));

    const csv = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Advanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-green-600">
                +{stats.activeThisWeek} active this week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online Now</p>
                <p className="text-2xl font-bold">{stats.onlineUsers}</p>
              </div>
              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">
                {stats.activeToday} active today
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">
                Avg: {formatTime(stats.avgSessionDuration)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement</p>
                <p className="text-2xl font-bold">
                  {(filteredUsers.reduce((sum, user) => sum + user.engagementScore, 0) / filteredUsers.length || 0).toFixed(1)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">Average score</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Trends - Chart temporarily disabled */}
      <Card>
        <CardHeader>
          <CardTitle>User Engagement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-300 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Chart temporarily unavailable - will be restored soon</p>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Advanced User Analytics</CardTitle>
            <div className="flex gap-2">
              <Button onClick={exportData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name, email, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="online">Online Now</SelectItem>
                <SelectItem value="active-today">Active Today</SelectItem>
                <SelectItem value="active-week">Active This Week</SelectItem>
                <SelectItem value="high-engagement">High Engagement</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastActive">Last Active</SelectItem>
                <SelectItem value="engagement">Engagement Score</SelectItem>
                <SelectItem value="readingStreak">Reading Streak</SelectItem>
                <SelectItem value="timeSpent">Time Spent</SelectItem>
                <SelectItem value="sessions">Sessions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enhanced Users List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedUser(user);
                  setShowUserDetails(true);
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(user)}`} />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{user.displayName}</p>
                      <Badge 
                        variant={user.engagementScore > 5 ? 'default' : 'secondary'}
                        className={user.engagementScore > 5 ? 'bg-green-500' : ''}
                      >
                        {user.engagementScore.toFixed(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {user.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{user.location}</span>
                        </div>
                      )}
                      {user.currentPage && onlineUsers.includes(user.id) && (
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{user.currentPage}</span>
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
                    <p className="text-sm font-medium">{formatTime(user.timeSpentReading)}</p>
                    <p className="text-xs text-gray-500">Reading</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.totalSessions}</p>
                    <p className="text-xs text-gray-500">Sessions</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {user.lastActive ? formatDistanceToNow(new Date(user.lastActive), { addSuffix: true }) : 'Never'}
                    </p>
                    <p className="text-xs text-gray-500">Last seen</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedUserDashboard;