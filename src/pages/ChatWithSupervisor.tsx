
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, MessageCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import FileUploader from '@/components/chat/FileUploader';

interface PrivateMessage {
  id: string;
  senderId: string;
  senderType: 'user' | 'admin';
  senderName: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
  voiceNoteUrl?: string;
  timestamp: any;
  urgent?: boolean;
  answered?: boolean;
}

const ChatWithSupervisor = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const messagesQuery = query(
      collection(db, `privateChats/${user.uid}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PrivateMessage[];
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

    setLoading(true);
    try {
      await addDoc(collection(db, `privateChats/${user.uid}/messages`), {
        senderId: user.uid,
        senderType: 'user',
        senderName: userProfile.displayName,
        content: newMessage,
        timestamp: new Date(),
        urgent: isUrgent,
        answered: false
      });

      // Also create a notification for admins
      await addDoc(collection(db, 'adminNotifications'), {
        type: 'private_message',
        userId: user.uid,
        userName: userProfile.displayName,
        message: newMessage.substring(0, 100) + (newMessage.length > 100 ? '...' : ''),
        urgent: isUrgent,
        read: false,
        timestamp: new Date()
      });

      setNewMessage('');
      setIsUrgent(false);
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent to THE SONS team.'
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

  const handleMediaUpload = async (mediaUrl: string, mediaType: 'image' | 'audio' | 'video') => {
    if (!user || !userProfile) return;

    try {
      await addDoc(collection(db, `privateChats/${user.uid}/messages`), {
        senderId: user.uid,
        senderType: 'user',
        senderName: userProfile.displayName,
        content: '',
        mediaUrl,
        mediaType,
        timestamp: new Date(),
        urgent: false,
        answered: false
      });

      setShowUploader(false);
      toast({
        title: 'Media Sent',
        description: 'Your media has been sent to THE SONS team.'
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to send media. Please try again.',
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
            <p className="text-gray-600">Please sign in to chat with supervisors.</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto p-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-md rounded-t-lg p-4 border-b border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-blue-800">THE SONS Team</h1>
                  <p className="text-blue-600">Private Spiritual Support</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Secure
                </Badge>
                {messages.some(m => m.urgent && !m.answered) && (
                  <Badge variant="destructive">
                    <Clock className="h-3 w-3 mr-1" />
                    Urgent
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>

          {/* Chat Container */}
          <div className="bg-white/60 backdrop-blur-sm h-[60vh] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Private Support Channel</h3>
                <p className="text-gray-500 mb-4">
                  Share your prayer requests, questions, or concerns with our spiritual team
                </p>
                <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                  <p className="font-medium mb-2">How can THE SONS team help you?</p>
                  <ul className="text-left space-y-1">
                    <li>• Prayer requests and spiritual guidance</li>
                    <li>• Personal struggles and challenges</li>
                    <li>• Questions about faith and scripture</li>
                    <li>• Confidential counseling support</li>
                  </ul>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.senderType === 'user'
                      ? 'bg-[#FF9606] text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}>
                    {message.senderType === 'admin' && (
                      <div className="flex items-center space-x-2 mb-1">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">THE SONS Team</span>
                      </div>
                    )}
                    
                    {message.mediaUrl && (
                      <div className="mb-2">
                        {message.mediaType === 'image' && (
                          <img src={message.mediaUrl} alt="Shared" className="rounded-lg max-w-full" />
                        )}
                        {message.mediaType === 'audio' && (
                          <audio controls className="w-full">
                            <source src={message.mediaUrl} type="audio/mpeg" />
                          </audio>
                        )}
                      </div>
                    )}
                    
                    {message.content && (
                      <p className="text-sm">{message.content}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${
                        message.senderType === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {message.timestamp?.toDate?.()?.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) || 'Just now'}
                      </span>
                      {message.urgent && (
                        <Badge variant="destructive" className="text-xs py-0 px-1">
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white/80 backdrop-blur-md rounded-b-lg p-4 border-t border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-red-600 font-medium">Mark as urgent</span>
              </label>
            </div>
            <ChatInput
              value={newMessage}
              onChange={setNewMessage}
              onSend={sendMessage}
              loading={loading}
              onAttachmentClick={() => setShowUploader(true)}
              placeholder="Share your thoughts, prayer requests, or questions..."
            />
          </div>
        </div>

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

export default ChatWithSupervisor;
