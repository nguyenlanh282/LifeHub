-- Initial Seed Data for LifeHub

-- 1. Create Default User & Workspace
INSERT OR IGNORE INTO `users` (`id`, `email`, `email_verified`, `name`, `timezone`, `created_at`, `updated_at`)
VALUES ('usr_lanh_01', 'lanh@lifehub.vn', 1, 'Lành Guru', 'Asia/Ho_Chi_Minh', 1722000000000, 1722000000000);

INSERT OR IGNORE INTO `workspaces` (`id`, `name`, `type`, `owner_id`, `timezone`, `base_currency`, `reminder_hour_local`, `created_at`, `updated_at`)
VALUES ('ws_personal_01', 'Gia Đình Lành', 'personal', 'usr_lanh_01', 'Asia/Ho_Chi_Minh', 'VND', 8, 1722000000000, 1722000000000);

INSERT OR IGNORE INTO `memberships` (`id`, `user_id`, `workspace_id`, `role`, `created_at`, `updated_at`)
VALUES ('mem_01', 'usr_lanh_01', 'ws_personal_01', 'owner', 1722000000000, 1722000000000);

-- 2. Finance: Wallets & Categories
INSERT OR IGNORE INTO `wallets` (`id`, `workspace_id`, `name`, `type`, `currency`, `opening_balance_minor`, `created_by`, `created_at`, `updated_at`)
VALUES 
  ('wal_cash', 'ws_personal_01', 'Ví Tiền Mặt', 'cash', 'VND', 2500000, 'usr_lanh_01', 1722000000000, 1722000000000),
  ('wal_techcom', 'ws_personal_01', 'Ví Techcombank', 'bank', 'VND', 15400000, 'usr_lanh_01', 1722000000000, 1722000000000);

INSERT OR IGNORE INTO `categories` (`id`, `workspace_id`, `name`, `kind`, `icon`, `color`, `created_by`, `created_at`, `updated_at`)
VALUES 
  ('cat_food', 'ws_personal_01', 'Ăn uống', 'expense', 'utensils', '#f59e0b', 'usr_lanh_01', 1722000000000, 1722000000000),
  ('cat_bills', 'ws_personal_01', 'Hóa đơn & Tiện ích', 'expense', 'zap', '#ef4444', 'usr_lanh_01', 1722000000000, 1722000000000),
  ('cat_salary', 'ws_personal_01', 'Lương & Thu nhập', 'income', 'briefcase', '#10b981', 'usr_lanh_01', 1722000000000, 1722000000000);

-- 3. Finance: Initial Transactions & Postings
INSERT OR IGNORE INTO `transactions` (`id`, `workspace_id`, `type`, `amount_minor`, `currency`, `category_id`, `occurred_on`, `note`, `status`, `created_by`, `created_at`, `updated_at`)
VALUES 
  ('txn_01', 'ws_personal_01', 'expense', 150000, 'VND', 'cat_food', '2026-07-26', 'Ăn tối cùng gia đình', 'cleared', 'usr_lanh_01', 1722000000000, 1722000000000);

INSERT OR IGNORE INTO `postings` (`id`, `transaction_id`, `wallet_id`, `delta_minor`, `created_at`)
VALUES ('post_01', 'txn_01', 'wal_cash', -150000, 1722000000000);

-- 4. Tasks: Single & Recurring Tasks
INSERT OR IGNORE INTO `tasks` (`id`, `workspace_id`, `title`, `description`, `priority`, `status`, `due_on`, `tz`, `assignee_id`, `rrule`, `created_by`, `created_at`, `updated_at`)
VALUES 
  ('tsk_electricity', 'ws_personal_01', 'Đóng tiền điện tháng 7', 'Thanh toán qua Momo/EVN', 'high', 'open', '2026-07-26', 'Asia/Ho_Chi_Minh', 'usr_lanh_01', 'FREQ=MONTHLY;BYMONTHDAY=25', 'usr_lanh_01', 1722000000000, 1722000000000),
  ('tsk_ac_service', 'ws_personal_01', 'Vệ sinh máy lạnh phòng khách', 'Gọi thợ kiểm tra gas & rửa lưới lọc', 'normal', 'open', '2026-08-01', 'Asia/Ho_Chi_Minh', 'usr_lanh_01', NULL, 'usr_lanh_01', 1722000000000, 1722000000000);

-- 5. Assets & Maintenance Plans
INSERT OR IGNORE INTO `assets` (`id`, `workspace_id`, `name`, `category`, `serial`, `location`, `status`, `value_minor`, `warranty_until`, `owner_user_id`, `created_by`, `created_at`, `updated_at`)
VALUES 
  ('ast_sh125', 'ws_personal_01', 'Xe Honda SH 125i', 'Phương tiện', 'VN-SH-88899', 'Nhà riêng', 'available', 85000000, '2027-12-31', 'usr_lanh_01', 'usr_lanh_01', 1722000000000, 1722000000000),
  ('ast_purifier', 'ws_personal_01', 'Máy lọc nước Karofi 9 lõi', 'Gia dụng', 'KR-990-2024', 'Phòng bếp', 'in_use', 7500000, '2026-10-15', 'usr_lanh_01', 'usr_lanh_01', 1722000000000, 1722000000000);

INSERT OR IGNORE INTO `maintenance_plans` (`id`, `asset_id`, `workspace_id`, `type`, `interval_time_value`, `interval_time_unit`, `interval_usage_value`, `usage_unit`, `next_due_date`, `cost_estimate_minor`, `created_by`, `created_at`, `updated_at`)
VALUES 
  ('mn_sh_oil', 'ast_sh125', 'ws_personal_01', 'thay_nhot', 3, 'thang', 3000, 'km', '2026-08-05', 180000, 'usr_lanh_01', 1722000000000, 1722000000000),
  ('mn_purifier_filter', 'ast_purifier', 'ws_personal_01', 'sua_chua', 6, 'thang', NULL, NULL, '2026-08-15', 120000, 'usr_lanh_01', 1722000000000, 1722000000000);
