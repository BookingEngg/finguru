export interface IPayments extends Document {
  transaction_id: string; // Unique Id for transaction
  user_id: string; // User id
  description: string; // Description / Narration
  transaction_type: "credit" | "debit"; // Transaction type
  amount: number; // Transaction amount
  transaction_created_at: string; // Transaction created at
  bank_name: string; // Bank Enum

  // This pmt is belongs to which categories
  flags: string[]; // Flags

  createdAt: string;
  updatedAt: string;
}
