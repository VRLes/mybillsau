export type BillCategory =
  | "electricity"
  | "water"
  | "internet"
  | "phone"
  | "rent"
  | "insurance"
  | "subscription"
  | "other";

/** How often a Bill comes back. Missing on a Bill means Just once. */
export type HowOften = "once" | "monthly" | "quarterly" | "yearly";

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
  /** How often it comes back. Missing means Just once (every Bill before #10). */
  howOften?: HowOften;
  /** Shared by every Bill in one repeating series: the first Bill's id. */
  seriesId?: string;
  /** The day of the month the series is due on, so a clamped month (28 Feb) can go back to the 31st. */
  dueDay?: number;
  /** True while the amount is an Estimated amount copied from the last Bill ("about $X"). */
  estimated?: boolean;
}
