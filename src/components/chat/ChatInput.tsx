
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Plus, Mic, Smile } from 'lucide-react';
import VoiceNoteRecorder from './VoiceNoteRecorder';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading?: boolean;
  onAttachmentClick?: () => void;
  onVoiceNote?: (audioUrl: string) => void;
  placeholder?: string;
}

const ChatInput = ({
  value,
  onChange,
  onSend,
  loading = false,
  onAttachmentClick,
  onVoiceNote,
  placeholder = "Type your message..."
}: ChatInputProps) => {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !loading) {
        onSend();
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

  return (
    <div className="relative">
      {showVoiceRecorder ? (
        <VoiceNoteRecorder
          onComplete={handleVoiceNoteComplete}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      ) : (
        <div className="flex items-end space-x-2">
          {/* Attachment button */}
          {onAttachmentClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAttachmentClick}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}

          {/* Voice note button */}
          {onVoiceNote && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVoiceRecorder(true)}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}

          {/* Text input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="resize-none min-h-[44px] max-h-[120px] pr-12 rounded-full border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              disabled={loading}
            />
            
            {/* Emoji button (placeholder) */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-700"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          {/* Send button */}
          <Button
            onClick={onSend}
            disabled={!value.trim() || loading}
            className="bg-[#FF9606] hover:bg-[#FF9606]/90 text-white rounded-full h-12 w-12 p-0"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
