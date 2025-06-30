import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/hooks/useAuth";
import { Assets } from "@/assets/assets";

const ForgotPassword = () => {
  const { sendPasswordReset, loading, error, clearError } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

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
        title: "Reset Email Sent!",
        description: "Check your email for password reset instructions.",
      });
    } catch (error) {
      // Error is already handled by AuthProvider
      console.log("Password reset failed:", error);
    }
  };

  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full px-4 py-10 max-w-md mx-auto text-center space-y-6 min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </motion.div>

        {/* Message */}
        <div className="mt-6 space-y-2">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            We've sent a password reset link to:
          </p>
          <p className="font-semibold text-lg text-gray-900 dark:text-white tracking-tight">
            {email}
          </p>
        </div>

        {/* Additional Info + Actions */}
        <div className="mt-8 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Didn't receive the email? Check your spam folder or try again.
          </p>

          <Button
            variant="outline"
            onClick={() => {
              setEmailSent(false);
              clearError();
            }}
            className="w-full max-w-md h-12 text-white font-bold rounded-full transition disabled:cursor-not-allowed"
          >
            Try Different Email
          </Button>

          <Link to="/login" className="block">
            <Button className="w-full max-w-md h-12 bg-purple-700 text-white font-bold rounded-full hover:bg-purple-800 transition disabled:cursor-not-allowed">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="relative flex min-h-screen flex-col bg-white dark:bg-gray-900 justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div>
        <div className="flex items-center bg-white dark:bg-gray-900 p-4 pb-2 justify-between sticky top-0 z-20 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.history.length > 2) {
                navigate(-1);
              } else {
                navigate("/login");
              }
            }}
            className="ripple-effect text-white rounded-full w-8 h-8 bg-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-[#0d0f1c] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Forgot Password
          </h2>
        </div>

        <div className="flex w-full grow bg-white dark:bg-gray-900 @container p-4">
          <div className="w-full gap-1 overflow-hidden bg-[#f8f9fc] dark:bg-gray-900 @[480px]:gap-2 aspect-[3/2] rounded-xl flex">
            <div
              className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none flex-1"
              style={{
                backgroundImage: `url('${Assets.Pic11}')`,
              }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          {/* Email */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <div className="flex w-full flex-1 items-stretch rounded-xl">
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="Email"
                  className="disabled:opacity-50 transition-opacity duration-300  form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] dark:bg-gray-800 dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] focus:border-none h-14 placeholder:text-[#47569e] dark:placeholder:text-purple-200 p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                  required
                />
                <div className="text-[#47569e] flex border-none bg-[#e6e9f4] dark:bg-gray-800 dark:text-purple-200 items-center justify-center pr-4 rounded-r-xl border-l-0">
                  <Mail className="h-6 w-6" />
                </div>
              </div>
            </label>
          </div>

          {/* Sign Up Button */}
          <div className="flex px-4 py-3">
            <button
              type="submit"
              disabled={loading}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 bg-purple-600 dark:bg-purple-600 text-[#f8f9fc] text-base font-bold leading-normal tracking-[0.015em] hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="truncate">Sending Reset Email...</span>
                </>
              ) : (
                <span className="truncate">Send Reset Email</span>
              )}
            </button>
          </div>
        </form>
      </div>
      <div>
        <p className="text-[#47569e] dark:text-purple-200 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
          Rememberd my password?
        </p>
        <Link to="/login" className="block">
          <p className="text-[#47569e] dark:text-purple-200 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center underline hover:text-purple-600 transition-colors">
            Sign In
          </p>
        </Link>
        <div className="h-5 bg-white dark:bg-gray-900"></div>
      </div>
    </div>
  );
};

export default ForgotPassword;
