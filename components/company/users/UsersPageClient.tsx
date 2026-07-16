"use client";

import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleEllipsis,
  Filter,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type UserStatus = "ACTIVE" | "SUSPENDED";
type UserRole = "COMPANY_ADMIN" | "MANAGER" | "OPERATOR" | "VIEWER";

type UserItem = {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  lastLogin: string;
};

type NewUserForm = {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
};

const PAGE_SIZE = 8;

const initialUsers: UserItem[] = [
  {
    id: 1,
    employeeCode: "CA001",
    firstName: "Company",
    lastName: "Admin",
    email: "admin@gf.com",
    role: "COMPANY_ADMIN",
    department: "ผู้บริหาร",
    status: "ACTIVE",
    lastLogin: "16 ก.ค. 2569 00:47",
  },
  {
    id: 2,
    employeeCode: "MG001",
    firstName: "ณัฐวุฒิ",
    lastName: "ศรีสุข",
    email: "manager01@gf.com",
    role: "MANAGER",
    department: "ฝ่ายผลิต",
    status: "ACTIVE",
    lastLogin: "15 ก.ค. 2569 21:15",
  },
  {
    id: 3,
    employeeCode: "OP001",
    firstName: "กิตติพงษ์",
    lastName: "มีชัย",
    email: "operator01@gf.com",
    role: "OPERATOR",
    department: "ฝ่ายผลิต",
    status: "ACTIVE",
    lastLogin: "15 ก.ค. 2569 20:42",
  },
  {
    id: 4,
    employeeCode: "OP002",
    firstName: "พิมพ์ชนก",
    lastName: "แก้วดี",
    email: "operator02@gf.com",
    role: "OPERATOR",
    department: "ฝ่ายซ่อมบำรุง",
    status: "ACTIVE",
    lastLogin: "15 ก.ค. 2569 19:58",
  },
  {
    id: 5,
    employeeCode: "VW001",
    firstName: "สิรภพ",
    lastName: "จันทร์งาม",
    email: "viewer01@gf.com",
    role: "VIEWER",
    department: "ฝ่ายบัญชี",
    status: "ACTIVE",
    lastLogin: "15 ก.ค. 2569 17:10",
  },
  {
    id: 6,
    employeeCode: "OP003",
    firstName: "วรวิทย์",
    lastName: "อินทร์แก้ว",
    email: "operator03@gf.com",
    role: "OPERATOR",
    department: "ฝ่ายคลังสินค้า",
    status: "SUSPENDED",
    lastLogin: "14 ก.ค. 2569 16:30",
  },
  {
    id: 7,
    employeeCode: "VW002",
    firstName: "ปวีณา",
    lastName: "รัตนวิถี",
    email: "viewer02@gf.com",
    role: "VIEWER",
    department: "ฝ่ายคุณภาพ",
    status: "ACTIVE",
    lastLogin: "14 ก.ค. 2569 15:20",
  },
  {
    id: 8,
    employeeCode: "OP004",
    firstName: "กานต์พงศ์",
    lastName: "สุขสวัสดิ์",
    email: "operator04@gf.com",
    role: "OPERATOR",
    department: "ฝ่ายผลิต",
    status: "SUSPENDED",
    lastLogin: "13 ก.ค. 2569 11:05",
  },
  {
    id: 9,
    employeeCode: "MG002",
    firstName: "ชลธิชา",
    lastName: "วรรณดี",
    email: "manager02@gf.com",
    role: "MANAGER",
    department: "ฝ่ายคุณภาพ",
    status: "ACTIVE",
    lastLogin: "12 ก.ค. 2569 09:45",
  },
  {
    id: 10,
    employeeCode: "OP005",
    firstName: "ธนภัทร",
    lastName: "บุญมี",
    email: "operator05@gf.com",
    role: "OPERATOR",
    department: "ฝ่ายซ่อมบำรุง",
    status: "ACTIVE",
    lastLogin: "11 ก.ค. 2569 08:30",
  },
];

const emptyForm: NewUserForm = {
  employeeCode: "",
  firstName: "",
  lastName: "",
  email: "",
  role: "OPERATOR",
  department: "ฝ่ายผลิต",
  status: "ACTIVE",
};

