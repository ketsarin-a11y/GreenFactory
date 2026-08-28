import "server-only";

import { prisma } from "@/lib/prisma";
import {
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  isAllowedRole,
} from "@/lib/roles";

export interface ProfileDetail {
  userId: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  employeeCode: string | null;
  phone: string | null;
  department: string | null;
  productionLine: string | null;
  profileImagePath: string | null;
  avatarUrl: string | null;
  roleLabel: string;
  permissions: string[];
  companyName: string | null;
  status: string;
  lastLogin: string | null;
  createdAt: string;
}

export async function getProfileDetail(
  userId: number,
): Promise<ProfileDetail | null> {
  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
    include: {
      role: true,
      company: true,
    },
  });

  if (!user) {
    return null;
  }

  const roleName = user.role.roleName;

  const roleLabel = isAllowedRole(roleName)
    ? ROLE_LABELS[roleName]
    : roleName;

  const permissions = isAllowedRole(roleName)
    ? ROLE_PERMISSIONS[roleName]
    : [];

  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    employeeCode: user.employeeCode,
    phone: user.phone,
    department: user.department,
    productionLine: user.productionLine,
    profileImagePath: user.profileImagePath,
    avatarUrl: user.profileImagePath,
    roleLabel,
    permissions,
    companyName: user.company?.companyName ?? null,
    status: user.status,
    lastLogin: user.lastLogin
      ? user.lastLogin.toISOString()
      : null,
    createdAt: user.createdAt.toISOString(),
  };
}