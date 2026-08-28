import CompanyDetailPageClient from "@/components/platform/company/detail/CompanyDetailPageClient";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  const companyId = Number(id);

  return <CompanyDetailPageClient companyId={companyId} />;
}