"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const dbConfig_1 = require("../src/dbConfig/dbConfig");
// Import models (must be registered before usage)
require("../src/models/userModel");
const chatModel_1 = __importDefault(require("../src/models/chatModel"));
require("../src/models/msgModel");
const port = process.env.PORT || 3001;
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Create and export io instance
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Connect DB first
(0, dbConfig_1.connect)()
    .then(() => {
    console.log("✅ MongoDB connected");
    exports.io.on("connection", (socket) => {
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
                const fullChat = await chatModel_1.default.findById(chatId)
                    .populate("participants", "username profilePic email")
                    .populate("latestMessage");
                if (!fullChat)
                    return;
                exports.io.emit("new_chat", fullChat);
                console.log("📨 New chat broadcast to all clients:", chatId);
            }
            catch (err) {
                console.error("❌ Failed to populate new_chat:", err);
            }
        });
        socket.on("messages_read", ({ chatId, userId }) => {
            // Broadcast to all users in the chat that messages were read
            exports.io.to(chatId).emit("messages_read", { chatId, userId });
            console.log(`✅ Messages marked as read in chat ${chatId} by user ${userId}`);
        });
        // Forward message ONLY to users in the same chat room
        socket.on("send_message", async (msg) => {
            const chatId = msg.chat?._id?.toString() || msg.chat?.toString();
            if (!chatId)
                return;
            const senderId = msg.sender?._id?.toString() || msg.sender?.toString();
            // 1. Emit to the chat room for users actively viewing the chat
            exports.io.to(chatId).emit("receive_message", msg);
            console.log(`📨 Message sent to chat room: ${chatId}`);
            try {
                // 2. Find the chat to get all participants
                const chat = await chatModel_1.default.findById(chatId);
                if (!chat || !chat.participants)
                    return;
                // 3. Emit a sidebar update to each participant's personal room
                chat.participants.forEach((participantId) => {
                    if (!participantId)
                        return;
                    const participantIdStr = participantId.toString();
                    if (participantIdStr !== senderId) {
                        exports.io.to(participantIdStr).emit("sidebar_update", msg);
                        console.log(`⚠️ Sidebar update sent to user: ${participantIdStr}`);
                    }
                });
            }
            catch (err) {
                console.error("Failed to send sidebar update:", err);
            }
        });
        // Handle message deletion
        socket.on("delete_message", ({ chatId, _id }) => {
            if (chatId && _id) {
                exports.io.to(chatId.toString()).emit("delete_message", { _id, chatId });
                console.log("🗑️ Deleted message broadcast:", _id, "in chat", chatId);
            }
        });
        socket.on("edit_message", (msg) => {
            const chatId = typeof msg.chat === "object" && msg.chat?._id
                ? msg.chat._id.toString()
                : msg.chat?.toString();
            if (!chatId)
                return;
            // broadcast same event name
            exports.io.to(chatId).emit("edit_message", msg);
            console.log("📝 Edited message broadcast:", msg._id, "in chat", chatId);
        });
        socket.on("update_profile", (user) => {
            // Broadcast to all connected clients
            exports.io.emit("update_profile", user);
            exports.io.emit("profile_updated", user);
            console.log("👤 Profile updated broadcast:", user._id);
        });
        socket.on("delete_account", ({ userId }) => {
            console.log("🗑️ Account deleted:", userId);
            exports.io.emit("account_deleted", { userId }); // ✅ Broadcast to all clients
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
