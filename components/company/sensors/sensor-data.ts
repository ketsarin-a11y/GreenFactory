export type SensorConnectionStatus =
  | "ONLINE"
  | "OFFLINE"
  | "MAINTENANCE"
  | "FAULT";

export type SensorRegistryStatus = "ACTIVE" | "INACTIVE";

export type SensorTypeOption = {
  id: number;
  code: string;
  name: string;
  description: string | null;
};

export type MachineOption = {
  id: number;
  code: string;
  name: string;
  machineType: { id: number; code: string; name: string };
  factory: { id: number; code: string; name: string };
  building: { id: number; code: string; name: string };
  department: { id: number; code: string; name: string };
  productionLine: { id: number; code: string; name: string };
};

export type SensorItem = {
  id: number;
  code: string;
  name: string;
  serialNumber: string | null;
  manufacturer: string | null;
  protocol: string | null;
  connectionAddress: string | null;
  dataTopic: string | null;
  samplingIntervalSeconds: number | null;
  lastConnectedAt: string | null;
  installationDate: string | null;
  lastCalibrationDate: string | null;
  nextCalibrationDate: string | null;
  status: SensorRegistryStatus;
  connectionStatus: SensorConnectionStatus;
  type: { id: number; code: string; name: string };
  machine: { id: number; code: string; name: string; type: string };
  productionLine: { id: number; code: string; name: string };
  department: { id: number; code: string; name: string };
  building: { id: number; code: string; name: string };
  factory: { id: number; code: string; name: string };
  latestData: null | {
    id: string;
    rawValue: string;
    processedValue: string | null;
    qualityStatus: string;
    measuredAt: string;
    receivedAt: string;
    unit: { id: number; code: string; name: string; symbol: string };
  };
};

export type SensorsApiResponse = {
  success: boolean;
  message?: string;
  data?: SensorItem[];
  machines?: MachineOption[];
  sensorTypes?: SensorTypeOption[];
  summary?: {
    total: number;
    online: number;
    offline: number;
    maintenance: number;
    fault: number;
  };
};

export const protocols = [
  "Modbus TCP",
  "Modbus RTU",
  "MQTT",
  "OPC UA",
  "HTTP API",
  "LoRaWAN",
  "BACnet",
  "Manual",
];
