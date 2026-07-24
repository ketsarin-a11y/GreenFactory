"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { MOCK_USERS } from "./mock";
import type { UserRole, UserRow, UserStatus } from "./types";
import UserStatsCards from "./UserStatsCards";
import UserFilters from "./UserFilters";
import UserTable from "./UserTable";
import Pagination from "./Pagination";
import UserProfileDrawer from "./UserProfileDrawer";

export default function UsersPageClient() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | UserStatus>("ALL");
  const [role, setRole] = useState<"ALL" | UserRole>("ALL");
  const [company, setCompany] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [openActionId, setOpenActionId] = useState<number | null>(null);

  const companies = useMemo(
    () => Array.from(new Set(MOCK_USERS.map((item) => item.company))),
    [],
  );

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return MOCK_USERS.filter((user) => {
      const matchesKeyword =
        !keyword ||
        [
          user.firstName,
          user.lastName,
          user.username,
          user.email,
          user.company,
          user.position,
          user.office,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const matchesStatus = status === "ALL" || user.status === status;
      const matchesRole = role === "ALL" || user.role === role;
      const matchesCompany = company === "ALL" || user.company === company;

      return matchesKeyword && matchesStatus && matchesRole && matchesCompany;
    });
  }, [search, status, role, company]);

  const total = MOCK_USERS.length;
  const active = MOCK_USERS.filter((item) => item.status === "ACTIVE").length;
  const suspended = MOCK_USERS.filter(
    (item) => item.status === "SUSPENDED",
  ).length;
  const expired = MOCK_USERS.filter((item) => item.status === "EXPIRED").length;

  function resetFilters() {
    setSearch("");
    setStatus("ALL");
    setRole("ALL");
    setCompany("ALL");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold text-[#7a847f]">
            User & Role Management
            <span className="mx-2 text-[#c0c4c1]">›</span>
            จัดการผู้ใช้งาน
          </p>

          <h2 className="mt-2 text-[27px] font-bold tracking-[-0.035em] text-[#1e2924]">
            จัดการผู้ใช้งาน
          </h2>

          <p className="mt-1.5 text-[13px] text-[#7b8580]">
            จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ พร้อมข้อมูลบริษัท บทบาท และสถานะ
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#0d7659] px-4 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(13,118,89,0.18)] transition hover:-translate-y-0.5 hover:bg-[#09694f]"
        >
          <Plus className="h-[17px] w-[17px]" />
          เพิ่มผู้ใช้งานใหม่
        </button>
      </section>

      <UserStatsCards
        total={total}
        active={active}
        suspended={suspended}
        expired={expired}
        newUsers={32}
      />

      <section className="overflow-hidden rounded-[18px] border border-[#e7e4df] bg-white shadow-[0_10px_36px_rgba(52,45,37,0.045)]">
        <UserFilters
          search={search}
          status={status}
          role={role}
          company={company}
          companies={companies}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          onRoleChange={(value) => {
            setRole(value);
            setPage(1);
          }}
          onCompanyChange={(value) => {
            setCompany(value);
            setPage(1);
          }}
          onReset={resetFilters}
        />

        <UserTable
          users={filteredUsers}
          openActionId={openActionId}
          onOpenAction={(id) =>
            setOpenActionId((current) => (current === id ? null : id))
          }
          onSelectUser={setSelectedUser}
        />

        <Pagination
          page={page}
          totalVisible={filteredUsers.length}
          total={total}
          onPageChange={setPage}
        />
      </section>

      <UserProfileDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
