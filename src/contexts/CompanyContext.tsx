import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { Company } from "@/src/types/company";
import { getCompany } from "@/src/repositories/companyRepository";

type CompanyContextType = {
  company: Company | null;
  isCompanyLoading: boolean;
  refreshCompany: () => Promise<void>;
};

const CompanyContext = createContext<
  CompanyContextType | undefined
>(undefined);

export function CompanyProvider({
  children,
}: {
  children: ReactNode;
}) {
  const db = useSQLiteContext();

  const [company, setCompany] =
    useState<Company | null>(null);

  const [isCompanyLoading, setIsCompanyLoading] =
    useState(true);

  const refreshCompany = async () => {
    try {
      setIsCompanyLoading(true);

      const result = await getCompany(db);

      setCompany(result);
    } catch (error) {
      console.error(
        "LOAD COMPANY CONTEXT ERROR:",
        error
      );
    } finally {
      setIsCompanyLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refreshCompany();
    }, [])
  );

  return (
    <CompanyContext.Provider
      value={{
        company,
        isCompanyLoading,
        refreshCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);

  if (!context) {
    throw new Error(
      "useCompany must be used inside CompanyProvider"
    );
  }

  return context;
}