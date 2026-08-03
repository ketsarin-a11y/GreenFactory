import { prisma } from "../lib/prisma";

async function main() {
  const nextron = await prisma.company.findUnique({
    where: { companyCode: "NEXTRON" },
  });

  const voltera = await prisma.company.findUnique({
    where: { companyCode: "VOLTERA" },
  });

  if (!nextron || !voltera) {
    throw new Error(
      "ไม่พบ NEXTRON หรือ VOLTERA กรุณาสร้างบริษัทก่อน",
    );
  }

  await prisma.factory.upsert({
    where: {
      companyId_factoryCode: {
        companyId: nextron.companyId,
        factoryCode: "NEX-KORAT",
      },
    },
    update: {
      factoryName: "Nextron Korat Plant",
      province: "นครราชสีมา",
      country: "Thailand",
      timezone: "Asia/Bangkok",
      status: "ACTIVE",
    },
    create: {
      companyId: nextron.companyId,
      factoryCode: "NEX-KORAT",
      factoryName: "Nextron Korat Plant",
      address: "จังหวัดนครราชสีมา",
      province: "นครราชสีมา",
      country: "Thailand",
      timezone: "Asia/Bangkok",
      mapZoom: 17,
      status: "ACTIVE",
    },
  });

  await prisma.factory.upsert({
    where: {
      companyId_factoryCode: {
        companyId: voltera.companyId,
        factoryCode: "VOLT-CHONBURI",
      },
    },
    update: {
      factoryName: "Voltera Chonburi Plant",
      province: "ชลบุรี",
      country: "Thailand",
      timezone: "Asia/Bangkok",
      status: "ACTIVE",
    },
    create: {
      companyId: voltera.companyId,
      factoryCode: "VOLT-CHONBURI",
      factoryName: "Voltera Chonburi Plant",
      address: "จังหวัดชลบุรี",
      province: "ชลบุรี",
      country: "Thailand",
      timezone: "Asia/Bangkok",
      mapZoom: 17,
      status: "ACTIVE",
    },
  });

  console.log("Demo factories created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
