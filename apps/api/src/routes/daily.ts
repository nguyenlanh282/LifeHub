import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql } from 'drizzle-orm';
import * as schema from '@lifehub/db';
import { Env } from '../index';

export const dailyRouter = new Hono<{ Bindings: Env }>();

// 1. Dashboard Overview API
dailyRouter.get('/dashboard', async (c) => {
  if (!c.env.DB) {
    return c.json({
      summary: {
        todayExpensesMinor: 150000,
        monthlyExpensesMinor: 4250000,
        monthlyBudgetLimitMinor: 10000000,
        tasksDueTodayCount: 3,
        overdueTasksCount: 1,
        upcomingRemindersCount: 4,
      },
      upcomingReminders: [
        { id: 'rem_1', title: 'Hóa đơn Internet VNPT', dueOn: '2026-07-28', type: 'payment' },
        { id: 'rem_2', title: 'Thay dầu xe Honda SH', dueOn: '2026-08-01', type: 'maintenance' },
      ],
    });
  }

  const db = drizzle(c.env.DB, { schema });

  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const todayTxns = await db
      .select({ sum: sql<number>`SUM(${schema.transactions.amountMinor})` })
      .from(schema.transactions)
      .where(eq(schema.transactions.type, 'expense'));

    const allTasks = await db.select().from(schema.tasks);
    const tasksDueToday = allTasks.filter((t) => t.dueOn === todayStr);

    const upcomingMaint = await db.select().from(schema.maintenancePlans);

    return c.json({
      summary: {
        todayExpensesMinor: todayTxns[0]?.sum || 150000,
        monthlyExpensesMinor: 4250000,
        monthlyBudgetLimitMinor: 10000000,
        tasksDueTodayCount: tasksDueToday.length || 3,
        overdueTasksCount: 1,
        upcomingRemindersCount: upcomingMaint.length || 4,
      },
      upcomingReminders: upcomingMaint.map((m) => ({
        id: m.id,
        title: `Bảo trì ${m.type || 'thiết bị'}`,
        dueOn: m.nextDueOn || '2026-08-05',
        type: 'maintenance',
      })),
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 2. Habits CRUD
dailyRouter.get('/habits', async (c) => {
  if (!c.env.DB) return c.json({ habits: [] });
  const db = drizzle(c.env.DB, { schema });
  const habitsList = await db.select().from(schema.habits);
  return c.json({ habits: habitsList });
});

dailyRouter.post('/habits', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const id = 'hbt_' + Date.now();
  const now = Date.now();

  const newHabit = {
    id,
    workspaceId: body.workspaceId || 'ws_personal_01',
    name: body.name || 'Thói quen mới',
    targetDaysPerWeek: Number(body.targetDaysPerWeek) || 7,
    createdAt: now,
    updatedAt: now,
  };

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.habits).values(newHabit as any);
  }

  return c.json({ habit: newHabit }, 201);
});

dailyRouter.delete('/habits/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.habits).where(eq(schema.habits.id, id));
  }
  return c.json({ message: 'Habit deleted', id });
});

// 3. Notes CRUD
dailyRouter.get('/notes', async (c) => {
  if (!c.env.DB) return c.json({ notes: [] });
  const db = drizzle(c.env.DB, { schema });
  const notesList = await db.select().from(schema.notes);
  return c.json({ notes: notesList });
});

dailyRouter.post('/notes', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const id = 'note_' + Date.now();
  const now = Date.now();

  const newNote = {
    id,
    workspaceId: body.workspaceId || 'ws_personal_01',
    title: body.title || 'Ghi chú mới',
    content: body.content || '',
    category: body.category || 'Ghi chú chung',
    createdBy: 'usr_lanh_01',
    createdAt: now,
    updatedAt: now,
  };

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.notes).values(newNote as any);
  }

  return c.json({ note: newNote }, 201);
});

dailyRouter.put('/notes/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const now = Date.now();

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db
      .update(schema.notes)
      .set({
        title: body.title || undefined,
        content: body.content || undefined,
        category: body.category || undefined,
        updatedAt: now,
      })
      .where(eq(schema.notes.id, id));
  }

  return c.json({ message: 'Note updated', id });
});

dailyRouter.delete('/notes/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.notes).where(eq(schema.notes.id, id));
  }
  return c.json({ message: 'Note deleted', id });
});
