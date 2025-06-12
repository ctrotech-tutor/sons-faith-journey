
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/use-toast';
import { useTheme } from '@/lib/context/ThemeContext';
import { 
  Mail, 
  Lock, 
  Shield, 
  Bell, 
  Eye, 
  EyeOff, 
  Check, 
  AlertTriangle,
  Moon,
  Sun
} from 'lucide-react';
import { 
  updateEmail, 
  updatePassword, 
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';

const AccountSettings = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentPassword: '',
    loading: false,
    showPassword: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    loading: false,
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });

  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  const handleEmailUpdate = async () => {
    if (!user || !emailForm.newEmail || !emailForm.currentPassword) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setEmailForm(prev => ({ ...prev, loading: true }));

    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(
        user.email!,
        emailForm.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update email
      await updateEmail(user, emailForm.newEmail);

      toast({
        title: 'Email Updated',
        description: 'Your email address has been successfully updated.'
      });

      setEmailForm({
        newEmail: '',
        currentPassword: '',
        loading: false,
        showPassword: false
      });
    } catch (error: any) {
      console.error('Error updating email:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update email. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setEmailForm(prev => ({ ...prev, loading: false }));
    }
  };

  const handlePasswordUpdate = async () => {
    if (!user || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all password fields.',
        variant: 'destructive'
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Passwords Don\'t Match',
        description: 'New password and confirmation don\'t match.',
        variant: 'destructive'
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive'
      });
      return;
    }

    setPasswordForm(prev => ({ ...prev, loading: true }));

    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(
        user.email!,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordForm.newPassword);

      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully updated.'
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        loading: false,
        showCurrent: false,
        showNew: false,
        showConfirm: false
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update password. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setPasswordForm(prev => ({ ...prev, loading: false }));
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setResetPasswordLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: 'Reset Email Sent',
        description: 'Password reset instructions have been sent to your email.'
      });
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast({
        title: 'Reset Failed',
        description: 'Failed to send reset email. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setResetPasswordLoading(false);
    }
  };

//function for user to verify their account
const verifyAccount = () => {
  if (!user) {
    toast({
      title: "No User",
      description: "You must be logged in to verify your account.",
      variant: "destructive"
    });
    return;
  }

  if (user.emailVerified) {
    toast({
      title: "Already Verified",
      description: "Your email is already verified.",
      variant: "default"
    });
    return;
  }

  toast({
    title: "Sending Verification...",
    description: "Please wait while we send a verification email."
  });

  sendEmailVerification(user, {
    url: "http://192.168.128.191:8081/",
    handleCodeInApp: true
  })
    .then(() => {
      toast({
        title: "Verification Sent",
        description: "A verification link has been sent to your email. Please check your inbox and follow the link to verify your account.",
        variant: "default"
      });
    })
    .catch((error: any) => {
      console.error("Error sending verification email:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to send verification email. Please try again.",
        variant: "destructive"
      });
    });
}


  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold mb-2">Account Settings</h2>
        <p className={cn(
          "mb-6",
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        )}>
          Manage your account security and preferences
        </p>
      </motion.div>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          {/* Current Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-col w-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Address</p>
                  <p className={cn(
                    "text-sm",
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    {user?.email}
                  </p>
                </div>
                <Badge variant={user?.emailVerified ? 'success' : 'destructive'}>
                  {user?.emailVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
              <Button
                variant={user?.emailVerified ? "outline" : "default"}
                disabled={user?.emailVerified}
                onClick={verifyAccount}
                className="mt-2"
              >
                {user?.emailVerified ? (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Verified
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" /> Verify Account
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Update Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Update Email Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Email Address</label>
                <Input
                  type="email"
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                  placeholder="Enter new email address"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <div className="relative">
                  <Input
                    type={emailForm.showPassword ? 'text' : 'password'}
                    value={emailForm.currentPassword}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setEmailForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                  >
                    {emailForm.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button 
                onClick={handleEmailUpdate} 
                disabled={emailForm.loading || !emailForm.newEmail || !emailForm.currentPassword}
                className="w-full dark:text-white "
              >
                {emailForm.loading ? 'Updating...' : 'Update Email'}
              </Button>
            </CardContent>
          </Card>

          {/* Update Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Change Password</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <div className="relative">
                  <Input
                    type={passwordForm.showCurrent ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setPasswordForm(prev => ({ ...prev, showCurrent: !prev.showCurrent }))}
                  >
                    {passwordForm.showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <Input
                    type={passwordForm.showNew ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setPasswordForm(prev => ({ ...prev, showNew: !prev.showNew }))}
                  >
                    {passwordForm.showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <div className="relative">
                  <Input
                    type={passwordForm.showConfirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setPasswordForm(prev => ({ ...prev, showConfirm: !prev.showConfirm }))}
                  >
                    {passwordForm.showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handlePasswordUpdate} 
                  disabled={passwordForm.loading}
                  className="flex-1"
                >
                  {passwordForm.loading ? 'Updating...' : 'Update Password'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handlePasswordReset}
                  disabled={resetPasswordLoading}
                >
                  {resetPasswordLoading ? 'Sending...' : 'Reset via Email'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className={cn(
                      "text-sm",
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      Choose your preferred appearance
                    </p>
                  </div>
                </div>
                <Button onClick={toggleTheme} variant="outline">
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className={cn(
                      "text-sm",
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      Receive updates about your activity
                    </p>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className={cn(
                      "text-sm",
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      Get notified of new messages
                    </p>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountSettings;
