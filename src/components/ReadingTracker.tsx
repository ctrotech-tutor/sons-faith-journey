
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useActivitySync } from '@/lib/hooks/useActivitySync';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Circle, Calendar, BarChart3 } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import ReadingCalendar from './ReadingCalendar';

const ReadingTracker = () => {
  const { user } = useAuth();
  const { userStats, updateReadingProgress } = useActivitySync();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const today = new Date().toDateString();
  const todayDay = Math.ceil((new Date().getTime() - new Date('2025-06-01').getTime()) / (1000 * 60 * 60 * 24));
  const isCompletedToday = userStats.readingProgress.includes(todayDay);

  const markAsCompleted = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      await updateReadingProgress(todayDay, true);
      
      toast({
        title: 'Reading Completed!',
        description: "Great job staying committed to God's Word today!",
      });
    } catch (error) {
      console.error('Error updating reading progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to save progress. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Please sign in to track your reading progress.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Today's Progress</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Calendar View</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>Today's Reading - Day {todayDay}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Today's Reading */}
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {isCompletedToday ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium">Today's Reading</p>
                    <p className="text-sm text-gray-600">
                      {isCompletedToday ? 'Completed!' : 'Mark as completed when finished'}
                    </p>
                  </div>
                </div>
                {!isCompletedToday && (
                  <Button
                    onClick={markAsCompleted}
                    disabled={loading}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? 'Saving...' : 'Complete'}
                  </Button>
                )}
              </div>

              {/* Progress Stats */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-3 bg-green-50 rounded-lg"
                >
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((userStats.totalReadingDays / 90) * 100)}%
                  </div>
                  <p className="text-sm text-green-700">Complete</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-center p-3 bg-orange-50 rounded-lg"
                >
                  <div className="text-2xl font-bold text-orange-600">
                    {userStats.readingStreak}
                  </div>
                  <p className="text-sm text-orange-700">Day Streak</p>
                </motion.div>
              </div>

              {/* Recent Progress */}
              <div>
                <h4 className="font-medium mb-2">Recent Days</h4>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }, (_, i) => {
                    const dayNum = todayDay - (6 - i);
                    const isCompleted = userStats.readingProgress.includes(dayNum);
                    
                    return (
                      <div
                        key={dayNum}
                        className={`w-8 h-8 rounded flex items-center justify-center text-xs ${
                          isCompleted 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <ReadingCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReadingTracker;
