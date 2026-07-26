# 01 — MVP Scope Matrix (In/Out)

**Dự án:** LifeHub · **Kèm theo:** PRD-LifeHub.md · **Ngày:** 26/07/2026 · **Quyết định:** MVP đầy đủ

Mục đích tài liệu này: **khóa phạm vi MVP**, gỡ 4 mâu thuẫn P0/P1/P2 mà bản review nêu, để có thể khóa schema D1 và chia sprint. Mỗi feature ghi rõ **In / Out / Partial** và lý do.

---

## 1. Quyết định gỡ mâu thuẫn (bắt buộc đọc trước)

| # | Mâu thuẫn trong PRD | Quyết định chốt |
|---|---|---|
| M1 | FN-5 "Giao dịch định kỳ" đang P1, nhưng Reminder Engine (P0) cần dữ liệu "thanh toán tới hạn" từ FN-5 | **FN-5 nâng lên P0.** Reminder Engine phụ thuộc trực tiếp. Không có định kỳ thì không có "nhắc thanh toán tới hạn" |
| M2 | "Giao việc" (TK-6) là P1, nhưng TK-1 (P0) đã có trường `assignee`, và Member "chỉ xem theo phạm vi được cấp" | **Gán người phụ trách (assign) là P0** (chọn 1 assignee khi tạo/sửa task). **Luồng cộng tác nâng cao** (thông báo giao việc, theo dõi trạng thái nhiều người, reassign hàng loạt) giữ **P1**. Xem Permission Matrix cho phạm vi Member |
| M3 | Đa tiền tệ là P2, nhưng "Nguyên tắc thiết kế" ghi "hỗ trợ đa tiền tệ" | **Tách 2 tầng.** Tầng **dữ liệu**: mọi số tiền lưu kèm `currency` + minor-unit ngay từ MVP (In). Tầng **tính năng người dùng**: nhiều ví khác tiền tệ + quy đổi báo cáo giữ **P2 (Out)**. MVP: toàn bộ ví/giao dịch **cùng 1 tiền tệ = VND** |
| M4 | Report P0 có "xuất PDF/Excel" — làm phồng phạm vi | **Report xem trên màn hình (biểu đồ + bảng) là P0.** **Xuất PDF/Excel chuyển P1 (Out khỏi MVP).** Xuất CSV thô của giao dịch giữ P0 (đơn giản, phục vụ backup) |

---

## 2. Ma trận phạm vi theo Module

Ký hiệu: **In** = có trong MVP · **Out** = hoãn (P1/P2) · **Partial** = có phần lõi, hoãn phần nâng cao.

### 2.1. Nền tảng & Tài khoản

| ID | Feature | MVP | Ghi chú phạm vi |
|---|---|---|---|
| PL-1 | Đăng ký / đăng nhập email + mật khẩu | **In** | Có xác minh email (bắt buộc trước khi dùng), reset mật khẩu |
| PL-2 | OAuth Google | **In** | Apple Sign-in → Out (P1) |
| PL-3 | Workspace (personal + team) | **In** | Mỗi user tự có 1 personal workspace khi đăng ký |
| PL-4 | Mời/xóa thành viên, chuyển Owner | **Partial** | Mời qua email + gán role: In. Chuyển Owner: In. Thu hồi lời mời/gửi lại: In. Lời mời hết hạn 7 ngày |
| PL-5 | RBAC 4 role | **In** | Theo Permission Matrix (file 02) |
| PL-6 | Đồng bộ real-time nhiều người | **In** | Durable Objects + WebSocket (quyết định MVP đầy đủ) |
| PL-7 | PWA cài đặt + offline | **In** | Xem ma trận hỗ trợ trình duyệt ở §4 |
| PL-8 | Dark mode, i18n scaffold (vi) | **In** | Chỉ tiếng Việt ở MVP; khung i18n sẵn |
| PL-9 | Khóa app bằng PIN/sinh trắc học | **Out** | P1 |
| PL-10 | Audit log (tài chính + phân quyền) | **In** | Bắt buộc cho thay đổi tài chính & role; xem file 04 |

