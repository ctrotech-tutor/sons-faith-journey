// Profile.tsx
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/use-toast';
import { Camera, Save, ArrowLeft, MapPin, Phone, Calendar, Mail } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
//import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
//import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { convertFileToBase64, validateFileSize } from '@/lib/fileUtils';
//import ProfileSkeleton from '@/components/ProfileSkeleton';
import { GoogleLinkManager } from '@/components/GoogleLinkManager';
import { uploadToCloudinary } from '@/lib/cloudinary';
const Spinner = ({ size = 'h-6 w-6', border = 'border-2' }) => (
  <div className={`animate-spin rounded-full ${size} ${border} border-purple-900 border-t-transparent`} />
);

const Profile = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userId } = useParams();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [originalData, setOriginalData] = useState({ displayName: '', bio: '', profilePhoto: '' });
  const [viewingUserProfile, setViewingUserProfile] = useState<any>(null);

  const [darkMode, setDarkMode] = useState(false);
  const [isPublic, setIsPublic] = useState(true);



  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const togglePublicProfile = () => setIsPublic(prev => !prev);

  const isOwnProfile = !userId || userId === user?.uid;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (!user) return;

        if (!isOwnProfile && userId) {
          const docRef = doc(db, 'users', userId);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            const data = snapshot.data();
            setViewingUserProfile(data);
            setDisplayName(data.displayName || '');
            setBio(data.bio || '');
            setProfilePhoto(data.profilePhoto || '');
          } else {
            toast({ title: 'User not found', variant: 'destructive' });
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
      } catch (error) {
        toast({ title: 'Error loading profile', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, userId, userProfile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileSize(file, 5)) {
      toast({ title: 'File too large', description: 'Select a file below 5MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setProfilePhoto(url);
      toast({ title: 'Image ready', description: 'Click Save to apply changes.' });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
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

    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        bio,
        profilePhoto,
        updatedAt: new Date()
      });
      toast({ title: 'Profile updated successfully' });
      setOriginalData({ displayName, bio, profilePhoto });
    } catch (error) {
      toast({ title: 'Error saving profile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-gray-600">Please sign in to view this profile.</p>
          <Button onClick={() => navigate('/auth/login')} className="mt-4">Sign In</Button>
        </div>
      </div>
    );
  }

  const profile = isOwnProfile ? userProfile : viewingUserProfile;
  const currentEmail = isOwnProfile ? user?.email : profile?.email || '';

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="h-10 w-10" border="border-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 pb-32">
      {/* Header */}
      <div className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-md py-3 flex items-center shadow-sm px-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="ml-4 text-lg font-semibold">
          {isOwnProfile ? 'My Profile' : `${profile.displayName || 'User'}'s Profile`}
        </h1>
      </div>

      {/* Profile Card */}
      <div className="flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-2xl p-6 flex flex-col gap-4 items-center shadow-lg"
        >
          <div className="flex flex-col items-center justify-center gap-4 relative">
            {/* Avatar with upload and overlay */}
            <div className="relative group">
              <div className="rounded-full p-0.5 bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-lg">
                <Avatar className="h-24 w-24 border-background transition-all duration-300 group-active:scale-105">
                  <AvatarImage src={profilePhoto || profile?.profilePhoto || ''} />
                  <AvatarFallback className="text-2xl font-semibold bg-muted text-muted-foreground">
                    {displayName?.charAt(0) || currentEmail?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {isOwnProfile && (
                <label className="absolute bottom-1 right-1 bg-purple-600 text-white p-2 rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}

              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-10">
                  <Spinner />
                </div>
              )}
            </div>

            {/* Name and Bio */}
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-foreground leading-tight">
                {displayName || currentEmail || 'User'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {bio || 'No bio added yet'}
              </p>
            </div>
          </div>


          <div className="w-full bg-white/5 rounded-xl p-3 space-y-4 backdrop-blur-md">
            <h2 className="text-base font-semibold text-primary">Contact & Details</h2>

            {/* Phone */}
            <div className="flex justify-between items-center gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Phone</span>
              </div>
              <span className="truncate max-w-[60%] text-right text-sm font-semibold text-foreground">
                {profile?.phone || 'N/A'}
              </span>
            </div>

            {/* Location */}
            <div className="flex justify-between items-center gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="bg-emerald-100 dark:bg-emerald-900/20 p-1.5 rounded-md">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="text-sm font-medium">Location</span>
              </div>
              <span className="truncate max-w-[60%] text-right text-sm font-semibold text-foreground">
                {profile?.location || 'N/A'}
              </span>
            </div>

            {/* Joined */}
            <div className="flex justify-between items-center gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="bg-purple-100 dark:bg-purple-900/20 p-1.5 rounded-md">
                  <Calendar className="h-4 w-4 text-purple-500" />
                </div>
                <span className="text-sm font-medium">Joined</span>
              </div>
              <span className="text-sm text-right text-foreground font-semibold">
                {profile?.createdAt?.toDate?.().toLocaleDateString?.('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }) || 'Unknown'}
              </span>
            </div>

            {/* Email */}
            <div className="flex justify-between items-center gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-1.5 rounded-md">
                  <Mail className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-sm font-medium">Email</span>
              </div>
              <span className="truncate max-w-[60%] text-right text-sm font-semibold text-foreground">
                {currentEmail || 'Unknown'}
              </span>
            </div>
          </div>


          {isOwnProfile && hasChanges && (
            <Button onClick={handleSave} className="w-full mt-6" disabled={loading}>
              {loading ? <Spinner /> : <><Save className="mr-2 h-4 w-4" /> Save</>}
            </Button>
          )}
          <Button className='font-medium mt-6'>Edit Profile</Button>
        </motion.div>
      </div>
      <div className="w-full bg-white/5 rounded-xl p-4 space-y-4 backdrop-blur-md">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Enable Dark Mode</span>
              <Switch checked onCheckedChange={toggleDarkMode} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Make Profile Public</span>
              <Switch checked={isPublic} onCheckedChange={togglePublicProfile} />
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>Update your core account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full">Change Display Name</Button>
            <Button variant="outline" className="w-full">Update Email</Button>
            <Button variant="outline" className="w-full">Reset Password</Button>
          </CardContent>
        </Card>

        {/* Connected Account */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Account</CardTitle>
            <CardDescription>Google account linked to your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <GoogleLinkManager />
          </CardContent> 
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage or export your personal data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full">Download My Data</Button>
            <Button variant="destructive" className="w-full">Delete My Account</Button>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Ctrotech</CardTitle>
            <CardDescription>Platform info and support</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Ctrotech empowers learners to grow through structured learning and digital tools.
              You're using version <strong>v1.0</strong>.
            </p>
            <p>
              Need help? <a href="mailto:support@ctrotech.com" className="underline text-blue-600">Contact support</a>
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default Profile;
