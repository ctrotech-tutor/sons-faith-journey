
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
        <div className="flex items-end space-x-2 bg-white rounded-full p-2 shadow-sm border border-gray-200">
          {/* Emoji button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full h-8 w-8 p-0"
          >
            <Smile className="h-5 w-5" />
          </Button>

          {/* Text input container */}
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
              className="resize-none min-h-[36px] max-h-[120px] border-0 focus:ring-0 bg-transparent text-sm rounded-lg p-2"
              disabled={loading}
              style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
            />
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-1">
            {/* Attachment button */}
            {onAttachmentClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAttachmentClick}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full h-8 w-8 p-0"
              >
                <Plus className="h-5 w-5" />
              </Button>
            )}

            {/* Voice note or Send button */}
            {value.trim() ? (
              <Button
                onClick={onSend}
                disabled={loading}
                className="bg-[#FF9606] hover:bg-[#FF9606]/90 text-white rounded-full h-8 w-8 p-0"
              >
                {loading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            ) : (
              onVoiceNote && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVoiceRecorder(true)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full h-8 w-8 p-0"
                >
                  <Mic className="h-5 w-5" />
                </Button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
