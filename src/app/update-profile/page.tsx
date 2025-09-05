"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
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
  const { socket } = useSocket();
  const { theme } = useTheme();
  const t = themes[theme];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("/api/auth/me", {
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

      await axios.post("/api/users/profile", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { data } = await axios.get("/api/auth/me", {
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

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={`text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${t.card} ${t.hover} ${t.text}`}
        />

        <div className="flex gap-3 w-full">
          <button
            onClick={() => router.back()}
            className={`flex-1 px-4 py-2 rounded-lg ${t.card} ${t.hover}`}
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg disabled:opacity-50 ${t.button}`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div
              className={`w-16 h-16 border-4 ${t.accent.replace(
                "text-",
                "border-"
              )} border-t-transparent rounded-full animate-spin`}
            ></div>
            <p className={`mt-4 text-lg font-semibold animate-pulse ${t.text}`}>
              Updating profile...
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
