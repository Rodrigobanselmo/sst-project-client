import { createRequire } from 'node:module';
import path from 'node:path';
import assert from 'node:assert/strict';
const url = new URL(process.env.DATABASE_URL!);
assert.equal(url.hostname, '127.0.0.1');
assert.equal(url.pathname, '/simplesst_api_e2e');
assert.match(
  process.env.API_E2E_CONTAINER!,
  /^simplesst-api-e2e-[a-f0-9]{12}$/,
);
const apiRequire = createRequire(
  path.join(process.env.API_E2E_ROOT!, 'package.json'),
);
export const db = apiRequire(
  './dist/prisma/prisma-client.factory.js',
).createPrismaClient();
