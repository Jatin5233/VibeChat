"use client";
// Remove or change this line:
// export const dynamic = "error";
export const dynamic = "force-dynamic"; // or remove this line entirely

import { useSearchParams, useRouter } from "next/navigation";
import { useState, FormEvent, useEffect, Suspense } from "react";
import api from "@/utils/refreshAccess";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, LoaderCircle } from "lucide-react";

// Create a separate component for the form logic
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State Management
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation Logic
  const validateForm = () => {
    const newErrors: { password?: string; confirm?: string } = {};
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }
    if (password !== confirmPassword) {
      newErrors.confirm = "Passwords do not match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = searchParams.get("token");
    const id = searchParams.get("id"); 

    if (!token) {
      toast.error("Invalid or missing reset token link.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/api/auth/reset-password", {
        token,
        id,
        password,
      });
      toast.success("Password has been reset successfully!");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Password reset failed. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-[#1a1f3c] rounded-lg shadow-xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Set a New Password</h1>
        <p className="mt-2 text-sm text-gray-300">
          Your new password must be at least 8 characters long.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password Input */}
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-300">
            New Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="w-5 h-5 text-gray-400" />
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2 pl-10 pr-10 bg-[#101636] border border-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-1">
          <label htmlFor="confirm-password" className="text-sm font-medium text-gray-300">
            Confirm New Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="w-5 h-5 text-gray-400" />
            </span>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-2 pl-10 pr-4 bg-[#101636] border border-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 px-4 py-2.5 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1f3c] focus:ring-green-500 disabled:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingSpinner() {
  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-[#1a1f3c] rounded-lg shadow-xl">
      <div className="flex justify-center">
        <LoaderCircle className="w-8 h-8 animate-spin text-green-500" />
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#101636]">
      <Suspense fallback={<LoadingSpinner />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}