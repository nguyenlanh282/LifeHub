# 🌟 LifeHub — Hệ Thống Quản Lý Sinh Hoạt, Chi Tiêu, Công Việc & Bảo Trì Xe/Gia Dụng

> **Fullstack Cloudflare Monorepo**: Vite React PWA + Cloudflare Workers Serverless API + Cloudflare D1 SQLite Database + Drizzle ORM.

[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-Live-orange?logo=cloudflare)](https://lifehub-b48.pages.dev)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-API-blue?logo=cloudflare)](https://lifehub-api.it-nguyenlanh.workers.dev/api/health)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple?logo=pwa)](https://lifehub-b48.pages.dev)

---

## 🌐 Live URLs

- **📱 Frontend Web & PWA App**: [https://lifehub-b48.pages.dev](https://lifehub-b48.pages.dev)
- **⚡ Backend Worker API**: [https://lifehub-api.it-nguyenlanh.workers.dev](https://lifehub-api.it-nguyenlanh.workers.dev)
- **🩺 API Health Status**: [https://lifehub-api.it-nguyenlanh.workers.dev/api/health](https://lifehub-api.it-nguyenlanh.workers.dev/api/health)

---

## ⚡ Các Tính Năng Nổi Bật (Features)

1. **Thu Chi & Sổ Ví Ledger**:
   - Quản lý nhiều ví (Tiền mặt, Ngân hàng, Ví điện tử).
   - Biểu đồ vòng ngân sách SVG (SVG Budget Ring Chart).
   - Chọn nhanh danh mục chi tiêu với Icon trực quan.
   - Ghi khoản chi siêu tốc (+ Touch FAB modal).

2. **Công Việc Định Kỳ & Lịch Tái Diễn (RRULE)**:
   - Hỗ trợ chuẩn tái diễn RRULE (`FREQ=MONTHLY;BYMONTHDAY=25`, `FREQ=WEEKLY`).
   - Phân loại trạng thái (Cần làm, Quá hạn, Đã xong).

3. **Bảo Trì Thiết Bị & Lịch Thay Nhớt Xe**:
   - Quản lý bảo hành, vị trí thiết bị.
   - Lịch nhắc nhở định kỳ thay nhớt xe máy, thay lõi lọc nước.

4. **Đăng Nhập Mạng Xã Hội (Social OAuth)**:
   - Tích hợp **Google OAuth2** & **Facebook OAuth**.
   - Tự động tạo và đồng bộ CSDL D1 cho người dùng mới.

5. **PWA Installability & Cross-Platform**:
   - Tự động nhận diện PWA Standalone App.
   - Hộp thoại hướng dẫn cài đặt 1-chạm chuẩn trên iOS Safari và Android Chrome.

---

## 🏗 Kiến Trúc Dự Án (Monorepo Architecture)

```
LifeHub/
├── apps/
│   ├── api/             # Cloudflare Worker API (Hono + Drizzle ORM + D1)
│   └── web/             # Vite + React + Tailwind CSS + PWA Service Worker
├── packages/
│   ├── db/              # Drizzle ORM Schemas (44 SQLite Tables & Migrations)
│   └── shared/          # Shared DTOs, Enums, TypeScript Interfaces
├── PRD-LifeHub.md       # Product Requirements Document (PRD)
├── 01-MVP-Scope-Matrix.md
├── 02-Permission-Matrix.md
├── 03-Hard-Flows-Spec.md
└── 04-Data-Model-and-User-Stories.md
```

---

## 🚀 Hướng Dẫn Khởi Chạy Local (Local Development)

```bash
# 1. Chạy API Worker Server
cd apps/api
npm run dev

# 2. Chạy Frontend Web Dev Server
cd apps/web
npm run dev

# 3. Build & Preview PWA Local
cd apps/web
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

---

## ☁️ Deploy Lên Cloudflare

```bash
# 1. Deploy Remote D1 Migration
cd apps/api
npx wrangler d1 execute lifehub_db --remote --file=../../packages/db/migrations/0000_initial.sql

# 2. Deploy Worker API
npx wrangler deploy

# 3. Deploy Frontend PWA
cd apps/web
npm run build
npx wrangler pages deploy dist --project-name=lifehub
```

---

## 📝 License
Distributed under the MIT License. Developed for **LifeHub Gia Đình Lành**.
