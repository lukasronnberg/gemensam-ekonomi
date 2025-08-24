export type Member = "lukas" | "annie";
export type SplitMethod = "equal" | "percent" | "fixed";
export type SharedType = "deposit" | "payout";

export type TransactionRow = {
  id: string;
  owner_uid: string;
  date: string;                // ISO
  category: string;
  description: string | null;
  amount: number;
  payer: Member;
  is_shared: boolean;
  split_method: SplitMethod;
  split_percent_for_payer: number | null;
  split_fixed_who: Member | null;
  split_fixed_amount: number | null;
  created_at: string;
};

export type SharedSavingsRow = {
  id: string;
  owner_uid: string;
  date: string;
  type: SharedType;
  member: Member | null;
  amount: number;
  note: string | null;
  created_at: string;
};

export type AppSettings = {
  owner_uid: string;
  name_lukas: string;
  name_annie: string;
  created_at: string;
};
