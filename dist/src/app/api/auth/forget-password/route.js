"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const dbConfig_1 = require("@/dbConfig/dbConfig");
const userModel_1 = __importDefault(require("@/models/userModel"));
const crypto_1 = __importDefault(require("crypto"));
const sendEmail_1 = __importDefault(require("@/utils/sendEmail"));
async function POST(req) {
    try {
        await (0, dbConfig_1.connect)();
        const { email } = await req.json();
        if (!email)
            return server_1.NextResponse.json({ error: "Email required" }, { status: 400 });
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            return server_1.NextResponse.json({ message: "If email exists, link sent" }); // don’t reveal
        }
        // Generate token
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetTokenExpiry = Date.now() + 1000 * 60 * 15; // 15 min
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&id=${user._id}`;
        await (0, sendEmail_1.default)(user.email, "Password Reset", resetUrl);
        return server_1.NextResponse.json({ message: "Reset link sent if email exists" });
    }
    catch (err) {
        console.error("Forgot password error:", err);
        return server_1.NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
