import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/use-toast";
import { useTheme } from "@/lib/context/ThemeContext";
import { useSearchParams } from "react-router-dom";
import {
  Camera,
  Save,
  ArrowLeft,
  MapPin,
  Phone,
  Calendar,
  Mail,
  Edit,
  Settings,
  Activity,
  BarChart3,
  Shield,
  UserCog,
  Download,
  Trash2,
  Moon,
  Sun,
  Bell,
  Lock,
  Globe,
  Smartphone,
  Palette,
  Volume2,
  VolumeX,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convertFileToBase64, validateFileSize } from "@/lib/fileUtils";
import { GoogleLinkManager } from "@/components/GoogleLinkManager";
import { uploadToCloudinary } from "@/lib/cloudinary";
import ProfileEditModal from "@/components/profile/ProfileEditModal";
import ActivityHistory from "@/components/profile/ActivityHistory";
import UserStats from "@/components/profile/UserStats";
import PrivacySettings from "@/components/profile/PrivacySettings";
import AccountSettings from "@/components/profile/AccountSettings";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";

const Spinner = ({ size = "h-6 w-6", border = "border-2" }) => (
  <div
    className={`animate-spin rounded-full ${size} ${border} border-purple-900 border-t-transparent`}
  />
);

const Profile = () => {
  const {
    user,
    userProfile,
    loading: authLoading,
    sendEmailVerification,
    refreshUserProfile,
  } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userId } = useParams();
  const { theme, toggleTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const tabFromURL = searchParams.get("tab");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  // Set the active tab based on URL param or default to 'overview'
  const [activeTab, setActiveTab] = useState(tabFromURL || "overview");

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [originalData, setOriginalData] = useState({
    displayName: "",
    bio: "",
    profilePhoto: "",
  });
  const [viewingUserProfile, setViewingUserProfile] = useState<any>(null);

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState("en");
  const [autoSync, setAutoSync] = useState(true);

  const isOwnProfile = !userId || userId === user?.uid;

  useEffect(() => {
    if (
      tabFromURL &&
      ["overview", "activity", "stats", "settings"].includes(tabFromURL)
    ) {
      setActiveTab(tabFromURL);
    }
  }, [tabFromURL]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (!user) return;

        if (!isOwnProfile && userId) {
          const docRef = doc(db, "users", userId);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            const data = snapshot.data();
            setViewingUserProfile(data);
            setDisplayName(data.displayName || "");
            setBio(data.bio || "");
            setProfilePhoto(data.profilePhoto || "");
          } else {
            toast({ title: "User not found", variant: "destructive" });
          }
        } else if (userProfile) {
          setDisplayName(userProfile.displayName || "");
          setBio(userProfile.bio || "");
          setProfilePhoto(userProfile.profilePhoto || "");
          setOriginalData({
            displayName: userProfile.displayName || "",
            bio: userProfile.bio || "",
            profilePhoto: userProfile.profilePhoto || "",
          });

          // Load user settings
          setNotifications(userProfile.settings?.notifications ?? true);
          setSoundEnabled(userProfile.settings?.soundEnabled ?? true);
          setLanguage(userProfile.settings?.language ?? "en");
          setAutoSync(userProfile.settings?.autoSync ?? true);
        }
      } catch (error) {
        toast({ title: "Error loading profile", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [user, userId, userProfile, authLoading]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileSize(file, 5)) {
      toast({
        title: "File too large",
        description: "Select a file below 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setProfilePhoto(url);
      toast({
        title: "Image ready",
        description: "Click Save to apply changes.",
      });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
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
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        bio,
        profilePhoto,
        updatedAt: new Date(),
      });
      toast({ title: "Profile updated successfully" });
      setOriginalData({ displayName, bio, profilePhoto });
    } catch (error) {
      toast({ title: "Error saving profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    if (!user || !isOwnProfile) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        [`settings.${key}`]: value,
        updatedAt: new Date(),
      });
      toast({ title: "Setting updated" });
    } catch (error) {
      toast({ title: "Error updating setting", variant: "destructive" });
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `my-data-${new Date().toISOString().split("T")[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
      toast({ title: "Data exported successfully" });
    } catch (error) {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmation = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (confirmation) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          deletionRequested: true,
          deletionRequestedAt: new Date(),
        });
        toast({
          title: "Account deletion requested",
          description:
            "Your account will be reviewed for deletion within 7 days.",
        });
      } catch (error) {
        toast({ title: "Deletion request failed", variant: "destructive" });
      }
    }
  };

  const handleSendVerification = async () => {
    if (!user || user.emailVerified) return;

    setSendingVerification(true);
    try {
      await sendEmailVerification();
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox and click the verification link.",
      });
      // Refresh profile to potentially update verification status
      setTimeout(() => {
        refreshUserProfile();
      }, 1000);
    } catch (error) {
      // Error already handled by AuthProvider
    } finally {
      setSendingVerification(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-gray-600">Please sign in to view this profile.</p>
          <Button onClick={() => navigate("/auth/login")} className="mt-4">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const profile = isOwnProfile ? userProfile : viewingUserProfile;
  const currentEmail = isOwnProfile ? user?.email : profile?.email || "";

  if (loading || !profile || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="h-10 w-10" border="border-4" />
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "min-h-screen transition-colors duration-200 pt-4",
          theme === "dark" ? "bg-gray-900/60" : "bg-white"
        )}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/60 border-b border-white/20 dark:border-white/10 shadow-sm"
          >
            <div className="max-w-md mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (window.history.length > 2) {
                        navigate(-1);
                      } else {
                        navigate("/dashboard");
                      }
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 via-purple-700 to-fuchsia-600 bg-clip-text text-transparent">
                    Profile
                  </h1>
                </div>
                {isOwnProfile && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={user?.emailVerified ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {user?.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
                    {!user?.emailVerified && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSendVerification}
                        disabled={sendingVerification}
                        className="h-6 px-2 text-xs"
                      >
                        {sendingVerification ? "Sending..." : "Verify"}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Tab Navigation */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mt-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm p-1 rounded-xl flex justify-between shadow-inner border border-white/20 dark:border-white/10">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="settings">Account</TabsTrigger>
                  <TabsTrigger value="privacy">Privacy</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </motion.div>

          {/* Profile Content Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6 pt-[4.5rem]"
          >
            <TabsContent value="overview" className="space-y-6 px-4">
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white dark:bg-gray-900/60 py-6 px-3 flex flex-col gap-4 items-center"
              >
                <div className="flex flex-col items-center justify-center gap-4 relative">
                  {/* Avatar with upload and overlay */}
                  <div className="relative group">
                    <div className="rounded-full p-0.5 bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-lg">
                      <Avatar className="h-24 w-24 border-background transition-all duration-300 group-active:scale-105">
                        <AvatarImage
                          src={profilePhoto || profile?.profilePhoto || ""}
                        />
                        <AvatarFallback className="text-2xl font-semibold bg-muted text-muted-foreground">
                          {displayName?.charAt(0) ||
                            currentEmail?.charAt(0) ||
                            "U"}
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

                  {/* Name, Bio and Email Status */}
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-foreground leading-tight">
                      {displayName || currentEmail || "User"}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      {bio || "No bio added yet"}
                    </p>

                    {isOwnProfile && (
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">
                            {currentEmail}
                          </span>
                        </div>
                        <Badge
                          variant={
                            user?.emailVerified ? "default" : "destructive"
                          }
                          className="text-xs"
                        >
                          {user?.emailVerified ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Unverified
                            </>
                          )}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Details */}
                <div className="w-full bg-white/5 rounded-xl p-3 space-y-4 backdrop-blur-md dark:bg-gray-700/20">
                  <h2 className="text-base font-semibold text-primary">
                    Contact & Details
                  </h2>

                  {/* Phone */}
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="bg-primary/10 p-1.5 rounded-md">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Phone</span>
                    </div>
                    <span className="truncate max-w-[60%] text-right text-sm font-semibold text-foreground">
                      {profile?.phone || "N/A"}
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
                      {profile?.location || "N/A"}
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
                      {profile?.createdAt
                        ?.toDate?.()
                        .toLocaleDateString?.("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }) || "Unknown"}
                    </span>
                  </div>
                </div>

                {isOwnProfile && (
                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={() => setShowEditModal(true)}
                      className="flex-1"
                      variant="outline"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                    {hasChanges && (
                      <Button onClick={handleSave} disabled={loading}>
                        {loading ? (
                          <Spinner />
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Save
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <ActivityHistory />
            </TabsContent>

            <TabsContent value="settings" className="p-4">
              <AccountSettings />
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <PrivacySettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </>
  );
};

export default Profile;
