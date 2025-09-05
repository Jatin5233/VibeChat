"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const dbConfig_1 = require("@/dbConfig/dbConfig");
const userModel_1 = __importDefault(require("@/models/userModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const authMiddleware_1 = require("@/middlewares/authMiddleware");
async function GET(req) {
    await (0, dbConfig_1.connect)();
    const { user, error, status } = await (0, authMiddleware_1.verifyToken)(req);
    if (error || !user?.id) {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: status || 401 });
    }
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    if (!q.trim()) {
        return server_1.NextResponse.json([], { status: 200 });
    }
    try {
        const users = await userModel_1.default.find({
            _id: { $ne: new mongoose_1.default.Types.ObjectId(user.id) }, // ✅ exclude current user
            $or: [
                { username: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
            ],
        })
            .select("_id username email profilePic")
            .limit(10);
        return server_1.NextResponse.json(users, { status: 200 });
    }
    catch (err) {
        console.error("Search API error:", err);
        return server_1.NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
