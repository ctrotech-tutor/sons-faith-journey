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
      className="w-full px-4 py-8 max-w-md mx-auto text-center"
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
          className="w-full transition-all duration-300 hover:shadow-md"
        >
          Try Different Email
        </Button>

        <Link to="/login" className="block">
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 shadow-md"
          >
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
      {/* Header */}
      <div className="flex items-center bg-white dark:bg-gray-900 p-4 pb-2 justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="ripple-effect text-white rounded-full w-8 h-8 bg-purple-500 hover:bg-purple-700 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-[#0d0f1c] dark:text-white text-lg font-bold tracking-tight flex-1 text-center pr-12">
          Forgot Password
        </h2>
      </div>

      <div className="flex w-full grow bg-white @container p-4">
        <div className="w-full gap-1 overflow-hidden bg-[#f8f9fc] @[480px]:gap-2 aspect-[3/2] rounded-xl flex">
          <div
            className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none flex-1"
            style={{
              backgroundImage: `url('${Assets.Pic10}')`,
            }}
          ></div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-6 px-4 w-full mt-6"
      >
        {/* Error */}
        {error && (
          <div className="w-full max-w-md rounded-lg border border-red-400 bg-red-50 p-3 text-red-800 dark:bg-red-900 dark:border-red-500 dark:text-red-100">
            <AlertCircle className="inline-block w-5 h-5 mr-2" />
            <span>{error.message}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="w-full max-w-md">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#47569e] dark:text-purple-200 mb-1"
          >
            Email Address
          </label>
          <div className="flex items-center bg-[#e6e9f4] dark:bg-gray-800 rounded-xl overflow-hidden">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 h-14 px-4 bg-transparent text-[#0d0f1c] dark:text-white placeholder:text-[#47569e] dark:placeholder:text-purple-200 focus:outline-none"
              required
            />
            <Mail className="h-5 w-5 mx-4 text-[#47569e] dark:text-purple-200" />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full max-w-md h-12 bg-purple-700 text-white font-bold rounded-full hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending Reset Email...
            </div>
          ) : (
            "Send Reset Email"
          )}
        </button>

        {/* Back to Login */}
        <div className="flex flex-col">
          <p className="text-[#47569e] dark:text-purple-200 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
            Remember your password?{" "}
          </p>
          <Link
            to="/login"
            className="text-[#47569e] dark:text-purple-200 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center underline hover:text-purple-600 transition-colors"
          >
            Sign In
          </Link>
          <div className="h-5 bg-white dark:bg-gray-900"></div>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
