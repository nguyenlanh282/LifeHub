import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '@lifehub/db';
import { Env } from '../index';

export const workspacesRouter = new Hono<{ Bindings: Env }>();

// 1. Get List of Workspaces
workspacesRouter.get('/', async (c) => {
  if (!c.env.DB) {
    return c.json({
      workspaces: [
        {
          id: 'ws_personal_01',
          name: '🏠 Ví Cá Nhân - Lành Guru',
          type: 'personal',
          role: 'owner',
          timezone: 'Asia/Ho_Chi_Minh',
          baseCurrency: 'VND',
          reminderHourLocal: 8,
        },
        {
          id: 'ws_family_02',
          name: '👨‍👩‍👧‍👦 Ví Gia Đình Lành',
          type: 'team',
          role: 'owner',
          timezone: 'Asia/Ho_Chi_Minh',
          baseCurrency: 'VND',
          reminderHourLocal: 8,
        },
        {
          id: 'ws_company_03',
          name: '💼 Bảo Trì Công Ty / Sufruit',
          type: 'team',
          role: 'admin',
          timezone: 'Asia/Ho_Chi_Minh',
          baseCurrency: 'VND',
          reminderHourLocal: 9,
        },
      ],
    });
  }

  try {
    const db = drizzle(c.env.DB, { schema });
    const list = await db.select().from(schema.workspaces);
    return c.json({ workspaces: list });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 2. Create New Workspace (Tạo Workspace Mới)
workspacesRouter.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const id = 'ws_' + Date.now();
  const now = Date.now();

  const newWs = {
    id,
    name: body.name || 'Workspace Mới',
    type: body.type || 'personal',
    ownerId: body.ownerId || 'usr_lanh_01',
    timezone: body.timezone || 'Asia/Ho_Chi_Minh',
    baseCurrency: body.baseCurrency || 'VND',
    reminderHourLocal: Number(body.reminderHourLocal) || 8,
    createdAt: now,
    updatedAt: now,
  };

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.workspaces).values(newWs as any);

    // Auto-create owner membership
    await db.insert(schema.memberships).values({
      id: 'mem_' + Date.now(),
      userId: newWs.ownerId,
      workspaceId: id,
      role: 'owner',
      createdAt: now,
      updatedAt: now,
    });
  }

  return c.json({ workspace: newWs, message: 'Khởi tạo Workspace mới thành công!' }, 201);
});

// 3. Update Workspace Configuration (Cấu Hình Workspace)
workspacesRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const now = Date.now();

  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db
      .update(schema.workspaces)
      .set({
        name: body.name || undefined,
        timezone: body.timezone || undefined,
        baseCurrency: body.baseCurrency || undefined,
        reminderHourLocal: Number(body.reminderHourLocal) || undefined,
        updatedAt: now,
      })
      .where(eq(schema.workspaces.id, id));
  }

  return c.json({ message: 'Cập nhật cấu hình Workspace thành công!', id });
});

// 4. Delete Workspace
workspacesRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.workspaces).where(eq(schema.workspaces.id, id));
  }
  return c.json({ message: 'Đã xóa Workspace thành công', id });
});

// 5. Get Members List
workspacesRouter.get('/:id/members', async (c) => {
  const id = c.req.param('id');
  return c.json({
    workspaceId: id,
    members: [
      { id: 'usr_lanh_01', name: 'Nguyễn Văn Lành (Chủ workspace)', email: 'it.nguyenlanh@gmail.com', role: 'owner' },
      { id: 'usr_member_02', name: 'Vợ Gia Đình Lành', email: 'vo.nguyenlanh@gmail.com', role: 'admin' },
    ],
  });
});

// 6. Invite Member to Workspace
workspacesRouter.post('/:id/invite', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));

  return c.json({
    message: `Đã gửi lời mời tham gia Workspace tới email ${body.email || 'thành viên'}!`,
    invitation: {
      id: 'inv_' + Date.now(),
      workspaceId: id,
      email: body.email,
      role: body.role || 'member',
      status: 'pending',
    },
  });
});
