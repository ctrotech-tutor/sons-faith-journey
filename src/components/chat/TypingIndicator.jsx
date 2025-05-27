
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ref, onValue, off, set, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface TypingIndicatorProps {
  chatId: string;
  users: { [key: string]: { displayName: string } };
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ chatId, users }) => {
  const { currentUser } = useAuth();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!chatId) return;

    const typingRef = ref(database, `typing/${chatId}`);
    const unsubscribe = onValue(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        const typingData = snapshot.val();
        const typingUserIds = Object.keys(typingData).filter(
          userId => userId !== currentUser?.uid && typingData[userId]
        );
        setTypingUsers(typingUserIds);
      } else {
        setTypingUsers([]);
      }
    });

    return () => off(typingRef, 'value', unsubscribe);
  }, [chatId, currentUser]);

  const setTyping = (isTyping: boolean) => {
    if (!currentUser || !chatId) return;
    
    const userTypingRef = ref(database, `typing/${chatId}/${currentUser.uid}`);
    if (isTyping) {
      set(userTypingRef, true);
    } else {
      remove(userTypingRef);
    }
  };

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      const userName = users[typingUsers[0]]?.displayName || 'Someone';
      return `${userName} is typing...`;
    } else if (typingUsers.length === 2) {
      const user1 = users[typingUsers[0]]?.displayName || 'Someone';
      const user2 = users[typingUsers[1]]?.displayName || 'Someone';
      return `${user1} and ${user2} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="px-4 py-2 text-sm text-muted-foreground flex items-center space-x-2"
    >
      <div className="typing-indicator">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
      <span>{getTypingText()}</span>
    </motion.div>
  );
};

// Hook to manage typing status
export const useTyping = (chatId: string) => {
  const { currentUser } = useAuth();
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const setTyping = (isTyping: boolean) => {
    if (!currentUser || !chatId) return;
    
    const userTypingRef = ref(database, `typing/${chatId}/${currentUser.uid}`);
    
    if (isTyping) {
      set(userTypingRef, true);
      
      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set new timeout to stop typing after 3 seconds
      const newTimeout = setTimeout(() => {
        remove(userTypingRef);
      }, 3000);
      
      setTypingTimeout(newTimeout);
    } else {
      remove(userTypingRef);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return { setTyping };
};

export default TypingIndicator;
