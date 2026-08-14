import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: "super_admin" | "admin" | "user";
  datasetId: string;
  status: "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "admin", "user"],
      default: "user",
    },
    datasetId: { type: String, default: "", index: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
