import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@lifehub/db';
import { Env } from '../index';

export const financeRouter = new Hono<{ Bindings: Env }>();

financeRouter.get('/transactions', async (c) => {
  if (!c.env.DB) {
    return c.json({ transactions: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const txns = await db.select().from(schema.transactions);
  return c.json({ transactions: txns });
});

financeRouter.post('/transactions', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const id = 'txn_' + Date.now();
  const now = Date.now();

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.transactions).values({
      id,
      workspaceId: body.workspaceId || 'ws_personal_01',
      type: body.type || 'expense',
      amountMinor: body.amountMinor || 10000,
      currency: body.currency || 'VND',
      occurredOn: body.occurredOn || new Date().toISOString().split('T')[0],
      note: body.note || null,
      status: 'cleared',
      createdBy: 'usr_lanh_01',
      createdAt: now,
      updatedAt: now,
    });

    if (body.walletId) {
      await db.insert(schema.postings).values({
        id: 'post_' + Date.now(),
        transactionId: id,
        walletId: body.walletId,
        deltaMinor: body.type === 'expense' ? -body.amountMinor : body.amountMinor,
        createdAt: now,
      });
    }
  }

  return c.json(
    {
      transaction: {
        id,
        type: body.type || 'expense',
        amountMinor: body.amountMinor || 10000,
        currency: body.currency || 'VND',
        occurredOn: body.occurredOn || new Date().toISOString().split('T')[0],
        note: body.note || null,
        status: 'cleared',
      },
    },
    201
  );
});

financeRouter.get('/wallets', async (c) => {
  if (!c.env.DB) {
    return c.json({ wallets: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const walletsList = await db.select().from(schema.wallets);
  return c.json({ wallets: walletsList });
});

financeRouter.get('/budgets', async (c) => {
  if (!c.env.DB) {
    return c.json({ budgets: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const budgetsList = await db.select().from(schema.budgets);
  return c.json({ budgets: budgetsList });
});
