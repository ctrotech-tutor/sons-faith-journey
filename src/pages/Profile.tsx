
import { useState, useEffect } from 'react';
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
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { convertFileToBase64, validateFileSize } from '@/lib/fileUtils';

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
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [viewingUserProfile, setViewingUserProfile] = useState<any>(null);

  useEffect(() => {
    if (userId && userId !== user?.uid) {
      // Viewing someone else's profile
      setIsOwnProfile(false);
      loadUserProfile(userId);
    } else {
      // Viewing own profile
      setIsOwnProfile(true);
      if (userProfile) {
        setDisplayName(userProfile.displayName || '');
        setBio(userProfile.bio || '');
        setProfilePhoto(userProfile.profilePhoto || '');
      }
    }
  }, [userId, user, userProfile]);

  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const profile = userDoc.data();
        setViewingUserProfile(profile);
        setDisplayName(profile.displayName || '');
        setBio(profile.bio || '');
        setProfilePhoto(profile.profilePhoto || '');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user profile.',
        variant: 'destructive'
      });
    }
  };

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
      
      toast({
        title: 'Photo uploaded',
        description: 'Your profile photo has been updated. Don\'t forget to save!'
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !isOwnProfile) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        bio,
        profilePhoto,
        updatedAt: new Date()
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.'
      });

      // Refresh the profile data
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600">Please sign in to access profiles.</p>
        </div>
      </div>
    );
  }

  const currentProfile = isOwnProfile ? userProfile : viewingUserProfile;
  const currentEmail = isOwnProfile ? user.email : currentProfile?.email;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">
            {isOwnProfile ? 'My Profile' : `${currentProfile?.displayName || 'User'}'s Profile`}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profilePhoto} />
                  <AvatarFallback className="text-2xl">
                    {displayName?.charAt(0) || currentEmail?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <label className="absolute bottom-0 right-0 bg-[#FF9606] text-white rounded-full p-2 cursor-pointer hover:bg-[#FF9606]/90">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                  disabled={!isOwnProfile}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  disabled={!isOwnProfile}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  value={currentEmail || ''}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              {isOwnProfile && (
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full bg-[#FF9606] hover:bg-[#FF9606]/90"
                >
                  {loading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
