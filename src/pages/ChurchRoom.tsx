
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
      
      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className={cn(
          "border-b p-2 max-h-32 overflow-y-auto",
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-yellow-50 border-yellow-200'
        )}>
          <div className="flex items-center space-x-2 mb-2">
            <Pin className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Pinned Messages
            </span>
          </div>
          {pinnedMessages.map(messageId => {
            const message = messages.find(m => m.id === messageId);
            if (!message) return null;
            return (
              <div key={messageId} className={cn(
                "text-xs p-2 rounded mb-1",
                theme === 'dark' ? 'bg-gray-700' : 'bg-white'
              )}>
                <span className="font-medium">{message.senderName}:</span> {message.message}
              </div>
            );
          })}
        </div>
      )}
      
      <div className="flex-1 relative">
        <div 
          ref={messagesContainerRef}
          className="h-full overflow-y-auto"
        >
          <MessagesList
            messages={messages}
            currentUserId={user.uid}
            onLongPress={setShowReactions}
            onReport={handleReportMessage}
            onPin={userProfile?.isAdmin ? togglePinMessage : undefined}
            canModerate={userProfile?.isAdmin}
            pinnedMessages={pinnedMessages}
            unreadMessageIndex={getUnreadMessageIndex()}
          />
          
          {/* Unread messages marker */}
          {unreadCount > 0 && getUnreadMessageIndex() >= 0 && (
            <div ref={unreadMarkerRef} className="relative">
              <div className="absolute left-0 right-0 flex items-center">
                <div className="flex-1 h-px bg-red-500"></div>
                <Badge variant="destructive" className="mx-2 text-xs">
                  {unreadCount} new message{unreadCount > 1 ? 's' : ''}
                </Badge>
                <div className="flex-1 h-px bg-red-500"></div>
              </div>
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollToBottom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-4 right-4"
          >
            <Button
              onClick={scrollToBottom}
              size="sm"
              className="rounded-full h-10 w-10 p-0 shadow-lg bg-purple-600 hover:bg-purple-700"
            >
              <ArrowDown className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </motion.div>
        )}
      </div>

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
