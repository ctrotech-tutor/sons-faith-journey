import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Check, X, RefreshCw, HardDrive, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/hooks/use-toast';
import { bibleOfflineCache } from '@/lib/bibleOfflineCache';

interface BibleOfflineManagerProps {
  onDownloadComplete?: () => void;
}

const BibleOfflineManager: React.FC<BibleOfflineManagerProps> = ({ onDownloadComplete }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isFullyCached, setIsFullyCached] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    checkCacheStatus();

    // Set up progress callback
    bibleOfflineCache.setProgressCallback(setDownloadProgress);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkCacheStatus = async () => {
    try {
      const fullyCached = await bibleOfflineCache.isFullyCached();
      const progress = await bibleOfflineCache.getDownloadProgress();
      const size = await bibleOfflineCache.getCacheSize();
      
      setIsFullyCached(fullyCached);
      setDownloadProgress(progress);
      setCacheSize(size);
    } catch (error) {
      console.error('Error checking cache status:', error);
    }
  };

  const startDownload = async () => {
    if (!isOnline) {
      toast({
        title: "No internet connection",
        description: "Please connect to the internet to download Bible data",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      await bibleOfflineCache.downloadAllBibleData();
      
      setIsFullyCached(true);
      toast({
        title: "Download complete!",
        description: "The entire Bible is now available offline",
      });
      
      if (onDownloadComplete) {
        onDownloadComplete();
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download failed",
        description: "Failed to download Bible data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
      await checkCacheStatus();
    }
  };

  const clearCache = async () => {
    try {
      await bibleOfflineCache.clearCache();
      setIsFullyCached(false);
      setDownloadProgress(0);
      setCacheSize(0);
      
      toast({
        title: "Cache cleared",
        description: "All offline Bible data has been removed",
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: "Error",
        description: "Failed to clear cache",
        variant: "destructive"
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5" />
            <span>Offline Bible</span>
          </div>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            {isFullyCached && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Check className="h-3 w-3 mr-1" />
                Cached
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="text-center space-y-2">
          {isFullyCached ? (
            <div className="text-green-600 dark:text-green-400">
              <Check className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">Bible is available offline</p>
              <p className="text-sm text-gray-500">
                You can read the Bible without internet connection
              </p>
            </div>
          ) : (
            <div className="text-gray-600 dark:text-gray-400">
              <Download className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">Download for offline use</p>
              <p className="text-sm text-gray-500">
                Get the complete Bible for reading without internet
              </p>
            </div>
          )}
        </div>

        {/* Download Progress */}
        {(isDownloading || (downloadProgress > 0 && downloadProgress < 100)) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Downloading...</span>
              <span>{downloadProgress}%</span>
            </div>
            <Progress value={downloadProgress} className="w-full" />
            <p className="text-xs text-gray-500 text-center">
              This may take a few minutes depending on your connection
            </p>
          </div>
        )}

        {/* Cache Information */}
        {cacheSize > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Storage used:</span>
              <span className="font-medium">{formatBytes(cacheSize)}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!isFullyCached ? (
            <Button
              onClick={startDownload}
              disabled={isDownloading || !isOnline}
              className="w-full"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Bible ({!isOnline ? 'Offline' : 'Online'})
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh App
              </Button>
              <Button
                onClick={clearCache}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Offline Data
              </Button>
            </div>
          )}
        </div>

        {/* Offline Notice */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3"
          >
            <div className="flex items-center space-x-2 text-orange-800 dark:text-orange-200">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">You're offline</span>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
              {isFullyCached 
                ? "You can still read the Bible since it's downloaded"
                : "Connect to internet to download Bible data"
              }
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default BibleOfflineManager;