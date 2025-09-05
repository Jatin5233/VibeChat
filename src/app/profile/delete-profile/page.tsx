"use client";

import { Button } from "@/components/ui/button";
import api from "@/utils/refreshAccess";
import toast from "react-hot-toast";
import { useSocket } from "@/context/socketConfig";
import { useTheme } from "@/context/themeContext";
import { themes } from "@/theme";

export default function DeleteAccount() {
  const { socket } = useSocket();
  const { theme } = useTheme();
  const t = themes[theme];

  const handleDelete = async () => {
    const confirmed = confirm(
      "⚠️ Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      const res = await api.delete("/api/users/delete", {
        withCredentials: true,
      });
      const { userId } = res.data;

      if (socket) {
        socket.emit("delete_account", { userId });
      }

      toast.success("✅ Account deleted successfully!");

      localStorage.clear();
      window.location.href = "/login";
    } catch (err: any) {
      console.error("❌ Delete account error:", err);
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className={`${t.sidebar} p-4 rounded-xl shadow-md`}>
      <h3 className={`text-lg font-semibold mb-2 ${t.text}`}>Danger Zone</h3>
      <p className={`${t.subtext} mb-3`}>
        Deleting your account is permanent.
      </p>
      <Button
        variant="destructive"
        onClick={handleDelete}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        Delete Account
      </Button>
    </div>
  );
}
