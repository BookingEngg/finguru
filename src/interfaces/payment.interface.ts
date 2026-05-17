export interface IPayments {
  transaction_id: string; // Unique Id for transaction
  user_id: string; // User id
  description: string; // Description / Narration
  transaction_type: "credit" | "debit"; // Transaction type
  amount: number; // Transaction amount
  transaction_created_at: Date; // Transaction created at
  bank_name: string; // Bank Enum

  // This pmt is belongs to which categories
  tags: string[]; // Tags

  createdAt: Date;
  updatedAt: Date;
}

export interface IFinancialQueryFilters {
  transaction_type?: "credit" | "debit";
  date_range?: {
    start?: string; // YYYY-MM-DD
    end?: string; // YYYY-MM-DD
  };
  tag?: string;
  amount_gt?: number;
  amount_lt?: number;
  bank_name?: string;
}

export interface IFinancialQueryPayload {
  operation: "sum" | "avg" | "filter" | "trend" | "group_by" | "category_analysis" | "monthly_growth" | "merchant_analysis";
  metric?: string;
  filters?: IFinancialQueryFilters;
  group_by?: string;
  period?: "day" | "week" | "month";
}
