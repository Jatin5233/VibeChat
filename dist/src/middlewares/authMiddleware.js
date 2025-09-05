"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const headers_1 = require("next/headers");
async function verifyToken(req) {
    try {
        const cookieStore = await (0, headers_1.cookies)();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) {
            return { error: "No token found", status: 401 };
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return { user: decoded, error: null, status: 200 };
    }
    catch (err) {
        return { error: "Invalid token", status: 401 };
    }
}
