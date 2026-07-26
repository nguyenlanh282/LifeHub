# PRD — LifeHub

**Ứng dụng quản lý sinh hoạt, chi tiêu, công việc & thiết bị (cá nhân + nhóm nhỏ)**

| | |
|---|---|
| **Tên sản phẩm (tạm)** | LifeHub |
| **Phiên bản tài liệu** | v1.0 |
| **Ngày** | 26/07/2026 |
| **Chủ sở hữu** | Lành Guru |
| **Đối tượng đọc** | Lập trình viên / team dev (tài liệu kỹ thuật để bắt tay xây dựng) |
| **Nền tảng** | **Web (responsive) + PWA** cài được lên điện thoại & máy tính — chung 1 backend |
| **Hạ tầng** | **Cloudflare** (Workers, Pages, D1, R2, Durable Objects, Queues, KV, Cron) |
| **Thông báo** | Đa kênh: **SMS, Email, Telegram, Zalo** + Web Push |
| **Trạng thái** | Draft đã bổ sung đặc tả — hướng tới Ready-for-Development |

### Tài liệu đặc tả kèm theo (đọc cùng PRD)
PRD này là bản tổng quan. Bốn tài liệu sau khóa chi tiết để dev triển khai độc lập và **có thẩm quyền cao hơn PRD khi có khác biệt**:

1. **01-MVP-Scope-Matrix.md** — chốt In/Out từng feature, gỡ mâu thuẫn P0/P1/P2, ma trận hỗ trợ PWA.
2. **02-Permission-Matrix.md** — RBAC role×module×action, trả lời mọi câu hỏi phân quyền.
3. **03-Hard-Flows-Spec.md** — đặc tả 3 luồng khó: Recurrence/RRULE, Offline sync, Reminder delivery.
4. **04-Data-Model-and-User-Stories.md** — schema chi tiết (kiểu/constraint/index/cascade) + user stories & acceptance criteria P0.

---

## 1. Tóm tắt & Tầm nhìn

### 1.1. Vấn đề
Người dùng hiện phải dùng nhiều app rời rạc: một app ghi chi tiêu, một app to-do, một file Excel liệt kê thiết bị/dụng cụ, và trí nhớ để theo dõi việc lặp lại (đóng tiền điện, bảo trì xe, thay lõi lọc nước…). Dữ liệu phân mảnh, không nhắc nhở đúng lúc, không dùng chung được giữa các thành viên gia đình hoặc nhóm nhỏ.

### 1.2. Giải pháp
LifeHub là một ứng dụng **đa nền tảng (điện thoại + máy tính, đồng bộ real-time)** gộp 4 trụ cột vào một nơi:

1. **Sinh hoạt hằng ngày** — thói quen, lịch sinh hoạt, ghi chú.
2. **Chi tiêu** — thu/chi, ngân sách, báo cáo.
3. **Công việc** — việc một lần & việc lặp lại (định kỳ), nhắc nhở, checklist.
4. **Công cụ / thiết bị** — danh mục tài sản, bảo trì, mượn–trả, hạn dùng/bảo hành.

Một điểm khác biệt cốt lõi: **4 module liên kết với nhau** — ví dụ một thiết bị đến hạn bảo trì tự sinh ra một công việc lặp lại, và chi phí bảo trì tự ghi vào module chi tiêu.

### 1.3. Mục tiêu (Goals)
- Giảm số app phải dùng từ 3–4 xuống còn 1.
- Không bỏ lỡ việc định kỳ quan trọng (nhắc đúng lúc, đa kênh).
- Dùng được cả cá nhân và mở rộng cho nhóm/gia đình/công ty nhỏ với phân quyền.
- Đồng bộ liền mạch giữa điện thoại và máy tính, hoạt động cả khi offline.

### 1.4. Không thuộc phạm vi (Non-goals) — v1
- Không phải phần mềm kế toán doanh nghiệp đầy đủ (không hóa đơn VAT, không sổ cái kép).
- Không phải hệ thống ERP/quản lý kho bán hàng.
- Tích hợp ngân hàng/ví điện tử VN có trong lộ trình (Giai đoạn 3), không thuộc MVP — MVP nhập tay + import file.
- Không có mạng xã hội / chat nội bộ.
- Không phát hành app native (iOS/Android store) — dùng **PWA** cài trực tiếp từ trình duyệt.

