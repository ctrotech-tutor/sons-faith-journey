import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/hooks/use-toast";
import {
  User,
  Hash,
  Mail,
  Lock,
  Phone,
  MapPin,
  HelpCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

const Signup = () => {
  const { register, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    location: "",
    expectations: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.fullName);
      toast({
        title: "Account Created!",
        description: "Welcome to THE SONS community! Please verify your email.",
      });
      navigate("/email-verification");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description:
          error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: "Welcome!",
        description: "Successfully signed up with Google.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Google Sign-up Failed",
        description: "Failed to sign up with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-white dark:bg-gray-900 justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div>
        <div className="flex items-center bg-white dark:bg-gray-900 p-4 pb-2 justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="ripple-effect text-white rounded-full w-8 h-8 bg-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-[#0d0f1c] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Sign Up
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <div className="flex w-full flex-1 items-stretch rounded-xl">
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] dark:bg-gray-800 dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] focus:border-none h-14 placeholder:text-[#47569e] dark:placeholder:text-purple-200 p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                  required
                />
                <div className="text-[#47569e] flex border-none bg-[#e6e9f4] dark:bg-gray-800 dark:text-purple-200 items-center justify-center pr-4 rounded-r-xl border-l-0">
                  <User className="h-6 w-6" />
                </div>
              </div>
            </label>
          </div>

          {/* Username */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <div className="flex w-full flex-1 items-stretch rounded-xl">
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Username"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] dark:bg-gray-800 dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] focus:border-none h-14 placeholder:text-[#47569e] dark:placeholder:text-purple-200 p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                />
                <div className="text-[#47569e] flex border-none bg-[#e6e9f4] dark:bg-gray-800 dark:text-purple-200 items-center justify-center pr-4 rounded-r-xl border-l-0">
                  <Hash className="h-6 w-6" />
                </div>
              </div>
            </label>
          </div>

          {/* Email */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <div className="flex w-full flex-1 items-stretch rounded-xl">
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] dark:bg-gray-800 dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] focus:border-none h-14 placeholder:text-[#47569e] dark:placeholder:text-purple-200 p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
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
                  placeholder="Password"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] dark:bg-gray-800 dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] focus:border-none h-14 placeholder:text-[#47569e] dark:placeholder:text-purple-200 p-4 rounded-r-none border-r-0 pr-16 text-base font-normal leading-normal"
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
          </div>

          {/* Confirm Password */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <div className="flex w-full flex-1 items-stretch rounded-xl relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] dark:bg-gray-800 dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] focus:border-none h-14 placeholder:text-[#47569e] dark:placeholder:text-purple-200 p-4 rounded-r-none border-r-0 pr-16 text-base font-normal leading-normal"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 text-[#47569e] dark:text-purple-200 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
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
          </div>

          {/* Phone Number */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <div className="flex w-full flex-1 items-stretch rounded-xl">
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] dark:bg-gray-800 dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] focus:border-none h-14 placeholder:text-[#47569e] dark:placeholder:text-purple-200 p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                />
                <div className="text-[#47569e] flex border-none bg-[#e6e9f4] dark:bg-gray-800 dark:text-purple-200 items-center justify-center pr-4 rounded-r-xl border-l-0">
                  <Phone className="h-6 w-6" />
                </div>
              </div>
            </label>
          </div>

          {/* Location */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <div className="flex w-full flex-1 items-stretch rounded-xl">
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Location"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] dark:bg-gray-800 dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] focus:border-none h-14 placeholder:text-[#47569e] dark:placeholder:text-purple-200 p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                />
                <div className="text-[#47569e] flex border-none bg-[#e6e9f4] dark:bg-gray-800 dark:text-purple-200 items-center justify-center pr-4 rounded-r-xl border-l-0">
                  <MapPin className="h-6 w-6" />
                </div>
              </div>
            </label>
          </div>

          {/* Expectations */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <div className="flex w-full flex-1 items-stretch rounded-xl relative">
                <textarea
                  name="expectations"
                  value={formData.expectations}
                  onChange={handleInputChange}
                  placeholder="Expectations"
                  rows={1}
                  className="form-textarea flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] dark:bg-gray-800 dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] focus:border-none placeholder:text-[#47569e] dark:placeholder:text-purple-200 p-4 pr-12 text-base font-normal leading-normal max-h-[140px]"
                  style={{ lineHeight: "1.5", minHeight: "3.5rem" }}
                  onInput={(e) => {
                    e.currentTarget.style.height = "auto";
                    e.currentTarget.style.height =
                      Math.min(e.currentTarget.scrollHeight, 140) + "px";
                  }}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#47569e] dark:text-purple-200">
                  <HelpCircle className="h-6 w-6" />
                </div>
              </div>
            </label>
          </div>

          {/* Google Sign Up Button */}
          <div className="flex px-4 py-3">
            <button
              type="button"
              onClick={handleGoogleSignup}
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
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 bg-purple-700 dark:bg-purple-700 text-[#f8f9fc] text-base font-bold leading-normal tracking-[0.015em] hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="truncate">Creating Account...</span>
                </>
              ) : (
                <span className="truncate">Sign Up</span>
              )}
            </button>
          </div>
        </form>
      </div>

      <div>
        <p className="text-[#47569e] dark:text-purple-200 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
          Already have an account?
        </p>
        <Link to="/login" className="block">
          <p className="text-[#47569e] dark:text-purple-200 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center underline hover:text-purple-600 transition-colors">
            Log In
          </p>
        </Link>
        <div className="h-5 bg-white dark:bg-gray-900"></div>
      </div>
    </div>
  );
};

export default Signup;
