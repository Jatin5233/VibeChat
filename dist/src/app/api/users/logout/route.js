"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
async function GET() {
    try {
        // Create a response object
        const response = server_1.NextResponse.json({
            message: "Logout successful",
            success: true,
        }, { status: 200 });
        // Clear the access token cookie by setting an expired date
        response.cookies.set("accessToken", "", {
            httpOnly: true,
            expires: new Date(0), // Set expiration to a past date
        });
        return response;
    }
    catch (error) {
        console.error("❌ Logout error:", error);
        return server_1.NextResponse.json({ error: error.message }, { status: 500 });
    }
}
