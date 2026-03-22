# ผัดไทยไฟรวม — Restaurant POS System

ระบบสั่งอาหารและบริหารร้านอาหารครบวงจร รองรับทั้งหน้าจอลูกค้า (Customer Frontend) และระบบหลังบ้านสำหรับพนักงาน (Admin Backend)

---

## ภาพรวมระบบ

```
domain/          → หน้าเลือกโต๊ะ (แสดงสถานะโต๊ะทุกโต๊ะ พร้อม ads banner)
domain/[tableId] → หน้าสั่งอาหารของแต่ละโต๊ะ เช่น /1, /2, /3
domain/admin     → ระบบหลังบ้านสำหรับพนักงาน (ต้อง login)
```

---

## ระบบหน้าบ้าน (Customer Frontend)

### หน้าเลือกโต๊ะ `domain/`
- แสดง grid โต๊ะทุกโต๊ะพร้อมสถานะปัจจุบัน
  - 🟢 **ว่าง** — โต๊ะพร้อมใช้งาน
  - 🟡 **มีลูกค้า** — โต๊ะที่มีลูกค้าใช้งานอยู่
  - 🔴 **เช็คบิล** — ลูกค้าขอเช็คบิลแล้ว
  - 🟠 **เรียกพนักงาน** — ลูกค้าต้องการความช่วยเหลือ
- แสดง Ads Banner 2 ฝั่ง (ซ้าย/ขวา) จัดการได้จากระบบหลังบ้าน
- กดที่โต๊ะ → redirect ไปหน้าสั่งอาหารของโต๊ะนั้น

### หน้าสั่งอาหาร `domain/[tableId]`
- โต๊ะที่ไม่มีในระบบจะแสดง 404 พร้อมปุ่มเรียกพนักงาน
- เมนูอาหารโหลดจาก API

**Navigation tabs:**
| Tab | รายละเอียด |
|-----|-----------|
| หน้าหลัก | แสดงเมนูทั้งหมด กด + เพิ่มลงตะกร้า |
| รายการโปรด | เมนูที่ถูกใจ (บันทึกใน localStorage) |
| ตะกร้า | รายการสั่ง + กดยืนยันออเดอร์ |
| ออเดอร์ | ประวัติออเดอร์ในเซสชันปัจจุบัน |
| โปรไฟล์ | ใส่บัตรสมาชิก / เรียกพนักงาน / เช็คบิล |

**การทำงาน:**
- ลูกค้ากด **ยืนยันออเดอร์** → POST `/api/calculate` บันทึกออเดอร์ + อัปเดตสถานะโต๊ะเป็น `occupied`
- ลูกค้ากด **เรียกพนักงาน** → อัปเดตสถานะโต๊ะเป็น `staff_called`
- ลูกค้ากด **เช็คบิล** → อัปเดตสถานะโต๊ะเป็น `bill_requested`
- เมื่อพนักงาน **ปริ้นใบเสร็จ** จากหลังบ้าน → สถานะโต๊ะ reset เป็น `vacant` และประวัติออเดอร์ลูกค้าถูกล้างอัตโนมัติเมื่อเปิดหน้าครั้งถัดไป

**ข้อจำกัดพิเศษ:**
- **ผัดไทยไฟแดง** สั่งได้ 1 ที่ / ลูกค้า 1 ท่าน / 1 ชั่วโมง
- โปรโมชั่นคู่ (5%/คู่) สำหรับสมาชิกที่สั่งเมนูที่ร่วมรายการ ≥ 2 ชิ้น

---

## ระบบหลังบ้าน (Admin Backend) `domain/admin`

ต้อง login ด้วย username/password — ป้องกันด้วย session cookie (httpOnly) และ Next.js middleware

### Login `domain/admin/login`
- กรอก username + password → สร้าง session → redirect ไป dashboard
- Default: `admin` / `admin`

---

### Dashboard `domain/admin/dashboard`
- **Floor Plan** แสดงโต๊ะทุกโต๊ะพร้อมสถานะแบบ realtime (auto-refresh ทุก 5 วินาที)
- เก้าอี้สีตามความจุโต๊ะ (sky / amber / orange / rose)
- ขอบโต๊ะกระพริบเมื่อมีแจ้งเตือน
- **ปุ่มบนการ์ดโต๊ะ:**
  | สถานะ | ปุ่มที่แสดง |
  |--------|------------|
  | occupied (มีออเดอร์) | เช็คบิล |
  | bill_requested | ปริ้นใบเสร็จ (→ reset vacant) |
  | staff_called | รับทราบ (→ occupied) |
