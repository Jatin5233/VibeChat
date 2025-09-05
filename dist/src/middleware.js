"use strict";
// middleware.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.middleware = middleware;
const server_1 = require("next/server");
const jose_1 = require("jose");
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
async function middleware(request) {
    // Get both tokens from cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    // Let users access login/signup pages
    if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')) {
        return server_1.NextResponse.next();
    }
    // 1. If there's no access token, check for a refresh token
    if (!accessToken) {
        // If there's no refresh token either, the user is not logged in
        if (!refreshToken) {
            return server_1.NextResponse.redirect(new URL('/login', request.url));
        }
        // If there is a refresh token, we trust the client to handle the refresh.
        // Allow the request to proceed.
        return server_1.NextResponse.next();
    }
    // 2. If there is an access token, verify it
    try {
        // This will throw an error if the token is invalid or expired
        await (0, jose_1.jwtVerify)(accessToken, JWT_SECRET);
        // Token is valid, let the request pass
        return server_1.NextResponse.next();
    }
    catch (error) {
        // 3. Token is invalid/expired. This is the crucial part.
        // DO NOT redirect yet. Check for the refresh token.
        if (!refreshToken) {
            // No refresh token, so the session is truly dead. Redirect to login.
            return server_1.NextResponse.redirect(new URL('/login', request.url));
        }
        // The access token is expired, but a refresh token exists.
        // We allow the user to proceed to the page. The client-side logic
        // will then handle the token refresh.
        return server_1.NextResponse.next();
    }
}
// Configure which routes the middleware should run on
exports.config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