---

## 2. Người dùng mục tiêu (Personas)

Ứng dụng phục vụ **cả hai** nhóm: cá nhân/gia đình và nhóm nhỏ/doanh nghiệp. Kiến trúc dữ liệu phải hỗ trợ khái niệm **"Không gian làm việc" (Workspace)** dùng chung ngay từ đầu.

### Persona A — Cá nhân / Chủ hộ gia đình
- Muốn kiểm soát chi tiêu tháng, nhắc đóng hóa đơn định kỳ, theo dõi việc nhà.
- Quản lý đồ đạc trong nhà: bảo hành TV, thay dầu xe, hạn dùng bình chữa cháy.
- Chia sẻ với vợ/chồng, con cái ở mức xem hoặc cùng cập nhật.

### Persona B — Quản lý nhóm nhỏ / cửa hàng / xưởng
- Quản lý công cụ, thiết bị của team: ai đang mượn máy khoan, máy nào đang sửa.
- Giao việc lặp lại cho nhân viên (vệ sinh máy mỗi tuần, kiểm kho mỗi tháng).
- Theo dõi chi phí vận hành chung, phân quyền để nhân viên chỉ thấy phần của mình.

### Bảng vai trò & phân quyền (RBAC)

| Vai trò | Quyền |
|---|---|
| **Owner** | Toàn quyền, quản lý thành viên & thanh toán, xóa workspace |
| **Admin** | Quản lý dữ liệu tất cả module, mời/xóa thành viên (trừ Owner) |
| **Member** | Tạo/sửa dữ liệu được giao, xem theo phạm vi được cấp |
| **Viewer** | Chỉ xem, không sửa |

---

## 3. Nguyên tắc thiết kế & trải nghiệm

- **Mobile-first, desktop-power.** Điện thoại để nhập nhanh & nhận nhắc; máy tính để xem báo cáo, nhập liệu hàng loạt.
- **Nhập liệu tối thiểu.** Ghi một khoản chi ≤ 3 chạm. Quick-add nổi ở mọi màn hình.
- **Offline-first.** Ghi được khi mất mạng, tự đồng bộ khi có mạng lại (xử lý xung đột theo "last-write-wins" + log thay đổi).
- **Một nguồn sự thật.** Mọi thiết bị thấy cùng dữ liệu real-time.
- **Tiếng Việt là ngôn ngữ chính**, kiến trúc i18n sẵn sàng cho đa ngôn ngữ.
- **Tiền tệ:** MVP dùng **VND thống nhất** cho toàn workspace. *Tầng dữ liệu* lưu số tiền kèm `currency` + minor-unit sẵn sàng đa tiền tệ, nhưng *tính năng* nhiều ví khác tiền tệ + quy đổi báo cáo là **P2** (xem 01-MVP-Scope-Matrix, quyết định M3).

---

## 4. Yêu cầu chức năng theo Module

Ký hiệu ưu tiên: **P0** = bắt buộc cho MVP, **P1** = bản kế tiếp, **P2** = tương lai.

### 4.1. Module SINH HOẠT (Daily Life)

| ID | Tính năng | Mô tả | Ưu tiên |
|---|---|---|---|
| DL-1 | Thói quen (Habits) | Tạo thói quen theo tần suất (ngày/tuần), tick hoàn thành, streak | P0 |
| DL-2 | Lịch sinh hoạt | Xem ngày/tuần, gom việc + habit + hóa đơn đến hạn vào 1 lịch | P0 |
| DL-3 | Ghi chú nhanh | Note tự do, đính kèm ảnh, gắn nhãn | P0 |
| DL-4 | Nhật ký / mood | Ghi cảm xúc, ghi chú cuối ngày | P2 |
| DL-5 | Dashboard tổng quan | Widget tóm tắt: chi tiêu hôm nay, việc cần làm, thiết bị sắp đến hạn | P0 |

