import { useRef } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function UploadTab({
  loading,
  handleFileUpload,
  selectedPreview,
  selectedType
}: {
  loading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedPreview: string | null;
  selectedType: 'image' | 'video' | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFilePicker = () => {
    if (!loading) fileInputRef.current?.click();
  };

  return (
    <TabsContent value="upload" className="space-y-4">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors',
          loading
            ? 'border-purple-400 bg-purple-50 dark:bg-purple-950'
            : 'border-gray-300 dark:border-gray-600'
        )}
      >
        {/* Icon */}
        <FileImage className="h-12 w-12 mx-auto mb-4 text-gray-400" />

        {/* Instructions */}
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Select an image or video from your device
        </p>

        {/* Choose File Button */}
        <Button
          type="button"
          variant="ghost"
          className="bg-white dark:bg-gray-900 hover:bg-purple-50 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-600"
          disabled={loading}
          onClick={triggerFilePicker}
        >
          {loading ? 'Processing...' : 'Choose File'}
        </Button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          className="hidden"
          disabled={loading}
        />

        {/* Loader */}
        {loading && (
          <div className="flex justify-center mt-4">
            <div className="animate-spin h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full" />
          </div>
        )}

        {/* File Preview */}
        {selectedPreview && (
          <div className="mt-6 flex justify-center">
            {selectedType === 'video' ? (
              <video
                controls
                src={selectedPreview}
                className="max-h-48 rounded-xl shadow-md"
              />
            ) : (
              <img
                src={selectedPreview}
                alt="Preview"
                className="max-h-48 rounded-xl shadow-md"
              />
            )}
          </div>
        )}
      </div>
    </TabsContent>
  );
}
