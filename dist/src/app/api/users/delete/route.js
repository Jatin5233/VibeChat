"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = DELETE;
// src/app/api/users/delete/route.ts
const server_1 = require("next/server");
const headers_1 = require("next/headers");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dbConfig_1 = require("@/dbConfig/dbConfig");
const userModel_1 = __importDefault(require("@/models/userModel"));
const chatModel_1 = __importDefault(require("@/models/chatModel"));
const msgModel_1 = __importDefault(require("@/models/msgModel"));
async function DELETE(req) {
    try {
        await (0, dbConfig_1.connect)();
        const cookieStore = await (0, headers_1.cookies)();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) {
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch {
            return server_1.NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
        }
        const userId = decoded.id;
        // 1️⃣ Delete all messages from this user
        await msgModel_1.default.deleteMany({ sender: userId });
        // 2️⃣ Handle chats
        const chats = await chatModel_1.default.find({ participants: userId });
        for (const chat of chats) {
            if (chat.isGroupChat) {
                // remove user from group participants
                chat.participants = chat.participants.filter((p) => p.toString() !== userId.toString());
                await chat.save();
            }
            else {
                // delete one-to-one chat completely
                await chatModel_1.default.findByIdAndDelete(chat._id);
            }
        }
        // 3️⃣ Delete user
        await userModel_1.default.findByIdAndDelete(userId);
        return server_1.NextResponse.json({ success: true, userId }, { status: 200 });
    }
    catch (err) {
        console.error("❌ Delete account error:", err);
        return server_1.NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
