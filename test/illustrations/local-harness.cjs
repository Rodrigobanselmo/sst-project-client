'use strict';
// Test-only harness: reads API sources, never modifies them.
// --editor boots AppModule with external boundaries simulated and maintenance stopped.
const path = require('node:path'),
  { createRequire } = require('node:module'),
  assert = require('node:assert/strict'),
  { randomUUID, randomBytes } = require('node:crypto');
const clientRoot = path.resolve(__dirname, '../..'),
  apiRoot = path.resolve(clientRoot, '../sst-project-api'),
  ar = createRequire(path.join(apiRoot, 'package.json'));
ar('dotenv').config({ path: path.join(apiRoot, '.env') });
ar('ts-node').register({
  transpileOnly: true,
  project: path.join(apiRoot, 'tsconfig.json'),
});
// Source bootstrap only: this repository includes relative .js imports targeting .ts sources.
const Module = require('node:module'),
  originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  try {
    return originalResolve.call(this, request, parent, ...rest);
  } catch (error) {
    if (
      error.code === 'MODULE_NOT_FOUND' &&
      request.startsWith('.') &&
      request.endsWith('.js') &&
      parent?.filename.startsWith(apiRoot + '/src/')
    )
      return originalResolve.call(
        this,
        request.slice(0, -3) + '.ts',
        parent,
        ...rest,
      );
    throw error;
  }
};
const ts = ar('typescript');
const cfg = ts.readConfigFile(
  path.join(apiRoot, 'tsconfig.json'),
  ts.sys.readFile,
).config;
ar('tsconfig-paths').register({
  baseUrl: apiRoot,
  paths: cfg.compilerOptions.paths,
});
const { Socket } = require('node:net'),
  connect = Socket.prototype.connect;
Socket.prototype.connect = function (...args) {
  const f = Array.isArray(args[0]) ? args[0][0] : args[0],
    host =
      typeof f === 'object'
        ? f.host || 'localhost'
        : typeof args[1] === 'string'
          ? args[1]
          : 'localhost';
  if (!f?.path && !['127.0.0.1', 'localhost', '::1'].includes(host))
    throw Error('External sockets forbidden');
  return connect.apply(this, args);
};
assert.equal(process.env.SIMPLESST_ILLUSTRATIONS_LOCAL_TEST, '1');
const uri = new URL(process.env.DATABASE_URL);
assert.ok(['localhost', '127.0.0.1'].includes(uri.hostname));
assert.equal(uri.port, '5432');
assert.equal(uri.pathname, '/postgres');
const { PrismaClient } = ar('@prisma/client'),
  { createPrismaClientOptions } = require(
    path.join(apiRoot, 'src/prisma/prisma-client.factory'),
  );
const { Test } = ar('@nestjs/testing'),
  { Reflector } = ar('@nestjs/core'),
  { JwtService } = ar('@nestjs/jwt'),
  sharp = ar('sharp');
const modulePath = 'src/@v2/security/characterization/illustrations/';
const { IllustrationController } = require(
    path.join(apiRoot, modulePath, 'illustration.controller'),
  ),
  { IllustrationService } = require(
    path.join(apiRoot, modulePath, 'illustration.service'),
  ),
  { IllustrationRepository } = require(
    path.join(apiRoot, modulePath, 'illustration.repository'),
  ),
  { IllustrationMarker } = require(
    path.join(apiRoot, modulePath, 'illustration-marker.service'),
  );
const { JwtStrategy } = require(
  path.join(apiRoot, 'src/modules/auth/strategies/jwt.strategy'),
);
const { JwtAuthGuard } = require(
    path.join(apiRoot, 'src/shared/guards/jwt-auth.guard'),
  ),
  { RolesGuard } = require(path.join(apiRoot, 'src/shared/guards/roles.guard')),
  { PermissionsGuard } = require(
    path.join(apiRoot, 'src/shared/guards/permissions.guard'),
  ),
  { MustChangePasswordGuard } = require(
    path.join(apiRoot, 'src/shared/guards/must-change-password.guard'),
  );
const db = new PrismaClient(createPrismaClientOptions()),
  ids = { companies: [], workspaces: [], users: [], groups: [] };
