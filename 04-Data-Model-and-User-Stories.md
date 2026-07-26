# 04 — Data Model chi tiết + User Stories & Acceptance Criteria

**Dự án:** LifeHub · **Kèm theo:** PRD-LifeHub.md, 01/02/03 · **Ngày:** 26/07/2026 · **DB:** Cloudflare D1 (SQLite)

Tài liệu này khóa **schema chi tiết** (kiểu, constraint, index, cascade, uniqueness) và cung cấp **user stories + acceptance criteria** cho P0 để dev/QA nghiệm thu. Đặc biệt xử lý các lỗ hổng Finance model mà review nêu.

---

## PHẦN 1 — QUY ƯỚC CHUNG (chốt)

| Chủ đề | Quy ước |
|---|---|
| Khóa chính | `id TEXT` = **UUIDv7** (sinh ở client, sắp theo thời gian, thân thiện index) |
| Thời gian | Lưu **UTC epoch ms** (`INTEGER`). Ngày local lưu thêm `TEXT 'YYYY-MM-DD'` khi cần theo lịch (occurrence, due date) |
| **Tiền tệ** | **KHÔNG dùng float.** Lưu `amount_minor INTEGER` (đơn vị nhỏ nhất; VND minor = đồng, exponent 0) + `currency TEXT(3)`. Mọi phép cộng trừ trên integer |
| Soft-delete | `deleted_at INTEGER NULL` (tombstone). Query mặc định lọc `deleted_at IS NULL` |
| Concurrency | `version INTEGER NOT NULL DEFAULT 1`, tăng mỗi update; update kèm `expected_version` |
| Sync | `server_seq INTEGER` (tăng dần theo workspace), `updated_at`, `created_by` — mọi bảng dữ liệu |
| Chuẩn hóa audit | Finance & role change ghi `AuditLog` |
| Pagination | **Cursor-based** trên `(server_seq)` hoặc `(created_at,id)` |
| Xóa quan hệ | Nêu rõ cascade/restrict ở từng bảng (mặc định **RESTRICT** với dữ liệu đang tham chiếu, dùng tombstone thay vì xóa cứng) |

---

## PHẦN 2 — SCHEMA CHI TIẾT

### 2.1. Core: User / Workspace / Membership

```sql
User(
  id TEXT PK, email TEXT UNIQUE NOT NULL, email_verified INTEGER NOT NULL DEFAULT 0,
  name TEXT, avatar_url TEXT, timezone TEXT,           -- null => dùng tz workspace
  password_hash TEXT, oauth_google_sub TEXT UNIQUE,
  created_at, updated_at, deleted_at
)

Workspace(
  id TEXT PK, name TEXT NOT NULL, type TEXT CHECK(type IN ('personal','team')),
  owner_id TEXT NOT NULL REFERENCES User(id),
  timezone TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  base_currency TEXT NOT NULL DEFAULT 'VND',
  reminder_hour_local INTEGER NOT NULL DEFAULT 8,      -- giờ nhắc chuẩn cho all-day
  created_at, updated_at, deleted_at
)

Membership(
  id TEXT PK, user_id TEXT REFERENCES User(id), workspace_id TEXT REFERENCES Workspace(id),
  role TEXT CHECK(role IN ('owner','admin','member','viewer')) NOT NULL,
  created_at, updated_at, deleted_at,
  UNIQUE(user_id, workspace_id)
)
INDEX idx_membership_ws ON Membership(workspace_id);

Invitation(
  id TEXT PK, workspace_id TEXT, email TEXT, role TEXT, token TEXT UNIQUE,
  status TEXT CHECK(status IN ('pending','accepted','revoked','expired')),
  expires_at INTEGER NOT NULL,                          -- 7 ngày
  created_by TEXT, created_at
)
```

### 2.2. Finance (xử lý toàn bộ lỗ hổng review)