### 2.2. Finance

| ID | Feature | MVP | Ghi chú |
|---|---|---|---|
| FN-1 | Ghi giao dịch thu/chi | **In** | Có ảnh hóa đơn; xem AC ở file 04 |
| FN-1b | Giao dịch chuyển khoản (transfer) | **In** | Cần ví nguồn + ví đích, cập nhật nguyên tử (xem file 04, §Finance) |
| FN-2 | Danh mục 2 cấp | **In** | Bộ danh mục VN mặc định seed sẵn |
| FN-3 | Nhiều ví, số dư | **In** | Số dư = số dư đầu kỳ + ledger (tính, không lưu rời rạc) |
| FN-4 | Ngân sách theo danh mục/tháng | **In** | Chỉ chu kỳ **tháng dương lịch** ở MVP; chu kỳ tùy chọn → Out |
| FN-5 | Giao dịch định kỳ | **In (nâng từ P1)** | Nguồn cho "nhắc thanh toán tới hạn" |
| FN-6 | Báo cáo & biểu đồ trên màn hình | **In** | Theo thời gian/danh mục/ví; pie + line + bar |
| FN-6b | Xuất PDF/Excel báo cáo | **Out** | P1 |
| FN-7 | Import CSV/Excel | **Out** | P1. Export CSV thô: In |
| FN-8 | Đa tiền tệ (ví khác tiền + quy đổi) | **Out** | P2 (xem M3) |
| FN-9 | Chia hóa đơn | **Out** | P2 |

### 2.3. Tasks

| ID | Feature | MVP | Ghi chú |
|---|---|---|---|
| TK-1 | Việc một lần + gán 1 assignee | **In** | assignee thuộc thành viên workspace |
| TK-2 | Việc lặp lại (RRULE) | **In** | Tập RRULE hỗ trợ giới hạn — xem file 03, §Recurrence |
| TK-3 | Nhắc nhở đa mốc | **In** | Qua Reminder Engine (file 03) |
| TK-4 | Checklist / subtask | **In** | |
| TK-5 | Dự án + Kanban | **Partial** | Gom theo project + list view: In. Kanban drag-drop: Out (P1) |
| TK-6 | Cộng tác giao việc nâng cao | **Out** | P1 (xem M2) |
| TK-7 | Xử lý quá hạn (dời sang hôm nay) | **In** | |
| TK-8 | Đồng bộ Google/Apple Calendar | **Out** | P2 |

### 2.4. Assets & Maintenance

| ID | Feature | MVP | Ghi chú |
|---|---|---|---|
| AS-1 | Danh mục tài sản | **In** | |
| AS-2 | Nhóm & vị trí | **In** | |
| AS-3 | Bảo hành / hạn dùng + nhắc | **In** | |
| AS-4 | Lịch bảo trì **theo thời gian** → sinh task | **In** | Nguồn sự thật = MaintenancePlan (xem file 03/04, §Asset) |
| AS-4b | Bảo trì **theo mốc sử dụng** (km/giờ) | **In** | Giữ (MVP đầy đủ). Điều kiện "3 tháng HOẶC 5.000 km" được data model hỗ trợ |
| AS-5 | Mượn – trả | **In** | (nâng từ P1 để trọn kịch bản team) |
| AS-6 | QR/Barcode quét tài sản | **Partial** | Sinh & quét QR nội bộ: In. Barcode sản phẩm chuẩn: Out (P1) |
| AS-7 | Vật tư tiêu hao + ngưỡng | **In** | |
| AS-8 | Tài liệu đính kèm | **In** | |
| AS-9 | Khấu hao/giá trị theo thời gian | **Out** | P2 |

### 2.5. Daily & Reminders

