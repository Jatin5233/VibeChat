"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const dbConfig_1 = require("@/dbConfig/dbConfig");
const userModel_1 = __importDefault(require("@/models/userModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function POST(req) {
    try {
        await (0, dbConfig_1.connect)();
        const { token, id, password } = await req.json();
        if (!token || !id) {
            return server_1.NextResponse.json({ error: "Invalid token" }, { status: 400 });
        }
        const user = await userModel_1.default.findById(id);
        if (!user)
            return server_1.NextResponse.json({ error: "User not found" }, { status: 404 });
        if (!user.resetPasswordToken ||
            user.resetPasswordToken !== token ||
            user.resetPasswordExpire < Date.now()) {
            return server_1.NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }
        user.password = await bcryptjs_1.default.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return server_1.NextResponse.json({ message: "Password reset successful" });
    }
    catch (err) {
        console.error("Reset error:", err);
        return server_1.NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
