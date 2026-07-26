-- Initial Schema Migration for Cloudflare D1 (SQLite)

-- Core Tables
CREATE TABLE IF NOT EXISTS `users` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `email` TEXT NOT NULL UNIQUE,
  `email_verified` INTEGER NOT NULL DEFAULT 0,
  `name` TEXT,
  `avatar_url` TEXT,
  `timezone` TEXT,
  `password_hash` TEXT,
  `oauth_google_sub` TEXT UNIQUE,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `deleted_at` INTEGER
);

CREATE TABLE IF NOT EXISTS `workspaces` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `name` TEXT NOT NULL,
  `type` TEXT NOT NULL DEFAULT 'personal',
  `owner_id` TEXT NOT NULL REFERENCES `users`(`id`),
  `timezone` TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  `base_currency` TEXT NOT NULL DEFAULT 'VND',
  `reminder_hour_local` INTEGER NOT NULL DEFAULT 8,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `deleted_at` INTEGER
);

CREATE TABLE IF NOT EXISTS `memberships` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `user_id` TEXT NOT NULL REFERENCES `users`(`id`),
  `workspace_id` TEXT NOT NULL REFERENCES `workspaces`(`id`),
  `role` TEXT NOT NULL,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `deleted_at` INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_membership_user_ws` ON `memberships` (`user_id`, `workspace_id`);
CREATE INDEX IF NOT EXISTS `idx_membership_ws` ON `memberships` (`workspace_id`);

CREATE TABLE IF NOT EXISTS `invitations` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `workspace_id` TEXT NOT NULL REFERENCES `workspaces`(`id`),
  `email` TEXT NOT NULL,
  `role` TEXT NOT NULL,
  `token` TEXT NOT NULL UNIQUE,
  `status` TEXT NOT NULL DEFAULT 'pending',
  `expires_at` INTEGER NOT NULL,
  `created_by` TEXT NOT NULL,
  `created_at` INTEGER NOT NULL
);

-- Finance Tables
CREATE TABLE IF NOT EXISTS `wallets` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `workspace_id` TEXT NOT NULL REFERENCES `workspaces`(`id`),
  `name` TEXT NOT NULL,
  `type` TEXT NOT NULL,
  `currency` TEXT NOT NULL DEFAULT 'VND',
  `opening_balance_minor` INTEGER NOT NULL DEFAULT 0,
  `is_archived` INTEGER NOT NULL DEFAULT 0,
  `version` INTEGER NOT NULL DEFAULT 1,
  `server_seq` INTEGER NOT NULL DEFAULT 0,
  `created_by` TEXT NOT NULL,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `deleted_at` INTEGER
);

CREATE TABLE IF NOT EXISTS `categories` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `workspace_id` TEXT NOT NULL REFERENCES `workspaces`(`id`),
  `name` TEXT NOT NULL,
  `kind` TEXT NOT NULL,
  `parent_id` TEXT,
  `icon` TEXT,
  `color` TEXT,
  `is_archived` INTEGER DEFAULT 0,
  `version` INTEGER NOT NULL DEFAULT 1,
  `server_seq` INTEGER NOT NULL DEFAULT 0,
  `created_by` TEXT NOT NULL,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `deleted_at` INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_category_ws_parent_name` ON `categories` (`workspace_id`, `parent_id`, `name`);

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `workspace_id` TEXT NOT NULL REFERENCES `workspaces`(`id`),
  `type` TEXT NOT NULL,
  `amount_minor` INTEGER NOT NULL,
  `currency` TEXT NOT NULL DEFAULT 'VND',
  `category_id` TEXT REFERENCES `categories`(`id`),
  `occurred_on` TEXT NOT NULL,
  `note` TEXT,
  `attachment_url` TEXT,
  `status` TEXT NOT NULL DEFAULT 'cleared',
  `linked_asset_id` TEXT,
  `linked_task_id` TEXT,
  `recurring_id` TEXT,
  `version` INTEGER NOT NULL DEFAULT 1,
  `server_seq` INTEGER NOT NULL DEFAULT 0,
  `created_by` TEXT NOT NULL,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `deleted_at` INTEGER
);
CREATE INDEX IF NOT EXISTS `idx_txn_ws_date` ON `transactions` (`workspace_id`, `occurred_on`);

