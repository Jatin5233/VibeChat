"use client";

import { useState, FormEvent } from "react";
import api from "@/utils/refreshAccess";
import toast from "react-hot-toast";
import { Mail, LoaderCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/api/auth/forget-password", { email });
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#101636]">
      <div className="w-full max-w-md p-8 space-y-6 bg-[#1a1f3c] rounded-lg shadow-xl">
        {isSubmitted ? (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Check Your Inbox</h1>
            <p className="mt-4 text-gray-300">
              If an account with that email exists, we have sent a password reset link to{" "}
              <span className="font-semibold text-pink-400">{email}</span>.
            </p>
             <Link 
              href="/login" 
              className="inline-block w-full px-4 py-2.5 mt-6 text-center text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white">Forgot Password?</h1>
              <p className="mt-2 text-sm text-gray-300">
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 bg-[#101636] border border-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 px-4 py-2.5 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1f3c] focus:ring-green-500 disabled:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    Sending Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
             <footer className="mt-6 text-center text-sm text-gray-400">
               <Link href="/login" className="text-pink-400 hover:text-pink-300 font-medium">
                  Back to Login
                </Link>
             </footer>
          </>
        )}
      </div>
    </div>
  );
}
