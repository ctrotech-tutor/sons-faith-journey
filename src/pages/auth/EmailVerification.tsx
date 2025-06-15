
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthLayout from './AuthLayout';

const EmailVerification = () => {
  const { 
    user, 
    userProfile, 
    sendEmailVerification, 
    refreshUserProfile, 
    loading, 
    error, 
    clearError 
  } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    // Check if user is already verified
    if (user?.emailVerified || userProfile?.emailVerified) {
      setIsVerified(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [user, userProfile, navigate]);

  const handleResendEmail = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'No user found. Please sign in again.',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    try {
      await sendEmailVerification();
      toast({
        title: 'Email Sent!',
        description: 'Check your inbox for the verification email.',
      });
    } catch (error) {
      // Error is already handled by AuthProvider
      console.log('Failed to send verification email:', error);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;

    setCheckingVerification(true);
    try {
      // Reload user to get latest email verification status
      await user.reload();
      
      if (user.emailVerified) {
        // Refresh user profile to update the verification status
        await refreshUserProfile();
        setIsVerified(true);
        toast({
          title: 'Email Verified!',
          description: 'Your email has been successfully verified.',
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        toast({
          title: 'Not Verified Yet',
          description: 'Please check your email and click the verification link.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to check verification status.',
        variant: 'destructive'
      });
    } finally {
      setCheckingVerification(false);
    }
  };

  if (isVerified) {
    return (
      <AuthLayout
        title="Email Verified!"
        subtitle="Welcome to THE SONS community"
        showBackButton={false}
      >
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </motion.div>
          
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              Your email has been successfully verified!
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to your dashboard...
            </p>
          </div>

          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="Check your inbox and click the verification link"
    >
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              We've sent a verification email to:
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.email || userProfile?.email}
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleCheckVerification}
              disabled={loading || checkingVerification}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium"
            >
              {checkingVerification ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  I've Verified My Email
                </>
              )}
            </Button>

            <Button
              onClick={handleResendEmail}
              disabled={loading}
              variant="outline"
              className="w-full h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-2">
            <p>Didn't receive the email? Check your spam folder.</p>
            <p>Having trouble? Contact support for assistance.</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default EmailVerification;