**Nguyên tắc chốt:**
- **Số dư ví = tính từ ledger**, KHÔNG lưu số dư rời rạc có thể lệch. `Wallet.opening_balance_minor` là số dư đầu kỳ; số dư hiện tại = `opening_balance + Σ postings`.
- **Transfer = 1 Transaction cha + 2 posting** (nguồn −, đích +), cập nhật **nguyên tử trong 1 transaction DB**. Không dùng một `wallet_id` cho transfer.
- Dùng mô hình **ledger posting** để mọi loại (thu/chi/chuyển) đồng nhất và audit được.

```sql
Wallet(
  id TEXT PK, workspace_id TEXT NOT NULL,
  name TEXT NOT NULL, type TEXT,                         -- cash|bank|ewallet
  currency TEXT NOT NULL DEFAULT 'VND',
  opening_balance_minor INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  version, server_seq, created_by, created_at, updated_at, deleted_at
)

Category(
  id TEXT PK, workspace_id TEXT NOT NULL,
  name TEXT NOT NULL, kind TEXT CHECK(kind IN ('income','expense')) NOT NULL,
  parent_id TEXT REFERENCES Category(id),                -- tối đa 2 cấp (validate)
  icon TEXT, color TEXT, is_archived INTEGER DEFAULT 0,
  version, server_seq, created_by, created_at, updated_at, deleted_at,
  UNIQUE(workspace_id, parent_id, name)
)

Transaction(
  id TEXT PK, workspace_id TEXT NOT NULL,
  type TEXT CHECK(type IN ('income','expense','transfer')) NOT NULL,
  amount_minor INTEGER NOT NULL CHECK(amount_minor > 0),
  currency TEXT NOT NULL DEFAULT 'VND',
  category_id TEXT REFERENCES Category(id),              -- null với transfer
  occurred_on TEXT NOT NULL,                             -- 'YYYY-MM-DD' theo tz ws
  note TEXT, attachment_url TEXT,
  status TEXT CHECK(status IN ('cleared','pending')) NOT NULL DEFAULT 'cleared',
  linked_asset_id TEXT, linked_task_id TEXT, recurring_id TEXT,
  version, server_seq, created_by, created_at, updated_at, deleted_at
)
INDEX idx_txn_ws_date ON Transaction(workspace_id, occurred_on);

-- Ledger: mỗi transaction có 1 posting (income/expense) hoặc 2 (transfer)
Posting(
  id TEXT PK, transaction_id TEXT NOT NULL REFERENCES Transaction(id),
  wallet_id TEXT NOT NULL REFERENCES Wallet(id),
  delta_minor INTEGER NOT NULL,                          -- + vào ví, - ra ví
  created_at
)
INDEX idx_posting_wallet ON Posting(wallet_id);
-- Số dư ví = opening_balance_minor + SUM(delta_minor) WHERE txn.deleted_at IS NULL AND status='cleared'

Budget(
  id TEXT PK, workspace_id TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES Category(id),
  period_kind TEXT CHECK(period_kind IN ('calendar_month')) NOT NULL DEFAULT 'calendar_month',
  limit_minor INTEGER NOT NULL, threshold_pct INTEGER NOT NULL DEFAULT 80,
  version, server_seq, created_by, created_at, updated_at, deleted_at,
  UNIQUE(workspace_id, category_id, period_kind)
)

RecurringTransaction(
  id TEXT PK, workspace_id TEXT NOT NULL,
  template_type TEXT, template_amount_minor INTEGER, template_category_id TEXT,
  template_wallet_id TEXT, template_to_wallet_id TEXT, note TEXT,
  rrule TEXT NOT NULL, tz TEXT NOT NULL, next_run_on TEXT,
  auto_post INTEGER NOT NULL DEFAULT 0,                  -- 1: tự tạo txn; 0: chỉ nhắc, chờ xác nhận
  version, server_seq, created_by, created_at, updated_at, deleted_at
)
```

**Quy tắc Finance chốt:**