- Right panel แสดงรายการโต๊ะที่ active พร้อมปุ่มจัดการ
- Filter: ทั้งหมด / มีลูกค้า / แจ้งเตือน

---

### Summary (Report) `domain/admin/summary`
- **สถิติวันนี้:** ออเดอร์ / ยอดรวม / ส่วนลด / สุทธิ
- **กราฟรายได้ 7 วัน** (bar chart)
- **เมนูขายดี Top 5**
- **สต็อกใกล้หมด** (ตารางแสดงรายการที่ต่ำกว่า minimum)

---

### Inventory `domain/admin/inventory`
- ตารางสต็อกวัตถุดิบ: ชื่อ / หน่วย / คงเหลือ / ขั้นต่ำ / ราคา/หน่วย / มูลค่าคงเหลือ / สถานะ
- สรุปยอดรวมที่ footer ตาราง
- เพิ่ม / แก้ไข / ลบรายการผ่าน Modal
- ค้นหารายการ
- แสดง badge **ใกล้หมด** เมื่อสต็อกต่ำกว่าขั้นต่ำ

---

### Orders `domain/admin/orders`
- รายการออเดอร์ทั้งหมดแบบ accordion (กดขยายดูรายละเอียด)
- Filter ตามวันที่ (from/to) และโต๊ะ
- สรุปยอดรวม / ส่วนลด / สุทธิ

---

### Members `domain/admin/members`
- จัดการบัญชีพนักงานและสมาชิก
- เพิ่ม / แก้ไข / ลบสมาชิก
- กำหนด role (admin / staff) และ permissions
- เปลี่ยนรหัสผ่านได้ (เว้นว่างไม่เปลี่ยน)

---

### Tables `domain/admin/tables`
- จัดการโต๊ะในร้าน (เพิ่ม / แก้ไข / เปิด-ปิดใช้งาน)
- กำหนด: หมายเลขโต๊ะ / ความจุ / สถานะ / หมายเหตุ
- โต๊ะที่ inactive จะไม่แสดงในหน้าลูกค้า

---

### Settings `domain/admin/settings`
- **ข้อมูลร้าน:** ชื่อร้าน / ที่อยู่
- **ใบเสร็จ:** ข้อความท้ายใบเสร็จ
- **ธีมสีของระบบ:** Primary / Accent / URL โลโก้ + Preview card
- **แบนเนอร์โฆษณา:** อัปโหลด / เปลี่ยน Ads Banner ซ้าย-ขวา (จัดเก็บใน Supabase Storage)

---

## Tech Stack

