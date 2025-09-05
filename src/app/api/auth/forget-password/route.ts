import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import crypto from "crypto";
import sendEmail from "@/utils/sendEmail";

export async function POST(req: Request) {
  try {
    await connect();
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "If email exists, link sent" }); // don’t reveal
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 1000 * 60 * 15; // 15 min

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&id=${user._id}`;

    await sendEmail(
      user.email,
      "Password Reset",
      resetUrl
    );

    return NextResponse.json({ message: "Reset link sent if email exists" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
