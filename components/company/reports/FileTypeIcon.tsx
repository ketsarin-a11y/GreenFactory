import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import type { FileType } from "./types";

export default function FileTypeIcon({ type }: { type: FileType }) {
  if (type === "Excel") {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#e8f7ee] text-[#159454]">
        <FileSpreadsheet className="h-4 w-4" strokeWidth={1.9} />
      </span>
    );
  }

  if (type === "PDF") {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#fff0f0] text-[#d64c4c]">
        <FileText className="h-4 w-4" strokeWidth={1.9} />
      </span>
    );
  }

  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#edf3ff] text-[#4a75e8]">
      <FileDown className="h-4 w-4" strokeWidth={1.9} />
    </span>
  );
}
