ไม่ได้เขียนไฟล์ /Users/teerathap/GreenFactory/docs/legacy-spec/public-auth-design-data.md เพราะ session นี้เป็น read-only และไม่มี Write tool แต่โฟลเดอร์ `docs/legacy-spec` มีอยู่แล้ว เอกสารฉบับเต็มอยู่ด้านล่าง ให้ caller บันทึกเนื้อหานี้ลงไฟล์ได้เลย

**สรุป 10 บรรทัด**
1. Public site: หน้า `/` มีแค่ `<Hero/>` ตัวเดียว ส่วน `components/home/*` อีก 10 ไฟล์เป็นไฟล์ว่าง (0 bytes) ยกเว้น `DashboardPreview.tsx` และ `Features.tsx` ที่มีโค้ดแต่ไม่ถูก import ใช้
2. `/pricing` และ `/register` เป็นแค่ placeholder `/news` คือ "ข้อมูลเชิงลึก" ใช้รูปจาก Unsplash แบบ hardcode และลิงก์บทความไปยัง route ที่ไม่มีอยู่จริง ฟอร์มใน `/contact` เป็นแค่ demo ไม่ได้ส่งข้อมูลไปไหน
3. ไม่มี testimonials, pricing tiers หรือ stats จริง ตัวเลขทั้งหมดเป็น sample ที่หน้าเว็บเขียนกำกับไว้เอง
4. Login ใช้ companyCode+email+password ผิดครบ 5 ครั้งจะล็อก 15 นาที (ตอนล็อก counter ถูก reset เป็น 0) PLATFORM_ADMIN ใช้ `PLATFORM_ACCESS_CODE` แทน companyCode
5. JWT ใช้ HS256 (jose) เก็บใน cookie `greenfactory_session` แบบ httpOnly, sameSite=lax หมดอายุ 8h หรือ 7d ถ้าเลือก rememberMe (ค่า default ของ rememberMe คือ true) payload มี userId/email/roleName/companyId/companyCode/factoryId/firstName/lastName
6. Reset password: เก็บ sha256 ของ token 32 byte ไว้ใน DB อายุ 30 นาที ใช้ได้ครั้งเดียว ส่งเมลผ่าน Resend REST API ถ้าไม่มี key จะคืน devResetUrl แทน รหัสใหม่ต้องยาว ≥8 ตัวและมีทั้งตัวอักษรกับตัวเลข แล้ว hash ด้วย bcrypt 12 (ส่วน lib/password ใช้ 10)
7. ไม่มี middleware ใช้ server layout ของแต่ละ role ตรวจ session/role เอง แต่ละ layout redirect ไม่เหมือนกัน
8. Design: Tailwind v4 + shadcn (style base-nova) ไม่มี tailwind.config ใช้ฟอนต์ Noto Sans Thai สีหลัก #17824e และเขียวเข้ม #173d2d/#0f5f3c ส่วน `constants/color.ts` เป็นไฟล์ว่าง
9. G-Fay คือหุ่นยนต์ 3D สีขาวมีหน้าจอหน้าเรืองเขียวและใบไม้ มี 7 state component นี้วาด GIF ลง canvas จึงแสดงเป็นภาพนิ่งเฟรมเดียว
10. Prisma (MySQL): 38 models และ 4 enums `Equipment`/`ResourceRecord`/`ResourceType`/`RecordStatus` ติดป้าย legacy (ใช้แค่ใน seed) `Notification` ไม่ถูกใช้ ส่วน `SensorData` เขียนผ่าน raw SQL (mysql2) env ที่ใช้มี 18 ตัว

---

# GreenFactory Insight — Legacy Spec: Public Site, Auth, Design System, Data Model

> Source: `/Users/teerathap/GreenFactory-legacy` (Next.js 16.2.10, React 19.2.4, Prisma 7.8 + MariaDB adapter, Tailwind v4)
> ข้อความในเครื่องหมายคำพูดคัดลอกมาจากโค้ดตรงตัว

## A. PUBLIC MARKETING SITE

### A.0 Global chrome
- `app/layout.tsx` ตั้ง `<html lang="th">` และใช้ font `Noto_Sans_Thai` (subsets thai+latin, weights 300–700, variable `--font-noto-thai`) body ใช้ class `bg-[#f7f8f4] text-[#17231c]`
  - metadata: title default `"GreenFactory Insight"`, template `"%s | GreenFactory Insight"`, description `"แพลตฟอร์มบริหารจัดการข้อมูลพลังงาน คาร์บอน และความยั่งยืนสำหรับองค์กรอุตสาหกรรม"`
- `components/layout/AppChrome.tsx` (ตัวที่ใช้จริง) จะซ่อน Navbar/Footer เมื่อ path เป็น `/login`, `/platform`, `/company`, `/manager`, `/operator` หรือ sub-path ของ path เหล่านี้ ข้อสังเกต: `/forgot-password`, `/reset-password` และ `/scan` ยังแสดง Navbar/Footer อยู่
- `SiteChrome.tsx` ทำงานคล้าย AppChrome แต่ไม่มีที่ไหน import (dead code)

**Navbar** (`components/layout/Navbar.tsx`)
- เป็น header แบบ fixed สูง 72px ที่หน้า `/` ถ้ายังไม่ scroll จะโปร่งใสและใช้ตัวอักษรขาว (`darkHeader`) เมื่อ scroll เกิน 18px จะเปลี่ยนเป็นพื้นขาว `bg-white/95` พร้อม blur
- Logo: `/images/LOGO.png` (บน header มืดจะวางบนกล่องพื้นขาว)
- เมนู: `หน้าแรก` (/), `เกี่ยวกับเรา` (/about), dropdown `โซลูชัน`, `ข้อมูลเชิงลึก` (/news), `ติดต่อเรา` (/contact)
- Dropdown โซลูชัน กว้าง 760px:
  - ฝั่งซ้าย: eyebrow "GreenFactory Platform", หัวข้อ "ข้อมูลโรงงาน / ที่ดูง่ายและใช้ได้จริง", คำอธิบาย "รวมข้อมูลสำคัญไว้ในระบบเดียว เพื่อช่วยให้ทีมทำงานและตัดสินใจได้เร็วขึ้น", ลิงก์ "ดูภาพรวมแพลตฟอร์ม" → /features
  - 4 รายการ:
    - "การจัดการพลังงาน": "ติดตามการใช้พลังงาน ต้นทุน และประสิทธิภาพของโรงงาน" → /features#energy
    - "ข้อมูลการผลิต": "เชื่อมโยงเครื่องจักร สายการผลิต และสถานะการดำเนินงาน" → /features#production ⚠️ ไม่มี anchor นี้ในหน้า
    - "ทรัพยากรและการปล่อย": "จัดการทรัพยากร ของเสีย และข้อมูลการปล่อยอย่างเป็นระบบ" → /features#resources ⚠️ ไม่มี anchor
    - "การวิเคราะห์ข้อมูล": "ดูแนวโน้ม เปรียบเทียบผลลัพธ์ และหาโอกาสในการปรับปรุง" → /features#analytics ⚠️ ไม่มี anchor
- CTA ขวาบน: "เข้าสู่ระบบ" → /login และ "เริ่มต้นใช้งาน" → /contact
- Mobile: drawer ด้านขวา กว้าง min(90%,400px) มีเมนูชุดเดียวกัน, ลิงก์ "ดูโซลูชันทั้งหมด", "เข้าสู่ระบบ", "เริ่มต้นใช้งาน" และ aria-label "เปิดเมนู", "ปิดเมนู", "เมนูหลัก", "เมนูมือถือ"

**Footer** (`components/layout/Footer.tsx`)
- Brand: badge "GF" + "GreenFactory Insight" + "Industrial Data Platform"
- คำอธิบาย: "ระบบสารสนเทศสำหรับบริหารจัดการข้อมูลพลังงาน ทรัพยากร คาร์บอน และผลการดำเนินงานภายในโรงงานอุตสาหกรรม" พร้อมลิงก์ "ดูภาพรวมระบบ" → /features
- Navigation: หน้าแรก, เกี่ยวกับเรา, โซลูชัน(/features), ข้อมูลเชิงลึก, ติดต่อเรา
- Contact:
  - "มหาวิทยาลัยเทคโนโลยีสุรนารี" / "นครราชสีมา ประเทศไทย" ลิงก์ไป Google Maps query `Suranaree+University+of+Technology`
  - "ติดต่อโครงการ" `kesrin9170@gmail.com` (mailto)
- Bottom bar: "© 2026 GreenFactory Insight", "นโยบายความเป็นส่วนตัว" (/privacy), "ข้อกำหนดการใช้งาน" (/terms), "Sustainability Data Platform" ⚠️ ทั้ง /privacy และ /terms ไม่มีหน้าจริง

### A.1 หน้าแรก `/` (`app/page.tsx` → `components/home/Hero.tsx` อย่างเดียว)
Hero แบบ cinematic สูง 100svh
- พื้นหลังเป็นรูป `/images/hero-factory.jpg` (alt "โรงงานอุตสาหกรรมอิเล็กทรอนิกส์สมัยใหม่") มี gradient มืดจากซ้ายไปขวา
- Animation:
  - ม่านดำเปิดตอนโหลด (1.8s)
  - กล้องเคลื่อนช้า (scale 1.14→1.04, 16s)
  - ambient light สีเขียว `#63c174`
  - light streak, film grain (SVG noise)
  - content reveal เป็นลำดับตาม delay 1.15–2.3s
  - รองรับ `prefers-reduced-motion`
- แถบบน: "GreenFactory Insight" | "Industrial Intelligence Platform"
- Eyebrow: "Sustainability intelligence"
- H1 แบ่ง 3 บรรทัด: "ข้อมูลที่ชัดเจน" / "เปลี่ยนอุตสาหกรรม" / "ให้ยั่งยืนกว่าเดิม" (บรรทัดที่ 3 เป็นตัวเอียงสี `#a9d6b1`)
- Body: "เชื่อมโยงข้อมูลจากโรงงาน เครื่องจักร เซนเซอร์ และหน่วยงานภายในองค์กรเข้าสู่ระบบเดียว เพื่อการวิเคราะห์และตัดสินใจที่แม่นยำ โปร่งใส และตรวจสอบได้"
- Side text: "One platform / Every insight"
- CTA: "สำรวจแพลตฟอร์ม" (ปุ่มขาว) → /features และ "ติดต่อเรา" (ปุ่มขอบโปร่ง) → /contact
- Caption ขวาล่าง: "Connected industrial ecosystem" — "มองเห็นประสิทธิภาพ พลังงาน ทรัพยากร และผลลัพธ์ด้านความยั่งยืนจากทุกส่วนขององค์กร"
- Scroll indicator: "Scroll to explore" และตัวนับ "01 —— 04"

