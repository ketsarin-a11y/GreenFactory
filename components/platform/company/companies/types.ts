export type CompanyStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE";

export type Company = {
  id: number;
  name: string;
  email: string;
  code: string;
  industry: string;
  contactName: string;
  phone: string;
  registeredAt: string;
  registeredTime: string;
  status: CompanyStatus;
  logoText: string;
  logoClass: string;
  factories: number;
  users: number;
  province: string;
};

export type NewCompany = {
  name: string;
  email: string;
  code: string;
  industry: string;
  contactName: string;
  phone: string;
  province: string;
};
