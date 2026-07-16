"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface AuthUser {
  id: number; // = User.userId
  companyId: number | null;
  name: string; // = firstName + lastName
  role: string; // = Role.roleName เช่น "Operator" (มาจาก DB จริง ไม่ fix ค่าตายตัว)
  avatarInitial: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * AuthProvider รับ user จริงที่ fetch มาจาก server (lib/auth.ts -> getCurrentUser())
 * แล้วส่งต่อผ่าน context ให้ Header/Sidebar ฝั่ง client ใช้งาน
 */
export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: AuthUser | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}