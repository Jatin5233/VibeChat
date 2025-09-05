import mongoose from "mongoose";
import User from "@/models/userModel";
import Chat from "@/models/chatModel";
import Message from "@/models/msgModel";

export async function connect() {
  if (mongoose.connection.readyState >= 1) return; // prevent multiple connects

  try {
    await mongoose.connect(process.env.MONGO_URL!);

    const connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("✅ Mongo Connected Successfully");
    });
    connection.on("error", (e) => {
      console.error("❌ MongoDB error:", e);
      process.exit(1);
    });
  } catch (e) {
    console.error("❌ Connection error:", e);
  }
}
