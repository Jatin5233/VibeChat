
import { NextResponse } from "next/server";
import { verifyToken } from "@/middlewares/authMiddleware";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

export async function GET(req: Request) {
  await connect();

  const { user, error, status } = await verifyToken(req);
  
  if (error) return NextResponse.json({ error }, { status });
if (!user || !user.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
  try {
    const currentUser = await User.findById(user.id).select("_id username email profilePic theme");
    console.log("Fetched user:", currentUser);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user: currentUser }, { status: 200 });
  } catch (err) {
    console.error("Error fetching current user:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
