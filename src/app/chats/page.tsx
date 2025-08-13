"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  // ✅ Load logged-in user ID from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Loaded user from localStorage:", parsedUser.id)
        if (parsedUser.id) {
          setCurrentUserId(parsedUser.id);
          console.log(currentUserId)
        }
        
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
  }, []);

  // ✅ Fetch chats after we have currentUserId
  useEffect(() => {
    if (!currentUserId) return;
    const fetchChats = async () => {
      try {
        const res = await axios.get(`/api/chats?userId=${currentUserId}`);
        setChats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchChats();
  }, [currentUserId]);

  // ✅ Search users (excluding self)
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || !currentUserId) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await axios.get(
        `/api/users/search?q=${query}&excludeId=${currentUserId}`
      );
      setSearchResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  // ✅ Start chat when clicking on user
  const handleUserClick = async (userId: string) => {
    if (!currentUserId) return;
    try {
      const res = await axios.post("/api/chats", {
        userId,
        currentUserId,
      });
      router.push(`/chats/${res.data.chatId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0f24] text-white">
      {/* Sidebar */}
      <div className="w-80 p-4 bg-[#101636] flex flex-col">
        {/* Search */}
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="p-2 rounded-lg border-none outline-none bg-[#1a1f3c] text-white placeholder-gray-400 mb-3"
        />

        {/* Suggestions */}
        {searchResults.length > 0 && (
          <div className="bg-[#1a1f3c] rounded-lg mb-4">
            {searchResults.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-2 p-2 cursor-pointer hover:bg-[#23294e] transition"
                onClick={() => handleUserClick(user._id)}
              >
                <img
                  src={user.profilePic || "/default-avatar.png"}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <span>{user.username}</span>
              </div>
            ))}
          </div>
        )}

        {/* Chat list */}
        <h3 className="text-lg font-semibold mb-2">Your Chats</h3>
        {chats.length > 0 ? (
          <div className="flex flex-col gap-1">
            {chats.map((chat) => (
              <div
                key={chat._id}
                className="p-2 rounded-lg hover:bg-[#23294e] cursor-pointer"
              >
                {chat.name || "Chat"}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            No chats yet. Start by searching for someone!
          </p>
        )}
      </div>

      {/* Main chat area */}
      <div className="flex-1 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10" />
        <div className="relative z-10 text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to ChatVibe 💬</h1>
          <p className="text-gray-300">
            Select a chat or search for someone to start messaging.
          </p>
        </div>
      </div>
    </div>
  );
}
