
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Upload, Image, Video, File } from 'lucide-react';
import { getFileType, validateFileSize } from '@/lib/fileUtils';
import { useToast } from '@/lib/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';
interface FileUploaderProps {
  onUpload: (url: string, type: 'image' | 'video' | 'audio') => void;
  onClose: () => void;
}

const FileUploader = ({ onUpload, onClose }: FileUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (!validateFileSize(file, 10)) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB.',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const base64String = await uploadToCloudinary(file);
      const fileType = getFileType(file);

      onUpload(base64String, fileType);
      onClose();

      toast({
        title: 'Upload successful',
        description: 'Your file has been uploaded and shared.'
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Share Media</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {uploading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-[#FF9606] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#FF9606] transition-colors cursor-pointer">
                <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Upload Image</p>
              </div>
            </label>

            <label className="block">
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#FF9606] transition-colors cursor-pointer">
                <Video className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Upload Video</p>
              </div>
            </label>

            <label className="block">
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#FF9606] transition-colors cursor-pointer">
                <File className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Upload Audio</p>
              </div>
            </label>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FileUploader;
