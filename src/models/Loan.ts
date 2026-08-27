import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILoan extends Document {
  userId: string;
  datasetId?: string;
  scope: "commercial" | "personal";
  loanCode: string;
  lenderName: string;
  lenderType: "bank" | "family_friend" | "private_financier" | "other";
  principalAmount: number;
  interestRatePct?: number;
  profitSharePct?: number;
  profitShareTerms?: string;
  startDate: Date;
  endDate?: Date;
  tenureMonths?: number;
  linkedPropertyCode?: string;
  status: "active" | "closed" | "defaulted";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>(
  {
    userId: { type: String, required: true, index: true },
    datasetId: { type: String, default: "", index: true },
    scope: {
      type: String,
      enum: ["commercial", "personal"],
      required: true,
      default: "commercial",
      index: true,
    },
    loanCode: { type: String, required: true, index: true },
    lenderName: { type: String, required: true, index: true },
    lenderType: {
      type: String,
      enum: ["bank", "family_friend", "private_financier", "other"],
      required: true,
      default: "bank",
    },
    principalAmount: { type: Number, required: true },
    interestRatePct: { type: Number, default: 0 },
    profitSharePct: { type: Number, default: 0 },
    profitShareTerms: { type: String, default: "" },
    startDate: { type: Date, required: true, default: Date.now, index: true },
    endDate: { type: Date },
    tenureMonths: { type: Number, default: 12 },
    linkedPropertyCode: { type: String, default: "", index: true },
    status: {
      type: String,
      enum: ["active", "closed", "defaulted"],
      default: "active",
      index: true,
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

LoanSchema.index({ datasetId: 1, status: 1, startDate: -1 });
LoanSchema.index({ datasetId: 1, loanCode: 1 });

export const Loan: Model<ILoan> =
  mongoose.models.Loan || mongoose.model<ILoan>("Loan", LoanSchema);