const editorMode = process.argv.includes('--editor');
const administrationMode = editorMode && process.argv.includes('--admin');
let bridge, fixturePhoto;
let app,
  baseline,
  closing = false,
  timer;
async function fingerprint() {
  const out = {};
  for (const n of [
    'CompanyCharacterizationPhoto',
    'CompanyCharacterization',
    'Company',
    'Workspace',
    'User',
  ])
    out[n] = (
      await db.$queryRawUnsafe(
        `SELECT count(*)::text AS count,md5(coalesce(string_agg(md5(row_to_json(t)::text),'' ORDER BY t.id),'')) AS hash FROM "${n}" t`,
      )
    )[0];
  return out;
}
async function close() {
  if (closing) return;
  closing = true;
  clearTimeout(timer);
  try {
    if (bridge) await new Promise((resolve) => bridge.close(resolve));
    if (app) await app.close();
    if (ids.users.length) {
      await db.userCompany.deleteMany({ where: { userId: { in: ids.users } } });
      await db.companyCharacterizationIllustration.deleteMany({
        where: { requestedById: { in: ids.users } },
      });
      await db.characterizationIllustrationGeneration.deleteMany({
        where: { requestedById: { in: ids.users } },
      });
    }
    if (ids.groups.length) {
      if (fixturePhoto) {
        assert.deepEqual(
          await db.companyCharacterizationPhoto.findUnique({
            where: { id: fixturePhoto.id },
          }),
          fixturePhoto,
        );
        await db.companyCharacterizationPhoto.delete({
          where: { id: fixturePhoto.id },
        });
      }
      await db.companyCharacterization.deleteMany({
        where: { id: { in: ids.groups } },
      });
      await db.homogeneousGroup.deleteMany({
        where: { id: { in: ids.groups } },
      });
    }
    if (ids.workspaces.length)
      await db.workspace.deleteMany({ where: { id: { in: ids.workspaces } } });
    if (ids.companies.length) {
      await db.companyIllustrationSettingsAudit.deleteMany({
        where: { companyId: { in: ids.companies } },
      });
      await db.companyIllustrationSettings.deleteMany({
        where: { companyId: { in: ids.companies } },
      });
    }
    if (ids.companies.length)
      await db.company.deleteMany({ where: { id: { in: ids.companies } } });
    if (ids.users.length)
      await db.user.deleteMany({ where: { id: { in: ids.users } } });
    if (baseline) assert.deepEqual(await fingerprint(), baseline);
    console.log('CLEANUP_OK: fixtures removed; real records unchanged');
  } finally {
    await db.$disconnect();
    Socket.prototype.connect = connect;
  }
}
(async () => {
  const identity = (
    await db.$queryRaw`SELECT version(),inet_server_addr()::text AS address`
  )[0];
  assert.ok(identity.version.includes('PostgreSQL 17.'));
  assert.equal(identity.address, '172.18.0.3/32');
  baseline = await fingerprint();
  const company = await db.company.create({
    data: { name: 'illustration-client-test-' + randomUUID() },
  });
  ids.companies.push(company.id);
  const w = await db.workspace.create({
    data: { name: 'Unidade de teste client', companyId: company.id },
  });
  ids.workspaces.push(w.id);
  const users = [];
  for (let i = 0; i < 2; i++) {
    const u = await db.user.create({
      data: {
        name: 'Usuário de teste client',
        // Short reserved example.com address avoids the legacy e-mail pipe's pathological regex.
        email: 'il' + randomUUID().slice(0, 8) + '@example.com',
        password: await ar('bcrypt').hash('Local-test-123!', 4),
        companies: {
          create: {
            companyId: company.id,
            roles: administrationMode && i === 0 ? ['master'] : ['1'],
            permissions: [
              '2-crud',
              '2.1-crud',
              '2.2-crud',
              '4.0-crud',
              '4.3-crud',
              '4.5-crud',
              '4.6-crud',
              '4.62-c',
              '6-crud',
              '17-crud',
              '25-crud',
            ],
          },
        },
      },
    });
    ids.users.push(u.id);
    users.push(u);
  }
  // Explicit settings are confined to this newly created controlled fixture.
  await db.companyIllustrationSettings.create({
    data: {
      companyId: company.id,
      enabled: !administrationMode,
      updatedById: users[0].id,
    },
  });
  const group = await db.homogeneousGroup.create({
    data: {
      name: 'Elemento client ' + randomUUID(),
      description: 'Fixture',
      companyId: company.id,
      type: 'ENVIRONMENT',
    },
  });
  ids.groups.push(group.id);
  const e = await db.companyCharacterization.create({
    data: {
      id: group.id,
      name: 'Oficina de homologação',
      description: 'Oficina com bancada',
      type: 'GENERAL',
      companyId: company.id,
      workspaceId: w.id,
      paragraphs: [],
      activities: ['Manutenção manual'],
      considerations: [],
    },
  });
  process.env.TOKEN_SECRET = randomBytes(32).toString('hex');
  process.env.CHARACTERIZATION_ILLUSTRATIONS_ENABLED = 'true';
  const jwt = new JwtService({ secret: process.env.TOKEN_SECRET });
  const auth = (u) =>
    jwt.sign(
      { companyId: company.id, roles: ['admin'], permissions: ['4.6-u'] },
      { subject: String(u.id), expiresIn: '15m' },
    );
  const png = await sharp({
    create: { width: 1024, height: 1024, channels: 3, background: '#c6d4d8' },
  })
    .composite([
      {
        input: Buffer.from(
          '<svg width="1024" height="1024"><rect x="180" y="360" width="660" height="80" rx="8" fill="#5d7b88"/><path d="M220 440v300 M790 440v300" stroke="#455d66" stroke-width="30"/><rect x="260" y="260" width="180" height="100" fill="#d19c5f"/></svg>',
        ),
      },
    ])
    .png()
    .toBuffer();
  const objects = new Map();
  let providerCalls = 0,
    mode = 'ok';
  const generator = {
    async generate() {
      providerCalls++;
      if (mode === 'timeout') throw Error('simulated provider failure');
      await new Promise((r) => setTimeout(r, 250));
      return {
        bytes: png,
        actualMicrousd: 10000,
        requestId: 'mock-' + randomUUID(),
      };
    },
  };
  const storage = {
    async put(k, b) {
      objects.set(k, Buffer.from(b));
    },
    async get(k) {
      assert.ok(objects.has(k));
      return objects.get(k);
    },
    async copy(a, b) {
      objects.set(b, objects.get(a));
    },
    async delete(k) {
      objects.delete(k);
    },
  };
  const service = new IllustrationService(
    new IllustrationRepository(db),
    generator,
    new IllustrationMarker(),
    storage,
  );
  let mod;
  if (editorMode) {
    require(
      path.join(apiRoot, 'src/shared/utils/isOnline'),
    ).checkInternetConnectivity = async () => false;
    require(
      path.join(
        apiRoot,
        'src/@v2/shared/utils/helpers/check-internet-connectivity',
      ),
    ).checkInternetConnectivity = async () => false;
    require(
      path.join(
        apiRoot,
        'src/shared/providers/LoggerProvider/implementations/AmazonStorage/AmazonLoggerProvider',
      ),
    ).AmazonLoggerProvider.prototype.log = async () => {};
    const { AppModule } = require(path.join(apiRoot, 'src/app.module'));
    const { GENERATOR, PRIVATE_STORAGE } = require(
      path.join(apiRoot, modulePath, 'illustration.contracts'),
    );
    mod = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(GENERATOR)
      .useValue(generator)
      .overrideProvider(PRIVATE_STORAGE)
      .useValue(storage)
      .compile();
    app = mod.createNestApplication({ logger: false });
    app.enableCors({
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
    });
    const { ValidationPipe } = ar('@nestjs/common');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
  } else {
    mod = await Test.createTestingModule({
      controllers: [IllustrationController],
      providers: [
        JwtStrategy,
        { provide: IllustrationService, useValue: service },
      ],
    }).compile();
    app = mod.createNestApplication({ logger: false });
    const reflector = new Reflector();
    app.useGlobalGuards(
      new JwtAuthGuard(reflector),
      new RolesGuard(reflector),
      new PermissionsGuard(reflector, db),
      new MustChangePasswordGuard(reflector, db),
    );
  }
  const scope = {
    userId: users[0].id,
    companyId: company.id,
    workspaceId: w.id,
    characterizationId: e.id,
  };
  const express = app.getHttpAdapter().getInstance();
  let bundle;
  express.get('/__test/app.js', (_, res) =>
    res.type('application/javascript').send(bundle),
  );
  express.get('/__test', (_, res) =>
    res
      .type('html')
      .send(
        `<!doctype html><html lang="pt-BR"><meta charset="UTF-8"><title>Homologação local · Ilustrações</title><div id="root"></div><script>window.__fixture=${JSON.stringify({ scope, token: auth(users[0]) })}</script><script src="/__test/app.js"></script></html>`,
      ),
  );
  express.get('/__test/info', (_, res) => res.json({ providerCalls, mode }));
  express.get('/__test/photo.png', (_, res) => res.type('png').send(png));
  express.post('/__test/mode', ar('express').json(), (req, res) => {
    if (req.body.flag !== undefined)
      process.env.CHARACTERIZATION_ILLUSTRATIONS_ENABLED = String(
        req.body.flag,
      );
    if (req.body.mode) mode = req.body.mode;
    res.json({ mode });
  });
  express.post('/__test/finish', (_, res) => {
    res.json({ closing: true });
    setTimeout(() => void close(), 100);
  });
  await app.listen(
    editorMode ? Number(process.env.SIMPLESST_LOCAL_API_PORT || 60220) : 0,
    '127.0.0.1',
  );
  if (editorMode) {
    const scheduler = app.get(ar('@nestjs/schedule').SchedulerRegistry);
    for (const job of scheduler.getCronJobs().values()) job.stop();
    for (const name of scheduler.getIntervals()) scheduler.deleteInterval(name);
    for (const name of scheduler.getTimeouts()) scheduler.deleteTimeout(name);
  }
  const origin = await app.getUrl();
  if (editorMode) {
    fixturePhoto = await db.companyCharacterizationPhoto.create({
      data: {
        name: 'Fotografia de teste controlada',
        photoUrl: origin + '/__test/photo.png',
        companyCharacterizationId: e.id,
      },
    });
    const response = await fetch(origin + '/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: users[0].email,
        password: 'Local-test-123!',
      }),
    });
    const session = await response.json();
    assert.equal(response.status, 200);
    assert.ok(session.token && session.refresh_token);
    const editorPath =
      '/dashboard/empresas/' +
      company.id +
      '/' +
      w.id +
      '/caracterizacao-editar/' +
      e.id;
    const bootstrapPath = '/fixture-session/' + randomUUID();
    bridge = require('node:http').createServer((req, res) => {
      if (req.url !== bootstrapPath) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(302, {
        'Set-Cookie': [
          'nextauth.token=' + session.token + '; Path=/; SameSite=Lax',
          'nextauth.refreshToken=' +
            session.refresh_token +
            '; Path=/; SameSite=Lax',
        ],
        Location:
          'http://127.0.0.1:3000' +
          (administrationMode ? '/dashboard/empresas' : editorPath),
      });
      res.end();
    });
    await new Promise((resolve) => bridge.listen(60221, '127.0.0.1', resolve));
    console.log('EDITOR_BROWSER_URL=http://127.0.0.1:60221' + bootstrapPath);
    console.log('EDITOR_API_URL=' + origin);
    console.log('FIXTURE_COMPANY_NAME=' + company.name);
    console.log(
      'LOCAL_MODE=' +
        (administrationMode
          ? 'MASTER administration; OpenAI and S3 simulated; company disabled'
          : 'editor simulation'),
    );
    console.log(
      'EDITOR_PATH=/dashboard/empresas/' +
        company.id +
        '/' +
        w.id +
        '/caracterizacao-editar/' +
        e.id,
    );
    console.log('EDITOR_LOGIN=' + users[0].email + ' password=Local-test-123!');
    timer = setTimeout(() => void close(), 45 * 60000);
    return;
  }
  const base =
    'src/components/organisms/modals/ModalAddCharacterization/components/Illustrations';
  const { createIllustrationApi } = require(
      path.join(clientRoot, base, 'illustrations.api'),
    ),
    { IllustrationFlow } = require(
      path.join(clientRoot, base, 'illustrations.flow'),
    );
  const api = createIllustrationApi(
    require(path.join(clientRoot, 'node_modules/axios')).create({
      baseURL: origin,
      headers: { Authorization: 'Bearer ' + auth(users[1]) },
    }),
  );
  const s = { ...scope, userId: users[1].id },
    mem = new Map(),
    ss = {
      getItem: (k) => mem.get(k) || null,
      setItem: (k, v) => mem.set(k, v),
      removeItem: (k) => mem.delete(k),
    };
  const f = new IllustrationFlow(api, s, ss);
  await f.generate(true);
  assert.equal(providerCalls, 0);
  await f.generate(false);
  assert.equal(f.snapshot().generation.status, 'READY');
  assert.equal(providerCalls, 1);
  const id = f.snapshot().generation.generationId;
  assert.ok(await f.approve());
  assert.equal((await api.list(s)).length, 1);
  await api.remove(s, f.snapshot().approved.id);
  let lost = true;
  const broken = {
    ...api,
    generate: async (...args) => {
      const result = await api.generate(...args);
      if (lost) {
        lost = false;
        throw Error('response lost');
      }
      return result;
    },
  };
  const interrupted = new IllustrationFlow(broken, s, ss);
  await interrupted.generate(false);
  assert.ok(!interrupted.snapshot().pending.generationId);
  const count = providerCalls;
  await interrupted.recover();
  assert.equal(providerCalls, count);
  assert.equal(interrupted.snapshot().generation.status, 'READY');
  await interrupted.discard();
  assert.equal(mem.size, 0);
  console.log(
    'CLIENT_API_CHECKS_OK: dirty, generation, approval, list, deletion, lost response, UUID replay, discard',
  );
  if (!process.argv.includes('--serve')) {
    await close();
    return;
  }
  const entry = `import React,{useState} from 'react';import{createRoot}from'react-dom/client';import{QueryClient,QueryClientProvider}from'react-query';import{ThemeProvider,createTheme,CssBaseline,Box,Typography,FormControlLabel,Checkbox}from'@mui/material';import axios from'axios';import{IllustrationsPanel}from'./${base}/IllustrationsPanel';import{createIllustrationApi}from'./${base}/illustrations.api';const api=createIllustrationApi(axios.create({baseURL:location.origin,headers:{Authorization:'Bearer '+window.__fixture.token}}));const q=new QueryClient({defaultOptions:{queries:{retry:false}}});function App(){const[dirty,setDirty]=useState(false),[edit,setEdit]=useState(true),[saved,setSaved]=useState(true);return <ThemeProvider theme={createTheme()}><CssBaseline/><QueryClientProvider client={q}><Box sx={{p:4,maxWidth:960,mx:'auto'}}><Typography variant="h5">Caracterização · Oficina de homologação</Typography><Typography color="text.secondary">Harness local com PostgreSQL e provedores simulados. Não usa dados reais.</Typography><Box sx={{my:2}}><FormControlLabel control={<Checkbox checked={dirty} onChange={e=>setDirty(e.target.checked)}/>} label="Alterações não salvas"/><FormControlLabel control={<Checkbox checked={edit} onChange={e=>setEdit(e.target.checked)}/>} label="Permissão de edição"/><FormControlLabel control={<Checkbox checked={saved} onChange={e=>setSaved(e.target.checked)}/>} label="Elemento salvo"/></Box><Typography variant="h6">Fotos e ilustrações</Typography><IllustrationsPanel scope={window.__fixture.scope} api={api} dirty={dirty} saved={saved} canEdit={edit}/></Box></QueryClientProvider></ThemeProvider>}createRoot(document.getElementById('root')).render(<App/>);`;
  bundle = (
    await ar('esbuild').build({
      stdin: { contents: entry, resolveDir: clientRoot, loader: 'tsx' },
      bundle: true,
      platform: 'browser',
      write: false,
      jsx: 'automatic',
      define: { 'process.env.NODE_ENV': '"development"' },
      logLevel: 'silent',
    })
  ).outputFiles[0].text;
  console.log('HARNESS_URL=' + origin + '/__test');
  timer = setTimeout(() => void close(), 15 * 60000);
})().catch(async (e) => {
  console.error(e);
  process.exitCode = 1;
  await close();
});
process.on('SIGTERM', () => void close());
process.on('SIGINT', () => void close());
