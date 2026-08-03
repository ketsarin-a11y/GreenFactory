import type {
  FactoriesResponse,
  Factory,
  FactoryStatus,
  NewFactory,
} from "./types";

async function parse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "ไม่สามารถดำเนินการได้");
  }

  return data as T;
}

export async function listFactories(
  params: {
    search: string;
    status: "ALL" | FactoryStatus;
    companyId: string;
    page: number;
    pageSize: number;
  },
  signal?: AbortSignal,
) {
  const query = new URLSearchParams({
    search: params.search,
    status: params.status,
    companyId: params.companyId,
    page: String(params.page),
    pageSize: String(params.pageSize),
  });

  return parse<FactoriesResponse>(
    await fetch(`/api/platform/factories?${query.toString()}`, {
      cache: "no-store",
      signal,
    }),
  );
}

export async function createFactory(payload: NewFactory) {
  return parse<{ success: boolean; message?: string; data: Factory }>(
    await fetch("/api/platform/factories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateFactoryStatus(
  id: number,
  status: FactoryStatus,
) {
  return parse<{ success: boolean; message?: string }>(
    await fetch(`/api/platform/factories/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }),
  );
}

export async function deleteFactory(id: number) {
  return parse<{ success: boolean; message?: string }>(
    await fetch(`/api/platform/factories/${id}`, {
      method: "DELETE",
    }),
  );
}
