"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "@/context/themeContext"; 
import { themes } from "@/theme"; 

interface ProfileHeaderProps {
  currentUser: {
    _id: string;
    username: string;
    profilePic?: string;
  };
}

export default function ProfileHeader({ currentUser }: ProfileHeaderProps) {
  const router = useRouter();
  const { theme } = useTheme(); 
  const t = themes[theme]; 

  const handleClick = () => {
    router.push("/profile");
  };

  return (
    <div
      onClick={handleClick}
      
      className={`flex items-center gap-3 p-3 ${t.hover} cursor-pointer rounded-lg transition`}
    >
      <img
        src={currentUser.profilePic || "/default-avatar.png"}
        alt={currentUser.username}
        className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
      />
      <div className="flex flex-col">
        <p className={`${t.text} font-semibold`}>{currentUser.username}</p>
        <span className={`text-xs ${t.subtext}`}>View Profile</span>
      </div>
    </div>
  );
}
