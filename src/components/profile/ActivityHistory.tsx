
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MessageCircle, BookOpen, User, Clock, Filter, Search, BarChart, Download, RefreshCw, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { doc, onSnapshot, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/lib/hooks/use-toast';

interface Activity {
  type: 'reading_completed' | 'chat_message' | 'profile_update' | 'login' | 'bible_reading' | 'community_post';
  timestamp: any;
  data?: any;
  id?: string;
}

const ActivityHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const userActivities = data.recentActivities || [];
        setActivities(userActivities);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    let filtered = [...activities];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getActivityDescription(activity).toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(activity.data).toLowerCase().includes(searchTerm.toLowerCase())
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
        case '3months':
          timeLimit = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          timeLimit = new Date(0);
      }

      filtered = filtered.filter(activity => {
        const activityDate = activity.timestamp?.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp);
        return activityDate >= timeLimit;
      });
    }

    // Sort by timestamp
    filtered.sort((a, b) => {
      const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return sortOrder === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

    setFilteredActivities(filtered);
  }, [activities, searchTerm, filterType, timeFilter, sortOrder]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'reading_completed':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'bible_reading':
        return <BookOpen className="h-4 w-4 text-purple-500" />;
      case 'chat_message':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'community_post':
        return <User className="h-4 w-4 text-orange-500" />;
      case 'profile_update':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'login':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case 'reading_completed':
        return `Completed reading plan ${activity.data?.day ? `for day ${activity.data.day}` : ''}`;
      case 'bible_reading':
        return `Read ${activity.data?.passage || 'Bible passage'} ${activity.data?.version ? `(${activity.data.version})` : ''}`;
      case 'chat_message':
        return 'Sent a message in community chat';
      case 'community_post':
        return 'Created a community post';
      case 'profile_update':
        return 'Updated profile information';
      case 'login':
        return 'Signed into the application';
      default:
        return 'Unknown activity';
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
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getActivityStats = () => {
    const stats = {
      total: activities.length,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      types: {} as Record<string, number>
    };

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    activities.forEach(activity => {
      const activityDate = activity.timestamp?.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp);
      
      if (activityDate >= todayStart) {
        stats.today++;
      }
      if (activityDate >= weekStart) {
        stats.thisWeek++;
      }
      if (activityDate >= monthStart) {
        stats.thisMonth++;
      }

      stats.types[activity.type] = (stats.types[activity.type] || 0) + 1;
    });

    return stats;
  };

  const exportActivities = () => {
    const dataStr = JSON.stringify(filteredActivities, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast({ title: 'Activity history exported successfully' });
  };

  const clearAllActivities = async () => {
    if (!user) return;
    
    const confirmation = window.confirm('Are you sure you want to clear all activity history? This action cannot be undone.');
    
    if (confirmation) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          recentActivities: []
        });
        toast({ title: 'Activity history cleared successfully' });
      } catch (error) {
        toast({ title: 'Failed to clear activity history', variant: 'destructive' });
      }
    }
  };

  const stats = getActivityStats();

  if (loading) {
    return (
      <Card className="dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Calendar className="h-5 w-5" />
            Activity History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Calendar className="h-5 w-5" />
            Activity History
            <Badge variant="secondary" className="ml-2 dark:bg-gray-700 dark:text-gray-200">
              {filteredActivities.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <Filter className="h-4 w-4 mr-1" />
              {showAdvanced ? 'Hide' : 'Show'} Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportActivities}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enhanced Activity Stats */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.total}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.today}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Today</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.thisWeek}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">This Week</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.thisMonth}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">This Month</p>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-40 dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-600 dark:border-gray-500">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="reading_completed">Reading</SelectItem>
                  <SelectItem value="bible_reading">Bible</SelectItem>
                  <SelectItem value="chat_message">Chat</SelectItem>
                  <SelectItem value="community_post">Posts</SelectItem>
                  <SelectItem value="profile_update">Profile</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full sm:w-32 dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-600 dark:border-gray-500">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
                <SelectTrigger className="w-full sm:w-32 dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-600 dark:border-gray-500">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={clearAllActivities}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
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
                className="dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
              >
                Clear All Filters
              </Button>
            )}
          </motion.div>
        )}

        {/* Activities List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || filterType !== 'all' || timeFilter !== 'all' 
                  ? 'No activities match your filters' 
                  : 'No recent activity'}
              </p>
              {(searchTerm || filterType !== 'all' || timeFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setTimeFilter('all');
                  }}
                  className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            filteredActivities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-600 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium dark:text-white truncate">
                    {getActivityDescription(activity)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                    {activity.data && (
                      <Badge variant="outline" className="text-xs dark:border-gray-500 dark:text-gray-300">
                        {activity.data.day ? `Day ${activity.data.day}` : 
                         activity.data.passage ? activity.data.passage : 'Data'}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHistory;