CREATE TABLE IF NOT EXISTS `postings` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `transaction_id` TEXT NOT NULL REFERENCES `transactions`(`id`),
  `wallet_id` TEXT NOT NULL REFERENCES `wallets`(`id`),
  `delta_minor` INTEGER NOT NULL,
  `created_at` INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS `idx_posting_wallet` ON `postings` (`wallet_id`);

CREATE TABLE IF NOT EXISTS `budgets` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `workspace_id` TEXT NOT NULL REFERENCES `workspaces`(`id`),
  `category_id` TEXT NOT NULL REFERENCES `categories`(`id`),
  `period_kind` TEXT NOT NULL DEFAULT 'calendar_month',
  `limit_minor` INTEGER NOT NULL,
  `threshold_pct` INTEGER NOT NULL DEFAULT 80,
  `version` INTEGER NOT NULL DEFAULT 1,
  `server_seq` INTEGER NOT NULL DEFAULT 0,
  `created_by` TEXT NOT NULL,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `deleted_at` INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_budget_ws_cat_period` ON `budgets` (`workspace_id`, `category_id`, `period_kind`);

CREATE TABLE IF NOT EXISTS `recurring_transactions` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `workspace_id` TEXT NOT NULL REFERENCES `workspaces`(`id`),
  `template_type` TEXT,
  `template_amount_minor` INTEGER,
  `template_category_id` TEXT,
  `template_wallet_id` TEXT,
  `template_to_wallet_id` TEXT,
  `note` TEXT,
  `rrule` TEXT NOT NULL,
  `tz` TEXT NOT NULL,
  `next_run_on` TEXT,
  `auto_post` INTEGER NOT NULL DEFAULT 0,
  `version` INTEGER NOT NULL DEFAULT 1,
  `server_seq` INTEGER NOT NULL DEFAULT 0,
  `created_by` TEXT NOT NULL,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `deleted_at` INTEGER
);

-- Tasks Tables
CREATE TABLE IF NOT EXISTS `projects` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `workspace_id` TEXT NOT NULL REFERENCES `workspaces`(`id`),
  `name` TEXT NOT NULL,
  `view` TEXT DEFAULT 'list',
  `version` INTEGER NOT NULL DEFAULT 1,
  `server_seq` INTEGER NOT NULL DEFAULT 0,
  `created_by` TEXT NOT NULL,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `deleted_at` INTEGER
);

CREATE TABLE IF NOT EXISTS `tasks` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `workspace_id` TEXT NOT NULL REFERENCES `workspaces`(`id`),
  `title` TEXT NOT NULL,
  `description` TEXT,
  `is_all_day` INTEGER NOT NULL DEFAULT 1,
  `due_on` TEXT,
  `due_time` TEXT,
  `tz` TEXT NOT NULL,
  `priority` TEXT DEFAULT 'normal',
  `status` TEXT DEFAULT 'open',
  `project_id` TEXT REFERENCES `projects`(`id`),
  `assignee_id` TEXT REFERENCES `users`(`id`),
  `rrule` TEXT,
  `source_type` TEXT,
  `source_id` TEXT,
  `version` INTEGER NOT NULL DEFAULT 1,
  `server_seq` INTEGER NOT NULL DEFAULT 0,
  `created_by` TEXT NOT NULL,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `deleted_at` INTEGER
);
CREATE INDEX IF NOT EXISTS `idx_task_ws_due` ON `tasks` (`workspace_id`, `due_on`);

CREATE TABLE IF NOT EXISTS `task_occurrences` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `task_id` TEXT NOT NULL REFERENCES `tasks`(`id`),
  `occurrence_date_local` TEXT NOT NULL,
  `status` TEXT DEFAULT 'open',
  `moved_to` TEXT,
  `done_at` INTEGER,
  `done_by` TEXT,
  `version` INTEGER NOT NULL DEFAULT 1,
  `server_seq` INTEGER NOT NULL DEFAULT 0,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_task_occ_date` ON `task_occurrences` (`task_id`, `occurrence_date_local`);

