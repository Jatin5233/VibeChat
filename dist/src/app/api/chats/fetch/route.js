"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
// src/app/api/chats/route.ts
const server_1 = require("next/server");
const dbConfig_1 = require("@/dbConfig/dbConfig");
const chatModel_1 = __importDefault(require("@/models/chatModel"));
const authMiddleware_1 = require("@/middlewares/authMiddleware");
async function POST(req) {
    await (0, dbConfig_1.connect)();
    const { user, error, status } = await (0, authMiddleware_1.verifyToken)(req);
    if (error)
        return server_1.NextResponse.json({ error }, { status });
    if (!user || !user.id) {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userId } = await req.json();
    if (!userId) {
        return server_1.NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }
    try {
        // Check if chat exists
        let chat = await chatModel_1.default.findOne({
            isGroupChat: false,
            participants: { $all: [user.id, userId] },
        })
            .populate("participants", "username profilePic email")
            .populate({
            path: "latestMessage",
            populate: { path: "sender", select: "username profilePic email" },
        });
        // If not, create one
        if (!chat) {
            chat = await chatModel_1.default.create({
                isGroupChat: false,
                participants: [user.id, userId],
            });
        }
        // Populate again before sending
        chat = await chatModel_1.default.findById(chat._id)
            .populate("participants", "username profilePic email")
            .populate({
            path: "latestMessage",
            populate: { path: "sender", select: "username profilePic email" },
        });
        return server_1.NextResponse.json(chat, { status: 200 });
    }
    catch (err) {
        console.error("Error creating/fetching chat:", err);
        return server_1.NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
