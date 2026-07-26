import { Hono } from 'hono';

export const workspacesRouter = new Hono();

workspacesRouter.get('/', (c) => {
  return c.json({
    workspaces: [
      {
        id: 'ws_personal_1',
        name: 'Gia Đình Lành',
        type: 'personal',
        role: 'owner',
        timezone: 'Asia/Ho_Chi_Minh',
        baseCurrency: 'VND',
      },
    ],
  });
});

workspacesRouter.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json(
    {
      workspace: {
        id: 'ws_' + Date.now(),
        name: body.name || 'Workspace Mới',
        type: body.type || 'personal',
        role: 'owner',
      },
    },
    201
  );
});

workspacesRouter.get('/:id/members', (c) => {
  return c.json({
    members: [
      { id: 'usr_mock_123', name: 'Lành Guru', role: 'owner' },
    ],
  });
});
