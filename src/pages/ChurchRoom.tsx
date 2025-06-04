
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useChurchRoom } from '@/lib/hooks/useChurchRoom';
import ChatHeader from '@/components/chat/ChatHeader';
import MessagesList from '@/components/chat/MessagesList';
import QueuedMessagesNotice from '@/components/chat/QueuedMessagesNotice';
import ChatInput from '@/components/chat/ChatInput';
import ReactionsOverlay from '@/components/chat/ReactionsOverlay';
import FileUploader from '@/components/chat/FileUploader';

const ChurchRoom = () => {
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600">Please sign in to join the Church Room chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <ChatHeader messageCount={messages.length} isOnline={isOnline} />
      
      <MessagesList
        messages={messages}
        currentUserId={user.uid}
        onLongPress={setShowReactions}
        onReport={reportMessage}
        canModerate={userProfile?.isAdmin}
      />

      <QueuedMessagesNotice 
        queuedCount={queuedMessages.length} 
        isOnline={isOnline} 
      />

      <div className="bg-transparent">
        <ChatInput
          value={newMessage}
          onChange={setNewMessage}
          onSend={sendMessage}
          loading={loading}
          onAttachmentClick={() => setShowUploader(true)}
          placeholder="Type a message..."
        />
      </div>

      {showReactions && (
        <ReactionsOverlay
          messageId={showReactions}
          reactions={reactionEmojis}
          onReaction={handleReactionAdd}
          onClose={() => setShowReactions(null)}
          userReaction={messages.find(m => m.id === showReactions)?.userReactions[user.uid]}
        />
      )}

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