### 4.2. Module CHI TIÊU (Finance)

| ID | Tính năng | Mô tả | Ưu tiên |
|---|---|---|---|
| FN-1 | Ghi giao dịch | Thu / Chi / Chuyển khoản; số tiền, danh mục, ví, ngày, ghi chú, ảnh hóa đơn | P0 |
| FN-2 | Danh mục (Categories) | Cây danh mục 2 cấp, icon, màu; mặc định VN (ăn uống, đi lại, hóa đơn…) | P0 |
| FN-3 | Ví / Tài khoản | Nhiều ví (tiền mặt, ngân hàng, ví điện tử), theo dõi số dư | P0 |
| FN-4 | Ngân sách (Budget) | Đặt hạn mức theo danh mục/tháng, cảnh báo khi vượt % | P0 |
| FN-5 | Giao dịch định kỳ | Tự sinh giao dịch lặp lại (lương, tiền nhà, subscription) | **P0** (Reminder Engine phụ thuộc — xem 01-MVP-Scope-Matrix) |
| FN-6 | Báo cáo & biểu đồ | Theo thời gian, danh mục, ví; pie/line/bar; xuất PDF/Excel | P0 |
| FN-7 | Import/Export | Nhập từ CSV/Excel, xuất dữ liệu | P1 |
| FN-8 | Đa tiền tệ | Tỷ giá, quy đổi báo cáo | P2 |
| FN-9 | Chia hóa đơn | Chia chi phí chung giữa thành viên | P2 |

### 4.3. Module CÔNG VIỆC (Tasks)

Đây là module trung tâm về "việc lặp lại & việc một lần" — cần mạnh về **recurrence**.

| ID | Tính năng | Mô tả | Ưu tiên |
|---|---|---|---|
| TK-1 | Việc một lần | Tiêu đề, mô tả, hạn (deadline), độ ưu tiên, nhãn, người phụ trách | P0 |
| TK-2 | Việc lặp lại | Quy tắc lặp linh hoạt (hằng ngày / tuần / tháng / năm / mỗi N ngày / thứ mấy trong tuần / ngày mấy trong tháng) — theo chuẩn **RRULE (iCal RFC 5545)** | P0 |
| TK-3 | Nhắc nhở | Nhắc trước X phút/giờ/ngày; push notification + email; lặp nhắc | P0 |
| TK-4 | Checklist / subtask | Danh sách con trong 1 việc | P0 |
| TK-5 | Dự án / nhóm việc | Gom việc theo dự án, xem dạng list & bảng Kanban | P1 |
| TK-6 | Giao việc | Gán cho thành viên, theo dõi trạng thái, thông báo | P1 |
| TK-7 | Xử lý "bỏ lỡ" | Việc quá hạn tự đánh dấu, tùy chọn dời sang hôm nay | P0 |
| TK-8 | Đồng bộ lịch ngoài | Google/Apple/Outlook Calendar (2 chiều) | P2 |

**Chi tiết logic việc lặp lại (quan trọng):**
- Lưu **rule** (RRULE), không lưu sẵn hàng nghìn bản ghi. Sinh "occurrence" (lần xuất hiện) theo cửa sổ thời gian đang xem.
- Mỗi occurrence có thể được **hoàn thành / bỏ qua / dời riêng lẻ** mà không ảnh hưởng rule gốc (lưu dạng exception/override).
- Hỗ trợ "kết thúc sau N lần" hoặc "đến ngày…".

### 4.4. Module CÔNG CỤ / THIẾT BỊ (Assets & Inventory)

