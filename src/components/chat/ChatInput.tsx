
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Plus, Mic, Smile, Camera, Image, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/context/ThemeContext';
import { cn } from '@/lib/utils';
import VoiceNoteRecorder from './VoiceNoteRecorder';
import { useTyping } from './TypingIndicator';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading?: boolean;
  onAttachmentClick?: () => void;
  onVoiceNote?: (audioUrl: string) => void;
  placeholder?: string;
  chatId?: string;
}

const ChatInput = ({
  value,
  onChange,
  onSend,
  loading = false,
  onAttachmentClick,
  onVoiceNote,
  placeholder = "Type your message...",
  chatId
}: ChatInputProps) => {
  const { theme } = useTheme();
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setTyping } = useTyping(chatId || '');
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const commonEmojis = ['😊', '😂', '❤️', '🙏', '👍', '🔥', '✨', '🙌', '💯', '😇'];

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !loading) {
        setTyping(false);
        onSend();
      }
    }
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);
    adjustTextareaHeight();
    
    // Handle typing indicators
    if (chatId) {
      if (newValue.trim()) {
        setTyping(true);
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Set new timeout to stop typing after 1 second of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(false);
        }, 1000);
      } else {
        setTyping(false);
      }
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  const handleVoiceNoteComplete = (audioUrl: string) => {
    if (onVoiceNote) {
      onVoiceNote(audioUrl);
    }
    setShowVoiceRecorder(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    onChange(value + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (chatId) {
        setTyping(false);
      }
    };
  }, [chatId, setTyping]);

  return (
    <div className="relative">
      {showVoiceRecorder ? (
        <VoiceNoteRecorder
          onComplete={handleVoiceNoteComplete}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      ) : (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "flex items-end gap-3 p-4 m-4 rounded-2xl shadow-lg border transition-all duration-200",
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
              : 'bg-white border-gray-200 shadow-gray-200/50'
          )}
        >
          {/* Left side buttons */}
          <div className="flex items-center gap-2">
            {/* Attachment Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className={cn(
                  "rounded-full h-9 w-9 p-0 transition-colors",
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                )}
              >
                <Plus className="h-5 w-5" />
              </Button>

              <AnimatePresence>
                {showAttachmentMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className={cn(
                      "absolute bottom-full mb-2 left-0 rounded-xl shadow-xl border p-2 min-w-[150px] z-50",
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onAttachmentClick?.();
                        setShowAttachmentMenu(false);
                      }}
                      className="w-full justify-start"
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Photo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onAttachmentClick?.();
                        setShowAttachmentMenu(false);
                      }}
                      className="w-full justify-start"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Camera
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onAttachmentClick?.();
                        setShowAttachmentMenu(false);
                      }}
                      className="w-full justify-start"
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      File
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Emoji Picker */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={cn(
                  "rounded-full h-9 w-9 p-0 transition-colors",
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                )}
              >
                <Smile className="h-5 w-5" />
              </Button>

              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className={cn(
                      "absolute bottom-full mb-2 left-0 rounded-xl shadow-xl border p-3 z-50",
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    )}
                  >
                    <div className="grid grid-cols-5 gap-2">
                      {commonEmojis.map((emoji, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEmojiSelect(emoji)}
                          className="h-8 w-8 p-0 text-lg hover:scale-110 transition-transform"
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Text input container */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className={cn(
                "resize-none min-h-[44px] max-h-[120px] border-0 focus:ring-0 bg-transparent text-sm rounded-lg p-3 transition-colors",
                theme === 'dark' 
                  ? 'text-gray-100 placeholder-gray-400' 
                  : 'text-gray-900 placeholder-gray-500'
              )}
              disabled={loading}
              style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
            />
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            {/* Voice note or Send button */}
            {value.trim() ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Button
                  onClick={() => {
                    setTyping(false);
                    onSend();
                  }}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full h-10 w-10 p-0 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            ) : (
              onVoiceNote && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVoiceRecorder(true)}
                  className={cn(
                    "rounded-full h-9 w-9 p-0 transition-colors",
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              )
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ChatInput;
