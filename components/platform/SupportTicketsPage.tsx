"use client";

import { useMemo, useState } from "react";
import { Search, TicketCheck } from "lucide-react";

type Ticket = {
  ticketId: number;
  ticketReference: string;
  reporterId: number;
  companyId: number | null;
  subject: string;
  category: string;
  priority: string;
  description: string;
  pageUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function SupportTicketsPage({
  initialTickets,
}: {
  initialTickets: Ticket[];
}) {
  const [tickets, setTickets] = useState(initialTickets);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return tickets;

    return tickets.filter((item) =>
      [
        item.ticketReference,
        item.subject,
        item.category,
        item.priority,
        item.status,
        item.description,
      ].some((value) => value.toLowerCase().includes(term)),
    );
  }, [tickets, search]);

  async function updateStatus(ticketId: number, status: string) {
    const response = await fetch("/api/platform/support", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, status }),
    });

    const payload = await response.json();

    if (response.ok && payload.success) {
      setTickets((current) =>
        current.map((item) =>
          item.ticketId === ticketId ? { ...item, status } : item,
        ),
      );
    }
  }

  return (
    <div className="space-y-5 pb-10">
      <section className="rounded-[22px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <TicketCheck className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-[26px] font-black text-slate-950">รายการแจ้งปัญหา</h1>
            <p className="mt-0.5 text-sm text-slate-500">{tickets.length} รายการ</p>
          </div>
        </div>
      </section>

      <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหา Reference, หัวข้อ หรือสถานะ"
            className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-sky-400"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Reference</th>
                <th className="px-5 py-3.5">หัวข้อ</th>
                <th className="px-5 py-3.5">ประเภท</th>
                <th className="px-5 py-3.5">ความสำคัญ</th>
                <th className="px-5 py-3.5">ผู้แจ้ง</th>
                <th className="px-5 py-3.5">วันที่</th>
                <th className="px-5 py-3.5">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ticket) => (
                <tr key={ticket.ticketId} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4 font-bold text-slate-700">
                    {ticket.ticketReference}
                  </td>
                  <td className="max-w-[320px] px-5 py-4">
                    <p className="font-bold text-slate-900">{ticket.subject}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                      {ticket.description}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{ticket.category}</td>
                  <td className="px-5 py-4 text-slate-600">{ticket.priority}</td>
                  <td className="px-5 py-4 text-slate-600">#{ticket.reporterId}</td>
                  <td className="px-5 py-4 text-slate-500">
                    {new Date(ticket.createdAt).toLocaleString("th-TH")}
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={ticket.status}
                      onChange={(event) =>
                        updateStatus(ticket.ticketId, event.target.value)
                      }
                      className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    ไม่พบรายการ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
