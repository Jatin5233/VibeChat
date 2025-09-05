"use client";

import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
    LoaderCircle, Github, Linkedin, Instagram,
    Mail, Lock, Users
} from "lucide-react";

// Header Component
const VibeChatHeader = () => (
  <header className="absolute top-0 left-0 w-full p-4 sm:p-6 z-20">
    <nav className="container mx-auto flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
        VibeChat
      </Link>
     
      
    </nav>
  </header>
);

// Footer Component
const VibeChatFooter = () => (
  <footer className="absolute bottom-0 left-0 w-full p-4 sm:p-6 z-20">
    <div className="container mx-auto text-center text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
      <p>&copy; {new Date().getFullYear()} VibeChat. All rights reserved.</p>
      <div className="flex items-center gap-4">
        <Link href="#" className="hover:text-white transition"><Github size={20} /></Link>
        <Link href="#" className="hover:text-white transition"><Linkedin size={20} /></Link>
        <Link href="#" className="hover:text-white transition"><Instagram size={20} /></Link>
      </div>
    </div>
  </footer>
);

const SignUpPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/users/signup", formData);
      if (res.status === 201) {
        toast.success("Account Created Successfully");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0B0D17] text-gray-100 overflow-hidden font-inter">
        {/* Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-indigo-900/50 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/50 rounded-full filter blur-3xl opacity-30 animate-pulse animation-delay-4000"></div>
        </div>

        <VibeChatHeader />

        <main className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-900/60 border border-gray-800 rounded-2xl shadow-2xl backdrop-blur-lg z-10">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-white">
                        Create Account
                    </h1>
                    <p className="mt-2 text-gray-400">Join VibeChat today.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username Input */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Users className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Username"
                            className="w-full h-12 pl-10 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            required
                        />
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            className="w-full h-12 pl-10 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Lock className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Password"
                            className="w-full h-12 pl-10 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:scale-[1.02] transform transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                        <>
                            <LoaderCircle className="animate-spin" />
                            <span>Creating Account...</span>
                        </>
                        ) : (
                        "Create Account"
                        )}
                    </button>
                </form>

                <footer className="text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                        Sign In
                    </Link>
                </footer>
            </div>
        </main>
        
        <VibeChatFooter />
    </div>
  );
};

export default SignUpPage;

