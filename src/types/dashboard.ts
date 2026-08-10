export type DashboardSummary = {
  totalWorkers: number;
  activeWorkers: number;
  activeSites: number;

  todayPresent: number;
  todayAbsent: number;
  todayHalfDay: number;
  todayLeave: number;

  monthlyPayable: number;
  monthlyPaid: number;
  monthlyPending: number;
};

export type DashboardActivityType =
  | "attendance"
  | "advance"
  | "payment";

export type DashboardActivity = {
  id: string;
  type: DashboardActivityType;
  title: string;
  description: string;
  amount: number;
  date: string;
  created_at: string;
};