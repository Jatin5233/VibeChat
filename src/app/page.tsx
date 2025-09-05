"use client"
import React from 'react'
import { useEffect } from 'react'
import {io} from "socket.io-client"
import Link from "next/link";
import { 
    Github, Linkedin, Instagram, ArrowRight, MessageSquare, Users, Sparkles, Zap, ShieldCheck, MonitorSmartphone
} from "lucide-react";

const VibeChatHeader = () => (
  <header className="fixed top-0 left-0 w-full p-4 sm:p-6 z-50 bg-[#0B0D17]/80 backdrop-blur-md border-b border-gray-800/50">
    <nav className="container mx-auto flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
        VibeChat
      </Link>
      <div className="hidden md:flex items-center gap-6 text-gray-300">
        <Link href="#features" className="hover:text-white transition-colors duration-200">Features</Link>
        <Link href="#contact" className="hover:text-white transition-colors duration-200">Contact</Link>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-gray-300 hover:text-white transition-colors duration-200">
            Sign In
        </Link>
        <Link href="/signup" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform duration-200">
            Sign Up
        </Link>
      </div>
    </nav>
  </header>
);

const VibeChatFooter = () => (
  <footer className="w-full bg-gray-900/40 border-t border-gray-800 py-10">
    <div className="container mx-auto px-4 text-center text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-6">
      <p>&copy; {new Date().getFullYear()} VibeChat. All rights reserved.</p>
      <div className="flex items-center gap-5">
        <Link href="#" className="hover:text-white transition-colors duration-200"><Github size={22} /></Link>
        <Link href="#" className="hover:text-white transition-colors duration-200"><Linkedin size={22} /></Link>
        <Link href="#" className="hover:text-white transition-colors duration-200"><Instagram size={22} /></Link>
      </div>
    </div>
  </footer>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl backdrop-blur-lg transform hover:-translate-y-2 transition-all duration-300 hover:border-purple-500/30">
        <div className="text-purple-400 mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

export default function Home() {
  const socket = io("http://localhost:3001")
  
  useEffect(() => {
    socket.on("welcome", (s) => {
      console.log(s)
    })
    
    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen w-full bg-[#0B0D17] text-gray-100 font-inter">
        {/* Background Shapes */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-indigo-900/30 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/30 rounded-full filter blur-3xl opacity-50 animate-pulse" style={{animationDelay: '4s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-900/20 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <VibeChatHeader />

        <main className="relative z-10">
            {/* Hero Section */}
            <section className="container mx-auto min-h-screen flex flex-col justify-center items-center text-center px-4 pt-20">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
                        The Future of Connection is{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                            Here.
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
                        Welcome to VibeChat. Experience seamless communication with real-time messaging, vibrant communities, and rich media sharing. Your next great conversation starts now.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <Link href="/signup" className="px-8 py-4 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transform transition-all duration-200 hover:shadow-purple-500/25">
                            Get Started <ArrowRight size={20} />
                        </Link>
                        <Link href="#features" className="px-8 py-4 bg-gray-800/80 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-700/80 transition-all duration-200 backdrop-blur-sm">
                            Learn More
                        </Link>
                    </div>
                    
                    {/* Hero showcase */}
                    <div className="w-full max-w-5xl mx-auto h-64 md:h-80 bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 flex items-center justify-center backdrop-blur-sm shadow-2xl">
                        <div className="text-center">
                            <MessageSquare size={48} className="text-purple-400 mx-auto mb-4" />
                            <img src="/images/ChatShow.png" alt="Hero Chat" className="mx-auto mb-4 w-32 h-32 object-contain" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="container mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                        Why You'll Love VibeChat
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-gray-400 leading-relaxed">
                        Everything you need to connect, share, and build communities in one beautiful platform.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    <FeatureCard 
                        icon={<Zap size={32}/>} 
                        title="Real-time Messaging" 
                        description="Chat instantly with friends and groups without any delay. Experience lightning-fast, reliable communication." 
                    />
                    <FeatureCard 
                        icon={<Sparkles size={32}/>} 
                        title="Rich Media Sharing" 
                        description="Share photos, videos, documents, and more. Express yourself without limits in high quality." 
                    />
                    <FeatureCard 
                        icon={<ShieldCheck size={32}/>} 
                        title="Secure & Private" 
                        description="Your conversations are protected with end-to-end encryption and advanced privacy controls." 
                    />
                    <FeatureCard 
                        icon={<MonitorSmartphone size={32}/>} 
                        title="Cross-Platform Sync" 
                        description="Seamlessly sync across all devices—desktop, tablet, and mobile. Never miss a message." 
                    />
                    <FeatureCard 
                        icon={<MessageSquare size={32}/>} 
                        title="Customizable Experience" 
                        description="Personalize your profile, themes, and chat experience to match your unique style." 
                    />
                    <FeatureCard 
                        icon={<Users size={32}/>} 
                        title="Community Building" 
                        description="Create and join communities around your interests. Connect with like-minded people." 
                    />
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 p-8 md:p-12 rounded-2xl text-center shadow-2xl border border-purple-500/20 backdrop-blur-sm max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                        Ready to Start Vibing?
                    </h2>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                        Join thousands of users already connecting on VibeChat. Create your account in seconds and dive into a world of endless conversation.
                    </p>
                    <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 font-semibold rounded-lg shadow-lg hover:scale-105 transform transition-all duration-200 hover:shadow-xl">
                        Sign Up Now <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </main>
        
        <VibeChatFooter />
    </div>
  );
}