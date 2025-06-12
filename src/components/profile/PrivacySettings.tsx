
import { useState, useEffect } from 'react';
import { Shield, Eye, Lock, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/use-toast';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const PrivacySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    isPublic: true,
    showActivity: true,
    showStats: true,
    allowMessages: true,
    showEmail: false
  });

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSettings({
          isPublic: data.privacySettings?.isPublic ?? true,
          showActivity: data.privacySettings?.showActivity ?? true,
          showStats: data.privacySettings?.showStats ?? true,
          allowMessages: data.privacySettings?.allowMessages ?? true,
          showEmail: data.privacySettings?.showEmail ?? false
        });
      }
    });

    return unsubscribe;
  }, [user]);

  const updateSetting = async (key: string, value: boolean) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        [`privacySettings.${key}`]: value,
        updatedAt: new Date()
      });
      
      setSettings(prev => ({ ...prev, [key]: value }));
      toast({ title: 'Privacy setting updated' });
    } catch (error) {
      toast({ title: 'Error updating setting', variant: 'destructive' });
    }
  };

  const privacyOptions = [
    {
      key: 'isPublic',
      label: 'Public Profile',
      description: 'Allow others to view your profile',
      icon: <Globe className="h-4 w-4" />,
      value: settings.isPublic
    },
    {
      key: 'showActivity',
      label: 'Show Activity',
      description: 'Display your recent activity to others',
      icon: <Eye className="h-4 w-4" />,
      value: settings.showActivity
    },
    {
      key: 'showStats',
      label: 'Show Statistics',
      description: 'Display your reading stats and achievements',
      icon: <Shield className="h-4 w-4" />,
      value: settings.showStats
    },
    {
      key: 'allowMessages',
      label: 'Allow Messages',
      description: 'Allow others to send you direct messages',
      icon: <Lock className="h-4 w-4" />,
      value: settings.allowMessages
    },
    {
      key: 'showEmail',
      label: 'Show Email',
      description: 'Display your email address on your profile',
      icon: <Eye className="h-4 w-4" />,
      value: settings.showEmail
    }
  ];

  return (
    <Card className='border-none bg-transparent'>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {privacyOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-gray-600 mt-0.5 flex-shrink-0">{option.icon}</div>
              <div>
                <p className="font-medium">{option.label}</p>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            </div>
            <Switch
              checked={option.value}
              onCheckedChange={(checked) => updateSetting(option.key, checked)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
