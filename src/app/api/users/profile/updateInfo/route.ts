import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

export async function PUT(req: Request) {
  try {
    await connect();

    // ✅ Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
    }

    const body = await req.json();
    const { username, email } = body;

    if (!username && !email) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    // ✅ Update user info in DB
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { $set: { username, email } },
      { new: true, runValidators: true }
    ).select("_id username email profilePic");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
