// src/app/api/users/theme/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { verifyToken } from "@/utils/verifyToken";

export async function PUT(req: Request) {
  try {
    await connect();

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const { theme } = await req.json();
    if (!theme) return NextResponse.json({ error: "Theme is required" }, { status: 400 });

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { theme },
      { new: true }
    ).select("_id username email theme");

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("Theme update error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
