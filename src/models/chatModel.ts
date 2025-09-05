import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  chatName?: string; // For group chats
  isGroupChat: boolean;
  participants: mongoose.Types.ObjectId[]; // User IDs
  groupAdmin?: mongoose.Types.ObjectId; // For group chat admin
  latestMessage?: mongoose.Types.ObjectId; // Last message reference
  groupPic?: string; // Optional group profile picture
   unreadCounts: {
    user: mongoose.Types.ObjectId;
    count: number;
  }[];
}

const ChatSchema = new Schema<IChat>(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    groupPic: { type: String },
    unreadCounts: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 0 }
      }
    ],
  },
  { timestamps: true }
);

const Chat = mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
export default Chat;
