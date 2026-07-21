"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface AuthUser {
  id: number; // = User.userId
  companyId: number | null;
  name: string; // = firstName + lastName
  roleName: string; // ค่าจริงจาก DB เช่น "OPERATOR" — ใช้เช็คสิทธิ์/route guard
  role: string; // ข้อความที่โชว์ใน UI เช่น "Operator" (แปลงจาก roleName ผ่าน lib/roles.ts)
  avatarInitial: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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