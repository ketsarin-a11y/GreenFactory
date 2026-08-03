import ExportPage from "@/components/manager/ExportPage";

export const dynamic = "force-dynamic";

function defaultDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export default function ManagerExportPage() {
  return <ExportPage defaultFrom={defaultDate(6)} defaultTo={defaultDate(0)} />;
}