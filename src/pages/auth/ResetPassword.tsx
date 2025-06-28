import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/hooks/useAuth";
import { Assets } from "@/assets/assets";

const ResetPassword = () => {
  const {
    verifyPasswordResetCode,
    confirmPasswordReset,
    loading,
    error,
    clearError,
  } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [success, setSuccess] = useState(false);
  const [validCode, setValidCode] = useState(false);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const actionCode = searchParams.get("oobCode");

  // Clear errors when component mounts or form data changes
  useEffect(() => {
    clearError();
  }, [formData, clearError]);

  useEffect(() => {
    const verifyCode = async () => {
      if (!actionCode) {
        toast({
          title: "Invalid Link",
          description: "This password reset link is invalid or has expired.",
          variant: "destructive",
        });
        setTimeout(() => {
          navigate("/forgot-password");
        }, 3000);
        return;
      }

      try {
        const verifiedEmail = await verifyPasswordResetCode(actionCode);
        setEmail(verifiedEmail);
        setValidCode(true);
      } catch (error) {
        // Error is already handled by AuthProvider
        console.log("Failed to verify password reset code:", error);
        setTimeout(() => {
          navigate("/forgot-password");
        }, 5000);
      }
    };

    verifyCode();
  }, [actionCode, navigate, toast, verifyPasswordResetCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 6 && typeof formData.password === "string") {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !actionCode) return;

    try {
      await confirmPasswordReset(actionCode, formData.password);
      setSuccess(true);
      toast({
        title: "Password Reset Successful!",
        description: "Your password has been successfully reset.",
      });
    } catch (error) {
      // Error is already handled by AuthProvider
      console.log("Password reset failed:", error);
    }
  };

  if (!validCode) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full px-4 py-10 max-w-md mx-auto text-center space-y-6 min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 rounded-full border-4 border-purple-600 border-t-transparent"
        />

        <p className="text-sm text-gray-900 dark:text-gray-300 font-medium">
          Validating reset link...
        </p>
      </motion.div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full px-4 py-10 max-w-md mx-auto text-center space-y-6 min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900"
      >
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto shadow"
        >
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </motion.div>

        {/* Message */}
        <div className="space-y-2">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Your password has been successfully reset for:
          </p>
          <p className="font-semibold text-lg text-gray-900 dark:text-white tracking-tight">
            {email}
          </p>
        </div>

        {/* Continue to Sign In */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={() => navigate("/login")}
            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-all duration-300 shadow-md"
          >
            Continue to Sign In
          </Button>
        </motion.div>
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
          onClick={() => {
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate("/forgot-password");
            }
          }}
          className="ripple-effect text-white rounded-full w-8 h-8 bg-purple-600 hover:bg-purple-700 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-[#0d0f1c] dark:text-white text-lg font-bold tracking-tight flex-1 text-center pr-12">
          Reset Password
        </h2>
      </div>

      <div className="flex w-full bg-white dark:bg-gray-900 @container p-4">
        <div className="w-full gap-1 overflow-hidden bg-[#f8f9fc] dark:bg-gray-900 @[480px]:gap-2 aspect-[3/2] rounded-xl flex">
          <div
            className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none flex-1"
            style={{
              backgroundImage: `url('${Assets.Pic13}')`,
            }}
          ></div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-3 px-4"
      >
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Password Input */}
        <div className="w-full max-w-md">
          <label className="block text-sm font-medium text-[#47569e] dark:text-purple-200 mb-1">
            New Password
          </label>
          <div className="flex items-center bg-[#e6e9f4] dark:bg-gray-800 rounded-xl overflow-hidden relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="flex-1 h-14 px-4 bg-transparent text-[#0d0f1c] dark:text-white placeholder:text-[#47569e] dark:placeholder:text-purple-200 focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-[#47569e] dark:text-purple-200"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
            <Lock className="h-5 w-5 mx-4 text-[#47569e] dark:text-purple-200" />
          </div>
        </div>

        {/* Confirm Password Input */}

        <div className="w-full max-w-md">
          <label className="block text-sm font-medium text-[#47569e] dark:text-purple-200 mb-1">
            Confirm Password
          </label>
          <div className="flex items-center bg-[#e6e9f4] dark:bg-gray-800 rounded-xl overflow-hidden relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              className="flex-1 h-14 px-4 bg-transparent text-[#0d0f1c] dark:text-white placeholder:text-[#47569e] dark:placeholder:text-purple-200 focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-[#47569e] dark:text-purple-200"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
            <Lock className="h-5 w-5 mx-4 text-[#47569e] dark:text-purple-200" />
          </div>
        </div>

        {/* Reset Password Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full max-w-md h-12 bg-purple-700 text-white font-bold rounded-full hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Resetting Password...
            </div>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
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
    </div>
  );
};

export default ResetPassword;
