import type { CompaniesApiResponse, CompanyStatus, NewCompany } from "./types";

async function parse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? "ไม่สามารถดำเนินการได้");
  return data as T;
}

export async function listCompanies(params: {
  search: string;
  status: "ALL" | CompanyStatus;
  industry: string;
  page: number;
  pageSize: number;
}, signal?: AbortSignal) {
  const query = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  return parse<CompaniesApiResponse>(
    await fetch(`/api/platform/companies?${query}`, { cache: "no-store", signal }),
  );
}

export async function createCompany(payload: NewCompany) {
  return parse(await fetch("/api/platform/companies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }));
}

export async function changeCompanyStatus(id: number, status: CompanyStatus) {
  return parse(await fetch(`/api/platform/companies/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }));
}

export async function removeCompany(id: number) {
  return parse(await fetch(`/api/platform/companies/${id}`, { method: "DELETE" }));
}
