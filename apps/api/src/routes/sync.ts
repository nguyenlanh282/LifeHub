import { Hono } from 'hono';

export const syncRouter = new Hono();

syncRouter.get('/', (c) => {
  const since = Number(c.req.query('since') || 0);
  return c.json({
    serverSeq: since + 1,
    changes: [],
  });
});

syncRouter.post('/push', async (c) => {
  const body = await c.req.json().catch(() => ({ mutations: [] }));
  return c.json({
    applied: body.mutations?.map((m: any) => ({
      clientMutationId: m.clientMutationId,
      status: 'success',
    })) || [],
    serverSeq: Date.now(),
  });
});
