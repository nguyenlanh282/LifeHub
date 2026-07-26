import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@lifehub/db';
import { Env } from '../index';

export const assetsRouter = new Hono<{ Bindings: Env }>();

assetsRouter.get('/', async (c) => {
  if (!c.env.DB) {
    return c.json({ assets: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const assetsList = await db.select().from(schema.assets);
  return c.json({ assets: assetsList });
});

assetsRouter.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const id = 'ast_' + Date.now();
  const now = Date.now();

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.assets).values({
      id,
      workspaceId: body.workspaceId || 'ws_personal_01',
      name: body.name || 'Thiết bị mới',
      category: body.category || 'Gia dụng',
      serial: body.serial || null,
      location: body.location || null,
      status: body.status || 'available',
      valueMinor: body.valueMinor || null,
      currency: 'VND',
      warrantyUntil: body.warrantyUntil || null,
      createdBy: 'usr_lanh_01',
      createdAt: now,
      updatedAt: now,
    });
  }

  return c.json(
    {
      asset: {
        id,
        name: body.name || 'Thiết bị mới',
        category: body.category || 'Gia dụng',
        status: body.status || 'available',
      },
    },
    201
  );
});

assetsRouter.get('/:id/maintenance', async (c) => {
  if (!c.env.DB) {
    return c.json({ plans: [] });
  }
  const db = drizzle(c.env.DB, { schema });
  const plans = await db.select().from(schema.maintenancePlans);
  return c.json({ plans });
});
