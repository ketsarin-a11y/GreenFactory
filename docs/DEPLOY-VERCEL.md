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
Vercel แผนฟรีรัน cron ได้วันละครั้ง จึงใช้ GitHub Actions ส่งค่าเข้า `/api/ingest/readings` ทุก 30 นาทีแทน
```bash
DATABASE_URL="..." DATABASE_CA_CERT="$(cat ca.pem)" npx tsx scripts/issue-demo-tokens.mts > tokens.json
gh secret set DEMO_SENSOR_TOKENS --repo Teera235/greenfactory-insight < tokens.json
gh variable set DEMO_APP_URL --repo Teera235/greenfactory-insight --body "https://<โดเมน>"
rm tokens.json
```
แล้วรัน workflow "Demo sensors" ครั้งแรกจากแท็บ Actions (หรือ `gh workflow run demo-sensors.yml`)

## สิ่งที่ใช้บน Vercel ไม่ได้
- สำรอง/กู้คืนข้อมูลด้วย mysqldump (หน้าแอดมินแจ้งว่าใช้ไม่ได้) ใช้ backup ของผู้ให้บริการฐานข้อมูลแทน
- อีเมลรีเซ็ตรหัสผ่านต้องตั้ง `RESEND_API_KEY` และ `EMAIL_FROM` ก่อน ไม่อย่างนั้นลิงก์ไม่ถูกส่ง
