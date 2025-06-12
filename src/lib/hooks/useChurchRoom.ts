import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/use-toast';

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
  pinned?: boolean;
  pinnedBy?: string;
  pinnedAt?: any;
}

interface QueuedMessage {
  id: string;
  message: string;
  timestamp: Date;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
}

export const useChurchRoom = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([]);

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
      collection(db, 'churchMessages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: 'delivered'
      })) as Message[];
      
      setMessages(newMessages);
      localStorage.setItem('churchRoom_messages', JSON.stringify(newMessages.slice(-100)));
    });

    return unsubscribe;
  }, [user, isOnline]);

  const syncQueuedMessages = async () => {
    if (queuedMessages.length === 0) return;

    for (const queuedMsg of queuedMessages) {
      try {
        await addDoc(collection(db, 'churchMessages'), {
          senderId: user?.uid,
          senderName: userProfile?.displayName,
          message: queuedMsg.message,
          mediaUrl: queuedMsg.mediaUrl,
          mediaType: queuedMsg.mediaType,
          reactions: {},
          userReactions: {},
          reported: false,
          timestamp: queuedMsg.timestamp,
          pinned: false
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
      status: isOnline ? 'sent' : 'pending',
      pinned: false
    };

    setMessages(prev => [...prev, messageData as Message]);
    const messageToSend = newMessage;
    setNewMessage('');

    if (!isOnline) {
      const queuedMsg: QueuedMessage = {
        id: messageData.id,
        message: messageToSend,
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
      await addDoc(collection(db, 'churchMessages'), {
        senderId: user.uid,
        senderName: userProfile.displayName,
        message: messageToSend,
        reactions: {},
        userReactions: {},
        reported: false,
        timestamp: new Date(),
        pinned: false
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
      const messageRef = doc(db, 'churchMessages', messageId);
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
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const reportMessage = async (messageId: string) => {
    if (!user || !isOnline) {
      toast({
        title: 'Cannot Report',
        description: 'You need to be online to report messages.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const messageRef = doc(db, 'churchMessages', messageId);
      await updateDoc(messageRef, {
        reported: true
      });

      // Also create a report record for admin review
      await addDoc(collection(db, 'reportedMessages'), {
        messageId,
        reportedBy: user.uid,
        reportedByName: userProfile?.displayName,
        timestamp: new Date(),
        chatRoom: 'churchRoom',
        reason: 'Inappropriate content'
      });

      // Update local state immediately
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, reported: true }
            : msg
        )
      );

      toast({
        title: 'Message Reported',
        description: 'Thank you for helping keep our community safe. Our team will review this message.'
      });
    } catch (error) {
      console.error('Error reporting message:', error);
      toast({
        title: 'Report Failed',
        description: 'Unable to report message. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const togglePinMessage = async (messageId: string) => {
    if (!user || !userProfile?.isAdmin || !isOnline) {
      toast({
        title: 'Cannot Pin',
        description: 'Only admins can pin messages and you need to be online.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const messageRef = doc(db, 'churchMessages', messageId);
      const message = messages.find(m => m.id === messageId);
      
      if (!message) return;

      const isPinned = message.pinned || false;
      
      await updateDoc(messageRef, {
        pinned: !isPinned,
        pinnedBy: !isPinned ? user.uid : null,
        pinnedAt: !isPinned ? new Date() : null
      });

      // Update local state immediately
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                pinned: !isPinned,
                pinnedBy: !isPinned ? user.uid : undefined,
                pinnedAt: !isPinned ? new Date() : undefined
              }
            : msg
        )
      );

      toast({
        title: isPinned ? 'Message Unpinned' : 'Message Pinned',
        description: isPinned 
          ? 'Message has been unpinned from the chat.'
          : 'Message has been pinned to the chat.'
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: 'Error',
        description: 'Failed to pin/unpin message. Please try again.',
        variant: 'destructive'
      });
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
      status: isOnline ? 'sent' : 'pending',
      pinned: false
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
      
      toast({
        title: 'Media Queued',
        description: 'Media will be sent when you come back online.'
      });
      return;
    }

    try {
      await addDoc(collection(db, 'churchMessages'), {
        senderId: user.uid,
        senderName: userProfile.displayName,
        message: '',
        mediaUrl,
        mediaType,
        reactions: {},
        userReactions: {},
        reported: false,
        timestamp: new Date(),
        pinned: false
      });

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

  return {
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
    togglePinMessage,
    user,
    userProfile
  };
};