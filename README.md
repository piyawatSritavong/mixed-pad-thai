# ผัดไทยไฟรวม

แอปพลิเคชันสั่งอาหารสำหรับร้านผัดไทยไฟรวม ใช้งานบนโต๊ะในร้านอาหาร รองรับทั้ง Mobile และ Desktop

---

## รายการอาหาร

| เมนู | ราคา | สีธีม |
|------|------|-------|
| ผัดไทยไฟแดง | 50 บาท | แดง |
| ผัดไทยไฟเขียว | 40 บาท | เขียว |
| ผัดไทยไฟน้ำเงิน | 30 บาท | น้ำเงิน |
| ผัดไทยไฟเหลือง | 50 บาท | เหลือง |
| ผัดไทยไฟชมพู | 80 บาท | ชมพู |
| ผัดไทยไฟม่วง | 90 บาท | ม่วง |
| ผัดไทยไฟส้ม | 120 บาท | ส้ม |

---

## โปรโมชั่น (สำหรับสมาชิกเท่านั้น)

หากในออเดอร์มี **ผัดไทยไฟส้ม**, **ผัดไทยไฟชมพู** หรือ **ผัดไทยไฟเขียว** ตั้งแต่ 2 รายการขึ้นไป จะได้รับส่วนลด **5% ต่อคู่**

### ตัวอย่างการคำนวณ

```
ผัดไทยไฟส้ม  ×2  →  (120 + 120) − 5%  =  228 บาท
ผัดไทยไฟชมพู ×4  →  (80 + 80) − 5%  +  (80 + 80) − 5%  =  304 บาท
ผัดไทยไฟเขียว ×3  →  (40 + 40) − 5%  +  40  =  116 บาท
```

> โปรโมชั่นนี้ใช้ได้เฉพาะลูกค้าที่กรอกรหัสบัตรสมาชิกเท่านั้น

---

## ข้อจำกัดพิเศษ

1. **ผัดไทยไฟแดง** – ลูกค้าสามารถสั่งได้ **1 ที่ ต่อ 1 ท่าน ภายใน 1 ชั่วโมง**
   หากพยายามสั่งเกินจำนวนในช่วงเวลาดังกล่าว ระบบจะแสดง Alert Modal แจ้งเตือนและไม่บันทึกออเดอร์
2. รายการสินค้าทั้งหมดต้องโหลดจาก **API**
3. การคำนวณราคาและส่วนลดทั้งหมดต้องผ่าน **API**
4. มี **Unit Test** ครอบคลุม business logic หลัก

---

## Tech Stack

### Frontend
- [Next.js 15](https://nextjs.org/) – App Router, Server Components, `"use client"`
- [TypeScript](https://www.typescriptlang.org/) – strict mode
- [Tailwind CSS v3](https://tailwindcss.com/) – utility-first styling, custom theme colors

### Backend
- **Next.js API Routes** – REST endpoints ภายใน Next.js app เดียวกัน (serverless-style handlers)
- **Node.js** – runtime ผ่าน Next.js

### Database
- [Supabase](https://supabase.com/) (PostgreSQL 15) – cloud database, เก็บข้อมูลสินค้า, ออเดอร์, และ order items
- เชื่อมต่อผ่าน Supabase Connection Pooler (Supavisor) ที่ `aws-1-ap-southeast-1.pooler.supabase.com:5432`

### Testing
- [Jest](https://jestjs.io/) + [ts-jest](https://kulshekhar.github.io/ts-jest/) – unit test สำหรับ business logic การคำนวณ

---

## API Documentation

Base URL: `http://localhost:3000`

---

### `GET /api/products`

ดึงรายการสินค้าทั้งหมดจากฐานข้อมูล

**Response** `200 OK`
```json
[
  {
    "id": 1,
    "name": "ผัดไทยไฟแดง",
    "price": 50,
    "color": "red",
    "discountable": false
  },
  {
    "id": 2,
    "name": "ผัดไทยไฟเขียว",
    "price": 40,
    "color": "green",
    "discountable": true
  }
]
```

**Response** `500 Internal Server Error`
```json
{ "error": "Failed to fetch products" }
```

---

### `POST /api/calculate`

คำนวณยอดรวม ส่วนลด และบันทึกออเดอร์ลงฐานข้อมูล

**Request Body**
```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 7, "quantity": 2 }
  ],
  "memberCardNumber": "MEMBER001"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | `OrderItem[]` | ✅ | รายการสินค้าและจำนวน |
| `items[].productId` | `number` | ✅ | ID ของสินค้า |
| `items[].quantity` | `number` | ✅ | จำนวน (≥ 0) |
| `memberCardNumber` | `string` | ❌ | รหัสบัตรสมาชิก (ถ้ามีจะได้รับส่วนลดคู่) |

**Response** `200 OK`
```json
{
  "totalBeforeDiscount": 290,
  "discountedItems": [
    { "name": "ผัดไทยไฟส้ม", "discount": -12 }
  ],
  "memberCardDiscount": 0,
  "finalTotal": 278
}
```

| Field | Description |
|-------|-------------|
| `totalBeforeDiscount` | ราคารวมก่อนหักส่วนลด |
| `discountedItems` | รายการที่ได้รับส่วนลดคู่ (discount เป็นค่าลบ) |
| `memberCardDiscount` | ส่วนลดบัตรสมาชิก (ปัจจุบัน = 0) |
| `finalTotal` | ยอดสุทธิหลังหักส่วนลดทั้งหมด |

**Response** `409 Conflict` – ผัดไทยไฟแดงเกินโควต้า
```json
{
  "error": "ผัดไทยไฟแดง สามารถสั่งได้เพียง 1 ที่ต่อลูกค้า 1 ท่านภายใน 1 ชั่วโมง กรุณาลองใหม่ภายหลัง"
}
```

**Response** `400 Bad Request` – ข้อมูลไม่ถูกต้อง
```json
{ "error": "items must be a non-empty array" }
```

**Response** `500 Internal Server Error`
```json
{ "error": "Failed to calculate order" }
```

---

## การรันโปรเจกต์

### ต้องการ
- [Node.js 18+](https://nodejs.org/)
- ไฟล์ `.env.local` ที่มี `DATABASE_URL` ชี้ไป Supabase (ดู `.env.example`)

### ตั้งค่าครั้งแรก

**1. สร้างตารางใน Supabase**

ไปที่ Supabase Dashboard → **SQL Editor** → วาง SQL จากไฟล์ `db/init.sql` แล้วกด Run

**2. สร้างไฟล์ `.env.local`**

```bash
cp .env.example .env.local
# แก้ไข .env.local ใส่ password จริง
```

### รัน Local Development

```bash
npm install
npm run dev
```

แอปจะรันที่ `http://localhost:3000`

### รันด้วย Docker

```bash
# Build และ Start
docker-compose up -d --build

# Build ใหม่หลังแก้ไข code
docker-compose up -d --build

# หยุด
docker-compose down
```

### รัน Unit Test

```bash
npm test
```

---

## Database Schema

```sql
products (id, name, price, color, discountable, created_at)
orders   (id, member_card_number, total_before_discount, pair_discount_total,
          member_card_discount, final_total, created_at)
order_items (id, order_id, product_id, quantity, unit_price, created_at)
```

ออเดอร์และ order items จะถูกบันทึกทุกครั้งที่ `/api/calculate` สำเร็จ เพื่อใช้ตรวจสอบโควต้า ผัดไทยไฟแดง (rate-limit 1 ที่/ชั่วโมง)
