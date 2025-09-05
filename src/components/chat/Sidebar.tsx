"use client";
import { useEffect, useCallback, useState } from "react";
import SearchBar from "./SearchBar";
import ProfileHeader from "./ProfileHeader";
import { useSocket } from "@/context/socketConfig";
import { useTheme } from "@/context/themeContext";
import { themes } from "@/theme";
import { Menu, X, MessageCircle, Users, Settings } from "lucide-react";

interface SidebarProps {
  chats: any[];
  searchResults: any[];
  searchQuery: string;
  onSearch: (query: string) => void;
  onUserClick: (id: string) => void;
  onChatClick: (chat: any) => void;
  highlightedChatId: string | null;
  currentUserId: string | null;
  currentUser?: any;
  setCurrentUser?: (u: any) => void;
  onChatsUpdate: React.Dispatch<React.SetStateAction<any[]>>;
  unreadChats?: Map<string, number>;
}

export default function Sidebar({
  chats = [],
  searchResults = [],
  searchQuery,
  onSearch,
  onUserClick,
  onChatClick,
  highlightedChatId,
  currentUserId,
  currentUser,
  setCurrentUser,
  onChatsUpdate,
  unreadChats = new Map(),
}: SidebarProps) {
  const { socket } = useSocket();
  const { theme } = useTheme();
  const t = themes[theme];
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
     if (mobile) {
      setIsMobileMenuOpen(true); // Open by default on mobile
    } else {
      setIsMobileMenuOpen(false); // Always closed on desktop
    }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Handle profile updates in real time
  const handleProfileUpdated = useCallback(
    (updatedUser: any) => {
      if (setCurrentUser && updatedUser._id === currentUserId) {
        setCurrentUser(updatedUser);
      }

      const updatedChats = chats.map((chat) => {
        const participantIndex = chat.participants.findIndex(
          (p: any) => p._id === updatedUser._id
        );

        if (participantIndex > -1) {
          const newParticipants = [...chat.participants];
          newParticipants[participantIndex] = {
            ...newParticipants[participantIndex],
            ...updatedUser,
          };
          return { ...chat, participants: newParticipants };
        }
        return chat;
      });

      onChatsUpdate(updatedChats);
    },
    [currentUserId, setCurrentUser, chats, onChatsUpdate]
  );

  const handleDeleteAccount = useCallback(
    ({ userId }: { userId: string }) => {
      const updatedChats = chats.filter(
        (chat) => !chat.participants.some((p: any) => p._id === userId)
      );
      onChatsUpdate(updatedChats);

      if (currentUserId === userId) {
        localStorage.clear();
        window.location.href = "/login";
      }
    },
    [chats, onChatsUpdate, currentUserId]
  );
  
  useEffect(() => {
    if (!socket) return;

    socket.on("profile_updated", handleProfileUpdated);
    socket.on("account_deleted", handleDeleteAccount);

    return () => {
      socket.off("profile_updated", handleProfileUpdated);
      socket.off("account_deleted", handleDeleteAccount);
    };
  }, [socket, handleProfileUpdated, handleDeleteAccount]);

  // Calculate total unread messages
  const totalUnreadCount = Array.from(unreadChats.values()).reduce((total, count) => total + count, 0);

  const handleChatClick = (chat: any) => {
    onChatClick(chat);
    if (isMobile) {
      setIsMobileMenuOpen(false); // Close sidebar on mobile after selecting chat
    }
  };

  const SidebarContent = () => (
    <div className={`flex flex-col h-full ${t.sidebar} transition-colors duration-300`}>
      {/* Mobile header with close button */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className={`${t.text} text-lg font-semibold flex items-center gap-2`}>
            <MessageCircle size={20} />
            Chats
            {totalUnreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            )}
          </h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className={`p-2 rounded-full ${t.hover}`}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Profile block - More compact on mobile */}
      {currentUser && (
        <div className="p-3 sm:p-4">
          <ProfileHeader currentUser={currentUser} />
        </div>
      )}

      {/* Search bar */}
      <div className="px-3 sm:px-4 pb-2">
        <SearchBar
          searchQuery={searchQuery}
          onSearch={onSearch}
         
        />
      </div>

     
      {searchResults.length > 0 && (
        <div className="mx-3 sm:mx-4 mb-4">
          <div className={`${t.card} rounded-lg max-h-48 sm:max-h-60 overflow-y-auto transition`}>
            <div className="p-2">
              <h4 className={`${t.text} text-sm font-medium mb-2 flex items-center gap-2`}>
                <Users size={16} />
                Search Results
              </h4>
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className={`flex items-center gap-3 p-2 cursor-pointer rounded-lg transition ${t.hover}`}
                  onClick={() => onUserClick(user._id)}
                >
                  <img
                    src={user.profilePic || "/default-avatar.png"}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className={`${t.text} text-sm font-medium truncate block`}>
                      {user.username}
                    </span>
                    <span className={`${t.subtext} text-xs truncate block`}>
                      {user.email || 'User'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chats list header */}
      <div className="px-3 sm:px-4 pb-2 flex items-center justify-between">
        <h3 className={`${t.text} text-base sm:text-lg font-semibold flex items-center gap-2`}>
          <MessageCircle size={18} />
          Your Chats
          {totalUnreadCount > 0 && (
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full">
              {totalUnreadCount}
            </span>
          )}
        </h3>
        <button className={`p-2 rounded-full ${t.hover} hidden sm:flex items-center justify-center`}>
          <Settings size={16} />
        </button>
      </div>

      {/* Chats list */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 pb-4">
        <div className="space-y-1">
          {Array.isArray(chats) && chats.length > 0 ? (
            chats.map((chat) => {
              const otherUser = chat.participants?.find(
                (p: any) => p._id?.toString() !== currentUserId?.toString()
              );

              const isHighlighted =
                highlightedChatId &&
                chat._id.toString() === highlightedChatId.toString();
              
              const unreadCount = unreadChats.get(chat._id.toString()) || 0;
              const hasUnread = unreadCount > 0;

              return (
                <div
                  key={chat._id}
                  className={`flex items-center p-2 sm:p-3 rounded-xl cursor-pointer transition-all duration-200 relative group
                    ${
                      isHighlighted
                        ? t.active
                        : hasUnread
                        ? `${t.hover} bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-l-4 border-blue-500 shadow-md`
                        : t.hover
                    }`}
                  onClick={() => handleChatClick(chat)}
                >
                  {/* Unread indicator dot */}
                  {hasUnread && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-lg" />
                  )}
                  
                  {/* Profile picture with online indicator */}
                  <div className="relative flex-shrink-0 ml-2">
                    <img
                      src={otherUser?.profilePic || "/default-avatar.png"}
                      alt={otherUser?.username || "User"}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover transition-all duration-300 ${
                        hasUnread ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800' : ''
                      }`}
                    />
                    {/* Online indicator - you can implement this based on your user status logic */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800 hidden sm:block" />
                  </div>
                  
                  {/* Chat info */}
                  <div className="flex flex-col ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`${t.text} ${hasUnread ? 'font-bold text-white' : ''} transition-all duration-300 text-sm sm:text-base truncate`}>
                        {chat.isGroupChat
                          ? chat.chatName
                          : otherUser?.username || "Unknown User"}
                      </span>
                      {/* Unread count badge */}
                      {unreadCount > 0 && (
                        <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center shadow-lg flex-shrink-0">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    
                    {/* Latest message preview */}
                    <div className="flex items-center justify-between">
                      {chat.latestMessage && (
                        <span
                          className={`text-xs sm:text-sm truncate max-w-[70%] transition-all duration-300 ${
                            hasUnread ? 'text-blue-200 font-medium' : t.subtext
                          }`}
                        >
                          {chat.latestMessage.content || '📎 File attachment'}
                        </span>
                      )}
                      {chat.latestMessage?.createdAt && (
                        <span className={`text-xs ${hasUnread ? 'text-blue-300' : t.subtext} flex-shrink-0 ml-2`}>
                          {new Date(chat.latestMessage.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
                            ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date(chat.latestMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* New message indicator with glow effect */}
                  {hasUnread && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl pointer-events-none" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <MessageCircle size={48} className={`${t.subtext} mx-auto mb-4 opacity-50`} />
              <p className={`${t.subtext} text-sm mb-2`}>No chats yet</p>
              <p className={`${t.subtext} text-xs opacity-75`}>Search for users to start chatting!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  
  const MobileMenuButton = () => (
    <button
      onClick={() => setIsMobileMenuOpen(true)}
      className={`fixed top-4 left-4 z-40 p-3 rounded-full shadow-lg ${t.button} md:hidden flex items-center justify-center`}
      aria-label="Open chat menu"
    >
      <Menu size={20} />
      {totalUnreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {totalUnreadCount > 99 ? '99' : totalUnreadCount}
        </span>
      )}
    </button>
  );

  if (isMobile) {
    return (
      <>
        <MobileMenuButton />
        
        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Sidebar */}
            <div className={`absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] ${t.sidebar} shadow-2xl transform transition-transform duration-300`}>
              <SidebarContent />
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside className={`flex flex-col w-80 border-r border-white/10 ${t.sidebar} transition-colors duration-300`}>
      <SidebarContent />
    </aside>
  );
}