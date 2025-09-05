"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = DELETE;
exports.PUT = PUT;
const server_1 = require("next/server");
const dbConfig_1 = require("@/dbConfig/dbConfig");
const msgModel_1 = __importDefault(require("@/models/msgModel"));
const chatModel_1 = __importDefault(require("@/models/chatModel"));
const verifyToken_1 = require("@/utils/verifyToken");
const headers_1 = require("next/headers");
async function DELETE(req, context) {
    try {
        await (0, dbConfig_1.connect)();
        const cookieStore = await (0, headers_1.cookies)();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) {
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const decoded = (0, verifyToken_1.verifyToken)(token);
        if (!decoded) {
            return server_1.NextResponse.json({ error: "Invalid token" }, { status: 403 });
        }
        const { id: messageId } = await context.params;
        if (!messageId) {
            return server_1.NextResponse.json({ error: "Message ID required" }, { status: 400 });
        }
        // Find message
        const message = await msgModel_1.default.findById(messageId);
        if (!message) {
            return server_1.NextResponse.json({ error: "Message not found" }, { status: 404 });
        }
        // Check ownership
        if (message.sender.toString() !== decoded.id.toString()) {
            return server_1.NextResponse.json({ error: "Not allowed" }, { status: 403 });
        }
        const chatId = message.chat.toString();
        console.log("🗑️ Deleting message:", messageId, "from chat:", chatId);
        // Delete the message
        await message.deleteOne();
        // If this was the latestMessage, clear it
        const chat = await chatModel_1.default.findById(message.chat);
        if (chat?.latestMessage?.toString() === messageId) {
            chat.latestMessage = null;
            await chat.save();
            console.log("🔄 Cleared latest message from chat");
        }
        // ❌ REMOVE SOCKET EMISSION FROM API ROUTE
        // The client will handle socket emission
        console.log("✅ Message deleted successfully from database");
        return server_1.NextResponse.json({
            success: true,
            message: "Message deleted successfully",
            chatId: chatId,
            messageId: messageId
        }, { status: 200 });
    }
    catch (err) {
        console.error("❌ Delete error:", err);
        return server_1.NextResponse.json({
            error: "Server error",
            details: err instanceof Error ? err.message : "Unknown error"
        }, { status: 500 });
    }
}
async function PUT(req, context) {
    try {
        await (0, dbConfig_1.connect)();
        const cookieStore = await (0, headers_1.cookies)();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) {
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const decoded = (0, verifyToken_1.verifyToken)(token);
        if (!decoded) {
            return server_1.NextResponse.json({ error: "Invalid token" }, { status: 403 });
        }
        const { id: messageId } = await context.params;
        const body = await req.json();
        const { content } = body;
        if (!messageId || !content) {
            return server_1.NextResponse.json({ error: "Message ID and new content required" }, { status: 400 });
        }
        // Find the message
        const message = await msgModel_1.default.findById(messageId)
            .populate("sender", "username profilePic")
            .populate("chat");
        if (!message) {
            return server_1.NextResponse.json({ error: "Message not found" }, { status: 404 });
        }
        // Ownership check
        const senderId = typeof message.sender === "object" && message.sender?._id
            ? message.sender._id.toString()
            : message.sender.toString();
        if (senderId !== decoded.id.toString()) {
            return server_1.NextResponse.json({ error: "Not allowed" }, { status: 403 });
        }
        // Update
        message.content = content;
        await message.save();
        // If this was the latestMessage, update chat as well
        const chat = await chatModel_1.default.findById(message.chat);
        if (chat?.latestMessage?.toString() === messageId) {
            chat.latestMessage = messageId;
            await chat.save();
        }
        // Emit event to room
        const chatId = message.chat._id.toString();
        console.log("✏️ Message edited:", messageId, "in chat:", chatId);
        return server_1.NextResponse.json({ success: true, message }, { status: 200 });
    }
    catch (err) {
        console.error("❌ Edit error:", err);
        return server_1.NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
