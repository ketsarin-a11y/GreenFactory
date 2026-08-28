export type ProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employeeCode: string;
  position: string;
  department: string;
  companyName: string;
  factoryName: string;
  preferredLanguage: string;
  timezone: string;
};

export type ActivityItem = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  type: "login" | "report" | "user" | "settings";
};

export type SessionItem = {
  id: number;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
};
