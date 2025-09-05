import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Message from "@/models/msgModel";
import Chat from "@/models/chatModel";
import { verifyToken } from "@/utils/verifyToken";
import { cookies } from "next/headers";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const { id: messageId } = await context.params;
    if (!messageId) {
      return NextResponse.json({ error: "Message ID required" }, { status: 400 });
    }

    // Find message
    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check ownership
    if (message.sender.toString() !== decoded.id.toString()) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    const chatId = message.chat.toString();
    console.log("🗑️ Deleting message:", messageId, "from chat:", chatId);

    // Delete the message
    await message.deleteOne();

    // If this was the latestMessage, clear it
    const chat = await Chat.findById(message.chat);
    if (chat?.latestMessage?.toString() === messageId) {
      chat.latestMessage = null;
      await chat.save();
      console.log("🔄 Cleared latest message from chat");
    }

    // ❌ REMOVE SOCKET EMISSION FROM API ROUTE
    // The client will handle socket emission
    
    console.log("✅ Message deleted successfully from database");

    return NextResponse.json({ 
      success: true, 
      message: "Message deleted successfully",
      chatId: chatId,
      messageId: messageId
    }, { status: 200 });
    
  } catch (err) {
    console.error("❌ Delete error:", err);
    return NextResponse.json({ 
      error: "Server error", 
      details: err instanceof Error ? err.message : "Unknown error" 
    }, { status: 500 });
  }
}


export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

   const { id: messageId } = await context.params;
    const body = await req.json();
    const { content } = body;

    if (!messageId || !content) {
      return NextResponse.json(
        { error: "Message ID and new content required" },
        { status: 400 }
      );
    }

    // Find the message
    const message = await Message.findById(messageId)
    .populate("sender", "username profilePic")
    .populate("chat");
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Ownership check
   
const senderId =
  typeof message.sender === "object" && message.sender?._id
    ? message.sender._id.toString()
    : message.sender.toString();

if (senderId !== decoded.id.toString()) {
  return NextResponse.json({ error: "Not allowed" }, { status: 403 });
}


    // Update
    message.content = content;
    await message.save();

    // If this was the latestMessage, update chat as well
    const chat = await Chat.findById(message.chat);
    if (chat?.latestMessage?.toString() === messageId) {
      chat.latestMessage = messageId;
      await chat.save();
    }

    // Emit event to room
    const chatId = message.chat._id.toString();
    console.log("✏️ Message edited:", messageId, "in chat:", chatId);

    return NextResponse.json({ success: true, message }, { status: 200 });
  } catch (err) {
    console.error("❌ Edit error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
