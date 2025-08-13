"use client";

import Image from "next/image";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/users/login", form);
// After successful login
localStorage.setItem("token", res.data.accessToken);
localStorage.setItem("refreshToken", res.data.refreshToken);
localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Login successful");

      if (res.data.hasProfilePic) {
        router.push("/chats");
      } else {
        router.push("/setup-profile");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#061226] via-[#0b1730] to-[#0f1b36] p-6 flex items-center justify-center">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* LEFT: Headline + hero illustration */}
        <section className="order-2 lg:order-1 flex flex-col gap-8 lg:pl-8">
          <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
              Welcome Back to{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff6ec4] via-[#b37bff] to-[#7cc6ff]">
                ChatVibe
              </span>
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Sign in to continue your conversations and connect with your community.
            </p>
          </div>

          <div className="mx-auto lg:mx-0 w-full max-w-2xl">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/chat-hero4.png"
                alt="People chatting neon scene"
                width={1400}
                height={900}
                className="w-full h-auto object-cover"
                priority
              />
              <div className="absolute -bottom-4 left-6 bg-gradient-to-br from-[#ff6ec4]/50 to-[#7cc6ff]/30 px-3 py-2 rounded-full backdrop-blur-sm text-sm text-white/90 shadow-md">
                Live conversations
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: Login card */}
        <aside className="order-1 lg:order-2 flex justify-center lg:justify-end">
          <div className="w-full max-w-xl lg:max-w-2xl">
            <div className="glass-card border border-white/6 p-8 lg:p-12 rounded-3xl shadow-xl backdrop-blur-md">
              <header className="text-center lg:text-left mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-white">Sign In</h2>
                <p className="mt-2 text-sm text-white/70">
                  Enter your credentials to access your account
                </p>
              </header>

              <form onSubmit={onSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white/80 mb-2"
                  >
                    Email or Username
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@domain.com"
                    className="w-full h-14 px-4 rounded-xl bg-white/6 border border-white/8 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-white/80 mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="••••••••"
                    className="w-full h-14 px-4 rounded-xl bg-white/6 border border-white/8 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <a
                    href="#"
                    className="text-pink-400 hover:text-pink-300 transition"
                  >
                    Forgot password?
                  </a>
                  <span className="text-white/60">
                    Need help?{" "}
                    <a className="text-chat-blue" href="#">
                      Support
                    </a>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#5ab1ff] to-[#ff6ec4] text-white font-semibold text-lg shadow-lg hover:scale-[1.01] transform transition disabled:opacity-50"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>

              <footer className="mt-6 text-center text-sm text-white/70">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="text-pink-400 hover:text-pink-300 font-medium"
                >
                  Sign up here
                </a>
              </footer>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
