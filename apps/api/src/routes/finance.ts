import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@lifehub/db';
import { eq } from 'drizzle-orm';
import { Env } from '../index';

export const financeRouter = new Hono<{ Bindings: Env }>();

// 1. Get Transactions
financeRouter.get('/transactions', async (c) => {
  if (!c.env.DB) {
    return c.json({ transactions: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const txns = await db.select().from(schema.transactions);
  return c.json({ transactions: txns });
});

// 2. Create Transaction
financeRouter.post('/transactions', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const id = 'txn_' + Date.now();
  const now = Date.now();

  const newTxn = {
    id,
    workspaceId: body.workspaceId || 'ws_personal_01',
    type: body.type || 'expense',
    amountMinor: Number(body.amountMinor) || 10000,
    currency: body.currency || 'VND',
    occurredOn: body.occurredOn || new Date().toISOString().split('T')[0],
    note: body.note || null,
    receiptUrl: body.receiptUrl || null,
    status: 'cleared',
    createdBy: 'usr_lanh_01',
    createdAt: now,
    updatedAt: now,
  };

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.transactions).values(newTxn as any);

    if (body.walletId) {
      await db.insert(schema.postings).values({
        id: 'post_' + Date.now(),
        transactionId: id,
        walletId: body.walletId,
        deltaMinor: body.type === 'expense' ? -newTxn.amountMinor : newTxn.amountMinor,
        createdAt: now,
      });
    }
  }

  return c.json({ transaction: newTxn }, 201);
});

// 3. Edit Transaction
financeRouter.put('/transactions/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const now = Date.now();

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db
      .update(schema.transactions)
      .set({
        amountMinor: Number(body.amountMinor) || undefined,
        type: body.type || undefined,
        note: body.note || undefined,
        occurredOn: body.occurredOn || undefined,
        updatedAt: now,
      })
      .where(eq(schema.transactions.id, id));
  }

  return c.json({ message: 'Transaction updated successfully', id });
});

// 4. Delete Transaction
financeRouter.delete('/transactions/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.transactions).where(eq(schema.transactions.id, id));
  }
  return c.json({ message: 'Transaction deleted successfully', id });
});

// 5. Upload Bank Transfer Receipt Image
financeRouter.post('/upload-receipt', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { imageBase64, filename } = body;

  // Generate URL for uploaded receipt
  const receiptUrl = imageBase64
    ? imageBase64
    : `https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80`;

  // Parse receipt mock OCR extraction
  const parsedData = {
    amountMinor: body.parsedAmount || 250000,
    note: body.parsedNote || 'Chuyển khoản thanh toán hóa đơn / mua sắm',
    bankName: body.bankName || 'Vietcombank / MBBank',
    receiptUrl,
    extractedDate: new Date().toISOString().split('T')[0],
  };

  return c.json({ message: 'Tải ảnh hóa đơn chuyển khoản thành công', parsedData });
});

// 6. Generate VietQR Bank Transfer Code
financeRouter.post('/vietqr', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const bankId = body.bankId || 'MB'; // MB, VCB, TCB, VPB, ICB
  const accountNo = body.accountNo || '0987654321';
  const accountName = body.accountName || 'NGUYEN VAN LANH';
  const amount = body.amount || 150000;
  const addInfo = encodeURIComponent(body.note || 'LifeHub Thanh Toan');

  const vietQrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=${encodeURIComponent(
    accountName
  )}`;

  return c.json({
    vietQrUrl,
    bankId,
    accountNo,
    accountName,
    amount,
    note: body.note,
  });
});

// 7. Get Wallets
financeRouter.get('/wallets', async (c) => {
  if (!c.env.DB) {
    return c.json({ wallets: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const walletsList = await db.select().from(schema.wallets);
  return c.json({ wallets: walletsList });
});

// 8. Create Wallet (Thêm Ví / Ngân hàng mới)
financeRouter.post('/wallets', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const id = 'wal_' + Date.now();
  const now = Date.now();

  const newWallet = {
    id,
    workspaceId: body.workspaceId || 'ws_personal_01',
    name: body.name || 'Ví Ngân Hàng Mới',
    type: body.type || 'bank',
    currency: body.currency || 'VND',
    openingBalanceMinor: Number(body.openingBalanceMinor) || 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.wallets).values(newWallet as any);
  }

  return c.json({ wallet: newWallet }, 201);
});

// 9. Get Budgets
financeRouter.get('/budgets', async (c) => {
  if (!c.env.DB) {
    return c.json({ budgets: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const budgetsList = await db.select().from(schema.budgets);
  return c.json({ budgets: budgetsList });
});
