import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {Assets} from '@/assets/assets';
const Login = () => {
  const { login, loginWithGoogle, loading, error, clearError } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Clear errors when component mounts or form data changes
  useEffect(() => {
    clearError();
  }, [formData, clearError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(formData.email, formData.password);
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your account.",
      });
      navigate("/dashboard");
    } catch (error) {
      // Error is already handled by AuthProvider
      console.log("Login failed:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google.",
      });
      navigate("/dashboard");
    } catch (error) {
      // Error is already handled by AuthProvider
      console.log("Google login failed:", error);
    }
  };

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
          className="ripple-effect text-white rounded-full w-8 h-8 bg-purple-600 hover:bg-purple-700 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-[#0d0f1c] dark:text-white text-lg font-bold tracking-tight flex-1 text-center pr-12">
          Sign In
        </h2>
      </div>

      <div className="flex w-full grow bg-white @container p-4">
        <div className="w-full gap-1 overflow-hidden bg-[#f8f9fc] @[480px]:gap-2 aspect-[3/2] rounded-xl flex">
          <div
            className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none flex-1"
            style={{
              backgroundImage: `url('${Assets.Pic3}')`,
            }}
          ></div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-3 px-4"
      >
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Email Input */}
        <div className="w-full max-w-md">
          <label className="block text-sm font-medium text-[#47569e] dark:text-purple-200 mb-1">
            Email
          </label>
          <div className="flex items-center bg-[#e6e9f4] dark:bg-gray-800 rounded-xl overflow-hidden">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              className="flex-1 h-14 px-4 bg-transparent text-[#0d0f1c] dark:text-white placeholder:text-[#47569e] dark:placeholder:text-purple-200 focus:outline-none"
              required
            />
            <Mail className="h-5 w-5 mx-4 text-[#47569e] dark:text-purple-200" />
          </div>
        </div>

        {/* Password Input */}
        <div className="w-full max-w-md">
          <label className="block text-sm font-medium text-[#47569e] dark:text-purple-200 mb-1">
            Password
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

          {/* Forgot Password */}
          <div className="text-left mt-1">
            <Link
              to="/forgot-password"
              className="text-sm text-purple-600 hover:text-purple-700 transition"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full max-w-md h-12 bg-purple-700 text-white font-bold rounded-full hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </div>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-3 flex items-center justify-center gap-2 w-full max-w-md h-12 bg-[#e6e9f4] dark:bg-gray-800 text-[#0d0f1c] dark:text-purple-200 font-bold rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24px"
            height="24px"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M224,128a96,96,0,1,1-21.95-61.09,8,8,0,1,1-12.33,10.18A80,80,0,1,0,207.6,136H128a8,8,0,0,1,0-16h88A8,8,0,0,1,224,128Z"></path>
          </svg>
          Login with Google
        </button>

        {/* Already have an account */}
        <div className="flex flex-col">
          <p className="text-[#47569e] dark:text-purple-200 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
            Don't have an account?{" "}
          </p>
          <Link
            to="/signup"
            className="text-[#47569e] dark:text-purple-200 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center underline hover:text-purple-600 transition-colors"
          >
            Sign Up
          </Link>
          <div className="h-5 bg-white dark:bg-gray-900"></div>
        </div>
      </form>
    </div>
  );
};

export default Login;
