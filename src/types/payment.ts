export type PaymentStatus =
  | "pending"
  | "partial"
  | "paid";

export type PaymentMode =
  | "cash"
  | "upi"
  | "bank";

export type Payment = {
  id: string;
  worker_id: string;
  payment_month: string;
  working_amount: number;
  advance_amount: number;
  bonus: number;
  deduction: number;
  final_amount: number;
  payment_date: string | null;
  payment_mode: string | null;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
};

export type PaymentWithWorker = Payment & {
  worker_name: string;
  worker_type: string;
  site_name: string | null;
  payment_type: "daily" | "monthly";
  wage: number;
  paid_amount: number;
  remaining_amount: number;
};

export type PaymentEntry = {
  id: string;
  payment_id: string;
  worker_id: string;
  amount: number;
  payment_date: string;
  payment_mode: PaymentMode;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type SalaryCalculation = {
  workingAmount: number;
  advanceAmount: number;
  bonus: number;
  deduction: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
};