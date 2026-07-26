import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './migrations',
  driver: 'd1',
  dbCredentials: {
    wranglerConfigPath: '../../apps/api/wrangler.toml',
    dbName: 'lifehub_db',
  },
});