CREATE TABLE IF NOT EXISTS `subtasks` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `task_id` TEXT NOT NULL REFERENCES `tasks`(`id`),
  `title` TEXT NOT NULL,
  `done` INTEGER DEFAULT 0,
  `sort` INTEGER DEFAULT 0
);

-- Assets Tables
CREATE TABLE IF NOT EXISTS `assets` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `workspace_id` TEXT NOT NULL REFERENCES `workspaces`(`id`),
  `name` TEXT NOT NULL,
  `category` TEXT,
  `image_url` TEXT,
  `serial` TEXT,
  `location` TEXT,
  `status` TEXT DEFAULT 'available',
  `value_minor` INTEGER,
  `currency` TEXT DEFAULT 'VND',
  `purchase_date` TEXT,
  `warranty_until` TEXT,
  `expiry_date` TEXT,
  `owner_user_id` TEXT REFERENCES `users`(`id`),
  `version` INTEGER NOT NULL DEFAULT 1,
  `server_seq` INTEGER NOT NULL DEFAULT 0,
  `created_by` TEXT NOT NULL,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `deleted_at` INTEGER
);
CREATE INDEX IF NOT EXISTS `idx_asset_ws` ON `assets` (`workspace_id`);

CREATE TABLE IF NOT EXISTS `maintenance_plans` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `asset_id` TEXT NOT NULL REFERENCES `assets`(`id`),
  `workspace_id` TEXT NOT NULL REFERENCES `workspaces`(`id`),
  `type` TEXT,
  `interval_time_value` INTEGER,
  `interval_time_unit` TEXT,
  `interval_usage_value` INTEGER,
  `usage_unit` TEXT,
  `last_done_date` TEXT,
  `last_done_usage` INTEGER,
  `next_due_date` TEXT,
  `next_due_usage` INTEGER,
  `cost_estimate_minor` INTEGER,
  `version` INTEGER NOT NULL DEFAULT 1,
  `server_seq` INTEGER NOT NULL DEFAULT 0,
  `created_by` TEXT NOT NULL,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `deleted_at` INTEGER
);
CREATE INDEX IF NOT EXISTS `idx_maint_next_due` ON `maintenance_plans` (`next_due_date`);

CREATE TABLE IF NOT EXISTS `usage_logs` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `asset_id` TEXT NOT NULL REFERENCES `assets`(`id`),
  `value` INTEGER NOT NULL,
  `unit` TEXT NOT NULL,
  `logged_at` INTEGER NOT NULL,
  `created_by` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `maintenance_histories` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `asset_id` TEXT NOT NULL,
  `plan_id` TEXT REFERENCES `maintenance_plans`(`id`),
  `done_at` INTEGER NOT NULL,
  `at_usage` INTEGER,
  `cost_minor` INTEGER,
  `note` TEXT,
  `transaction_id` TEXT
);

CREATE TABLE IF NOT EXISTS `asset_loans` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `asset_id` TEXT NOT NULL REFERENCES `assets`(`id`),
  `borrower_user_id` TEXT,
  `borrower_name` TEXT,
  `borrowed_at` INTEGER NOT NULL,
  `due_at` INTEGER,
  `returned_at` INTEGER,
  `status` TEXT DEFAULT 'out'
);

CREATE TABLE IF NOT EXISTS `asset_documents` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `asset_id` TEXT NOT NULL REFERENCES `assets`(`id`),
  `type` TEXT NOT NULL,
  `file_url` TEXT NOT NULL,
  `created_at` INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS `consumables` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `workspace_id` TEXT NOT NULL REFERENCES `workspaces`(`id`),
  `name` TEXT NOT NULL,
  `quantity` INTEGER NOT NULL DEFAULT 0,
  `unit` TEXT NOT NULL,
  `min_threshold` INTEGER NOT NULL DEFAULT 0
);

