"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const headers_1 = require("next/headers");
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
async function POST() {
    const cookieStore = await (0, headers_1.cookies)();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    if (!refreshToken) {
        return server_1.NextResponse.json({ message: "No refresh token" }, { status: 401 });
    }
    try {
        // Verify refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET // match login route
        );
        // Issue NEW access token with access token secret
        const newAccessToken = jsonwebtoken_1.default.sign({ id: decoded.id }, process.env.JWT_SECRET, // match login route access token secret
        { expiresIn: "15m" });
        const res = server_1.NextResponse.json({ message: "Token refreshed" });
        res.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 60 * 15,
            path: "/",
        });
        return res;
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.TokenExpiredError) {
            return server_1.NextResponse.json({ message: "Refresh token expired" }, { status: 401 });
        }
        return server_1.NextResponse.json({ message: "Invalid refresh token" }, { status: 403 });
    }
}
