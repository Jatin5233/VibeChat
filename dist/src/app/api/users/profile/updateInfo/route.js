"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
const server_1 = require("next/server");
const headers_1 = require("next/headers");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("@/models/userModel"));
const dbConfig_1 = require("@/dbConfig/dbConfig");
async function PUT(req) {
    try {
        await (0, dbConfig_1.connect)();
        // ✅ Get token from cookies
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
        const body = await req.json();
        const { username, email } = body;
        if (!username && !email) {
            return server_1.NextResponse.json({ error: "Nothing to update" }, { status: 400 });
        }
        // ✅ Update user info in DB
        const updatedUser = await userModel_1.default.findByIdAndUpdate(decoded.id, { $set: { username, email } }, { new: true, runValidators: true }).select("_id username email profilePic");
        if (!updatedUser) {
            return server_1.NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return server_1.NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
    }
    catch (error) {
        console.error("Update user error:", error);
        return server_1.NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
