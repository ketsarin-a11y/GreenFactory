"use client";

import {
  Ban,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  KeyRound,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type UserRole = "COMPANY_ADMIN" | "MANAGER" | "OPERATOR";
type UserStatus = "ACTIVE" | "LOCKED" | "INACTIVE";

type UserItem = {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  factoryId: number | null;
  factoryName: string;
  departmentId: number | null;
  department: string;
  status: UserStatus;
  lastLogin: string;
};

type FactoryOption = {
  factoryId: number;
  factoryCode: string;
  factoryName: string;
};

type DepartmentOption = {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  factoryId: number;
  buildingName: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: UserItem[];
  options?: {
    factories: FactoryOption[];
    departments: DepartmentOption[];
  };
};

type NewUserForm = {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "MANAGER" | "OPERATOR";
  factoryId: string;
  departmentId: string;
};

const PAGE_SIZE = 8;

const EMPTY_FORM: NewUserForm = {
  employeeCode: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "OPERATOR",
  factoryId: "",
  departmentId: "",
};

function getRoleLabel(role: UserRole) {
  if (role === "COMPANY_ADMIN") return "Company Admin";
  if (role === "MANAGER") return "Manager";
  return "Operator";
}

function getRoleBadge(role: UserRole) {
  if (role === "COMPANY_ADMIN") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (role === "MANAGER") {
    return "border-blue-100 bg-blue-50 text-blue-700";
  }

  return "border-violet-100 bg-violet-50 text-violet-700";
}

function getStatusLabel(status: UserStatus) {
  if (status === "ACTIVE") return "ใช้งานอยู่";
  if (status === "LOCKED") return "ระงับ";
  return "ไม่ใช้งาน";
}

function getInitials(firstName: string, lastName: string) {
  return (
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() ||
    "US"
  );
}

export default function UsersPageClient() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [factories, setFactories] = useState<FactoryOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [factoryFilter, setFactoryFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<number | null>(
    null,
  );
  const [form, setForm] = useState<NewUserForm>(EMPTY_FORM);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/company/users", {
        cache: "no-store",
        credentials: "include",
      });

      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "ไม่สามารถโหลดผู้ใช้งานได้",
        );
      }

      setUsers(result.data ?? []);
      setFactories(result.options?.factories ?? []);
      setDepartments(result.options?.departments ?? []);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถโหลดผู้ใช้งานได้",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredDepartments = useMemo(() => {
    if (!form.factoryId) return [];

    return departments.filter(
      (item) =>
        item.factoryId === Number(form.factoryId),
    );
  }, [departments, form.factoryId]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const fullName =
        `${user.firstName} ${user.lastName}`.toLowerCase();

      const matchesSearch =
        !keyword ||
        fullName.includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.employeeCode.toLowerCase().includes(keyword) ||
        user.factoryName.toLowerCase().includes(keyword) ||
        user.department.toLowerCase().includes(keyword);

      const matchesRole =
        roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "SUSPENDED"
          ? user.status !== "ACTIVE"
          : user.status === statusFilter);

      const matchesFactory =
        factoryFilter === "ALL" ||
        String(user.factoryId ?? "") === factoryFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesFactory
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
    factoryFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const visibleUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const activeCount = users.filter(
    (user) => user.status === "ACTIVE",
  ).length;

  const managerCount = users.filter(
    (user) => user.role === "MANAGER",
  ).length;

  const operatorCount = users.filter(
    (user) => user.role === "OPERATOR",
  ).length;

  const missingScopeCount = users.filter(
    (user) =>
      user.role !== "COMPANY_ADMIN" &&
      (user.factoryId == null ||
        (user.role === "OPERATOR" &&
          user.departmentId == null)),
  ).length;

  function resetFilters() {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setFactoryFilter("ALL");
    setPage(1);
  }

  async function createUser(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (busy) return;

    try {
      setBusy(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/company/users", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeCode: form.employeeCode,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          role: form.role,
          factoryId: form.factoryId
            ? Number(form.factoryId)
            : null,
          departmentId: form.departmentId
            ? Number(form.departmentId)
            : null,
        }),
      });

      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "ไม่สามารถเพิ่มผู้ใช้งานได้",
        );
      }

      setDrawerOpen(false);
      setForm(EMPTY_FORM);
      setSuccess(
        result.message ?? "เพิ่มผู้ใช้งานเรียบร้อยแล้ว",
      );

      await loadUsers();

      window.setTimeout(() => setSuccess(""), 3000);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถเพิ่มผู้ใช้งานได้",
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleUserStatus(user: UserItem) {
    if (busy || user.role === "COMPANY_ADMIN") return;

    try {
      setBusy(true);
      setError("");
      setSuccess("");
      setActionMenuId(null);

      const response = await fetch(
        `/api/company/users/${user.id}`,
        {
          method: "PATCH",
          cache: "no-store",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status:
              user.status === "ACTIVE"
                ? "SUSPENDED"
                : "ACTIVE",
          }),
        },
      );

      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ??
            "ไม่สามารถเปลี่ยนสถานะบัญชีได้",
        );
      }

      setSuccess(
        result.message ?? "อัปเดตสถานะเรียบร้อยแล้ว",
      );

      await loadUsers();

      window.setTimeout(() => setSuccess(""), 3000);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถเปลี่ยนสถานะบัญชีได้",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="mx-auto w-full max-w-[1600px] pb-10">
        <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              User Management
            </div>

            <h1 className="text-[38px] font-bold tracking-[-0.045em] text-slate-900 sm:text-[42px]">
              ผู้ใช้งานในบริษัท
            </h1>

            <p className="mt-2 max-w-[820px] text-[15px] leading-7 text-slate-500">
              จัดการบัญชีและขอบเขตสิทธิ์ของ Manager และ
              Operator ภายในบริษัทนี้เท่านั้น
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setForm(EMPTY_FORM);
              setDrawerOpen(true);
            }}
            className="inline-flex h-[50px] items-center justify-center gap-2.5 rounded-[14px] bg-emerald-700 px-6 text-[15px] font-bold text-white shadow-[0_14px_30px_rgba(5,120,73,0.2)] transition hover:-translate-y-0.5 hover:bg-emerald-800"
          >
            <Plus className="h-5 w-5" />
            เพิ่มผู้ใช้งาน
          </button>
        </div>

        {(error || success) && (
          <div
            className={`mb-5 flex items-center gap-3 rounded-[14px] border px-4 py-3.5 text-[14px] font-semibold ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ? (
              <UserX className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
            {error || success}
          </div>
        )}

        <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="ผู้ใช้งานทั้งหมด"
            value={users.length}
            detail="บัญชีในบริษัท"
            icon={<Users className="h-5 w-5" />}
          />

          <StatCard
            label="บัญชีใช้งานอยู่"
            value={activeCount}
            detail="พร้อมเข้าสู่ระบบ"
            icon={<UserCheck className="h-5 w-5" />}
          />

          <StatCard
            label="Manager / Operator"
            value={`${managerCount} / ${operatorCount}`}
            detail="ตามบทบาทที่กำหนด"
            icon={<KeyRound className="h-5 w-5" />}
          />

          <StatCard
            label="ต้องตั้งค่าเพิ่ม"
            value={missingScopeCount}
            detail="ยังไม่ครบโรงงานหรือแผนก"
            icon={<Building2 className="h-5 w-5" />}
            warning={missingScopeCount > 0}
          />
        </div>

        <article className="overflow-visible rounded-[22px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="flex h-[50px] min-w-0 flex-1 items-center gap-3 rounded-[14px] border border-slate-200 bg-slate-50 px-4 transition focus-within:border-emerald-400 focus-within:bg-white xl:max-w-[460px]">
                <Search className="h-5 w-5 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="ค้นหาชื่อ อีเมล รหัสพนักงาน โรงงาน หรือแผนก..."
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="grid flex-1 gap-3 sm:grid-cols-3">
                <Select
                  value={roleFilter}
                  onChange={(value) => {
                    setRoleFilter(value);
                    setPage(1);
                  }}
                  options={[
                    ["ALL", "ทุกบทบาท"],
                    ["COMPANY_ADMIN", "Company Admin"],
                    ["MANAGER", "Manager"],
                    ["OPERATOR", "Operator"],
                  ]}
                />

                <Select
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                  options={[
                    ["ALL", "ทุกสถานะ"],
                    ["ACTIVE", "ใช้งานอยู่"],
                    ["SUSPENDED", "ระงับ/ไม่ใช้งาน"],
                  ]}
                />

                <Select
                  value={factoryFilter}
                  onChange={(value) => {
                    setFactoryFilter(value);
                    setPage(1);
                  }}
                  options={[
                    ["ALL", "ทุกโรงงาน"],
                    ...factories.map((factory) => [
                      String(factory.factoryId),
                      factory.factoryName,
                    ]),
                  ]}
                />
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[14px] border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <Filter className="h-5 w-5" />
                ล้างตัวกรอง
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid min-h-[380px] place-items-center">
              <div className="text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
                <p className="mt-4 text-[14px] text-slate-500">
                  กำลังโหลดข้อมูลผู้ใช้งาน...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <Head>ผู้ใช้งาน</Head>
                      <Head>รหัสพนักงาน</Head>
                      <Head>บทบาท</Head>
                      <Head>โรงงาน</Head>
                      <Head>แผนก</Head>
                      <Head>สถานะ</Head>
                      <Head>เข้าสู่ระบบล่าสุด</Head>
                      <th className="w-[64px] px-4 py-4" />
                    </tr>
                  </thead>

                  <tbody>
                    {visibleUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t border-slate-100 transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3.5">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-teal-100 text-[13px] font-bold text-emerald-700">
                              {getInitials(
                                user.firstName,
                                user.lastName,
                              )}
                            </span>

                            <div className="min-w-0">
                              <p className="truncate text-[15px] font-bold text-slate-800">
                                {user.firstName}{" "}
                                {user.lastName}
                              </p>

                              <p className="mt-1 flex items-center gap-1.5 truncate text-[12px] text-slate-400">
                                <Mail className="h-3.5 w-3.5" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-5 text-[14px] font-semibold text-slate-500">
                          {user.employeeCode}
                        </td>

                        <td className="px-4 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-[12px] font-bold ${getRoleBadge(
                              user.role,
                            )}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        </td>

                        <td className="px-4 py-5">
                          <p className="text-[14px] font-semibold text-slate-700">
                            {user.factoryName}
                          </p>
                        </td>

                        <td className="px-4 py-5 text-[14px] text-slate-500">
                          {user.department}
                        </td>

                        <td className="px-4 py-5">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-bold ${
                              user.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                user.status === "ACTIVE"
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                            />
                            {getStatusLabel(user.status)}
                          </span>
                        </td>

                        <td className="px-4 py-5 text-[12px] text-slate-400">
                          {user.lastLogin}
                        </td>

                        <td className="relative px-4 py-5">
                          {user.role !==
                            "COMPANY_ADMIN" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setActionMenuId(
                                    (current) =>
                                      current === user.id
                                        ? null
                                        : user.id,
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </button>

                              {actionMenuId ===
                                user.id && (
                                <div className="absolute right-4 top-[54px] z-30 w-[190px] rounded-xl border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void toggleUserStatus(
                                        user,
                                      )
                                    }
                                    className={`flex min-h-[42px] w-full items-center gap-2.5 rounded-lg px-3 text-left text-[13px] font-semibold transition ${
                                      user.status ===
                                      "ACTIVE"
                                        ? "text-red-600 hover:bg-red-50"
                                        : "text-emerald-700 hover:bg-emerald-50"
                                    }`}
                                  >
                                    {user.status ===
                                    "ACTIVE" ? (
                                      <Ban className="h-4 w-4" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4" />
                                    )}

                                    {user.status ===
                                    "ACTIVE"
                                      ? "ระงับบัญชี"
                                      : "เปิดใช้งานบัญชี"}
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {visibleUsers.length === 0 && (
                <div className="grid min-h-[340px] place-items-center px-6 text-center">
                  <div>
                    <Users className="mx-auto h-9 w-9 text-slate-300" />

                    <p className="mt-3 text-[16px] font-bold text-slate-600">
                      ไม่พบผู้ใช้งาน
                    </p>

                    <p className="mt-1 text-[13px] text-slate-400">
                      ลองเปลี่ยนคำค้นหาหรือตัวกรอง
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          <footer className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-slate-400">
              แสดง {visibleUsers.length} จาก{" "}
              {filteredUsers.length} รายการ
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() =>
                  setPage((value) =>
                    Math.max(1, value - 1),
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="min-w-[64px] text-center text-[13px] font-semibold text-slate-500">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPage((value) =>
                    Math.min(
                      totalPages,
                      value + 1,
                    ),
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </article>
      </section>

      {drawerOpen && (
        <>
          <button
            type="button"
            aria-label="ปิด"
            onClick={() =>
              setDrawerOpen(false)
            }
            className="fixed inset-0 z-[70] bg-slate-950/35 backdrop-blur-[3px]"
          />

          <aside className="fixed inset-y-0 right-0 z-[80] w-full max-w-[620px] overflow-y-auto bg-[#f8faf9] shadow-[-28px_0_80px_rgba(15,23,42,0.2)]">
            <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 px-7 py-6 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    New Member
                  </div>

                  <h2 className="text-[28px] font-bold tracking-[-0.035em] text-slate-900">
                    เพิ่มผู้ใช้งานใหม่
                  </h2>

                  <p className="mt-2 max-w-[470px] text-[14px] leading-6 text-slate-500">
                    กำหนดบทบาท โรงงาน และขอบเขตสิทธิ์
                    ให้พร้อมใช้งานตั้งแต่ครั้งแรก
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setDrawerOpen(false)
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form
              onSubmit={createUser}
              className="space-y-5 p-7"
            >
              <div className="rounded-[18px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="h-5 w-5" />
                  </span>

                  <div>
                    <p className="text-[15px] font-bold text-slate-800">
                      Multi-company protection
                    </p>

                    <p className="mt-1 text-[13px] leading-6 text-slate-500">
                      ผู้ใช้ใหม่จะถูกผูกกับบริษัทของ
                      Company Admin ที่กำลังล็อกอิน
                      โดยอัตโนมัติจากฝั่ง Server
                    </p>
                  </div>
                </div>
              </div>

              <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-[15px] font-bold text-slate-800">
                  ข้อมูลบัญชี
                </h3>

                <p className="mt-1 text-[12px] text-slate-400">
                  ข้อมูลพื้นฐานสำหรับการเข้าสู่ระบบ
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field
                    label="รหัสพนักงาน"
                    placeholder="เช่น OP006"
                    value={form.employeeCode}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        employeeCode:
                          value.toUpperCase(),
                      }))
                    }
                  />

                  <label>
                    <Label>บทบาท</Label>

                    <select
                      value={form.role}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          role: event.target
                            .value as
                            | "MANAGER"
                            | "OPERATOR",
                          departmentId: "",
                        }))
                      }
                      className="mt-2 h-[52px] w-full rounded-[13px] border border-slate-200 bg-slate-50 px-4 text-[14px] font-medium text-slate-700 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                    >
                      <option value="MANAGER">
                        Manager
                      </option>
                      <option value="OPERATOR">
                        Operator
                      </option>
                    </select>
                  </label>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field
                    label="ชื่อ"
                    placeholder="กรอกชื่อ"
                    value={form.firstName}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        firstName: value,
                      }))
                    }
                  />

                  <Field
                    label="นามสกุล"
                    placeholder="กรอกนามสกุล"
                    value={form.lastName}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        lastName: value,
                      }))
                    }
                  />
                </div>

                <div className="mt-4">
                  <Field
                    label="อีเมล"
                    type="email"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        email: value,
                      }))
                    }
                  />
                </div>

                <div className="mt-4">
                  <Field
                    label="รหัสผ่านเริ่มต้น"
                    type="password"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    value={form.password}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        password: value,
                      }))
                    }
                  />
                </div>
              </section>

              <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-[15px] font-bold text-slate-800">
                  ขอบเขตการเข้าถึง
                </h3>

                <p className="mt-1 text-[12px] text-slate-400">
                  ระบุโรงงานและแผนกที่ผู้ใช้งานสังกัด
                </p>

                <label className="mt-5 block">
                  <Label>โรงงาน</Label>

                  <select
                    required
                    value={form.factoryId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        factoryId:
                          event.target.value,
                        departmentId: "",
                      }))
                    }
                    className="mt-2 h-[52px] w-full rounded-[13px] border border-slate-200 bg-slate-50 px-4 text-[14px] font-medium text-slate-700 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                  >
                    <option value="">
                      เลือกโรงงาน
                    </option>

                    {factories.map(
                      (factory) => (
                        <option
                          key={
                            factory.factoryId
                          }
                          value={
                            factory.factoryId
                          }
                        >
                          {
                            factory.factoryCode
                          }{" "}
                          —{" "}
                          {
                            factory.factoryName
                          }
                        </option>
                      ),
                    )}
                  </select>
                </label>

                {form.role === "OPERATOR" && (
                  <label className="mt-4 block">
                    <Label>แผนก</Label>

                    <select
                      required
                      disabled={!form.factoryId}
                      value={form.departmentId}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          departmentId:
                            event.target.value,
                        }))
                      }
                      className="mt-2 h-[52px] w-full rounded-[13px] border border-slate-200 bg-slate-50 px-4 text-[14px] font-medium text-slate-700 outline-none disabled:opacity-50 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                    >
                      <option value="">
                        {form.factoryId
                          ? "เลือกแผนก"
                          : "เลือกโรงงานก่อน"}
                      </option>

                      {filteredDepartments.map(
                        (department) => (
                          <option
                            key={
                              department.departmentId
                            }
                            value={
                              department.departmentId
                            }
                          >
                            {
                              department.buildingName
                            }{" "}
                            /{" "}
                            {
                              department.departmentName
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                )}

                {form.role === "MANAGER" && (
                  <div className="mt-4 rounded-[14px] border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] leading-6 text-blue-700">
                    Manager จะถูกผูกกับโรงงานที่เลือก
                    และเมื่อเข้าสู่ระบบจะเห็นเฉพาะโรงงานของตัวเอง
                    แต่สามารถเลือกดูอาคารภายในโรงงานนั้นได้
                  </div>
                )}
              </section>

              <div className="sticky bottom-0 -mx-7 mt-6 border-t border-slate-200 bg-white/95 px-7 py-5 backdrop-blur">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setDrawerOpen(false)
                    }
                    className="h-12 rounded-[13px] border border-slate-200 bg-white px-6 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    ยกเลิก
                  </button>

                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex h-12 items-center gap-2 rounded-[13px] bg-emerald-700 px-6 text-[14px] font-bold text-white shadow-[0_10px_24px_rgba(5,120,73,0.2)] transition hover:bg-emerald-800 disabled:opacity-50"
                  >
                    <UserPlus className="h-5 w-5" />

                    {busy
                      ? "กำลังสร้าง..."
                      : "เพิ่มผู้ใช้งาน"}
                  </button>
                </div>
              </div>
            </form>
          </aside>
        </>
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon,
  warning = false,
}: {
  label: string;
  value: number | string;
  detail: string;
  icon: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[18px] border border-slate-200 bg-white px-5 py-5 shadow-[0_8px_26px_rgba(15,23,42,0.04)]">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${
          warning
            ? "bg-amber-50 text-amber-600"
            : "bg-emerald-50 text-emerald-700"
        }`}
      >
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[27px] font-bold leading-none text-slate-900">
          {value}
        </p>

        <p className="mt-2 text-[14px] font-bold text-slate-700">
          {label}
        </p>

        <p className="mt-1 truncate text-[12px] text-slate-400">
          {detail}
        </p>
      </div>
    </div>
  );
}

function Head({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-4 py-4 text-left text-[12px] font-bold uppercase tracking-[0.08em] text-slate-400 first:px-5">
      {children}
    </th>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="h-[50px] rounded-[14px] border border-slate-200 bg-white px-4 text-[14px] font-medium text-slate-600 outline-none focus:border-emerald-400"
    >
      {options.map(
        ([optionValue, label]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {label}
          </option>
        ),
      )}
    </select>
  );
}

function Label({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="text-[13px] font-semibold text-slate-600">
      {children} *
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>

      <input
        required
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 h-[52px] w-full rounded-[13px] border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
      />
    </label>
  );
}