| ID | Tính năng | Mô tả | Ưu tiên |
|---|---|---|---|
| AS-1 | Danh mục tài sản | Tên, loại, hình ảnh, số serial, vị trí lưu trữ, tình trạng, giá trị | P0 |
| AS-2 | Nhóm & vị trí | Phân theo nhóm (điện tử, cơ khí…) và vị trí (nhà/kho/phòng) | P0 |
| AS-3 | Bảo hành & hạn dùng | Ngày mua, hết bảo hành, hạn sử dụng → nhắc trước khi hết | P0 |
| AS-4 | Lịch bảo trì | Chu kỳ bảo trì (mỗi X tháng) → **tự sinh việc lặp lại** ở module Tasks | P0 |
| AS-5 | Mượn – Trả | Ghi ai mượn, ngày mượn/hẹn trả, trạng thái, lịch sử | P1 |
| AS-6 | Mã QR / Barcode | Sinh & quét QR để tra cứu nhanh tài sản bằng điện thoại | P1 |
| AS-7 | Số lượng (vật tư tiêu hao) | Theo dõi tồn kho vật tư, cảnh báo khi dưới ngưỡng | P1 |
| AS-8 | Tài liệu đính kèm | Hóa đơn, giấy bảo hành, hướng dẫn sử dụng (PDF/ảnh) | P1 |
| AS-9 | Khấu hao / giá trị | Theo dõi giá trị theo thời gian | P2 |

### 4.5. Liên kết giữa các Module (điểm khác biệt)

| Kịch bản | Luồng |
|---|---|
| Thiết bị đến hạn bảo trì | AS-4 → tạo Task lặp lại (TK-2) → nhắc (TK-3) |
| Chi phí bảo trì/mua thiết bị | Từ Task hoặc Asset → tạo giao dịch chi (FN-1), gắn liên kết ngược |
| Hóa đơn định kỳ (điện, nước) | Giao dịch định kỳ (FN-5) → xuất hiện trên lịch (DL-2) + nhắc (TK-3) |
| Hoàn thành habit/việc | Cập nhật Dashboard (DL-5) & streak |

### 4.6. Engine NHẮC TỚI HẠN (Due-date & Maintenance reminders) — P0

Đây là tính năng lõi: **không để người dùng bỏ lỡ ngày tới hạn** của thanh toán, thay nhớt/dầu, thay pin, bảo trì hay sửa chữa. Mọi thực thể có "ngày tới hạn" (task, giao dịch định kỳ, bảo hành/hạn dùng, chu kỳ bảo trì của thiết bị) đều đi qua cùng một engine nhắc.

**Loại tới hạn được hỗ trợ:**

| Loại | Ví dụ | Nguồn dữ liệu |
|---|---|---|
| Thanh toán tới hạn | Tiền điện, nước, internet, thẻ tín dụng, tiền nhà, subscription | Giao dịch định kỳ (FN-5) / Task |
| Bảo trì định kỳ | Thay nhớt xe mỗi 3 tháng/5.000 km, vệ sinh máy lạnh, thay lõi lọc nước | Chu kỳ bảo trì của thiết bị (AS-4) |
| Thay thế linh kiện | Thay pin (xe, UPS, thiết bị), thay ruột xe, thay dây | Asset + chu kỳ (AS-4) |
| Sửa chữa / kiểm định | Đăng kiểm xe, kiểm định bình chữa cháy, lịch sửa đã hẹn | Asset (AS-3/AS-4) / Task |
| Hết hạn | Hết bảo hành, hết hạn sử dụng, hết hạn bảo hiểm | Asset (AS-3) |

**Cơ chế nhắc (lead-time nhiều mốc):**
- Mỗi mục tới hạn cho phép đặt **nhiều mốc nhắc trước**: ví dụ trước 7 ngày, trước 1 ngày, và đúng ngày.
- Nếu chưa xử lý → **nhắc lại (escalation)** theo chu kỳ (mỗi ngày) cho tới khi đánh dấu "đã làm/đã thanh toán".
- Gửi qua **kênh ưu tiên của người dùng** (SMS / Email / Telegram / Zalo / Web Push).
- Với thiết bị dùng theo **mốc sử dụng** (km, giờ chạy): ngoài theo thời gian, có thể nhắc khi người dùng cập nhật số km/giờ vượt ngưỡng.

**Sau khi hoàn thành một mục bảo trì/thay thế:**
- Tự **tính ngày tới hạn kế tiếp** dựa trên chu kỳ (vd thay nhớt xong → hẹn lại sau 3 tháng).
- Tùy chọn **ghi chi phí** vào module Chi tiêu (FN-1) và lưu vào lịch sử của thiết bị.

