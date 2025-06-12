
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
  onPin?: (messageId: string) => void;
  canModerate?: boolean;
  pinnedMessages?: string[];
  unreadMessageIndex?: number;
}

const MessagesList = ({ 
  messages, 
  currentUserId, 
  onLongPress, 
  onReport, 
  onPin,
  canModerate,
  pinnedMessages = [],
  unreadMessageIndex = -1
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
        messages.map((message, index) => (
          <div key={message.id}>
            {/* Unread marker */}
            {index === unreadMessageIndex && unreadMessageIndex > 0 && (
              <div className="relative my-2">
                <div className="absolute left-0 right-0 flex items-center">
                  <div className="flex-1 h-px bg-red-500"></div>
                  <span className="mx-2 text-xs text-red-500 bg-white px-2 py-1 rounded">
                    New messages
                  </span>
                  <div className="flex-1 h-px bg-red-500"></div>
                </div>
              </div>
            )}
            
            <ChatMessage
              message={message}
              isOwn={message.senderId === currentUserId}
              onLongPress={() => onLongPress(message.id)}
              onReport={() => onReport(message.id)}
              canModerate={canModerate}
              showStatus={true}
              data-message-id={message.id}
            />
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
