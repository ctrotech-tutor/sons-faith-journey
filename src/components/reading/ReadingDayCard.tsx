
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Lock, BookOpen, ChevronRight, Calendar, SquareCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useActivitySync } from '@/lib/hooks/useActivitySync';
import AdvancedReadingFeatures from './AdvancedReadingFeatures';

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

  // Create the bible passage URL - encode the passage for the URL
  const getPassageUrl = () => {
    if (dayData.passages && dayData.passages.length > 0) {
      const passage = encodeURIComponent(dayData.passages[0]);
      return `/bible/${passage}/${dayData.day}`;
    }
    return `/bible`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.4 }}
      className="h-full"
    >
      <Card
        className={`
          relative h-full flex flex-col border border-gray-200 dark:border-gray-700
          rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm shadow-lg
          transition-all overflow-hidden
          ${isToday ? 'ring-2 ring-purple-500 dark:ring-purple-400' : ''}
          ${isLocked ? 'opacity-60' : ''}
          ${isCompleted ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/40' : ''}
        `}
      >
        <CardContent className="p-5 sm:p-6 flex-grow space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className={`
                  text-xs px-2 py-1 font-medium rounded-full
                  ${isCompleted ? 'bg-green-500/90 text-white' : ''}
                  ${isToday && !isCompleted ? 'bg-purple-500/90 text-white' : ''}
                `}
              >
                Day {dayData.day}
              </Badge>

              {isToday && !isCompleted && (
                <Badge className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700 animate-pulse rounded-full px-2 py-1">
                  Today
                </Badge>
              )}
            </div>

            {isLocked ? (
              <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            ) : isCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
            ) : (
              <BookOpen className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
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
                  className="text-xs px-2 py-0.5 bg-white/60 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-full"
                >
                  {passage}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-5 sm:px-6 pb-4 pt-0 flex flex-wrap justify-between gap-2">
          <Link
            to={getPassageUrl()}
            className={isLocked ? 'pointer-events-none opacity-50' : ''}
          >
            <Button
              variant="outline"
              size="sm"
              className="text-xs px-3 py-1.5 rounded-full"
              disabled={isLocked}
            >
              <BookOpen className="mr-1 h-4 w-4" />
              Read
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>

          {!isLocked && (
            <Button
              variant={isCompleted ? 'ghost' : 'outline'}
              size="sm"
              className={`
                text-xs px-3 py-1.5 rounded-full
                ${isCompleted ? 'text-green-600 hover:text-green-700 dark:text-green-400' : ''}
              `}
              onClick={() => onToggleComplete(!isCompleted)}
              disabled={isProcessing || loading}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : isCompleted ? (
                <>
                  <SquareCheck className="mr-1 h-4 w-4" />
                  Completed
                </>
              ) : (
                <>
                  <Calendar className="mr-1 h-4 w-4" />
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
