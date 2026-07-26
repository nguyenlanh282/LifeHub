import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { workspaces, users } from './core';

export const assets = sqliteTable(
  'assets',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    name: text('name').notNull(),
    category: text('category'),
    imageUrl: text('image_url'),
    serial: text('serial'),
    location: text('location'),
    status: text('status', { enum: ['available', 'in_use', 'repair', 'retired'] }).default('available'),
    valueMinor: integer('value_minor'),
    currency: text('currency').default('VND'),
    purchaseDate: text('purchase_date'),
    warrantyUntil: text('warranty_until'),
    expiryDate: text('expiry_date'),
    ownerUserId: text('owner_user_id').references(() => users.id),
    version: integer('version').notNull().default(1),
    serverSeq: integer('server_seq').notNull().default(0),
    createdBy: text('created_by').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
  },
  (table) => ({
    wsAssetIdx: index('idx_asset_ws').on(table.workspaceId),
  })
);

export const maintenancePlans = sqliteTable(
  'maintenance_plans',
  {
    id: text('id').primaryKey(),
    assetId: text('asset_id').notNull().references(() => assets.id),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    type: text('type'), // thanh_toan|thay_nhot|thay_pin|sua_chua|kiem_dinh|het_han
    intervalTimeValue: integer('interval_time_value'),
    intervalTimeUnit: text('interval_time_unit'), // ngay|thang|nam
    intervalUsageValue: integer('interval_usage_value'),
    usageUnit: text('usage_unit'), // km|gio
    lastDoneDate: text('last_done_date'),
    lastDoneUsage: integer('last_done_usage'),
    nextDueDate: text('next_due_date'),
    nextDueUsage: integer('next_due_usage'),
    costEstimateMinor: integer('cost_estimate_minor'),
    version: integer('version').notNull().default(1),
    serverSeq: integer('server_seq').notNull().default(0),
    createdBy: text('created_by').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
  },
  (table) => ({
    nextDueDateIdx: index('idx_maint_next_due').on(table.nextDueDate),
  })
);

export const usageLogs = sqliteTable('usage_logs', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull().references(() => assets.id),
  value: integer('value').notNull(),
  unit: text('unit').notNull(),
  loggedAt: integer('logged_at').notNull(),
  createdBy: text('created_by').notNull(),
});

export const maintenanceHistories = sqliteTable('maintenance_histories', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  planId: text('plan_id').references(() => maintenancePlans.id),
  doneAt: integer('done_at').notNull(),
  atUsage: integer('at_usage'),
  costMinor: integer('cost_minor'),
  note: text('note'),
  transactionId: text('transaction_id'),
});

export const assetLoans = sqliteTable('asset_loans', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull().references(() => assets.id),
  borrowerUserId: text('borrower_user_id'),
  borrowerName: text('borrower_name'),
  borrowedAt: integer('borrowed_at').notNull(),
  dueAt: integer('due_at'),
  returnedAt: integer('returned_at'),
  status: text('status', { enum: ['out', 'returned', 'overdue'] }).default('out'),
});

export const assetDocuments = sqliteTable('asset_documents', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull().references(() => assets.id),
  type: text('type').notNull(),
  fileUrl: text('file_url').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const consumables = sqliteTable('consumables', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull().default(0),
  unit: text('unit').notNull(),
  minThreshold: integer('min_threshold').notNull().default(0),
});
