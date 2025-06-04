
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QueuedMessagesNoticeProps {
  queuedCount: number;
  isOnline: boolean;
}

const QueuedMessagesNotice = ({ queuedCount, isOnline }: QueuedMessagesNoticeProps) => {
  if (queuedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40"
      >
        <div className={`px-4 py-3 rounded-full shadow-lg flex items-center space-x-3 ${
          isOnline 
            ? 'bg-green-500 text-white' 
            : 'bg-orange-500 text-white'
        }`}>
          {isOnline ? (
            <Send className="h-4 w-4 animate-pulse" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          
          <span className="text-sm font-medium">
            {isOnline 
              ? `Sending ${queuedCount} queued message${queuedCount > 1 ? 's' : ''}...`
              : `${queuedCount} message${queuedCount > 1 ? 's' : ''} queued`
            }
          </span>
          
          {!isOnline && (
            <Clock className="h-4 w-4" />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QueuedMessagesNotice;
