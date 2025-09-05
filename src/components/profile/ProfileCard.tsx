"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/themeContext";
import { themes } from "@/theme";

interface ProfileViewProps {
  user: { username: string; email: string; profilePic: string };
  onEdit: () => void;
}

export default function ProfileView({ user, onEdit }: ProfileViewProps) {
  const { theme } = useTheme();
  const t = themes[theme];

  return (
    <div
      className={`flex flex-col items-center ${t.sidebar} rounded-2xl p-6 shadow-lg w-full max-w-md`}
    >
      <img
        src={user.profilePic}
        alt={user.username}
        className="w-24 h-24 rounded-full border-2 border-white/20 object-cover"
      />
      <h2 className={`text-xl font-semibold mt-4 ${t.text}`}>{user.username}</h2>
      <p className={`${t.subtext}`}>{user.email}</p>

      <Button onClick={onEdit} className={`mt-4 w-full ${t.button}`}>
        Edit Profile
      </Button>
    </div>
  );
}
