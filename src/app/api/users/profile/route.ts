import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

// ✅ Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
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

    // ✅ Parse FormData
    const formData = await req.formData();
    const file = formData.get("image") as File | null; // ✨ CHANGED: Allow file to be null

    let imageUrl: string;
    let message: string;

    // ✨ NEW: Logic to handle both upload and skip scenarios
    if (file) {
      // --- If a file is provided, upload it ---
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder: "profile_pics" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      imageUrl = uploadResult.secure_url;
      message = "Profile picture saved successfully";
    } else {
      // --- If no file is provided (user clicked "skip"), set a default image ---
      // You can replace this URL with your own default image
      imageUrl = "https://res.cloudinary.com/dkuuvfxsj/image/upload/v1756368551/download_wfg1go.png";
      message = "Skipped. Default profile picture set.";
    }

    // ✅ Save the URL (either Cloudinary or default) to the DB
    await User.findByIdAndUpdate(decoded.id, { profilePic: imageUrl }); // ✨ CHANGED: Consolidated DB update

    // ✅ Return a successful response
    return NextResponse.json(
      { message, url: imageUrl }, // ✨ CHANGED: Consolidated success response
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile setup error:", error); // ✨ CHANGED: More generic error message
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}