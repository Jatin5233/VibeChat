import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/userModel"; // adjust path to your user model
import {connect} from "@/dbConfig/dbConfig"; // adjust path to your DB connection

export async function POST(req: Request) {
  try {
    await connect();

    // Get and check auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "You need to be logged in" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    // Parse FormData
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // Convert File to Buffer for DB storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save in database
    await User.findByIdAndUpdate(decoded.id, { profilePic: buffer });

    return NextResponse.json({ message: "Profile picture saved successfully" }, { status: 200 });

  } catch (error) {
    console.error("Profile upload error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
