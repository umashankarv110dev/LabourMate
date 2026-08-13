export type Company = {
  id: string;

  // Basic business information
  name: string;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  gst_number: string | null;

  // Branding / documents
  logo: string | null;
  signature: string | null;
  stamp: string | null;

  created_at: string;
  updated_at: string;
};

export type SaveCompanyInput = {
  name: string;
  owner_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  gst_number?: string;
  logo?: string | null;
  signature?: string | null;
  stamp?: string | null;
};