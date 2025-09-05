import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "./src/models/msgModel"; // adjust path if different

dotenv.config();

async function clearMessages() {
  try {
    await mongoose.connect(process.env.MONGO_URL!);
    const result = await Message.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} messages`);
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error deleting messages:", err);
    process.exit(1);
  }
}

clearMessages();
