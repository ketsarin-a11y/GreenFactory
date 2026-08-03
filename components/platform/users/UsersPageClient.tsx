"use client";

import { AlertTriangle, LoaderCircle, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import CreateUserModal from "./CreateUserModal";
import Pagination from "./Pagination";
import UserFilters from "./UserFilters";
import UserProfileDrawer from "./UserProfileDrawer";
import UserStatsCards from "./UserStatsCards";
import UserTable from "./UserTable";
import type {
  CreateUserOptions,
  NewUserForm,
  UserRole,
  UserRow,
  UserStatus,
} from "./types";

const PAGE_SIZE = 8;
const EMPTY_OPTIONS: CreateUserOptions = {
  roles: [],
  companies: [],
  factories: [],
  departments: [],
};

export default function UsersPageClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [options, setOptions] = useState<CreateUserOptions>(EMPTY_OPTIONS);
  const [summary, setSummary] = useState({ total: 0, active: 0, suspended: 0, expired: 0, newUsers: 0 });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | UserStatus>("ALL");
  const [role, setRole] = useState<"ALL" | UserRole>("ALL");
  const [company, setCompany] = useState("ALL");
  const [page, setPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadUsers = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/platform/users", {
        cache: "no-store",
        signal,
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
      }

      setUsers(result.data ?? []);
      setSummary(result.summary ?? { total: 0, active: 0, suspended: 0, expired: 0, newUsers: 0 });
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOptions = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch("/api/platform/users/options", {
      cache: "no-store",
      signal,
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message ?? "ไม่สามารถโหลดตัวเลือกผู้ใช้งานได้");
    }

    setOptions(result.data ?? EMPTY_OPTIONS);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([loadUsers(controller.signal), loadOptions(controller.signal)]).catch((caught) => {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "ไม่สามารถโหลดข้อมูลได้");
    });
    return () => controller.abort();
  }, [loadOptions, loadUsers]);

  const companies = useMemo(
    () => Array.from(new Set(users.map((item) => item.company))).sort(),
    [users],
  );

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesKeyword =
        !keyword ||
        [user.firstName, user.lastName, user.username, user.email, user.company, user.companyCode, user.position, user.office]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return (
        matchesKeyword &&
        (status === "ALL" || user.status === status) &&
        (role === "ALL" || user.role === role) &&
        (company === "ALL" || user.company === company)
      );
    });
  }, [company, role, search, status, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const visibleUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  async function handleCreateUser(form: NewUserForm) {
    try {
      setCreating(true);
      setCreateError("");
      setSuccessMessage("");

      const response = await fetch("/api/platform/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          email: form.email,
          phone: form.phone,
          employeeCode: form.employeeCode,
          password: form.password,
          roleCode: form.roleCode,
          companyId: form.companyId || null,
          factoryId: form.factoryId || null,
          departmentId: form.departmentId || null,
          status: form.status,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "ไม่สามารถเพิ่มผู้ใช้งานได้");
      }

      setCreateOpen(false);
      setSuccessMessage(result.message ?? "เพิ่มผู้ใช้งานเรียบร้อยแล้ว");
      setPage(1);
      await loadUsers();
    } catch (caught) {
      setCreateError(caught instanceof Error ? caught.message : "ไม่สามารถเพิ่มผู้ใช้งานได้");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[560px] place-items-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-[#168662]" />
          <p className="mt-3 text-[12px] font-semibold text-[#68746e]">กำลังโหลดข้อมูลผู้ใช้งาน</p>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="grid min-h-[560px] place-items-center">
        <div className="max-w-[620px] rounded-[24px] border border-[#efdadd] bg-white p-8 text-center">
          <AlertTriangle className="mx-auto h-6 w-6 text-[#c15561]" />
          <p className="mt-3 text-[13px] font-semibold text-[#a44854]">{error}</p>
          <button type="button" onClick={() => void loadUsers()} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0e7b5b] px-5 text-[11px] font-semibold text-white">
            <RefreshCw className="h-4 w-4" /> ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold text-[#7a847f]">User & Role Management <span className="mx-2 text-[#c0c4c1]">›</span> จัดการผู้ใช้งาน</p>
          <h2 className="mt-2 text-[27px] font-bold tracking-[-0.035em] text-[#1e2924]">จัดการผู้ใช้งาน</h2>
          <p className="mt-1.5 text-[13px] text-[#7b8580]">เพิ่มบัญชีและกำหนดบริษัท โรงงาน แผนก บทบาท และสถานะจริง</p>
        </div>

        <button type="button" onClick={() => { setCreateError(""); setCreateOpen(true); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#0d7659] px-4 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(13,118,89,0.18)]">
          <Plus className="h-[17px] w-[17px]" /> เพิ่มผู้ใช้งานใหม่
        </button>
      </section>

      {successMessage && <div className="rounded-[14px] border border-[#cce8da] bg-[#eef9f3] px-4 py-3 text-[11px] font-semibold text-[#147858]">{successMessage}</div>}
      {error && <div className="rounded-[14px] border border-[#f0d8dc] bg-[#fff6f7] px-4 py-3 text-[11px] font-semibold text-[#a44854]">{error}</div>}

      <UserStatsCards total={summary.total} active={summary.active} suspended={summary.suspended} expired={summary.expired} newUsers={summary.newUsers} />

      <section className="overflow-hidden rounded-[18px] border border-[#e7e4df] bg-white shadow-[0_10px_36px_rgba(52,45,37,0.045)]">
        <UserFilters
          search={search}
          status={status}
          role={role}
          company={company}
          companies={companies}
          onSearchChange={(value) => { setSearch(value); setPage(1); }}
          onStatusChange={(value) => { setStatus(value); setPage(1); }}
          onRoleChange={(value) => { setRole(value); setPage(1); }}
          onCompanyChange={(value) => { setCompany(value); setPage(1); }}
          onReset={() => { setSearch(""); setStatus("ALL"); setRole("ALL"); setCompany("ALL"); setPage(1); }}
        />

        <UserTable
          users={visibleUsers}
          openActionId={openActionId}
          onOpenAction={(id) => setOpenActionId((current) => (current === id ? null : id))}
          onSelectUser={setSelectedUser}
        />

        <Pagination
          page={page}
          totalVisible={visibleUsers.length}
          total={filteredUsers.length}
          onPageChange={(nextPage) => setPage(Math.min(Math.max(nextPage, 1), totalPages))}
        />
      </section>

      <UserProfileDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
      <CreateUserModal
        open={createOpen}
        options={options}
        submitting={creating}
        error={createError}
        onClose={() => { if (!creating) { setCreateOpen(false); setCreateError(""); } }}
        onCreate={(form) => void handleCreateUser(form)}
      />
    </div>
  );
}
