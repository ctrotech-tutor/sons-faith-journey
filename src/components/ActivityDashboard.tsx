
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  MessageCircle, 
  Users,
  TrendingUp,
  Calendar,
  Heart,
  Flame,
  FileText,
  Filter,
  Trash2,
  RefreshCw,
  Search,
  Clock,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { useActivitySync, ActivityFilter, UserActivity } from '@/lib/hooks/useActivitySync';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const ActivityDashboard = () => {
  const { 
    userStats, 
    recentActivities, 
    clearActivity, 
    clearAllActivities,
    filterActivities,
    loading,
    error,
    lastSync
  } = useActivitySync();
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const [filter, setFilter] = useState<ActivityFilter>({
    type: null,
    timeRange: 'all',
    searchTerm: '',
    sortBy: 'newest'
  });
  
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayCount, setDisplayCount] = useState(3);

  // Determine initial display count based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setDisplayCount(3);
      } else if (window.innerWidth < 1024) {
        setDisplayCount(4);
      } else {
        setDisplayCount(5);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply filters whenever they change or activities update
  useEffect(() => {
    try {
      setFilteredActivities(filterActivities(recentActivities, filter));
    } catch (err) {
      console.error("Error filtering activities:", err);
      toast({
        title: "Filtering error",
        description: "There was a problem filtering your activities.",
        variant: "destructive"
      });
    }
  }, [recentActivities, filter, filterActivities, toast]);

  // Show error if there's an issue with activity sync
  useEffect(() => {
    if (error) {
      toast({
        title: "Activity sync error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'reading_completed': return <BookOpen className="h-4 w-4" />;
      case 'chat_message': return <MessageCircle className="h-4 w-4" />;
      case 'community_post': return <Users className="h-4 w-4" />;
      case 'profile_update': return <Heart className="h-4 w-4" />;
      case 'bible_reading': return <BookOpen className="h-4 w-4 text-purple-600" />;
      case 'login': return <Clock className="h-4 w-4" />;
      case 'system': return <AlertCircle className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: UserActivity) => {
    if (!activity) return "Unknown activity";
    
    switch (activity.type) {
      case 'reading_completed':
        return `Completed Day ${activity.data?.day || '?'} reading`;
      case 'bible_reading':
        return `Read ${activity.data?.passage || 'Bible passage'} for ${activity.data?.timeSpent || 0} minutes`;
      case 'chat_message':
        return 'Sent a message in chat';
      case 'community_post':
        return 'Shared a community post';
      case 'profile_update':
        return 'Updated profile information';
      case 'login':
        return 'Logged into account';
      case 'system':
        return activity.data?.message || 'System activity';
      default:
        return 'Recent activity';
    }
  };
  
  const formatActivityTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return 'Unknown time';
    }
  };

  const handleClearActivity = async (id: string) => {
    try {
      if (await clearActivity(id)) {
        // Success is handled by the toast in the hook
      }
    } catch (err) {
      console.error("Error clearing activity:", err);
      toast({
        title: "Error removing activity",
        description: "There was a problem removing this activity.",
        variant: "destructive"
      });
    }
  };

  const handleClearAllActivities = async () => {
    if (window.confirm('Are you sure you want to clear all activity history?')) {
      try {
        if (await clearAllActivities()) {
          // Success is handled by the toast in the hook
        }
      } catch (err) {
        console.error("Error clearing all activities:", err);
        toast({
          title: "Error clearing history",
          description: "There was a problem clearing your activity history.",
          variant: "destructive"
        });
      }
    }
  };

  const refreshTimeAgo = () => {
    if (!lastSync) return '';
    return `Updated ${formatDistanceToNow(lastSync, { addSuffix: true })}`;
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      // The useEffect hook with the filter dependency will re-run
      // Just apply the same filter again to trigger a refresh
      setFilter({...filter});
      sonnerToast.success("Refreshed", {
        description: "Activity data has been refreshed."
      });
    }, 1000);
  };

  const loadMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
              <CardContent className="p-3 md:p-4 text-center space-y-1 md:space-y-2">
                <div
                  className={`mx-auto w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-800/30 text-${stat.color}-600 dark:text-${stat.color}-300 shadow-sm`}
                >
                  {stat.icon}
                </div>
                <div
                  className={`text-xl md:text-2xl font-extrabold text-${stat.color}-600 dark:text-${stat.color}-300`}
                >
                  {stat.value}
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
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
          <CardHeader className="flex flex-row items-center justify-between px-4 md:px-6 py-3 md:py-4">
            <div>
              <CardTitle className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 text-base md:text-lg font-semibold">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span>Recent Activities</span>
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {loading || isRefreshing ? 'Loading activities...' : refreshTimeAgo()}
              </p>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleManualRefresh}
                disabled={loading || isRefreshing}
                className="flex items-center gap-1 h-8 w-8 md:h-auto md:w-auto p-0 md:p-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Refresh</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 h-8 w-8 md:h-auto md:w-auto p-0 md:p-2"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden md:inline">Filter</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleClearAllActivities}
                disabled={recentActivities.length === 0 || loading}
                className="flex items-center gap-1 hover:text-red-600 h-8 w-8 md:h-auto md:w-auto p-0 md:p-2"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden md:inline">Clear</span>
              </Button>
            </div>
          </CardHeader>

          {showFilters && (
            <div className="px-4 md:px-6 pb-2">
              <div className="flex flex-col sm:flex-row gap-2 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search activities..."
                    value={filter.searchTerm}
                    onChange={(e) => setFilter({...filter, searchTerm: e.target.value})}
                    className="pl-8"
                  />
                </div>
                <Select
                  value={filter.type || 'all'}
                  onValueChange={(value) => setFilter({...filter, type: value === 'all' ? null : value})}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="reading_completed">Reading Completed</SelectItem>
                    <SelectItem value="bible_reading">Bible Reading</SelectItem>
                    <SelectItem value="chat_message">Chat Messages</SelectItem>
                    <SelectItem value="community_post">Community Posts</SelectItem>
                    <SelectItem value="profile_update">Profile Updates</SelectItem>
                    <SelectItem value="login">Logins</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filter.timeRange || 'all'}
                  onValueChange={(value) => setFilter({...filter, timeRange: value as any})}
                >
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <CardContent className="px-4 md:px-6 py-2 md:py-3">
            {loading || isRefreshing ? (
              <div className="flex justify-center py-6 md:py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {filteredActivities.slice(0, displayCount).map((activity, index) => (
                  <motion.div
                    key={activity.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="flex items-center space-x-3 p-2 md:p-3 bg-gray-100 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700 group relative"
                  >
                    <div className="flex-shrink-0 p-2 rounded-full bg-gradient-to-br from-purple-200 to-purple-400 dark:from-purple-600 dark:to-purple-700 shadow-inner">
                      {getActivityIcon(activity.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                        {getActivityText(activity)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatActivityTime(activity.timestamp)}
                      </p>
                    </div>

                    <Badge variant="secondary" className="text-xs capitalize hidden md:inline-flex">
                      {activity.type.replace(/_/g, ' ')}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleClearActivity(activity.id || '')}
                    >
                      <EyeOff className="h-3 w-3" />
                      <span className="sr-only">Hide</span>
                    </Button>
                  </motion.div>
                ))}

                {filteredActivities.length > displayCount && (
                  <div className="flex justify-center pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={loadMore}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-800"
                    >
                      Load More
                    </Button>
                  </div>
                )}

                {filteredActivities.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium">No recent activities</p>
                    <p className="text-sm">
                      {filter.searchTerm || filter.type || filter.timeRange !== 'all'
                        ? 'Try changing your filters to see more activities.'
                        : 'Start reading or chatting to see your journey unfold.'}
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3 pb-3 px-4 md:px-6">
            <Button
              variant="link"
              size="sm"
              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 p-0 h-auto"
              onClick={() => window.location.href = '/profile?tab=activity'}
            >
              View all activities
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              {filteredActivities.length} activities
            </p>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Journey Insights Card - Optimized for mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      >
        <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl">
          <CardHeader className="px-4 md:px-6 py-4">
            <CardTitle className="text-lg md:text-xl font-semibold text-purple-700 dark:text-purple-300">
              Your Journey Insights
            </CardTitle>
          </CardHeader>

          <CardContent className="px-4 md:px-6 py-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Reading Completion</span>
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                {Math.round((userStats.totalReadingDays / 90) * 100)}%
              </span>
            </div>

            <motion.div
              className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min((userStats.totalReadingDays / 90) * 100, 100)}%`,
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="bg-gradient-to-r from-purple-500 to-purple-700 h-2 rounded-full"
              />
            </motion.div>

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