| Vấn đề review | Quy tắc |
|---|---|
| Transfer cần ví nguồn + đích + nguyên tử | 1 Transaction(type=transfer) + 2 Posting đối ứng, ghi trong **cùng 1 DB transaction** |
| Không dùng float cho tiền | `amount_minor`/`delta_minor` INTEGER, `currency` kèm exponent tra bảng |
| Wallet.balance là lưu hay tính? | **Tính từ ledger**; có cache tùy chọn nhưng nguồn sự thật là Σ posting |
| Số dư đầu kỳ | `Wallet.opening_balance_minor` |
| Sửa giao dịch cũ | Cho phép; cập nhật posting tương ứng, tăng `version`, ghi AuditLog; số dư tự tính lại |
| Giao dịch pending | `status='pending'` **không tính vào số dư cleared**; hiển thị riêng |
| Xóa giao dịch | Soft-delete (tombstone) → loại khỏi tổng số dư; giữ để đồng bộ & audit |
| Xóa category/wallet đang dùng | **RESTRICT** nếu còn transaction tham chiếu → chỉ cho **archive** (`is_archived=1`), không xóa cứng |
| Budget chu kỳ | MVP chỉ `calendar_month`; chu kỳ khác → P1 |

### 2.3. Tasks & Recurrence

```sql
Task(
  id TEXT PK, workspace_id TEXT NOT NULL,
  title TEXT NOT NULL, description TEXT,
  is_all_day INTEGER NOT NULL DEFAULT 1,
  due_on TEXT, due_time TEXT,                            -- 'YYYY-MM-DD' / 'HH:MM' theo tz
  tz TEXT NOT NULL,
  priority TEXT CHECK(priority IN ('low','normal','high')) DEFAULT 'normal',
  status TEXT CHECK(status IN ('open','done','cancelled')) DEFAULT 'open',
  project_id TEXT REFERENCES Project(id),
  assignee_id TEXT REFERENCES User(id),
  rrule TEXT,                                            -- null = việc một lần
  source_type TEXT, source_id TEXT,                      -- vd 'maintenance_plan' để truy nguồn
  version, server_seq, created_by, created_at, updated_at, deleted_at
)

TaskOccurrence(
  id TEXT PK, task_id TEXT NOT NULL REFERENCES Task(id) ON DELETE CASCADE,
  occurrence_date_local TEXT NOT NULL,                   -- ngày dự kiến gốc (định danh)
  status TEXT CHECK(status IN ('open','done','skipped','moved')) DEFAULT 'open',
  moved_to TEXT, done_at INTEGER, done_by TEXT,
  version, server_seq, created_at, updated_at,
  UNIQUE(task_id, occurrence_date_local)                 -- chống trùng khi Cron retry
)

Subtask(id TEXT PK, task_id TEXT REFERENCES Task(id) ON DELETE CASCADE,
        title TEXT, done INTEGER DEFAULT 0, sort INTEGER)
Project(id TEXT PK, workspace_id TEXT, name TEXT, view TEXT DEFAULT 'list',
        version, server_seq, created_by, created_at, updated_at, deleted_at)
```

### 2.4. Assets & Maintenance

```sql
Asset(
  id TEXT PK, workspace_id TEXT NOT NULL,
  name TEXT NOT NULL, category TEXT, image_url TEXT, serial TEXT, location TEXT,
  status TEXT CHECK(status IN ('available','in_use','repair','retired')) DEFAULT 'available',
  value_minor INTEGER, currency TEXT DEFAULT 'VND',
  purchase_date TEXT, warranty_until TEXT, expiry_date TEXT,
  owner_user_id TEXT REFERENCES User(id),                -- người phụ trách (nhận reminder)
  version, server_seq, created_by, created_at, updated_at, deleted_at
)

MaintenancePlan(
  id TEXT PK, asset_id TEXT NOT NULL REFERENCES Asset(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL,
  type TEXT,                                             -- thanh_toan|thay_nhot|thay_pin|sua_chua|kiem_dinh|het_han
  interval_time_value INTEGER, interval_time_unit TEXT,  -- vd 3 'thang' (nullable)
  interval_usage_value INTEGER, usage_unit TEXT,         -- vd 5000 'km' (nullable) -> "cái nào tới trước"
  last_done_date TEXT, last_done_usage INTEGER,
  next_due_date TEXT, next_due_usage INTEGER,
  cost_estimate_minor INTEGER,
  version, server_seq, created_by, created_at, updated_at, deleted_at,
  CHECK(interval_time_value IS NOT NULL OR interval_usage_value IS NOT NULL)
)

UsageLog(id TEXT PK, asset_id TEXT REFERENCES Asset(id) ON DELETE CASCADE,
         value INTEGER, unit TEXT, logged_at INTEGER, created_by)
MaintenanceHistory(id TEXT PK, asset_id TEXT, plan_id TEXT REFERENCES MaintenancePlan(id),
         done_at INTEGER, at_usage INTEGER, cost_minor INTEGER, note TEXT,
         transaction_id TEXT REFERENCES Transaction(id))   -- link chi phí (nullable)
AssetLoan(id TEXT PK, asset_id TEXT, borrower_user_id TEXT, borrower_name TEXT,
         borrowed_at INTEGER, due_at INTEGER, returned_at INTEGER,
         status TEXT CHECK(status IN ('out','returned','overdue')))
AssetDocument(id TEXT PK, asset_id TEXT, type TEXT, file_url TEXT, created_at)
Consumable(id TEXT PK, workspace_id TEXT, name TEXT, quantity INTEGER, unit TEXT,
         min_threshold INTEGER)
```

