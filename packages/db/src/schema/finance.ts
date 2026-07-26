import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { workspaces } from './core';

export const wallets = sqliteTable('wallets', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  name: text('name').notNull(),
  type: text('type').notNull(), // cash|bank|ewallet
  currency: text('currency').notNull().default('VND'),
  openingBalanceMinor: integer('opening_balance_minor').notNull().default(0),
  isArchived: integer('is_archived').notNull().default(0),
  version: integer('version').notNull().default(1),
  serverSeq: integer('server_seq').notNull().default(0),
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
});

export const categories = sqliteTable(
  'categories',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    name: text('name').notNull(),
    kind: text('kind', { enum: ['income', 'expense'] }).notNull(),
    parentId: text('parent_id'),
    icon: text('icon'),
    color: text('color'),
    isArchived: integer('is_archived').default(0),
    version: integer('version').notNull().default(1),
    serverSeq: integer('server_seq').notNull().default(0),
    createdBy: text('created_by').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
  },
  (table) => ({
    wsParentNameIdx: uniqueIndex('idx_category_ws_parent_name').on(table.workspaceId, table.parentId, table.name),
  })
);

export const transactions = sqliteTable(
  'transactions',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    type: text('type', { enum: ['income', 'expense', 'transfer'] }).notNull(),
    amountMinor: integer('amount_minor').notNull(),
    currency: text('currency').notNull().default('VND'),
    categoryId: text('category_id').references(() => categories.id),
    occurredOn: text('occurred_on').notNull(), // YYYY-MM-DD
    note: text('note'),
    attachmentUrl: text('attachment_url'),
    status: text('status', { enum: ['cleared', 'pending'] }).notNull().default('cleared'),
    linkedAssetId: text('linked_asset_id'),
    linkedTaskId: text('linked_task_id'),
    recurringId: text('recurring_id'),
    version: integer('version').notNull().default(1),
    serverSeq: integer('server_seq').notNull().default(0),
    createdBy: text('created_by').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
  },
  (table) => ({
    wsDateIdx: index('idx_txn_ws_date').on(table.workspaceId, table.occurredOn),
  })
);

export const postings = sqliteTable(
  'postings',
  {
    id: text('id').primaryKey(),
    transactionId: text('transaction_id').notNull().references(() => transactions.id),
    walletId: text('wallet_id').notNull().references(() => wallets.id),
    deltaMinor: integer('delta_minor').notNull(), // positive for deposit, negative for withdrawal
    createdAt: integer('created_at').notNull(),
  },
  (table) => ({
    walletIdx: index('idx_posting_wallet').on(table.walletId),
  })
);

export const budgets = sqliteTable(
  'budgets',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    categoryId: text('category_id').notNull().references(() => categories.id),
    periodKind: text('period_kind').notNull().default('calendar_month'),
    limitMinor: integer('limit_minor').notNull(),
    thresholdPct: integer('threshold_pct').notNull().default(80),
    version: integer('version').notNull().default(1),
    serverSeq: integer('server_seq').notNull().default(0),
    createdBy: text('created_by').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
  },
  (table) => ({
    wsCatPeriodIdx: uniqueIndex('idx_budget_ws_cat_period').on(table.workspaceId, table.categoryId, table.periodKind),
  })
);

export const recurringTransactions = sqliteTable('recurring_transactions', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  templateType: text('template_type'),
  templateAmountMinor: integer('template_amount_minor'),
  templateCategoryId: text('template_category_id'),
  templateWalletId: text('template_wallet_id'),
  templateToWalletId: text('template_to_wallet_id'),
  note: text('note'),
  rrule: text('rrule').notNull(),
  tz: text('tz').notNull(),
  nextRunOn: text('next_run_on'),
  autoPost: integer('auto_post').notNull().default(0),
  version: integer('version').notNull().default(1),
  serverSeq: integer('server_seq').notNull().default(0),
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
});
