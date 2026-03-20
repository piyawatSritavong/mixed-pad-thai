---
name: FoodStore Food Delivery App
description: Thai food delivery app (ผัดไฟ series) – full refactor done in March 2026
type: project
---

Full food-delivery UI refactor completed 2026-03-20.

**Why:** User requested complete UI/UX overhaul to match food delivery app design (like the image shown), with Thai ผัดไฟ menu, member discount promotions, red-set hourly restriction, and responsive design.

**How to apply:** When working on this project, the app is a Next.js 15 + PostgreSQL app. All products are in Thai. Pair discounts (5%) apply only to members (ผัดไฟส้ม/ชมพู/เขียว). No extra 10% member discount — only pair discounts. ผัดไฟแดง is restricted to 1 per hour (API enforced).

Key architecture:
- `/api/products` – GET products from DB
- `/api/calculate` – POST calculation (enforces red set hourly restriction, persists order)
- `src/lib/calculator.ts` – pure calculation logic, unit-tested (16 tests)
- Theme: main #9E080F, accent #F7B90B, bg #F5F0EB
- Components: Header, PromoBanner, MenuCard, ProductModal, CartPanel, CartItemRow, OrderResult, AlertModal, BottomNav
- Food image: must place food.jpg in public/ folder
