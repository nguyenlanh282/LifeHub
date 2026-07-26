# 03 — Đặc tả 3 luồng khó

**Dự án:** LifeHub · **Kèm theo:** PRD-LifeHub.md · **Ngày:** 26/07/2026

Ba luồng dưới đây là **đường găng kỹ thuật** và là nguồn rủi ro phải sửa DB/API nếu chốt muộn: (A) Recurrence/RRULE, (B) Offline sync, (C) Reminder delivery. Nên **spike cả ba trước khi khóa schema D1**.

---

## A. RECURRENCE / RRULE & Thời gian

### A.1. Timezone (chốt)
- **Mỗi workspace có `timezone` mặc định** (vd `Asia/Ho_Chi_Minh`), đặt khi tạo. **Mỗi user có `timezone` tùy chọn**; nếu trống → dùng timezone workspace.
- **Lưu trữ:** mọi timestamp tuyệt đối lưu **UTC** (epoch ms). Riêng RRULE và "ngày tới hạn" lưu kèm **timezone gốc** để tính occurrence đúng theo lịch địa phương.
- **Tính occurrence** luôn thực hiện trong timezone của rule, rồi quy đổi ra UTC để so với "bây giờ".

### A.2. All-day vs timed
- Task/occurrence có cờ `is_all_day`.
- **All-day:** neo theo **ngày địa phương** (không có giờ). "Đến hạn" = 00:00 ngày đó theo tz; reminder mặc định gửi vào **giờ nhắc chuẩn của workspace** (mặc định 08:00 local) thay vì nửa đêm.
- **Timed:** có `due_time` cụ thể trong tz; reminder theo offset so với thời điểm đó.

### A.3. Quy tắc RRULE hỗ trợ ở MVP
Dựa trên iCal RFC 5545 nhưng **giới hạn tập** để kiểm soát độ phức tạp:
- FREQ: DAILY, WEEKLY, MONTHLY, YEARLY.
- INTERVAL (mỗi N đơn vị).
- BYDAY cho WEEKLY (vd thứ 2,4,6).
- BYMONTHDAY cho MONTHLY (vd ngày 15) **hoặc** BYDAY+BYSETPOS (vd "thứ 6 tuần cuối").
- Kết thúc: COUNT (sau N lần) **hoặc** UNTIL (đến ngày). Không đặt cả hai.
- **Không hỗ trợ ở MVP:** BYYEARDAY, BYWEEKNO, nhiều BYxxx lồng phức tạp → validate loại bỏ khi tạo.

### A.4. Xử lý ngày biên (chốt từng case)

| Tình huống | Quy tắc |
|---|---|
| Lặp **ngày 31** vào tháng không có 31 (vd tháng 2) | **Trượt về ngày cuối tháng** (28/29/30). Không nhảy sang tháng sau. (chế độ "clamp to last day") |
| Lặp ngày 30 vào tháng 2 | Trượt về 28/29 |
| 29/02 với rule YEARLY | Năm không nhuận → **28/02** |
| "Mỗi tháng" tính mốc kế | **Tính từ ngày DỰ KIẾN (scheduled), không phải ngày hoàn thành.** Đảm bảo lịch không trôi. (Riêng bảo trì theo usage xem §A.7) |

### A.5. Occurrence: định danh & uniqueness (chốt)
- **Không materialize** toàn bộ occurrence. Sinh theo cửa sổ đang xem + một cửa sổ đệm phía trước (vd +90 ngày) cho Cron reminder.
- Khi một occurrence cần trạng thái riêng (done/skip/move) hoặc có reminder → **materialize thành 1 dòng `TaskOccurrence`**.
- **Occurrence identity ổn định:** khóa tự nhiên `(task_id, occurrence_date_local)` — `occurrence_date_local` là ngày dự kiến gốc trong tz của rule (kể cả khi bị dời). **UNIQUE(task_id, occurrence_date_local)** ⇒ chống trùng khi Cron/job retry.
- Dời (move) một occurrence: cập nhật `moved_to` (ngày mới) **nhưng giữ nguyên `occurrence_date_local`** làm định danh. **Occurrence kế tiếp KHÔNG đổi** — chỉ occurrence bị dời thay đổi (dời rời rạc, không ảnh hưởng chuỗi).