**Trạng thái mỗi mục tới hạn:** `sắp tới hạn → tới hạn → quá hạn → đã xử lý` (hiển thị màu và gom trên Dashboard "Sắp tới hạn").

---

## 5. Yêu cầu phi chức năng (NFR)

- **Đa nền tảng:** iOS 15+, Android 9+, trình duyệt hiện đại (Chrome/Safari/Edge/Firefox 2 phiên bản gần nhất). Web responsive dùng tốt trên tablet.
- **Hiệu năng:** mở app < 2s; thao tác ghi < 300ms (optimistic UI); đồng bộ < 3s khi online.
- **Offline:** mọi thao tác đọc/ghi cơ bản hoạt động offline, hàng đợi đồng bộ khi có mạng.
- **Bảo mật:** mã hóa TLS khi truyền, mã hóa at-rest cho dữ liệu nhạy cảm; xác thực token (JWT/refresh); tùy chọn khóa app bằng PIN/sinh trắc học.
- **Sao lưu:** backup tự động hằng ngày, người dùng tự export dữ liệu bất kỳ lúc nào.
- **Quyền riêng tư:** tuân thủ nguyên tắc tối thiểu dữ liệu; cho phép xóa tài khoản & toàn bộ dữ liệu.
- **Khả năng mở rộng:** thiết kế multi-tenant theo Workspace ngay từ đầu.
- **Độ tin cậy:** uptime mục tiêu 99.5%.
- **Khả năng tiếp cận:** hỗ trợ dark mode, cỡ chữ lớn, tương phản đạt WCAG AA.

---

## 6. Kiến trúc & Công nghệ (triển khai trên Cloudflare)

Toàn bộ hệ thống chạy trên nền tảng **Cloudflare** — một codebase web/PWA phục vụ cả điện thoại và máy tính, backend serverless ở biên (edge), độ trễ thấp toàn cầu, chi phí khởi đầu thấp.

### 6.1. Chiến lược nền tảng
- **Web + PWA (một codebase).** App responsive, có Service Worker để **cài lên màn hình chính** (điện thoại & desktop), chạy **offline**, nhận **Web Push**. Không phát hành app store ở giai đoạn này.
- Quét QR/Barcode dùng camera qua Web API (đủ tốt cho PWA).
- **Đồng bộ nhiều người real-time** ngay từ MVP (bắt buộc theo yêu cầu).

### 6.2. Ánh xạ dịch vụ Cloudflare

| Nhu cầu | Dịch vụ Cloudflare | Ghi chú |
|---|---|---|
| Hosting web/PWA | **Cloudflare Pages** | Frontend tĩnh + Service Worker |
| API / backend | **Cloudflare Workers** (Hono framework) | Serverless, chạy ở edge |
| CSDL quan hệ | **Cloudflare D1** (SQLite) | Dữ liệu chính; hoặc Postgres qua Hyperdrive nếu cần |
| Lưu file | **Cloudflare R2** | Ảnh hóa đơn, tài liệu bảo hành (S3-compatible) |
| Realtime & đồng bộ | **Durable Objects** (WebSocket) | Đồng bộ nhiều người theo workspace, quản lý xung đột |
| Hàng đợi job | **Cloudflare Queues** | Gửi thông báo, sinh giao dịch/việc định kỳ |
| Lịch chạy định kỳ | **Cron Triggers** | Quét việc đến hạn, sinh occurrence, gửi nhắc |
| Cache/session | **Workers KV** | Token, cấu hình, cache nhẹ |
| Xác thực | Workers + JWT/refresh (hoặc **Cloudflare Access** cho team) | Email/mật khẩu + OAuth Google/Apple |
| Bảo vệ | WAF, Rate limiting, Turnstile (chống bot) | Tích hợp sẵn của Cloudflare |

### 6.3. Stack ứng dụng

