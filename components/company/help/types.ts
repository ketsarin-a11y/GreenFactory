export type HelpCategory =
  | "all"
  | "account"
  | "factory"
  | "sensor"
  | "report"
  | "resource"
  | "qr";

export type FaqItem = {
  id: number;
  question: string;
  answer: string;
  category: Exclude<HelpCategory, "all">;
};

export type SupportFormData = {
  subject: string;
  category: string;
  description: string;
};
