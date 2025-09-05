"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
// src/app/api/users/theme/route.ts
const server_1 = require("next/server");
const headers_1 = require("next/headers");
const dbConfig_1 = require("@/dbConfig/dbConfig");
const userModel_1 = __importDefault(require("@/models/userModel"));
const verifyToken_1 = require("@/utils/verifyToken");
async function PUT(req) {
    try {
        await (0, dbConfig_1.connect)();
        const cookieStore = await (0, headers_1.cookies)();
        const token = cookieStore.get("accessToken")?.value;
        if (!token)
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const decoded = (0, verifyToken_1.verifyToken)(token);
        if (!decoded)
            return server_1.NextResponse.json({ error: "Invalid token" }, { status: 403 });
        const { theme } = await req.json();
        if (!theme)
            return server_1.NextResponse.json({ error: "Theme is required" }, { status: 400 });
        const user = await userModel_1.default.findByIdAndUpdate(decoded.id, { theme }, { new: true }).select("_id username email theme");
        return server_1.NextResponse.json({ user }, { status: 200 });
    }
    catch (err) {
        console.error("Theme update error:", err);
        return server_1.NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
