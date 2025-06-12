
import { ArrowLeft, MoreVertical, Users, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ChatHeaderProps {
  messageCount: number;
  isOnline: boolean;
}

const ChatHeader = ({ messageCount, isOnline }: ChatHeaderProps) => {
  const navigate = useNavigate();
  // const messageCountFormater = (messageCount) => {
  //   if(messageCount.length >= 99) {
  //     return 
  //   }
  // } 
  return (
    <div className="bg-purple-600 fixed top-0 z-50 w-full text-white py-3 flex items-center justify-between shadow-lg">
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
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-medium">Room</h1>
          <div className="flex items-center text-xs text-white/80">
            <span className="line-clamp-1">{messageCount} messages</span>
          </div>
        </div>
      </div>
      <div className="mr-2">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-gray-300 animate-ping" />
        ) : (
          <WifiOff className="h-4 w-4 text-gray-200 font-medium" />
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
