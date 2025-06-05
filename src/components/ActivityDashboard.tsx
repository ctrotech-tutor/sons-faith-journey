
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, MessageCircle, Users, TrendingUp, Calendar, Heart, Search, Filter, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useActivitySync } from '@/lib/hooks/useActivitySync';
import { useAuth } from '@/lib/hooks/useAuth';

const ActivityDashboard = () => {
  const { userStats, recentActivities } = useActivitySync();
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'reading_completed': return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'bible_reading': return <BookOpen className="h-4 w-4 text-purple-500" />;
      case 'chat_message': return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'community_post': return <Users className="h-4 w-4 text-orange-500" />;
      case 'profile_update': return <Heart className="h-4 w-4 text-pink-500" />;
      case 'login': return <TrendingUp className="h-4 w-4 text-indigo-500" />;
      default: return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'reading_completed': 
        return `Completed Day ${activity.data?.day} reading`;
      case 'bible_reading':
        return `Read ${activity.data?.passage || 'Bible passage'}`;
      case 'chat_message': 
        return 'Sent a message in chat';
      case 'community_post': 
        return 'Shared a community post';
      case 'profile_update': 
        return 'Updated profile';
      case 'login':
        return 'Signed into the app';
      default: 
        return 'Recent activity';
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredActivities = useMemo(() => {
    let filtered = [...recentActivities];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        getActivityText(activity).toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by time
    if (timeFilter !== 'all') {
      const now = new Date();
      let timeLimit: Date;

      switch (timeFilter) {
        case 'today':
          timeLimit = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          timeLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          timeLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          timeLimit = new Date(0);
      }

      filtered = filtered.filter(activity => {
        const activityDate = activity.timestamp?.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp);
        return activityDate >= timeLimit;
      });
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => {
      const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });

    return filtered;
  }, [recentActivities, searchTerm, filterType, timeFilter]);

  const getActivityStats = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      today: recentActivities.filter(a => {
        const date = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        return date >= todayStart;
      }).length,
      thisWeek: recentActivities.filter(a => {
        const date = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        return date >= weekStart;
      }).length,
      types: {} as Record<string, number>
    };

    recentActivities.forEach(activity => {
      stats.types[activity.type] = (stats.types[activity.type] || 0) + 1;
    });

    return stats;
  };

  const stats = getActivityStats();

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="dark:bg-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {userStats.readingStreak}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Day Streak</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="dark:bg-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {userStats.totalReadingDays}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Days Read</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="dark:bg-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {stats.today}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Today</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="dark:bg-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {stats.thisWeek}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">This Week</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activities with Full Functionality */}
      <Card className="dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="dark:text-white">Recent Activities</span>
              <Badge variant="secondary" className="ml-2 dark:bg-gray-700 dark:text-gray-200">
                {filteredActivities.length}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'compact' ? 'detailed' : 'compact')}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              >
                {viewMode === 'compact' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-4"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-40 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="reading_completed">Reading</SelectItem>
                    <SelectItem value="bible_reading">Bible</SelectItem>
                    <SelectItem value="chat_message">Chat</SelectItem>
                    <SelectItem value="community_post">Posts</SelectItem>
                    <SelectItem value="profile_update">Profile</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-full sm:w-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(searchTerm || filterType !== 'all' || timeFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setTimeFilter('all');
                  }}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                >
                  Clear Filters
                </Button>
              )}
            </motion.div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No activities found</p>
                <p className="text-sm">
                  {searchTerm || filterType !== 'all' || timeFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Start reading or chatting to see your activities here!'}
                </p>
              </div>
            ) : (
              filteredActivities.slice(0, viewMode === 'compact' ? 5 : 20).map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-600 rounded-full shadow-sm">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {getActivityText(activity)}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                      {viewMode === 'detailed' && activity.data && (
                        <Badge variant="outline" className="text-xs dark:border-gray-500 dark:text-gray-300">
                          {activity.data.day ? `Day ${activity.data.day}` : 'Activity'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-xs hidden sm:block dark:bg-gray-600 dark:text-gray-200"
                  >
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </motion.div>
              ))
            )}

            {filteredActivities.length > 5 && viewMode === 'compact' && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('detailed')}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  Show all {filteredActivities.length} activities
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Insights - Enhanced */}
      <Card className="dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Your Journey Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Reading Completion</span>
              <span className="text-sm font-medium dark:text-white">
                {Math.round((userStats.totalReadingDays / 90) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((userStats.totalReadingDays / 90) * 100, 100)}%` }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {userStats.readingStreak}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Current Streak</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {90 - userStats.totalReadingDays}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">Days Remaining</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-purple-800 dark:text-purple-200">
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
