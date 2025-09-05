"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const headers_1 = require("next/headers");
const dbConfig_1 = require("@/dbConfig/dbConfig");
const msgModel_1 = __importDefault(require("@/models/msgModel"));
const chatModel_1 = __importDefault(require("@/models/chatModel"));
const verifyToken_1 = require("@/utils/verifyToken");
async function POST(req) {
    try {
        await (0, dbConfig_1.connect)();
        const cookieStore = await (0, headers_1.cookies)();
        const token = cookieStore.get("accessToken")?.value;
        if (!token)
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const decoded = (0, verifyToken_1.verifyToken)(token);
        if (!decoded)
            return server_1.NextResponse.json({ error: "Invalid token" }, { status: 403 });
        // ✅ Parse JSON body
        const { content, chatId, receiverId } = await req.json();
        if (!content) {
            return server_1.NextResponse.json({ error: "Message content required" }, { status: 400 });
        }
        let chat;
        if (chatId) {
            // Existing chat
            chat = await chatModel_1.default.findById(chatId);
            if (!chat) {
                return server_1.NextResponse.json({ error: "Chat not found" }, { status: 404 });
            }
        }
        else {
            // ✅ Auto-create chat if none exists
            if (!receiverId) {
                return server_1.NextResponse.json({ error: "receiverId required to start new chat" }, { status: 400 });
            }
            chat = await chatModel_1.default.findOne({
                isGroupChat: false,
                participants: { $all: [decoded.id, receiverId], $size: 2 },
            });
            if (!chat) {
                chat = await chatModel_1.default.create({
                    participants: [decoded.id, receiverId],
                    isGroupChat: false,
                });
            }
        }
        // ✅ Create message
        let message = await msgModel_1.default.create({
            chat: chat._id,
            sender: decoded.id,
            content,
        });
        message = await message.populate("sender", "username profilePic");
        message = await message.populate({
            path: "chat",
            populate: { path: "participants", select: "username profilePic email" },
        });
        await chatModel_1.default.findByIdAndUpdate(chat._id, { latestMessage: message._id });
        // ✅ No socket emission here — client will handle it
        return server_1.NextResponse.json({ message, chat }, { status: 201 });
    }
    catch (err) {
        console.error("Message send error:", err);
        return server_1.NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
