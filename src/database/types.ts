export type WorkerPaymentType = "daily" | "monthly";

export type WorkerStatus = "active" | "inactive";

export type AttendanceStatus =
  | "present"
  | "absent"
  | "half_day"
  | "leave";

export type PaymentStatus = "pending" | "paid";

export type TransactionType =
  | "work"
  | "advance"
  | "payment"
  | "bonus"
  | "deduction";

export type SiteStatus = "active" | "completed";