import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";

import { verifyToken } from "@/middlewares/authMiddleware";

import Chat from "@/models/chatModel";
import "@/models/userModel";
import "@/models/chatModel";
import "@/models/msgModel";

export async function GET(req: Request) {
  await connect();

  // ✅ Verify token
  const { user, error, status } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error }, { status });
  }
if (!user || !user.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
  try {
    // ✅ Find all chats where the user is a participant
    
   const chats = await Chat.find({
  participants: { $in: [user.id] },
})
  .populate("participants", "username profilePic email")
  .populate({
    path: "latestMessage",
    populate: { path: "sender", select: "username profilePic email" },
  })
  .sort({ updatedAt: -1 });

    return NextResponse.json(chats, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
