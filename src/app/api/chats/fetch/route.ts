// src/app/api/chats/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Chat from "@/models/chatModel";
import { verifyToken } from "@/middlewares/authMiddleware";

export async function POST(req: Request) {
  await connect();

  const { user, error, status } = await verifyToken(req);
  if (error) return NextResponse.json({ error }, { status });
if (!user || !user.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "UserId is required" }, { status: 400 });
  }

  try {
    // Check if chat exists
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [user.id, userId] },
    })
      .populate("participants", "username profilePic email")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "username profilePic email" },
      });

    // If not, create one
    if (!chat) {
      chat = await Chat.create({
        isGroupChat: false,
        participants: [user.id, userId],
      });
    }

    // Populate again before sending
    chat = await Chat.findById(chat._id)
      .populate("participants", "username profilePic email")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "username profilePic email" },
      });

    return NextResponse.json(chat, { status: 200 });
  } catch (err) {
    console.error("Error creating/fetching chat:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
