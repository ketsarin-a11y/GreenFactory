"use client";

import { useMemo, useState } from "react";
import CreateReportPanel from "./CreateReportPanel";
import ReportsAlert from "./ReportsAlert";
import ReportsChart from "./ReportsChart";
import ReportsHero from "./ReportsHero";
import ReportsHistory from "./ReportsHistory";
import ReportsSummary from "./ReportsSummary";
import { reports } from "./data";
import type { FileType, ReportStatus } from "./types";

export default function ReportsPageClient() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ReportStatus>("all");
  const [type, setType] = useState<"all" | FileType>("all");
  const [showCreatePanel, setShowCreatePanel] = useState(false);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const searchMatched =
        report.title.toLowerCase().includes(query.toLowerCase()) ||
        report.requestedBy.toLowerCase().includes(query.toLowerCase());
      const statusMatched = status === "all" || report.status === status;
      const typeMatched = type === "all" || report.fileType === type;
      return searchMatched && statusMatched && typeMatched;
    });
  }, [query, status, type]);

  return (
    <div className="space-y-5">
      <ReportsHero onCreate={() => setShowCreatePanel((current) => !current)} />
      {showCreatePanel && <CreateReportPanel />}

      <ReportsSummary
        total={reports.length}
        ready={reports.filter((item) => item.status === "ready").length}
        processing={reports.filter((item) => item.status === "processing").length}
        failed={reports.filter((item) => item.status === "failed").length}
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.5fr)]">
        <ReportsHistory
          reports={filteredReports}
          query={query}
          setQuery={setQuery}
          status={status}
          setStatus={setStatus}
          type={type}
          setType={setType}
        />

        <aside className="space-y-6">
          <ReportsChart />
          <ReportsAlert />
        </aside>
      </section>
    </div>
  );
}
