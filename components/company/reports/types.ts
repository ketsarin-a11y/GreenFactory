export type ReportStatus = "ready" | "processing" | "failed";
export type FileType = "Excel" | "PDF" | "CSV";

export type ReportItem = {
  id: number;
  title: string;
  period: string;
  requestedBy: string;
  createdAt: string;
  fileType: FileType;
  status: ReportStatus;
  size: string;
};
