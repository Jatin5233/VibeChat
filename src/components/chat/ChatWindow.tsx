"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ArrowLeft, X, Paperclip, Send, Smile, MoreVertical, Download, Eye, Menu } from "lucide-react";
import ContextMenu from "./ContextMenu";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useSocket } from "@/context/socketConfig";
import { useTheme } from "@/context/themeContext";
import { themes } from "@/theme";
import { downloadFileFromUrl, getFileIcon, formatFileSize } from "@/utils/downloadUtils";
import api from "@/utils/refreshAccess";

interface IAttachment {
  url: string;
  type: string;
  public_id: string;
  filename?: string;
  fileSize?: number;
  resource_type?: string;
}

interface IMessage {
  _id?: string;
  sender?: string | { _id: string; username?: string; profilePic?: string };
  content?: string;
  chat?: string;
  attachments?: IAttachment[];
  createdAt?: string;
}

interface ChatWindowProps {
  selectedChat: any;
  currentUserId: string | null;
  messages: any[];
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => void;
  handleAttachClick: () => void;
  handleEdit: (msg: IMessage) => void;
  editingMessageId: string | null;
  setEditingMessageId: (id: string | null) => void;
  handleDelete: (msgId: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setSelectedChat: (chat: any | null) => void;
  onToggleSidebar?: () => void;
}

function FileAttachment({ attachment }: { attachment: IAttachment }) {
  const { theme } = useTheme();
  const t = themes[theme];

  const handleDownload = () => {
    if (attachment.filename) {
      downloadFileFromUrl(attachment.url, attachment.filename);
    } else {
      window.open(attachment.url, '_blank');
    }
  };

  const handlePreview = () => {
    if (attachment.type.includes('pdf') || attachment.type.startsWith('image/')) {
      window.open(attachment.url, '_blank');
    } else {
      handleDownload();
    }
  };

  if (attachment.type.startsWith('image/')) {
    return (
      <div className="relative group max-w-full">
        <img
          src={attachment.url}
          alt={attachment.filename || 'Image'}
          className="
            max-w-full
            max-h-40 sm:max-h-48 md:max-h-60 lg:max-h-72
            rounded-lg cursor-pointer 
            transition-opacity object-cover
            w-auto h-auto
          "
          onClick={handlePreview}
          title="Click to view full size"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={`border rounded-lg overflow-hidden w-full max-w-xs ${t.card}`}>
      <div className="p-2 sm:p-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-lg sm:text-xl md:text-2xl flex-shrink-0">
            {getFileIcon(attachment.type)}
          </span>
          <div className="flex-1 min-w-0">
            <p className={`${t.text} font-medium truncate text-xs sm:text-sm`} title={attachment.filename}>
              {attachment.filename || 'Unknown file'}
            </p>
            <p className={`text-xs ${t.subtext}`}>
              {attachment.fileSize ? formatFileSize(attachment.fileSize) : 'Unknown size'}
            </p>
            <p className={`text-xs ${t.subtext} truncate hidden sm:block`} title={attachment.type}>
              {attachment.type}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-t border-gray-600">
        {attachment.type.includes('pdf') && (
          <button
            onClick={handlePreview}
            className={`
              flex-1 px-2 py-2 text-xs
              ${t.hover} ${t.text} 
              border-r border-gray-600 
              transition-colors 
              flex items-center justify-center gap-1
            `}
            title="Preview PDF in new tab"
          >
            <Eye size={12} className="hidden sm:inline" />
            <span className="hidden sm:inline">Preview</span>
            <span className="sm:hidden">👁️</span>
          </button>
        )}
        <button
          onClick={handleDownload}
          className={`
            flex-1 px-2 py-2 text-xs
            ${t.hover} ${t.text}
            transition-colors 
            flex items-center justify-center gap-1
          `}
          title={`Download ${attachment.filename}`}
        >
          <Download size={12} className="hidden sm:inline" />
          <span className="hidden sm:inline">Download</span>
          <span className="sm:hidden">⬇️</span>
        </button>
      </div>
    </div>
  );
}

export default function ChatWindow({
  selectedChat,
  currentUserId,
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  handleAttachClick,
  handleDelete,
  handleEdit,
  editingMessageId,
  setEditingMessageId,
  handleFileChange,
  fileInputRef,
  setSelectedChat,
  onToggleSidebar,
}: ChatWindowProps) {
  const messageEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    msgId: string;
    content: string;
  } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editedMessage, setEditedMessage] = useState("");

