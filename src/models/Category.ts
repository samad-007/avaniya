import mongoose, { Schema, Document, Model } from "mongoose";

export type FinancialRole =
  | "purchase_principal"
  | "property_expense"
  | "sale_receipt"
  | "capital_infusion"
  | "internal_transfer"
  | "personal_milestone"
  | "personal_overhead";

export interface ICategory extends Document {
  userId: string;
  datasetId?: string;
  scope: "commercial" | "personal" | "both";
  name: string;
  type: "outflow" | "inflow" | "transfer";
  financialRole: FinancialRole;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: { type: String, required: true, index: true },
    datasetId: { type: String, default: "", index: true },
    scope: {
      type: String,
      enum: ["commercial", "personal", "both"],
      required: true,
      default: "both",
    },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["outflow", "inflow", "transfer"],
      required: true,
    },
    financialRole: {
      type: String,
      enum: [
        "purchase_principal",
        "property_expense",
        "sale_receipt",
        "capital_infusion",
        "internal_transfer",
        "personal_milestone",
        "personal_overhead",
      ],
      required: true,
      default: "property_expense",
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CategorySchema.index({ userId: 1, name: 1, scope: 1, datasetId: 1 }, { unique: true });

export const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
