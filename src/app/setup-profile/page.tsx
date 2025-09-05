"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SetupProfilePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (preview) {
      URL.revokeObjectURL(preview); // Clean up the old preview URL
    }
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a profile picture or click Skip");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file); // We know 'file' is not null here

      await axios.post("/api/users/profile", formData, {
        withCredentials: true,
      });

      toast.success("Profile picture updated!");
      router.push("/chats");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // This function sends an empty request, which our backend interprets as setting a default image.
  const handleSkip = async () => {
    setLoading(true);
    try {
      const formData = new FormData(); // Sending empty FormData
      await axios.post("/api/users/profile", formData, {
        withCredentials: true,
      });
      toast.success("Default profile picture set!");
      router.push("/chats");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#061226] via-[#0b1730] to-[#0f1b36] p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left side: illustration */}
        <section className="hidden lg:flex justify-center">
          <Image
            src="/images/profile.png"
            alt="Profile setup neon scene"
            width={600}
            height={600}
            className="rounded-3xl shadow-2xl object-cover"
          />
        </section>

        {/* Right side: form */}
        <aside>
          <div className="glass-card border border-white/6 p-8 rounded-3xl shadow-xl backdrop-blur-md">
            <h1 className="text-3xl font-bold text-white mb-2">
              Let’s complete your profile
            </h1>
            <p className="text-white/70 mb-6">
              Upload a profile picture so friends can recognize you instantly!
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Upload Box */}
              <div className="flex flex-col items-center">
                <label
                  htmlFor="profilePic"
                  className="cursor-pointer flex flex-col items-center justify-center w-40 h-40 rounded-full border-4 border-dashed border-pink-400 bg-white/10 hover:bg-white/20 transition overflow-hidden"
                >
                  {preview ? (
                    <Image
                      src={preview}
                      alt="Profile preview"
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <>
                      <span className="text-4xl">📸</span>
                      <span className="text-white/70 text-sm mt-1">Upload</span>
                    </>
                  )}
                </label>
                <input
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={loading}
                  className="flex-1 h-14 rounded-xl bg-gray-700 text-white font-semibold hover:bg-gray-600 transition"
                >
                  Skip
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-14 rounded-xl bg-gradient-to-r from-[#5ab1ff] to-[#ff6ec4] text-white font-semibold text-lg shadow-lg hover:scale-[1.01] transform transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </aside>
      </div>
    </main>
  );
}