import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connect();
    const { token, id, password } = await req.json();

    if (!token || !id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (
      !user.resetPasswordToken ||
      user.resetPasswordToken !== token ||
      user.resetPasswordExpire < Date.now()
    ) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return NextResponse.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
