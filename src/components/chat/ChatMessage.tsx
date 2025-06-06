
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Flag, Trash2, Clock, Check, CheckCheck, Heart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/context/ThemeContext';

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
  const { theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLiked, setIsLiked] = useState(false);

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

  const handleReport = () => {
    onReport();
    setShowMenu(false);
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
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col space-y-2 p-4 rounded-2xl max-w-[85%] relative group transition-all duration-200 hover:shadow-lg',
        isOwn 
          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white ml-auto shadow-purple-200' 
          : theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700 text-gray-100 mr-auto shadow-gray-900'
            : 'bg-white shadow-sm border border-gray-100 mr-auto shadow-gray-200'
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {/* Sender Name */}
      {!isOwn && (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
            {message.senderName}
          </p>
        </div>
      )}

      {/* Message Content */}
      {message.message && (
        <p className={cn(
          'text-sm leading-relaxed break-words',
          isOwn ? 'text-white' : theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
        )}>
          {message.message}
        </p>
      )}

      {/* Media Content */}
      {message.mediaUrl && (
        <div className="mt-2 rounded-lg overflow-hidden">
          {message.mediaType === 'image' && (
            <img
              src={message.mediaUrl}
              alt="Shared image"
              className="max-w-full h-auto rounded-lg cursor-pointer hover:scale-105 transition-transform"
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
              className={cn(
                "text-xs px-2 py-1 cursor-pointer hover:scale-105 transition-transform",
                isOwn ? "bg-white/20 text-white" : "bg-purple-100 text-purple-700"
              )}
            >
              {getReactionEmoji(key)} {count}
            </Badge>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center justify-between mt-2">
        {/* Timestamp and Status */}
        <div className={cn(
          'flex items-center space-x-2 text-xs',
          isOwn ? 'text-purple-200' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
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

        {/* Quick React Button */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-white/20"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={cn("h-3 w-3", isLiked ? "fill-red-500 text-red-500" : "text-gray-400")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-white/20"
            onClick={onLongPress}
          >
            <MessageCircle className="h-3 w-3 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Menu Button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-white/20"
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
          className={cn(
            "absolute top-8 right-2 rounded-lg shadow-lg border p-2 z-10 min-w-[120px]",
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onLongPress();
              setShowMenu(false);
            }}
            className={cn(
              "w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700",
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            )}
          >
            React
          </Button>
          
          {!isOwn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReport}
              className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Flag className="h-3 w-3 mr-2" />
              Report
            </Button>
          )}
          
          {(isOwn || canModerate) && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-3 w-3 mr-2" />
              Delete
            </Button>
          )}
        </motion.div>
      )}

      {/* Message Reported Indicator */}
      {message.reported && (
        <div className="absolute -top-1 -right-1">
          <Badge variant="destructive" className="text-xs px-1 py-0">
            Reported
          </Badge>
        </div>
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
