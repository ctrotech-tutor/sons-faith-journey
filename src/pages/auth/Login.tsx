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
  Check
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Assets } from "@/assets/assets";
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
      <div>
        <div className="flex items-center bg-white dark:bg-gray-900 p-4 pb-2 justify-between sticky top-0 z-20 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.history.length > 2) {
                navigate(-1);
              } else {
                navigate("/signup");
              }
            }}
            className="ripple-effect text-white rounded-full w-8 h-8 bg-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-[#0d0f1c] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Sign In
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
                  value={formData.email}
                  onChange={handleInputChange}
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

          {/* Password */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <div className="flex w-full flex-1 items-stretch rounded-xl relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Password"
                  className="disabled:opacity-50 transition-opacity duration-300 form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] dark:bg-gray-800 dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] focus:border-none h-14 placeholder:text-[#47569e] dark:placeholder:text-purple-200 p-4 rounded-r-none border-r-0 pr-16 text-base font-normal leading-normal"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 text-[#47569e] dark:text-purple-200 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <div className="text-[#47569e] flex border-none bg-[#e6e9f4] dark:bg-gray-800 dark:text-purple-200 items-center justify-center pr-4 rounded-r-xl border-l-0">
                  <Lock className="h-6 w-6" />
                </div>
              </div>
            </label>
            {/*Remember Me & Forgot Password */}
            <div className="flex justify-between items-center w-full text-sm text-gray-800 dark:text-gray-400 mb-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-5 h-5 rounded-md flex items-center justify-center border dark:border-gray-600 text-gray-100 bg-gray-100 peer-checked:border-purple-500 rounded-xs dark:bg-gray-800 dark:text-gray-800 peer-checked:text-white peer-checked:bg-purple-600 transition-colors">
                  <Check className="text-xs" />
                </div>
                Remember Me
              </label>
              <Link
                to="/forgot-password"
                className="hover:text-purple-600 hover:underline transition"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Google Sign Up Button */}
          <div className="flex px-4 py-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 bg-[#e6e9f4] text-[#0d0f1c] dark:shadow-lg dark:bg-gray-800 dark:text-purple-200 gap-2 pl-5 text-base font-bold leading-normal tracking-[0.015em] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="text-[#0d0f1c] dark:text-purple-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24px"
                  height="24px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                  className="dark:fill-purple-200"
                >
                  <path d="M224,128a96,96,0,1,1-21.95-61.09,8,8,0,1,1-12.33,10.18A80,80,0,1,0,207.6,136H128a8,8,0,0,1,0-16h88A8,8,0,0,1,224,128Z"></path>
                </svg>
              </div>
              <span className="truncate">Continue with Google</span>
            </button>
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
                  <span className="truncate">Signing in...</span>
                </>
              ) : (
                <span className="truncate">Sign In</span>
              )}
            </button>
          </div>
        </form>
      </div>
      <div>
        <p className="text-[#47569e] dark:text-purple-200 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
          Don't have an account?
        </p>
        <Link to="/signup" className="block">
          <p className="text-[#47569e] dark:text-purple-200 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center underline hover:text-purple-600 transition-colors">
            Sign Up
          </p>
        </Link>
        <div className="h-5 bg-white dark:bg-gray-900"></div>
      </div>
    </div>
  );
};

export default Login;