| Lớp | Công nghệ |
|---|---|
| Frontend | React + TypeScript + Tailwind + Vite; `vite-plugin-pwa` (Service Worker, offline, installable) |
| State/offline | TanStack Query + IndexedDB (local store) + hàng đợi sync khi có mạng |
| Backend | Cloudflare Workers + **Hono** (router) + Drizzle ORM (trên D1) |
| Realtime | Durable Objects + WebSocket (một DO cho mỗi workspace) |
| CI/CD | Wrangler + GitHub Actions → deploy tự động lên Pages/Workers |

### 6.4. Hệ thống thông báo đa kênh (Notifications)

Yêu cầu: gửi nhắc/thông báo qua **SMS, Email, Telegram, Zalo** (và Web Push). Thiết kế theo mô hình **hàng đợi + adapter theo kênh** để dễ thêm kênh mới.

**Luồng:** Cron Trigger quét `reminders` đến hạn → đẩy vào **Cloudflare Queue** → Worker consumer đọc **kênh ưa thích của người dùng** → gọi adapter tương ứng → ghi log gửi/thất bại (retry).

| Kênh | Cách tích hợp | Ghi chú |
|---|---|---|
| **Web Push** | Web Push API + VAPID | Miễn phí, cho PWA đã cài |
| **Email** | Cloudflare Email Routing / Resend / Amazon SES | Nhắc, báo cáo, mời thành viên |
| **Telegram** | **Telegram Bot API** (`sendMessage`) | User kết nối bằng cách chat với bot & liên kết tài khoản; rẻ, real-time |
| **Zalo** | **Zalo OA – ZNS (Zalo Notification Service)** qua Official Account | Cần OA đã xác thực + template ZNS được duyệt; phù hợp nhắc giao dịch/lịch |
| **SMS** | Nhà cung cấp VN (eSMS, VietGuys, SpeedSMS) hoặc Twilio | Dự phòng khi user không dùng app khác; tính phí theo tin |

**Thiết lập người dùng:** mỗi user chọn kênh mặc định + kênh dự phòng, và cấu hình theo loại sự kiện (nhắc việc, cảnh báo vượt ngân sách, thiết bị đến hạn bảo trì/bảo hành, mượn đồ quá hạn).

### 6.5. Tích hợp ngân hàng / ví điện tử (Giai đoạn 3)
Tích hợp có kiểm soát để tự đồng bộ giao dịch, giảm nhập tay:
- Ưu tiên nhà tổng hợp/Open API (ví dụ các cổng như Casso, các API sao kê ngân hàng, VietQR để đối soát).
- Ví điện tử (MoMo/ZaloPay) qua API đối tác nếu đủ điều kiện.
- Luôn có phương án dự phòng: **import sao kê CSV/Excel** và bắt cú pháp SMS biến động số dư (nếu người dùng cho phép chuyển tiếp).

### 6.6. Sơ đồ dữ liệu (data model rút gọn)

