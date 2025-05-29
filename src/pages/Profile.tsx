// Profile.tsx
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Camera, Save, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { convertFileToBase64, validateFileSize } from '@/lib/fileUtils';

const PURPLE_ACCENT = '#8B5CF6';

const Spinner = ({ size = 'h-6 w-6', border = 'border-2' }) => (
  <div className={`animate-spin rounded-full ${size} ${border} border-purple-900 border-t-transparent`} />
);

const Profile = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [originalData, setOriginalData] = useState({ displayName: '', bio: '', profilePhoto: '' });
  const [viewingUserProfile, setViewingUserProfile] = useState(null);

  const isOwnProfile = !userId || userId === user?.uid;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      if (!isOwnProfile && userId) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const profile = userDoc.data();
            setViewingUserProfile(profile);
            setDisplayName(profile.displayName || '');
            setBio(profile.bio || '');
            setProfilePhoto(profile.profilePhoto || '');
          }
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to load user profile.', variant: 'destructive' });
        }
      } else if (userProfile) {
        setDisplayName(userProfile.displayName || '');
        setBio(userProfile.bio || '');
        setProfilePhoto(userProfile.profilePhoto || '');
        setOriginalData({
          displayName: userProfile.displayName || '',
          bio: userProfile.bio || '',
          profilePhoto: userProfile.profilePhoto || ''
        });
      }
    };
    fetchProfile();
  }, [user, userId, userProfile, isOwnProfile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileSize(file, 5)) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const base64String = await convertFileToBase64(file);
      setProfilePhoto(base64String);
      toast({ title: 'Photo uploaded', description: "Don't forget to save changes!" });
    } catch {
      toast({ title: 'Upload failed', description: 'Try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const hasChanges = useMemo(() => {
    return (
      displayName !== originalData.displayName ||
      bio !== originalData.bio ||
      profilePhoto !== originalData.profilePhoto
    );
  }, [displayName, bio, profilePhoto, originalData]);

  const handleSave = async () => {
    if (!user || !isOwnProfile || !hasChanges) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        bio,
        profilePhoto,
        updatedAt: new Date()
      });
      toast({ title: 'Profile updated', description: 'Changes saved successfully.' });
      setOriginalData({ displayName, bio, profilePhoto });
    } catch (error) {
      toast({ title: 'Error', description: 'Update failed. Try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-gray-600">Please sign in to access profiles.</p>
        </div>
      </div>
    );
  }

  const profile = isOwnProfile ? userProfile : viewingUserProfile;
  const currentEmail = isOwnProfile ? user.email : profile?.email;

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 z-30 w-full bg-white border-b p-4 flex items-center shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="ml-4 text-lg font-semibold">
          {isOwnProfile ? 'My Profile' : `${profile?.displayName || 'User'}'s Profile`}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-20 px-4 space-y-6"
      >
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar className="h-28 w-28">
              <AvatarImage src={profilePhoto} />
              <AvatarFallback className="text-2xl">
                {displayName?.charAt(0) || currentEmail?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <label className={`absolute bottom-0 right-0 bg-[${PURPLE_ACCENT}] text-white rounded-full p-2 cursor-pointer`}>
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <Spinner />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={!isOwnProfile} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell us about yourself..."
              disabled={!isOwnProfile}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input value={currentEmail || ''} disabled className="bg-gray-100" />
          </div>

          {isOwnProfile && (
            <div className="w-full flex items-center justify-center">
            <Button
              onClick={handleSave}
              disabled={loading || !hasChanges}
              size='lg'
              className="bg-white text-purple-900 font-semibold hover:bg-purple-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-300 px-10 py-4 rounded-xl"
            >
              {loading ? <Spinner size="h-4 w-4" border="border-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;