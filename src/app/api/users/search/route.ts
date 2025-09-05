import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig"; 
import User from "@/models/userModel";
import mongoose from "mongoose";
import { verifyToken } from "@/middlewares/authMiddleware";

export async function GET(req: Request) {
  await connect();

  const { user, error, status } = await verifyToken(req);
  if (error || !user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const users = await User.find({
      _id: { $ne: new mongoose.Types.ObjectId(user.id) }, // ✅ exclude current user
      $or: [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("_id username email profilePic")
      .limit(10);

    return NextResponse.json(users, { status: 200 });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
