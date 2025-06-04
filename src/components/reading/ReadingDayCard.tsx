
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, BookOpen, Lock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import AdvancedReadingFeatures from './AdvancedReadingFeatures';
import { ReadingDay } from '@/data/readingPlan';

interface ReadingDayCardProps {
  dayData: ReadingDay;
  isCompleted: boolean;
  onToggleComplete: (completed: boolean) => void;
  animationDelay?: number;
}

const ReadingDayCard = ({ dayData, isCompleted, onToggleComplete, animationDelay = 0 }: ReadingDayCardProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const today = dayjs();
  const dayDate = dayjs(dayData.date);
  const isToday = today.isSame(dayDate, 'day');
  const isAvailable = today.isAfter(dayDate) || isToday;
  const isPast = today.isAfter(dayDate, 'day');

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'Knowing God': return 'purple';
      case 'Walking with God': return 'blue';
      case 'Serving God': return 'green';
      default: return 'gray';
    }
  };

  const themeColor = getThemeColor(dayData.theme);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
    >
      <Card
        className={cn(
          'transition-all duration-300 hover:shadow-lg',
          isCompleted && `border-${themeColor}-500 bg-${themeColor}-50`,
          isToday && `ring-2 ring-${themeColor}-400`,
          !isAvailable && 'opacity-60'
        )}
      >
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full bg-${themeColor}-100`}>
                <Calendar className={`h-5 w-5 text-${themeColor}-600`} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Day {dayData.day}</h3>
                <p className="text-sm text-gray-600">{dayData.monthName}</p>
              </div>
            </div>
            
            {isToday && (
              <span className={`px-3 py-1 bg-${themeColor}-100 text-${themeColor}-800 text-xs rounded-full font-medium`}>
                Today
              </span>
            )}
          </div>

          {/* Theme */}
          <div className={`p-3 bg-${themeColor}-50 rounded-lg border border-${themeColor}-200`}>
            <p className={`text-sm font-medium text-${themeColor}-800`}>
              Theme: {dayData.theme}
            </p>
          </div>

          {/* Passages */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Today's Reading:</h4>
            <div className="space-y-1">
              {dayData.passages.map((passage, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                >
                  <BookOpen className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">{passage}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            {isAvailable ? (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => onToggleComplete(!isCompleted)}
                  variant={isCompleted ? "outline" : "default"}
                  size="sm"
                  className={cn(
                    !isCompleted && `bg-${themeColor}-600 hover:bg-${themeColor}-700`
                  )}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  variant="outline"
                  size="sm"
                >
                  {showAdvanced ? 'Hide Tools' : 'Advanced'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center text-gray-500">
                <Lock className="h-4 w-4 mr-2" />
                <span className="text-sm">Unlocks {dayDate.format('MMM D')}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className={`bg-${themeColor}-600 h-2 rounded-full transition-all duration-500`}
              initial={{ width: 0 }}
              animate={{ width: isCompleted ? '100%' : '0%' }}
            />
          </div>

          {/* Advanced Features */}
          {showAdvanced && isAvailable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t pt-4"
            >
              <AdvancedReadingFeatures
                passage={dayData.passages.join('; ')}
                day={dayData.day}
                onUpdateProgress={() => {}}
              />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReadingDayCard;
