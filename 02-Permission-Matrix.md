# 02 — Permission Matrix (RBAC)

**Dự án:** LifeHub · **Kèm theo:** PRD-LifeHub.md, 01-MVP-Scope-Matrix.md · **Ngày:** 26/07/2026

Tài liệu này gỡ **blocker phân quyền** — trả lời trực tiếp mọi câu hỏi review nêu và cung cấp bảng `role × module × action` đủ để dev viết middleware kiểm quyền và WHERE-clause cho mọi query.

---

## 1. Mô hình phân quyền (chốt)

**Phạm vi quyền được áp dụng theo thứ tự:**

1. **Workspace** — user phải là thành viên của workspace mới truy cập được dữ liệu (mọi bảng đều scope `workspace_id`).
2. **Role trong workspace** — Owner / Admin / Member / Viewer (lưu ở `Membership.role`).
3. **Ownership của bản ghi** — một số action bị siết theo `own` (bản ghi do chính mình tạo / task được giao cho mình) so với `any`.

> **Không** làm phân quyền theo từng module riêng cho từng người ở MVP (vd "user A chỉ thấy Finance"). Toàn bộ thành viên thấy các module của workspace; mức độ thao tác do role quyết định. Phân quyền theo module cho từng người → P2.

**Nguyên tắc "shared workspace":** dữ liệu trong một team/family workspace là **dùng chung** — Member **thấy toàn bộ** giao dịch, task, tài sản của workspace (đó là mục đích chia sẻ), nhưng chỉ **sửa/xóa của người khác** khi là Admin trở lên.

**Ký hiệu action:** C=Create, R=Read, U=Update, D=Delete. `own`=chỉ bản ghi mình tạo/được giao; `any`=mọi bản ghi trong workspace; `—`=không có quyền.

---

## 2. Trả lời trực tiếp các câu hỏi blocker

| Câu hỏi review | Quyết định |
|---|---|
| Member xem **toàn bộ** giao dịch hay chỉ của mình? | **Toàn bộ** giao dịch trong workspace (shared ledger) |
| Member xem **số dư & báo cáo tài chính**? | **Có** — số dư ví và báo cáo là dữ liệu chung của workspace |
| Member **sửa/xóa** dữ liệu người khác tạo? | **Không.** Chỉ sửa/xóa **của mình**. Admin/Owner sửa/xóa `any` |
| **Viewer** tải file & export? | **Xem + tải file đính kèm: có. Export dữ liệu: không** (export = hành động ghi/rút toàn bộ, chỉ Member+) |
| Ai **tạo** task giao cho người khác? | Member+ tạo task và gán assignee là bất kỳ thành viên nào |
| Ai **xem** task giao cho người khác? | Mọi thành viên xem task của workspace (R any) |
| Ai **hoàn thành** task giao cho người khác? | Assignee hoàn thành task của mình; **Admin/Owner** hoàn thành/đổi trạng thái `any`; Member khác **không** tự tick hộ (tránh nhiễu) |
| Quyền theo workspace, module hay record? | **Workspace + role**, siết thêm **record-ownership** cho U/D và complete task |

---

## 3. Ma trận tổng quát (áp cho hầu hết module dữ liệu)

| Action nhóm | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| Read dữ liệu workspace | R any | R any | R any | R any |
| Create bản ghi | C | C | C | — |
| Update **của mình** | U own | U any | U own | — |
| Update **của người khác** | U any | U any | — | — |
| Delete **của mình** | D own | D any | D own | — |
| Delete **của người khác** | D any | D any | — | — |
| Tải file đính kèm | ✓ | ✓ | ✓ | ✓ |
| Export dữ liệu (CSV) | ✓ | ✓ | ✓ | — |

Các mục dưới đây là ngoại lệ/bổ sung theo module.

---

## 4. Ma trận chi tiết theo Module & Action

### 4.1. Quản trị Workspace & Thành viên

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| Sửa thông tin workspace | ✓ | ✓ | — | — |
| Mời thành viên | ✓ | ✓ | — | — |
| Đổi role thành viên | ✓ | ✓ (trừ Owner) | — | — |
| Xóa thành viên | ✓ | ✓ (trừ Owner) | — | — |
| Chuyển quyền Owner | ✓ | — | — | — |
| Xóa workspace (soft-delete) | ✓ | — | — | — |
| Quản lý thanh toán/gói | ✓ | — | — | — |
| Xem audit log | ✓ | ✓ | — | — |

