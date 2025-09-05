"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const authMiddleware_1 = require("@/middlewares/authMiddleware");
const dbConfig_1 = require("@/dbConfig/dbConfig");
const userModel_1 = __importDefault(require("@/models/userModel"));
async function GET(req) {
    await (0, dbConfig_1.connect)();
    const { user, error, status } = await (0, authMiddleware_1.verifyToken)(req);
    if (error)
        return server_1.NextResponse.json({ error }, { status });
    if (!user || !user.id) {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const currentUser = await userModel_1.default.findById(user.id).select("_id username email profilePic theme");
        console.log("Fetched user:", currentUser);
        if (!currentUser) {
            return server_1.NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return server_1.NextResponse.json({ user: currentUser }, { status: 200 });
    }
    catch (err) {
        console.error("Error fetching current user:", err);
        return server_1.NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
