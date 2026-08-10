export type Worker = {
  id: string;
  name: string;
  phone: string | null;
  photo: string | null;
  worker_type: string;
  payment_type: "daily" | "monthly";
  wage: number;
  site_id: string | null;
  joining_date: string | null;
  address: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

export type WorkerWithSite = Worker & {
  site_name: string | null;
};

export type CreateWorkerInput = {
  name: string;
  phone?: string;
  photo?: string;
  workerType: string;
  paymentType: "daily" | "monthly";
  wage: number;
  siteId?: string;
  joiningDate?: string;
  address?: string;
};