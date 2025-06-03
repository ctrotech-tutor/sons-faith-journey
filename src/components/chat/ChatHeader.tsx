
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
    <div className="bg-[#FF9606] text-white p-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-white hover:bg-white/20"
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
              <Wifi className="h-4 w-4 text-green-300" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-300" />
            )}
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
        <MoreVertical className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ChatHeader;