**Components ที่มีโค้ดแต่ไม่ถูกใช้ (เก็บ copy ไว้ใช้ซ้ำได้)**

`home/Features.tsx` (พื้นมืด `#08120d`)
- Eyebrow "Core capabilities", H2 "ทุกข้อมูลสำคัญ / พร้อมใช้งานในที่เดียว"
- Body "ติดตามพลังงาน คาร์บอน ทรัพยากร และผลการดำเนินงาน โดยแต่ละองค์กรมีพื้นที่ข้อมูล ผู้ใช้งาน และสิทธิ์ของตนเอง", ลิงก์ "ดูโซลูชันทั้งหมด"
- 4 การ์ด:
  - Energy "เห็นการใช้พลังงานชัดขึ้น" — "ติดตามการใช้พลังงานตามองค์กร หน่วยงาน สายการผลิต และเครื่องจักร" (128K kWh)
  - Carbon "คำนวณคาร์บอนอย่างเป็นระบบ" — "เชื่อมโยงข้อมูลทรัพยากรกับค่าการปล่อย พร้อมตรวจสอบย้อนหลังได้" (1,256 tCO₂e)
  - Resources "บริหารน้ำและทรัพยากร" — "มองเห็นปริมาณการใช้น้ำ วัตถุดิบ ของเสีย และข้อมูลจากกระบวนการผลิต" (12.5K m³)
  - AI Insight "เปลี่ยนข้อมูลให้เป็นสิ่งที่ควรทำ" — "ค้นหาแนวโน้ม ความผิดปกติ และโอกาสในการลดต้นทุนจากข้อมูลจริง" (24 คำแนะนำ)
- Footnote "ตัวเลขที่แสดงเป็นข้อมูลตัวอย่างสำหรับสื่อสารรูปแบบการทำงานของแพลตฟอร์ม" / "Real-time data visibility"

`home/DashboardPreview.tsx`
- Badge "Connected platform", H2 "ข้อมูลจากทุกส่วน / ทำงานร่วมกันในระบบเดียว"
- Body "GreenFactory Insight เชื่อมโยงข้อมูลจากเครื่องจักร เซนเซอร์ และผู้ใช้งาน ก่อนนำมาประมวลผลเป็นข้อมูลด้านพลังงาน คาร์บอน และการดำเนินงานที่พร้อมนำไปใช้", ลิงก์ "สำรวจความสามารถของแพลตฟอร์ม"
- Sources: Sensor/ข้อมูลหน้างาน, Machine/เครื่องจักร, User/ผู้ใช้งาน → Outputs: Energy, Carbon, AI Insight, Reports
- Mock browser `app.greenfactory-insight.com` แสดง "Executive overview / ภาพรวมการดำเนินงาน" / "เดือนปัจจุบัน"
  - KPI: การใช้พลังงาน 128,420 kWh -12.6%; การปล่อยคาร์บอน 1,256 tCO₂e -6.8%; เครื่องจักรออนไลน์ 96.8% "สถานะปกติ"
  - กราฟ "แนวโน้มการใช้พลังงาน / ข้อมูลย้อนหลัง 12 เดือน" (ม.ค.…ธ.ค.)

ไฟล์ว่าง 0 bytes: AISection, CarbonSection, ContactSection, HowItWorks, Industries, NewsSection, Statistics, Testimonials, TrustedCompanies → **ไม่มี testimonials / logos / stats จริง**

### A.2 `/about` (`app/about/page.tsx`, metadata title "เกี่ยวกับเรา | GreenFactory Insight")
1. **HERO** (bg `/images/hero-factory.jpg`)
   - Eyebrow "About GreenFactory Insight", H1 "เกี่ยวกับ / GreenFactory Insight"
   - P1 "แพลตฟอร์มบริหารจัดการข้อมูลสำหรับองค์กรอุตสาหกรรม ที่ออกแบบมาเพื่อรวบรวมข้อมูลจากบุคลากร เครื่องจักร และกระบวนการผลิตให้อยู่ในระบบเดียว"
   - P2 "ช่วยให้องค์กรติดตามการใช้พลังงาน ทรัพยากร ของเสีย การปล่อยคาร์บอน ตัวชี้วัด และประสิทธิภาพของโรงงาน เพื่อใช้ประกอบการวางแผนและตัดสินใจได้อย่างชัดเจนยิ่งขึ้น"
   - CTA "ดูความสามารถของระบบ" → /features, "ติดต่อเรา" → /contact
2. **WHO WE ARE**: "Who we are" / H2 "ระบบที่เกิดขึ้นจาก / ปัญหาของข้อมูลในโรงงาน"
   - "ในโรงงานหนึ่งแห่งมีข้อมูลเกิดขึ้นตลอดเวลา ทั้งจากการทำงานของบุคลากร เครื่องจักร เซนเซอร์ การใช้ทรัพยากร และกระบวนการผลิต"
   - "ปัญหาคือข้อมูลเหล่านี้มักถูกจัดเก็บแยกกัน บางส่วนอยู่ในเอกสาร บางส่วนอยู่ในไฟล์ตาราง และบางส่วนอยู่ในระบบของเครื่องจักร ทำให้การตรวจสอบและสรุปผลใช้เวลานาน"
   - "GreenFactory Insight จึงถูกออกแบบให้เป็นศูนย์กลางสำหรับรวบรวมข้อมูล ประมวลผล และนำเสนอข้อมูลที่เหมาะสมกับผู้ใช้งานแต่ละระดับ ภายในองค์กร"
3. **OUR STORY** (รูป hero-factory.jpg)
   - Overlay "Our purpose" — "ทำให้ข้อมูลจากทุกส่วนของโรงงานสามารถนำมาใช้งานร่วมกันได้อย่างเป็นระบบ"
   - "Our story" / H2 "จากข้อมูลที่กระจัดกระจาย / สู่ภาพรวมที่เข้าใจได้"
   - ย่อหน้า 1: "แนวคิดของ GreenFactory Insight เริ่มต้นจากการมองเห็นปัญหาที่เกิดขึ้นจริงในองค์กรอุตสาหกรรม ซึ่งมีข้อมูลจำนวนมาก แต่ขาดพื้นที่กลางสำหรับเชื่อมโยงข้อมูลเหล่านั้น"
   - ย่อหน้า 2: "ระบบจึงถูกออกแบบให้รองรับโครงสร้างตั้งแต่ระดับบริษัท โรงงาน อาคาร แผนก สายการผลิต เครื่องจักร และเซนเซอร์ เพื่อให้ข้อมูลทุกชุดมีที่มาและสามารถตรวจสอบย้อนหลังได้"
   - ย่อหน้า 3: "เป้าหมายไม่ใช่เพียงการสร้าง Dashboard แต่คือการสร้างระบบที่ช่วยให้ผู้ปฏิบัติงานทำงานง่ายขึ้น ผู้จัดการเห็นปัญหาเร็วขึ้น และผู้บริหารมีข้อมูลที่เพียงพอสำหรับการตัดสินใจ"
4. **PLATFORM OVERVIEW**: "Platform overview" / H2 "ข้อมูลสำคัญของโรงงาน / อยู่ในระบบเดียว"
   - Intro: "GreenFactory Insight ครอบคลุมการทำงานตั้งแต่การจัดการโครงสร้างองค์กร การบันทึกข้อมูลหน้างาน การติดตามตัวชี้วัด ไปจนถึงการวิเคราะห์และสร้างรายงาน"
   - 6 cards:
     - การใช้พลังงาน — "ติดตามและวิเคราะห์การใช้ไฟฟ้าและพลังงานของแต่ละโรงงาน อาคาร และสายการผลิต"
     - ทรัพยากรและน้ำ — "รวบรวมข้อมูลการใช้ทรัพยากรจากหน้างาน เพื่อให้ตรวจสอบและเปรียบเทียบได้ง่าย"
     - คาร์บอนและสิ่งแวดล้อม — "คำนวณและสรุปข้อมูลการปล่อยคาร์บอนจากกิจกรรมที่เกิดขึ้นภายในองค์กร"
     - KPI และรายงาน — "แสดงตัวชี้วัดสำคัญ พร้อมสร้างรายงานสำหรับติดตามผลและใช้ประกอบการตัดสินใจ"
     - เครื่องจักรและ QR Code — "เข้าถึงข้อมูลเครื่องจักรและบันทึกข้อมูลหน้างานได้รวดเร็วผ่าน QR Code"
     - คำแนะนำจาก AI — "วิเคราะห์ข้อมูลเพื่อค้นหาความผิดปกติและเสนอแนวทางปรับปรุงการดำเนินงาน"
5. **USERS**: "Designed for every role" / H2 "ออกแบบให้ผู้ใช้งาน / แต่ละระดับทำงานร่วมกันได้"
   - Intro: "ผู้ใช้งานแต่ละบทบาทจะเห็นข้อมูลและเครื่องมือที่เหมาะสมกับหน้าที่ ช่วยลดความซับซ้อนและควบคุมการเข้าถึงข้อมูลภายในองค์กร"
   - ผู้ดูแลบริษัท — "จัดการข้อมูลบริษัท โรงงาน ผู้ใช้งาน สิทธิ์การเข้าถึง และข้อมูลพื้นฐานของระบบ"
   - ผู้จัดการโรงงาน — "ติดตามผลการดำเนินงาน KPI การใช้ทรัพยากร การแจ้งเตือน และข้อมูลภาพรวมของโรงงาน"
   - ผู้ปฏิบัติงาน — "บันทึกข้อมูลจากหน้างาน ตรวจสอบเครื่องจักร และเข้าถึงงานที่เกี่ยวข้องกับตนเอง"
6. **VISION/MISSION/GOAL**: "Our direction" / H2 "วิสัยทัศน์และทิศทาง / ของ GreenFactory Insight"
   - 01 Vision วิสัยทัศน์ — "พัฒนาแพลตฟอร์มที่ช่วยให้องค์กรอุตสาหกรรมสามารถใช้ข้อมูลในการบริหารจัดการทรัพยากรและการดำเนินงานได้อย่างมีประสิทธิภาพ"
   - 02 Mission พันธกิจ — "เชื่อมโยงข้อมูลจากบุคลากร เครื่องจักร เซนเซอร์ และกระบวนการผลิตให้อยู่ในระบบเดียวที่เข้าใจง่ายและนำไปใช้ได้จริง"
   - 03 Goal เป้าหมาย — "ช่วยให้องค์กรเห็นข้อมูลที่สำคัญ ลดการทำงานที่ซ้ำซ้อน ลดต้นทุน และวางแผนการดำเนินงานบนพื้นฐานของข้อมูลที่เชื่อถือได้"
