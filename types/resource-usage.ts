export type ResourceCategory =
  | "ELECTRICITY"
  | "WATER"
  | "DIESEL"
  | "STEAM"
  | "WASTE";

export type ResourceStatus = "NORMAL" | "WARNING" | "ERROR";
export type ResourceSource = "QR" | "SENSOR" | "MANUAL" | "API";

export type ResourceUsageRecord = {
  id: string;
  reference: string;
  occurredAt: string;
  machineName: string;
  machineCode: string;
  resourceCategory: ResourceCategory;
  resourceName: string;
  quantity: number;
  unit: string;
  emissionFactor: number;
  carbonValue: number;
  carbonUnit: string;
  operatorName: string;
  operatorRole: string;
  building: string;
  department: string;
  productionLine: string;
  sourceType: ResourceSource;
  sensorName?: string;
  sensorCode?: string;
  note?: string;
  status: ResourceStatus;
  createdAt: string;
  updatedAt: string;
};
