import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAccountBalance extends Document {
  userId: string;
  name: string;
  type: "bank" | "deposit" | "cash" | "investment";
  balance: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountBalanceSchema = new Schema<IAccountBalance>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["bank", "deposit", "cash", "investment"],
      required: true,
      default: "bank",
    },
    balance: { type: Number, required: true, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

export const AccountBalance: Model<IAccountBalance> =
  mongoose.models.AccountBalance ||
  mongoose.model<IAccountBalance>("AccountBalance", AccountBalanceSchema);
