
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthLayout from './AuthLayout';

const ForgotPassword = () => {
  const { sendPasswordReset, loading, error, clearError } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Clear errors when component mounts or email changes
  useEffect(() => {
    clearError();
  }, [email, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await sendPasswordReset(email);
      setEmailSent(true);
      toast({
        title: 'Reset Email Sent!',
        description: 'Check your email for password reset instructions.',
      });
    } catch (error) {
      // Error is already handled by AuthProvider
      console.log('Password reset failed:', error);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent you a password reset link"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              We've sent a password reset link to:
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {email}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            
            <Button
              onClick={() => {
                setEmailSent(false);
                clearError();
              }}
              variant="outline"
              className="w-full"
            >
              Try Different Email
            </Button>
            
            <Link to="/login" className="block">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to reset your password"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending Reset Email...
            </>
          ) : (
            'Send Reset Email'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Remember your password?{' '}
          <Link
            to="/login"
            className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
