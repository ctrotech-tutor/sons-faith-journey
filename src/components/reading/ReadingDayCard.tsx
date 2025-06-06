
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Lock, BookOpen, ChevronRight, Calendar, SquareCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useActivitySync } from '@/lib/hooks/useActivitySync';

interface ReadingDayCardProps {
  dayData: {
    day: number;
    title: string;
    description: string;
    passages: string[];
    theme?: string;
  };
  isCompleted: boolean;
  isToday: boolean;
  isLocked: boolean;
  isProcessing?: boolean;
  onToggleComplete: (completed: boolean) => void;
  animationDelay?: number;
}

const ReadingDayCard: React.FC<ReadingDayCardProps> = ({
  dayData,
  isCompleted,
  isToday,
  isLocked,
  isProcessing = false,
  onToggleComplete,
  animationDelay = 0
}) => {
  const { loading } = useActivitySync();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.4 }}
      className="h-full"
    >
      <Card 
        className={`
          border-2 h-full flex flex-col
          ${isToday ? 'border-purple-500 dark:border-purple-400 shadow-lg shadow-purple-100 dark:shadow-purple-900/20' : 'border-gray-200 dark:border-gray-700'}
          ${isLocked ? 'opacity-60' : ''}
          ${isCompleted ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/40' : 'bg-white dark:bg-gray-800'}
        `}
      >
        <CardContent className="p-4 md:p-6 flex-grow space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Badge 
                variant={isCompleted ? "success" : isToday ? "purple" : "outline"}
                className={`
                  ${isCompleted ? 'bg-green-500 hover:bg-green-600' : isToday ? 'bg-purple-500 hover:bg-purple-600' : ''}
                `}
              >
                Day {dayData.day}
              </Badge>
              
              {isToday && !isCompleted && (
                <Badge variant="outline" className="animate-pulse bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700">
                  Today
                </Badge>
              )}
            </div>
            
            {isLocked ? (
              <Lock className="h-5 w-5 text-gray-400" />
            ) : isCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
            ) : (
              <BookOpen className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            )}
          </div>

          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
            {dayData.title}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {dayData.description}
          </p>
          
          <div className="pt-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Today's Reading:
            </div>
            <div className="flex flex-wrap gap-1">
              {dayData.passages.map((passage, i) => (
                <Badge
                  key={i}
                  variant="outline" 
                  className="text-xs bg-gray-50 dark:bg-gray-700/50"
                >
                  {passage}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-4 md:px-6 pb-4 pt-0 flex flex-wrap justify-between gap-2">
          <Link 
            to={`/bible/${dayData.passages[0]}/${dayData.day}`}
            className={`${isLocked ? 'pointer-events-none opacity-50' : ''}`}
          >
            <Button 
              variant="outline"
              size="sm" 
              className="text-xs"
              disabled={isLocked}
            >
              <BookOpen className="mr-1 h-3 w-3" />
              Read
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
          
          {!isLocked && (
            <Button
              variant={isCompleted ? "ghost" : "outline"}
              size="sm"
              className={`text-xs ${isCompleted ? 'text-green-600 hover:text-green-700 dark:text-green-400' : ''}`}
              onClick={() => onToggleComplete(!isCompleted)}
              disabled={isProcessing || loading}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Updating...
                </>
              ) : isCompleted ? (
                <>
                  <SquareCheck className="mr-1 h-3 w-3" />
                  Completed
                </>
              ) : (
                <>
                  <Calendar className="mr-1 h-3 w-3" />
                  Mark Complete
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ReadingDayCard;
