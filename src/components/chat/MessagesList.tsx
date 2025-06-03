
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