```
User(id, name, email, avatar, created_at)
Workspace(id, name, type[personal|team], owner_id)
Membership(id, user_id, workspace_id, role[owner|admin|member|viewer])

# Finance
Wallet(id, workspace_id, name, type, currency, balance)
Category(id, workspace_id, name, kind[income|expense], parent_id, icon, color)
Transaction(id, workspace_id, wallet_id, category_id, type[income|expense|transfer],
            amount, currency, date, note, attachment_url, created_by,
            linked_asset_id?, linked_task_id?)
Budget(id, workspace_id, category_id, period, limit_amount, threshold_pct)
RecurringTransaction(id, workspace_id, template..., rrule, next_run_at)

# Tasks
Task(id, workspace_id, title, description, due_at, priority, status,
     project_id?, assignee_id?, rrule?, linked_asset_id?)
TaskOccurrence(id, task_id, occurrence_date, status[done|skipped|moved], moved_to?)
Subtask(id, task_id, title, done)
Project(id, workspace_id, name, view[list|kanban])
Reminder(id, entity_type, entity_id, remind_at,
         channels[push|email|telegram|zalo|sms], status[pending|sent|failed])
ReminderOffset(id, reminder_id, offset_days)        # nhiều mốc: -7, -1, 0; escalation khi quá hạn

# Due-date / bảo trì
MaintenancePlan(id, asset_id, type[thanh_toan|thay_nhot|thay_pin|sua_chua|kiem_dinh|het_han],
                interval_kind[time|usage], interval_value, interval_unit[ngay|thang|nam|km|gio],
                next_due_date?, next_due_usage?, cost_estimate?)
UsageLog(id, asset_id, value, unit[km|gio], logged_at)  # cập nhật số km/giờ để nhắc theo mốc dùng
MaintenanceHistory(id, asset_id, plan_id, done_at, cost, note, transaction_id?)

# Notifications
UserChannel(id, user_id, channel[push|email|telegram|zalo|sms],
            address, verified, is_default)          # vd: telegram chat_id, zalo user_id, số ĐT
NotificationPref(id, user_id, event_type, channel)  # kênh theo từng loại sự kiện
NotificationLog(id, reminder_id, channel, status, provider_msg_id, error, sent_at)

# Assets
Asset(id, workspace_id, name, category, image_url, serial, location,
      status[available|in_use|repair|retired], value, purchase_date,
      warranty_until, expiry_date, maintenance_rrule?)
AssetLoan(id, asset_id, borrower, borrowed_at, due_at, returned_at, status)
AssetDocument(id, asset_id, type, file_url)
Consumable(id, workspace_id, name, quantity, unit, min_threshold)

# Daily
Habit(id, workspace_id, user_id, name, rrule, target)
HabitLog(id, habit_id, date, done)
Note(id, workspace_id, user_id, content, attachments, tags)
```

### 6.7. API (mẫu REST)
Chuẩn RESTful, có phân trang, lọc, sắp xếp; auth bằng Bearer token; scope theo `workspace_id`.

```
POST   /auth/register | /auth/login | /auth/refresh
GET    /workspaces | POST /workspaces
GET    /workspaces/:id/transactions?from=&to=&category=
POST   /workspaces/:id/transactions
GET    /workspaces/:id/tasks?view=today|upcoming
POST   /workspaces/:id/tasks           # kèm rrule cho việc lặp lại
PATCH  /tasks/:id/occurrences/:date    # đánh dấu 1 lần xuất hiện done/skip/move
GET    /workspaces/:id/assets
POST   /workspaces/:id/assets/:aid/loans
GET    /workspaces/:id/reports/finance?groupBy=category
# Thông báo & kênh
GET    /me/channels | POST /me/channels           # thêm/xác thực Telegram, Zalo, SMS, email
PUT    /me/notification-prefs                       # chọn kênh theo loại sự kiện
POST   /webhooks/telegram | /webhooks/zalo         # nhận liên kết tài khoản từ bot/OA
```

### 6.8. Triển khai (Deploy) trên Cloudflare
- **Frontend:** build Vite → deploy **Cloudflare Pages** (tự động qua GitHub, có preview cho mỗi PR).
- **Backend/API:** `wrangler deploy` các **Workers**; binding tới **D1, R2, KV, Queues, Durable Objects**.
- **Cron:** khai báo trong `wrangler.toml` (`[triggers] crons`) để quét nhắc nhở & sinh định kỳ.
- **Bí mật:** token Telegram/Zalo/SMS/email lưu bằng `wrangler secret` (không hardcode).
- **Môi trường:** tách `dev` / `staging` / `production`; domain qua Cloudflare DNS + SSL sẵn.

---

## 7. Chỉ số thành công (Metrics)

| Nhóm | Chỉ số | Mục tiêu tham khảo |
|---|---|---|
| Kích hoạt | % người dùng ghi ≥ 1 giao dịch & tạo ≥ 1 việc trong 7 ngày đầu | > 60% |
| Giữ chân | Retention D30 | > 35% |
| Gắn bó | DAU/MAU | > 25% |
| Giá trị lõi | Số nhắc nhở định kỳ được hoàn thành đúng hạn | tăng dần |
| Nhóm | % workspace có ≥ 2 thành viên hoạt động | theo dõi |

---

## 8. Roadmap phát triển

### Giai đoạn 0 — Nền tảng (2–3 tuần)
Cloudflare Pages/Workers/D1/R2, Auth, Workspace + phân quyền, **đồng bộ nhiều người real-time** (Durable Objects), khung PWA (offline, installable), dark mode.

