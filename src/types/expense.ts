export interface Expense {
  _id?: string;
  amount: number;
  category: "Rental" | "Groceries" | "Entertainment" | "Travel" | "Others";
  notes: string;
  date: string;
  paymentMode: "UPI" | "Credit Card" | "Net Banking" | "Cash";
}
