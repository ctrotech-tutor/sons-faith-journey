
import { ArrowLeft, MoreVertical, Users, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ChatHeaderProps {
  messageCount: number;
  isOnline: boolean;
}

const ChatHeader = ({ messageCount, isOnline }: ChatHeaderProps) => {
  const navigate = useNavigate();

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
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Church Room</h1>
          <div className="flex items-center space-x-2 text-sm text-white/80">
            <span>{messageCount} messages</span>
            {isOnline ? (
              <Wifi className="h-4 w-4 text-gray-300" />
            ) : (
              <WifiOff className="h-4 w-4 text-gray-200 font-medium" />
            )}
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="text-white ripple-effect rounded-full w-8 h-8 bg-purple-600 hover:bg-purple-600 hover:text-white transition-colors">
          <MoreVertical className="h-5 w-5" />
        </Button>
    </div>
  );
};

export default ChatHeader;
