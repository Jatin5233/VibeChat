import mongoose, { Schema, Document } from "mongoose";

export interface IAttachment {
  url: string;
  type: string;
  public_id: string;
  resource_type?: string;
  filename?: string;
  fileSize?: number;
}

export interface IReadBy {
  user: mongoose.Types.ObjectId;
  readAt: Date;
}

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  chat: mongoose.Types.ObjectId;
  content?: string;
  attachments?: IAttachment[];
  readBy?: IReadBy[]; // Add this to interface
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema(
  {
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true 
    },
    content: { 
      type: String, 
      trim: true 
    },
    chat: { 
      type: mongoose.Schema.Types.ObjectId, 
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
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User",
          required: true 
        },
        readAt: { 
          type: Date, 
          default: Date.now 
        }
      }
    ],
  },
  { timestamps: true }
);

// Add indexes for better query performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ 'readBy.user': 1 });

const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default Message;