"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
// src/app/api/user/profile/route.ts
const server_1 = require("next/server");
const dbConfig_1 = require("@/dbConfig/dbConfig");
const userModel_1 = __importDefault(require("@/models/userModel"));
const verifyToken_1 = require("@/utils/verifyToken");
const headers_1 = require("next/headers");
async function GET(req) {
    try {
        await (0, dbConfig_1.connect)();
        const cookieStore = await (0, headers_1.cookies)();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) {
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const decoded = (0, verifyToken_1.verifyToken)(token);
        if (!decoded || !decoded.id) {
            return server_1.NextResponse.json({ error: "Invalid token" }, { status: 403 });
        }
        const user = await userModel_1.default.findById(decoded.id).select("_id username email profilePic createdAt updatedAt");
        if (!user) {
            return server_1.NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return server_1.NextResponse.json({ user }, { status: 200 });
    }
    catch (err) {
        console.error("❌ Error fetching profile:", err);
        return server_1.NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
