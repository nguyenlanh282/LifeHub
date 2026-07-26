import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '@lifehub/db';
import { Env } from '../index';

export const tasksRouter = new Hono<{ Bindings: Env }>();

// 1. Get Tasks
tasksRouter.get('/', async (c) => {
  if (!c.env.DB) {
    return c.json({ tasks: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const tasksList = await db.select().from(schema.tasks);
  return c.json({ tasks: tasksList });
});

// 2. Create Task
tasksRouter.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const id = 'task_' + Date.now();
  const now = Date.now();

  const newTask = {
    id,
    workspaceId: body.workspaceId || 'ws_personal_01',
    title: body.title || 'Công việc mới',
    description: body.description || null,
    priority: body.priority || 'normal',
    status: 'open',
    dueOn: body.dueOn || new Date().toISOString().split('T')[0],
    tz: 'Asia/Ho_Chi_Minh',
    rrule: body.rrule || null,
    createdBy: 'usr_lanh_01',
    createdAt: now,
    updatedAt: now,
  };

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.tasks).values(newTask as any);
  }

  return c.json({ task: newTask }, 201);
});

// 3. Update Task
tasksRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const now = Date.now();

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db
      .update(schema.tasks)
      .set({
        title: body.title || undefined,
        description: body.description || undefined,
        priority: body.priority || undefined,
        dueOn: body.dueOn || undefined,
        rrule: body.rrule || undefined,
        updatedAt: now,
      })
      .where(eq(schema.tasks.id, id));
  }

  return c.json({ message: 'Task updated successfully', id });
});

// 4. Toggle Status
tasksRouter.patch('/:id/status', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db
      .update(schema.tasks)
      .set({ status: body.status || 'done', updatedAt: Date.now() })
      .where(eq(schema.tasks.id, id));
  }

  return c.json({ id, status: body.status || 'done', updatedAt: Date.now() });
});

// 5. Delete Task
tasksRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
  }
  return c.json({ message: 'Task deleted successfully', id });
});
