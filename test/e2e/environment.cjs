// Launched ONLY by the API's guarded disposable-PostgreSQL runner.
const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const { exportEvidence } = require('./export-evidence.cjs');
const {
  compilationRoutes,
  selectCompilationRoutes,
  retainCompiledPagesInMirror,
  prepareCompilation,
} = require('./compilation-readiness.cjs');
const startedAt = new Date().toISOString();
const { createServer } = require('node:net');
const {
  cpSync,
  mkdirSync,
  symlinkSync,
  writeFileSync,
  createWriteStream,
  rmSync,
} = require('node:fs');
const { resolve, basename, join } = require('node:path');
const apiRoot = process.env.API_E2E_ROOT;
const webRoot = process.env.WEB_E2E_ROOT;
const artifacts = process.env.API_E2E_ARTIFACT_DIR;
assert(apiRoot && webRoot && artifacts);
const { startApi } = require(resolve(apiRoot, 'test/api/harness.cjs'));
const mirror = resolve(artifacts, 'web-source');
let web, tests, api;
let stopping = false;
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function stop(child) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([new Promise((r) => child.once('exit', r)), pause(8000)]);
  if (child.exitCode === null) child.kill('SIGKILL');
}
async function cleanup() {
  if (stopping) return;
  stopping = true;
  await stop(tests);
  await stop(web);
  if (api) await api.close();
  // Preserve logs/videos/reports, but not a full Next build/source copy.
  rmSync(mirror, { recursive: true, force: true });
  rmSync(resolve(artifacts, 'browser/synthetic-certificate.pfx'), {
    force: true,
  });
  rmSync(resolve(artifacts, 'browser/synthetic-renewal.pfx'), { force: true });
  rmSync(resolve(artifacts, 'browser/synthetic-platform.pfx'), { force: true });
}
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, async () => {
    await cleanup();
    process.exit(signal === 'SIGINT' ? 130 : 143);
  });
