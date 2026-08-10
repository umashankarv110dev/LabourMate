export type Site = {
  id: string;
  name: string;
  client_name: string | null;
  address: string | null;
  start_date: string | null;
  expected_end_date: string | null;
  status: "active" | "completed";
  created_at: string;
  updated_at: string;
};

export type CreateSiteInput = {
  name: string;
  clientName?: string;
  address?: string;
  startDate?: string;
  expectedEndDate?: string;
};