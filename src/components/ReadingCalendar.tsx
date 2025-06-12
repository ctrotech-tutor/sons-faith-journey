
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';

interface ReadingProgress {
  [date: string]: boolean;
}

const ReadingCalendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [progress, setProgress] = useState<ReadingProgress>({});
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProgress(userData.readingProgress || {});
      }
    } catch (error) {
      console.error('Error loading reading progress:', error);
    }
  };

  const toggleDayCompletion = async (dateString: string) => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const newProgress = { 
        ...progress, 
        [dateString]: !progress[dateString] 
      };
      
      await updateDoc(doc(db, 'users', user.uid), {
        readingProgress: newProgress
      });

      setProgress(newProgress);
      
      toast({
        title: progress[dateString] ? 'Day Unmarked' : 'Day Completed!',
        description: progress[dateString] 
          ? 'Reading progress unmarked for this day'
          : "Great job staying committed to God's Word!",
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

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getCompletionPercentage = () => {
    const totalDays = 90;
    const completedDays = Object.values(progress).filter(Boolean).length;
    return Math.round((completedDays / totalDays) * 100);
  };

  const getStreakCount = () => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      
      if (progress[dateString]) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = date.toDateString();
      const isCompleted = progress[dateString];
      const isToday = date.toDateString() === new Date().toDateString();
      const isPast = date < new Date();

      days.push(
        <motion.button
          key={day}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleDayCompletion(dateString)}
          disabled={loading}
          className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
            isCompleted
              ? 'bg-green-600 text-white'
              : isToday
              ? 'bg-purple-100 text-purple-800 border-2 border-purple-600'
              : isPast
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-gray-50 text-gray-400'
          }`}
        >
          {day}
          {isCompleted && (
            <CheckCircle className="h-3 w-3 absolute" />
          )}
        </motion.button>
      );
    }

    return days;
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Please sign in to view your reading calendar.</p>
        </CardContent>
      </Card>
    );
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Progress Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-4 bg-green-50 rounded-lg"
        >
          <div className="text-3xl font-bold text-green-600">
            {getCompletionPercentage()}%
          </div>
          <p className="text-sm text-green-700">Complete</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center p-4 bg-orange-50 rounded-lg"
        >
          <div className="text-3xl font-bold text-orange-600">
            {getStreakCount()}
          </div>
          <p className="text-sm text-orange-700">Day Streak</p>
        </motion.div>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Reading Calendar</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold min-w-[140px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>Click on any day to mark/unmark your reading progress</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReadingCalendar;