| ID | Feature | MVP | Ghi chú |
|---|---|---|---|
| DL-1 | Habits + streak | **In** | |
| DL-2 | Lịch gộp (task+habit+hóa đơn) | **In** | |
| DL-3 | Ghi chú nhanh | **In** | |
| DL-4 | Nhật ký / mood | **Out** | P2 |
| DL-5 | Dashboard | **In** | Widget chốt ở §3 |
| RM-1 | Reminder Engine (due-date) | **In** | State machine ở file 03 |
| RM-2 | Kênh Web Push | **In** | |
| RM-3 | Kênh Email | **In** | |
| RM-4 | Kênh Telegram | **In** | (MVP đầy đủ giữ Telegram) |
| RM-5 | Kênh Zalo (ZNS) | **Out** | P2 — phụ thuộc duyệt OA/template, rủi ro lịch |
| RM-6 | Kênh SMS | **Out** | P1 — chi phí theo tin |

---

## 3. Dashboard MVP — widget chốt (gỡ mơ hồ DL-5)

Dashboard P0 gồm đúng 4 widget, mỗi widget = 1 query xác định (chi tiết query ở file 04):

1. **Chi tiêu hôm nay / tháng này** — tổng chi theo ngày & so với ngân sách tháng.
2. **Việc cần làm hôm nay** — task đến hạn hôm nay + quá hạn (gồm occurrence của việc lặp).
3. **Sắp tới hạn (14 ngày)** — gộp: thanh toán định kỳ, bảo trì/thay pin/thay nhớt, hết bảo hành, mượn quá hạn.
4. **Cảnh báo** — ngân sách vượt ngưỡng + vật tư dưới ngưỡng tồn.

---

## 4. Ma trận hỗ trợ PWA / Offline / Push (gỡ mơ hồ NFR)

| Nền tảng | Cài PWA | Offline đọc | Offline ghi (hàng đợi) | Web Push |
|---|---|---|---|---|
| Chrome/Edge Android | Có | Có | Có | Có |
| Chrome/Edge Desktop | Có | Có | Có | Có |
| Safari macOS | Có | Có | Có | Có (macOS 13+) |
| Safari iOS/iPadOS | Có (16.4+) | Có | Có | Có **chỉ khi đã "Add to Home Screen"** (iOS 16.4+) |
| Firefox Desktop | Một phần | Có | Có | Có |

**Chốt fallback:** thiết bị iOS chưa cài PWA hoặc < 16.4 → reminder vẫn tới qua **Email** (và Telegram khi có). Web Push không phải kênh bảo đảm duy nhất.

**Chỉ số hiệu năng đo lại (thay "mở app < 2s" mơ hồ):** Thời gian tương tác (TTI) **≤ 2.5s ở p75**, đo trên **thiết bị Android tầm trung (mô phỏng Moto G Power) + mạng 4G Fast 3G throttle**; thao tác ghi phản hồi (optimistic) **≤ 300ms ở p95**.

---

## 5. Hạng mục "chốt song song" — trạng thái MVP

| Hạng mục | MVP |
|---|---|
| Xác minh email khi đăng ký | In (bắt buộc) |
| Reset password | In |
| Apple OAuth | Out (P1) |
| Lời mời: hết hạn 7 ngày, gửi lại, thu hồi | In |
| Chuyển Owner | In |
| Soft-delete workspace/account + 30 ngày khôi phục | In |
| Audit log tài chính & phân quyền | In |
| R2: giới hạn 10MB/file, chỉ ảnh (jpg/png/webp/heic) + pdf, signed URL, virus scan | In (virus scan: P1) |
| Pagination: cursor-based | In (chuẩn hóa toàn API) |
| Quy ước ID (UUIDv7), timestamps UTC, soft-delete, optimistic concurrency (`version`) | In |
| Backup D1 + quy trình restore có kiểm thử | In (định nghĩa quy trình, không chỉ "hằng ngày") |

---

## 6. Tác động roadmap sau khi khóa scope

MVP đầy đủ (giữ realtime + offline đa người + Telegram + usage-based maintenance) → **ước lượng thực tế 10–14 tuần với team 3–4 người có kinh nghiệm Cloudflare/PWA**, với điều kiện scope khóa chặt theo bảng trên. 3 luồng khó (file 03) là đường găng — nên làm spike trước khi khóa schema.
