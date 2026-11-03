# Deploy บน Vercel (เดโม)

ใช้กับ repo `Teera235/greenfactory-insight` (private) บนบัญชี Vercel ของเจ้าของ repo
แผนฟรี (Hobby) ของ Vercel ใช้เดโมได้ แต่ห้ามใช้เชิงพาณิชย์ ถ้าเปิดให้ลูกค้าใช้จริงต้องใช้ Pro

## 1. ฐานข้อมูล MySQL
สร้าง MySQL 8 บนคลาวด์ (เช่น Aiven แผน Free) แล้วเก็บ
- connection string รูปแบบ `mysql://USER:PASSWORD@HOST:PORT/DBNAME?ssl=true`
- CA certificate ของผู้ให้บริการ (Aiven: หน้า Overview → CA certificate) ใส่ใน `DATABASE_CA_CERT`

สร้างตารางและข้อมูลเดโมจากเครื่องที่มีโค้ด (ครั้งเดียว):
```bash
DATABASE_URL="mysql://...?...ssl=true" DATABASE_CA_CERT="$(cat ca.pem)" npx prisma migrate deploy
DATABASE_URL="mysql://...?...ssl=true" DATABASE_CA_CERT="$(cat ca.pem)" npm run db:seed
```

## 2. โปรเจกต์บน Vercel
1. Vercel → Add New → Project → Import `Teera235/greenfactory-insight` (Framework: Next.js ไม่ต้องแก้คำสั่ง build)
2. Storage → Create → Blob → เชื่อมกับโปรเจกต์ (Vercel ใส่ `BLOB_READ_WRITE_TOKEN` ให้เอง)
3. Settings → Environment Variables (Production):

| ชื่อ | ค่า |
|---|---|
| `DATABASE_URL` | connection string จากข้อ 1 (มี `?ssl=true`) |
| `DATABASE_CA_CERT` | เนื้อหาไฟล์ CA ทั้งไฟล์ (รวมบรรทัด BEGIN/END) |
| `SESSION_SECRET` | สุ่มยาว ≥ 32 ตัว: `openssl rand -base64 48` |
| `PLATFORM_ACCESS_CODE` | รหัสองค์กรของผู้ดูแลแพลตฟอร์ม เช่น `GFPLATFORM` |
| `NEXT_PUBLIC_APP_URL` | URL ของเว็บ เช่น `https://greenfactory-insight.vercel.app` |
| `NEXT_PUBLIC_DEMO_MODE` | `true` (แสดงปุ่มบัญชีเดโมในหน้า login) |
| `ANTHROPIC_API_KEY` | (ไม่บังคับ) สำหรับผู้ช่วย G-FAY |

4. Deploy แล้วแก้ `NEXT_PUBLIC_APP_URL` ให้ตรงกับโดเมนจริง แล้ว Redeploy (ค่านี้ใช้ในลิงก์ของ QR Code)

## 3. เซนเซอร์เดโมให้ "ออนไลน์"
มีสองทาง เลือกทางใดทางหนึ่งหรือใช้ทั้งคู่
- **Vercel Cron (ใช้อยู่)** `vercel.json` เรียก `/api/cron/demo-sensors` วันละครั้ง ทำงานเฉพาะเมื่อ `NEXT_PUBLIC_DEMO_MODE=true` และต้องตั้ง `CRON_SECRET` แผนฟรีรันได้วันละครั้ง จึงตั้งรอบของเซนเซอร์เดโมเป็น 28800 วินาที (8 ชม.) ให้สถานะออนไลน์ต่อเนื่อง 24 ชม.
- **GitHub Actions (ถี่กว่า)** workflow "Demo sensors" ส่งค่าผ่าน API จริงทุก 30 นาที ต้องตั้ง:
```bash
DATABASE_URL="..." npx tsx scripts/issue-demo-tokens.mts > tokens.json
gh secret set DEMO_SENSOR_TOKENS --repo Teera235/greenfactory-insight < tokens.json
gh variable set DEMO_APP_URL --repo Teera235/greenfactory-insight --body "https://<โดเมน>"
rm tokens.json
```

## 4. ฐานข้อมูล Postgres (Neon) แทน MySQL
Vercel ไม่มี MySQL ใน Marketplace ระบบจึงรองรับ Postgres ด้วย: ถ้า `DATABASE_URL` ขึ้นต้นด้วย `postgres://` จะใช้ `prisma/postgres/schema.prisma` (สร้างอัตโนมัติจาก schema MySQL ด้วย `npm run db:pg-schema`) และ migration ของตัวเอง ใช้ `DATABASE_URL_UNPOOLED` ตอนรัน `prisma migrate deploy`

## สิ่งที่ใช้บน Vercel ไม่ได้
- สำรอง/กู้คืนข้อมูลด้วย mysqldump (หน้าแอดมินแจ้งว่าใช้ไม่ได้) ใช้ backup ของผู้ให้บริการฐานข้อมูลแทน
- อีเมลรีเซ็ตรหัสผ่านต้องตั้ง `RESEND_API_KEY` และ `EMAIL_FROM` ก่อน ไม่อย่างนั้นลิงก์ไม่ถูกส่ง
