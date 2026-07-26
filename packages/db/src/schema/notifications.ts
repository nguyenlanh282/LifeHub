import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const reminderPolicies = sqliteTable('reminder_policies', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  sourceType: text('source_type').notNull(),
  sourceId: text('source_id').notNull(),
  offsetsJson: text('offsets_json').notNull(), // e.g. '[-7,-1,0]'
  channelsJson: text('channels_json'), // e.g. '["push","email","telegram"]'
  urgent: integer('urgent').default(0),
  escalateEveryHours: integer('escalate_every_hours').default(24),
  escalateMax: integer('escalate_max').default(3),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const reminderDeliveries = sqliteTable(
  'reminder_deliveries',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull(),
    sourceType: text('source_type').notNull(),
    sourceId: text('source_id').notNull(),
    occurrenceKey: text('occurrence_key').notNull(),
    offsetDays: integer('offset_days').notNull(),
    recipientUserId: text('recipient_user_id').notNull(),
    channel: text('channel').notNull(),
    remindAt: integer('remind_at').notNull(),
    status: text('status', {
      enum: ['scheduled', 'deferred', 'sending', 'sent', 'failed', 'fallback_channel', 'acknowledged', 'cancelled', 'suppressed'],
    }).default('scheduled'),
    providerMsgId: text('provider_msg_id'),
    attempt: integer('attempt').default(0),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => ({
    deliveryIdempotencyIdx: uniqueIndex('idx_delivery_idempotency').on(
      table.sourceType,
      table.sourceId,
      table.occurrenceKey,
      table.offsetDays,
      table.channel
    ),
    statusRemindAtIdx: index('idx_delivery_status_remind').on(table.status, table.remindAt),
  })
);

export const userChannels = sqliteTable(
  'user_channels',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    channel: text('channel').notNull(), // push|email|telegram|zalo|sms
    address: text('address').notNull(),
    verified: integer('verified').default(0),
    isDefault: integer('is_default').default(0),
  },
  (table) => ({
    userChannelIdx: uniqueIndex('idx_user_channel').on(table.userId, table.channel),
  })
);

export const notificationPrefs = sqliteTable('notification_prefs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  eventType: text('event_type').notNull(),
  channel: text('channel').notNull(),
  quietStart: text('quiet_start').default('22:00'),
  quietEnd: text('quiet_end').default('07:00'),
});

export const notificationLogs = sqliteTable('notification_logs', {
  id: text('id').primaryKey(),
  deliveryId: text('delivery_id').notNull(),
  channel: text('channel').notNull(),
  status: text('status').notNull(),
  providerMsgId: text('provider_msg_id'),
  error: text('error'),
  sentAt: integer('sent_at').notNull(),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  actorUserId: text('actor_user_id').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  beforeJson: text('before_json'),
  afterJson: text('after_json'),
  at: integer('at').notNull(),
});
