"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/utils/refreshAccess";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/socketConfig";
import { useTheme } from "@/context/themeContext";
import { themes } from "@/theme";

export default function ProfilePicturePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPic, setCurrentPic] = useState<string | null>(null);
  const [defaultLoading, setDefaultLoading] = useState(false);
  const { socket } = useSocket();
  const { theme } = useTheme();
  const t = themes[theme];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/api/auth/me", {
          withCredentials: true,
        });
        setCurrentPic(data.user?.profilePic || data.profilePic);
      } catch {
        toast.error("Could not load picture");
      }
    };
    fetchUser();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (preview) URL.revokeObjectURL(preview);
    setFile(selectedFile);
    setPreview(selectedFile ? URL.createObjectURL(selectedFile) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a picture");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      await api.post("/api/users/profile", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { data } = await api.get("/api/auth/me", {
        withCredentials: true,
      });

      if (socket && data.user) {
        socket.emit("update_profile", data.user);
      }
      toast.success("Profile picture updated!");
      router.push("/profile");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };


  const handleSetDefault = async () => {
    setDefaultLoading(true);
    try {
      // Send an empty FormData object to trigger the backend's default logic
      const formData = new FormData();
      await api.post("/api/users/profile", formData, {
        withCredentials: true,
      });

      // Get updated user data to reflect the change
      const { data } = await api.get("/api/auth/me", {
        withCredentials: true,
      });

      // Emit socket event with updated user data
      if (socket && data.user) {
        socket.emit("update_profile", data.user);
      }

      // Update local state
      setCurrentPic(data.user?.profilePic || data.profilePic);
      setFile(null);
      setPreview(null);

      toast.success("Default profile picture set!");
      router.push("/profile");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to set default picture");
    } finally {
      setDefaultLoading(false);
    }
  };
  
 
  const clearSelection = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  return (
    <main
      className={`min-h-screen flex items-center justify-center p-6 ${t.background} ${t.text}`}
    >
      <div
        className={`p-6 rounded-2xl shadow-lg w-full max-w-md space-y-6 flex flex-col items-center ${t.sidebar}`}
      >
        <h1 className={`text-2xl font-bold ${t.accent}`}>
          Update Profile Picture
        </h1>

        <div
          className={`relative w-40 h-40 rounded-full overflow-hidden border-4 ${t.accent.replace(
            "text-",
            "border-"
          )}`}
        >
          {preview ? (
            <Image src={preview} alt="preview" fill className="object-cover" />
          ) : currentPic ? (
            <Image
              src={currentPic}
              alt="current"
              fill
              className="object-cover"
            />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-4xl">
              📷
            </span>
          )}
        </div>

        <div className="w-full space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={`w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${t.card} ${t.hover} ${t.text}`}
          />
          
         
          {file && (
            <button
              onClick={clearSelection}
              className={`w-full px-4 py-2 rounded-lg ${t.card} ${t.hover} text-sm`}
            >
              Clear Selection
            </button>
          )}

         
          <button
            onClick={handleSetDefault}
            disabled={defaultLoading || loading}
            className={`w-full px-4 py-2 rounded-lg disabled:opacity-50 bg-gray-600 hover:bg-gray-500 text-white transition-colors`}
          >
            {defaultLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Setting Default...
              </span>
            ) : (
              "Set as Default"
            )}
          </button>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => router.back()}
            className={`flex-1 px-4 py-2 rounded-lg ${t.card} ${t.hover}`}
 
            disabled={loading || defaultLoading}
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            
            disabled={loading || !file || defaultLoading}
            className={`flex-1 px-4 py-2 rounded-lg disabled:opacity-50 ${t.button}`}
          >
            {loading ? (
               <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>

     
      {(loading || defaultLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div
              className={`w-16 h-16 border-4 ${t.accent.replace(
                "text-",
                "border-"
              )} border-t-transparent rounded-full animate-spin`}
            ></div>
            <p className={`mt-4 text-lg font-semibold animate-pulse ${t.text}`}>
              {/* --- New: Conditional text for the loader --- */}
              {defaultLoading ? "Setting default picture..." : "Updating profile..."}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}