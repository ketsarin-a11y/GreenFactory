export type UserStatus = "ACTIVE" | "SUSPENDED" | "EXPIRED";

export type UserRole =
  | "PLATFORM_ADMIN"
  | "COMPANY_ADMIN"
  | "MANAGER"
  | "OPERATOR"
  | "VIEWER";

export type UserRow = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  company: string;
  companyCode: string;
  role: UserRole;
  position: string;
  office: string;
  registeredAt: string;
  registeredTime: string;
  lastLogin: string;
  status: UserStatus;
  avatarUrl: string | null;
};
