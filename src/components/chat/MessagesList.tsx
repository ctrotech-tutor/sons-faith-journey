
import { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

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

interface MessagesListProps {
  messages: Message[];
  currentUserId: string;
  onLongPress: (messageId: string) => void;
  onReport: (messageId: string) => void;
  canModerate?: boolean;
}

const MessagesList = ({ 
  messages, 
  currentUserId, 
  onLongPress, 
  onReport, 
  canModerate 
}: MessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div 
      className="flex flex-col overflow-y-auto px-4 pt-20 pb-10 gap-1 bg-gray-50">
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
            isOwn={message.senderId === currentUserId}
            onLongPress={() => onLongPress(message.id)}
            onReport={() => onReport(message.id)}
            canModerate={canModerate}
            showStatus={true}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