**Ownership Asset→Maintenance→Task (chốt, gỡ câu hỏi review):**
- **Nguồn sự thật của lịch bảo trì = `MaintenancePlan`.** Task chỉ là "hiển thị/hành động" cho một lần đến hạn (occurrence), gắn `source_type='maintenance_plan', source_id=plan.id`.
- Sửa chu kỳ trong Plan → **tự tính lại `next_due_*`**; các task-occurrence chưa tới hạn của plan được **sinh lại theo mốc mới** (occurrence đã done giữ nguyên).
- **Xóa Asset** → CASCADE Plan/UsageLog; **giữ `MaintenanceHistory`** (đổi thành soft reference) để lưu vết chi phí đã phát sinh; task gắn với plan bị đóng (`cancelled`).
- **Hoàn thành bảo trì bằng tay:** đóng occurrence hiện tại → ghi `MaintenanceHistory` → cập nhật `last_done_date/usage` → tính `next_due_*`.
- **Tạo Transaction sau bảo trì = phải xác nhận (không tự động).** Hiện hộp "Ghi chi phí X vào ví…?"; user xác nhận mới tạo txn và link vào history.

### 2.5. Notifications (theo file 03 §C)

```sql
ReminderPolicy(
  id TEXT PK, workspace_id TEXT, source_type TEXT, source_id TEXT,
  offsets_json TEXT NOT NULL,                            -- vd '[-7,-1,0]' (ngày)
  channels_json TEXT,                                    -- ưu tiên: ['push','email','telegram']
  urgent INTEGER DEFAULT 0,
  escalate_every_hours INTEGER DEFAULT 24, escalate_max INTEGER DEFAULT 3,
  created_at, updated_at
)
ReminderDelivery(
  id TEXT PK, workspace_id TEXT, source_type TEXT, source_id TEXT,
  occurrence_key TEXT, offset_days INTEGER, recipient_user_id TEXT,
  channel TEXT, remind_at INTEGER,
  status TEXT CHECK(status IN
    ('scheduled','deferred','sending','sent','failed','fallback_channel','acknowledged','cancelled','suppressed')),
  provider_msg_id TEXT, attempt INTEGER DEFAULT 0,
  created_at, updated_at,
  UNIQUE(source_type, source_id, occurrence_key, offset_days, channel)   -- idempotency
)
UserChannel(id TEXT PK, user_id TEXT, channel TEXT, address TEXT,
         verified INTEGER DEFAULT 0, is_default INTEGER DEFAULT 0,
         UNIQUE(user_id, channel))
NotificationPref(id TEXT PK, user_id TEXT, event_type TEXT, channel TEXT,
         quiet_start TEXT DEFAULT '22:00', quiet_end TEXT DEFAULT '07:00')
NotificationLog(id TEXT PK, delivery_id TEXT, channel TEXT, status TEXT,
         provider_msg_id TEXT, error TEXT, sent_at INTEGER)
AuditLog(id TEXT PK, workspace_id TEXT, actor_user_id TEXT, action TEXT,
         entity_type TEXT, entity_id TEXT, before_json TEXT, after_json TEXT, at INTEGER)
```

