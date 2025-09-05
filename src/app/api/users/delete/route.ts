// src/app/api/users/delete/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Chat from "@/models/chatModel";
import Message from "@/models/msgModel";

export async function DELETE(req: Request) {
  try {
    await connect();

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
    }

    const userId = decoded.id;

    // 1️⃣ Delete all messages from this user
    await Message.deleteMany({ sender: userId });

    // 2️⃣ Handle chats
    const chats = await Chat.find({ participants: userId });

    for (const chat of chats) {
      if (chat.isGroupChat) {
        // remove user from group participants
        chat.participants = chat.participants.filter(
          (p: any) => p.toString() !== userId.toString()
        );
        await chat.save();
      } else {
        // delete one-to-one chat completely
        await Chat.findByIdAndDelete(chat._id);
      }
    }

    // 3️⃣ Delete user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true, userId }, { status: 200 });
  } catch (err) {
    console.error("❌ Delete account error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
