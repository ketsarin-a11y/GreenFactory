export type FactoryStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type FactoryCompany = {
  companyId: number;
  companyCode: string;
  companyName: string;
};

export type Factory = {
  id: number;
  code: string;
  name: string;
  company: FactoryCompany;
  address: string;
  province: string;
  postalCode: string;
  country: string;
  latitude: string | null;
  longitude: string | null;
  googleMapUrl: string;
  mapZoom: number;
  layoutImagePath: string | null;
  phone: string;
  email: string;
  timezone: string;
  status: FactoryStatus;
  buildings: number;
  users: number;
  resourceUsages: number;
  createdAt: string;
  updatedAt: string;
};

export type FactorySummary = {
  totalFactories: number;
  activeFactories: number;
  inactiveFactories: number;
  suspendedFactories: number;
  totalBuildings: number;
  totalUsers: number;
};

export type FactoriesResponse = {
  success: boolean;
  message?: string;
  data: Factory[];
  summary: FactorySummary;
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

export type CompanyOption = {
  id: number;
  code: string;
  name: string;
};

export type NewFactory = {
  companyId: number;
  code: string;
  name: string;
  address: string;
  province: string;
  postalCode: string;
  country: string;
  latitude: string;
  longitude: string;
  googleMapUrl: string;
  phone: string;
  email: string;
  timezone: string;
};
