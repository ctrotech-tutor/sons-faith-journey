
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  message: {
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'audio' | 'video';
    reactions?: { [key: string]: number };
    userReactions?: { [userId: string]: string };
    reported?: boolean;
    timestamp: any;
  };
  isOwn: boolean;
  onLongPress?: () => void;
  onReport?: () => void;
  onDelete?: () => void;
  canModerate?: boolean;
}

const ChatMessage = ({ 
  message, 
  isOwn, 
  onLongPress, 
  onReport, 
  onDelete, 
  canModerate 
}: ChatMessageProps) => {
  const [showActions, setShowActions] = useState(false);

  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress();
    } else {
      setShowActions(true);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} relative group`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl cursor-pointer select-none ${
          isOwn
            ? 'bg-[#FF9606] text-white'
            : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
        } ${message.reported ? 'opacity-50 border-red-300' : ''}`}
        onTouchStart={handleLongPress}
        onContextMenu={(e) => {
          e.preventDefault();
          handleLongPress();
        }}
      >
        {/* Sender name for others' messages */}
        {!isOwn && (
          <div className="text-xs font-medium text-purple-600 mb-1">
            {message.senderName}
          </div>
        )}

        {/* Media content */}
        {message.mediaUrl && (
          <div className="mb-2">
            {message.mediaType === 'image' && (
              <img 
                src={message.mediaUrl} 
                alt="Shared" 
                className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.mediaUrl, '_blank')}
              />
            )}
            {message.mediaType === 'audio' && (
              <audio controls className="w-full">
                <source src={message.mediaUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
            {message.mediaType === 'video' && (
              <video controls className="rounded-lg max-w-full">
                <source src={message.mediaUrl} type="video/mp4" />
                Your browser does not support the video element.
              </video>
            )}
          </div>
        )}

        {/* Message text */}
        {message.message && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </p>
        )}

        {/* Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(message.reactions).map(([reaction, count]) => (
              <span
                key={reaction}
                className={`text-xs px-2 py-1 rounded-full bg-white/20 ${
                  isOwn ? 'text-white' : 'text-gray-600 bg-gray-100'
                }`}
              >
                {getReactionEmoji(reaction)} {count}
              </span>
            ))}
          </div>
        )}

        {/* Timestamp and status */}
        <div className={`text-xs mt-1 ${
          isOwn ? 'text-white/70' : 'text-gray-500'
        }`}>
          {formatTime(message.timestamp)}
          {message.reported && (
            <span className="ml-2 text-red-500">
              <Flag className="h-3 w-3 inline" />
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-0 right-0 bg-white rounded-lg shadow-lg border p-2 flex space-x-2 z-10"
        >
          {!isOwn && onReport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onReport();
                setShowActions(false);
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Flag className="h-4 w-4" />
            </Button>
          )}
          
          {canModerate && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDelete();
                setShowActions(false);
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(false)}
            className="text-gray-600"
          >
            Cancel
          </Button>
        </motion.div>
      )}

      {/* Click outside to close actions */}
      {showActions && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowActions(false)}
        />
      )}
    </motion.div>
  );
};

const getReactionEmoji = (reaction: string): string => {
  const emojiMap: { [key: string]: string } = {
    pray: '🙏',
    love: '❤️',
    fire: '🔥',
    thumbs: '👍',
    amen: '✨'
  };
  return emojiMap[reaction] || '👍';
};

export default ChatMessage;
