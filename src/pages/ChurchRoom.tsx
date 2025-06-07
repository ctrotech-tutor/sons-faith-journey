
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useChurchRoom } from '@/lib/hooks/useChurchRoom';
import { useTheme } from '@/lib/context/ThemeContext';
import ChatHeader from '@/components/chat/ChatHeader';
import MessagesList from '@/components/chat/MessagesList';
import QueuedMessagesNotice from '@/components/chat/QueuedMessagesNotice';
import ChatInput from '@/components/chat/ChatInput';
import ReactionsOverlay from '@/components/chat/ReactionsOverlay';
import FileUploader from '@/components/chat/FileUploader';
import { cn } from '@/lib/utils';

const ChurchRoom = () => {
  const { theme } = useTheme();
  const {
    messages,
    newMessage,
    setNewMessage,
    loading,
    isOnline,
    queuedMessages,
    sendMessage,
    addReaction,
    reportMessage,
    handleMediaUpload,
    user,
    userProfile
  } = useChurchRoom();

  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const reactionEmojis = [
    { emoji: '🙏', key: 'pray' },
    { emoji: '❤️', key: 'love' },
    { emoji: '🔥', key: 'fire' },
    { emoji: '👍', key: 'thumbs' },
    { emoji: '✨', key: 'amen' }
  ];

  const handleReactionAdd = async (messageId: string, reactionKey: string) => {
    await addReaction(messageId, reactionKey);
    setShowReactions(null);
  };

  const handleMediaUploadComplete = async (mediaUrl: string, mediaType: 'image' | 'audio' | 'video') => {
    await handleMediaUpload(mediaUrl, mediaType);
    setShowUploader(false);
  };

  const handleReportMessage = async (messageId: string) => {
    await reportMessage(messageId);
  };

  if (!user) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center p-4",
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      )}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "rounded-2xl p-8 text-center shadow-xl max-w-md",
            theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
          )}
        >
          <div className="text-6xl mb-4">🙏</div>
          <h2 className="text-2xl font-bold mb-4">Join the Community</h2>
          <p className={cn(
            "mb-6",
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )}>
            Please sign in to join the Church Room chat and connect with fellow believers.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(
      "h-screen flex flex-col transition-colors duration-200",
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    )}>
      <ChatHeader messageCount={messages.length} isOnline={isOnline} />
      
      <MessagesList
        messages={messages}
        currentUserId={user.uid}
        onLongPress={setShowReactions}
        onReport={handleReportMessage}
        canModerate={userProfile?.isAdmin}
      />

      <QueuedMessagesNotice 
        queuedCount={queuedMessages.length} 
        isOnline={isOnline} 
      />

      {/* Typing Indicator */}
      {isTyping && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-2"
        >
          <div className={cn(
            "flex items-center space-x-2 px-3 py-2 rounded-full w-fit",
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          )}>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className={cn(
              "text-xs",
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            )}>
              Someone is typing...
            </span>
          </div>
        </motion.div>
      )}

      <div className={cn(
        "transition-colors duration-200",
        theme === 'dark' ? 'bg-gray-900' : 'bg-transparent'
      )}>
        <ChatInput
          value={newMessage}
          onChange={setNewMessage}
          onSend={sendMessage}
          loading={loading}
          onAttachmentClick={() => setShowUploader(true)}
          placeholder="Share your thoughts with the community..."
          chatId="churchRoom"
        />
      </div>

      {/* Reactions Overlay */}
      {showReactions && (
        <ReactionsOverlay
          messageId={showReactions}
          reactions={reactionEmojis}
          onReaction={handleReactionAdd}
          onClose={() => setShowReactions(null)}
          userReaction={messages.find(m => m.id === showReactions)?.userReactions[user.uid]}
        />
      )}

      {/* File Uploader */}
      {showUploader && (
        <FileUploader
          onUpload={handleMediaUploadComplete}
          onClose={() => setShowUploader(false)}
        />
      )}
    </div>
  );
};

export default ChurchRoom;
