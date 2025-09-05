"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        trim: true
    },
    chat: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    },
    attachments: [
        {
            url: { type: String, required: true },
            type: { type: String, required: true },
            public_id: { type: String, required: true },
            resource_type: { type: String },
            filename: { type: String },
            fileSize: { type: Number },
        },
    ],
    readBy: [
        {
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            readAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
}, { timestamps: true });
// Add indexes for better query performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ 'readBy.user': 1 });
const Message = mongoose_1.default.models.Message || mongoose_1.default.model("Message", messageSchema);
exports.default = Message;
