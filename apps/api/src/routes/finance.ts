import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@lifehub/db';
import { eq, sql } from 'drizzle-orm';
import { Env } from '../index';

export const financeRouter = new Hono<{ Bindings: Env }>();

// Helper to update wallet balance in D1 database automatically
async function updateWalletBalance(db: any, walletId: string, deltaMinor: number) {
  try {
    const existingWallet = await db.query.wallets.findFirst({
      where: eq(schema.wallets.id, walletId),
    });

    if (existingWallet) {
      const currentBalance = existingWallet.openingBalanceMinor || 0;
      const newBalance = currentBalance + deltaMinor;
      await db
        .update(schema.wallets)
        .set({
          openingBalanceMinor: newBalance,
          updatedAt: Date.now(),
        })
        .where(eq(schema.wallets.id, walletId));
    }
  } catch (e) {
    console.warn('Failed to update wallet balance:', e);
  }
}

// 1. Get Transactions
financeRouter.get('/transactions', async (c) => {
  if (!c.env.DB) {
    return c.json({ transactions: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const txns = await db.select().from(schema.transactions);
  return c.json({ transactions: txns });
});

// 2. Create Transaction with AUTO BALANCE DEDUCTION
financeRouter.post('/transactions', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const id = 'txn_' + Date.now();
  const now = Date.now();
  const walletId = body.walletId || 'wal_cash';
  const amountMinor = Number(body.amountMinor) || 10000;
  const type = body.type || 'expense';

  const newTxn = {
    id,
    workspaceId: body.workspaceId || 'ws_personal_01',
    type,
    amountMinor,
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

    // Auto-Deduct / Auto-Add Balance to selected Wallet
    const deltaMinor = type === 'expense' ? -amountMinor : amountMinor;
    await updateWalletBalance(db, walletId, deltaMinor);

    await db.insert(schema.postings).values({
      id: 'post_' + Date.now(),
      transactionId: id,
      walletId,
      deltaMinor,
      createdAt: now,
    });
  }

  return c.json({ transaction: newTxn, message: 'Giao dịch thành công & Số dư ví đã được tự động cập nhật!' }, 201);
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

// 5. Automatic Bank Sync Webhook (Casso / SeAPay / Open Banking Webhook Integration)
financeRouter.post('/bank-webhook', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const now = Date.now();

  // Casso / Open Banking Webhook payload format
  const incomingTxns = body.data || [
    {
      id: 'bank_sync_' + Date.now(),
      amount: body.amount || 150000,
      description: body.description || 'MBBank: GD 150,000VND chuyen tien sieu thi',
      bank_sub_acc_id: body.bank_account || '0987654321',
      when: new Date().toISOString(),
    },
  ];

  const processed = [];
  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    for (const item of incomingTxns) {
      const isExpense = !item.description.includes('NHAN TIEN') && item.amount > 0;
      const txnId = 'txn_auto_' + Date.now() + Math.floor(Math.random() * 1000);
      const amountMinor = Math.abs(Number(item.amount));

      await db.insert(schema.transactions).values({
        id: txnId,
        workspaceId: 'ws_personal_01',
        type: isExpense ? 'expense' : 'income',
        amountMinor,
        currency: 'VND',
        occurredOn: new Date().toISOString().split('T')[0],
        note: `[TỰ ĐỘNG NGÂN HÀNG] ${item.description}`,
        status: 'cleared',
        createdBy: 'bank_sync_webhook',
        createdAt: now,
        updatedAt: now,
      } as any);

      // Auto-deduct bank wallet balance
      const walletId = 'wal_mb';
      const delta = isExpense ? -amountMinor : amountMinor;
      await updateWalletBalance(db, walletId, delta);

      processed.push({ txnId, amountMinor, description: item.description });
    }
  }

  return c.json({
    status: 'success',
    message: `Đã tự động đồng bộ ${processed.length} giao dịch từ ngân hàng & tự động trừ/cộng số dư ví!`,
    processed,
  });
});

// 6. Trigger Simulated Bank Sync (Dành cho người dùng bấm 1-chạm Đồng bộ Ngân Hàng)
financeRouter.post('/bank-sync', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const bankName = body.bankName || 'MB Bank';
  const now = Date.now();

  const mockBankTxn = {
    amount: body.amount || 220000,
    description: `Tự động đồng bộ ${bankName}: Thanh toán hóa đơn siêu thị WinMart`,
  };

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    const txnId = 'txn_sync_' + Date.now();
    await db.insert(schema.transactions).values({
      id: txnId,
      workspaceId: 'ws_personal_01',
      type: 'expense',
      amountMinor: mockBankTxn.amount,
      currency: 'VND',
      occurredOn: new Date().toISOString().split('T')[0],
      note: `[TỰ ĐỘNG ${bankName.toUpperCase()}] ${mockBankTxn.description}`,
      status: 'cleared',
      createdBy: 'bank_auto_sync',
      createdAt: now,
      updatedAt: now,
    } as any);

    await updateWalletBalance(db, 'wal_mb', -mockBankTxn.amount);
  }

  return c.json({
    message: `Kết nối thành công với ngân hàng ${bankName}! Đã tự động ghi nhận giao dịch -${mockBankTxn.amount.toLocaleString('vi-VN')}₫ và cập nhật số dư ví.`,
    bankName,
  });
});

// 7. Get Upload Receipt
financeRouter.post('/upload-receipt', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { imageBase64 } = body;
  const receiptUrl = imageBase64 || `https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80`;

  const parsedData = {
    amountMinor: body.parsedAmount || 250000,
    note: body.parsedNote || 'Chuyển khoản thanh toán hóa đơn / mua sắm',
    bankName: body.bankName || 'Vietcombank / MBBank',
    receiptUrl,
    extractedDate: new Date().toISOString().split('T')[0],
  };

  return c.json({ message: 'Tải ảnh hóa đơn chuyển khoản thành công', parsedData });
});

// 8. Generate VietQR
financeRouter.post('/vietqr', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const bankId = body.bankId || 'MB';
  const accountNo = body.accountNo || '0987654321';
  const accountName = body.accountName || 'NGUYEN VAN LANH';
  const amount = body.amount || 150000;
  const addInfo = encodeURIComponent(body.note || 'LifeHub Thanh Toan');

  const vietQrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=${encodeURIComponent(
    accountName
  )}`;

  return c.json({ vietQrUrl, bankId, accountNo, accountName, amount, note: body.note });
});

// 9. Get Wallets
financeRouter.get('/wallets', async (c) => {
  if (!c.env.DB) {
    return c.json({ wallets: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const walletsList = await db.select().from(schema.wallets);
  return c.json({ wallets: walletsList });
});

// 10. Create Wallet
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

// 11. Get Budgets
financeRouter.get('/budgets', async (c) => {
  if (!c.env.DB) {
    return c.json({ budgets: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const budgetsList = await db.select().from(schema.budgets);
  return c.json({ budgets: budgetsList });
});
