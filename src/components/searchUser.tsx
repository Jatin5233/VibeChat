"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import "./search.css";

interface SearchUsersProps {
  currentUserId: string;
  onUserSelect?: (userId: string) => void; // <-- NEW prop for parent control
}

export default function SearchUsers({ currentUserId, onUserSelect }: SearchUsersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Debounced API call
  const fetchUsers = debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await axios.get(
        `/api/users/search?q=${query}&excludeId=${currentUserId}`
      );
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  }, 300);

  // Trigger search on query change
  useEffect(() => {
    fetchUsers(searchQuery);
    return () => fetchUsers.cancel();
  }, [searchQuery]);

  const handleUserClick = async (userId: string) => {
    if (onUserSelect) {
      // Let parent handle creating/opening chat
      onUserSelect(userId);
    } else {
      // Fallback: default navigation if no parent handler
      try {
        const res = await axios.post("/api/chats", {
          userId,
          currentUserId,
        });
        window.location.href = `/chats/${res.data.chatId}`;
      } catch (err) {
        console.error(err);
      }
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />

      {searchResults.length > 0 && (
        <div className="suggestions-box">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="suggestion-item"
              onClick={() => handleUserClick(user._id)}
            >
              <img
                src={user.profilePic || "/default-avatar.png"}
                alt={user.username}
              />
              <span>{user.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
