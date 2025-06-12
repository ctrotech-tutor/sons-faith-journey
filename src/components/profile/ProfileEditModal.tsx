
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileEditModal = ({ isOpen, onClose }: ProfileEditModalProps) => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.bio || '',
    phone: userProfile?.phone || '',
    location: userProfile?.location || '',
    profilePhoto: userProfile?.profilePhoto || ''
  });
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, profilePhoto: url }));
      toast({ title: 'Photo uploaded successfully' });
    } catch (error) {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        updatedAt: new Date(),
        lastProfileUpdate: new Date()
      });
      
      toast({ title: 'Profile updated successfully' });
      onClose();
    } catch (error) {
      toast({ title: 'Error updating profile', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.profilePhoto} />
                <AvatarFallback className="text-xl">
                  {formData.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-purple-700">
                <Camera className="h-3 w-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
          </div>

          {/* Form Fields */}
          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <Input
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="Your display name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Your location"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileEditModal;
