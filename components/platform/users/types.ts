export type UserStatus = "ACTIVE" | "SUSPENDED" | "EXPIRED";

export type UserRole =
  | "PLATFORM_ADMIN"
  | "COMPANY_ADMIN"
  | "MANAGER"
  | "OPERATOR"
  | "VIEWER";

export type DatabaseRoleCode =
  | "PLATFORM_ADMIN"
  | "COMPANY_ADMIN"
  | "FACTORY_MANAGER"
  | "ENVIRONMENT_OFFICER";

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

export type UserOption = {
  id: number;
  code: string;
  name: string;
};

export type FactoryOption = UserOption & {
  companyId: number;
};

export type DepartmentOption = UserOption & {
  factoryId: number;
};

export type RoleOption = {
  id: number;
  code: DatabaseRoleCode;
  name: string;
  description: string;
};

export type CreateUserOptions = {
  roles: RoleOption[];
  companies: UserOption[];
  factories: FactoryOption[];
  departments: DepartmentOption[];
};

export type NewUserForm = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  employeeCode: string;
  password: string;
  confirmPassword: string;
  roleCode: DatabaseRoleCode | "";
  companyId: string;
  factoryId: string;
  departmentId: string;
  status: "ACTIVE" | "INACTIVE" | "LOCKED";
};
