
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MessageCircle, BookOpen, User, Clock, Filter, Search, BarChart } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Activity {
  type: 'reading' | 'chat' | 'profile' | 'login' | 'bible_reading';
  timestamp: any;
  data?: any;
  id?: string;
}

const ActivityHistory = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

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

    setFilteredActivities(filtered);
  }, [activities, searchTerm, filterType, timeFilter]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'reading':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'bible_reading':
        return <BookOpen className="h-4 w-4 text-purple-500" />;
      case 'chat':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'profile':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'login':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case 'reading':
        return `Read daily plan ${activity.data?.day ? `for day ${activity.data.day}` : ''}`;
      case 'bible_reading':
        return `Read ${activity.data?.passage || 'Bible passage'} ${activity.data?.version ? `(${activity.data.version})` : ''}`;
      case 'chat':
        return 'Participated in community chat';
      case 'profile':
        return 'Updated profile information';
      case 'login':
        return 'Signed into the app';
      default:
        return 'Unknown activity';
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 2) {
      return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getActivityStats = () => {
    const stats = {
      total: activities.length,
      today: 0,
      thisWeek: 0,
      types: {} as Record<string, number>
    };

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    activities.forEach(activity => {
      const activityDate = activity.timestamp?.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp);
      
      if (activityDate >= todayStart) {
        stats.today++;
      }
      if (activityDate >= weekStart) {
        stats.thisWeek++;
      }

      stats.types[activity.type] = (stats.types[activity.type] || 0) + 1;
    });

    return stats;
  };

  const stats = getActivityStats();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Activity History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Activity Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
            <p className="text-sm text-gray-600">Today</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.thisWeek}</p>
            <p className="text-sm text-gray-600">This Week</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="reading">Reading</SelectItem>
              <SelectItem value="bible_reading">Bible</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="profile">Profile</SelectItem>
              <SelectItem value="login">Login</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activities List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
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
                  className="mt-2"
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
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{getActivityDescription(activity)}</p>
                  <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHistory;
