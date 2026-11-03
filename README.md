# GreenFactory Insight

แพลตฟอร์มบริหารข้อมูลพลังงาน น้ำ เชื้อเพลิง และคาร์บอนสำหรับโรงงานอุตสาหกรรม
บันทึกค่ามิเตอร์หน้างานด้วย QR Code → คำนวณคาร์บอนอัตโนมัติ → ตรวจจับการใช้ผิดปกติ → รายงานและผู้ช่วย AI

| บทบาท | ทำอะไร |
|---|---|
| ผู้ปฏิบัติงาน (Operator) | สแกน QR ที่เครื่องจักร/จุดตรวจ บันทึกค่า แนบหลักฐาน ดูประวัติของตัวเอง |
| ผู้จัดการโรงงาน (Manager) | แดชบอร์ด วิเคราะห์แนวโน้ม คาร์บอน KPI แจ้งเตือน รายงาน ผู้ช่วย G-FAY |
| ผู้ดูแลบริษัท (Company admin) | โรงงาน โครงสร้าง เครื่องจักร เซนเซอร์ QR ผู้ใช้ ข้อมูลบริษัท |
| ผู้ดูแลแพลตฟอร์ม (Platform admin) | บริษัทลูกค้า ผู้ใช้ทั้งหมด สิทธิ์ ข้อมูลมาตรฐาน Emission Factor log สำรองข้อมูล |

## เริ่มใช้งานบนเครื่อง

ต้องมี Node.js 24 และ Docker

```bash
cp .env.example .env            # แล้วตั้ง SESSION_SECRET และ PLATFORM_ACCESS_CODE
docker compose up -d            # MySQL 8.4 ที่ localhost:3306
npm install
npx prisma migrate deploy
npm run db:seed                 # master data + บริษัทเดโม VOLTERA พร้อมข้อมูลย้อนหลัง 120 วัน
npm run dev                     # http://localhost:3000
```

บัญชีเดโม (รหัสผ่านจาก `SEED_DEMO_PASSWORD`, ค่าเริ่มต้น `Demo1234`)

| รหัสองค์กร | อีเมล | บทบาท |
|---|---|---|
| ค่า `PLATFORM_ACCESS_CODE` | admin@greenfactory.dev | Platform admin |
| VOLTERA | admin@voltera.example | Company admin |
| VOLTERA | manager@voltera.example | Manager |
| VOLTERA | operator@voltera.example | Operator |

ข้อมูลเดโมทั้งหมดเป็นข้อมูลสมมติ ค่า Emission Factor ที่ seed ไว้เป็น **ค่าตัวอย่าง** ต้องตรวจสอบกับ อบก. (TGO) ก่อนใช้งานจริง

## คำสั่งที่ใช้บ่อย

```bash
npm run typecheck          # TypeScript
npm run lint               # ESLint
npm test                   # unit tests (กฎธุรกิจ, เวลา, สิทธิ์)
npm run test:integration   # ยิงกับฐานข้อมูลจริง greenfactory_test (สร้างใหม่ทุกครั้ง)
npm run build
```

## โครงสร้าง

```
src/app/(public)        เว็บไซต์สาธารณะ
src/app/(auth)          เข้าสู่ระบบ / ลืมรหัสผ่าน
src/app/<role>/         หน้าของแต่ละบทบาท (Server Components)
src/server/auth         session (JWT เก็บแค่ user id + version), login, สิทธิ์
src/server/scope.ts     ตัวกำหนดขอบเขตข้อมูลตามบริษัท/โรงงาน — ทุก query ต้องใช้
src/server/actions      Server Actions: ตรวจข้อมูล → ตรวจสิทธิ์ → บันทึก → audit log
src/server/queries      ฟังก์ชันอ่านข้อมูล
src/server/domain       กฎธุรกิจล้วน + เทสต์: คาร์บอน, ตรวจจับความผิดปกติ, KPI, พยากรณ์
prisma/                 schema, migrations, seed
DESIGN.md               ระบบดีไซน์ (สี ตัวอักษร ระยะ คอมโพเนนต์) ตามสเปก DESIGN.md
docs/CONVENTIONS.md     แนวทางเขียนโค้ด
docs/legacy-spec/       สเปกที่ถอดจากระบบเดิม (ฟีเจอร์ ข้อมูลปลอม และบั๊กที่แก้แล้ว)
```

หลักความปลอดภัยสำคัญ
- ทุกหน้าและทุก action ตรวจ session กับฐานข้อมูลทุกครั้ง ระงับบัญชีหรือเปลี่ยนรหัสผ่านแล้วมีผลทันที
- ทุก query ของข้อมูลลูกค้ากรองด้วยบริษัท (และโรงงานสำหรับ Manager/Operator) ป้อน id ของบริษัทอื่นจะได้ "ไม่พบข้อมูล"
- ไฟล์อัปโหลดเก็บนอก `public/` ตรวจชนิดจาก magic bytes และดาวน์โหลดผ่าน route ที่ตรวจสิทธิ์
- ทุกการแก้ไขข้อมูลบันทึก Audit Log

## Deploy

- **Server ทั่วไป / Docker / VM**: `npm run build && npm start` ตั้ง env ตาม `.env.example` ใช้ MySQL ที่มี TLS (`?ssl=true` + `DATABASE_CA_CERT`) รัน `npx prisma migrate deploy` ทุกครั้งที่ deploy
- **Vercel**: ใช้ได้ แต่ระบบไฟล์ไม่ถาวร ต้องเปลี่ยน `src/server/storage.ts` ไปใช้ object storage (S3/R2/Vercel Blob) และฟีเจอร์สำรองข้อมูลด้วย mysqldump จะใช้ไม่ได้ (หน้าแอดมินจะแจ้งไว้)
