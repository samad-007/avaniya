import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  userId: string;
  scope: "commercial" | "personal";
  transactionType: "outflow" | "deal_inflow" | "capital_inflow" | "transfer";
  transCode?: string;
  propertyId?: string;
  propertyCode?: string;
  date: Date;
  category: string;
  mode: "Bank" | "Cash";
  transferType?:
    | "Bank Withdrawal to Cash"
    | "Cash Deposit to Bank"
    | "Cash to Bank"
    | "Bank to Cash";
  amount: number;
  recipientOrSource?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: String, required: true, index: true },
    scope: {
      type: String,
      enum: ["commercial", "personal"],
      required: true,
      index: true,
    },
    transactionType: {
      type: String,
      enum: ["outflow", "deal_inflow", "capital_inflow", "transfer"],
      required: true,
      index: true,
    },
    transCode: { type: String },
    propertyId: { type: String, index: true },
    propertyCode: { type: String, index: true },
    date: { type: Date, required: true, default: Date.now, index: true },
    category: { type: String, required: true, index: true },
    mode: { type: String, enum: ["Bank", "Cash"], required: true },
    transferType: {
      type: String,
      enum: [
        "Bank Withdrawal to Cash",
        "Cash Deposit to Bank",
        "Cash to Bank",
        "Bank to Cash",
      ],
    },
    amount: { type: Number, required: true },
    recipientOrSource: { type: String },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
