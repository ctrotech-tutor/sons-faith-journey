
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, MoreVertical, Users, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import ReactionsOverlay from '@/components/chat/ReactionsOverlay';
import FileUploader from '@/components/chat/FileUploader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Message {
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
}

interface QueuedMessage {
  id: string;
  message: string;
  timestamp: Date;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
}

const ChurchRoom = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const reactionEmojis = [
    { emoji: '🙏', key: 'pray' },
    { emoji: '❤️', key: 'love' },
    { emoji: '🔥', key: 'fire' },
    { emoji: '👍', key: 'thumbs' },
    { emoji: '✨', key: 'amen' }
  ];

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueuedMessages();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load messages from cache on mount
  useEffect(() => {
    const cachedMessages = localStorage.getItem('churchRoom_messages');
    if (cachedMessages) {
      setMessages(JSON.parse(cachedMessages));
    }
  }, []);

  // Listen to real-time messages when online
  useEffect(() => {
    if (!user || !isOnline) return;

    const messagesQuery = query(
      collection(db, 'chats/churchRoom/messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: 'delivered'
      })) as Message[];
      
      setMessages(newMessages);
      // Cache latest 100 messages for offline access
      localStorage.setItem('churchRoom_messages', JSON.stringify(newMessages.slice(-100)));
      scrollToBottom();
    });

    return unsubscribe;
  }, [user, isOnline]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const syncQueuedMessages = async () => {
    if (queuedMessages.length === 0) return;

    for (const queuedMsg of queuedMessages) {
      try {
        await addDoc(collection(db, 'chats/churchRoom/messages'), {
          senderId: user?.uid,
          senderName: userProfile?.displayName,
          message: queuedMsg.message,
          mediaUrl: queuedMsg.mediaUrl,
          mediaType: queuedMsg.mediaType,
          reactions: {},
          userReactions: {},
          reported: false,
          timestamp: queuedMsg.timestamp
        });
      } catch (error) {
        console.error('Error syncing queued message:', error);
      }
    }

    setQueuedMessages([]);
    localStorage.removeItem('churchRoom_queued');
    toast({
      title: 'Messages Synced',
      description: 'Your offline messages have been sent.'
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !userProfile) return;

    // Simple profanity filter
    const badWords = ['damn', 'hell', 'shit', 'fuck', 'bitch'];
    const containsProfanity = badWords.some(word => 
      newMessage.toLowerCase().includes(word)
    );

    if (containsProfanity) {
      toast({
        title: 'Message Filtered',
        description: 'Please keep our chat respectful and family-friendly.',
        variant: 'destructive'
      });
      return;
    }

    const messageData = {
      id: Date.now().toString(),
      senderId: user.uid,
      senderName: userProfile.displayName,
      message: newMessage,
      reactions: {},
      userReactions: {},
      reported: false,
      timestamp: new Date(),
      status: isOnline ? 'sent' : 'pending'
    };

    // Add message to local state immediately
    setMessages(prev => [...prev, messageData as Message]);
    setNewMessage('');

    if (!isOnline) {
      // Queue message for later sending
      const queuedMsg: QueuedMessage = {
        id: messageData.id,
        message: newMessage,
        timestamp: new Date()
      };
      
      const updatedQueue = [...queuedMessages, queuedMsg];
      setQueuedMessages(updatedQueue);
      localStorage.setItem('churchRoom_queued', JSON.stringify(updatedQueue));
      
      toast({
        title: 'Message Queued',
        description: 'Message will be sent when you come back online.',
      });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'chats/churchRoom/messages'), {
        senderId: user.uid,
        senderName: userProfile.displayName,
        message: newMessage,
        reactions: {},
        userReactions: {},
        reported: false,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addReaction = async (messageId: string, reactionKey: string) => {
    if (!user || !isOnline) return;

    try {
      const messageRef = doc(db, 'chats/churchRoom/messages', messageId);
      const message = messages.find(m => m.id === messageId);
      
      if (!message) return;

      const currentUserReaction = message.userReactions[user.uid];
      const reactions = { ...message.reactions };
      const userReactions = { ...message.userReactions };

      if (currentUserReaction) {
        reactions[currentUserReaction] = Math.max(0, (reactions[currentUserReaction] || 0) - 1);
        if (reactions[currentUserReaction] === 0) {
          delete reactions[currentUserReaction];
        }
      }

      if (currentUserReaction !== reactionKey) {
        reactions[reactionKey] = (reactions[reactionKey] || 0) + 1;
        userReactions[user.uid] = reactionKey;
      } else {
        delete userReactions[user.uid];
      }

      await updateDoc(messageRef, {
        reactions,
        userReactions
      });

      setShowReactions(null);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const reportMessage = async (messageId: string) => {
    if (!user) return;

    try {
      const messageRef = doc(db, 'chats/churchRoom/messages', messageId);
      await updateDoc(messageRef, {
        reported: true
      });

      toast({
        title: 'Message Reported',
        description: 'Thank you for helping keep our community safe.'
      });
    } catch (error) {
      console.error('Error reporting message:', error);
    }
  };

  const handleMediaUpload = async (mediaUrl: string, mediaType: 'image' | 'audio' | 'video') => {
    if (!user || !userProfile) return;

    const messageData = {
      id: Date.now().toString(),
      senderId: user.uid,
      senderName: userProfile.displayName,
      message: '',
      mediaUrl,
      mediaType,
      reactions: {},
      userReactions: {},
      reported: false,
      timestamp: new Date(),
      status: isOnline ? 'sent' : 'pending'
    };

    setMessages(prev => [...prev, messageData as Message]);

    if (!isOnline) {
      const queuedMsg: QueuedMessage = {
        id: messageData.id,
        message: '',
        mediaUrl,
        mediaType,
        timestamp: new Date()
      };
      
      const updatedQueue = [...queuedMessages, queuedMsg];
      setQueuedMessages(updatedQueue);
      localStorage.setItem('churchRoom_queued', JSON.stringify(updatedQueue));
      
      setShowUploader(false);
      toast({
        title: 'Media Queued',
        description: 'Media will be sent when you come back online.'
      });
      return;
    }

    try {
      await addDoc(collection(db, 'chats/churchRoom/messages'), {
        senderId: user.uid,
        senderName: userProfile.displayName,
        message: '',
        mediaUrl,
        mediaType,
        reactions: {},
        userReactions: {},
        reported: false,
        timestamp: new Date()
      });

      setShowUploader(false);
      toast({
        title: 'Media Shared',
        description: 'Your media has been shared with the community.'
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to share media. Please try again.',
        variant: 'destructive'
      });
    }
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
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Custom Chat Header */}
      <div className="bg-[#FF9606] text-white p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="bg-white/20 p-2 rounded-full">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Church Room</h1>
            <div className="flex items-center space-x-2 text-sm text-white/80">
              <span>{messages.length} messages</span>
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-300" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-300" />
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Chat Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100"
        style={{ 
          backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"60\" height=\"60\" viewBox=\"0 0 60 60\"><defs><pattern id=\"crosses\" x=\"0\" y=\"0\" width=\"30\" height=\"30\" patternUnits=\"userSpaceOnUse\"><path d=\"M15,5 L15,25 M5,15 L25,15\" stroke=\"%23e5e7eb\" stroke-width=\"1\" fill=\"none\" opacity=\"0.3\"/></pattern></defs><rect width=\"100%\" height=\"100%\" fill=\"url(%23crosses)\"/></svg>')",
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🙏</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Welcome to Church Room</h3>
            <p className="text-gray-500">Start a conversation and build community together</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwn={message.senderId === user.uid}
              onLongPress={() => setShowReactions(message.id)}
              onReport={() => reportMessage(message.id)}
              canModerate={userProfile?.isAdmin}
              showStatus={true}
            />
          ))
        )}

        {!isOnline && queuedMessages.length > 0 && (
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 text-center">
            <p className="text-yellow-800 text-sm">
              {queuedMessages.length} message(s) queued. Will send when back online.
            </p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Footer */}
      <div className="bg-white border-t border-gray-200 p-3">
        <ChatInput
          value={newMessage}
          onChange={setNewMessage}
          onSend={sendMessage}
          loading={loading}
          onAttachmentClick={() => setShowUploader(true)}
          placeholder="Type a message..."
        />
      </div>

      {/* Reactions Overlay */}
      {showReactions && (
        <ReactionsOverlay
          messageId={showReactions}
          reactions={reactionEmojis}
          onReaction={addReaction}
          onClose={() => setShowReactions(null)}
          userReaction={messages.find(m => m.id === showReactions)?.userReactions[user.uid]}
        />
      )}

      {/* File Uploader */}
      {showUploader && (
        <FileUploader
          onUpload={handleMediaUpload}
          onClose={() => setShowUploader(false)}
        />
      )}
    </div>
  );
};

export default ChurchRoom;