(async () => {
  const reservation = createServer();
  await new Promise((r) => reservation.listen(0, '127.0.0.1', r));
  const port = reservation.address().port;
  await new Promise((r) => reservation.close(r));
  const baseURL = `http://localhost:${port}`;
  const deliveryEnabled = process.env.E2E_BROWSER_DELIVERY_MODE === '1';
  if (deliveryEnabled) {
    // Test-only opt-in; no parent credentials or production flags are inherited.
    assert.match(process.env.API_E2E_CONTAINER || '', /^simplesst-api-e2e-[a-f0-9]{12}$/);
    assert.equal(process.env.DOTENV_CONFIG_PATH, '/dev/null');
    assert.equal(new URL(process.env.DATABASE_URL).hostname, '127.0.0.1');
    assert.equal(new URL(process.env.DATABASE_URL).pathname, '/simplesst_api_e2e');
    process.env.ESOCIAL_INITIAL_SEND_ENABLED = 'true';
    process.env.API_E2E_BROWSER_DELIVERY_ENABLED = 'true';
    process.env.ESOCIAL_EMAIL_NOTIFICATIONS_ENABLED = 'true';
    process.env.APP_HOST = baseURL;
    for (const family of ['S2210', 'S2220', 'S2221', 'S3000'])
      process.env[`ESOCIAL_${family}_SEND_ENABLED`] = 'true';
    process.env.ESOCIAL_PRODUCTION_ENABLED = 'false';
  }
  api = await startApi({ browserOrigin: baseURL });
  const f = api.fixtures;
  // A separate synthetic organization is the platform owner. A customer's
  // tenant administrator must never gain access to the platform certificate.
  process.env.ESOCIAL_PLATFORM_OWNER_COMPANY_ID = f.foreignCompany.id;
  const platformMaster = await api.prisma.user.create({
    data: {
      name: 'Administrador interno E2E',
      email: 'platform-master@example.com',
      password: f.user.password,
      companies: {
        create: {
          companyId: f.foreignCompany.id,
          roles: ['master'],
          permissions: ['master-crud'],
        },
      },
    },
  });
  f.user = await api.prisma.user.update({
    where: { id: f.user.id },
    data: { email: 'operator@example.com' },
  });
  await api.prisma.userCompany.update({
    where: { companyId_userId: { companyId: f.company.id, userId: f.user.id } },
    data: {
      roles: ['1', '8', '14', '15', '16'],
      permissions: [
        // Complex company pages load multiple operational summaries. This synthetic
        // operator is an administrator; denial tests use separate API fixtures.
        'master-crud',
        '2.1-crud',
        '2.2-crud',
        '2-crud',
        '4.0-crud',
        '4.3-crud',
        '6-crud',
        '10-crud',
      ],
    },
  });
  // Enable the actual web modules in this disposable tenant, without changing guards.
  await api.prisma.company.update({
    where: { id: f.company.id },
    data: { permissions: ['1', '2', '3', '4', '5', '6'] },
  });
  // Synthetic A1 files for the real browser upload; never a user certificate.
  const { pfxCertificate } = require(
    resolve(apiRoot, 'test/esocial/certificate-fixtures.cjs'),
  );
  const cert = pfxCertificate();
  const renewal = pfxCertificate({ keys: cert.keys });
  await api.prisma.company.update({
    where: { id: f.company.id },
    data: { cnpj: '11222333000181' },
  });
  const certificateClient = await api.prisma.company.create({
    data: {
      name: 'Cliente procuração E2E',
      cnpj: '44555666000100',
      type: 'MATRIZ',
    },
  });
  await api.prisma.contract.create({
    data: {
      applyingServiceCompanyId: f.company.id,
      receivingServiceCompanyId: certificateClient.id,
    },
  });
  mkdirSync(resolve(artifacts, 'browser'), { recursive: true });
  const certificateFile = resolve(
    artifacts,
    'browser/synthetic-certificate.pfx',
  );
  const renewalFile = resolve(artifacts, 'browser/synthetic-renewal.pfx');
  writeFileSync(certificateFile, cert.buffer, { mode: 0o600 });
  writeFileSync(renewalFile, renewal.buffer, { mode: 0o600 });
  let platformCertificateFile;
  let platformCertificatePassword;
  if (deliveryEnabled) {
    const platformCert = pfxCertificate({ registration: '44555666000100' });
    platformCertificateFile = resolve(artifacts, 'browser/synthetic-platform.pfx');
    platformCertificatePassword = platformCert.password;
    writeFileSync(platformCertificateFile, platformCert.buffer, { mode: 0o600 });
  }
  const sector = await api.prisma.hierarchy.create({
    data: {
      companyId: f.company.id,
      name: 'SETOR INICIAL E2E',
      type: 'SECTOR',
      workspaces: { connect: { id: f.workspace.id } },
    },
  });
  mkdirSync(resolve(artifacts, 'browser'), { recursive: true });
  const manifest = {
    platformMasterEmail: platformMaster.email,
    platformMasterPassword: f.password,
    platformCompanyId: f.foreignCompany.id,
    certificateFile,
    renewalFile,
    certificatePassword: cert.password,
    deliveryEnabled,
    ...(deliveryEnabled && { platformCertificateFile, platformCertificatePassword }),
    certificateClientId: certificateClient.id,
    sectorId: sector.id,
    companyId: f.company.id,
    workspaceId: f.workspace.id,
    riskGroupId: f.riskGroup.id,
    otherWorkspaceId: f.otherWorkspace.id,
    email: f.user.email,
    password: f.password,
    apiURL: await api.app.getUrl(),
    baseURL,
  };
  writeFileSync(
    resolve(artifacts, 'browser/fixture.json'),
    JSON.stringify(manifest, null, 2),
  );
  // Next loads .env automatically. Run an independent source mirror excluding all
  // environment files, so developer secrets and their running .next stay untouched.
  const excluded = new Set([
    'node_modules',
    '.git',
    '.next',
    '.diag-tmp',
    'test-results',
    'playwright-report',
  ]);
  cpSync(webRoot, mirror, {
    recursive: true,
    filter: (p) =>
      !excluded.has(basename(p)) && !basename(p).startsWith('.env'),
  });
  symlinkSync(
    resolve(webRoot, 'node_modules'),
    join(mirror, 'node_modules'),
    'dir',
  );
  const preparedRoutes = selectCompilationRoutes(compilationRoutes(manifest), process.env.E2E_BROWSER_PREPARE_PAGES);
  retainCompiledPagesInMirror(mirror, webRoot, preparedRoutes.length);
  const webEnv = {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    TMPDIR: process.env.TMPDIR,
    NODE_ENV: 'development',
    NEXT_TELEMETRY_DISABLED: '1',
    NEXT_PUBLIC_API_URL: manifest.apiURL,
    NEXT_PUBLIC_BASE_URL_API: manifest.apiURL,
    TOKEN_SECRET: process.env.TOKEN_SECRET,
    NEXT_PUBLIC_API_KEY: process.env.FIREBASE_API_KEY,
    NEXT_PUBLIC_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_MESSAGING: process.env.FIREBASE_MESSAGING,
    NEXT_PUBLIC_APP_ID: process.env.FIREBASE_APP_ID,
    NEXT_PUBLIC_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_ENABLE_AI_CHAT: 'false',
  };
  const log = createWriteStream(resolve(artifacts, 'browser/next.log'));
  web = spawn(
    process.execPath,
    [
      resolve(webRoot, 'node_modules/next/dist/bin/next'),
      'dev',
      '--webpack',
      '--hostname',
      'localhost',
      '--port',
      String(port),
    ],
    { cwd: mirror, env: webEnv, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  web.stdout.pipe(log);
  web.stderr.pipe(log, { end: false });
  const deadline = Date.now() + 180000;
  while (true) {
    if (web.exitCode !== null)
      throw new Error(`Next exited (${web.exitCode}); see next.log`);
    try {
      const r = await fetch(`${baseURL}/login`, {
        signal: AbortSignal.timeout(30000),
      });
      if (r.status === 200) break;
    } catch {}
    if (Date.now() > deadline)
      throw new Error('Next readiness timeout; see next.log');
    await pause(1000);
  }
  const compilation = await prepareCompilation({
    baseURL,
    routes: preparedRoutes,
    onProgress: (report) =>
      writeFileSync(
        resolve(artifacts, 'browser/compilation-readiness.json'),
        JSON.stringify(report, null, 2),
      ),
  });
  console.log(
    `Next compilation ready: ${compilation.routes.length} page bundles in ${compilation.durationMs}ms (setup only).`,
  );
  console.log(
    `Browser E2E: ${baseURL} -> ${manifest.apiURL} -> disposable PostgreSQL`,
  );
  const testEnv = {
    ...process.env,
    E2E_BASE_URL: baseURL,
    E2E_FIXTURE_PATH: resolve(artifacts, 'browser/fixture.json'),
  };
  const code = await new Promise((r, reject) => {
    tests = spawn(
      process.execPath,
      [
        resolve(webRoot, 'node_modules/@playwright/test/cli.js'),
        'test',
        '--config',
        resolve(webRoot, 'playwright.config.ts'),
      ],
      { cwd: webRoot, env: testEnv, stdio: 'inherit' },
    );
    tests.once('error', reject);
    tests.once('exit', r);
  });
  const migrations = await api.prisma.$queryRawUnsafe(
    'SELECT COUNT(*)::integer AS count FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL',
  );
  const postgres = await api.prisma.$queryRawUnsafe("SELECT current_setting('server_version') AS version");
  const commit = (root) =>
    spawnSync('git', ['rev-parse', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
    }).stdout.trim();
  writeFileSync(
    resolve(artifacts, 'browser/verification.json'),
    JSON.stringify(
      {
        startedAt,
        finishedAt: new Date().toISOString(),
        node: process.version,
        postgresRuntime: process.env.API_E2E_DATABASE_RUNTIME || 'unspecified',
        postgresVersion: postgres[0].version,
        postgresImage: process.env.API_E2E_DATABASE_RUNTIME === 'docker' ? 'postgres:17.4' : null,
        migrations: migrations[0].count,
        apiCommit: commit(apiRoot),
        webCommit: commit(webRoot),
        exitCode: code,
        webMode: 'next dev --webpack',
        backendMode: 'production',
        syntheticDataOnly: true,
        deliveryMode: deliveryEnabled ? 'NORMAL_UI_CONFIRM_AND_REAL_VAULT_WORKER' : 'PREPARATION_AND_REGRESSION',
        externalGovernmentTransport: 'SYNTHETIC_ENVIRONMENT_2_ONLY',
      },
      null,
      2,
    ),
  );
  exportEvidence(resolve(artifacts, 'browser'));
  assert.equal(code, 0, 'Browser tests failed; inspect report/videos.');
  writeFileSync(resolve(artifacts,'browser/api-request-audit.json'),JSON.stringify((api.requestLogs||[]).map(({method,originalUrl,status})=>({method,path:originalUrl,status})),null,2));
  assert.deepEqual(api.errors, [], 'Unexpected API internal errors');
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(cleanup);
