export type Company = {
  id: string;
  name: string;
  owner_name: string | null;
  phone: string | null;
  address: string | null;
  logo: string | null;
  created_at: string;
  updated_at: string;
};

export type SaveCompanyInput = {
  name: string;
  owner_name?: string;
  phone?: string;
  address?: string;
  logo?: string | null;
};