import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUIDv7
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified').notNull().default(0),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  timezone: text('timezone'),
  passwordHash: text('password_hash'),
  oauthGoogleSub: text('oauth_google_sub').unique(),
  oauthFacebookSub: text('oauth_facebook_sub').unique(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
});

export const workspaces = sqliteTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['personal', 'team'] }).notNull().default('personal'),
  ownerId: text('owner_id').notNull().references(() => users.id),
  timezone: text('timezone').notNull().default('Asia/Ho_Chi_Minh'),
  baseCurrency: text('base_currency').notNull().default('VND'),
  reminderHourLocal: integer('reminder_hour_local').notNull().default(8),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
});

export const memberships = sqliteTable(
  'memberships',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    role: text('role', { enum: ['owner', 'admin', 'member', 'viewer'] }).notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
  },
  (table) => ({
    userWsIdx: uniqueIndex('idx_membership_user_ws').on(table.userId, table.workspaceId),
    wsIdx: index('idx_membership_ws').on(table.workspaceId),
  })
);

export const invitations = sqliteTable('invitations', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  email: text('email').notNull(),
  role: text('role', { enum: ['admin', 'member', 'viewer'] }).notNull(),
  token: text('token').notNull().unique(),
  status: text('status', { enum: ['pending', 'accepted', 'revoked', 'expired'] }).notNull().default('pending'),
  expiresAt: integer('expires_at').notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at').notNull(),
});
