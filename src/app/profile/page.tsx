"use client";

import { useState, useEffect } from "react";
import ProfileView from "@/components/profile/ProfileCard";
import EditProfileForm from "../../components/profile/edit-profile/page";
import DeleteAccount from "../../components/profile/delete-profile/page";
import { useRouter } from "next/navigation";
import api from "@/utils/refreshAccess";
import ThemeSelector from "@/components/profile/ThemeSelector";
import { useTheme } from "@/context/themeContext"; 
import { themes } from "@/theme"; 
import { LogOut } from "lucide-react";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { theme } = useTheme();
  const t = themes[theme]; 

  const handleBackClick = () => {
    router.push("/chats");
  };

  const handleLogout = async () => {
    try {
      await api.get("/api/users/logout"); 
      router.push("/login"); 
    } catch (error) {
      console.error("❌ Failed to log out:", error);
      alert("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/users/profile/getInfo", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("❌ Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  {/* --- UPDATED LOADER --- */}
  if (!user) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${t.background} ${t.text}`}>
        <div className="w-12 h-12 border-4 border-gray-500 border-t-pink-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-semibold">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center p-6 min-h-screen relative transition-colors duration-300 ${t.background} ${t.text}`}
    >
      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className={`absolute top-6 left-6 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${t.sidebar} ${t.hover}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        Back to Chats
      </button>

      <div className="w-full max-w-md mt-16 md:mt-0">
        {!editing ? (
          <ProfileView user={user} onEdit={() => setEditing(true)} />
        ) : (
          <EditProfileForm
            user={user}
            onCancel={() => setEditing(false)}
            onSave={(updatedUser) => {
              setUser(updatedUser);
              setEditing(false);
            }}
          />
        )}

        <div className="mt-6">
          <ThemeSelector />
        </div>
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg font-semibold transition ${t.sidebar} ${t.hover}`}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <div className="mt-6">
          <DeleteAccount />
        </div>
      </div>
    </div>
  );
}