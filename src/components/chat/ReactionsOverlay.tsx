
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">React to Message</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-5 gap-3">
            {reactions.map((reaction, index) => (
              <motion.button
                key={reaction.key}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onReaction(messageId, reaction.key);
                  onClose();
                }}
                className={`p-4 rounded-xl text-2xl transition-all duration-200 ${
                  userReaction === reaction.key
                    ? 'bg-purple-100 ring-2 ring-purple-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {reaction.emoji}
              </motion.button>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            Tap to react with your favorite emoji
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReactionsOverlay;
