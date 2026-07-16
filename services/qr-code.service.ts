import { initialQRCodes } from "@/components/company/qr-codes/qr-code-data";
import type { QRCodeFormValue, QRCodeItem } from "@/types/qr-code";

const STORAGE_KEY = "greenfactory_qr_codes";

function readItems(): QRCodeItem[] {
  if (typeof window === "undefined") return initialQRCodes;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialQRCodes));
    return initialQRCodes;
  }
  try {
    return JSON.parse(raw) as QRCodeItem[];
  } catch {
    return initialQRCodes;
  }
}

function writeItems(items: QRCodeItem[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

export const qrCodeService = {
  async getAll() {
    return readItems();
  },
  async create(value: QRCodeFormValue) {
    const now = new Date().toLocaleString("th-TH");
    const item: QRCodeItem = {
      ...value,
      id: crypto.randomUUID(),
      token: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    writeItems([item, ...readItems()]);
    return item;
  },
  async update(item: QRCodeItem) {
    const updated = { ...item, updatedAt: new Date().toLocaleString("th-TH") };
    writeItems(readItems().map((current) => current.id === item.id ? updated : current));
    return updated;
  },
  async remove(id: string) {
    writeItems(readItems().filter((item) => item.id !== id));
  },
  async regenerateToken(id: string) {
    const current = readItems().find((item) => item.id === id);
    if (!current) return null;
    const updated: QRCodeItem = {
      ...current,
      token: crypto.randomUUID(),
      status: "ACTIVE",
      updatedAt: new Date().toLocaleString("th-TH"),
    };
    writeItems(readItems().map((item) => item.id === id ? updated : item));
    return updated;
  },
  async findByToken(token: string) {
    return readItems().find((item) => item.token === token) ?? null;
  },
};
