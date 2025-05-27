
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Image, 
  FileText, 
  Video, 
  Music, 
  X,
  Camera,
  Folder
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onUpload: (url: string, type: 'image' | 'audio' | 'video') => void;
  onClose: () => void;
}

const FileUploader = ({ onUpload, onClose }: FileUploaderProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select a file smaller than 20MB.',
        variant: 'destructive'
      });
      return;
    }

    // Determine file type
    let mediaType: 'image' | 'audio' | 'video';
    if (file.type.startsWith('image/')) {
      mediaType = 'image';
    } else if (file.type.startsWith('audio/')) {
      mediaType = 'audio';
    } else if (file.type.startsWith('video/')) {
      mediaType = 'video';
    } else {
      toast({
        title: 'Unsupported File Type',
        description: 'Please select an image, audio, or video file.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // In a real app, you'd upload to a service like Cloudinary, AWS S3, etc.
      // For now, we'll create a blob URL for demonstration
      const fileUrl = URL.createObjectURL(file);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadProgress(100);
      
      setTimeout(() => {
        onUpload(fileUrl, mediaType);
        toast({
          title: 'Upload Successful',
          description: `${mediaType} has been uploaded successfully.`
        });
      }, 500);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const uploadOptions = [
    {
      icon: Camera,
      label: 'Camera',
      accept: 'image/*',
      capture: 'environment' as const,
      color: 'bg-blue-500'
    },
    {
      icon: Image,
      label: 'Gallery',
      accept: 'image/*',
      color: 'bg-green-500'
    },
    {
      icon: Video,
      label: 'Video',
      accept: 'video/*',
      color: 'bg-red-500'
    },
    {
      icon: Music,
      label: 'Audio',
      accept: 'audio/*',
      color: 'bg-purple-500'
    },
    {
      icon: Folder,
      label: 'Files',
      accept: '*/*',
      color: 'bg-gray-500'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Share Media</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isUploading ? (
            <div className="space-y-4">
              <div className="text-center">
                <Upload className="h-12 w-12 mx-auto text-[#FF9606] mb-4 animate-bounce" />
                <p className="text-sm text-gray-600 mb-2">Uploading...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {uploadOptions.map((option) => (
                <label
                  key={option.label}
                  className="cursor-pointer group"
                >
                  <input
                    type="file"
                    accept={option.accept}
                    capture={option.capture}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-[#FF9606] transition-colors group-hover:bg-orange-50">
                    <div className={`p-3 rounded-full ${option.color} text-white mb-2 group-hover:scale-110 transition-transform`}>
                      <option.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#FF9606]">
                      {option.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500 text-center">
            Maximum file size: 20MB<br />
            Supported: Images, Audio, Video
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default FileUploader;
