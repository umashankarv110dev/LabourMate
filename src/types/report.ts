export type ReportSummary = {
  totalWorkers: number;
  totalSites: number;

  presentCount: number;
  absentCount: number;
  halfDayCount: number;
  leaveCount: number;

  workingAmount: number;
  advanceAmount: number;
  payableAmount: number;
  paidAmount: number;
  pendingAmount: number;
};

export type SiteCostReport = {
  site_id: string;
  site_name: string;
  worker_count: number;
  attendance_count: number;
  labour_cost: number;
};

export type WorkerReportSummary = {
  worker_id: string;
  worker_name: string;
  worker_type: string;
  site_name: string | null;

  present_count: number;
  absent_count: number;
  half_day_count: number;
  leave_count: number;

  working_amount: number;
  advance_amount: number;
  payable_amount: number;
  paid_amount: number;
  pending_amount: number;
};

export type AttendanceReportItem = {
  worker_id: string;
  worker_name: string;
  worker_type: string;
  site_name: string | null;

  present_count: number;
  absent_count: number;
  half_day_count: number;
  leave_count: number;

  total_days: number;
  working_amount: number;
};

export type AttendanceReportDetail = {
  id: string;
  attendance_date: string;
  status: string;
  amount: number;
  note: string | null;
  site_name: string | null;
};

export type WorkerWageDetail = {
  worker_id: string;
  worker_name: string;
  worker_type: string;
  site_name: string | null;

  present_count: number;
  absent_count: number;
  half_day_count: number;
  leave_count: number;

  working_amount: number;
  advance_amount: number;

  bonus: number;
  deduction: number;

  final_amount: number;
  paid_amount: number;
  pending_amount: number;

  payment_status: string | null;
};

export type WorkerAdvanceReportItem = {
  id: string;
  amount: number;
  advance_date: string;
  payment_mode: string | null;
  note: string | null;
};

export type WorkerPaymentReportItem = {
  id: string;
  amount: number;
  payment_date: string;
  payment_mode: string | null;
  note: string | null;
};

export type AdvanceReportSummary = {
  total_amount: number;
  total_transactions: number;
  worker_count: number;
  cash_amount: number;
  upi_amount: number;
  bank_amount: number;
};

export type AdvanceWorkerReport = {
  worker_id: string;
  worker_name: string;
  worker_type: string;
  site_name: string | null;
  total_advance: number;
  transaction_count: number;
  last_advance_date: string | null;
};

export type AdvanceReportTransaction = {
  id: string;
  worker_id: string;
  worker_name: string;
  worker_type: string;
  site_name: string | null;
  amount: number;
  advance_date: string;
  payment_mode: string | null;
  note: string | null;
};

export type PaymentReportSummary = {
  total_payable: number;
  total_paid: number;
  total_pending: number;

  paid_workers: number;
  pending_workers: number;

  cash_amount: number;
  upi_amount: number;
  bank_amount: number;

  transaction_count: number;
};

export type PaymentWorkerReport = {
  payment_id: string;
  worker_id: string;
  worker_name: string;
  worker_type: string;
  site_name: string | null;

  final_amount: number;
  paid_amount: number;
  pending_amount: number;

  payment_status: string;
};

export type PaymentReportTransaction = {
  id: string;
  payment_id: string;
  worker_id: string;
  worker_name: string;

  amount: number;
  payment_date: string;
  payment_mode: string | null;
  note: string | null;
};

export type SiteLabourCostSummary = {
  total_cost: number;
  total_sites: number;
  total_workers: number;
  attendance_count: number;
  average_cost_per_site: number;
};

export type SiteLabourCostItem = {
  site_id: string;
  site_name: string;
  site_address: string | null;

  worker_count: number;
  attendance_count: number;

  present_count: number;
  half_day_count: number;

  labour_cost: number;
  advance_amount: number;
  paid_amount: number;

  cost_percentage: number;
};

export type SiteWorkerCostItem = {
  worker_id: string;
  worker_name: string;
  worker_type: string;

  present_count: number;
  half_day_count: number;

  working_amount: number;
  advance_amount: number;
};