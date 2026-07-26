import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '@lifehub/db';
import { Env } from '../index';

export const assetsRouter = new Hono<{ Bindings: Env }>();

// 1. Get Assets
assetsRouter.get('/', async (c) => {
  if (!c.env.DB) {
    return c.json({ assets: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const assetsList = await db.select().from(schema.assets);
  return c.json({ assets: assetsList });
});

// 2. Create Asset
assetsRouter.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const id = 'ast_' + Date.now();
  const now = Date.now();

  const newAsset = {
    id,
    workspaceId: body.workspaceId || 'ws_personal_01',
    name: body.name || 'Thiết bị mới',
    category: body.category || 'Gia dụng',
    serial: body.serial || null,
    location: body.location || null,
    status: body.status || 'available',
    valueMinor: Number(body.valueMinor) || null,
    currency: 'VND',
    warrantyUntil: body.warrantyUntil || null,
    createdBy: 'usr_lanh_01',
    createdAt: now,
    updatedAt: now,
  };

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.assets).values(newAsset as any);
  }

  return c.json({ asset: newAsset }, 201);
});

// 3. Edit Asset
assetsRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const now = Date.now();

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db
      .update(schema.assets)
      .set({
        name: body.name || undefined,
        category: body.category || undefined,
        location: body.location || undefined,
        status: body.status || undefined,
        warrantyUntil: body.warrantyUntil || undefined,
        updatedAt: now,
      })
      .where(eq(schema.assets.id, id));
  }

  return c.json({ message: 'Asset updated successfully', id });
});

// 4. Delete Asset
assetsRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.assets).where(eq(schema.assets.id, id));
  }
  return c.json({ message: 'Asset deleted successfully', id });
});

// 5. Get Asset Maintenance Plans
assetsRouter.get('/:id/maintenance', async (c) => {
  if (!c.env.DB) {
    return c.json({ plans: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const plans = await db.select().from(schema.maintenancePlans);
  return c.json({ plans });
});

// 6. Create Maintenance Plan / Event
assetsRouter.post('/:id/maintenance', async (c) => {
  const assetId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const id = 'mn_' + Date.now();
  const now = Date.now();

  const newPlan = {
    id,
    assetId,
    title: body.title || 'Lịch bảo trì mới',
    maintenanceType: body.maintenanceType || 'thay_nhot',
    rrule: body.rrule || null,
    nextDueOn: body.nextDueOn || new Date().toISOString().split('T')[0],
    createdAt: now,
    updatedAt: now,
  };

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.maintenancePlans).values(newPlan as any);
  }

  return c.json({ plan: newPlan }, 201);
});