function getRoleLabel(role: UserRole) {
  switch (role) {
    case "COMPANY_ADMIN":
      return "ผู้ดูแลบริษัท";
    case "MANAGER":
      return "ผู้จัดการ";
    case "OPERATOR":
      return "ผู้ปฏิบัติงาน";
    case "VIEWER":
      return "ผู้ดูข้อมูล";
  }
}

function getRoleBadge(role: UserRole) {
  switch (role) {
    case "COMPANY_ADMIN":
      return "bg-[#e8f7ef] text-[#24734b]";
    case "MANAGER":
      return "bg-[#eaf1ff] text-[#4267ad]";
    case "OPERATOR":
      return "bg-[#f1ebff] text-[#7251b5]";
    case "VIEWER":
      return "bg-[#eef1f4] text-[#66717f]";
  }
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "US";
}

export default function UsersPageClient() {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);
  const [form, setForm] = useState<NewUserForm>(emptyForm);

  const departments = useMemo(
    () => Array.from(new Set(users.map((user) => user.department))),
    [users],
  );

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();

      const matchesSearch =
        !keyword ||
        fullName.includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.employeeCode.toLowerCase().includes(keyword);

      const matchesRole =
        roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" || user.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "ALL" ||
        user.department === departmentFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesDepartment
      );
    });
  }, [users, search, roleFilter, statusFilter, departmentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const activeCount = users.filter((user) => user.status === "ACTIVE").length;
  const suspendedCount = users.filter(
    (user) => user.status === "SUSPENDED",
  ).length;
  const roleCount = new Set(users.map((user) => user.role)).size;

  function resetFilters() {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setDepartmentFilter("ALL");
    setPage(1);
  }

  function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newUser: UserItem = {
      id: Date.now(),
      employeeCode: form.employeeCode.trim().toUpperCase(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      department: form.department,
      status: form.status,
      lastLogin: "ยังไม่เคยเข้าสู่ระบบ",
    };

    setUsers((current) => [newUser, ...current]);
    setForm(emptyForm);
    setDrawerOpen(false);
    setPage(1);
  }

  function toggleUserStatus(userId: number) {
    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
            }
          : user,
      ),
    );
    setActionMenuId(null);
  }

  return (
    <>
      <section className="mx-auto w-full max-w-[1600px]">
        {/* Header */}
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f7f0] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#25734d]">
              <Users className="h-3.5 w-3.5" strokeWidth={1.8} />
              User Management
            </div>

            <h1 className="mt-4 text-[30px] font-semibold tracking-[-0.045em] text-[#182334] sm:text-[36px]">
              ผู้ใช้งาน
            </h1>

            <p className="mt-2 text-[11px] leading-5 text-[#788392]">
              จัดการบัญชีผู้ใช้งาน บทบาท แผนก และสถานะการเข้าถึงระบบ
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex min-h-[44px] w-fit items-center justify-center gap-2.5 rounded-[12px] bg-[#1f8f62] px-5 text-[11px] font-semibold text-white shadow-[0_12px_28px_rgba(31,143,98,0.2)] transition hover:-translate-y-0.5 hover:bg-[#187852]"
          >
            <Plus className="h-4 w-4" />
            เพิ่มผู้ใช้งาน
          </button>
        </header>

        {/* Summary cards */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "ผู้ใช้งานทั้งหมด",
              value: users.length,
              detail: "บัญชีภายในบริษัท",
              icon: Users,
            },
            {
              label: "บัญชีที่เปิดใช้งาน",
              value: activeCount,
              detail: "พร้อมเข้าสู่ระบบ",
              icon: CheckCircle2,
            },
            {
              label: "บัญชีที่ระงับ",
              value: suspendedCount,
              detail: "ถูกจำกัดการเข้าถึง",
              icon: UserX,
            },
            {
              label: "บทบาททั้งหมด",
              value: roleCount,
              detail: "ระดับสิทธิ์ในระบบ",
              icon: ShieldCheck,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.label}
                className="rounded-[18px] border border-[#dfe5eb] bg-white p-5 shadow-[0_10px_32px_rgba(26,38,57,0.04)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#ebf7f1] text-[#24805a]">
                    <Icon className="h-[19px] w-[19px]" strokeWidth={1.7} />
                  </span>

                  <p className="text-[30px] font-semibold tracking-[-0.05em] text-[#1b2638]">
                    {item.value.toLocaleString("th-TH")}
                  </p>
                </div>

                <p className="mt-5 text-[11px] font-semibold text-[#394659]">
                  {item.label}
                </p>

                <p className="mt-1 text-[8px] text-[#929ca9]">
                  {item.detail}
                </p>
              </article>
            );
          })}
        </div>

        {/* Table card */}
        <article className="mt-5 overflow-hidden rounded-[20px] border border-[#dfe5eb] bg-white shadow-[0_12px_38px_rgba(26,38,57,0.045)]">
          <div className="border-b border-[#e6ebf0] p-4 sm:p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="flex h-[44px] w-full min-w-0 items-center gap-3 rounded-[12px] border border-[#dfe5eb] bg-[#f8fafb] px-3.5 transition focus-within:border-[#53a986] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#53a986]/8 xl:max-w-[360px]">
                <Search className="h-4 w-4 text-[#84909f]" strokeWidth={1.6} />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="ค้นหาชื่อ อีเมล หรือรหัสพนักงาน"
                  className="min-w-0 flex-1 bg-transparent text-[10px] text-[#344154] outline-none placeholder:text-[#9ca6b2]"
                />
              </div>

              <div className="grid flex-1 gap-3 sm:grid-cols-3">
                <select
                  value={roleFilter}
                  onChange={(event) => {
                    setRoleFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-[44px] rounded-[12px] border border-[#dfe5eb] bg-white px-3.5 text-[10px] text-[#5c6878] outline-none"
                >
                  <option value="ALL">ทุกบทบาท</option>
                  <option value="COMPANY_ADMIN">ผู้ดูแลบริษัท</option>
                  <option value="MANAGER">ผู้จัดการ</option>
                  <option value="OPERATOR">ผู้ปฏิบัติงาน</option>
                  <option value="VIEWER">ผู้ดูข้อมูล</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-[44px] rounded-[12px] border border-[#dfe5eb] bg-white px-3.5 text-[10px] text-[#5c6878] outline-none"
                >
                  <option value="ALL">ทุกสถานะ</option>
                  <option value="ACTIVE">เปิดใช้งาน</option>
                  <option value="SUSPENDED">ระงับการใช้งาน</option>
                </select>

                <select
                  value={departmentFilter}
                  onChange={(event) => {
                    setDepartmentFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-[44px] rounded-[12px] border border-[#dfe5eb] bg-white px-3.5 text-[10px] text-[#5c6878] outline-none"
                >
                  <option value="ALL">ทุกแผนก</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#dfe5eb] bg-white px-4 text-[10px] font-medium text-[#667283] transition hover:bg-[#f5f7f9]"
              >
                <Filter className="h-4 w-4" />
                ล้างตัวกรอง
              </button>
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1050px] border-collapse">
              <thead>
                <tr className="border-b border-[#e7ebef] bg-[#fafbfc] text-left">
                  <th className="px-5 py-4 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#8c97a5]">
                    ผู้ใช้งาน
                  </th>
                  <th className="px-4 py-4 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#8c97a5]">
                    รหัสพนักงาน
                  </th>
                  <th className="px-4 py-4 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#8c97a5]">
                    บทบาท
                  </th>
                  <th className="px-4 py-4 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#8c97a5]">
                    แผนก
                  </th>
                  <th className="px-4 py-4 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#8c97a5]">
                    สถานะ
                  </th>
                  <th className="px-4 py-4 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#8c97a5]">
                    เข้าสู่ระบบล่าสุด
                  </th>
                  <th className="w-[72px] px-4 py-4" />
                </tr>
              </thead>

              <tbody>
                {visibleUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[#edf0f3] transition last:border-0 hover:bg-[#fbfcfd]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e6f5ed] text-[10px] font-semibold text-[#24764f]">
                          {getInitials(user.firstName, user.lastName)}
                        </span>

                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate text-[10px] font-semibold text-[#344154]">
                            {user.firstName} {user.lastName}
                          </p>

                          <p className="mt-1 flex items-center gap-1.5 truncate text-[8px] text-[#8f99a6]">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-[9px] font-medium text-[#667283]">
                      {user.employeeCode}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-medium ${getRoleBadge(
                          user.role,
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-[9px] text-[#667283]">
                      {user.department}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-medium ${
                          user.status === "ACTIVE"
                            ? "bg-[#e8f7ef] text-[#24734b]"
                            : "bg-[#fff0f0] text-[#b14848]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === "ACTIVE"
                              ? "bg-[#2ba46b]"
                              : "bg-[#dc5c5c]"
                          }`}
                        />
                        {user.status === "ACTIVE"
                          ? "เปิดใช้งาน"
                          : "ระงับการใช้งาน"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-[8px] text-[#8c97a5]">
                      {user.lastLogin}
                    </td>

                    <td className="relative px-4 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setActionMenuId((current) =>
                            current === user.id ? null : user.id,
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#7a8594] transition hover:bg-[#eef2f5] hover:text-[#273449]"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {actionMenuId === user.id && (
                        <div className="absolute right-4 top-[48px] z-20 w-[170px] rounded-[12px] border border-[#dfe5eb] bg-white p-1.5 shadow-[0_18px_48px_rgba(23,35,55,0.15)]">
                          <button
                            type="button"
                            onClick={() => setActionMenuId(null)}
                            className="flex min-h-[38px] w-full items-center gap-2.5 rounded-[9px] px-3 text-left text-[10px] text-[#536071] transition hover:bg-[#f4f6f8]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            แก้ไขข้อมูล
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleUserStatus(user.id)}
                            className={`flex min-h-[38px] w-full items-center gap-2.5 rounded-[9px] px-3 text-left text-[10px] transition ${
                              user.status === "ACTIVE"
                                ? "text-[#b14848] hover:bg-[#fff1f1]"
                                : "text-[#23734b] hover:bg-[#edf8f2]"
                            }`}
                          >
                            {user.status === "ACTIVE" ? (
                              <Ban className="h-3.5 w-3.5" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            {user.status === "ACTIVE"
                              ? "ระงับบัญชี"
                              : "เปิดใช้งานบัญชี"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[#e8edf1] md:hidden">
            {visibleUsers.map((user) => (
              <div key={user.id} className="p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e6f5ed] text-[10px] font-semibold text-[#24764f]">
                    {getInitials(user.firstName, user.lastName)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold text-[#344154]">
                      {user.firstName} {user.lastName}
                    </p>

                    <p className="mt-1 truncate text-[8px] text-[#8f99a6]">
                      {user.email}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[8px] font-medium ${getRoleBadge(
                      user.role,
                    )}`}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-[8px]">
                  <div>
                    <p className="text-[#9aa3ae]">แผนก</p>
                    <p className="mt-1 font-medium text-[#566274]">
                      {user.department}
                    </p>
                  </div>

                  <div>
                    <p className="text-[#9aa3ae]">สถานะ</p>
                    <p
                      className={`mt-1 font-medium ${
                        user.status === "ACTIVE"
                          ? "text-[#23734b]"
                          : "text-[#b14848]"
                      }`}
                    >
                      {user.status === "ACTIVE"
                        ? "เปิดใช้งาน"
                        : "ระงับการใช้งาน"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {visibleUsers.length === 0 && (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
              <Users className="h-8 w-8 text-[#8a96a4]" strokeWidth={1.5} />

              <p className="mt-4 text-[12px] font-semibold text-[#465365]">
                ไม่พบผู้ใช้งาน
              </p>

              <p className="mt-2 text-[9px] text-[#929ca8]">
                ลองเปลี่ยนคำค้นหาหรือตัวกรอง
              </p>
            </div>
          )}

          <footer className="flex flex-col gap-3 border-t border-[#e7ebef] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[9px] text-[#8f99a6]">
              แสดง {visibleUsers.length} จาก {filteredUsers.length} รายการ
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-[#dfe5eb] text-[#687485] transition hover:bg-[#f3f5f7] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="min-w-[72px] text-center text-[9px] text-[#687485]">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-[#dfe5eb] text-[#687485] transition hover:bg-[#f3f5f7] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </article>
      </section>

      {/* Add user drawer */}
      {drawerOpen && (
        <>
          <button
            type="button"
            aria-label="ปิดหน้าต่างเพิ่มผู้ใช้งาน"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-[70] bg-[#0d1726]/35 backdrop-blur-[2px]"
          />

          <aside className="fixed inset-y-0 right-0 z-[80] w-full max-w-[520px] overflow-y-auto bg-white shadow-[-24px_0_70px_rgba(17,31,51,0.18)]">
            <div className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-[#e5e9ee] bg-white px-6">
              <div>
                <h2 className="text-[16px] font-semibold tracking-[-0.025em] text-[#263247]">
                  เพิ่มผู้ใช้งาน
                </h2>

                <p className="mt-1 text-[8px] text-[#929ca9]">
                  Frontend preview — ยังไม่บันทึกลงฐานข้อมูล
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#718091] transition hover:bg-[#eef2f5] hover:text-[#2f3c50]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[10px] font-medium text-[#465365]">
                    รหัสพนักงาน *
                  </span>

                  <input
                    required
                    value={form.employeeCode}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        employeeCode: event.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="เช่น OP006"
                    className="mt-2 h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] uppercase text-[#2e3b4f] outline-none transition focus:border-[#4d9c7a] focus:bg-white focus:ring-4 focus:ring-[#4d9c7a]/8"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-medium text-[#465365]">
                    สถานะ *
                  </span>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as UserStatus,
                      }))
                    }
                    className="mt-2 h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8"
                  >
                    <option value="ACTIVE">เปิดใช้งาน</option>
                    <option value="SUSPENDED">ระงับการใช้งาน</option>
                  </select>
                </label>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[10px] font-medium text-[#465365]">
                    ชื่อ *
                  </span>

                  <input
                    required
                    value={form.firstName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                    placeholder="กรอกชื่อ"
                    className="mt-2 h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none transition focus:border-[#4d9c7a] focus:bg-white focus:ring-4 focus:ring-[#4d9c7a]/8"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-medium text-[#465365]">
                    นามสกุล *
                  </span>

                  <input
                    required
                    value={form.lastName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                    placeholder="กรอกนามสกุล"
                    className="mt-2 h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none transition focus:border-[#4d9c7a] focus:bg-white focus:ring-4 focus:ring-[#4d9c7a]/8"
                  />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="text-[10px] font-medium text-[#465365]">
                  อีเมล *
                </span>

                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="name@gf.com"
                  className="mt-2 h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none transition focus:border-[#4d9c7a] focus:bg-white focus:ring-4 focus:ring-[#4d9c7a]/8"
                />
              </label>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[10px] font-medium text-[#465365]">
                    บทบาท *
                  </span>

                  <select
                    value={form.role}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        role: event.target.value as UserRole,
                      }))
                    }
                    className="mt-2 h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8"
                  >
                    <option value="COMPANY_ADMIN">ผู้ดูแลบริษัท</option>
                    <option value="MANAGER">ผู้จัดการ</option>
                    <option value="OPERATOR">ผู้ปฏิบัติงาน</option>
                    <option value="VIEWER">ผู้ดูข้อมูล</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-[10px] font-medium text-[#465365]">
                    แผนก *
                  </span>

                  <select
                    value={form.department}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        department: event.target.value,
                      }))
                    }
                    className="mt-2 h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8"
                  >
                    <option>ผู้บริหาร</option>
                    <option>ฝ่ายผลิต</option>
                    <option>ฝ่ายซ่อมบำรุง</option>
                    <option>ฝ่ายคลังสินค้า</option>
                    <option>ฝ่ายคุณภาพ</option>
                    <option>ฝ่ายบัญชี</option>
                  </select>
                </label>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 border-t border-[#e6eaf0] pt-5">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="min-h-[44px] rounded-[11px] border border-[#dfe5eb] bg-white px-5 text-[10px] font-medium text-[#667283] transition hover:bg-[#f4f6f8]"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2.5 rounded-[11px] bg-[#1f8f62] px-5 text-[10px] font-semibold text-white shadow-[0_10px_24px_rgba(31,143,98,0.18)] transition hover:bg-[#187852]"
                >
                  <UserPlus className="h-4 w-4" />
                  เพิ่มผู้ใช้งาน
                </button>
              </div>
            </form>
          </aside>
        </>
      )}
    </>
  );
}