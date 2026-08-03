import { notFound } from "next/navigation";

import FactoryDetailPageClient from "@/components/platform/company/factory-detail/FactoryDetailPageClient";

interface PageProps {
  params: Promise<{
    id: string;
    factoryId: string;
  }>;
}

export default async function FactoryDetailPage({
  params,
}: PageProps) {
  const { id, factoryId } = await params;

  const companyId = Number(id);
  const parsedFactoryId = Number(factoryId);

  if (
    Number.isNaN(companyId) ||
    Number.isNaN(parsedFactoryId)
  ) {
    notFound();
  }

  return (
    <FactoryDetailPageClient
      companyId={companyId}
      factoryId={parsedFactoryId}
    />
  );
}