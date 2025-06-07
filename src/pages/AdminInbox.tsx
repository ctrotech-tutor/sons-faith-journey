
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, addDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Send,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import Layout from '@/components/Layout';

interface PrivateThread {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  urgent: boolean;
  answered: boolean;
}

interface AdminNotification {
  id: string;
  type: string;
  userId: string;
  userName: string;
  message: string;
  urgent: boolean;
  read: boolean;
  timestamp: any;
}

const AdminInbox = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<PrivateThread[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'urgent'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!userProfile?.isAdmin) return;

    // Listen to admin notifications
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
      
      // Create threads from notifications
      const threadsMap = new Map<string, PrivateThread>();
      
      newNotifications.forEach(notification => {
        if (notification.type === 'private_message') {
          const existing = threadsMap.get(notification.userId);
          if (!existing || notification.timestamp > existing.lastMessageTime) {
            threadsMap.set(notification.userId, {
              userId: notification.userId,
              userName: notification.userName,
              lastMessage: notification.message,
              lastMessageTime: notification.timestamp,
              unreadCount: newNotifications.filter(n => 
                n.userId === notification.userId && !n.read
              ).length,
              urgent: notification.urgent,
              answered: false
            });
          }
        }
      });
      
      setThreads(Array.from(threadsMap.values()));
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
      }));
      setMessages(threadMessages);
    });

    return unsubscribe;
  }, [selectedThread]);

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedThread || !user || !userProfile) return;

    try {
      await addDoc(collection(db, `privateChats/${selectedThread}/messages`), {
        senderId: user.uid,
        senderType: 'admin',
        senderName: userProfile.displayName,
        content: replyMessage,
        timestamp: new Date(),
        urgent: false,
        answered: true
      });

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
    }
  };

  const filteredThreads = threads.filter(thread => {
    if (filterStatus === 'unread' && thread.unreadCount === 0) return false;
    if (filterStatus === 'urgent' && !thread.urgent) return false;
    if (searchTerm && !thread.userName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Inbox</h1>
            <p className="text-gray-600">Manage private conversations and support requests</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Threads List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Conversations</span>
                    <Badge variant="secondary">{threads.length}</Badge>
                  </CardTitle>
                  
                  {/* Search and Filter */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    
                    <Tabs value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="unread">Unread</TabsTrigger>
                        <TabsTrigger value="urgent">Urgent</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredThreads.map((thread) => (
                      <div
                        key={thread.userId}
                        onClick={() => setSelectedThread(thread.userId)}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedThread === thread.userId ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-purple-100 p-2 rounded-full">
                              <User className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {thread.userName}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {thread.lastMessage}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-400">
                                  {thread.lastMessageTime?.toDate?.()?.toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-1">
                            {thread.unreadCount > 0 && (
                              <Badge className="bg-[#FF9606] hover:bg-[#FF9606]/90">
                                {thread.unreadCount}
                              </Badge>
                            )}
                            {thread.urgent && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            {thread.answered && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredThreads.length === 0 && (
                      <div className="p-8 text-center">
                        <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No conversations found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat View */}
            <div className="lg:col-span-2">
              {selectedThread ? (
                <Card className="h-[70vh] flex flex-col">
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center space-x-3">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <span>{threads.find(t => t.userId === selectedThread)?.userName}</span>
                        <p className="text-sm font-normal text-gray-500">Private Support</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.senderType === 'admin'
                            ? 'bg-[#FF9606] text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {message.senderType === 'admin' && (
                            <div className="text-xs text-white/70 mb-1">THE SONS Team</div>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <div className={`text-xs mt-1 ${
                            message.senderType === 'admin' ? 'text-white/70' : 'text-gray-500'
                          }`}>
                            {message.timestamp?.toDate?.()?.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your response..."
                        className="flex-1 min-h-[44px] max-h-[120px]"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendReply();
                          }
                        }}
                      />
                      <Button
                        onClick={sendReply}
                        disabled={!replyMessage.trim()}
                        className="bg-[#FF9606] hover:bg-[#FF9606]/90"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="h-[70vh] flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Select a Conversation
                    </h3>
                    <p className="text-gray-500">
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