### Frontend
- [Next.js 15](https://nextjs.org/) — App Router, Server & Client Components
- [TypeScript](https://www.typescriptlang.org/) — strict mode, path alias `@/*`
- [Tailwind CSS v3](https://tailwindcss.com/) — theme colors `#7A060B` / `#F7B90B` / `#F5F0EB`

### Backend
- **Next.js API Routes** — REST endpoints (serverless)
- **Node.js crypto** — password hashing ด้วย `scryptSync` + `timingSafeEqual` (ไม่ต้องใช้ bcrypt)
- **Next.js Middleware** — ป้องกัน `/admin/*` และ `/api/admin/*` ด้วย session cookie

### Database & Storage
- [Supabase](https://supabase.com/) (PostgreSQL 15) — cloud database
- **Supabase Storage** — เก็บไฟล์รูปภาพ Ads Banner
- เชื่อมต่อผ่าน Supabase Connection Pooler (`aws-1-ap-southeast-1.pooler.supabase.com:5432`)

### Testing
- [Jest](https://jestjs.io/) + [ts-jest](https://kulshekhar.github.io/ts-jest/) — unit test business logic การคำนวณ

---

## Database Schema

```sql
-- สินค้า
products (id, name, price, color, discountable, created_at)

-- ออเดอร์
orders (id, table_number, member_card_number, total_before_discount,
        pair_discount_total, member_card_discount, final_total, status, created_at)
order_items (id, order_id, product_id, quantity, unit_price, created_at)

-- โต๊ะ
restaurant_tables (id, table_number, capacity, status, is_active, note, updated_at, created_at)
-- status: vacant | occupied | bill_requested | staff_called

-- Admin
admin_users (id, username, password_hash, password_salt, full_name, role, permissions, created_at)
admin_sessions (id, user_id, expires_at, created_at)

-- สต็อก
inventory (id, name, unit, quantity, min_quantity, cost_per_unit, updated_at, created_at)

-- ตั้งค่า
settings (key, value, updated_at)
```

---

## การรันโปรเจกต์

### ต้องการ
- [Node.js 18+](https://nodejs.org/)
- Supabase project + ไฟล์ `.env.local`

### ตั้งค่าครั้งแรก

**1. สร้าง `.env.local`**
```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**2. สร้างตารางและ seed ข้อมูล**
```bash
node scripts/seed.mjs
```

สคริปต์นี้จะ:
- สร้างตารางทั้งหมดจาก `db/init.sql`
- สร้าง Supabase Storage bucket `banners`
- เพิ่มสินค้า 7 รายการ + Admin user เริ่มต้น (`admin` / `admin`)

### รัน Local Development
```bash
npm install
npm run dev
# → http://localhost:3000
```

### รัน Unit Test
```bash
npm test
```

### Deploy บน Vercel
1. Push โค้ดขึ้น GitHub
2. เชื่อมต่อ repo กับ Vercel
3. ตั้ง Environment Variables ใน Vercel Dashboard (3 ตัวเดียวกับ `.env.local`)
4. Deploy

---

## API Endpoints

### Public
| Method | Endpoint | รายละเอียด |
|--------|----------|-----------|
| GET | `/api/products` | ดึงเมนูทั้งหมด |
| POST | `/api/calculate` | คำนวณและบันทึกออเดอร์ |
| GET | `/api/tables` | ดึงโต๊ะทั้งหมดพร้อมสถานะ |
| POST | `/api/tables/[tableId]/call` | เรียกพนักงาน |
| POST | `/api/tables/[tableId]/bill` | ขอเช็คบิล |

### Admin (ต้อง login)
| Method | Endpoint | รายละเอียด |
|--------|----------|-----------|
| POST | `/api/admin/auth/login` | เข้าสู่ระบบ |
| POST | `/api/admin/auth/logout` | ออกจากระบบ |
| GET | `/api/admin/auth/me` | ข้อมูล session ปัจจุบัน |
| GET/POST | `/api/admin/tables` | ดึง/สร้างโต๊ะ |
| PUT/DELETE/PATCH | `/api/admin/tables/[id]` | แก้ไข/ลบ/เปลี่ยนสถานะโต๊ะ |
| GET | `/api/admin/dashboard` | ข้อมูล floor plan พร้อมออเดอร์ active |
| GET | `/api/admin/orders` | ประวัติออเดอร์ (filter by date/table) |
| GET | `/api/admin/summary` | สรุปรายวัน / กราฟ 7 วัน / top items |
| GET/POST | `/api/admin/inventory` | ดึง/เพิ่มสต็อก |
| PUT/DELETE | `/api/admin/inventory/[id]` | แก้ไข/ลบสต็อก |
| GET/POST | `/api/admin/members` | จัดการสมาชิก |
| PUT/DELETE | `/api/admin/members/[id]` | แก้ไข/ลบสมาชิก |
| GET/PUT | `/api/admin/settings` | ดึง/บันทึกตั้งค่า |
| POST | `/api/admin/banners/[slot]` | อัปโหลด Ads Banner (slot: 1 หรือ 2) |
| POST | `/api/admin/reset` | รีเซ็ตออเดอร์และสถานะโต๊ะทั้งหมด |

---

## คำสั่งล้างข้อมูล (Reset)

ผ่านหน้า Admin: กดปุ่ม avatar (icon user) ที่ sidebar → จะมี confirm dialog ก่อน reset

หรือ SQL โดยตรง:
```sql
TRUNCATE TABLE order_items, orders RESTART IDENTITY;
UPDATE restaurant_tables SET status = 'vacant';
```
