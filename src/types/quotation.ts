import { Company } from "./companybill";
import { Item } from "./item";

export interface Quotation {
  id: string;
  quotationNo: string;
  date: string;
  quotationTitle: string;
  customerName: string;
  siteName: string;
  company: Company | null;
  items: Item[];
  notes: string;
  grandTotal: number;
  status: "Draft" | "Saved" | "Shared" | "Converted";
  createdAt: string;
  updatedAt: string;
}