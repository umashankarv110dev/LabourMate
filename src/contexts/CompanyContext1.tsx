import { createContext } from "react";
import { Company } from "../types/companybill";

export interface CompanyContextType {
  company: Company | null;

  setCompany: (company: Company) => void;
}

export const CompanyContext =
  createContext<CompanyContextType>({
    company: null,
    setCompany: () => {},
  });