import { prisma } from "./client";

export default async function main() {
  console.log("Seeding GreenFactory global master data...");

  // ---------------------------------------------------------------------------
  // RESOURCE CATEGORIES
  // ---------------------------------------------------------------------------
  const categories = [
    {
      categoryCode: "ENERGY",
      categoryName: "พลังงานและสาธารณูปโภค",
      description:
        "พลังงานและระบบสาธารณูปโภคที่ใช้ในเครื่องจักร สายการผลิต อาคาร และระบบสนับสนุน",
    },
    {
      categoryCode: "FUEL",
      categoryName: "เชื้อเพลิง",
      description:
        "เชื้อเพลิงที่ใช้ในการผลิต ระบบสำรอง และการขนส่งภายในโรงงาน",
    },
    {
      categoryCode: "WATER",
      categoryName: "น้ำ",
      description:
        "น้ำที่ใช้ในกระบวนการผลิต ระบบสาธารณูปโภค ระบบหล่อเย็น และการใช้งานภายในโรงงาน",
    },
    {
      categoryCode: "WASTEWATER",
      categoryName: "น้ำเสีย",
      description:
        "น้ำเสียจากกระบวนการผลิต ระบบสาธารณูปโภค อาคารสำนักงาน และระบบบำบัดน้ำเสีย",
    },
    {
      categoryCode: "MATERIAL",
      categoryName: "วัตถุดิบและวัสดุ",
      description:
        "โลหะ วัสดุอิเล็กทรอนิกส์ และวัตถุดิบที่ใช้ในกระบวนการผลิต",
    },
    {
      categoryCode: "CHEMICAL",
      categoryName: "สารเคมี",
      description:
        "สารเคมี ตัวทำละลาย น้ำยาทำความสะอาด และสารที่ใช้ในกระบวนการผลิตอิเล็กทรอนิกส์",
    },
    {
      categoryCode: "PROCESS_GAS",
      categoryName: "ก๊าซในกระบวนการ",
      description:
        "ก๊าซที่ใช้ในกระบวนการผลิต การบัดกรี การทดสอบ และระบบสนับสนุน",
    },
    {
      categoryCode: "PACKAGING",
      categoryName: "บรรจุภัณฑ์",
      description:
        "วัสดุบรรจุภัณฑ์สำหรับชิ้นส่วน ผลิตภัณฑ์ และการขนส่ง",
    },
    {
      categoryCode: "WASTE",
      categoryName: "ของเสีย",
      description:
        "ของเสียทั่วไป ของเสียรีไซเคิล ของเสียจากการผลิต และของเสียอันตรายที่ต้องติดตาม",
    },
  ];

  for (const item of categories) {
    await prisma.resourceCategory.upsert({
      where: { categoryCode: item.categoryCode },
      update: {
        categoryName: item.categoryName,
        description: item.description,
        status: "ACTIVE",
      },
      create: {
        ...item,
        status: "ACTIVE",
      },
    });
  }

  // ---------------------------------------------------------------------------
  // UNITS
  // ---------------------------------------------------------------------------
  const units = [
    {
      unitCode: "KWH",
      unitName: "Kilowatt-hour",
      symbol: "kWh",
      unitType: "Energy",
    },
    {
      unitCode: "MWH",
      unitName: "Megawatt-hour",
      symbol: "MWh",
      unitType: "Energy",
    },
    {
      unitCode: "KW",
      unitName: "Kilowatt",
      symbol: "kW",
      unitType: "Power",
    },
    {
      unitCode: "LITER",
      unitName: "Litre",
      symbol: "L",
      unitType: "Volume",
    },
    {
      unitCode: "M3",
      unitName: "Cubic metre",
      symbol: "m³",
      unitType: "Volume",
    },
    {
      unitCode: "KG",
      unitName: "Kilogram",
      symbol: "kg",
      unitType: "Mass",
    },
    {
      unitCode: "GRAM",
      unitName: "Gram",
      symbol: "g",
      unitType: "Mass",
    },
    {
      unitCode: "TONNE",
      unitName: "Metric tonne",
      symbol: "t",
      unitType: "Mass",
    },
    {
      unitCode: "CELSIUS",
      unitName: "Degree Celsius",
      symbol: "°C",
      unitType: "Temperature",
    },
    {
      unitCode: "BAR",
      unitName: "Bar",
      symbol: "bar",
      unitType: "Pressure",
    },
    {
      unitCode: "PERCENT",
      unitName: "Percent",
      symbol: "%",
      unitType: "Ratio",
    },
    {
      unitCode: "PCS",
      unitName: "Piece",
      symbol: "pcs",
      unitType: "Count",
    },
    {
      unitCode: "HOUR",
      unitName: "Hour",
      symbol: "h",
      unitType: "Time",
    },
    {
      unitCode: "PALLET",
      unitName: "Pallet",
      symbol: "pallet",
      unitType: "Count",
    },
  ];

  for (const item of units) {
    await prisma.unit.upsert({
      where: { unitCode: item.unitCode },
      update: {
        unitName: item.unitName,
        symbol: item.symbol,
        unitType: item.unitType,
        status: "ACTIVE",
      },
      create: {
        ...item,
        status: "ACTIVE",
      },
    });
  }

  const categoryMap = Object.fromEntries(
    (
      await prisma.resourceCategory.findMany({
        select: {
          categoryCode: true,
          categoryId: true,
        },
      })
    ).map((item) => [item.categoryCode, item.categoryId]),
  );

  const unitMap = Object.fromEntries(
    (
      await prisma.unit.findMany({
        select: {
          unitCode: true,
          unitId: true,
        },
      })
    ).map((item) => [item.unitCode, item.unitId]),
  );

  // ---------------------------------------------------------------------------
  // RESOURCE TYPES
  // ---------------------------------------------------------------------------
  const resourceTypes = [
    // ENERGY / UTILITIES
    {
      resourceCode: "ELECTRICITY",
      resourceName: "ไฟฟ้า",
      description:
        "พลังงานไฟฟ้าที่ใช้ในเครื่องจักร สายการผลิต อาคาร และระบบสนับสนุน",
      categoryCode: "ENERGY",
      unitCode: "KWH",
      carbonCalculable: true,
    },
    {
      resourceCode: "SOLAR_ELECTRICITY",
      resourceName: "ไฟฟ้าจากพลังงานแสงอาทิตย์",
      description:
        "พลังงานไฟฟ้าที่ผลิตจากระบบ Solar PV ภายในโรงงาน",
      categoryCode: "ENERGY",
      unitCode: "KWH",
      carbonCalculable: true,
    },
    {
      resourceCode: "COMPRESSED_AIR",
      resourceName: "ลมอัด",
      description:
        "ปริมาณลมอัดที่ใช้กับเครื่องจักรและอุปกรณ์ในสายการผลิต",
      categoryCode: "ENERGY",
      unitCode: "M3",
      carbonCalculable: false,
    },
    {
      resourceCode: "STEAM",
      resourceName: "ไอน้ำ",
      description:
        "ไอน้ำที่ใช้ในกระบวนการผลิตหรือระบบสาธารณูปโภค",
      categoryCode: "ENERGY",
      unitCode: "KG",
      carbonCalculable: true,
    },
    {
      resourceCode: "CHILLED_WATER",
      resourceName: "น้ำเย็นระบบ Chilled Water",
      description:
        "น้ำเย็นหมุนเวียนที่ใช้ในระบบปรับอากาศและกระบวนการผลิต",
      categoryCode: "ENERGY",
      unitCode: "M3",
      carbonCalculable: false,
    },

    // FUELS
    {
      resourceCode: "DIESEL",
      resourceName: "น้ำมันดีเซล",
      description:
        "น้ำมันดีเซลสำหรับเครื่องกำเนิดไฟฟ้า ยานพาหนะ หรืออุปกรณ์ภายในโรงงาน",
      categoryCode: "FUEL",
      unitCode: "LITER",
      carbonCalculable: true,
    },
    {
      resourceCode: "GASOLINE",
      resourceName: "น้ำมันเบนซิน",
      description:
        "น้ำมันเบนซินสำหรับยานพาหนะหรืออุปกรณ์ภายในโรงงาน",
      categoryCode: "FUEL",
      unitCode: "LITER",
      carbonCalculable: true,
    },
    {
      resourceCode: "LPG",
      resourceName: "ก๊าซปิโตรเลียมเหลว (LPG)",
      description:
        "เชื้อเพลิง LPG ที่ใช้ในกระบวนการผลิตหรือระบบสนับสนุน",
      categoryCode: "FUEL",
      unitCode: "KG",
      carbonCalculable: true,
    },
    {
      resourceCode: "NATURAL_GAS",
      resourceName: "ก๊าซธรรมชาติ",
      description:
        "ก๊าซธรรมชาติที่ใช้เป็นเชื้อเพลิงในกระบวนการผลิตหรือระบบสาธารณูปโภค",
      categoryCode: "FUEL",
      unitCode: "M3",
      carbonCalculable: true,
    },

    // WATER
    {
      resourceCode: "TAP_WATER",
      resourceName: "น้ำประปา",
      description:
        "น้ำประปาที่ใช้ในกระบวนการผลิต อาคารสำนักงาน และระบบสาธารณูปโภค",
      categoryCode: "WATER",
      unitCode: "M3",
      carbonCalculable: false,
    },
    {
      resourceCode: "GROUNDWATER",
      resourceName: "น้ำบาดาล",
      description:
        "น้ำบาดาลที่นำมาใช้ในโรงงานหรือผ่านกระบวนการปรับปรุงคุณภาพ",
      categoryCode: "WATER",
      unitCode: "M3",
      carbonCalculable: false,
    },
    {
      resourceCode: "RO_WATER",
      resourceName: "น้ำ RO",
      description:
        "น้ำที่ผ่านระบบ Reverse Osmosis สำหรับกระบวนการผลิตหรือระบบสนับสนุน",
      categoryCode: "WATER",
      unitCode: "M3",
      carbonCalculable: false,
    },
    {
      resourceCode: "DI_WATER",
      resourceName: "น้ำ DI",
      description:
        "น้ำปราศจากไอออนสำหรับกระบวนการผลิตอิเล็กทรอนิกส์และงานทำความสะอาด",
      categoryCode: "WATER",
      unitCode: "M3",
      carbonCalculable: false,
    },
    {
      resourceCode: "PROCESS_WATER",
      resourceName: "น้ำในกระบวนการผลิต",
      description:
        "น้ำที่ใช้โดยตรงในกระบวนการผลิต",
      categoryCode: "WATER",
      unitCode: "M3",
      carbonCalculable: false,
    },
    {
      resourceCode: "COOLING_WATER",
      resourceName: "น้ำหล่อเย็น",
      description:
        "น้ำที่ใช้ใน Cooling Tower หรือระบบหล่อเย็นของเครื่องจักร",
      categoryCode: "WATER",
      unitCode: "M3",
      carbonCalculable: false,
    },

    // WASTEWATER
    {
      resourceCode: "INDUSTRIAL_WASTEWATER",
      resourceName: "น้ำเสียอุตสาหกรรม",
      description:
        "น้ำเสียที่เกิดจากกระบวนการผลิตและกิจกรรมอุตสาหกรรม",
      categoryCode: "WASTEWATER",
      unitCode: "M3",
      carbonCalculable: false,
    },
    {
      resourceCode: "PROCESS_WASTEWATER",
      resourceName: "น้ำเสียจากกระบวนการผลิต",
      description:
        "น้ำเสียที่เกิดโดยตรงจากขั้นตอนการผลิตหรือการทำความสะอาดชิ้นงาน",
      categoryCode: "WASTEWATER",
      unitCode: "M3",
      carbonCalculable: false,
    },
    {
      resourceCode: "CHEMICAL_WASTEWATER",
      resourceName: "น้ำเสียปนเปื้อนสารเคมี",
      description:
        "น้ำเสียที่มีสารเคมีจากกระบวนการผลิต การล้าง หรือการบำบัด",
      categoryCode: "WASTEWATER",
      unitCode: "M3",
      carbonCalculable: false,
    },
    {
      resourceCode: "DOMESTIC_WASTEWATER",
      resourceName: "น้ำเสียจากอาคารและสำนักงาน",
      description:
        "น้ำเสียจากห้องน้ำ โรงอาหาร สำนักงาน และกิจกรรมทั่วไปภายในโรงงาน",
      categoryCode: "WASTEWATER",
      unitCode: "M3",
      carbonCalculable: false,
    },

    // MATERIALS / METALS / ELECTRONICS
    {
      resourceCode: "RAW_MATERIAL",
      resourceName: "วัตถุดิบการผลิต",
      description:
        "วัตถุดิบหลักที่ใช้ในกระบวนการผลิตอิเล็กทรอนิกส์",
      categoryCode: "MATERIAL",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "COPPER",
      resourceName: "ทองแดง",
      description:
        "ทองแดงที่ใช้ในสายไฟ ขั้วต่อ แผงวงจร บัสบาร์ และชิ้นส่วนอิเล็กทรอนิกส์",
      categoryCode: "MATERIAL",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "BRASS",
      resourceName: "ทองเหลือง",
      description:
        "ทองเหลืองที่ใช้ในขั้วต่อ ฟิตติ้ง วาล์ว และชิ้นส่วนโลหะ",
      categoryCode: "MATERIAL",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "ALUMINUM",
      resourceName: "อะลูมิเนียม",
      description:
        "อะลูมิเนียมที่ใช้ในโครงสร้าง ฮีตซิงก์ ตัวเรือน และชิ้นส่วนการผลิต",
      categoryCode: "MATERIAL",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "STEEL",
      resourceName: "เหล็ก",
      description:
        "เหล็กที่ใช้ในโครงสร้าง เครื่องจักร อุปกรณ์ และชิ้นส่วน",
      categoryCode: "MATERIAL",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "STAINLESS_STEEL",
      resourceName: "สแตนเลส",
      description:
        "สแตนเลสที่ใช้ในอุปกรณ์ โครงสร้าง ท่อ และชิ้นส่วนที่ต้องการความทนทานต่อการกัดกร่อน",
      categoryCode: "MATERIAL",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "TIN",
      resourceName: "ดีบุก",
      description:
        "ดีบุกที่ใช้เป็นวัตถุดิบหรือส่วนประกอบในงานบัดกรีและการผลิตอิเล็กทรอนิกส์",
      categoryCode: "MATERIAL",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "NICKEL",
      resourceName: "นิกเกิล",
      description:
        "นิกเกิลที่ใช้ในการชุบผิว โลหะผสม และชิ้นส่วนอิเล็กทรอนิกส์",
      categoryCode: "MATERIAL",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "ZINC",
      resourceName: "สังกะสี",
      description:
        "สังกะสีที่ใช้ในการชุบผิว โลหะผสม หรือชิ้นส่วน",
      categoryCode: "MATERIAL",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "SILVER",
      resourceName: "เงิน",
      description:
        "เงินที่ใช้ในหน้าสัมผัส ตัวนำ และวัสดุอิเล็กทรอนิกส์",
      categoryCode: "MATERIAL",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "SOLDER",
      resourceName: "ลวดบัดกรี / Solder",
      description:
        "วัสดุบัดกรีที่ใช้ในกระบวนการ SMT, Wave Solder และงานประกอบอิเล็กทรอนิกส์",
      categoryCode: "MATERIAL",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "SOLDER_PASTE",
      resourceName: "Solder Paste",
      description:
        "ครีมบัดกรีสำหรับกระบวนการ SMT และการประกอบ PCB",
      categoryCode: "MATERIAL",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "PCB",
      resourceName: "แผงวงจรพิมพ์ (PCB)",
      description:
        "แผงวงจรพิมพ์ที่ใช้เป็นวัตถุดิบหลักในการประกอบผลิตภัณฑ์อิเล็กทรอนิกส์",
      categoryCode: "MATERIAL",
      unitCode: "PCS",
      carbonCalculable: false,
    },
    {
      resourceCode: "ELECTRONIC_COMPONENT",
      resourceName: "ชิ้นส่วนอิเล็กทรอนิกส์",
      description:
        "IC, Resistor, Capacitor, Connector และชิ้นส่วนอิเล็กทรอนิกส์อื่น",
      categoryCode: "MATERIAL",
      unitCode: "PCS",
      carbonCalculable: false,
    },
    {
      resourceCode: "PLASTIC",
      resourceName: "พลาสติก",
      description:
        "วัสดุพลาสติกที่ใช้ในชิ้นส่วน ตัวเรือน และกระบวนการผลิต",
      categoryCode: "MATERIAL",
      unitCode: "KG",
      carbonCalculable: false,
    },

    // CHEMICALS
    {
      resourceCode: "IPA",
      resourceName: "Isopropyl Alcohol (IPA)",
      description:
        "IPA สำหรับทำความสะอาด PCB อุปกรณ์ และพื้นผิวในกระบวนการผลิต",
      categoryCode: "CHEMICAL",
      unitCode: "LITER",
      carbonCalculable: false,
    },
    {
      resourceCode: "ACETONE",
      resourceName: "Acetone",
      description:
        "ตัวทำละลายที่ใช้ในงานทำความสะอาดหรือกระบวนการเฉพาะ",
      categoryCode: "CHEMICAL",
      unitCode: "LITER",
      carbonCalculable: false,
    },
    {
      resourceCode: "FLUX",
      resourceName: "Flux",
      description:
        "สารช่วยบัดกรีที่ใช้ใน SMT, Wave Solder และงานประกอบอิเล็กทรอนิกส์",
      categoryCode: "CHEMICAL",
      unitCode: "LITER",
      carbonCalculable: false,
    },
    {
      resourceCode: "CLEANING_SOLVENT",
      resourceName: "น้ำยาทำความสะอาด / Cleaning Solvent",
      description:
        "สารทำความสะอาดเครื่องจักร PCB และชิ้นส่วนในกระบวนการผลิต",
      categoryCode: "CHEMICAL",
      unitCode: "LITER",
      carbonCalculable: false,
    },
    {
      resourceCode: "ACID",
      resourceName: "สารละลายกรด",
      description:
        "สารละลายกรดที่ใช้ในกระบวนการผลิต การปรับสภาพ หรือระบบบำบัด",
      categoryCode: "CHEMICAL",
      unitCode: "LITER",
      carbonCalculable: false,
    },
    {
      resourceCode: "ALKALI",
      resourceName: "สารละลายด่าง",
      description:
        "สารละลายด่างที่ใช้ในกระบวนการผลิต การทำความสะอาด หรือระบบบำบัด",
      categoryCode: "CHEMICAL",
      unitCode: "LITER",
      carbonCalculable: false,
    },
    {
      resourceCode: "ADHESIVE",
      resourceName: "กาวอุตสาหกรรม / Adhesive",
      description:
        "กาวสำหรับยึดชิ้นส่วนอิเล็กทรอนิกส์และงานประกอบ",
      categoryCode: "CHEMICAL",
      unitCode: "KG",
      carbonCalculable: false,
    },

    // PROCESS GASES
    {
      resourceCode: "NITROGEN",
      resourceName: "ไนโตรเจน (N₂)",
      description:
        "ก๊าซไนโตรเจนที่ใช้ในกระบวนการ Reflow, Wave Solder หรือกระบวนการควบคุมบรรยากาศ",
      categoryCode: "PROCESS_GAS",
      unitCode: "M3",
      carbonCalculable: false,
    },
    {
      resourceCode: "OXYGEN",
      resourceName: "ออกซิเจน (O₂)",
      description:
        "ก๊าซออกซิเจนสำหรับกระบวนการหรือระบบสนับสนุนเฉพาะ",
      categoryCode: "PROCESS_GAS",
      unitCode: "M3",
      carbonCalculable: false,
    },
    {
      resourceCode: "ARGON",
      resourceName: "อาร์กอน (Ar)",
      description:
        "ก๊าซอาร์กอนสำหรับกระบวนการผลิตหรือการทดสอบเฉพาะ",
      categoryCode: "PROCESS_GAS",
      unitCode: "M3",
      carbonCalculable: false,
    },
    {
      resourceCode: "PROCESS_CO2",
      resourceName: "คาร์บอนไดออกไซด์ในกระบวนการ (CO₂)",
      description:
        "ก๊าซคาร์บอนไดออกไซด์ที่ใช้ในกระบวนการหรือระบบสนับสนุน",
      categoryCode: "PROCESS_GAS",
      unitCode: "KG",
      carbonCalculable: false,
    },

    // PACKAGING
    {
      resourceCode: "CARTON",
      resourceName: "กล่องกระดาษ",
      description:
        "กล่องกระดาษสำหรับบรรจุผลิตภัณฑ์ ชิ้นส่วน และการขนส่ง",
      categoryCode: "PACKAGING",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "PAPER",
      resourceName: "กระดาษ",
      description:
        "กระดาษสำหรับบรรจุภัณฑ์ เอกสาร หรือวัสดุรองกันกระแทก",
      categoryCode: "PACKAGING",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "PLASTIC_PACKAGING",
      resourceName: "บรรจุภัณฑ์พลาสติก",
      description:
        "ฟิล์ม ถุง พลาสติกกันกระแทก และบรรจุภัณฑ์พลาสติก",
      categoryCode: "PACKAGING",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "ESD_BAG",
      resourceName: "ถุง ESD",
      description:
        "ถุงป้องกันไฟฟ้าสถิตสำหรับชิ้นส่วนและผลิตภัณฑ์อิเล็กทรอนิกส์",
      categoryCode: "PACKAGING",
      unitCode: "PCS",
      carbonCalculable: false,
    },
    {
      resourceCode: "WOODEN_PALLET",
      resourceName: "พาเลทไม้",
      description:
        "พาเลทไม้สำหรับจัดเก็บและขนส่งวัตถุดิบหรือผลิตภัณฑ์",
      categoryCode: "PACKAGING",
      unitCode: "PALLET",
      carbonCalculable: false,
    },

    // WASTE
    {
      resourceCode: "GENERAL_WASTE",
      resourceName: "ของเสียทั่วไป",
      description:
        "ของเสียทั่วไปที่เกิดจากกิจกรรมภายในโรงงาน",
      categoryCode: "WASTE",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "RECYCLABLE_WASTE",
      resourceName: "ของเสียรีไซเคิล",
      description:
        "กระดาษ พลาสติก โลหะ และวัสดุที่สามารถนำกลับมาใช้หรือรีไซเคิลได้",
      categoryCode: "WASTE",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "E_WASTE",
      resourceName: "ขยะอิเล็กทรอนิกส์ (E-Waste)",
      description:
        "ชิ้นส่วน แผงวงจร อุปกรณ์ และผลิตภัณฑ์อิเล็กทรอนิกส์ที่เป็นของเสีย",
      categoryCode: "WASTE",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "SCRAP_METAL",
      resourceName: "เศษโลหะ",
      description:
        "เศษทองแดง อะลูมิเนียม เหล็ก และโลหะจากกระบวนการผลิต",
      categoryCode: "WASTE",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "PCB_WASTE",
      resourceName: "ของเสีย PCB",
      description:
        "แผงวงจรพิมพ์ที่เสียหาย ไม่ผ่านการตรวจสอบ หรือถูกคัดทิ้ง",
      categoryCode: "WASTE",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "CHEMICAL_WASTE",
      resourceName: "ของเสียสารเคมี",
      description:
        "สารเคมีใช้แล้ว ตัวทำละลาย และของเสียจากกระบวนการเคมี",
      categoryCode: "WASTE",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "WASTE_OIL",
      resourceName: "น้ำมันใช้แล้ว",
      description:
        "น้ำมันหล่อลื่น น้ำมันเครื่อง และน้ำมันอุตสาหกรรมที่ใช้แล้ว",
      categoryCode: "WASTE",
      unitCode: "LITER",
      carbonCalculable: false,
    },
    {
      resourceCode: "SLUDGE",
      resourceName: "ตะกอนจากระบบบำบัด",
      description:
        "ตะกอนจากระบบบำบัดน้ำเสียหรือกระบวนการผลิต",
      categoryCode: "WASTE",
      unitCode: "KG",
      carbonCalculable: false,
    },
    {
      resourceCode: "HAZARDOUS_WASTE",
      resourceName: "ของเสียอันตราย",
      description:
        "ของเสียอันตรายจากกระบวนการผลิตที่ต้องติดตามและจัดการเป็นพิเศษ",
      categoryCode: "WASTE",
      unitCode: "KG",
      carbonCalculable: false,
    },
  ];

  for (const item of resourceTypes) {
    const categoryId = categoryMap[item.categoryCode];
    const defaultUnitId = unitMap[item.unitCode];

    if (!categoryId || !defaultUnitId) {
      throw new Error(
        `Missing relation for ${item.resourceCode}: category=${item.categoryCode}, unit=${item.unitCode}`,
      );
    }

    await prisma.resourceTypeMaster.upsert({
      where: {
        resourceCode: item.resourceCode,
      },
      update: {
        resourceName: item.resourceName,
        description: item.description,
        categoryId,
        defaultUnitId,
        carbonCalculable: item.carbonCalculable,
        status: "ACTIVE",
      },
      create: {
        resourceCode: item.resourceCode,
        resourceName: item.resourceName,
        description: item.description,
        categoryId,
        defaultUnitId,
        carbonCalculable: item.carbonCalculable,
        status: "ACTIVE",
      },
    });
  }

  // ---------------------------------------------------------------------------
  // MACHINE TYPES
  // ---------------------------------------------------------------------------
  const machineTypes = [
    [
      "SOLDER_PASTE_PRINTER",
      "Solder Paste Printer",
      "เครื่องพิมพ์ Solder Paste ลงบน PCB ในสายการผลิต SMT",
    ],
    [
      "SPI",
      "Solder Paste Inspection",
      "เครื่องตรวจสอบคุณภาพการพิมพ์ Solder Paste",
    ],
    [
      "PICK_AND_PLACE",
      "Pick and Place Machine",
      "เครื่องติดตั้งชิ้นส่วนอิเล็กทรอนิกส์ลงบนแผง PCB",
    ],
    [
      "REFLOW_OVEN",
      "Reflow Oven",
      "เครื่องอบบัดกรีสำหรับสายการผลิต SMT",
    ],
    [
      "AOI",
      "Automated Optical Inspection",
      "เครื่องตรวจสอบแผงวงจรด้วยระบบภาพอัตโนมัติ",
    ],
    [
      "X_RAY_INSPECTION",
      "X-Ray Inspection",
      "เครื่องตรวจสอบรอยบัดกรีและชิ้นส่วนภายในด้วยรังสีเอกซ์",
    ],
    [
      "WAVE_SOLDER",
      "Wave Soldering Machine",
      "เครื่องบัดกรีแบบคลื่นสำหรับงานประกอบอิเล็กทรอนิกส์",
    ],
    [
      "SELECTIVE_SOLDER",
      "Selective Soldering Machine",
      "เครื่องบัดกรีเฉพาะจุดสำหรับชิ้นส่วน Through-Hole",
    ],
    [
      "DISPENSING_MACHINE",
      "Dispensing Machine",
      "เครื่องจ่ายกาว สารเคมี หรือวัสดุประกอบแบบอัตโนมัติ",
    ],
    [
      "CURING_OVEN",
      "Curing Oven",
      "ตู้อบสำหรับกระบวนการ Curing กาว สารเคลือบ หรือวัสดุ",
    ],
    [
      "ICT",
      "In-Circuit Tester",
      "เครื่องทดสอบวงจรไฟฟ้าบนแผง PCB",
    ],
    [
      "FUNCTIONAL_TEST",
      "Functional Test System",
      "ระบบทดสอบการทำงานของผลิตภัณฑ์",
    ],
    [
      "BURN_IN",
      "Burn-In Test System",
      "ระบบทดสอบความทนทานของผลิตภัณฑ์ภายใต้การทำงานต่อเนื่อง",
    ],
    [
      "LASER_MARKER",
      "Laser Marking Machine",
      "เครื่องเลเซอร์สำหรับทำเครื่องหมาย Serial, QR หรือข้อมูลผลิตภัณฑ์",
    ],
    [
      "PCB_CLEANING",
      "PCB Cleaning Machine",
      "เครื่องทำความสะอาด PCB และสารตกค้างจากกระบวนการบัดกรี",
    ],
    [
      "AIR_COMPRESSOR",
      "Air Compressor",
      "เครื่องอัดอากาศสำหรับระบบลมอัดของโรงงาน",
    ],
    [
      "CHILLER",
      "Chiller",
      "เครื่องทำน้ำเย็นสำหรับระบบปรับอากาศและกระบวนการผลิต",
    ],
    [
      "COOLING_TOWER",
      "Cooling Tower",
      "ระบบระบายความร้อนสำหรับ Chiller และระบบหล่อเย็น",
    ],
    [
      "AHU",
      "Air Handling Unit",
      "ระบบจ่ายและปรับสภาพอากาศภายในพื้นที่ผลิต",
    ],
    [
      "GENERATOR",
      "Generator",
      "เครื่องกำเนิดไฟฟ้าสำรอง",
    ],
    [
      "UPS",
      "Uninterruptible Power Supply",
      "ระบบสำรองไฟฟ้าสำหรับอุปกรณ์และสายการผลิตสำคัญ",
    ],
    [
      "RO_SYSTEM",
      "RO Water Treatment System",
      "ระบบผลิตน้ำ Reverse Osmosis สำหรับโรงงาน",
    ],
    [
      "DI_SYSTEM",
      "DI Water System",
      "ระบบผลิตน้ำ Deionized Water สำหรับกระบวนการผลิต",
    ],
    [
      "WWTP",
      "Wastewater Treatment Plant",
      "ระบบบำบัดน้ำเสียของโรงงาน",
    ],
  ] as const;

  for (const [
    machineTypeCode,
    machineTypeName,
    description,
  ] of machineTypes) {
    await prisma.machineType.upsert({
      where: {
        machineTypeCode,
      },
      update: {
        machineTypeName,
        description,
        status: "ACTIVE",
      },
      create: {
        machineTypeCode,
        machineTypeName,
        description,
        status: "ACTIVE",
      },
    });
  }

  // ---------------------------------------------------------------------------
  // SENSOR TYPES
  // ---------------------------------------------------------------------------
  const sensorTypes = [
    [
      "TEMPERATURE",
      "Temperature Sensor",
      "ตรวจวัดอุณหภูมิของเครื่องจักรและกระบวนการผลิต",
    ],
    [
      "HUMIDITY",
      "Humidity Sensor",
      "ตรวจวัดความชื้นในพื้นที่ผลิตหรือพื้นที่ควบคุม",
    ],
    [
      "ENERGY_METER",
      "Energy Meter",
      "ตรวจวัดพลังงานไฟฟ้าที่ใช้จริง",
    ],
    [
      "POWER_METER",
      "Power Meter",
      "ตรวจวัดกำลังไฟฟ้าแบบเรียลไทม์",
    ],
    [
      "FLOW_METER",
      "Flow Meter",
      "ตรวจวัดอัตราการไหลของน้ำ ก๊าซ หรือลม",
    ],
    [
      "PRESSURE",
      "Pressure Sensor",
      "ตรวจวัดแรงดันของระบบลม ของเหลว หรือก๊าซ",
    ],
    [
      "VIBRATION",
      "Vibration Sensor",
      "ตรวจวัดแรงสั่นสะเทือนเพื่อเฝ้าระวังสภาพเครื่องจักร",
    ],
    [
      "CURRENT",
      "Current Sensor",
      "ตรวจวัดกระแสไฟฟ้าของเครื่องจักรหรือวงจร",
    ],
    [
      "VOLTAGE",
      "Voltage Sensor",
      "ตรวจวัดแรงดันไฟฟ้าของระบบ",
    ],
    [
      "PH",
      "pH Sensor",
      "ตรวจวัดค่าความเป็นกรด-ด่างของน้ำและน้ำเสีย",
    ],
    [
      "CONDUCTIVITY",
      "Conductivity Sensor",
      "ตรวจวัดค่าการนำไฟฟ้าของน้ำ DI, RO และน้ำในกระบวนการ",
    ],
    [
      "TURBIDITY",
      "Turbidity Sensor",
      "ตรวจวัดความขุ่นของน้ำหรือน้ำเสีย",
    ],
    [
      "DISSOLVED_OXYGEN",
      "Dissolved Oxygen Sensor",
      "ตรวจวัดออกซิเจนละลายในระบบน้ำและระบบบำบัดน้ำเสีย",
    ],
    [
      "WATER_LEVEL",
      "Water Level Sensor",
      "ตรวจวัดระดับน้ำในถัง ระบบผลิตน้ำ และระบบบำบัดน้ำเสีย",
    ],
    [
      "AIR_QUALITY",
      "Air Quality Sensor",
      "ตรวจวัดคุณภาพอากาศในพื้นที่ผลิตและพื้นที่สนับสนุน",
    ],
    [
      "PARTICLE",
      "Particle Sensor",
      "ตรวจวัดอนุภาคในพื้นที่ควบคุมหรือ Cleanroom",
    ],
  ] as const;

  for (const [
    sensorTypeCode,
    sensorTypeName,
    description,
  ] of sensorTypes) {
    await prisma.sensorType.upsert({
      where: {
        sensorTypeCode,
      },
      update: {
        sensorTypeName,
        description,
        status: "ACTIVE",
      },
      create: {
        sensorTypeCode,
        sensorTypeName,
        description,
        status: "ACTIVE",
      },
    });
  }

  console.log("Global master data seed completed.");
  console.log("");
  console.log("Included:");
  console.log("- Energy / utilities");
  console.log("- Fuel");
  console.log("- Water / wastewater");
  console.log("- Metals / electronic materials");
  console.log("- Chemicals");
  console.log("- Process gases");
  console.log("- Packaging");
  console.log("- Waste");
  console.log("- Electronics manufacturing machine types");
  console.log("- Production / utility / wastewater sensor types");
  console.log("");
  console.log("Important:");
  console.log(
    "- Emission Factors are intentionally NOT seeded with guessed values.",
  );
  console.log(
    "- Add verified factors from an official source before enabling production carbon calculations.",
  );
}

