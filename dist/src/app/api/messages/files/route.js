"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const headers_1 = require("next/headers");
const dbConfig_1 = require("@/dbConfig/dbConfig");
const msgModel_1 = __importDefault(require("@/models/msgModel"));
const chatModel_1 = __importDefault(require("@/models/chatModel"));
const verifyToken_1 = require("@/utils/verifyToken");
const cloudConfig_1 = __importDefault(require("@/utils/cloudConfig"));
const server_2 = require("backend/server");
async function POST(req) {
    try {
        console.log("🔄 File upload request received");
        await (0, dbConfig_1.connect)();
        const cookieStore = await (0, headers_1.cookies)();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) {
            console.error("❌ No access token found");
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const decoded = (0, verifyToken_1.verifyToken)(token);
        if (!decoded) {
            console.error("❌ Invalid token");
            return server_1.NextResponse.json({ error: "Invalid token" }, { status: 403 });
        }
        console.log("✅ User authenticated:", decoded.id);
        const formData = await req.formData();
        const file = formData.get("file");
        const chatId = formData.get("chatId");
        console.log("📎 File details:", {
            name: file?.name,
            type: file?.type,
            size: file?.size,
            chatId: chatId
        });
        if (!file || !chatId) {
            console.error("❌ Missing file or chatId");
            return server_1.NextResponse.json({ error: "File and chatId required" }, { status: 400 });
        }
        // Convert file → buffer
        console.log("🔄 Converting file to buffer...");
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log("✅ Buffer created, size:", buffer.length);
        let resourceType = "raw";
        const mimeType = file.type;
        if (mimeType.startsWith("image/")) {
            resourceType = "image";
        }
        else if (mimeType.startsWith("video/")) {
            resourceType = "video";
        }
        else {
            resourceType = "raw";
        }
        console.log(`🔄 Uploading as ${resourceType} type for MIME: ${mimeType}`);
        // ✅ Fixed upload configuration for raw files
        const uploadRes = await new Promise((resolve, reject) => {
            const uploadConfig = {
                resource_type: resourceType,
                folder: "chat-files",
                use_filename: true,
                unique_filename: false,
                ...(resourceType === "raw" && {
                    format: file.name.split('.').pop(),
                })
            };
            console.log("📤 Cloudinary upload config:", uploadConfig);
            cloudConfig_1.default.uploader
                .upload_stream(uploadConfig, (err, result) => {
                if (err) {
                    console.error("❌ Cloudinary upload error:", err);
                    reject(err);
                }
                else {
                    console.log("✅ Cloudinary upload success:", {
                        url: result?.secure_url,
                        public_id: result?.public_id,
                        resource_type: result?.resource_type
                    });
                    resolve(result);
                }
            })
                .end(buffer);
        });
        console.log("🔄 Creating message in database...");
        // ✅ Store complete file information
        let message = await msgModel_1.default.create({
            chat: chatId,
            sender: decoded.id,
            content: file.name, // ✅ Store filename as content for file messages
            attachments: [
                {
                    url: uploadRes.secure_url,
                    type: mimeType,
                    public_id: uploadRes.public_id,
                    resource_type: uploadRes.resource_type,
                    filename: file.name, // ✅ Original filename
                    fileSize: file.size, // ✅ File size in bytes
                },
            ],
        });
        console.log("✅ Message created:", message._id);
        message = await message.populate("sender", "username profilePic");
        message = await message.populate({
            path: "chat",
            populate: { path: "participants", select: "username profilePic email" },
        });
        console.log("✅ Message populated");
        await chatModel_1.default.findByIdAndUpdate(chatId, { latestMessage: message._id });
        console.log("✅ Chat updated with latest message");
        // Emit to socket
        server_2.io.to(chatId.toString()).emit("receive_message", message);
        console.log("🔔 Socket event emitted to room:", chatId);
        return server_1.NextResponse.json({ message }, { status: 201 });
    }
    catch (err) {
        console.error("❌ File upload error:", err);
        return server_1.NextResponse.json({
            error: "Server error",
            details: err instanceof Error ? err.message : "Unknown error"
        }, { status: 500 });
    }
}
