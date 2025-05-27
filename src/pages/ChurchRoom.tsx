
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Plus, Flag, Heart, Flame, HandHeart, ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import ReactionsOverlay from '@/components/chat/ReactionsOverlay';
import FileUploader from '@/components/chat/FileUploader';

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
}

const ChurchRoom = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const reactionEmojis = [
    { emoji: '🙏', key: 'pray', icon: HandHeart },
    { emoji: '❤️', key: 'love', icon: Heart },
    { emoji: '🔥', key: 'fire', icon: Flame },
    { emoji: '👍', key: 'thumbs', icon: ThumbsUp },
    { emoji: '✨', key: 'amen', icon: Heart }
  ];

  useEffect(() => {
    if (!user) return;

    const messagesQuery = query(
      collection(db, 'chats/churchRoom/messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(newMessages);
      scrollToBottom();
    });

    return unsubscribe;
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

      setNewMessage('');
      toast({
        title: 'Message Sent',
        description: 'Your message has been shared with the community.'
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
    if (!user) return;

    try {
      const messageRef = doc(db, 'chats/churchRoom/messages', messageId);
      const message = messages.find(m => m.id === messageId);
      
      if (!message) return;

      const currentUserReaction = message.userReactions[user.uid];
      const reactions = { ...message.reactions };
      const userReactions = { ...message.userReactions };

      // Remove previous reaction if exists
      if (currentUserReaction) {
        reactions[currentUserReaction] = Math.max(0, (reactions[currentUserReaction] || 0) - 1);
        if (reactions[currentUserReaction] === 0) {
          delete reactions[currentUserReaction];
        }
      }

      // Add new reaction if different
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
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-gray-600">Please sign in to join the Church Room chat.</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="max-w-4xl mx-auto p-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-md rounded-t-lg p-4 border-b border-purple-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-purple-800">Church Room</h1>
                <p className="text-purple-600">Faith Community Chat</p>
              </div>
              <Badge className="bg-[#FF9606] hover:bg-[#FF9606]/90 text-white">
                {messages.length} messages
              </Badge>
            </div>
          </motion.div>

          {/* Chat Container */}
          <div 
            ref={chatContainerRef}
            className="bg-white/60 backdrop-blur-sm h-[60vh] overflow-y-auto p-4 space-y-4"
            style={{ backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"60\" height=\"60\" viewBox=\"0 0 60 60\"><defs><pattern id=\"crosses\" x=\"0\" y=\"0\" width=\"30\" height=\"30\" patternUnits=\"userSpaceOnUse\"><path d=\"M15,5 L15,25 M5,15 L25,15\" stroke=\"%23f3e8ff\" stroke-width=\"1\" fill=\"none\" opacity=\"0.3\"/></pattern></defs><rect width=\"100%\" height=\"100%\" fill=\"url(%23crosses)\"/></svg>')" }}
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
                />
              ))
            )}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center space-x-2 text-purple-600">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-sm">Someone is typing...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white/80 backdrop-blur-md rounded-b-lg p-4 border-t border-purple-200">
            <ChatInput
              value={newMessage}
              onChange={setNewMessage}
              onSend={sendMessage}
              loading={loading}
              onAttachmentClick={() => setShowUploader(true)}
            />
          </div>
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
    </Layout>
  );
};

export default ChurchRoom;