### A.6. Sửa rule: this / this-and-future / all (chốt)
Chuẩn theo mô hình lịch phổ biến:

| Lựa chọn | Hành vi |
|---|---|
| **Chỉ lần này** | Tạo override cho đúng occurrence đó (giống move/edit rời); rule gốc không đổi |
| **Lần này trở đi** | **Kết thúc rule cũ** tại `UNTIL = trước occurrence này` và **tạo rule mới** bắt đầu từ occurrence này với thay đổi. Occurrence đã hoàn thành trong quá khứ giữ nguyên |
| **Tất cả** | Sửa trực tiếp rule gốc; occurrence override đã tạo trước đó **được giữ** trừ khi user chọn reset |

### A.7. Bảo trì theo usage (km/giờ) song song thời gian
- MaintenancePlan có thể có **cả** `interval_time` và `interval_usage`. Điều kiện kích hoạt: **"cái nào tới trước"**.
- Mốc thời gian tính như RRULE. Mốc usage: khi `UsageLog` mới nhất ≥ `last_done_usage + interval_usage` → đến hạn.
- Nhắc "gần tới" theo usage cần **ước lượng tốc độ tiêu thụ** (vd km/tuần trung bình 30 ngày gần nhất) để cảnh báo trước — nếu chưa đủ dữ liệu, chỉ cảnh báo khi đã vượt mốc.

### A.8. DST & đổi timezone
- VN không có DST nên rủi ro thấp, nhưng engine vẫn xử lý tổng quát: tính occurrence bằng thư viện lịch theo tz (giữ "giờ tường" — vd 08:00 local luôn là 08:00 dù offset đổi).
- User đổi timezone: occurrence **tương lai** tính lại theo tz mới; occurrence đã sinh/đã gửi reminder **không hồi tố**.

### A.9. Chống trùng khi job retry
- Sinh occurrence & reminder là **idempotent** nhờ UNIQUE key ở §A.5 và §C.4. Job dùng `INSERT ... ON CONFLICT DO NOTHING`.

---

## B. OFFLINE SYNC

### B.1. Mô hình tổng thể (chốt)
Kết hợp **optimistic local write + outbox + server reconciliation**:
- Mỗi mutation client tạo được ghi vào **outbox** local (IndexedDB) kèm `client_mutation_id` (UUID) trước khi gửi.
- Client giữ **sync cursor** (server sequence cuối cùng đã nhận). Khi online: (1) đẩy outbox, (2) kéo thay đổi > cursor.
- Server là **nguồn sự thật cuối**; client hòa giải theo phản hồi.

### B.2. Trường bắt buộc thêm vào MỌI bảng dữ liệu (chốt schema)

| Trường | Ý nghĩa |
|---|---|
| `id` (UUIDv7) | Sinh ở client, ổn định khi offline (tránh chờ server cấp ID) |
| `version` (int) | Optimistic concurrency; server tăng mỗi lần update |
| `updated_at` (UTC ms) | Mốc so sánh phụ |
| `deleted_at` (nullable) | **Tombstone** — soft delete, không xóa cứng ngay (để đồng bộ được lệnh xóa) |
| `server_seq` (bigint) | Sequence tăng dần toàn workspace, phục vụ sync cursor |
| `created_by` | Chủ sở hữu (dùng cho RBAC & conflict) |

Bảng phụ **`MutationLog`**: `client_mutation_id (UNIQUE)`, `user_id`, `workspace_id`, `entity`, `op`, `applied_at`, `result`.

### B.3. Idempotency (chống trùng khi client gửi lại)
- Server **UNIQUE `client_mutation_id`**. Nếu mutation đã áp dụng → trả lại **kết quả cũ**, không áp dụng lần hai. ⇒ Giải quyết "client gửi lại mutation sau khi mất mạng gây tạo trùng giao dịch".

