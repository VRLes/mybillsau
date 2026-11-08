export type BillCategory =
  | "electricity"
  | "water"
  | "internet"
  | "phone"
  | "rent"
  | "insurance"
  | "subscription"
  | "other";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  /**
   * The Person's local date ("YYYY-MM-DD") the Bill was marked paid.
   * Missing on Bills paid before paid dates were recorded ("date not recorded").
   */
  paidDate?: string;
  category: BillCategory;
}