### 4.2. Finance (Transaction, Wallet, Category, Budget, Recurring)

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| Xem giao dịch, số dư, báo cáo | R any | R any | R any | R any |
| Tạo giao dịch | ✓ | ✓ | ✓ | — |
| Sửa/xóa giao dịch của mình | ✓ | ✓ | ✓ | — |
| Sửa/xóa giao dịch người khác | ✓ | ✓ | — | — |
| Tạo/sửa/xóa Wallet | ✓ | ✓ | — | — |
| Tạo/sửa/xóa Category | ✓ | ✓ | — | — |
| Tạo/sửa/xóa Budget | ✓ | ✓ | — | — |
| Tạo/sửa Recurring transaction | ✓ | ✓ | U own | — |
| Export CSV giao dịch | ✓ | ✓ | ✓ | — |

> Ghi chú: Wallet/Category/Budget là "cấu hình chung" → chỉ Admin+ sửa để tránh Member đổi cấu trúc ảnh hưởng cả workspace. Member vẫn ghi giao dịch bình thường.

### 4.3. Tasks

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| Xem task (kể cả của người khác) | R any | R any | R any | R any |
| Tạo task + gán assignee | ✓ | ✓ | ✓ | — |
| Sửa/xóa task mình tạo | ✓ | ✓ | ✓ | — |
| Sửa/xóa task người khác tạo | ✓ | ✓ | — | — |
| Hoàn thành/đổi trạng thái task **được giao cho mình** | ✓ | ✓ | ✓ | — |
| Hoàn thành/đổi trạng thái task **của người khác** | ✓ | ✓ | — | — |
| Sửa RRULE (rule lặp) | ✓ | ✓ | U own | — |

### 4.4. Assets & Maintenance

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| Xem tài sản, plan bảo trì, lịch sử | R any | R any | R any | R any |
| Tạo/sửa/xóa tài sản | ✓ | ✓ | C, U own | — |
| Tạo/sửa MaintenancePlan | ✓ | ✓ | U own | — |
| Ghi UsageLog (cập nhật km/giờ) | ✓ | ✓ | ✓ | — |
| Đánh dấu hoàn thành bảo trì | ✓ | ✓ | ✓ (nếu là người thực hiện/được giao) | — |
| Mượn tài sản (tạo AssetLoan) | ✓ | ✓ | ✓ | — |
| Xác nhận trả / đóng khoản mượn | ✓ | ✓ | U own (khoản mình mượn) | — |

### 4.5. Daily (Habit, Note, Dashboard)

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| Habit (cá nhân) | Chủ sở hữu habit toàn quyền; người khác không thấy habit cá nhân | | | |
| Note cá nhân | Chỉ người tạo thấy/sửa | | | |
| Note chia sẻ workspace | R any; U/D own; Admin+ U/D any | | | |
| Dashboard | Mỗi user xem dashboard theo quyền dữ liệu của mình | | | |

> Habit và Note cá nhân **không** thuộc dữ liệu chung — luôn private theo `user_id`, kể cả Owner/Admin cũng không xem của người khác.

### 4.6. Notifications / Channels

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| Cấu hình kênh cá nhân (Telegram/Email/Push) | Mỗi user tự cấu hình của mình | | | |
| Nhận reminder của dữ liệu workspace | Theo quy tắc "ai nhận" ở file 03 §Reminder | | | |

---

## 5. Quy tắc thực thi (cho dev)

1. **Middleware bắt buộc:** mọi request có `workspace_id` → kiểm `Membership(user, workspace)` tồn tại và lấy `role`. Không có membership ⇒ 403.
2. **WHERE-clause mặc định:** mọi query dữ liệu luôn kèm `workspace_id = :ws`. Với action U/D bị siết `own`, thêm điều kiện `created_by = :user` (hoặc `assignee_id = :user` với complete task) **trừ khi** role ∈ {Owner, Admin}.
3. **Personal workspace:** chủ sở hữu luôn có role Owner; các nhánh `own/any` trùng nhau nên không phát sinh phức tạp.
4. **Kiểm quyền 2 lớp:** kiểm ở API (bắt buộc) và ẩn/hiện nút ở UI (trải nghiệm). UI không được là lớp bảo vệ duy nhất.
5. **Audit:** mọi U/D trên Finance và mọi thay đổi role/thành viên ghi `AuditLog(actor, action, entity, before, after, at)`.
6. **Mất quyền khi đang offline:** nếu membership bị gỡ, mutation offline gửi lên **bị từ chối 403 và không áp dụng**; client hiển thị dữ liệu chờ đồng bộ là "không thể đồng bộ — bạn không còn quyền" (xem file 03 §Offline).

---

## 6. Bảng tra nhanh (cheat sheet)

- **Viewer** = chỉ đọc + tải file. Không tạo, không export.
- **Member** = ghi dữ liệu, sửa/xóa **của mình**, hoàn thành task **của mình**. Không đụng cấu hình chung (wallet/category/budget) và không sửa dữ liệu người khác.
- **Admin** = như Member + toàn quyền dữ liệu `any` + quản lý thành viên (trừ Owner) + cấu hình chung + xem audit.
- **Owner** = toàn quyền + thanh toán + chuyển Owner + xóa workspace.
