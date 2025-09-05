"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";

import api from "@/utils/refreshAccess";
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import FileAttachmentModal from "@/components/chat/FileModal";

let socket: Socket;

export default function ChatApp() {
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [highlightedChatId, setHighlightedChatId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedChatIdRef = useRef<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadChats, setUnreadChats] = useState<Map<string, number>>(new Map());
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL as string;

  function hydrateSender(msg: any, selectedChat: any) {
    if (msg.sender && typeof msg.sender === "string" && selectedChat) {
      const found = selectedChat.participants.find(
        (p: any) => p._id.toString() === msg.sender.toString()
      );
      if (found) msg.sender = found;
    }
    return msg;
  }

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/api/auth/me", { withCredentials: true });
        setCurrentUser(res.data.user);
        setCurrentUserId(res.data.user._id);
        socket.emit("authenticate", res.data.user._id);
        console.log("Current user:", res.data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchMe();
  }, []);

 const sortChats = (chatsArray: any[], unreadMap: Map<string, number>) => {
  return [...chatsArray].sort((a, b) => {
    const aHasUnread = unreadMap.has(a._id.toString()) && unreadMap.get(a._id.toString())! > 0;
    const bHasUnread = unreadMap.has(b._id.toString()) && unreadMap.get(b._id.toString())! > 0;
    
    // First priority: Unread messages
    if (aHasUnread && !bHasUnread) return -1;
    if (!aHasUnread && bHasUnread) return 1;
    
    // Second priority: Recent activity (lastActivityAt or latest message time)
    const aTime = new Date(a.lastActivityAt || a.latestMessage?.createdAt || 0).getTime();
    const bTime = new Date(b.lastActivityAt || b.latestMessage?.createdAt || 0).getTime();
    
    return bTime - aTime;
  });
};
const onSidebarUpdate = useCallback((msg: any) => {
  console.log("SIDEBAR UPDATE received", msg);
  const chatId = msg.chat?._id?.toString() || msg.chat?.toString();

  // Update the unread count for the specific chat
  setUnreadChats(prevUnread => {
    const newUnreadMap = new Map(prevUnread);
    const currentCount = newUnreadMap.get(chatId) || 0;
    newUnreadMap.set(chatId, currentCount + 1);
    
    // Update the chats list with the new unread data and sort
    setChats(prevChats => {
      const updatedChats = prevChats.map((chat) => {
        if (chat._id.toString() === chatId) {
          return { 
            ...chat, 
            latestMessage: msg,
            lastActivityAt: new Date().toISOString() // Update activity time
          };
        }
        return chat;
      });
      return sortChats(updatedChats, newUnreadMap);
    });

    return newUnreadMap;
  });
}, [sortChats]);

  // Function to mark chat as read
  const markChatAsRead = useCallback((chatId: string) => {
    setUnreadChats(prev => {
      const newMap = new Map(prev);
      newMap.delete(chatId);
      return newMap;
    });
  }, []);

  const onMessageEdited = useCallback((editedMsg: any) => {
    console.log("Message edited received:", editedMsg);
    const hydrated = hydrateSender(editedMsg, selectedChat);
    const chatId = typeof hydrated.chat === "object" && hydrated.chat?._id
      ? hydrated.chat._id.toString()
      : hydrated.chat?.toString();

    const currentChatId = selectedChatIdRef.current?.toString();

    if (currentChatId === chatId) {
      setMessages((prev) =>
        prev.map((m) =>
          m._id?.toString() === hydrated._id?.toString() ? hydrated : m
        )
      );
    }

    // Update sidebar latest message if needed
    setChats((prev) =>
      prev.map((chat) =>
        chat._id?.toString() === chatId &&
        chat.latestMessage?._id?.toString() === editedMsg._id?.toString()
          ? { ...chat, latestMessage: editedMsg }
          : chat
      )
    );
  }, [selectedChat]);

  const onReceive = useCallback((msg: any) => {
  console.log("RECEIVER'S CLIENT: New message event received", msg);
  
  const chatId = typeof msg.chat === "object" && msg.chat?._id
    ? msg.chat._id.toString()
    : msg.chat?.toString();

  if (!chatId) {
    console.warn("Receiver's Client: No chatId in received message, skipping update.");
    return;
  }

  const currentSelectedChatId = selectedChat?._id?.toString();
  const isCurrentChat = currentSelectedChatId === chatId;
  const isFromCurrentUser = msg.sender._id === currentUserId;
  
  if (isFromCurrentUser) {
    return;
  }

  // Update messages if the receiver is currently viewing the chat
  if (isCurrentChat) {
    setMessages((prev) => {
      if (prev.some((m) => m._id?.toString() === msg._id?.toString())) {
        return prev;
      }
      return [...prev, msg];
    });
  }

  // ENHANCED: Set temporary highlight and auto-sort with unread count
  setUnreadChats(prevUnread => {
    const newUnreadMap = new Map(prevUnread);
    
    // Only increment unread if not viewing the current chat
    if (!isCurrentChat) {
      const currentCount = newUnreadMap.get(chatId) || 0;
      newUnreadMap.set(chatId, currentCount + 1);
      
      // NEW: Set temporary highlight that will auto-remove
      setHighlightedChatId(chatId);
      
      // Remove highlight after 3 seconds if chat is not selected
      setTimeout(() => {
        setHighlightedChatId(prev => {
          // Only remove if it's still the same chat and user hasn't selected it
          if (prev === chatId && selectedChat?._id?.toString() !== chatId) {
            return null;
          }
          return prev;
        });
      }, 3000);
    }

    // Update chats with the new unread data and sort
    setChats(prevChats => {
      const updatedChats = prevChats.map((chat) => {
        if (chat._id.toString() === chatId) {
          return { 
            ...chat, 
            latestMessage: msg,
            // Add timestamp for better sorting
            lastActivityAt: new Date().toISOString()
          };
        }
        return chat;
      });

      // Enhanced sorting: prioritize unread, then recent activity
      return sortChats(updatedChats, newUnreadMap);
    });

    return newUnreadMap;
  });

  // Enhanced browser notifications with better UX
  if (!isCurrentChat && "Notification" in window && Notification.permission === "granted") {
    const otherUser = msg.sender;
    const notification = new Notification(`New message from ${otherUser?.username || 'Someone'}`, {
      body: msg.content || 'New message',
      icon: otherUser?.profilePic || '/default-avatar.png',
      tag: chatId, // Prevent duplicate notifications for same chat
      requireInteraction: false,
      silent: false
    });

    // Auto close notification after 4 seconds
    setTimeout(() => notification.close(), 4000);
  }
}, [selectedChat?._id, currentUserId]);

  const fetchMessages = async (chatId: string) => {
    try {
      const { data } = await api.get(`/api/messages/chat/${chatId}`, {
        withCredentials: true,
      });
      
      setMessages(data);
      if (socket?.connected) {
        socket.emit("join_chat", chatId);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const handleChatSelect = useCallback((chat: any) => {
  console.log("Selecting chat:", chat._id);
  
  setSelectedChat(chat);
  setHighlightedChatId(chat._id); // Set highlight when selected
  fetchMessages(chat._id);
  
  // Mark chat as read and remove from unread map
  markChatAsRead(chat._id.toString());
  
  // Clear highlight after user interaction (when they start typing or after delay)
  setTimeout(() => {
    setHighlightedChatId(prev => {
      // Only clear if it's the same chat (user might have switched)
      return prev === chat._id ? null : prev;
    });
  }, 1500); // Clear highlight after 1.5 seconds of viewing
}, [markChatAsRead]);



  const onDelete = useCallback(({ _id, chatId }: { _id: string; chatId: string }) => {
    console.log("DELETE EVENT RECEIVED:", { _id, chatId });

    const currentChatId = selectedChatIdRef.current?.toString();
    const deleteChatId = chatId?.toString();

    if (currentChatId === deleteChatId) {
      setMessages((prev) =>
        prev.filter((m) => m._id?.toString() !== _id?.toString())
      );
    }

    setChats((prev) =>
      prev.map((chat) =>
        chat.latestMessage?._id?.toString() === _id?.toString()
          ? { ...chat, latestMessage: null }
          : chat
      )
    );
  }, []);

  const handleProfileUpdated = useCallback((updatedUser: any) => {
    setMessages((prev: any[]) =>
      prev.map((msg) =>
        msg.sender && msg.sender._id === updatedUser._id
          ? { ...msg, sender: { ...msg.sender, ...updatedUser } }
          : msg
      )
    );
  }, []);

  // Socket setup
  useEffect(() => {
    socket = io(SOCKET_URL, { 
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const handleNewChat = (chat: any) => {
      console.log("New chat received:", chat);
      
      setChats((prev: any[]) => {
        const exists = prev.some((c) => c._id === chat._id);
        if (exists) {
          console.log("Chat already exists, skipping");
          return prev;
        }
        
        console.log("Adding new chat to list");
        return sortChats([chat, ...prev], unreadChats);
      });
    };

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
      const id = selectedChatIdRef.current;
      if (id) {
        socket.emit("join_chat", id);
        console.log("Rejoined chat on reconnect:", id);
      }
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
    };

    // Set up socket listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("receive_message", onReceive);
    socket.on("delete_message", onDelete);
    socket.on("edit_message", onMessageEdited);
    socket.on("update_profile", handleProfileUpdated);
    socket.on("new_chat", handleNewChat);
    socket.on("sidebar_update", onSidebarUpdate);

    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("receive_message", onReceive);
      socket.off("delete_message", onDelete);
      socket.off("edit_message", onMessageEdited);
      socket.off("update_profile", handleProfileUpdated);
      socket.off("new_chat", handleNewChat);
      socket.off("sidebar_update", onSidebarUpdate);
      socket.disconnect();
    };
  }, [onReceive, onDelete, onMessageEdited, handleProfileUpdated, unreadChats]);

  // Update selectedChatIdRef when chat changes
  useEffect(() => {
    const nextId = selectedChat?._id?.toString() || null;
    console.log("Selected chat changed:", nextId);

    // Leave previous room if different
    if (selectedChatIdRef.current && selectedChatIdRef.current !== nextId && socket?.connected) {
      socket.emit("leave_chat", selectedChatIdRef.current);
      console.log("Left previous chat:", selectedChatIdRef.current);
    }

    // Update the ref
    selectedChatIdRef.current = nextId;

    // Join new room
    if (nextId && socket?.connected) {
      socket.emit("join_chat", nextId);
      console.log("Joined new chat:", nextId);
    }
  }, [selectedChat?._id]);

  // Fetch chats on mount
  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    setChats((prevChats) => sortChats(prevChats, unreadChats));
  }, [unreadChats]);
  
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

 

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/api/chats", { withCredentials: true });
      setChats(sortChats(data, unreadChats));
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      console.log("Deleting message:", messageId);
      
      const response = await api.delete(`/api/messages/${messageId}`, { 
        withCredentials: true 
      });
      
      if (response.status === 200) {
        console.log("Message deleted from database");
        
        // Update local state immediately
        setMessages((prev) => prev.filter((m) => m._id !== messageId));

        setChats((prev) =>
          prev.map((chat) =>
            chat._id === selectedChat?._id && chat.latestMessage?._id === messageId
              ? { ...chat, latestMessage: null }
              : chat
          )
        );

        // Emit socket event to notify other users
        if (socket?.connected && selectedChat?._id) {
          const deletePayload = {
            _id: messageId,
            chatId: selectedChat._id.toString()
          };
          
          console.log("Emitting delete_message:", deletePayload);
          
          setTimeout(() => {
            socket.emit("delete_message", deletePayload);
            console.log("Delete event emitted");
          }, 100);
        }
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      if (editingMessageId) {
        // Handle editing (existing logic)
        const { data } = await api.put(
          `/api/messages/${editingMessageId}`,
          { content: newMessage },
          { withCredentials: true }
        );

        let { message } = data;
        message = hydrateSender(message, selectedChat);

        setMessages((prev) =>
          prev.map((m) => (m._id === editingMessageId ? message : m))
        );

        setChats((prev) =>
          prev.map((chat) =>
            chat.latestMessage?._id === editingMessageId
              ? { ...chat, latestMessage: message }
              : chat
          )
        );

        socket.emit("edit_message", message);
        setEditingMessageId(null);
      } else {
        // New message
        const { data } = await api.post(
          "/api/messages",
          { content: newMessage, chatId: selectedChat?._id },
          { withCredentials: true }
        );

        let { message } = data;
        message = hydrateSender(message, selectedChat);

        // Update local state
        setMessages((prev) => [...prev, message]);
        setChats((prev) => {
          const updatedChats = prev.map((c) =>
            c._id === selectedChat._id ? { ...c, latestMessage: message } : c
          );
          return sortChats(updatedChats, unreadChats);
        });

        // Emit to socket
        socket.emit("send_message", { ...message, chat: { _id: selectedChat._id } });
      }

      setNewMessage("");
    } catch (err) {
      console.error("Failed to send/edit message:", err);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await api.get(`/api/users/search?q=${query}`, {
        withCredentials: true,
      });
      
      setSearchResults(data.users || data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleUserClick = async (userId: string) => {
    try {
      const { data: chat } = await api.post(
        "/api/chats/fetch",
        { userId },
        { withCredentials: true }
      );

      handleChatSelect(chat);

      // Join chat room immediately
      socket.emit("join_chat", chat._id);
      
      const chatExists = chats.some((c) => c._id === chat._id);
      if (!chatExists) {
        setChats((prev) => sortChats([chat, ...prev], unreadChats));
        
        if (socket?.connected) {
          socket.emit("new_chat", { 
            chatId: chat._id,
            senderId: currentUserId
          });
          console.log("Emitting new_chat for new chat:", chat._id); 
        }
      }
      
      setSearchResults([]);
      setSearchQuery("");
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("File selected:", file.name, file.type, file.size);
    
    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview("document");
    }

    setShowFileModal(true);
  };

  const handleSendFile = async () => {
    console.log("handleSendFile called");
    
    if (!selectedFile || !selectedChat) {
      console.error("No file or chat selected");
      alert("Please select a file and chat");
      return;
    }

    try {
      console.log("Starting file upload...");

      const formData = new FormData();
      
      if (selectedFile.size === 0) {
        throw new Error("Selected file is empty");
      }

      formData.append("file", selectedFile);
      formData.append("chatId", selectedChat._id);

      console.log("Making API request...");

      const response = await fetch("/api/messages/files", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      console.log("Response received:", {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload failed:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Upload successful:", data);

      const { message } = data;

      // Update state immediately
      setMessages((prev) => [...prev, message]);
      setChats((prev) => {
        const updatedChats = prev.map((chat) =>
          chat._id === selectedChat._id ? { ...chat, latestMessage: message } : chat
        );
        // Use current unread state for sorting
        return sortChats(updatedChats, unreadChats);
      });
      
      // Emit to socket
      if (socket?.connected) {
        socket.emit("send_message", {
          ...message,
          chat: selectedChat._id,
        });
        console.log("Socket event emitted");
      }

      // Clean up
      setShowFileModal(false);
      setSelectedFile(null);
      setFilePreview(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      console.log("File upload completed successfully");
      
    } catch (err) {
      console.error("File upload failed:", err);
      alert(`Failed to upload file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleCloseFileModal = () => {
    setShowFileModal(false);
    setSelectedFile(null);
    setFilePreview(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startEditMessage = (msg: any) => {
    setEditingMessageId(msg._id);
    setNewMessage(msg.content ?? "");
  };

  return (
  <div className="flex h-screen bg-[#0a0f24] text-white overflow-hidden">
    {/* Desktop: Always show sidebar */}
    <div className="hidden md:flex">
      <Sidebar
        chats={chats}
        searchResults={searchResults}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onUserClick={handleUserClick}
        onChatClick={handleChatSelect}
        highlightedChatId={highlightedChatId}
        currentUserId={currentUserId}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onChatsUpdate={setChats}
        unreadChats={unreadChats}
      />
    </div>

    {/* Mobile: Show sidebar as overlay */}
    <div className="md:hidden">
      <Sidebar
        chats={chats}
        searchResults={searchResults}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onUserClick={handleUserClick}
        onChatClick={handleChatSelect}
        highlightedChatId={highlightedChatId}
        currentUserId={currentUserId}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onChatsUpdate={setChats}
        unreadChats={unreadChats}
      />
    </div>

    {/* Main Chat Window */}
    <div className={`flex-1 flex flex-col ${
      selectedChat 
        ? 'block' 
        : 'hidden md:flex'  // Hide on mobile when no chat selected, always show on desktop
    }`}>
      <ChatWindow
        selectedChat={selectedChat}
        currentUserId={currentUserId}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        handleAttachClick={handleAttachClick}
        handleDelete={handleDeleteMessage}
        handleEdit={startEditMessage}
        editingMessageId={editingMessageId}
        setEditingMessageId={setEditingMessageId}
        handleFileChange={handleFileChange} 
        fileInputRef={fileInputRef}
        setSelectedChat={setSelectedChat}
      />
    </div>

    {/* File Modal - Now responsive */}
    {showFileModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleCloseFileModal}
        />
        <div className="relative z-10 w-full max-w-md">
          <FileAttachmentModal
            selectedFile={selectedFile}
            filePreview={filePreview}
            onSend={handleSendFile}
            onClose={handleCloseFileModal}
          />
        </div>
      </div>
    )}
  </div>
);
}