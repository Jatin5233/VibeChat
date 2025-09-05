"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const dbConfig_1 = require("@/dbConfig/dbConfig");
const msgModel_1 = __importDefault(require("@/models/msgModel"));
async function GET(req, context) {
    try {
        await (0, dbConfig_1.connect)();
        const { chatId } = await context.params;
        const messages = await msgModel_1.default.find({ chat: chatId })
            .populate("sender", "username profilePic")
            .populate("chat")
            .sort({ createdAt: 1 }); // oldest first
        return server_1.NextResponse.json(messages);
    }
    catch (error) {
        console.error("Error fetching messages:", error);
        return server_1.NextResponse.json({ message: "Server error while fetching messages" }, { status: 500 });
    }
}
