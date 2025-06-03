
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { ArrowLeft, MoreVertical, Shield, Wifi, WifiOff, Clock } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import FileUploader from '@/components/chat/FileUploader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  status?: 'pending' | 'sent' | 'delivered';
}

interface QueuedMessage {
  id: string;
  content: string;
  timestamp: Date;
  urgent: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
}

const ChatWithSupervisor = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    const cachedMessages = localStorage.getItem(`supervisorChat_${user?.uid}_messages`);
    if (cachedMessages) {
      setMessages(JSON.parse(cachedMessages));
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!user || !isOnline) return;

    const messagesQuery = query(
      collection(db, `privateChats/${user.uid}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: 'delivered'
      })) as PrivateMessage[];
      
      setMessages(newMessages);
      // Cache latest 50 messages for offline access
      localStorage.setItem(`supervisorChat_${user.uid}_messages`, JSON.stringify(newMessages.slice(-50)));
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
        await addDoc(collection(db, `privateChats/${user?.uid}/messages`), {
          senderId: user?.uid,
          senderType: 'user',
          senderName: userProfile?.displayName,
          content: queuedMsg.content,
          mediaUrl: queuedMsg.mediaUrl,
          mediaType: queuedMsg.mediaType,
          timestamp: queuedMsg.timestamp,
          urgent: queuedMsg.urgent,
          answered: false
        });

        // Also create a notification for admins
        await addDoc(collection(db, 'adminNotifications'), {
          type: 'private_message',
          userId: user?.uid,
          userName: userProfile?.displayName,
          message: queuedMsg.content.substring(0, 100) + (queuedMsg.content.length > 100 ? '...' : ''),
          urgent: queuedMsg.urgent,
          read: false,
          timestamp: queuedMsg.timestamp
        });
      } catch (error) {
        console.error('Error syncing queued message:', error);
      }
    }

    setQueuedMessages([]);
    localStorage.removeItem(`supervisorChat_${user?.uid}_queued`);
    toast({
      title: 'Messages Synced',
      description: 'Your offline messages have been sent to THE SONS team.'
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !userProfile) return;

    const messageData = {
      id: Date.now().toString(),
      senderId: user.uid,
      senderType: 'user' as const,
      senderName: userProfile.displayName,
      content: newMessage,
      timestamp: new Date(),
      urgent: isUrgent,
      answered: false,
      status: isOnline ? 'sent' : 'pending'
    };

    // Add message to local state immediately
    setMessages(prev => [...prev, messageData as PrivateMessage]);
    const messageToSend = newMessage;
    setNewMessage('');
    setIsUrgent(false);

    if (!isOnline) {
      // Queue message for later sending
      const queuedMsg: QueuedMessage = {
        id: messageData.id,
        content: messageToSend,
        timestamp: new Date(),
        urgent: isUrgent
      };
      
      const updatedQueue = [...queuedMessages, queuedMsg];
      setQueuedMessages(updatedQueue);
      localStorage.setItem(`supervisorChat_${user.uid}_queued`, JSON.stringify(updatedQueue));
      
      toast({
        title: 'Message Queued',
        description: 'Message will be sent when you come back online.'
      });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, `privateChats/${user.uid}/messages`), {
        senderId: user.uid,
        senderType: 'user',
        senderName: userProfile.displayName,
        content: messageToSend,
        timestamp: new Date(),
        urgent: isUrgent,
        answered: false
      });

      // Also create a notification for admins
      await addDoc(collection(db, 'adminNotifications'), {
        type: 'private_message',
        userId: user.uid,
        userName: userProfile.displayName,
        message: messageToSend.substring(0, 100) + (messageToSend.length > 100 ? '...' : ''),
        urgent: isUrgent,
        read: false,
        timestamp: new Date()
      });

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

    const messageData = {
      id: Date.now().toString(),
      senderId: user.uid,
      senderType: 'user' as const,
      senderName: userProfile.displayName,
      content: '',
      mediaUrl,
      mediaType,
      timestamp: new Date(),
      urgent: false,
      answered: false,
      status: isOnline ? 'sent' : 'pending'
    };

    setMessages(prev => [...prev, messageData as PrivateMessage]);

    if (!isOnline) {
      const queuedMsg: QueuedMessage = {
        id: messageData.id,
        content: '',
        mediaUrl,
        mediaType,
        timestamp: new Date(),
        urgent: false
      };
      
      const updatedQueue = [...queuedMessages, queuedMsg];
      setQueuedMessages(updatedQueue);
      localStorage.setItem(`supervisorChat_${user.uid}_queued`, JSON.stringify(updatedQueue));
      
      setShowUploader(false);
      toast({
        title: 'Media Queued',
        description: 'Media will be sent when you come back online.'
      });
      return;
    }

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600">Please sign in to chat with supervisors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Custom Chat Header */}
      <div className="bg-purple-600 py-2 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="ripple-effect text-white rounded-full w-8 h-8 bg-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="bg-white/20 p-2 rounded-full">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">THE SONS Team</h1>
            <div className="flex items-center space-x-2 text-sm text-white/80">
              <span>Private Support</span>
              {isOnline ? (
                <Wifi className="h-4 w-4 text-gray-300" />
              ) : (
                <WifiOff className="h-4 w-4 text-gray-200" />
              )}
              {/* {messages.some(m => m.urgent && !m.answered) && (
                <Badge variant="destructive" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )} */}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="ripple-effect text-white rounded-full w-8 h-8 bg-purple-600 hover:bg-purple-600 hover:text-white transition-colors">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Chat Messages Container */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100"
        style={{ 
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Private Support Channel</h3>
            <p className="text-gray-500 mb-4">
              Share your prayer requests, questions, or concerns with our spiritual team
            </p>
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700 max-w-md mx-auto">
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
                  : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
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
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                  <div className="flex items-center space-x-1">
                    {message.urgent && (
                      <Badge variant="destructive" className="text-xs py-0 px-1">
                        Urgent
                      </Badge>
                    )}
                    {message.status === 'pending' && (
                      <Clock className="h-3 w-3 text-yellow-500" />
                    )}
                    {message.status === 'sent' && (
                      <span className="text-xs">✓</span>
                    )}
                    {message.status === 'delivered' && (
                      <span className="text-xs">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
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

export default ChatWithSupervisor;