7. **STRENGTHS**: "Why GreenFactory Insight" / H2 "ออกแบบจากกระบวนการ / ทำงานขององค์กรจริง"
   - Intro: "ระบบให้ความสำคัญทั้งด้านการใช้งาน โครงสร้างข้อมูล ความปลอดภัย และความสามารถในการขยายระบบในอนาคต"
   - รองรับโครงสร้างโรงงานจริง — "ระบบจัดเก็บข้อมูลตั้งแต่บริษัท โรงงาน อาคาร แผนก สายการผลิต เครื่องจักร ไปจนถึงเซนเซอร์"
   - ติดตามข้อมูลได้เป็นระบบ — "รวมข้อมูลจากการบันทึกด้วยบุคลากร เครื่องจักร และระบบภายนอกไว้ในพื้นที่เดียว"
   - แบ่งสิทธิ์ตามบทบาท — "ผู้ใช้งานแต่ละระดับเห็นและจัดการเฉพาะข้อมูลที่เกี่ยวข้องกับหน้าที่ของตนเอง"
   - พร้อมใช้ประกอบการตัดสินใจ — "เปลี่ยนข้อมูลจากหน้างานให้เป็น Dashboard ตัวชี้วัด รายงาน และข้อเสนอแนะที่เข้าใจง่าย"
8. **CTA** (bg hero-factory.jpg): "Get in touch" / H2 "เปลี่ยนข้อมูลของโรงงาน / ให้พร้อมสำหรับการตัดสินใจ"
   - Body: "เรียนรู้เพิ่มเติมเกี่ยวกับแนวทางการจัดการข้อมูล และความสามารถของ GreenFactory Insight สำหรับองค์กรอุตสาหกรรม"
   - CTA "ติดต่อเรา" → /contact

### A.3 `/features` — "โซลูชัน"
metadata title "โซลูชัน", desc "แพลตฟอร์มบริหารจัดการข้อมูลพลังงาน คาร์บอน น้ำ ทรัพยากร และข้อมูลความยั่งยืนสำหรับองค์กรอุตสาหกรรม" ใช้ bg `#f7f8f4`

