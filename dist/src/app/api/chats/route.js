"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const dbConfig_1 = require("@/dbConfig/dbConfig");
const authMiddleware_1 = require("@/middlewares/authMiddleware");
const chatModel_1 = __importDefault(require("@/models/chatModel"));
require("@/models/userModel");
require("@/models/chatModel");
require("@/models/msgModel");
async function GET(req) {
    await (0, dbConfig_1.connect)();
    // ✅ Verify token
    const { user, error, status } = await (0, authMiddleware_1.verifyToken)(req);
    if (error) {
        return server_1.NextResponse.json({ error }, { status });
    }
    if (!user || !user.id) {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        // ✅ Find all chats where the user is a participant
        const chats = await chatModel_1.default.find({
            participants: { $in: [user.id] },
        })
            .populate("participants", "username profilePic email")
            .populate({
            path: "latestMessage",
            populate: { path: "sender", select: "username profilePic email" },
        })
            .sort({ updatedAt: -1 });
        return server_1.NextResponse.json(chats, { status: 200 });
    }
    catch (err) {
        console.error(err);
        return server_1.NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
