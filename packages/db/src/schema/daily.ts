import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { workspaces } from './core';

export const habits = sqliteTable('habits', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  rrule: text('rrule'),
  target: integer('target').default(1),
  version: integer('version').notNull().default(1),
  serverSeq: integer('server_seq').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
});

export const habitLogs = sqliteTable(
  'habit_logs',
  {
    id: text('id').primaryKey(),
    habitId: text('habit_id').notNull().references(() => habits.id),
    date: text('date').notNull(), // YYYY-MM-DD
    done: integer('done').default(1),
  },
  (table) => ({
    habitDateIdx: uniqueIndex('idx_habit_date').on(table.habitId, table.date),
  })
);

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  userId: text('user_id').notNull(),
  isShared: integer('is_shared').default(0),
  content: text('content').notNull(),
  attachmentsJson: text('attachments_json'),
  tagsJson: text('tags_json'),
  version: integer('version').notNull().default(1),
  serverSeq: integer('server_seq').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
});
