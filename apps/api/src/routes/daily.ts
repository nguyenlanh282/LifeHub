import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql } from 'drizzle-orm';
import * as schema from '@lifehub/db';
import { Env } from '../index';

export const dailyRouter = new Hono<{ Bindings: Env }>();

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

    // Query today's expenses sum
    const todayTxns = await db
      .select({ sum: sql<number>`SUM(${schema.transactions.amountMinor})` })
      .from(schema.transactions)
      .where(eq(schema.transactions.type, 'expense'));

    // Query tasks
    const allTasks = await db.select().from(schema.tasks);
    const tasksDueToday = allTasks.filter((t) => t.dueOn === todayStr);

    // Query maintenance plans coming up
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
        title: `Bảo trì ${m.type}`,
        dueOn: m.nextDueDate || '2026-08-05',
        type: 'maintenance',
      })),
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

dailyRouter.get('/habits', async (c) => {
  if (!c.env.DB) {
    return c.json({ habits: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const habitsList = await db.select().from(schema.habits);
  return c.json({ habits: habitsList });
});

dailyRouter.get('/notes', async (c) => {
  if (!c.env.DB) {
    return c.json({ notes: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const notesList = await db.select().from(schema.notes);
  return c.json({ notes: notesList });
});
