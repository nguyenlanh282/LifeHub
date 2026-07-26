import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRouter } from './routes/auth';
import { workspacesRouter } from './routes/workspaces';
import { financeRouter } from './routes/finance';
import { tasksRouter } from './routes/tasks';
import { assetsRouter } from './routes/assets';
import { dailyRouter } from './routes/daily';
import { syncRouter } from './routes/sync';

export interface Env {
  DB: D1Database;
  ASSET_BUCKET: R2Bucket;
  CACHE_KV: KVNamespace;
  REMINDER_QUEUE: Queue;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for frontend PWA
app.use('*', cors());

// Error Handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({ error: err.message, name: err.name }, 500);
});

// Healthcheck
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    app: 'LifeHub Serverless API',
    timestamp: new Date().toISOString(),
  });
});

// Mounting Sub-Routers
app.route('/api/auth', authRouter);
app.route('/api/workspaces', workspacesRouter);
app.route('/api/finance', financeRouter);
app.route('/api/tasks', tasksRouter);
app.route('/api/assets', assetsRouter);
app.route('/api/daily', dailyRouter);
app.route('/api/sync', syncRouter);

// Cloudflare Worker Handler
export default {
  fetch: app.fetch,

  // Cron Trigger for due-date reminder processing
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log('Running daily reminder scanner cron job at:', event.scheduledTime);
    // Queue job to process reminders
  },

  // Queue Consumer for notification delivery
  async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
    console.log(`Processing queue batch of ${batch.messages.length} messages`);
    for (const msg of batch.messages) {
      console.log('Sending reminder message:', msg.body);
      msg.ack();
    }
  },
};