ลำดับ section:
1. **FeaturesHero**
   - Eyebrow "Solutions", H1 "ทุกข้อมูลสำคัญ / ของโรงงาน / ในแพลตฟอร์มเดียว"
   - Body "ติดตามพลังงาน คาร์บอน ทรัพยากร และข้อมูลจากกระบวนการผลิต เพื่อให้ผู้ปฏิบัติงานและผู้บริหารมองเห็นข้อมูลชุดเดียวกัน"
   - CTA "สำรวจแพลตฟอร์ม" (#solutions, ปุ่ม `#386849`), "ติดต่อเรา" → /contact
   - Data flow: Sensor → Machine → Department → Central Data
   - `<DashboardMockup variant="overview">` (components/common/DashboardMockup.tsx, 767 บรรทัด)
   - 3 ขั้น:
     - 01 รวบรวมข้อมูล — "จากบุคลากร เครื่องจักร เซนเซอร์ และกระบวนการภายในองค์กร"
     - 02 วิเคราะห์ข้อมูล — "เปรียบเทียบแนวโน้ม ตรวจจับความผิดปกติ และประเมินผลลัพธ์"
     - 03 สนับสนุนการตัดสินใจ — "สรุปข้อมูลที่เหมาะสมสำหรับผู้ปฏิบัติงาน ผู้จัดการ และผู้บริหาร"
2. **SolutionNavigation**: แถบ sticky อยู่ที่ top 72px label "Explore" มี pills: พลังงาน(#energy), คาร์บอน(#carbon), น้ำและทรัพยากร(#water), ของเสีย(#water), AI และการวิเคราะห์(#ai), ภาพรวมแพลตฟอร์ม(#platform)
3. **FeatureBlock ×4** (ทุก block มีปุ่ม "พูดคุยเกี่ยวกับโซลูชันนี้" → /contact และ DashboardMockup ตาม variant)

   **Energy** `#energy`
   - Eyebrow "Energy management"
   - Title "มองเห็นการใช้พลังงาน" + highlight "ก่อนต้นทุนจะเพิ่มขึ้น"
   - Desc "ติดตามการใช้พลังงานของหน่วยงาน สายการผลิต และเครื่องจักร พร้อมเห็นความผิดปกติจากข้อมูลที่เกิดขึ้นจริง"
   - Metrics: 128K พลังงานที่ใช้ (kWh ในเดือนปัจจุบัน) | -12.6% ลดลง (เทียบช่วงก่อนหน้า) | 82% เทียบเป้าหมาย (ประสิทธิภาพการใช้พลังงาน)
   - Tags: Sensor, Machine, Production line, Alert
   - Note "ข้อมูลสามารถบันทึกจากเซนเซอร์ เครื่องจักร หรือผู้ปฏิบัติงาน ก่อนสรุปเป็นภาพรวมสำหรับผู้บริหาร"

   **Carbon** `#carbon` (reversed, tinted bg `#edf2ec`)
   - Eyebrow "Carbon management"
   - Title "ติดตามคาร์บอน" + "จากข้อมูลที่ตรวจสอบย้อนกลับได้"
   - Desc "คำนวณผลการปล่อยจากข้อมูลทรัพยากรและค่าการปล่อยที่องค์กรกำหนด พร้อมแยกภาพรวมตามขอบเขตและช่วงเวลา"
   - Metrics: 1,256 การปล่อยรวม (tCO₂e ปีปัจจุบัน) | 64% มาจากไฟฟ้า (แหล่งการปล่อยหลัก) | -6.8% ลดลง (เทียบปีก่อนหน้า)
   - Tags: Scope 1, Scope 2, Scope 3, Emission factor
   - Note "ผลการคำนวณเก็บค่า Emission Factor ที่ใช้จริงในแต่ละครั้ง จึงสามารถตรวจสอบย้อนหลังได้"

   **Water** `#water`
   - Eyebrow "Resource management"
   - Title "บริหารน้ำและทรัพยากร" + "ให้สัมพันธ์กับการผลิต"
   - Desc "เห็นปริมาณการใช้น้ำ วัตถุดิบ และของเสียในแต่ละหน่วยงาน เพื่อค้นหาจุดที่ใช้ทรัพยากรสูงกว่าปกติ"
   - Metrics: 12.5K ปริมาณการใช้น้ำ (m³ ในเดือนปัจจุบัน) | 38% นำกลับมาใช้ซ้ำ (จากปริมาณน้ำทั้งหมด) | -4.2% ลดลง (เทียบช่วงก่อนหน้า)
   - Tags: Water, Material, Waste, Department
   - Note "ข้อมูลทรัพยากรสามารถเชื่อมโยงกับหน่วยงาน สายการผลิต เครื่องจักร และผู้บันทึกได้"

   **AI** `#ai` (reversed, tinted)
   - Eyebrow "Analytics and recommendations"
   - Title "เปลี่ยนข้อมูลจำนวนมาก" + "ให้เป็นสิ่งที่ควรทำต่อ"
   - Desc "ระบบช่วยสรุปแนวโน้ม ความผิดปกติ และโอกาสในการปรับปรุง เพื่อให้ทีมงานจัดลำดับความสำคัญได้เร็วขึ้น"
   - Metrics: 24 คำแนะนำ (จากข้อมูลล่าสุด) | 145K ต้นทุนที่ลดได้ (บาทต่อปีโดยประมาณ) | 38.6 คาร์บอนที่ลดได้ (tCO₂e โดยประมาณ)
   - Tags: Recommendation, Priority, Alert, Saving
   - Note "คำแนะนำแต่ละรายการมีระดับความสำคัญ ผลประหยัดโดยประมาณ และสถานะการดำเนินงาน"
4. **PlatformSection** `#platform` (dark)
   - "One connected platform" / H2 "จากข้อมูลหน้างาน / สู่ภาพรวมของทั้งองค์กร"
   - Body "GreenFactory Insight เชื่อมต่อข้อมูลจากเซนเซอร์ เครื่องจักร และผู้ปฏิบัติงาน ก่อนนำมาประมวลผลเป็นข้อมูลที่พร้อมใช้งาน สำหรับการติดตาม วิเคราะห์ และตัดสินใจ"
   - Flow 6 ขั้น: เซนเซอร์ (รับข้อมูลจากหน้างาน) → เครื่องจักร (เชื่อมโยงสายการผลิต) → ข้อมูลทรัพยากร (พลังงาน น้ำ และของเสีย) → การคำนวณคาร์บอน (ประมวลผลโดยอัตโนมัติ) → การวิเคราะห์ (ค้นหาโอกาสในการปรับปรุง) → แดชบอร์ด (สรุปข้อมูลเพื่อการตัดสินใจ)
   - "Enterprise platform" / "ข้อมูลชุดเดียว / สำหรับทุกระดับขององค์กร"
     - Body "ผู้ปฏิบัติงานสามารถบันทึกและตรวจสอบข้อมูล ผู้จัดการสามารถติดตามผลการดำเนินงาน และผู้บริหารสามารถเห็นภาพรวมจากข้อมูลชุดเดียวกัน ช่วยลดความซ้ำซ้อนและความคลาดเคลื่อนระหว่างหน่วยงาน"
     - Chips: ข้อมูลจากหน้างาน, การอนุมัติ, การแจ้งเตือน, รายงานสำหรับผู้บริหาร
   - Stats: 128 เซนเซอร์ | 42 เครื่องจักร | 18 หน่วยงาน | 24/7 การติดตามข้อมูล
   - Closing "ตัวเลขบนหน้านี้เป็นข้อมูลตัวอย่างสำหรับแสดงรูปแบบการทำงานของระบบ และสามารถเปลี่ยนแปลงได้ตามข้อมูลจริงของแต่ละองค์กร" + ปุ่ม "พูดคุยเกี่ยวกับองค์กรของคุณ" → /contact
5. **CTASection** (components/common)
   - eyebrow "GreenFactory Insight", title "พร้อมยกระดับ" + highlight "การบริหารข้อมูลโรงงาน"
   - description (override) "เชื่อมโยงข้อมูลด้านพลังงาน คาร์บอน ทรัพยากร และกระบวนการผลิตไว้ในแพลตฟอร์มเดียว เพื่อให้องค์กรเห็นภาพรวมและตัดสินใจได้อย่างชัดเจนยิ่งขึ้น"
   - Chips: พลังงาน, คาร์บอน, ทรัพยากร, ข้อมูลการผลิต
   - Contact card "Contact" / "พูดคุยกับทีมของเรา" / "บอกเราเกี่ยวกับเป้าหมายและความต้องการขององค์กร เพื่อค้นหาแนวทางที่เหมาะกับกระบวนการทำงานของคุณ"
   - ปุ่ม "ติดต่อเรา" → /contact + mailto `contact@greenfactory-insight.com` (default prop)
   - Footnote "เราจะติดต่อกลับผ่านข้อมูลที่คุณระบุในหน้าติดต่อเรา"
   - ค่า default ของ description ใน component: "รวมข้อมูลจากเครื่องจักร เซนเซอร์ และผู้ปฏิบัติงานไว้ในแพลตฟอร์มเดียว เพื่อช่วยให้องค์กรตัดสินใจได้ชัดเจนขึ้น ลดความซ้ำซ้อน และสนับสนุนเป้าหมายด้านความยั่งยืน"

### A.4 `/news` — "ข้อมูลเชิงลึก" (`components/insights/InsightsExperience.tsx`)
metadata desc "บทความ แนวคิด และมุมมองด้านพลังงาน คาร์บอน เทคโนโลยี และการบริหารข้อมูลสำหรับองค์กรอุตสาหกรรม"

1. **Hero**: "GreenFactory Insights" / H1 "มุมมองใหม่ / สำหรับโรงงานที่ขับเคลื่อนด้วยข้อมูล"
   - Body "บทความสั้น ภาพจริง และแนวคิดที่ช่วยให้เห็นว่า ข้อมูลที่ดีสามารถเปลี่ยนการทำงานขององค์กรได้อย่างไร"
   - Search: label "ค้นหาหัวข้อที่สนใจ", placeholder "พลังงาน คาร์บอน ข้อมูล..."
2. **Featured**: ใช้บทความแรก label "เรื่องเด่น · {category}", "เปิดบทความ", readTime
3. **Filter**: ทั้งหมด / พลังงาน / คาร์บอน / ข้อมูล / เทคโนโลยี
4. **Stories**: "Latest perspectives" / "อ่านต่อแบบไม่เสียเวลา" ถ้าไม่พบผลลัพธ์แสดง "ไม่พบเนื้อหาที่ตรงกับคำค้น"
   1. [ข้อมูล, 5 นาที] "โรงงานจะตัดสินใจได้เร็วขึ้น เมื่อข้อมูลไม่กระจัดกระจาย" — "การรวมข้อมูลจากเครื่องจักร เซนเซอร์ และผู้ใช้งานไว้ในระบบเดียว ช่วยให้ปัญหาที่เคยมองไม่เห็น กลายเป็นสิ่งที่จัดการได้" (/news/connected-factory-data)
   2. [พลังงาน, 4 นาที] "ต้นทุนพลังงานที่สูงขึ้น มักเริ่มจากสัญญาณเล็ก ๆ" — "ดูว่าข้อมูลรายเครื่องจักรและรายสายการผลิต ช่วยให้ทีมงานเห็นความผิดปกติก่อนกลายเป็นต้นทุนก้อนใหญ่ได้อย่างไร" (/news/energy-signals)
   3. [คาร์บอน, 6 นาที] "การคำนวณคาร์บอนที่ดี ต้องตอบได้ว่าตัวเลขมาจากไหน" — "ผลลัพธ์ที่น่าเชื่อถือไม่ได้เกิดจากสูตรเพียงอย่างเดียว แต่เกิดจากข้อมูลต้นทางที่ตรวจสอบย้อนกลับได้" (/news/auditable-carbon)
   4. [เทคโนโลยี, 5 นาที] "แพลตฟอร์มที่ดีควรลดความซับซ้อน ไม่ใช่เพิ่มหน้าจอ" — "ระบบที่ใช้งานจริงต้องทำให้ข้อมูลสำคัญเข้าใจง่าย และไม่บังคับให้ผู้ใช้เรียนรู้โครงสร้างที่ซับซ้อนเกินความจำเป็น" (/news/platform-simplicity)
   - ⚠️ ไม่มี route `/news/[slug]` ลิงก์เหล่านี้จะได้ 404
5. **Full-width statement**: "A clearer industrial future" / "โรงงานไม่จำเป็นต้องมีข้อมูลมากขึ้น / แค่ต้องเห็นข้อมูลที่สำคัญให้ชัดขึ้น"
6. **Gallery** "Visual journal" / "มองอุตสาหกรรมผ่านภาพ" เป็น carousel 3 ภาพพร้อม lightbox (Esc/←/→)
   - "พลังงานสะอาดจะมีคุณค่ามากขึ้น เมื่อองค์กรเห็นข้อมูลการใช้งานอย่างชัดเจน"
   - "ข้อมูลจากหน้างานคือจุดเริ่มต้นของการตัดสินใจที่แม่นยำ"
   - "เมื่อพลังงาน คาร์บอน และการผลิตอยู่ในภาพเดียวกัน องค์กรจะเห็นโอกาสได้มากกว่าเดิม"
- รูปทั้งหมดมาจาก images.unsplash.com: photo-1716643863806-989dd76ae093, photo-1745321633881-d2d2218911bd, photo-1613665813446-82a78c468a1d, photo-1496247749665-49cf5b1022e9

### A.5 `/contact` (`components/contact/ContactExperience.tsx`, metadata title "ติดต่อเรา" แต่ description ว่าง)
1. **Header**: "ติดต่อเรา" / H1 "พูดคุยเกี่ยวกับความต้องการขององค์กร" / "ส่งรายละเอียดเกี่ยวกับเป้าหมาย ปัญหา หรือข้อมูลที่องค์กรต้องการบริหาร เพื่อให้เรานำไปวางแนวทางการพัฒนาร่วมกัน"
2. **Aside ข้อมูลติดต่อ**: "ข้อมูลติดต่อ" / "ติดต่อ GreenFactory Insight" / "สำหรับสอบถามข้อมูลระบบ ความร่วมมือ หรือข้อเสนอแนะเกี่ยวกับโครงการ"
   - Email kesrin9170@gmail.com
   - "สถานที่พัฒนาโครงการ" มหาวิทยาลัยเทคโนโลยีสุรนารี นครราชสีมา ประเทศไทย
   - "การติดต่อกลับ" ติดต่อกลับผ่านอีเมล หลังได้รับรายละเอียดจากคุณ
3. **Form**: "แบบฟอร์มติดต่อ" / "ส่งรายละเอียดให้เรา" / "กรุณากรอกข้อมูลให้ครบถ้วน เพื่อให้สามารถติดต่อกลับได้สะดวก"
   - Fields:
     - ชื่อ - นามสกุล* (placeholder "ชื่อของคุณ")
     - อีเมล* (name@company.com)
     - องค์กร / โรงงาน ("ชื่อองค์กรของคุณ")
     - หัวข้อที่ต้องการพูดคุย* (select: สนใจแพลตฟอร์ม, สอบถามการใช้งาน, ความร่วมมือทางวิชาการ, ข้อเสนอแนะ, อื่น ๆ)
     - textarea* ("อธิบายเป้าหมาย ปัญหา หรือข้อมูลที่ต้องการบริหาร")
   - Privacy note "ข้อมูลจะใช้เพื่อการติดต่อกลับเกี่ยวกับคำขอของคุณเท่านั้น", ปุ่ม "ส่งข้อความ"
   - **Submit ไม่ได้ส่งข้อมูลไปไหน** แค่ `setSubmitted(true)` แล้วแสดง "ได้รับข้อความแล้ว" / "ขณะนี้เป็นแบบฟอร์มตัวอย่าง เมื่อต่อระบบหลังบ้านแล้ว ข้อมูลจะถูกส่งและจัดเก็บจริง" / ปุ่ม "ส่งข้อความใหม่"
4. **FAQ** "คำถามที่พบบ่อย" / "ข้อมูลก่อนเริ่มติดต่อ" (accordion, ข้อแรกเปิดไว้)
   - "สามารถพูดคุยเกี่ยวกับความต้องการขององค์กรก่อนได้หรือไม่" → "ได้ คุณสามารถส่งรายละเอียดเบื้องต้นเกี่ยวกับองค์กร ปัญหาที่พบ และข้อมูลที่ต้องการบริหารผ่านแบบฟอร์มนี้ได้"
   - "แพลตฟอร์มรองรับหลายองค์กรหรือหลายหน่วยงานหรือไม่" → "รองรับ โดยระบบสามารถแยกข้อมูล ผู้ใช้งาน หน่วยงาน และสิทธิ์การเข้าถึงของแต่ละองค์กรได้อย่างเป็นระบบ"
   - "ต้องเตรียมข้อมูลอะไรบ้างก่อนติดต่อ" → "ระบุประเภทองค์กร เป้าหมายที่ต้องการ และข้อมูลที่มีอยู่ เช่น พลังงาน คาร์บอน น้ำ ของเสีย หรือข้อมูลจากเครื่องจักร"
5. **Bottom strip**: "ต้องการสอบถามเพิ่มเติมเกี่ยวกับโครงการ" + ปุ่ม "ส่งอีเมลโดยตรง" (mailto)

### A.6 `/pricing` และ `/register` (placeholder)
- `/pricing`: H1 "Pricing" + "แพ็กเกจและรายละเอียดการใช้งาน GreenFactory Insight" **ไม่มี pricing tiers**
- `/register`: H1 "Register" + "หน้าสมัครใช้งานระบบ" ไม่มีฟอร์ม และไม่มี API สำหรับสมัคร

### A.7 Images ใน `public/`
| ไฟล์ | ขนาด | ใช้ที่ |
|---|---|---|
| `images/LOGO.png` | 1672×941 PNG (เป็น PNG จริง มีพื้นขาวรอบ) | Navbar, LoginForm, forgot/reset pages |
| `images/hero-factory.jpg` | 1536×1024 (**ข้างในเป็น PNG แม้นามสกุลจะเป็น .jpg**) | Home Hero, About (hero, story, CTA) |
| `images/g-fay.gif` | 443×443 GIF | GFayMascot (manager) |
| `images/nong-at-ai-profile.png` | 750×1000 | ภาพถ่ายบุคคลจริง (selfie) ไม่มีโค้ดใดอ้างถึง ไม่ควรนำมาใช้ต่อ |
| `fonts/NotoSansThai-Regular.ttf`, `-Bold.ttf` | — | ใช้เฉพาะ PDF export (`app/api/manager/export/pdf`) |

## B. AUTH

### B.1 Login flow (`POST /api/auth/login`, `app/api/auth/login/route.ts`)
**Body**: `{ companyCode, email, password, rememberMe }`
- Server normalize: `companyCode.trim().toUpperCase()`, `email.trim().toLowerCase()`
- ฝั่ง client ก็แปลง companyCode เป็นตัวพิมพ์ใหญ่ขณะพิมพ์

ลำดับการตรวจ (ทุก failure จะเขียน `LoginLog` พร้อม `failureReason`):

| # | เงื่อนไข | HTTP | ข้อความ | failureReason |
|---|---|---|---|---|
| 1 | ขาด companyCode, email หรือ password | 400 | "กรุณากรอกรหัสองค์กร อีเมล และรหัสผ่าน" | MISSING_CREDENTIALS |
| 2 | ไม่พบ user ตาม email (email เป็น unique ทั้งระบบ ไม่ได้แยกตามบริษัท) | 401 | "รหัสองค์กร อีเมล หรือรหัสผ่านไม่ถูกต้อง" | INVALID_CREDENTIALS |
| 3 | `user.status !== "ACTIVE"` | 403 | "บัญชีนี้ไม่สามารถใช้งานได้" | ACCOUNT_INACTIVE |
| 4 | `lockedUntil > now` | 423 | "บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่ในอีกประมาณ {n} นาที" | ACCOUNT_LOCKED |
| 5 | role ไม่อยู่ใน PLATFORM_ADMIN/COMPANY_ADMIN/MANAGER/OPERATOR | 403 | "บัญชีนี้ไม่มีบทบาทที่รองรับในระบบ" | UNSUPPORTED_ROLE |
| 6a | PLATFORM_ADMIN: env `PLATFORM_ACCESS_CODE` ไม่ได้ตั้งค่า | 500 | "ระบบยังไม่ได้ตั้งค่ารหัสผู้ดูแลแพลตฟอร์ม" | PLATFORM_ACCESS_CODE_NOT_CONFIGURED |
| 6b | companyCode ≠ PLATFORM_ACCESS_CODE (uppercase) | 401 | ข้อความ generic | INVALID_PLATFORM_CODE |
| 6c | PLATFORM_ADMIN มี companyId หรือ factoryId | 500 | "โครงสร้างบัญชีผู้ดูแลแพลตฟอร์มไม่ถูกต้อง" / "โครงสร้างโรงงานของบัญชีผู้ดูแลแพลตฟอร์มไม่ถูกต้อง" | INVALID_PLATFORM_ADMIN_ASSIGNMENT / …_FACTORY_ASSIGNMENT |
| 7a | role อื่นแต่ไม่มี company | 403 | "บัญชีนี้ยังไม่ได้ถูกกำหนดองค์กร" | NO_COMPANY |
| 7b | companyCode ไม่ตรง | 401 | ข้อความ generic | INVALID_COMPANY_CODE |
| 7c | MANAGER/OPERATOR ไม่มี factory | 403 | "บัญชีนี้ยังไม่ได้ถูกกำหนดโรงงาน กรุณาติดต่อผู้ดูแลบริษัท" | NO_FACTORY_ASSIGNMENT |
| 7d | factory.companyId ≠ user.companyId | 500 | "โครงสร้างบริษัทและโรงงานของบัญชีนี้ไม่ถูกต้อง" | FACTORY_COMPANY_MISMATCH |
| 8 | bcrypt.compare ไม่ผ่าน | 401 | generic หรือ "บัญชีถูกล็อก 15 นาที เนื่องจากกรอกรหัสผ่านผิดหลายครั้ง" | INVALID_PASSWORD / PASSWORD_RETRY_LIMIT_REACHED |
| — | exception | 500 | "ระบบเข้าสู่ระบบเกิดข้อผิดพลาด กรุณาลองใหม่" | — |

**Lockout rules**
- รหัสผิดแต่ละครั้งจะเพิ่ม `failedLogin` (DB column `failed_login_count`) ทีละ 1
- เมื่อถึง **5 ครั้ง** จะตั้ง `lockedUntil = now + 15 นาที` และ **reset failedLogin เป็น 0**
- ถ้ายังไม่ถึง 5 ครั้งจะตั้ง `lockedUntil = null`
- นับเฉพาะกรณีรหัสผิดเท่านั้น (companyCode ผิดไม่นับ)
- ค่าใน `SystemSetting.maxLoginAttempts` (default 5) และ `sessionTimeoutMinutes` (default 60) **ไม่ได้ถูกใช้ใน login** เพราะ route hardcode ค่าไว้เอง

**Success**
- update `failedLogin=0`, `lockedUntil=null`, `lastLogin=now`
- สร้าง JWT แล้ว set cookie
- เขียน LoginLog SUCCESS
- return `{ success: true, redirectTo }`

**Role → redirect** (`getRedirectPath` ซ้ำกันทั้งใน `lib/roles.ts` และใน route):
PLATFORM_ADMIN → `/platform` (→ `/platform/dashboard`), COMPANY_ADMIN → `/company` (→ `/company/dashboard`), MANAGER → `/manager`, OPERATOR → `/operator`

**Session scope**
- `companyCode` = null สำหรับ PLATFORM_ADMIN
- `factoryId` จะมีค่าเฉพาะ MANAGER/OPERATOR ส่วน COMPANY_ADMIN = null เพื่อให้เลือกดูได้ทุกโรงงานในบริษัท

**Client (`components/auth/LoginForm.tsx`)**
- Decor text: "Sustainable Factory", "People · Process · Planet", "Data today / for a greener tomorrow"
- Card: "Welcome back" / H1 "เข้าสู่ระบบ" / "กรอกข้อมูลบัญชีเพื่อเข้าใช้งาน GreenFactory Insight"
- Fields: รหัสองค์กร (placeholder "เช่น GF001"), อีเมล (name@company.com), รหัสผ่าน ("กรอกรหัสผ่าน") พร้อมปุ่มแสดง/ซ่อน (aria-label "แสดงรหัสผ่าน"/"ซ่อนรหัสผ่าน")
- Checkbox "จดจำการเข้าสู่ระบบ" (**default checked = true**), ลิงก์ "ลืมรหัสผ่าน?" → /forgot-password
- ปุ่ม submit เปลี่ยนข้อความตาม state: "กำลังเตรียมระบบ" → "กำลังตรวจสอบ" → "เข้าสู่ระบบ"
- Footer: "Secure access for GreenFactory users", "© 2026 GreenFactory Insight"
- Browser title:
  - ปกติ "เข้าสู่ระบบ | GreenFactory Insight"
  - ระหว่างตรวจ "กำลังตรวจสอบ | GreenFactory Insight"
  - สำเร็จ "✅ เข้าสู่ระบบสำเร็จ | …"
  - ล้มเหลว "❌ เข้าสู่ระบบไม่สำเร็จ | …"
  - network error "⚠️ ไม่สามารถเชื่อมต่อระบบ | …"
  - ข้อความล้มเหลวจะ reset กลับเป็น title ปกติหลัง 3.5s (`updateBrowserTitle.ts`)
- Network error แสดง "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง"
- **returnTo**: รับเฉพาะรูปแบบ `/scan/<token>` (token ไม่มี "/" และไม่ขึ้นต้นด้วย "//") ถ้าผ่านจะใช้แทน redirect ของ role
  - ใช้กับ QR flow: `app/scan/[token]/page.tsx` เมื่อได้ 401 จะไปที่ `/login?returnTo=/scan/<token>`
- หลัง login เรียก `router.replace(...)` ตามด้วย `router.refresh()`

### B.2 Session / JWT (`lib/session.ts`)
- Cookie name: **`greenfactory_session`**, httpOnly, `secure` เฉพาะ production, sameSite `lax`, path `/`
- JWT: HS256 ผ่าน `jose`, secret = `SESSION_SECRET` (ถ้าไม่ได้ตั้งจะ throw), มี `iat`
- Expiry:
  - rememberMe: `"7d"` และ cookie maxAge 604800s
  - ไม่เลือก rememberMe: `"8h"` และ cookie maxAge 28800s
- Claims (`SessionPayload`): `userId:number, email, roleName, companyId:number|null, companyCode:string|null, factoryId:number|null, firstName, lastName`
- `getSession()` ถ้า verify ไม่ผ่านจะคืน null ไม่มีการ refresh token และไม่มีการเทียบกับ DB (ถ้า user ถูกปิดใช้งานหลัง login, session ยังใช้ได้จนหมดอายุ)
- `clearSessionCookie()` ทำงานโดย set ค่าว่างพร้อม maxAge 0

### B.3 Logout
- `POST /api/auth/logout`: getSession → `markLatestSuccessfulLoginAsLoggedOut(userId)` (ตั้ง `logoutAt` ให้ LoginLog SUCCESS ล่าสุดที่ `logoutAt` ยังเป็น null) → clear cookie → `{success:true}`
- ผู้เรียก: PlatformShell, CompanyShell, company/profile/LogoutCard, manager/Header, manager/ManagerTopbar, operator/Header จากนั้นทุกตัว `window.location` ไป `/login`
- `POST /api/auth/reset-session`: แค่ clear cookie และไม่มีโค้ดใดเรียกใช้

### B.4 Password reset
**`/forgot-password` (page)**
- "Password recovery" / H1 "ลืมรหัสผ่าน?" / "กรอกอีเมลที่ใช้กับ GreenFactory Insight หากพบบัญชี ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้"
- ฟิลด์อีเมล, ปุ่ม "ส่งลิงก์ตั้งรหัสผ่านใหม่" (ขณะส่ง: "กำลังส่งคำขอ")
- Note "เพื่อความปลอดภัย ระบบจะไม่เปิดเผยว่าอีเมลใดมีบัญชีอยู่ในระบบ"
- ลิงก์ "กลับไปหน้าเข้าสู่ระบบ"
- หลังส่ง: "ตรวจสอบอีเมลของคุณ" + message พร้อมปุ่ม "ใช้อีเมลอื่น"
- Dev mode: กล่อง "Development mode" / "ยังไม่ได้ตั้งค่าอีเมล สามารถใช้ลิงก์นี้ทดสอบการรีเซ็ตได้:" + devResetUrl

**`POST /api/auth/forgot-password`**
1. email ว่าง → 400 "กรุณากรอกอีเมล"
2. ไม่พบ user หรือ user ไม่ ACTIVE → ตอบ success พร้อม GENERIC_MESSAGE "หากอีเมลนี้มีบัญชีอยู่ในระบบ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ"
3. invalidate token เดิมทั้งหมดของ user ที่ `usedAt=null` โดยตั้ง `usedAt=now`
4. `rawToken = randomBytes(32).hex`, เก็บ `tokenHash = sha256(rawToken)`, `expiresAt = now + 30 นาที`
5. resetUrl = `${NEXT_PUBLIC_APP_URL || origin}/reset-password?token=<raw>`
6. ส่งเมลผ่าน Resend REST (`POST https://api.resend.com/emails`, Bearer `RESEND_API_KEY`)
   - from = `PASSWORD_RESET_FROM` ?? `"GreenFactory Insight <onboarding@resend.dev>"`
   - subject "ตั้งรหัสผ่านใหม่ | GreenFactory Insight"
   - HTML: h2 "ตั้งรหัสผ่านใหม่", "เราได้รับคำขอตั้งรหัสผ่านใหม่สำหรับบัญชี GreenFactory Insight", ปุ่มสี `#059669` "ตั้งรหัสผ่านใหม่", "ลิงก์นี้มีอายุ 30 นาที และใช้ได้เพียงครั้งเดียว หากคุณไม่ได้เป็นผู้ขอ สามารถเพิกเฉยต่ออีเมลฉบับนี้ได้"
7. ถ้าไม่ใช่ production และส่งเมลไม่สำเร็จ จะคืน `devResetUrl` ใน response
8. error → 500 "ไม่สามารถดำเนินการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง"

**`/reset-password?token=` (page)**
- "New password" / H1 "ตั้งรหัสผ่านใหม่" / "ใช้อย่างน้อย 8 ตัวอักษร และมีทั้งตัวอักษรกับตัวเลข"
- Fields: รหัสผ่านใหม่, ยืนยันรหัสผ่านใหม่
- Client errors: "ไม่พบ token สำหรับตั้งรหัสผ่านใหม่ กรุณาขอลิงก์ใหม่", "รหัสผ่านทั้งสองช่องไม่ตรงกัน"
- ปุ่มขณะส่ง "กำลังบันทึก"
- สำเร็จ: "ตั้งรหัสผ่านใหม่สำเร็จ" / "ตอนนี้สามารถใช้รหัสผ่านใหม่เพื่อเข้าสู่ระบบได้แล้ว" / ปุ่ม "ไปหน้าเข้าสู่ระบบ"

**`POST /api/auth/reset-password`** `{token, password}`
- ข้อมูลไม่ครบ → 400 "ข้อมูลสำหรับตั้งรหัสผ่านใหม่ไม่ครบถ้วน"
- Password rules:
  - ยาว <8 → "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
  - ไม่มีตัวอักษรหรือตัวเลข → "รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข"
- token ไม่พบ, ใช้แล้ว หรือหมดอายุ → "ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่"
- user ไม่ ACTIVE → "ลิงก์ตั้งรหัสผ่านไม่สามารถใช้งานได้ กรุณาติดต่อผู้ดูแลระบบ"
- Transaction: `passwordHash = bcrypt(pw, 12)`, `failedLogin=0`, `lockedUntil=null`, ตั้ง usedAt ให้ token นี้, invalidate token อื่นของ user ทั้งหมด
- ⚠️ ไม่ได้ update `passwordChangedAt` และไม่ได้ทำให้ session เดิมหมดอายุ
- สำเร็จ → "ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว", error → "ไม่สามารถตั้งรหัสผ่านใหม่ได้ กรุณาลองอีกครั้ง"

### B.5 Libraries อื่น
- `lib/password.ts` (server-only): `hashPassword` (bcrypt SALT_ROUNDS=10), `verifyPassword` ⚠️ cost ไม่ตรงกับ reset route (12)
- `lib/login-log.ts`: `createLoginLog({request,userId,attemptedEmail,loginStatus:"SUCCESS"|"FAILED",failureReason,loginMethod="PASSWORD"})`
  - IP: x-forwarded-for (ค่าแรก) → x-real-ip → cf-connecting-ip
  - device: "Tablet" (ipad/tablet), "Mobile" (iphone/android/mobile), "Desktop", "Unknown"
  - error จะถูกกลืน (log แล้วคืน null)
- `lib/roles.ts`:
  - `ALLOWED_ROLES`, `getRedirectPath`
  - `ROLE_LABELS` (Platform Admin / Company Admin / Manager / Operator)
  - `ROLE_PERMISSIONS` (static แสดงใน UI):
    - PLATFORM_ADMIN: "จัดการทุกบริษัทในระบบ", "จัดการผู้ใช้และสิทธิ์ทั้งหมด", "ตั้งค่าระบบ"
    - COMPANY_ADMIN: "จัดการผู้ใช้ในบริษัท", "จัดการเครื่องจักร/จุดตรวจ", "ดูรายงานทั้งบริษัท"
    - MANAGER: "ดูประวัติการบันทึกทั้งหมด", "อนุมัติ/ปฏิเสธรายการบันทึก", "ดูรายงาน"
    - OPERATOR: "บันทึกการใช้ทรัพยากร", "ดูประวัติการบันทึก", "สแกน QR Code"
- `lib/validation.ts`, `lib/auth.ts`: **ไฟล์ว่าง**
- `contexts/AuthContext.tsx`:
  - `AuthProvider({initialUser})` + `useAuth()`
  - `AuthUser {id, companyId, name, roleName, role, avatarInitial, email}`
  - ใช้เฉพาะ manager layout
- `contexts/NotificationContext.tsx`, `ThemeContext.tsx`: ไฟล์ว่าง
- `hooks/*` (useAuth, useCompany, useDashboard, useMachine, useResource, useSensor): **ไฟล์ว่างทั้งหมด**

### B.6 Layout guards ของแต่ละ role (ไม่มี middleware.ts/proxy.ts)
| Layout | ไม่มี session | role ไม่ตรง | ตรวจเพิ่ม | Shell |
|---|---|---|---|---|
| `app/platform/layout.tsx` | → /login | → `/` | — | PlatformShell(user: first/last/email) |
| `app/company/layout.tsx` | → /login | → `/` | ต้องมี `companyId` และ company ต้องเป็น `status==="ACTIVE"` ไม่ผ่านจะไป /login | CompanyShell |
| `app/manager/layout.tsx` | → /login | → `getRedirectPath(role)` | ห่อด้วย `AuthProvider` + Suspense | ManagerShell (`components/manager/Managershell`) |
| `app/operator/layout.tsx` | → /login | PLATFORM_ADMIN→/platform/dashboard, COMPANY_ADMIN→/company/dashboard, MANAGER→/manager/dashboard (⚠️ ไม่มี route นี้), อื่นๆ→/ | — | OperatorShell |

- Index pages: `/platform` → `/platform/dashboard`, `/company` → `/company/dashboard`
- `/manager` และ `/operator` render dashboard ตรงตัว และเรียก `getSession()` ซ้ำอีกรอบ
- API routes แต่ละตัวต้องเรียก `getSession()` เอง ไม่มี guard กลาง

## C. DESIGN SYSTEM

- **Stack**:
  - Tailwind CSS v4 (`@import "tailwindcss"` ผ่าน `@tailwindcss/postcss`) **ไม่มีไฟล์ tailwind.config**
  - ใช้ `tw-animate-css`
  - shadcn `components.json`: style `base-nova`, baseColor neutral, cssVariables true, iconLibrary lucide, aliases `@/components`, `@/components/ui`, `@/lib/utils`, `@/hooks`
  - `components/ui/` มีแค่ `button.tsx`
  - libs อื่น: lucide-react, recharts, framer-motion, class-variance-authority, zod
- **Font**: Noto Sans Thai จาก next/font/google, variable `--font-noto-thai`
  - globals ตั้ง `html { font-family: 'Noto Sans Thai' }`
  - ⚠️ `@theme --font-sans: var(--font-sans)` อ้างถึงตัวเอง (circular) แต่ใช้งานได้เพราะ fallback ไปที่ html font-family
- **constants/**: `color.ts`, `menu.ts`, `permission.ts`, `role.ts`, `status.ts` **ว่างทั้งหมด**
  - มีเนื้อหาแค่ `dashboard.ts` ซึ่งเก็บ types: `ResourceIcon` (zap|droplet|droplets|snowflake|wind|atom|flame|waves|fuel), `TaskCategory`, `TodayTaskSummary`, `RecentRecordIconColor` (amber|blue|slate|purple), `RecentRecord`

**CSS variables (`:root`, light theme ที่ใช้จริง)**

| token | ค่า |
|---|---|
| --background | #f3f8f5 |
| --foreground | #183126 |
| --card / --popover | #ffffff |
| --primary | **#17824e** (fg #ffffff) |
| --secondary / --accent | #e8f5ed (fg #1a633f / #175c3a) |
| --muted | #eef4f0 (fg #748178) |
| --destructive | #d84e55 |
| --border / --input | #dce8e0 |
| --ring | #4cab72 |
| --chart-1…5 | #24a765, #3d8bd9, #f0a33a, #8b6bd6, #e15d64 |
| --radius | 0.85rem (sm×0.6, md×0.8, lg×1, xl×1.4, 2xl×1.8, 3xl×2.2, 4xl×2.6) |
| --sidebar | #0f5f3c (fg #f7fff9, primary #fff, primary-fg #145a3a, accent rgba(255,255,255,.12), border rgba(255,255,255,.14), ring #7dd49f) |

- `.dark` เป็นค่า default ของ shadcn (oklch grayscale) ยังไม่ได้ปรับแต่ง
- `body` มี radial gradient เขียว rgba(76,171,114,.09) ที่มุมบนซ้าย และฟ้า rgba(61,139,217,.055) ที่มุมบนขวา
- `::selection` ใช้ bg #426f51 ตัวอักษรขาว, scrollbar กว้าง 8px

**Utility/components ใน globals.css**
- `.text-balance`
- `.glass` (bg-white/70 + blur-xl + border white/20)
- `.gf-panel` (radius 18px, border rgba(24,94,57,.10), เงาอ่อน)
- `.gf-card-hover` (ยกขึ้น 2px ตอน hover)
- `.gf-soft-grid` (grid 28px)
- `.gf-status-dot`
- `.gf-app-responsive` (กัน overflow บนมือถือ)
- ชุด `.hero-*` เก่า (hero-section/quote/highlight-panel/foreground-leaf) ใช้กับ hero เวอร์ชันก่อน ปัจจุบันไม่ได้ใช้
- `.hero-cinematic-*` ซ้ำกับ styled-jsx ใน Hero.tsx

**Palette ของหน้า public (ค่า hardcode ที่ใช้บ่อย)**
- พื้นหลัง: off-white #f7f8f4 / #f9faf7 / #fbfcf9, tinted #edf2ec
- เขียวเข้มหลักของ brand: **#173d2d** (ปุ่ม CTA ของ navbar), #1c2921 / #17231c / #19271e (สีตัวอักษร)
- เขียวกลาง: #386849 / #315f41 / #497458 / #4a7659 / #477257 / #317552 / #237c49 / #1f7548 / #1c7d4a
- พื้นมืด: #060a07, #08120d, #050806
- เขียวอ่อน accent: #a9d6b1, #a9deb3, #69df99, #86e7aa
- Feature accents:
  - Energy: amber gradient #f7b84b→#f28f38
  - Carbon: #48c47a→#26995d
  - Water: #4fb9db→#308ac1
  - AI: violet #9a7cff→#6f56c6
- Typography style: heading ตัวใหญ่ใช้ `tracking-[-0.055em]`, eyebrow ตัวเล็ก uppercase `tracking-[0.22–0.3em]`, ปุ่มทรง rounded-full

**Logo** `public/images/LOGO.png` (1672×941)
- สัญลักษณ์เป็นตัว "G" เขียวเข้ม (~#0b4d3a) ผสมตัว "F" ที่มีแถบบนเป็นเขียวมะนาว (~#9bcb0c) และมีจุดกลมเขียวมะนาวที่มุมล่าง
- Wordmark "GREEN" สีเขียวเข้มต่อด้วย "FACTORY" สีเทาถ่าน ตัวหนา sans
- ใต้ wordmark: "I N S I G H T" ตัวบางเว้นระยะกว้าง + เส้น (มะนาว→เขียวเข้ม) ที่จบด้วยจุด + tagline "DATA DRIVES BETTER DECISIONS"
- เป็น PNG ที่มีพื้นขาวกว้างรอบ ควรทำ SVG/ไฟล์ที่ crop แล้วใหม่
- ⚠️ Footer ไม่ได้ใช้ไฟล์ logo แต่ใช้ badge ตัวอักษร "GF" แทน

**G-Fay mascot** (`components/manager/GFayMascot.tsx`, รูป `/images/g-fay.gif` 443×443)
- ชื่อเต็มตาม aria-label "G-Fay - GreenFactory Assistant for You"
- ใช้ใน `app/manager/ai/page.tsx`, ManagerTopbar, Managerhomepage
- ลักษณะ: หุ่นยนต์ chibi 3D สีขาว หัวทรงหมวกอวกาศ หน้าจอดำแสดงตาและปากยิ้มเรืองเขียวมิ้นต์ แก้มชมพู
  - มีหูฟังวงแหวนเรืองเขียวทั้งสองข้าง มีใบไม้เขียวงอกจากหูฟัง
  - มีลายใบไม้บนหัว แขน และขา บนหัวเขียน "G-Fay" มีผ้าพันคอสีเขียว
  - ท่าโบกมือร่าเริง
- Props: `state` ∈ idle | friendly | thinking | analyzing | alert | recommend | success, `size` ∈ sm(48px) | md(80px) | lg(128px) | hero(192/224px), `showStatus`, `className`
- STATE_CONFIG (label / message / symbol / สี):

| state | label | message | symbol | สี |
|---|---|---|---|---|
| idle | "พร้อมช่วยเหลือ" | "G-Fay พร้อมดูแลโรงงานค่ะ" | 🌱 | green |
| friendly | "สวัสดีค่ะ" | "มีอะไรให้ G-Fay ช่วยไหมคะ?" | 👋 | green |
| thinking | "กำลังคิด" | "ขอ G-Fay คิดสักครู่นะคะ" | ? | blue |
| analyzing | "กำลังวิเคราะห์" | "กำลังตรวจสอบข้อมูลโรงงาน..." | ◫ | cyan |
| alert | "พบสิ่งที่ควรตรวจสอบ" | "G-Fay พบข้อมูลที่ต้องให้ความสนใจ" | ! | red |
| recommend | "มีคำแนะนำ" | "G-Fay มีแนวทางที่น่าสนใจค่ะ" | 💡 | yellow |
| success | "เรียบร้อย" | "วิเคราะห์ข้อมูลเสร็จแล้วค่ะ" | ✓ | green |

- Render:
  - โหลด GIF แล้ว `drawImage` ลง `<canvas>` จึง**แสดงแค่เฟรมแรก (ภาพนิ่ง) โดยตั้งใจ**
  - ถ้าโหลดรูปไม่ได้จะแสดง fallback "G-Fay 🌱"
  - ฉากหลังเป็น blob gradient #f0fdf4→#e0f2fe→#fef9c3, ประกาย ✦ ✧, ambient glow ตาม state, เงาใต้ตัว
  - badge symbol มุมขวาบน (thinking/analyzing แสดงเป็น 3 จุดกระพริบ)
  - กล่อง status เป็น speech bubble มีจุด online สีเขียว #10b981
- Animation เล่นครั้งเดียวต่อ state: gfayHello, gfayAttention, gfayIdea, gfayNod รองรับ reduced-motion
- บุคลิก: พูดลงท้ายด้วย "ค่ะ" (ผู้หญิง สุภาพ)

## D. DATA MODEL (`prisma/schema.prisma`)
- Generator `prisma-client` output `../generated/prisma`, datasource **mysql** (URL ตั้งใน `prisma.config.ts` จาก `DATABASE_URL`)
- Runtime ใช้ `@prisma/adapter-mariadb` (`lib/prisma.ts`), seed ด้วย `tsx prisma/seed.ts` (มี seed-demo-factories, seed-master-data, seed-permissions, seed-role-permissions)
- มี `database/greenfactory.sql` dump และ `prisma/schema.backup.prisma`
- ทุก model ใช้ `@map` เป็น snake_case และส่วนใหญ่มี `createdAt` / `updatedAt`
- ใน list ด้านล่าง ★ = ใช้ใน code น้อยหรือไม่ได้ใช้

### Enums
- `UserStatus`: ACTIVE, INACTIVE, LOCKED
- `ResourceType` (**LEGACY**): ELECTRICITY, WATER, DI_WATER, CHILLED_WATER, COMPRESSED_AIR, NITROGEN, GAS, STEAM, DIESEL
- `RecordStatus` (**LEGACY**): PENDING, RECORDED
- field ชื่อ `status` อื่นๆ ทั้งหมดเป็น `String` (VarChar 30) ไม่ใช่ enum

### Module 02 — Organization (Company → Factory → Building → Department → ProductionLine)
- **Company** (`company`)
  - Fields: companyId PK, companyCode unique(50), companyName(200), taxId?, industryType?, address?, province?, postalCode?, country?, phone?, email?, website?, logoPath?, subscriptionPlan?, carbonStandard?, timezone?, currency?, language?, status="ACTIVE"
  - Relations: factories, users, resourceUsages, kpis, alerts, aiRecommendations, reports, equipment(legacy)
- **Factory**
  - Fields: factoryId, companyId→Company (Restrict), factoryCode (unique ร่วมกับ companyId), factoryName, address/province/postalCode/country?, latitude/longitude Decimal(10,7)?, googleMapUrl?, mapZoom?, layoutImagePath?, phone?, email?, timezone?, status
  - Relations: buildings, users, resourceUsages, kpis, alerts, aiRecs, reports
- **Building**
  - Fields: buildingId, factoryId, buildingCode (unique/factory), buildingName, buildingType?, floorCount?, layoutX/Y/Width/Height/Rotation Decimal(18,4)?, description?, status
- **Department**
  - Fields: departmentId, buildingId, departmentCode (unique/building), departmentName, description?, status
  - Relations: productionLines, users, …
- **ProductionLine** (`production_line`)
  - Fields: lineId, departmentId, lineCode (unique/dept), lineName, description?, status
  - Relations: machines, checkpoints, …

### Module 03 — Identity, Access & Governance
- **Role**
  - Fields: roleId, roleCode? unique, roleName unique (ค่าที่ใช้: PLATFORM_ADMIN, COMPANY_ADMIN, MANAGER, OPERATOR), description?, status
  - Relations: users, rolePermissions
- **Permission**
  - Fields: permissionId, permissionCode unique, permissionName, groupCode, groupName, description?, icon?, sortOrder=0, status
- **RolePermission**
  - Fields: roleId+permissionId unique (Cascade), permissionLevel="NONE"
  - ค่า permissionLevel ที่ใช้: FULL | VIEW | NONE
- **User**
  - Fields: userId, companyId? (SetNull), factoryId? (SetNull), departmentId? (SetNull, relation ชื่อ `departmentRef`), roleId (Restrict), employeeCode?, firstName, lastName, email unique, username unique, passwordHash, phone?, profileImagePath?, failedLogin(col `failed_login_count`)=0, lockedUntil?, passwordChangedAt?, passwordExpiresAt?, status UserStatus=ACTIVE, lastLogin(col `last_login_at`)?
  - **Legacy string fields**: `department?`, `productionLine?`
  - Relations: loginLogs, auditLogs, notifications, qrScanLogs, resourceRecords(legacy), recordedResourceUsages, resolvedAlerts, reviewedRecommendations, generatedReports
- **LoginLog** (`login_log`)
  - Fields: loginLogId BigInt, userId?, attemptedEmail?, loginAt, logoutAt?, ipAddress?, userAgent?, device?, loginMethod?, loginStatus, failureReason?
- **AuditLog**
  - Fields: auditLogId BigInt, userId?, tableName, recordId BigInt, action, oldData Json?, newData Json?, ipAddress?, userAgent?, createdAt
- ★ **Notification**
  - Fields: notificationId BigInt, userId, alertId?, notificationType, priority="NORMAL", title, message, actionUrl?, isRead=false, readAt?
  - **ไม่มีโค้ดใดใช้ prisma.notification**

### Module 01 — Reference Data
- **MachineType**: code unique, name, description?, status
- **SensorType**: code unique, name, description?, status
- **Unit**: unitCode unique, unitName, symbol, unitType, status
  - ค่า unitType ที่ใช้: Energy, Volume, Mass, Power, Pressure, Temperature, Time, Ratio, Count
- **ResourceCategory**: code unique, name, description?, status
- **ResourceTypeMaster** (`resource_type`): categoryId, defaultUnitId, resourceCode unique, resourceName, description?, carbonCalculable=false, status
- **EmissionFactor**: resourceTypeId, scope?, region?, source?, factor Decimal(18,6), factorUnit, effectiveDate Date, expiryDate?, status

### Module 05 — Resource & Carbon
- **ResourceUsage** (`resource_usage`)
  - Fields: usageId BigInt, usageReference unique, companyId (required), factoryId?, buildingId?, departmentId?, lineId?, machineId?, checkpointId?, resourceTypeId, unitId, sensorDataId?, qrScanId?, scopeType ("MACHINE"|"CHECKPOINT"), quantity Decimal(18,6), usageAt, sourceType ("MANUAL"|"QR"|"SENSOR"|"API"), evidenceFilePath?, remark?, recordedBy→User, processingStatus="PENDING" (→ "COMPLETED"/"FAILED"), status="ACTIVE"
  - Relations: carbonResults, alerts, aiRecommendations
- **CarbonResult**
  - Fields: carbonId BigInt, usageId, factorId, quantityUsed, factorUsed, carbonValue Decimal(18,6), carbonUnit, scope, calculationStatus="CALCULATED", calculationVersion, calculatedAt
  - ⚠️ ใน schema ไฟล์นี้อยู่ในบล็อก LEGACY แต่**ไม่ใช่ legacy** (ใช้งานจริง)

### Module 04 — Factory Assets, QR & IoT
- **Machine**
  - Fields: machineId, lineId, machineTypeId, machineCode (unique/line), machineName, manufacturer?, model?, serialNumber?, installationDate?, layoutX/Y/W/H/Rotation?, locationNote?, operationalStatus="NORMAL" (NORMAL/MAINTENANCE/…), status
  - Relations: sensors, qrCodes, …
- **Checkpoint**: checkpointId, lineId, checkpointCode (unique/line), checkpointName, checkpointType?, description?, status
- **QRCode** (`qr_code`): qrId BigInt, machineId?, checkpointId?, qrCode(500), qrToken unique, qrImagePath?, qrStatus="ACTIVE" (ACTIVE/REVOKED), generatedAt, revokedAt?
- **QRScanLog**: scanId BigInt, qrId, userId, scanResult ("SUCCESS"…), ipAddress?, userAgent?, device?, latitude/longitude?, scannedAt
- **Sensor**: sensorId, machineId, sensorTypeId, sensorCode (unique/machine), sensorName, serialNumber?, manufacturer?, protocol?, connectionAddress?, dataTopic?, samplingIntervalSeconds?, lastConnectedAt?, installationDate?, lastCalibrationDate?, nextCalibrationDate?, status
  - UI แสดง connectionStatus เป็น ONLINE/OFFLINE/FAULT/MAINTENANCE (เป็นค่าที่คำนวณขึ้นมา ไม่ใช่ column)
- ★ **SensorData**: sensorDataId BigInt, sensorId, unitId, rawValue, processedValue?, qualityStatus="VALID", measuredAt, receivedAt
  - ไม่ผ่าน Prisma client เขียนด้วย **raw SQL ผ่าน mysql2** ใน `app/api/operator/readings` และ `app/api/operator/machines/[machineId]`

### LEGACY (ใน schema เขียนว่า "ห้ามลบตอนนี้")
- ★ **Equipment** (`equipment`) → จะย้ายไป Machine
  - Fields: equipmentId, companyId, name, location, resourceType enum, isActive, equipmentCode? unique, equipmentType?, productionLine?, department?, status="NORMAL"
- ★ **ResourceRecord** (`resource_record`) → จะย้ายไป ResourceUsage
  - Fields: recordId, equipmentId, recordedById, value Float, unit, note?, attachmentUrl?, status RecordStatus=RECORDED, recordedAt
- ทั้งสองตัวใช้แค่ใน `prisma/seed.ts`
- User.department / User.productionLine เป็น legacy strings เช่นกัน

### Module 06 — Performance, AI & Reporting
- **KPI** (`kpi`)
  - Fields: kpiId, companyId, factoryId?, buildingId?, departmentId?, lineId?, machineId?, resourceTypeId?, unitId, kpiCode (unique/company), kpiName, kpiType, scopeType, targetValue Decimal, targetOperator ("<=",">=","LT","LTE","GT","GTE","EQ"), periodType (MONTHLY/QUARTERLY/YEARLY…), effectiveFrom, effectiveTo?, status
- **KPIResult**: resultId BigInt, kpiId, actualValue, varianceValue, achievementPercent, periodStart, periodEnd (unique kpi+period), resultStatus ("PASS"|"FAIL"), calculatedAt
- **Alert**
  - Fields: alertId BigInt, companyId, factoryId?…machineId?, usageId?, kpiResultId?, resolvedBy?→User, alertCode unique, alertType, severity (CRITICAL/HIGH/MEDIUM/WARNING), title, message, thresholdValue?, actualValue?, status="OPEN" (OPEN/ACKNOWLEDGED/RESOLVED), triggeredAt, acknowledgedAt?, resolvedAt?
- **AIRecommendation**
  - Fields: recommendationId BigInt, scope FKs, usageId?, kpiResultId?, alertId?, reviewedBy?, recommendationType (e.g. "ANOMALY_RESPONSE"), title, description(2000), estimatedCost/Energy/CarbonSaving?, priority Int=3, confidenceScore Decimal(5,4)?, reviewStatus="PENDING", implementationStatus="NOT_STARTED", reviewedAt?, implementedAt?, status
- **Report**: reportId BigInt, companyId, factoryId?, generatedBy, reportName, reportType ("RESOURCE_USAGE"), reportFormat ("XLSX"…), filterScope?, periodStart/End?, reportStatus="REQUESTED" (→COMPLETED/FAILED), filePath?, downloadCount, requestedAt, generatedAt?, expiresAt?
- **BackupRecord**: backupId, backupCode unique, backupType="MANUAL", backupScope="FULL" (FULL/DATABASE), storageType="LOCAL", fileName?, filePath?, fileSize BigInt?, status="RUNNING" (RUNNING/COMPLETED/FAILED), verified, startedAt, completedAt?, durationSeconds?, createdByUserId?, createdByName?, errorMessage?, restoredAt?, restoredByUserId? (ไม่มี FK relation)
- **SystemSetting** (singleton)
  - Fields: maintenanceMode, forceMfa, ipProtection, anomalyDetection, autoBlock, sessionTimeoutMinutes=60, maxLoginAttempts=5, auditRetentionDays=365, loginRetentionDays=180, backupFrequency="DAILY" (DAILY/WEEKLY/MONTHLY), carbonAnalyticsEnabled, sensorMonitoringEnabled, aiRecommendationsEnabled=false, machineQrEnabled, reportBuilderEnabled=false, updatedBy?
  - ⚠️ auth ไม่ได้อ่านค่าเหล่านี้
- **SupportTicket** (`support_tickets`): ticketId, ticketReference unique, reporterId, companyId?, subject, category, priority, description Text, pageUrl?, status="OPEN" (ไม่มี FK)
- **PasswordResetToken**: resetTokenId BigInt, userId (ไม่มี relation), tokenHash unique VarChar(64), expiresAt, usedAt?, createdAt (DateTime(3))
- **ManagerChatHistory**: id, userId, companyId (unique คู่), transcript Json, mode="general", updatedAt (ไม่มี FK)

### Status / enum string values ที่พบในโค้ด
- `status` (หลาย model): ACTIVE, INACTIVE, SUSPENDED, LOCKED, NORMAL, MAINTENANCE, OFFLINE, WARNING, OPEN, ACKNOWLEDGED, RESOLVED, PENDING, RECORDED, READY, RUNNING, COMPLETED, FAILED, SUCCESS, REVOKED, ALL (ALL ใช้เป็นค่า filter)
- loginStatus: SUCCESS | FAILED; loginMethod: PASSWORD
- failureReason (login): MISSING_CREDENTIALS, INVALID_CREDENTIALS, ACCOUNT_INACTIVE, ACCOUNT_LOCKED, UNSUPPORTED_ROLE, PLATFORM_ACCESS_CODE_NOT_CONFIGURED, INVALID_PLATFORM_CODE, INVALID_PLATFORM_ADMIN_ASSIGNMENT, INVALID_PLATFORM_ADMIN_FACTORY_ASSIGNMENT, NO_COMPANY, INVALID_COMPANY_CODE, NO_FACTORY_ASSIGNMENT, FACTORY_COMPANY_MISMATCH, INVALID_PASSWORD, PASSWORD_RETRY_LIMIT_REACHED
- processingStatus: PENDING, COMPLETED, FAILED; calculationStatus: CALCULATED; qualityStatus: VALID; resultStatus: PASS, FAIL
- severity: CRITICAL, HIGH, MEDIUM, WARNING; reviewStatus: PENDING; implementationStatus: NOT_STARTED
- sourceType: MANUAL, QR, SENSOR, API; scopeType: MACHINE, CHECKPOINT; operationalStatus: NORMAL, MAINTENANCE; connectionStatus (UI): ONLINE, OFFLINE, FAULT, MAINTENANCE
- permissionLevel: FULL, VIEW, NONE; backupType: MANUAL; backupScope: FULL, DATABASE; backupFrequency: DAILY, WEEKLY, MONTHLY
- reportType: RESOURCE_USAGE; reportFormat: XLSX; notification priority: NORMAL
- support/category filters: ACCOUNT, QR, RECORD, HISTORY, ALL และ resource categories ELECTRICITY, WATER, STEAM, DIESEL, WASTE
- form mode: CREATE, EDIT; AI assistant mode: FAST_PATH, LOCAL_FALLBACK, "general"

### Environment variables (`process.env`)
| Var | ใช้ที่ | ทำอะไร |
|---|---|---|
| DATABASE_URL | lib/prisma.ts, prisma.config.ts, lib/backup.ts | MySQL connection (mysql://) ใช้กับ Prisma/MariaDB adapter และ parse ไปใช้กับ mysqldump |
| DB_HOST / DB_USER / DB_PASSWORD / DB_NAME | app/api/operator/readings, operator/machines/[machineId] | การเชื่อมต่อ mysql2 แบบ raw แยกต่างหาก (default 127.0.0.1/root/""/greenfactory) |
| SESSION_SECRET | lib/session.ts | HS256 JWT secret (ถ้าไม่ตั้งจะ throw) |
| PLATFORM_ACCESS_CODE | api/auth/login | "รหัสองค์กร" สำหรับ PLATFORM_ADMIN |
| RESEND_API_KEY | api/auth/forgot-password | ส่งเมล reset ผ่าน Resend |
| PASSWORD_RESET_FROM | api/auth/forgot-password | ผู้ส่ง (default `GreenFactory Insight <onboarding@resend.dev>`) |
| NEXT_PUBLIC_APP_URL | forgot-password, company/qr-codes/QRCodePageClient | base URL สำหรับลิงก์ reset และลิงก์ใน QR |
| NODE_ENV | session cookie `secure`, prisma, devResetUrl | — |
| GEMINI_API_KEY / GEMINI_MODEL | app/api/manager/assistant | AI chat ของ G-Fay (default model "gemini-3.8-flash") |
| OPENAI_API_KEY / OPENAI_MODEL | lib/ai-analysis.ts | AI analysis (default "gpt-5-mini") |
| MYSQLDUMP_PATH / MYSQL_PATH | lib/backup.ts | path ของ binary (default เป็น path Windows ของ Laragon) |
| BACKUP_DIR | lib/backup.ts | ที่เก็บไฟล์ backup (default `storage/backups`) |

### ข้อควรระวังสำหรับการ rewrite
- ลิงก์ที่เสีย: `/features#production|#resources|#analytics`, `/news/*`, `/privacy`, `/terms`, `/manager/dashboard`
- ฟอร์มติดต่อยังไม่มี backend, หน้า pricing/register ยังว่าง
- การ query DB มีสองทาง (Prisma และ mysql2 raw) และใช้ env สองชุด
- bcrypt cost ไม่เท่ากัน (10 กับ 12)
- session ไม่ถูกตรวจซ้ำกับ DB, ค่าใน SystemSetting ไม่ได้ถูกใช้
- `public/images/nong-at-ai-profile.png` เป็นรูปบุคคลจริงที่ไม่มีโค้ดใดอ้างถึง ควรตัดทิ้งจาก asset ของระบบใหม่
