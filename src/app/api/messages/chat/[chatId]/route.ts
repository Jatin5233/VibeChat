import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Message from "@/models/msgModel";


export async function GET(
  req: Request,
  context: { params: Promise<{ chatId: string }> }
) {
  try {
    await connect();
     const { chatId } = await context.params; 

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username profilePic")
      .populate("chat")
      .sort({ createdAt: 1 }); // oldest first

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "Server error while fetching messages" },
      { status: 500 }
    );
  }
}
