export type QRCodeStatus = "ACTIVE" | "SUSPENDED" | "REVOKED";
export type QRTargetType = "MACHINE" | "CHECKPOINT";

export type QRHierarchyItem = {
  id: number;
  code: string;
  name: string;
};

export type QRTarget = {
  targetType: QRTargetType;
  targetId: number;
  targetCode: string;
  targetName: string;

  factory: QRHierarchyItem;
  building: QRHierarchyItem;
  department: QRHierarchyItem;
  productionLine: QRHierarchyItem;
};

export type QRCodeItem = {
  id: string;

  code: string;
  token: string;

  targetType: QRTargetType;
  targetId: number;
  targetName: string;
  targetCode: string;

  factory: QRHierarchyItem;
  building: QRHierarchyItem;
  department: QRHierarchyItem;
  productionLine: QRHierarchyItem;

  status: QRCodeStatus;

  imagePath: string | null;

  generatedAt: string;
  revokedAt: string | null;

  createdAt: string;
  updatedAt: string;

  scanCount: number;
};

export type QRCodeFormValue = {
  code: string;
  targetType: QRTargetType;
  targetId: number;
  status: QRCodeStatus;
};

export type QRCodeListResponse = {
  success: boolean;
  message?: string;

  data: QRCodeItem[];
  targets: QRTarget[];

  summary: {
    total: number;
    active: number;
    suspended: number;
    revoked: number;
    scans: number;
  };
};