
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface Reaction {
  emoji: string;
  key: string;
}

interface ReactionsOverlayProps {
  messageId: string;
  reactions: Reaction[];
  onReaction: (messageId: string, reactionKey: string) => void;
  onClose: () => void;
  userReaction?: string;
}

const ReactionsOverlay = ({ 
  messageId, 
  reactions, 
  onReaction, 
  onClose, 
  userReaction 
}: ReactionsOverlayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-full p-2 shadow-lg border flex space-x-2"
      >
        {reactions.map((reaction) => (
          <Button
            key={reaction.key}
            variant="ghost"
            size="sm"
            onClick={() => onReaction(messageId, reaction.key)}
            className={`rounded-full h-12 w-12 text-2xl hover:scale-110 transition-transform ${
              userReaction === reaction.key ? 'bg-[#FF9606]/20 border-[#FF9606]' : ''
            }`}
          >
            {reaction.emoji}
          </Button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ReactionsOverlay;
