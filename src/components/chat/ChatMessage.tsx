
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Flag, Trash2, Clock, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: {
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'audio' | 'video';
    reactions: { [key: string]: number };
    userReactions: { [userId: string]: string };
    reported: boolean;
    timestamp: any;
    status?: 'pending' | 'sent' | 'delivered';
  };
  isOwn: boolean;
  onLongPress: () => void;
  onReport: () => void;
  canModerate?: boolean;
  showStatus?: boolean;
}

const ChatMessage = ({ 
  message, 
  isOwn, 
  onLongPress, 
  onReport, 
  canModerate,
  showStatus 
}: ChatMessageProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      onLongPress();
      setLongPressTimer(null);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'pending':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-500" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col space-y-2 p-3 rounded-xl max-w-[80%] relative group',
        isOwn 
          ? 'bg-purple-600 text-white ml-auto' 
          : 'bg-white shadow-sm border mr-auto'
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {/* Sender Name */}
      {!isOwn && (
        <p className="text-xs font-semibold text-purple-600 mb-1">
          {message.senderName}
        </p>
      )}

      {/* Message Content */}
      {message.message && (
        <p className={cn(
          'text-sm leading-relaxed',
          isOwn ? 'text-white' : 'text-gray-800'
        )}>
          {message.message}
        </p>
      )}

      {/* Media Content */}
      {message.mediaUrl && (
        <div className="mt-2">
          {message.mediaType === 'image' && (
            <img
              src={message.mediaUrl}
              alt="Shared image"
              className="max-w-full h-auto rounded-lg"
            />
          )}
          {message.mediaType === 'video' && (
            <video
              src={message.mediaUrl}
              controls
              className="max-w-full h-auto rounded-lg"
            />
          )}
          {message.mediaType === 'audio' && (
            <audio
              src={message.mediaUrl}
              controls
              className="w-full"
            />
          )}
        </div>
      )}

      {/* Reactions */}
      {Object.keys(message.reactions).length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {Object.entries(message.reactions).map(([key, count]) => (
            <Badge
              key={key}
              variant="secondary"
              className="text-xs px-2 py-1 bg-white/20 text-current"
            >
              {getReactionEmoji(key)} {count}
            </Badge>
          ))}
        </div>
      )}

      {/* Timestamp and Status */}
      <div className={cn(
        'flex items-center justify-between text-xs mt-2',
        isOwn ? 'text-purple-200' : 'text-gray-500'
      )}>
        <span>
          {message.timestamp?.toDate?.()?.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) || 'Now'}
        </span>
        
        {isOwn && showStatus && (
          <div className="flex items-center space-x-1">
            {getStatusIcon()}
          </div>
        )}
      </div>

      {/* Menu Button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreVertical className="h-3 w-3" />
        </Button>
      </div>

      {/* Dropdown Menu */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-8 right-2 bg-white rounded-lg shadow-lg border p-2 z-10 min-w-[120px]"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onLongPress();
              setShowMenu(false);
            }}
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
          >
            React
          </Button>
          
          {!isOwn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onReport();
                setShowMenu(false);
              }}
              className="w-full justify-start text-red-600 hover:bg-red-50"
            >
              <Flag className="h-3 w-3 mr-2" />
              Report
            </Button>
          )}
          
          {(isOwn || canModerate) && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 mr-2" />
              Delete
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

const getReactionEmoji = (key: string) => {
  const emojis = {
    pray: '🙏',
    love: '❤️',
    fire: '🔥',
    thumbs: '👍',
    amen: '✨'
  };
  return emojis[key as keyof typeof emojis] || '👍';
};

export default ChatMessage;
