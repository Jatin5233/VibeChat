import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  profilePic?: string;
  refreshToken?: string; // JWT refresh token storage
  groupsAdmin: mongoose.Types.ObjectId[]; // Groups where user is admin
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  theme: "midnight" | "ocean" | "sunset" | "forest" | "galactic" | "cyberpunk";
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    refreshToken: { type: String },
    groupsAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    theme: {
      type: String,
      enum: ["midnight", "ocean", "sunset", "forest", "galactic", "cyberpunk"],
      default: "midnight",
    },
  },

  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;