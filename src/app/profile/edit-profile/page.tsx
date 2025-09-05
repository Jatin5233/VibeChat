"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import api from "@/utils/refreshAccess";
import toast from "react-hot-toast";
import { useSocket } from "@/context/socketConfig";
import { useTheme } from "@/context/themeContext";
import { themes } from "@/theme";

interface EditProfileFormProps {
  user: { username: string; email: string; profilePic: string };
  onSave: (updatedUser: { username: string; email: string }) => void;
  onCancel: () => void;
}

export default function EditProfileForm({ user, onSave, onCancel }: EditProfileFormProps) {
  const { socket } = useSocket();
  const { theme } = useTheme();
  const t = themes[theme];
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

   const handleSave = async () => {
    try {
      
      const res=await api.put("/api/users/profile/updateInfo", form, { withCredentials: true });
      onSave(res.data.user);
       if (socket) {
        socket.emit("update_profile", res.data.user);
      }
      toast.success("Profile updated!");
      router.back();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Update failed");
    }
  };

  return (
    <div className={`flex flex-col ${t.sidebar} rounded-2xl p-6 shadow-lg w-full max-w-md`}>
      <h2 className={`text-lg font-semibold mb-4 ${t.text}`}>Edit Profile</h2>

      {/* Username */}
      <Input
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Username"
        className={`mb-3 ${t.card} ${t.text}`}
      />

      {/* Email */}
      <Input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className={`mb-3 ${t.card} ${t.text}`}
      />

      {/* Profile Pic preview + redirect button */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <img
          src={user.profilePic || "/default-avatar.png"}
          alt="preview"
          className="w-16 h-16 rounded-full border-2 border-white/20 object-cover"
        />
        <Button
          onClick={() => router.push("/update-profile")}
          className={`${t.card} ${t.hover} ${t.text}`}
        >
          Change Picture
        </Button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-3">
        <Button onClick={onCancel} className={`flex-1 ${t.card} ${t.hover} ${t.text}`}>
          Cancel
        </Button>
        <Button onClick={handleSave} className={`flex-1 ${t.button}`}>
          Save
        </Button>
      </div>
    </div>
  );
}
