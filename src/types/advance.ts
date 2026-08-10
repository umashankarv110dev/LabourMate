export type Advance = {
  id: string;
  worker_id: string;
  amount: number;
  advance_date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type AdvanceWithWorker = Advance & {
  worker_name: string;
  worker_type: string;
  site_name: string | null;
};

export type CreateAdvanceInput = {
  workerId: string;
  amount: number;
  date: string;
  note?: string;
};