### 2.6. Daily
```sql
Habit(id TEXT PK, workspace_id TEXT, user_id TEXT NOT NULL, name TEXT,
      rrule TEXT, target INTEGER, version, server_seq, created_at, updated_at, deleted_at)
HabitLog(id TEXT PK, habit_id TEXT REFERENCES Habit(id) ON DELETE CASCADE,
      date TEXT, done INTEGER, UNIQUE(habit_id, date))
Note(id TEXT PK, workspace_id TEXT, user_id TEXT, is_shared INTEGER DEFAULT 0,
      content TEXT, attachments_json TEXT, tags_json TEXT,
      version, server_seq, created_at, updated_at, deleted_at)
```

### 2.7. Chỉ mục quan trọng (tối thiểu)
`Membership(workspace_id, user_id)`, `Transaction(workspace_id, occurred_on)`, `Posting(wallet_id)`, `Task(workspace_id, due_on)`, `TaskOccurrence(task_id, occurrence_date_local)`, `ReminderDelivery(status, remind_at)`, `Asset(workspace_id)`, `MaintenancePlan(next_due_date)`, mọi bảng dữ liệu index `(workspace_id, server_seq)` cho sync.

---

## PHẦN 3 — USER STORIES & ACCEPTANCE CRITERIA (P0)

Định dạng: **US** (story) + **AC** (Gherkin-lite: Given/When/Then). Đây là mẫu cho các feature rủi ro cao; các feature còn lại tuân theo cùng khuôn.

### US-FN1 — Ghi một khoản chi
> Là một thành viên, tôi muốn ghi nhanh một khoản chi để theo dõi chi tiêu.

**Trường bắt buộc:** `amount_minor > 0`, `type`, `wallet`, `occurred_on`. Tùy chọn: category, note, ảnh.
**Validation:** số tiền là integer > 0; ngày ≤ hôm nay + cho phép quá khứ; ảnh ≤ 10MB, định dạng jpg/png/webp/heic/pdf.
**AC:**
- Given tôi là Member, When lưu khoản chi hợp lệ, Then tạo Transaction(type=expense) + 1 Posting(delta<0) trong 1 DB txn, và số dư ví giảm đúng số tiền.
- Given thiếu số tiền hoặc số tiền ≤ 0, When lưu, Then chặn + hiện lỗi trường, không tạo bản ghi.
- Given tôi offline, When lưu, Then bản ghi hiện ngay (optimistic) với cờ "chờ đồng bộ"; khi online tự đẩy đúng 1 lần (idempotency key).
- Given tôi là Viewer, Then không thấy nút tạo và API trả 403.
- Given tôi sửa số tiền của khoản do tôi tạo, Then số dư tính lại; ghi AuditLog. Sửa khoản người khác tạo (không phải Admin) → 403.
- Error states: 400 validation, 403 quyền, 409 version conflict, 413 file quá lớn.

### US-FN1b — Chuyển khoản giữa 2 ví
**AC:**
- Given ví nguồn ≠ ví đích cùng currency, When chuyển X, Then tạo 1 Transaction(transfer) + 2 Posting (−X nguồn, +X đích) nguyên tử; nếu 1 bước lỗi → rollback toàn bộ.
- Given ví nguồn = ví đích, Then chặn.
- Số dư 2 ví thay đổi đúng; báo cáo chi tiêu **không** tính transfer là chi.

### US-FN5 — Hóa đơn định kỳ (nguồn của nhắc thanh toán)
**AC:**
- Given tôi tạo recurring "tiền điện, mỗi tháng ngày 5, nhắc trước 3 ngày", When tới mốc, Then hệ sinh ReminderDelivery đúng lịch theo tz workspace.
- Given `auto_post=0`, When tới ngày, Then chỉ nhắc + tạo "khoản chờ xác nhận"; user xác nhận mới thành Transaction.
- Given `auto_post=1`, Then tự tạo Transaction vào ngày dự kiến, gắn `recurring_id`.
- Case ngày 31 tháng thiếu ngày → theo §A.4 (clamp cuối tháng).

