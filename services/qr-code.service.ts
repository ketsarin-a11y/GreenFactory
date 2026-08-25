import type {
  QRCodeFormValue,
  QRCodeItem,
  QRCodeListResponse,
  QRTarget,
} from "@/types/qr-code";

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok || payload?.success === false) {
    throw new Error(
      payload?.message ||
        `Request failed with status ${response.status}`,
    );
  }

  return payload as T;
}

export const qrCodeService = {
  async getAll(): Promise<{
    items: QRCodeItem[];
    targets: QRTarget[];
  }> {
    const response = await fetch("/api/company/qr-codes", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const payload =
      await parseResponse<QRCodeListResponse>(response);

    return {
      items: payload.data ?? [],
      targets: payload.targets ?? [],
    };
  },

  async create(value: QRCodeFormValue) {
    const response = await fetch("/api/company/qr-codes", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        qrCode: value.code,
        targetType: value.targetType,
        targetId: value.targetId,
        status: value.status,
      }),
    });

    const payload = await parseResponse<{
      success: boolean;
      message?: string;
      data: {
        id: string;
        code: string;
        token: string;
        status: string;
        generatedAt: string;
        revokedAt: string | null;
        createdAt: string;
        updatedAt: string;
      };
    }>(response);

    return payload.data;
  },
};