### B.4. Quy tắc conflict theo loại thao tác (chốt)

| Tình huống | Quy tắc |
|---|---|
| **Hai thiết bị cùng sửa 1 bản ghi** | Optimistic concurrency: update kèm `expected_version`. Server nhận version khớp → áp dụng, tăng version. Không khớp → **409 Conflict**, trả bản ghi hiện tại; client hòa giải: **field-level merge** nếu sửa field khác nhau; nếu cùng field → **last-write-wins theo `updated_at`** + hiện thông báo "đã có thay đổi mới" |
| **Xóa trong khi thiết bị khác đang sửa** | **Delete thắng** (tombstone). Update tới sau bản ghi đã tombstone → bị bỏ qua, client nhận thông báo "bản ghi đã bị xóa", đưa mutation vào mục "không áp dụng được" cho user xem lại |
| **Client gửi lại mutation (mạng chập chờn)** | Idempotency key (§B.3) đảm bảo áp dụng đúng 1 lần |
| **Tick 1 occurrence task trên 2 thiết bị** | Trạng thái occurrence là **set-once idempotent**: cùng chuyển sang `done` → kết quả như nhau, không nhân đôi. Ghi theo `(task_id, occurrence_date_local)` UNIQUE |
| **Thành viên mất quyền khi còn mutation offline** | Server kiểm RBAC tại thời điểm áp dụng. Mất quyền ⇒ **403**, mutation không áp dụng; client đánh dấu "không thể đồng bộ" và không mất dữ liệu gốc trên server |
| **File upload đang chờ nhưng bản ghi đã bị xóa** | Upload dùng **2 pha**: xin `signed URL` → upload R2 → gắn `attachment` vào bản ghi. Nếu bản ghi đã tombstone khi gắn → hủy gắn, **đánh dấu blob orphan**; job dọn R2 định kỳ xóa blob orphan quá 24h |

### B.5. Thứ tự áp dụng & phụ thuộc
- Outbox áp dụng **theo thứ tự tạo (FIFO)** trên mỗi client. Mutation phụ thuộc (vd tạo transaction tham chiếu wallet mới tạo offline) dùng **cùng `id` UUID sinh sẵn ở client** ⇒ không cần chờ server cấp ID, quan hệ giữ nguyên.

### B.6. Sync cursor & phân trang thay đổi
- Pull: `GET /sync?workspace=&since=<server_seq>&limit=` trả các bản ghi có `server_seq > since` (gồm tombstone), sắp tăng dần. Client cập nhật cursor = `server_seq` lớn nhất nhận được. Cursor-based, idempotent, an toàn khi lặp.

### B.7. Realtime kết hợp
- Khi online, **Durable Object** của workspace phát sự kiện `changed(server_seq)` để client pull ngay (thay vì đợi polling). Offline/không có WS → fallback pull định kỳ khi mở app hoặc kéo-làm-mới.

---

## C. REMINDER DELIVERY — State machine

### C.1. Hai tầng khái niệm (sửa mô hình `ReminderOffset` chưa hợp lý)
- **ReminderPolicy** (thuộc thực thể: task/recurring/maintenance/warranty): định nghĩa **danh sách offset** (vd −7d, −1d, 0) + kênh ưu tiên + escalation. Đây là "template".
- **ReminderDelivery** (mỗi lần gửi cụ thể): sinh ra từ policy cho một occurrence/mốc, là **một job có trạng thái riêng**. ⇒ offset thuộc policy; mỗi delivery là job độc lập.

### C.2. Ai nhận reminder (chốt)
| Loại dữ liệu | Người nhận |
|---|---|
| Task có assignee | **Assignee** (nếu không có → người tạo) |
| Task không assignee (việc chung) | Người tạo + tùy chọn "nhắc cả workspace" |
| Recurring payment / hóa đơn | Người tạo recurring (mặc định), có thể chỉ định người nhận |
| Maintenance/warranty của Asset | **Người phụ trách asset** nếu có, else Admin/Owner của workspace |
| Mượn quá hạn | Người mượn + Admin |