  const { socket } = useSocket();
  const { theme } = useTheme();
  const t = themes[theme];

  // Enhanced device detection
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Set edited message when editing starts
  useEffect(() => {
    if (editingMessageId) {
      const messageToEdit = messages.find(msg => msg._id === editingMessageId);
      if (messageToEdit) {
        setEditedMessage(messageToEdit.content || "");
        setNewMessage(messageToEdit.content || "");
      }
    } else {
      setEditedMessage("");
    }
  }, [editingMessageId, messages, setNewMessage]);

  // Enhanced edit message function using api
  const handleEditMessage = async () => {
    if (!editingMessageId || !editedMessage.trim()) return;

    try {
      
      
      const response = await api.put(`/api/messages/${editingMessageId}`, {
        content: editedMessage.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true // Include cookies for authentication
      });

      if (response.status === 200) {
        // Emit socket event for real-time update
        if (socket && selectedChat?._id) {
          socket.emit('message_edited', {
            chatId: selectedChat._id,
            messageId: editingMessageId,
            newContent: editedMessage.trim(),
            editedAt: new Date().toISOString()
          });
        }

        // Clear editing state
        setEditingMessageId(null);
        setNewMessage("");
        setEditedMessage("");
        
        console.log("✅ Message edited successfully");
      }
    } catch (error: any) {
      console.error("❌ Error editing message:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to edit message";
      alert(`Failed to edit message: ${errorMessage}`);
    }
  };

  // Enhanced delete message function using api
  const handleDeleteMessage = async (messageId: string) => {
    if (!messageId) return;

    // Show confirmation dialog
    const confirmDelete = window.confirm("Are you sure you want to delete this message?");
    if (!confirmDelete) return;

    setIsDeleting(messageId);

    try {
     
      
      const response = await api.delete(`/api/messages/${messageId}`, {
        withCredentials: true // Include cookies for authentication
      });

      if (response.status === 200) {
        // Emit socket event for real-time update
        if (socket && selectedChat?._id) {
          socket.emit('message_deleted', {
            chatId: selectedChat._id,
            messageId: messageId,
            deletedAt: new Date().toISOString()
          });
        }

        console.log("✅ Message deleted successfully");
      }
    } catch (error: any) {
      console.error("❌ Error deleting message:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to delete message";
      alert(`Failed to delete message: ${errorMessage}`);
    } finally {
      setIsDeleting(null);
    }
  };

  // Enhanced send/edit handler
  const handleSendOrEdit = () => {
    if (editingMessageId) {
      handleEditMessage();
    } else {
      sendMessage();
    }
  };

  // Cancel edit handler
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setNewMessage("");
    setEditedMessage("");
  };

  const handleProfileUpdated = useCallback(
    (updatedUser: any) => {
      if (!selectedChat) return;
      const participantIndex = selectedChat.participants.findIndex(
        (p: any) => p._id === updatedUser._id
      );

      if (participantIndex > -1) {
        const newParticipants = [...selectedChat.participants];
        newParticipants[participantIndex] = {
          ...newParticipants[participantIndex],
          ...updatedUser,
        };

        setSelectedChat({
          ...selectedChat,
          participants: newParticipants,
        });
      }
    },
    [selectedChat, setSelectedChat]
  );

  const handleAccountDeleted = useCallback(
    ({ userId }: { userId: string }) => {
      if (!selectedChat) return;

      const isParticipant = selectedChat.participants.some(
        (p: any) => p._id === userId
      );

      if (isParticipant) {
        alert("This user has deleted their account. This chat is no longer available.");
        setSelectedChat(null);
      }
    },
    [selectedChat, setSelectedChat]
  );

  useEffect(() => {
    if (!socket) return;
    
    socket.on("profile_updated", handleProfileUpdated);
    socket.on("account_deleted", handleAccountDeleted);

    return () => {
      socket.off("profile_updated", handleProfileUpdated);
      socket.off("account_deleted", handleAccountDeleted);
    };
  }, [socket, handleProfileUpdated, handleAccountDeleted]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    if (editingMessageId) {
      setEditedMessage((prev) => prev + emojiData.emoji);
      setNewMessage((prev) => prev + emojiData.emoji);
    } else {
      setNewMessage((prev) => prev + emojiData.emoji);
    }
    setShowEmojiPicker(false);
  };

  // Enhanced scroll to bottom with smooth behavior
  const scrollToBottom = useCallback(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  // Enhanced click handlers for mobile
  useEffect(() => {
    const handleCloseMenu = (e: Event) => {
      // Don't close if clicking on emoji picker or its trigger
      if (e.target instanceof Element) {
        if (e.target.closest('.emoji-picker-react') || 
            e.target.closest('[data-emoji-trigger]')) {
          return;
        }
      }
      
      setContextMenu(null);
      setShowEmojiPicker(false);
    };
    
    document.addEventListener("click", handleCloseMenu);
    document.addEventListener("touchstart", handleCloseMenu);

    return () => {
      document.removeEventListener("click", handleCloseMenu);
      document.removeEventListener("touchstart", handleCloseMenu);
    };
  }, []);

  // Enhanced keyboard handling
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowEmojiPicker(false);
      setContextMenu(null);
      if (editingMessageId) {
        handleCancelEdit();
      }
    }
  }, [editingMessageId]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (!selectedChat) {
    return (
      <div className={`
        flex flex-1 items-center justify-center
        ${t.subtext} p-4 text-center
        min-h-[50vh] sm:min-h-0
      `}>
        <div className="max-w-md mx-auto">
          <div className={`
            mx-auto mb-4 flex h-24 w-24 items-center justify-center
            rounded-full text-4xl shadow-lg
            sm:mb-6 sm:h-28 sm:w-28 sm:text-5xl
            ${t.card}
          `}>
            <span>💬</span>
          </div>

          <h2 className={`
            text-lg font-semibold
            sm:text-xl lg:text-2xl
            mb-2 sm:mb-4
            ${t.text}
          `}>
            Welcome to VibeChat!
          </h2>

          <p className="text-sm sm:text-base opacity-75 mb-4">
            Select a chat from the sidebar or search for someone to start messaging
          </p>
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className={`
                px-4 py-2 rounded-full ${t.button}
                text-white font-medium
                flex items-center gap-1 mx-auto
              `}
            >
              <Menu size={16} />
              Open Chats
            </button>
          )}
        </div>
      </div>
    );
  }

  const otherUser = selectedChat.participants?.find(
    (p: any) => p._id?.toString() !== currentUserId?.toString()
  );

  return (
    <div className={`
      flex-1 flex flex-col
      ${t.background} ${t.text}
      h-full max-h-screen
      relative
    `}>
      {/* Chat Header - Enhanced for mobile */}
      <div className={`
        p-3 sm:p-4 md:p-5
        pl-16 md:pl-3
        border-b border-white/10
        flex items-center gap-2 sm:gap-3
        ${t.header}
        sticky top-0 z-20
        backdrop-blur-md bg-opacity-95
        min-h-[60px] sm:min-h-[70px]
      `}>
        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setSelectedChat(null)}
            className={`
              p-2 rounded-full ${t.hover}
              flex items-center justify-center
              touch-manipulation
            `}
            aria-label="Back to chats"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        
        {/* User info */}
        <div className="flex items-center gap-5 sm:gap-4 flex-1 min-w-0">
          <img
            src={otherUser?.profilePic || "/default-avatar.png"}
            alt={otherUser?.username || "User"}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0 gap-5"
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-sm sm:text-base md:text-lg truncate">
              {selectedChat.name || otherUser?.username || "Unknown User"}
            </h2>
            <p className={`text-xs sm:text-sm ${t.subtext} truncate hidden sm:block`}>
              {selectedChat.isGroupChat ? 
                `${selectedChat.participants?.length || 0} members` : 
                "Active"}
            </p>
          </div>
        </div>

        {/* Header actions */}
        <button
          className={`
            p-2 rounded-full ${t.hover}
            hidden sm:flex items-center justify-center
            touch-manipulation
          `}
          aria-label="More options"
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Messages Container - Enhanced scrolling */}
      <div 
        ref={messagesContainerRef}
        className="
          flex-1 overflow-y-auto
          px-2 sm:px-4 md:px-6
          py-2 sm:py-4
          space-y-2 sm:space-y-3 md:space-y-4
          scroll-smooth
          scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent
        " 
        id="messages-container"
      >
        {messages.map((msg, idx) => {
          const senderId =
            typeof msg?.sender === "object" && msg.sender?._id
              ? msg.sender._id.toString()
              : typeof msg?.sender === "string"
              ? msg.sender
              : "";
          const isSender = currentUserId ? senderId === currentUserId.toString() : false;
          const senderName = typeof msg.sender === 'object' ? msg.sender.username : 'Unknown';
          const senderAvatar = typeof msg.sender === 'object' ? msg.sender.profilePic : '/default-avatar.png';
          const isBeingDeleted = isDeleting === msg._id;

          return (
            <div
              key={msg?._id ?? `msg-${idx}`}
              className={`
                flex items-end gap-2 sm:gap-3 group relative
                ${isSender ? "justify-end" : "justify-start"}
                touch-manipulation
                ${isBeingDeleted ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              {!isSender && (
                <img 
                  src={senderAvatar || '/default-avatar.png'} 
                  alt={senderName} 
                  className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0" 
                />
              )}
              
              <div
                className={`
                  p-2 sm:p-3 md:p-4 rounded-2xl
                  max-w-[85%] sm:max-w-[75%] md:max-w-md lg:max-w-lg
                  shadow-md
                  ${isSender ? t.messageSender : t.messageReceiver}
                  break-words
                  ${isSender ? 'cursor-context-menu' : ''}
                  ${isBeingDeleted ? 'animate-pulse' : ''}
                `}
                onContextMenu={(e) => {
                  // Only handle context menu for sender messages
                  if (!isSender || !msg._id || isBeingDeleted) {
                    return; // Let the default context menu show for non-sender messages
                  }
                  
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const rect = messagesContainerRef.current?.getBoundingClientRect();
                  const x = isMobile ? e.clientX : Math.min(e.clientX, window.innerWidth - 200);
                  const y = rect ? Math.max(e.clientY - rect.top, 0) : e.clientY;
                  setContextMenu({ x, y, msgId: msg._id, content: msg.content || "" });
                }}
              >
                {!isSender && (
                  <span className={`block text-xs font-semibold mb-1 ${t.accent}`}>
                    {senderName}
                  </span>
                )}
                
                {isBeingDeleted && (
                  <div className="flex items-center gap-2 text-xs opacity-60 mb-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    <span>Deleting...</span>
                  </div>
                )}
                
                {msg?.content && !msg?.attachments?.length && (
                  <p className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">
                    {msg.content}
                  </p>
                )}
                
                {msg?.attachments?.length > 0 && msg?.content && (
                  <p className={`text-sm ${t.subtext} mb-2 break-words`}>
                    {msg.content}
                  </p>
                )}
                
                {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.attachments.map((attachment: IAttachment, i: number) => (
                      <FileAttachment key={`file-${i}`} attachment={attachment} />
                    ))}
                  </div>
                )}
                
                <span className={`
                  block text-xs mt-1 text-right opacity-70
                  ${t.subtext}
                `}>
                  {msg?.createdAt ? 
                    new Date(msg.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: !isMobile 
                    }) : ""}
                </span>
              </div>
              
              {isSender && (
                <img 
                  src={senderAvatar || '/default-avatar.png'} 
                  alt={senderName} 
                  className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0" 
                />
              )}
            </div>
          );
        })}
        <div ref={messageEndRef} className="h-1" />
      </div>

      {/* Context Menu - Enhanced positioning */}
      {contextMenu && (
        <div className="fixed inset-0 z-30" style={{ pointerEvents: 'none' }}>
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            msgId={contextMenu.msgId}
            content={contextMenu.content}
            onEdit={() => {
              handleEdit({ _id: contextMenu.msgId, content: contextMenu.content });
              setContextMenu(null);
            }}
            onDelete={() => {
              handleDeleteMessage(contextMenu.msgId);
              setContextMenu(null);
            }}
            onClose={() => setContextMenu(null)}
          />
        </div>
      )}

      {/* Message Input Form - Enhanced for mobile */}
      <div className={`
        p-2 sm:p-3 md:p-4
        border-t border-white/10
        ${t.input}
        sticky bottom-0
        backdrop-blur-md bg-opacity-95
        pb-safe-bottom
      `}>
        {/* Edit mode indicator */}
        {editingMessageId && (
          <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg text-sm flex justify-between items-center">
            <span className="flex items-center gap-2">
              <span className="text-yellow-500">✏️</span>
              <span className="hidden sm:inline">Editing message...</span>
              <span className="sm:hidden">Editing...</span>
            </span>
            <button 
              type="button" 
              onClick={handleCancelEdit}
              className="text-yellow-500 hover:text-yellow-300 p-1 rounded touch-manipulation"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => { 
            e.preventDefault(); 
            handleSendOrEdit(); 
          }}
          className="flex gap-2 items-end relative"
        >
          {/* Action buttons */}
          <div className="flex gap-1 items-center flex-shrink-0">
            <button 
              type="button" 
              onClick={handleAttachClick} 
              className={`
                p-2 sm:p-2.5 rounded-full ${t.hover}
                flex items-center justify-center
                touch-manipulation min-w-[40px] min-h-[40px]
                ${editingMessageId ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-label="Attach file"
              disabled={!!editingMessageId}
            >
              <Paperclip size={isMobile ? 16 : 18} />
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,application/pdf,.pdf,.doc,.docx,.txt,.zip,.rar,audio/*,video/*" 
              onChange={handleFileChange} 
            />
            
            <button 
              type="button" 
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker((prev) => !prev);
              }}
              className={`
                p-2 sm:p-2.5 rounded-full ${t.hover}
                flex items-center justify-center
                touch-manipulation min-w-[40px] min-h-[40px]
              `}
              aria-label="Add emoji"
              data-emoji-trigger
            >
              <Smile size={isMobile ? 16 : 18} />
            </button>
          </div>

          {/* Emoji Picker - Enhanced positioning */}
          {showEmojiPicker && (
            <div className={`
              absolute bottom-full mb-2
              ${isMobile ? 'left-0 right-0' : 'left-12'}
              z-50
            `}>
              <div className={`
                ${isMobile ? 'mx-2' : ''}
                ${isMobile ? 'max-w-full' : 'max-w-sm'}
              `}>
                <EmojiPicker 
                  onEmojiClick={handleEmojiClick}
                  width={isMobile ? '100%' : isTablet ? 300 : 350}
                  height={isMobile ? 250 : isTablet ? 300 : 400}
                  searchDisabled={isMobile}
                  skinTonesDisabled={isMobile}
                />
              </div>
            </div>
          )}

          {/* Message input and send button */}
          <div className="flex-1 flex gap-2 min-w-0">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                if (editingMessageId) {
                  setEditedMessage(e.target.value);
                }
              }}
              placeholder={editingMessageId ? "Edit your message..." : "Type a message..."}
              className={`
                flex-1 p-2 sm:p-3 md:p-3.5
                rounded-lg sm:rounded-xl
                bg-black/20 text-white
                outline-none border border-transparent
                focus:border-pink-500
                text-sm sm:text-base
                ${t.text}
                min-w-0
                touch-manipulation
                ${editingMessageId ? 'border-yellow-500/50' : ''}
              `}
              disabled={!selectedChat}
              maxLength={1000}
            />
            
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className={`
                px-3 sm:px-4 py-2 sm:py-3
                rounded-lg sm:rounded-xl
                transition-all duration-200
                flex items-center justify-center
                touch-manipulation
                min-w-[44px] min-h-[44px]
                ${newMessage.trim() ? 
                  `${editingMessageId ? 'bg-yellow-600 hover:bg-yellow-500' : t.button} hover:scale-105 active:scale-95` : 
                  'bg-gray-600 cursor-not-allowed opacity-50'
                }
              `}
              aria-label={editingMessageId ? "Save changes" : "Send message"}
            >
              <Send size={isMobile ? 16 : 18} />
              <span className="hidden md:inline ml-2">
                {editingMessageId ? 'Save' : 'Send'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}