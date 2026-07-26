import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { workspaces, users } from './core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  name: text('name').notNull(),
  view: text('view').default('list'),
  version: integer('version').notNull().default(1),
  serverSeq: integer('server_seq').notNull().default(0),
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
});

export const tasks = sqliteTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    title: text('title').notNull(),
    description: text('description'),
    isAllDay: integer('is_all_day').notNull().default(1),
    dueOn: text('due_on'), // YYYY-MM-DD
    dueTime: text('due_time'), // HH:MM
    tz: text('tz').notNull(),
    priority: text('priority', { enum: ['low', 'normal', 'high'] }).default('normal'),
    status: text('status', { enum: ['open', 'done', 'cancelled'] }).default('open'),
    projectId: text('project_id').references(() => projects.id),
    assigneeId: text('assignee_id').references(() => users.id),
    rrule: text('rrule'),
    sourceType: text('source_type'),
    sourceId: text('source_id'),
    version: integer('version').notNull().default(1),
    serverSeq: integer('server_seq').notNull().default(0),
    createdBy: text('created_by').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
  },
  (table) => ({
    wsDueIdx: index('idx_task_ws_due').on(table.workspaceId, table.dueOn),
  })
);

export const taskOccurrences = sqliteTable(
  'task_occurrences',
  {
    id: text('id').primaryKey(),
    taskId: text('task_id').notNull().references(() => tasks.id),
    occurrenceDateLocal: text('occurrence_date_local').notNull(), // YYYY-MM-DD
    status: text('status', { enum: ['open', 'done', 'skipped', 'moved'] }).default('open'),
    movedTo: text('moved_to'),
    doneAt: integer('done_at'),
    doneBy: text('done_by'),
    version: integer('version').notNull().default(1),
    serverSeq: integer('server_seq').notNull().default(0),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => ({
    taskOccDateIdx: uniqueIndex('idx_task_occ_date').on(table.taskId, table.occurrenceDateLocal),
  })
);

export const subtasks = sqliteTable('subtasks', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id),
  title: text('title').notNull(),
  done: integer('done').default(0),
  sort: integer('sort').default(0),
});
