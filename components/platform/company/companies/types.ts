export type CompanyStatus = "ACTIVE" | "PENDING" | "SUSPENDED";
export type CompanyPlan = "TRIAL" | "STANDARD" | "ENTERPRISE";

export type Company = {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  province: string;
  industry: string;
  contactName: string;
  status: CompanyStatus;
  plan: CompanyPlan;
  factories: number;
  users: number;
  machines: number;
  sensors: number;
  alerts: number;
  storageUsedGb: number;
  storageLimitGb: number;
  registeredAt: string;
  lastActivityAt?: string | null;
};

export type NewCompany = Pick<
  Company,
  "code" | "name" | "email" | "phone" | "province" | "industry" | "contactName" | "plan"
>;

export type CompanySummary = {
  totalCompanies: number;
  activeCompanies: number;
  pendingCompanies: number;
  suspendedCompanies: number;
  totalFactories: number;
  totalUsers: number;
  totalMachines: number;
  totalSensors: number;
  unresolvedAlerts: number;
};

export type CompaniesApiResponse = {
  success: boolean;
  message?: string;
  data: Company[];
  summary: CompanySummary;
  meta: { page: number; pageSize: number; totalItems: number; totalPages: number };
};
