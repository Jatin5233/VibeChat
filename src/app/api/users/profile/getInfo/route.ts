// src/app/api/user/profile/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { verifyToken } from "@/utils/verifyToken";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    await connect();

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const user = await User.findById(decoded.id).select(
      "_id username email profilePic createdAt updatedAt"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