-- Notifications & Audit Tables
CREATE TABLE IF NOT EXISTS `reminder_policies` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `workspace_id` TEXT NOT NULL,
  `source_type` TEXT NOT NULL,
  `source_id` TEXT NOT NULL,
  `offsets_json` TEXT NOT NULL,
  `channels_json` TEXT,
  `urgent` INTEGER DEFAULT 0,
  `escalate_every_hours` INTEGER DEFAULT 24,
  `escalate_max` INTEGER DEFAULT 3,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS `reminder_deliveries` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `workspace_id` TEXT NOT NULL,
  `source_type` TEXT NOT NULL,
  `source_id` TEXT NOT NULL,
  `occurrence_key` TEXT NOT NULL,
  `offset_days` INTEGER NOT NULL,
  `recipient_user_id` TEXT NOT NULL,
  `channel` TEXT NOT NULL,
  `remind_at` INTEGER NOT NULL,
  `status` TEXT DEFAULT 'scheduled',
  `provider_msg_id` TEXT,
  `attempt` INTEGER DEFAULT 0,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_delivery_idempotency` ON `reminder_deliveries` (`source_type`, `source_id`, `occurrence_key`, `offset_days`, `channel`);
CREATE INDEX IF NOT EXISTS `idx_delivery_status_remind` ON `reminder_deliveries` (`status`, `remind_at`);

CREATE TABLE IF NOT EXISTS `user_channels` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `user_id` TEXT NOT NULL,
  `channel` TEXT NOT NULL,
  `address` TEXT NOT NULL,
  `verified` INTEGER DEFAULT 0,
  `is_default` INTEGER DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_user_channel` ON `user_channels` (`user_id`, `channel`);

CREATE TABLE IF NOT EXISTS `notification_prefs` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `user_id` TEXT NOT NULL,
  `event_type` TEXT NOT NULL,
  `channel` TEXT NOT NULL,
  `quiet_start` TEXT DEFAULT '22:00',
  `quiet_end` TEXT DEFAULT '07:00'
);

CREATE TABLE IF NOT EXISTS `notification_logs` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `delivery_id` TEXT NOT NULL,
  `channel` TEXT NOT NULL,
  `status` TEXT NOT NULL,
  `provider_msg_id` TEXT,
  `error` TEXT,
  `sent_at` INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `workspace_id` TEXT NOT NULL,
  `actor_user_id` TEXT NOT NULL,
  `action` TEXT NOT NULL,
  `entity_type` TEXT NOT NULL,
  `entity_id` TEXT NOT NULL,
  `before_json` TEXT,
  `after_json` TEXT,
  `at` INTEGER NOT NULL
);

-- Daily Module Tables
CREATE TABLE IF NOT EXISTS `habits` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `workspace_id` TEXT NOT NULL REFERENCES `workspaces`(`id`),
  `user_id` TEXT NOT NULL,
  `name` TEXT NOT NULL,
  `rrule` TEXT,
  `target` INTEGER DEFAULT 1,
  `version` INTEGER NOT NULL DEFAULT 1,
  `server_seq` INTEGER NOT NULL DEFAULT 0,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `deleted_at` INTEGER
);

CREATE TABLE IF NOT EXISTS `habit_logs` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `habit_id` TEXT NOT NULL REFERENCES `habits`(`id`),
  `date` TEXT NOT NULL,
  `done` INTEGER DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_habit_date` ON `habit_logs` (`habit_id`, `date`);

CREATE TABLE IF NOT EXISTS `notes` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `workspace_id` TEXT NOT NULL REFERENCES `workspaces`(`id`),
  `user_id` TEXT NOT NULL,
  `is_shared` INTEGER DEFAULT 0,
  `content` TEXT NOT NULL,
  `attachments_json` TEXT,
  `tags_json` TEXT,
  `version` INTEGER NOT NULL DEFAULT 1,
  `server_seq` INTEGER NOT NULL DEFAULT 0,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `deleted_at` INTEGER
);
