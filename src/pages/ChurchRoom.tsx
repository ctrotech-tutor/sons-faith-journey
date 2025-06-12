import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useChurchRoom } from '@/lib/hooks/useChurchRoom';
import { useTheme } from '@/lib/context/ThemeContext';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ChatHeader from '@/components/chat/ChatHeader';
import MessagesList from '@/components/chat/MessagesList';
import QueuedMessagesNotice from '@/components/chat/QueuedMessagesNotice';
import ChatInput from '@/components/chat/ChatInput';
import ReactionsOverlay from '@/components/chat/ReactionsOverlay';
import FileUploader from '@/components/chat/FileUploader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pin, PinOff, ArrowDown } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { cn } from '@/lib/utils';

const ChurchRoom = () => {
  const { theme } = useTheme();
  const { toast } = useToast();
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
  const [pinnedMessages, setPinnedMessages] = useState<string[]>([]);
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasScrolledToUnread, setHasScrolledToUnread] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const unreadMarkerRef = useRef<HTMLDivElement>(null);

  const reactionEmojis = [
    { emoji: '🙏', key: 'pray' },
    { emoji: '❤️', key: 'love' },
    { emoji: '🔥', key: 'fire' },
    { emoji: '👍', key: 'thumbs' },
    { emoji: '✨', key: 'amen' }
  ];

  // Load last read message and pinned messages from localStorage
  useEffect(() => {
    if (user) {
      const lastRead = localStorage.getItem(`churchRoom_lastRead_${user.uid}`);
      const pinned = localStorage.getItem(`churchRoom_pinned`);
      
      if (lastRead) {
        setLastReadMessageId(lastRead);
      }
      if (pinned) {
        setPinnedMessages(JSON.parse(pinned));
      }
    }
  }, [user]);

  // Calculate unread messages and scroll behavior
  useEffect(() => {
    if (!messages.length || !user) return;

    let unreadStartIndex = -1;
    
    if (lastReadMessageId) {
      const lastReadIndex = messages.findIndex(m => m.id === lastReadMessageId);
      unreadStartIndex = lastReadIndex + 1;
    } else {
      // If no last read message, consider all messages as read except new ones
      unreadStartIndex = messages.length;
    }

    const unreadMessages = messages.slice(unreadStartIndex);
    const newUnreadCount = unreadMessages.filter(m => m.senderId !== user.uid).length;
    setUnreadCount(newUnreadCount);

    // Only scroll to unread messages on initial load, not on new messages
    if (newUnreadCount > 0 && !hasScrolledToUnread && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      
      setTimeout(() => {
        if (unreadMarkerRef.current) {
          unreadMarkerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (unreadStartIndex < messages.length) {
          // Scroll to first unread message
          const messageElements = container.querySelectorAll('[data-message-id]');
          const firstUnreadElement = messageElements[unreadStartIndex];
          if (firstUnreadElement) {
            firstUnreadElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
        setHasScrolledToUnread(true);
      }, 100);
    }
  }, [messages, lastReadMessageId, user, hasScrolledToUnread]);

  // Check if user is at bottom of messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollToBottom(!isAtBottom && messages.length > 5);
      
      // Mark messages as read when user scrolls to bottom
      if (isAtBottom && unreadCount > 0) {
        markMessagesAsRead();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages, unreadCount]);

  const markMessagesAsRead = () => {
    if (!user || messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    setLastReadMessageId(lastMessage.id);
    localStorage.setItem(`churchRoom_lastRead_${user.uid}`, lastMessage.id);
    setUnreadCount(0);
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      markMessagesAsRead();
    }
  };

  const togglePinMessage = async (messageId: string) => {
    if (!userProfile?.isAdmin) {
      toast({
        title: 'Permission Denied',
        description: 'Only admins can pin messages.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const isPinned = pinnedMessages.includes(messageId);
      let updatedPinned;

      if (isPinned) {
        updatedPinned = pinnedMessages.filter(id => id !== messageId);
        toast({
          title: 'Message Unpinned',
          description: 'Message has been unpinned from the chat.'
        });
      } else {
        updatedPinned = [...pinnedMessages, messageId];
        toast({
          title: 'Message Pinned',
          description: 'Message has been pinned to the chat.'
        });
      }

      setPinnedMessages(updatedPinned);
      localStorage.setItem(`churchRoom_pinned`, JSON.stringify(updatedPinned));

      // Update message in database
      await updateDoc(doc(db, 'churchMessages', messageId), {
        pinned: !isPinned,
        pinnedBy: user?.uid,
        pinnedAt: !isPinned ? new Date() : null
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: 'Error',
        description: 'Failed to pin/unpin message.',
        variant: 'destructive'
      });
    }
  };

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

  const getUnreadMessageIndex = () => {
    if (!lastReadMessageId || !messages.length) return -1;
    return messages.findIndex(m => m.id === lastReadMessageId) + 1;
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
      "",
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
        "transition-colors duration-200 fixed bottom-0 w-full bg-white",
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
          onPin={userProfile?.isAdmin ? () => togglePinMessage(showReactions) : undefined}
          isPinned={pinnedMessages.includes(showReactions)}
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