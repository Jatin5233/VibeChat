import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import mongoose from "mongoose";
import { connect } from "../src/dbConfig/dbConfig";

// Import models (must be registered before usage)
import "../src/models/userModel";
import Chat from "../src/models/chatModel";
import "../src/models/msgModel";

import Message from "../src/models/msgModel";

const port = process.env.PORT || 3001;
const app = express();
const server = createServer(app);

// Create and export io instance
export const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN||"*", 
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN||"*", 
    methods:["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));

// Connect DB first
connect()
  .then(() => {
    console.log("✅ MongoDB connected");

    io.on("connection", (socket) => {
      console.log("⚡ New client connected:", socket.id);

      socket.on("authenticate", (userId) => {
    if (userId) {
      socket.join(userId); // Join the user to a room named after their ID
      console.log(`👤 User ${socket.id} authenticated and joined room: ${userId}`);
    }
  });

      // Join a chat room
      socket.on("join_chat", (chatId) => {
        socket.join(chatId);
        console.log(`🔥 User ${socket.id} joined chat: ${chatId}`);
      });

      // Leave a chat room
      socket.on("leave_chat", (chatId) => {
        socket.leave(chatId);
        console.log(`🚪 User ${socket.id} left chat: ${chatId}`);
      });
   socket.on("new_chat", async ({ chatId, senderId }) => {
  try {
    const fullChat = await Chat.findById(chatId)
      .populate("participants", "username profilePic email")
      .populate("latestMessage");

    if (!fullChat) return;

    io.emit("new_chat", fullChat);
    
    console.log("📨 New chat broadcast to all clients:", chatId);
  } catch (err) {
    console.error("❌ Failed to populate new_chat:", err);
  }
});
socket.on("messages_read", ({ chatId, userId }) => {
  // Broadcast to all users in the chat that messages were read
  io.to(chatId).emit("messages_read", { chatId, userId });
  console.log(`✅ Messages marked as read in chat ${chatId} by user ${userId}`);
});

      // Forward message ONLY to users in the same chat room
     socket.on("send_message", async (msg) => {
  const chatId = msg.chat?._id?.toString() || msg.chat?.toString();
  if (!chatId) return;

  const senderId = msg.sender?._id?.toString() || msg.sender?.toString();

  // 1. Emit to the chat room for users actively viewing the chat
  io.to(chatId).emit("receive_message", msg);
  console.log(`📨 Message sent to chat room: ${chatId}`);

  try {
    // 2. Find the chat to get all participants
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants) return;

    // 3. Emit a sidebar update to each participant's personal room
  chat.participants.forEach((participantId: mongoose.Types.ObjectId) => {
  if (!participantId) return;
  const participantIdStr = participantId.toString();

  if (participantIdStr !== senderId) {
    io.to(participantIdStr).emit("sidebar_update", msg);
    console.log(`⚠️ Sidebar update sent to user: ${participantIdStr}`);
  }
});
  } catch (err) {
    console.error("Failed to send sidebar update:", err);
  }
});

      // Handle message deletion
      socket.on("delete_message", ({ chatId, _id }) => {
        if (chatId && _id) {
          io.to(chatId.toString()).emit("delete_message", { _id, chatId });
          console.log("🗑️ Deleted message broadcast:", _id, "in chat", chatId);
        }
      });

      socket.on("edit_message", (msg) => {
  const chatId =
    typeof msg.chat === "object" && msg.chat?._id
      ? msg.chat._id.toString()
      : msg.chat?.toString();

  if (!chatId) return;

  // broadcast same event name
  io.to(chatId).emit("edit_message", msg);
  console.log("📝 Edited message broadcast:", msg._id, "in chat", chatId);
});
socket.on("update_profile", (user) => {
        // Broadcast to all connected clients
        io.emit("update_profile", user);
        io.emit("profile_updated", user);
        console.log("👤 Profile updated broadcast:", user._id);
      });
      socket.on("delete_account", ({ userId }) => {
    console.log("🗑️ Account deleted:", userId);
    io.emit("account_deleted", { userId }); // ✅ Broadcast to all clients
  });


      // On disconnect
      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });

    // Start server ONLY ONCE
    server.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed", err);
  });