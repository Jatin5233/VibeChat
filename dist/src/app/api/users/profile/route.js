"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const headers_1 = require("next/headers");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const userModel_1 = __importDefault(require("@/models/userModel"));
const dbConfig_1 = require("@/dbConfig/dbConfig");
// ✅ Configure Cloudinary
cloudinary_1.default.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
async function POST(req) {
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
        // ✅ Parse FormData
        const formData = await req.formData();
        const file = formData.get("image"); // ✨ CHANGED: Allow file to be null
        let imageUrl;
        let message;
        // ✨ NEW: Logic to handle both upload and skip scenarios
        if (file) {
            // --- If a file is provided, upload it ---
            // Convert File to Buffer
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            // Upload to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary_1.default.v2.uploader.upload_stream({ folder: "profile_pics" }, (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
                stream.end(buffer);
            });
            imageUrl = uploadResult.secure_url;
            message = "Profile picture saved successfully";
        }
        else {
            // --- If no file is provided (user clicked "skip"), set a default image ---
            // You can replace this URL with your own default image
            imageUrl = "https://res.cloudinary.com/dkuuvfxsj/image/upload/v1756368551/download_wfg1go.png";
            message = "Skipped. Default profile picture set.";
        }
        // ✅ Save the URL (either Cloudinary or default) to the DB
        await userModel_1.default.findByIdAndUpdate(decoded.id, { profilePic: imageUrl }); // ✨ CHANGED: Consolidated DB update
        // ✅ Return a successful response
        return server_1.NextResponse.json({ message, url: imageUrl }, // ✨ CHANGED: Consolidated success response
        { status: 200 });
    }
    catch (error) {
        console.error("Profile setup error:", error); // ✨ CHANGED: More generic error message
        return server_1.NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
