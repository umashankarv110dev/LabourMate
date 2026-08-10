export type LedgerTransactionType =
  | "earning"
  | "advance";

export type LedgerTransaction = {
  id: string;
  date: string;
  type: LedgerTransactionType;
  title: string;
  description: string;
  amount: number;
};

export type WorkerLedgerSummary = {
  totalEarnings: number;
  totalAdvance: number;
  balance: number;
};