
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MessageCircle, BookOpen, User, Clock, Filter, Search, BarChart, Download, Trash2, RefreshCw, AlertCircle, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/hooks/use-toast';
import { useActivitySync, UserActivity, ActivityFilter } from '@/lib/hooks/useActivitySync';
import { formatDistanceToNow, format } from 'date-fns';

const ActivityHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    recentActivities, 
    clearActivity, 
    clearAllActivities,
    filterActivities,
    loading,
    error,
    lastSync
  } = useActivitySync();
  const [filter, setFilter] = useState<ActivityFilter>({
    type: null,
    timeRange: 'all',
    searchTerm: '',
  });
  
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<UserActivity | null>(null);
  const [view, setView] = useState<'list' | 'calendar' | 'stats'>('list');

  // Apply filters whenever they change or activities update
  useEffect(() => {
    setFilteredActivities(filterActivities(recentActivities, filter));
  }, [recentActivities, filter, filterActivities]);

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

  const getActivityDescription = (activity: UserActivity) => {
    switch (activity.type) {
      case 'reading_completed':
        return `Read daily plan ${activity.data?.day ? `for day ${activity.data.day}` : ''}`;
      case 'bible_reading':
        return `Read ${activity.data?.passage || 'Bible passage'} ${activity.data?.version ? `(${activity.data.version})` : ''}`;
      case 'chat_message':
        return `Sent a message in ${activity.data?.room || 'chat'}`;
      case 'community_post':
        return activity.data?.comment ? 'Commented on a post' : 'Created a community post';
      case 'profile_update':
        return 'Updated profile information';
      case 'login':
        return 'Signed into the app';
      default:
        return 'Unknown activity';
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

  const formatFullTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'PPpp'); // E.g., "Monday, January 1, 2025, 12:00 PM"
    } catch (e) {
      return 'Unknown time';
    }
  };

  const getActivityStats = () => {
    const stats = {
      total: recentActivities.length,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      types: {} as Record<string, number>
    };

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    recentActivities.forEach(activity => {
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

  const stats = getActivityStats();

  const handleClearActivity = async (id: string) => {
    if (await clearActivity(id)) {
      // Success is handled by the toast in the hook
    }
  };

  const handleClearAllActivities = async () => {
    if (window.confirm('Are you sure you want to clear all activity history?')) {
      if (await clearAllActivities()) {
        // Success is handled by the toast in the hook
      }
    }
  };

  const handleExportActivities = () => {
    try {
      const dataStr = JSON.stringify(recentActivities, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `activity-history-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Export successful",
        description: "Your activity history has been downloaded.",
      });
    } catch (err) {
      console.error('Export error:', err);
      toast({
        title: "Export failed",
        description: "Could not export your activity history.",
        variant: "destructive"
      });
    }
  };

  const refreshTimeAgo = () => {
    if (!lastSync) return '';
    return `Updated ${formatDistanceToNow(lastSync, { addSuffix: true })}`;
  };

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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Error Loading Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='dark:bg-transparent border-none p-0'>
      <CardHeader className="w-full">
        <div className='flex flex-col gap-2'>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 flex-shrink-0" />
            Activity History
          </CardTitle>
          <CardDescription className='line-clamp-1 text-xs'>
            {refreshTimeAgo()}
          </CardDescription>
        </div>
        <div className="flex items-center justify-center gap-2 overflow-x-auto w-full">
          <Tabs value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger className='flex items-center justify-center' value="list">List</TabsTrigger>
              <TabsTrigger className='flex items-center justify-center' value="stats">Stats</TabsTrigger>
              <TabsTrigger className='flex items-center justify-center' value="calendar">Calendar</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {view === 'stats' ? (
          <div className="space-y-6">
            {/* Activity Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">{stats.total}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Activities</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{stats.today}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-300">{stats.thisWeek}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-300">{stats.thisMonth}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              </div>
            </div>

            {/* Activity Type Breakdown */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Activity Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(stats.types).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getActivityIcon(type)}
                      <span className="ml-2 capitalize text-sm">{type.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 dark:bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : view === 'calendar' ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Calendar view coming soon!
            </p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
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
                  <SelectItem value="login">App Logins</SelectItem>
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

            {/* Activity Stats - Quick Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.total}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.today}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.thisWeek}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
              </div>
            </div>

            {/* Activities List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    {filter.searchTerm || filter.type !== null || filter.timeRange !== 'all' 
                      ? 'No activities match your filters' 
                      : 'No recent activity'}
                  </p>
                  {(filter.searchTerm || filter.type !== null || filter.timeRange !== 'all') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilter({ type: null, timeRange: 'all', searchTerm: '' })}
                      className="mt-2"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                filteredActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group"
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-${activity.type === 'bible_reading' ? 'purple' : activity.type === 'community_post' ? 'orange' : 'blue'}-100 dark:bg-opacity-20`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{getActivityDescription(activity)}</p>
                        <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-xs capitalize hidden sm:inline-flex">
                      {activity.type.replace(/_/g, ' ')}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearActivity(activity.id || '');
                      }}
                    >
                      <EyeOff className="h-3 w-3" />
                      <span className="sr-only">Hide</span>
                    </Button>
                  </motion.div>
                ))
              )}

              {selectedActivity && (
                <div className="fixed inset-0 bg-black/50 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Activity Details</h3>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setSelectedActivity(null)}
                      >
                        <User className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full bg-${selectedActivity.type === 'bible_reading' ? 'purple' : selectedActivity.type === 'community_post' ? 'orange' : 'blue'}-100 dark:bg-opacity-20`}>
                          {getActivityIcon(selectedActivity.type)}
                        </div>
                        <div>
                          <p className="font-medium">{getActivityDescription(selectedActivity)}</p>
                          <p className="text-sm text-gray-500">{formatFullTimestamp(selectedActivity.timestamp)}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Activity Type:</p>
                        <Badge className="capitalize">
                          {selectedActivity.type.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      {selectedActivity.data && Object.keys(selectedActivity.data).length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                          <p className="text-sm font-medium mb-1">Additional Details:</p>
                          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(selectedActivity.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedActivity(null)}
                      >
                        Close
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          handleClearActivity(selectedActivity.id || '');
                          setSelectedActivity(null);
                        }}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {filteredActivities.length} activities displayed
          {filter.searchTerm || filter.type || filter.timeRange !== 'all'
            ? ' (filtered)'
            : ''}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportActivities}
            className="hidden sm:flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearAllActivities}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Clear All</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ActivityHistory;
