export type QRCodeStatus = "ACTIVE" | "SUSPENDED" | "REVOKED";
export type QRTargetType = "MACHINE" | "CHECKPOINT";

export type QRCodeItem = {
  id: string;
  code: string;
  token: string;
  targetType: QRTargetType;
  targetName: string;
  targetCode: string;
  building: string;
  department: string;
  productionLine: string;
  status: QRCodeStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  note: string;
};

export type QRCodeFormValue = Omit<
  QRCodeItem,
  "id" | "token" | "createdAt" | "updatedAt"
>;