### C.3. State machine của một ReminderDelivery
```
scheduled ──(đến remind_at)──▶ sending ──(gửi OK)──▶ sent ──(user xử lý)──▶ acknowledged
    │                              │
    │                              └─(lỗi)─▶ failed ──(retry/backoff)──▶ sending
    │                                                   └─(hết retry)─▶ fallback_channel ─▶ sending
    ├─(mục nguồn hoàn thành/hủy trước khi gửi)─▶ cancelled
    └─(trong quiet hours)─▶ deferred ──(qua quiet hours)──▶ sending
```
Trạng thái: `scheduled, deferred, sending, sent, failed, fallback_channel, acknowledged, cancelled, suppressed`.

### C.4. Chống gửi trùng (Cron/Queue retry) — chốt
- Mỗi delivery có khóa **UNIQUE `(source_type, source_id, occurrence_key, offset, channel)`**.
- Consumer dùng **idempotency**: trước khi gửi, chuyển `scheduled→sending` bằng compare-and-set; chỉ 1 worker thắng. Gửi xong lưu `provider_msg_id`.
- Queue "at-least-once" ⇒ luôn kiểm trạng thái trước khi gọi provider; đã `sent` thì bỏ qua.

### C.5. Fallback kênh & escalation (chốt tham số)
- Thứ tự kênh: dùng **kênh mặc định của người nhận**; nếu provider trả lỗi cứng hoặc không xác nhận trong **15 phút** → chuyển **kênh dự phòng** kế tiếp trong cấu hình user.
- **Escalation** (khi mục vẫn chưa `acknowledged` và đã quá hạn): nhắc lại mỗi **24h**, **tối đa 3 lần**, sau đó chuyển trạng thái `suppressed` và chỉ hiển thị trên Dashboard (ngừng đẩy).
- Web Push không có xác nhận gửi đáng tin trên iOS ⇒ với mục quan trọng, **luôn kèm Email** làm kênh nền.

### C.6. Quiet hours & timezone người nhận (chốt)
- Mỗi user đặt **quiet hours** (mặc định 22:00–07:00 theo tz user). Delivery rơi vào quiet hours → `deferred` tới đầu giờ cho phép. **Ngoại lệ:** mục người dùng đánh dấu "khẩn" bỏ qua quiet hours.
- Mọi tính giờ gửi theo **tz người nhận**, không theo tz server.

### C.7. Thay đổi hạn / hoàn thành ảnh hưởng reminder (chốt)
| Sự kiện | Hành vi reminder |
|---|---|
| Đổi due date của task | Hủy các delivery `scheduled/deferred` cũ, **sinh lại** theo hạn mới. Delivery đã `sent` giữ nguyên lịch sử |
| Hoàn thành mục trước hạn | Tất cả delivery chưa gửi → `cancelled` |
| Hoàn thành **trễ** một recurring/maintenance | Occurrence hiện tại đóng; **occurrence kế tiếp tính từ ngày DỰ KIẾN gốc** (không dồn theo ngày hoàn thành trễ) — trừ maintenance theo usage thì tính từ `last_done_usage`. (Đồng bộ với §A.4) |
| Hủy/xóa mục nguồn | Mọi delivery liên quan → `cancelled` |

### C.8. Ghi log & quan sát
- `NotificationLog(delivery_id, channel, status, provider_msg_id, error, sent_at)` cho mọi lần gọi provider. Dùng để đối soát, retry, và thống kê "tỷ lệ reminder hoàn thành đúng hạn" (metric §7 PRD).

---

## D. Việc cần spike trước khi khóa schema (khuyến nghị)
1. RRULE library trên Workers (edge runtime) + sinh occurrence + override — kiểm case ngày 31/DST.
2. Outbox + idempotency + conflict 409 với 2 client giả lập offline.
3. Cron→Queue→consumer reminder với idempotency và quiet-hours defer.
