"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const dbConfig_1 = require("@/dbConfig/dbConfig");
const userModel_1 = __importDefault(require("@/models/userModel"));
const server_1 = require("next/server");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function POST(req) {
    try {
        const { username, email, password } = await req.json();
        if (!username || !email || !password) {
            return server_1.NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }
        await (0, dbConfig_1.connect)();
        const existingUser = await userModel_1.default.findOne({ email });
        if (existingUser) {
            return server_1.NextResponse.json({ message: "Email already registered" }, { status: 409 });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const newUser = await userModel_1.default.create({
            username,
            email,
            password: hashedPassword,
        });
        return server_1.NextResponse.json({ message: "User created successfully", userId: newUser._id }, { status: 201 });
    }
    catch (error) {
        console.error(error);
        return server_1.NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
