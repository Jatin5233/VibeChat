// src/app/api/users/search/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig"; 
import User from "@/models/userModel";
import mongoose from "mongoose"

export async function GET(req: Request) {
  await connect();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const excludeId = searchParams.get("excludeId");

  // If no query, return empty list
  if (!q.trim()) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const filter: any = {};
 if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
    filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
  }

const users = await User.find({
  ...filter,
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
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

