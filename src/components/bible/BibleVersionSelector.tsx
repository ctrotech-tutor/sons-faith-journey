
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, Download, Check, Wifi, WifiOff } from 'lucide-react';

interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  isOffline?: boolean;
}

interface BibleVersionSelectorProps {
  selectedVersion: string;
  onVersionChange: (version: string) => void;
  isOnline: boolean;
}

const BibleVersionSelector = ({ selectedVersion, onVersionChange, isOnline }: BibleVersionSelectorProps) => {
  const [downloadingVersions, setDownloadingVersions] = useState<Set<string>>(new Set());

  const versions: BibleVersion[] = [
    { id: 'kjv', name: 'King James Version', abbreviation: 'KJV', language: 'English', isOffline: true },
    { id: 'esv', name: 'English Standard Version', abbreviation: 'ESV', language: 'English', isOffline: false },
    { id: 'niv', name: 'New International Version', abbreviation: 'NIV', language: 'English', isOffline: false },
    { id: 'nlt', name: 'New Living Translation', abbreviation: 'NLT', language: 'English', isOffline: false },
    { id: 'nasb', name: 'New American Standard Bible', abbreviation: 'NASB', language: 'English', isOffline: false },
    { id: 'nkjv', name: 'New King James Version', abbreviation: 'NKJV', language: 'English', isOffline: false },
  ];

  const handleDownloadVersion = async (versionId: string) => {
    setDownloadingVersions(prev => new Set(prev).add(versionId));
    
    try {
      // Simulate downloading popular books for offline use
      const popularBooks = ['Genesis', 'Psalms', 'Matthew', 'John', 'Romans'];
      
      for (const book of popularBooks) {
        try {
          const response = await fetch(`https://bible-api.com/${book}+1?translation=${versionId}`);
          if (response.ok) {
            // Cache would be handled by BibleStorage
            console.log(`Downloaded ${book} 1 for ${versionId}`);
          }
        } catch (error) {
          console.warn(`Failed to download ${book} for ${versionId}:`, error);
        }
      }
      
      // Mark version as offline available
      // This would typically update a local database
      console.log(`Version ${versionId} downloaded for offline use`);
      
    } catch (error) {
      console.error(`Failed to download version ${versionId}:`, error);
    } finally {
      setDownloadingVersions(prev => {
        const newSet = new Set(prev);
        newSet.delete(versionId);
        return newSet;
      });
    }
  };

  const selectedVersionData = versions.find(v => v.id === selectedVersion);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium">Bible Version</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          <span className="text-xs text-gray-500">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <Select value={selectedVersion} onValueChange={onVersionChange}>
        <SelectTrigger>
          <SelectValue>
            <div className="flex items-center space-x-2">
              <span>{selectedVersionData?.abbreviation}</span>
              {selectedVersionData?.isOffline && (
                <Badge variant="secondary" className="text-xs">
                  Offline
                </Badge>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {versions.map((version) => (
            <div key={version.id} className="flex items-center justify-between p-2 hover:bg-gray-50">
              <SelectItem value={version.id} className="flex-1">
                <div className="flex flex-col">
                  <span className="font-medium">{version.abbreviation}</span>
                  <span className="text-xs text-gray-500">{version.name}</span>
                </div>
              </SelectItem>
              
              <div className="flex items-center space-x-2 ml-2">
                {version.isOffline ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadVersion(version.id);
                    }}
                    disabled={downloadingVersions.has(version.id) || !isOnline}
                    className="h-6 w-6 p-0"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </SelectContent>
      </Select>

      {!isOnline && (
        <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
          You're offline. Only downloaded versions are available.
        </div>
      )}
    </div>
  );
};

export default BibleVersionSelector;
