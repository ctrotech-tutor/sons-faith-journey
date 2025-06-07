import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, addDoc, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Send,
  Filter,
  Search,
  ArrowLeft,
  Circle,
  Shield
} from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

interface PrivateThread {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageTime: any;
  lastMessageSender: 'user' | 'admin';
  unreadCount: number;
  urgent: boolean;
  answered: boolean;
  isOnline: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'user' | 'admin';
  senderName: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
  timestamp: any;
  urgent?: boolean;
  read?: boolean;
}

interface AdminNotification {
  id: string;
  type: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  urgent: boolean;
  read: boolean;
  timestamp: any;
}

const AdminInbox = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<PrivateThread[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [selectedThreadData, setSelectedThreadData] = useState<PrivateThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'urgent'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userProfile?.isAdmin) return;

    // Listen to admin notifications to build threads
    const notificationsQuery = query(
      collection(db, 'adminNotifications'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminNotification[];
      setNotifications(newNotifications);
      
      // Create threads from private message notifications
      const threadsMap = new Map<string, PrivateThread>();
      
      newNotifications.forEach(notification => {
        if (notification.type === 'private_message') {
          const existing = threadsMap.get(notification.userId);
          if (!existing || notification.timestamp?.seconds > existing.lastMessageTime?.seconds) {
            // Count unread messages for this user
            const unreadCount = newNotifications.filter(n => 
              n.userId === notification.userId && 
              n.type === 'private_message' && 
              !n.read
            ).length;

            threadsMap.set(notification.userId, {
              userId: notification.userId,
              userName: notification.userName,
              userEmail: notification.userEmail || '',
              lastMessage: notification.message,
              lastMessageTime: notification.timestamp,
              lastMessageSender: 'user',
              unreadCount,
              urgent: notification.urgent,
              answered: false,
              isOnline: Math.random() > 0.5 // Simulate online status
            });
          }
        }
      });
      
      setThreads(Array.from(threadsMap.values()).sort((a, b) => 
        b.lastMessageTime?.seconds - a.lastMessageTime?.seconds
      ));
    });

    return unsubscribeNotifications;
  }, [userProfile?.isAdmin]);

  useEffect(() => {
    if (!selectedThread) return;

    const messagesQuery = query(
      collection(db, `privateChats/${selectedThread}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const threadMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      setMessages(threadMessages);

      // Mark messages as read when viewing them
      if (threadMessages.length > 0) {
        markThreadAsRead(selectedThread);
      }
    });

    return unsubscribe;
  }, [selectedThread]);

  const markThreadAsRead = async (userId: string) => {
    try {
      // Mark all notifications for this user as read
      const unreadNotifications = notifications.filter(n => 
        n.userId === userId && 
        n.type === 'private_message' && 
        !n.read
      );

      for (const notification of unreadNotifications) {
        await updateDoc(doc(db, 'adminNotifications', notification.id), {
          read: true,
          readAt: new Date(),
          readBy: user?.uid
        });
      }

      // Update thread unread count locally
      setThreads(prev => prev.map(thread => 
        thread.userId === userId 
          ? { ...thread, unreadCount: 0 }
          : thread
      ));
    } catch (error) {
      console.error('Error marking thread as read:', error);
    }
  };

  const selectThread = (thread: PrivateThread) => {
    setSelectedThread(thread.userId);
    setSelectedThreadData(thread);
    markThreadAsRead(thread.userId);
  };

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedThread || !user || !userProfile) return;

    setLoading(true);
    try {
      // Add message to private chat
      await addDoc(collection(db, `privateChats/${selectedThread}/messages`), {
        senderId: user.uid,
        senderType: 'admin',
        senderName: userProfile.displayName || 'THE SONS Team',
        content: replyMessage,
        timestamp: new Date(),
        urgent: false,
        answered: true
      });

      // Update thread as answered
      setThreads(prev => prev.map(thread => 
        thread.userId === selectedThread 
          ? { 
              ...thread, 
              answered: true, 
              lastMessage: replyMessage,
              lastMessageSender: 'admin',
              lastMessageTime: { seconds: Date.now() / 1000 }
            }
          : thread
      ));

      setReplyMessage('');
      toast({
        title: 'Reply Sent',
        description: 'Your response has been sent to the user.'
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reply. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredThreads = threads.filter(thread => {
    if (filterStatus === 'unread' && thread.unreadCount === 0) return false;
    if (filterStatus === 'urgent' && !thread.urgent) return false;
    if (searchTerm && !thread.userName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalUnreadCount = threads.reduce((sum, thread) => sum + thread.unreadCount, 0);

  if (!userProfile?.isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            {selectedThread ? (
              <>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedThread(null)}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {selectedThreadData?.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{selectedThreadData?.userName}</p>
                      <div className="flex items-center space-x-1">
                        {selectedThreadData?.isOnline && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        <span className="text-xs text-gray-500">
                          {selectedThreadData?.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-[#FF9606]" />
                </div>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold">Admin Inbox</h1>
                <Badge variant="secondary">{totalUnreadCount} unread</Badge>
              </>
            )}
          </div>
        </div>

        <div className="lg:max-w-7xl mx-auto p-4 pt-20 lg:pt-4">
          {/* Desktop Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 hidden lg:block"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Inbox</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage private conversations and support requests</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Threads List */}
            <div className={`lg:col-span-1 ${selectedThread ? 'hidden lg:block' : ''}`}>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between dark:text-white">
                    <span>Conversations</span>
                    <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-200">
                      {filteredThreads.length}
                    </Badge>
                  </CardTitle>
                  
                  {/* Search and Filter */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <Tabs value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                      <TabsList className="grid w-full grid-cols-3 dark:bg-gray-700">
                        <TabsTrigger value="all" className="dark:data-[state=active]:bg-gray-600">All</TabsTrigger>
                        <TabsTrigger value="unread" className="dark:data-[state=active]:bg-gray-600">
                          Unread
                          {totalUnreadCount > 0 && (
                            <Badge className="ml-1 h-4 w-4 p-0 text-xs bg-red-500">
                              {totalUnreadCount}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="urgent" className="dark:data-[state=active]:bg-gray-600">Urgent</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="space-y-0 max-h-96 overflow-y-auto">
                    {filteredThreads.map((thread) => (
                      <div
                        key={thread.userId}
                        onClick={() => selectThread(thread)}
                        className={`p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                          selectedThread === thread.userId ? 'bg-blue-50 dark:bg-gray-700 border-blue-200 dark:border-blue-800' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="text-sm dark:bg-gray-600 dark:text-gray-200">
                                  {thread.userName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {thread.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {thread.userName}
                                </p>
                                {thread.isOnline && (
                                  <Circle className="h-3 w-3 text-green-500 fill-current" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {thread.lastMessageSender === 'admin' ? 'You: ' : ''}{thread.lastMessage}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-400">
                                  {thread.lastMessageTime?.toDate?.()?.toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-1 ml-2">
                            {thread.unreadCount > 0 && (
                              <Badge className="bg-[#FF9606] hover:bg-[#FF9606]/90 text-xs">
                                {thread.unreadCount}
                              </Badge>
                            )}
                            {thread.urgent && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            {thread.answered && thread.lastMessageSender === 'admin' && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredThreads.length === 0 && (
                      <div className="p-8 text-center">
                        <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No conversations found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat View */}
            <div className={`lg:col-span-2 ${!selectedThread ? 'hidden lg:block' : ''}`}>
              {selectedThread && selectedThreadData ? (
                <Card className="h-[70vh] flex flex-col dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="border-b dark:border-gray-700 hidden lg:flex">
                    <CardTitle className="flex items-center space-x-3 dark:text-white">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="dark:bg-gray-600 dark:text-gray-200">
                            {selectedThreadData.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {selectedThreadData.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <span>{selectedThreadData.userName}</span>
                        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          {selectedThreadData.userEmail} • Private Support
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 dark:bg-gray-800">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.senderType === 'admin'
                            ? 'bg-[#FF9606] text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          {message.senderType === 'admin' && (
                            <div className="text-xs text-white/70 mb-1">THE SONS Team</div>
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
                          
                          <p className="text-sm">{message.content}</p>
                          <div className={`text-xs mt-1 ${
                            message.senderType === 'admin' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {message.timestamp?.toDate?.()?.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {message.urgent && (
                              <Badge variant="destructive" className="ml-2 text-xs py-0 px-1">
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  
                  <div className="border-t dark:border-gray-700 p-4">
                    <div className="flex space-x-2">
                      <Textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your response..."
                        className="flex-1 min-h-[44px] max-h-[120px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendReply();
                          }
                        }}
                      />
                      <Button
                        onClick={sendReply}
                        disabled={!replyMessage.trim() || loading}
                        className="bg-[#FF9606] hover:bg-[#FF9606]/90"
                      >
                        {loading ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="h-[70vh] flex items-center justify-center dark:bg-gray-800 dark:border-gray-700">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Select a Conversation
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Choose a conversation from the left to start responding
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminInbox;