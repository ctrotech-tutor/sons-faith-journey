
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send, X } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';

interface VoiceNoteRecorderProps {
  onComplete: (audioUrl: string) => void;
  onCancel: () => void;
}

const VoiceNoteRecorder = ({ onComplete, onCancel }: VoiceNoteRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const { toast } = useToast();
  const audioChunks = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunks.current = [];
      
      recorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access to record voice notes.',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const sendVoiceNote = async () => {
    if (!audioUrl) return;
    
    try {
      // In a real app, you'd upload the audio blob to your storage service
      // For now, we'll simulate this with the blob URL
      onComplete(audioUrl);
      
      toast({
        title: 'Voice Note Sent',
        description: 'Your voice note has been shared.'
      });
    } catch (error) {
      console.error('Error sending voice note:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to send voice note. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-purple-200 rounded-lg p-4 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-800">Voice Note</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!audioUrl ? (
        <div className="flex flex-col items-center space-y-4">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isRecording ? 'bg-red-100 animate-pulse' : 'bg-purple-100'
          }`}>
            {isRecording ? (
              <MicOff className="h-8 w-8 text-red-600" />
            ) : (
              <Mic className="h-8 w-8 text-purple-600" />
            )}
          </div>

          {isRecording && (
            <div className="text-center">
              <div className="text-2xl font-mono text-red-600 font-bold">
                {formatTime(recordingTime)}
              </div>
              <p className="text-sm text-gray-500">Recording...</p>
            </div>
          )}

          <div className="flex space-x-3">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                variant="destructive"
              >
                <MicOff className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">
              Recording Duration: {formatTime(recordingTime)}
            </div>
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={sendVoiceNote}
              className="flex-1 bg-[#FF9606] hover:bg-[#FF9606]/90"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Voice Note
            </Button>
            <Button
              onClick={() => {
                setAudioUrl(null);
                setRecordingTime(0);
              }}
              variant="outline"
            >
              Re-record
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VoiceNoteRecorder;
