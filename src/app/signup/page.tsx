"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles, Users, Zap, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation"; // for App Router
import axios from "axios"
import toast from "react-hot-toast";


const SignUpPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message,setMessage]=useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

   try {
    const res = await axios.post("/api/users/signup", formData);

    if (res.status === 201) {
      // Show success message briefly
     toast.success("Account Created Successfully");
      setTimeout(() => {
        router.push("/login"); // Redirect to login page
      }, 1500);
    }
  } catch (error: any) {
    if (error.response) {
      toast.error(error.response.data.message || "Something went wrong");
    } else {
      toast.error("⚠️ Network error. Please try again.");
    }
  }

  setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-primary overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-chat-pink/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-chat-blue/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-chat-orange/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left side */}
          <div className="space-y-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl gradient-secondary glow-purple">
                <MessageCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-primary-foreground">ChatVibe</h1>
            </div>

            <div className="relative">
              <img 
                src="/images/chat-hero3.png" 
                alt="Chat community illustration" 
                className="rounded-4xl shadow-2xl w-full max-w-md mx-auto lg:mx-0 animate-pulse-glow"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card p-4 rounded-2xl text-center">
                <Users className="w-8 h-8 text-chat-blue mx-auto mb-2" />
                <p className="text-sm text-primary-foreground/90 font-medium">Group Chats</p>
              </div>
              <div className="glass-card p-4 rounded-2xl text-center">
                <Sparkles className="w-8 h-8 text-chat-pink mx-auto mb-2" />
                <p className="text-sm text-primary-foreground/90 font-medium">Rich Media</p>
              </div>
              <div className="glass-card p-4 rounded-2xl text-center">
                <Zap className="w-8 h-8 text-chat-orange mx-auto mb-2" />
                <p className="text-sm text-primary-foreground/90 font-medium">Real-time</p>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex justify-center lg:justify-end animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Card className="glass-card w-full max-w-md lg:max-w-lg xl:max-w-xl p-6 lg:p-10">
              <CardHeader className="text-center space-y-1">
                <CardTitle className="text-2xl lg:text-3xl font-bold text-primary-foreground">
                  Join ChatVibe
                </CardTitle>
                <CardDescription className="text-primary-foreground/70 text-sm lg:text-base">
                  Create your account and start chatting
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Username */}
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-primary-foreground block text-sm lg:text-base">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Choose a unique username"
                      className="w-full rounded-md px-4 py-2 lg:py-3 lg:text-lg text-primary-foreground bg-primary-foreground/10 border border-primary-foreground/20 focus:outline-none focus:ring-2 focus:ring-chat-pink"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-primary-foreground block text-sm lg:text-base">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="w-full rounded-md px-4 py-2 lg:py-3 lg:text-lg text-primary-foreground bg-primary-foreground/10 border border-primary-foreground/20 focus:outline-none focus:ring-2 focus:ring-chat-pink"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-primary-foreground block text-sm lg:text-base">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a strong password"
                      className="w-full rounded-md px-4 py-2 lg:py-3 lg:text-lg text-primary-foreground bg-primary-foreground/10 border border-primary-foreground/20 focus:outline-none focus:ring-2 focus:ring-chat-pink"
                      required
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className={`w-full text-base lg:text-lg font-semibold shadow-lg transition lg:py-4 flex items-center justify-center gap-2 ${
                      loading ? "bg-gradient-to-r from-chat-pink via-chat-orange to-chat-blue animate-gradient" : "bg-chat-pink hover:bg-chat-pink/80"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm lg:text-base text-primary-foreground/70">
                  Already have an account?{" "}
                  <a href="login" className="text-chat-pink hover:underline">
                    Sign in
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
