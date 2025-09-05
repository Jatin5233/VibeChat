import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connect } from "@/dbConfig/dbConfig";
import Message from "@/models/msgModel";
import Chat from "@/models/chatModel";
import { verifyToken } from "@/utils/verifyToken";

export async function POST(req: Request) {
  try {
    await connect();

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    // ✅ Parse JSON body
    const { content, chatId, receiverId } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    let chat;

    if (chatId) {
      // Existing chat
      chat = await Chat.findById(chatId);
      if (!chat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }
    } else {
      // ✅ Auto-create chat if none exists
      if (!receiverId) {
        return NextResponse.json({ error: "receiverId required to start new chat" }, { status: 400 });
      }

      chat = await Chat.findOne({
        isGroupChat: false,
        participants: { $all: [decoded.id, receiverId], $size: 2 },
      });

      if (!chat) {
        chat = await Chat.create({
          participants: [decoded.id, receiverId],
          isGroupChat: false,
        });
      }
    }

    // ✅ Create message
    let message = await Message.create({
      chat: chat._id,
      sender: decoded.id,
      content,
    });

    message = await message.populate("sender", "username profilePic");
    message = await message.populate({
      path: "chat",
      populate: { path: "participants", select: "username profilePic email" },
    });

    await Chat.findByIdAndUpdate(chat._id, { latestMessage: message._id });

    // ✅ No socket emission here — client will handle it
    return NextResponse.json({ message, chat }, { status: 201 });

  } catch (err) {
    console.error("Message send error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
