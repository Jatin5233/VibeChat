"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dbConfig_1 = require("@/dbConfig/dbConfig");
const userModel_1 = __importDefault(require("@/models/userModel"));
async function POST(req) {
    await (0, dbConfig_1.connect)();
    try {
        const { email, password } = await req.json();
        if (!email || !password) {
            return server_1.NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            return server_1.NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return server_1.NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }
        // Generate tokens
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
        console.log("ACCESS TOKEN:", accessToken);
        console.log("REFRESH TOKEN:", refreshToken);
        console.log("ACCESS SECRET:", process.env.JWT_SECRET);
        console.log("REFRESH SECRET:", process.env.JWT_REFRESH_SECRET);
        // Prepare response
        const res = server_1.NextResponse.json({
            message: "Login successful",
            hasProfilePic: !!user.profilePic,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        }, { status: 200 });
        // Set HTTP-only cookies
        res.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 60 * 15, // 15 minutes
            path: "/",
        });
        res.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });
        return res;
    }
    catch (error) {
        console.error(error);
        return server_1.NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
