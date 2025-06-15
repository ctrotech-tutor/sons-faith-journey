
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const AuthActionHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, verifyPasswordResetCode } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleAuthAction = async () => {
      const mode = searchParams.get('mode');
      const oobCode = searchParams.get('oobCode');
      const continueUrl = searchParams.get('continueUrl');

      if (!mode || !oobCode) {
        navigate('/');
        return;
      }

      try {
        switch (mode) {
          case 'verifyEmail':
            await verifyEmail(oobCode);
            toast({
              title: 'Email Verified!',
              description: 'Your email has been successfully verified.'
            });
            navigate('/profile?tab=overview');
            break;

          case 'resetPassword':
            // Verify the code and redirect to reset password page
            await verifyPasswordResetCode(oobCode);
            navigate(`/auth/reset-password?oobCode=${oobCode}`);
            break;

          default:
            toast({
              title: 'Invalid Action',
              description: 'The link you clicked is not recognized.',
              variant: 'destructive'
            });
            navigate('/');
        }
      } catch (error: any) {
        toast({
          title: 'Action Failed',
          description: error.message || 'The link may be invalid or expired.',
          variant: 'destructive'
        });
        
        // Redirect based on the action type
        if (mode === 'verifyEmail') {
          navigate('/auth/email-verification');
        } else if (mode === 'resetPassword') {
          navigate('/auth/forgot-password');
        } else {
          navigate('/');
        }
      } finally {
        setProcessing(false);
      }
    };

    handleAuthAction();
  }, [searchParams, navigate, verifyEmail, verifyPasswordResetCode, toast]);

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
          <p className="text-gray-600">Processing your request...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthActionHandler;
