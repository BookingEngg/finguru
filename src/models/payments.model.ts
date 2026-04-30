import { Schema } from "mongoose";
import { MONGO_INSTANCES } from "@/database";
import { IPayments } from "@/interfaces/payment.interface";

const dbConnection = MONGO_INSTANCES.finance;

const PaymentsSchema: Schema<IPayments & Document> = new Schema(
  {
    // System created fields
    user_id: { type: String, required: true },

    // Payments field
    transaction_id: { type: String, required: true },
    description: { type: String, required: true },
    transaction_type: { type: String, required: true },
    amount: { type: Number, required: true },
    transaction_created_at: { type: Date, required: true },

    // Meta fields
    bank_name: { type: String, required: true },
    tags: { type: [String], required: true, default: [] },
  },
  {
    timestamps: true,
  }
);

const PaymentModel = dbConnection.model("payments", PaymentsSchema);
export default PaymentModel;