### US-TK2 — Việc lặp lại
**AC:**
- Given rule "mỗi thứ 2,4,6", When xem tuần, Then hiển thị occurrence đúng các ngày, mỗi occurrence tick độc lập.
- Given tôi tick 1 occurrence trên 2 thiết bị, Then trạng thái `done` idempotent, không nhân đôi (UNIQUE task_id+date).
- Given tôi sửa rule chọn "lần này trở đi", Then rule cũ kết thúc trước occurrence này, rule mới bắt đầu từ đây (§A.6); occurrence quá khứ giữ nguyên.
- Given tôi dời 1 occurrence, Then chỉ occurrence đó đổi ngày; occurrence kế tiếp không đổi.

### US-RM1 — Nhắc tới hạn (đa mốc + escalation)
**AC:**
- Given policy offsets [−7,−1,0], When tới từng mốc theo tz người nhận, Then gửi qua kênh mặc định; nếu quiet hours → defer tới đầu giờ.
- Given Cron/Queue retry, Then mỗi (source,occurrence,offset,channel) gửi **đúng 1 lần** (UNIQUE + compare-and-set).
- Given kênh chính không xác nhận trong 15 phút, Then chuyển kênh dự phòng.
- Given mục quá hạn chưa acknowledged, Then nhắc lại mỗi 24h, tối đa 3 lần, rồi `suppressed`.
- Given tôi hoàn thành/hủy mục trước khi gửi, Then delivery chưa gửi → `cancelled`.
- Given tôi đổi due date, Then hủy delivery cũ, sinh lại theo hạn mới.

### US-AS4 — Bảo trì "3 tháng HOẶC 5.000 km"
**AC:**
- Given plan có cả interval_time=3 tháng và interval_usage=5000 km, When điều kiện nào tới trước, Then sinh occurrence/nhắc.
- Given tôi ghi UsageLog vượt `last_done_usage + 5000`, Then đánh dấu đến hạn dù chưa đủ 3 tháng.
- Given tôi hoàn thành bảo trì, Then ghi MaintenanceHistory, cập nhật last_done_*, tính next_due_*; hiện hộp xác nhận ghi chi phí (không tự tạo txn).

### US-RBAC — Kiểm quyền (đại diện)
**AC:**
- Given tôi là Member, When gọi API sửa giao dịch người khác, Then 403.
- Given tôi bị gỡ khỏi workspace khi có mutation offline, When đồng bộ, Then server trả 403, mutation không áp dụng, client báo "không còn quyền".
- Given tôi là Viewer, When gọi export, Then 403; When tải file đính kèm, Then 200.

### US-SYNC — Đồng bộ offline (đại diện)
**AC:**
- Given 2 thiết bị sửa cùng field 1 giao dịch offline, When cả hai đồng bộ, Then bản ghi cuối theo `updated_at` thắng; thiết bị thua nhận thông báo "đã có thay đổi mới".
- Given thiết bị A xóa, thiết bị B sửa cùng bản ghi, When đồng bộ, Then delete thắng; sửa của B vào mục "không áp dụng được".
- Given client gửi lại cùng mutation, Then áp dụng đúng 1 lần.

---

## PHẦN 4 — Thứ tự migration đề xuất
1. Core (User/Workspace/Membership/Invitation) + AuditLog + cột sync chung.
2. Finance (Wallet/Category/Transaction/Posting/Budget/Recurring).
3. Tasks (Task/TaskOccurrence/Subtask/Project).
4. Assets (Asset/MaintenancePlan/UsageLog/History/Loan/Document/Consumable).
5. Notifications (ReminderPolicy/Delivery/UserChannel/Pref/Log).
6. Daily (Habit/HabitLog/Note).

> Khóa schema chỉ sau khi 3 spike ở file 03 §D pass. Bất kỳ thay đổi nào ở Posting/Occurrence/ReminderDelivery đều tốn kém về sau — ưu tiên chốt đúng ba bảng này.