### Giai đoạn 1 — MVP (P0) (6–8 tuần)
- Finance: ghi giao dịch, ví, danh mục, ngân sách, báo cáo cơ bản.
- Tasks: việc một lần + lặp lại (RRULE), nhắc nhở, checklist, xử lý quá hạn.
- Assets: danh mục tài sản, bảo hành/hạn dùng, lịch bảo trì → sinh việc.
- Daily: dashboard, habit, ghi chú.
- **Thông báo đa kênh:** Web Push + Email + **Telegram** (nhanh nhất để tích hợp).

### Giai đoạn 2 — Nâng cao (P1) (6–8 tuần)
Import/export & xuất PDF/Excel, Kanban drag-drop, cộng tác giao việc nâng cao, QR/barcode chuẩn. **Thêm kênh SMS.** Gói trả phí theo Workspace (billing). Apple OAuth, khóa app PIN/sinh trắc.

*(Lưu ý: FN-5 giao dịch định kỳ, mượn–trả, usage-based maintenance đã đưa vào MVP — xem 01-MVP-Scope-Matrix.)*

### Giai đoạn 3 — Mở rộng (P2)
**Tích hợp ngân hàng/ví điện tử VN** (auto-sync giao dịch), **kênh Zalo (ZNS)**, đa tiền tệ, chia hóa đơn, đồng bộ Google/Apple Calendar, khấu hao tài sản, báo cáo nâng cao.

---

## 9. Rủi ro & Giả định

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| Logic việc lặp lại + đồng bộ offline phức tạp | Cao | Dùng thư viện RRULE có sẵn; tách rule/occurrence rõ ràng; test kỹ xung đột |
| Phạm vi quá rộng (4 module) làm chậm ra mắt | Cao | Bám sát P0, cắt tính năng phụ, ra MVP trước |
| Nhập liệu thủ công gây ngại dùng | Trung bình | Quick-add, mẫu sẵn, giao dịch/việc định kỳ tự sinh |
| Đa nền tảng gấp đôi công sức | Trung bình | Bắt đầu PWA 1 codebase, native sau |

**Giả định:** người dùng chấp nhận nhập tay ở v1; ưu tiên tiếng Việt & VND; số lượng thành viên mỗi workspace nhỏ (< 20).

---

## 10. Các quyết định đã chốt

| # | Vấn đề | Quyết định |
|---|---|---|
| 1 | Nền tảng | **Web + PWA** (không app native). Cài từ trình duyệt lên điện thoại & máy tính |
| 2 | Đồng bộ nhiều người | **Có** — hỗ trợ ngay từ MVP (real-time qua Durable Objects) |
| 3 | Mô hình kiếm tiền | **Trả phí theo Workspace** (freemium: workspace cá nhân miễn phí, gói team trả phí) |
| 4 | Tích hợp ngân hàng/ví | **Có** — đưa vào Giai đoạn 3 |
| 5 | Hạ tầng | **Cloudflare** (Pages, Workers, D1, R2, Durable Objects, Queues, KV, Cron) |
| 6 | Kênh thông báo | **SMS, Email, Telegram, Zalo** + Web Push |
| 7 | Quy mô dự kiến | Chưa dự trù — thiết kế co giãn tự nhiên nhờ nền serverless Cloudflare |

### Việc cần làm tiếp
- Chuẩn bị tài khoản: Cloudflare, **Telegram Bot**, **Zalo Official Account** (để dùng ZNS — cần OA xác thực + template được duyệt), nhà cung cấp **SMS** (eSMS/VietGuys), dịch vụ **Email** (Resend/SES hoặc Cloudflare Email).
- Thiết kế bảng giá gói Workspace (giới hạn thành viên/dung lượng file/số tin ZNS-SMS).

---

*Tài liệu này là bản nháp để review. Bước tiếp theo có thể tách thành backlog chi tiết (user stories + acceptance criteria) cho từng sprint, hoặc dựng khung mã nguồn Cloudflare (Pages + Workers + D1).*
