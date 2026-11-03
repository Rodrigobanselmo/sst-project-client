import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import type { Page } from '@playwright/test';
import {
  test,
  expect,
  fixture,
  login,
  waitForApi,
  assertStatus,
} from './fixtures';
import { db } from './database';

const apiRequire = createRequire(
  path.join(process.env.API_E2E_ROOT!, 'package.json'),
);
const { seedBulkTenant, syntheticCpf } = apiRequire(
  './test/esocial/bulk-dispatch.fixture.cjs',
);
const headers = async (page: Page) => ({
  Authorization: `Bearer ${(await page.context().cookies()).find((c) => c.name === 'nextauth.token')?.value}`,
});
async function request(
  page: Page,
  method: string,
  url: string,
  body?: unknown,
  token?: string,
) {
  const response = await page.request.fetch(fixture.apiURL + url, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : await headers(page),
    ...(body === undefined ? {} : { data: body }),
  });
  return { status: response.status(), body: await response.json() };
}
async function call(page: Page, method: string, url: string, body?: unknown) {
  const result = await request(page, method, url, body);
  expect(result.status, JSON.stringify(result.body)).toBeLessThan(400);
  return result.body;
}
async function session(page: Page, email: string, password: string) {
  const result = await request(page, 'POST', '/session', { email, password });
  expect(result.status).toBe(200);
  return result.body;
}
async function importPfx(
  page: Page,
  url: string,
  token: string,
  platform: boolean,
  configuration: Record<string, string>,
) {
  const result = await page.request.post(fixture.apiURL + url, {
    headers: { Authorization: `Bearer ${token}` },
    multipart: {
      file: {
        name: 'synthetic-bulk-browser.pfx',
        mimeType: 'application/x-pkcs12',
        buffer: fs.readFileSync(
          platform ? fixture.platformCertificateFile : fixture.certificateFile,
        ),
      },
      password: platform
        ? fixture.platformCertificatePassword
        : fixture.certificatePassword,
      label: 'Certificado sintético do teste de envio em massa',
      operationId: randomUUID(),
      ...configuration,
    },
  });
  expect(result.status()).toBe(201);
  const metadata = await result.json();
  expect(metadata.encryptedPrivateKey).toBeUndefined();
  return metadata.id as string;
}
async function vault(page: Page, companyId: string) {
  let platform = await db.eSocialPlatformCredentialBinding.findUnique({
    where: { id: 'PLATFORM' },
  });
  if (!platform?.enabled) {
    const master = await session(
      page,
      fixture.platformMasterEmail,
      fixture.platformMasterPassword,
    );
    await importPfx(page, '/admin/esocial-credentials', master.token, true, {
      activation: JSON.stringify({ expectedRevision: platform?.revision || 0 }),
    });
    platform = await db.eSocialPlatformCredentialBinding.findUniqueOrThrow({
      where: { id: 'PLATFORM' },
    });
  }
  const token = (await headers(page)).Authorization.slice('Bearer '.length);
  const signer = await importPfx(
    page,
    `/companies/${companyId}/esocial-credentials`,
    token,
    false,
    {
      binding: JSON.stringify({ companyId, mode: 'OWN', expectedRevision: 0 }),
    },
  );
  expect(signer).not.toBe(platform.credentialId);
  return { signer, transmitter: platform.credentialId };
}

/** Uses the same ordinary, trigger-enabled seed as the isolated API bulk suite.
 * No accepted row, graph, lease, clock or operational bypass is written here. */
async function seedMass(page: Page, count = 121, missingAdmissions = 120, platformTester = true) {
  const sourceUser = await db.user.findUniqueOrThrow({
    where: { email: fixture.email },
  });
  const sourceCompany = await db.company.findUniqueOrThrow({
    where: { id: fixture.companyId },
  });
  const bridge = {
    prisma: db,
    fixtures: { user: sourceUser },
    login: (user: { email: string }) =>
      session(page, user.email, fixture.password),
    request: (method: string, url: string, body: unknown, token: string) =>
      request(page, method, url, body, token),
  };
  // More than the former 100-person manual selection limit. Only one has an
  // ADM history; the other 120 are intentional source-validation candidates.
  const tenant = await seedBulkTenant(bridge, {
    count,
    missingAdmissions,
    label: `Empresa lote navegador ${randomUUID().slice(0, 8)}`,
    base: 6_000_001,
  });
  // Government sandbox selection now belongs to the master role. This is only
  // a disposable test actor, established before any declaration is prepared.
  if (platformTester) await db.userCompany.update({
    where: { companyId_userId: { companyId: tenant.company.id, userId: tenant.user.id } },
    data: { roles: ['master'] },
  });
  await db.company.update({
    where: { id: tenant.company.id },
    data: { permissions: sourceCompany.permissions },
  });
  return tenant;
}

test.afterAll(async () => db.$disconnect());

test('QA envio em massa — um clique inclui121, preserva progresso ao voltar e cancela apenas pendências', async ({
  page,
}) => {
  test.setTimeout(300_000);
  test.info().annotations.push({
    type: 'qa-cases',
    description:
      'EVT-001, EVT-003, EVT-006, EVT-009; novo recorte de execução S2240 em massa acima de100 empregados',
  });
  expect(fixture.deliveryEnabled).toBe(true);
  const tenant = await seedMass(page);
  const companyId = tenant.company.id as string;
  const socialPath = `/dashboard/empresas/${companyId}/esocial`;
  const root = `/companies/${companyId}/esocial-dispatch/runs`;
  await login(page, socialPath, {
    email: tenant.user.email,
    password: fixture.password,
  });
  const pins = await vault(page, companyId);
  const panel = page.getByRole('region', {
    name: 'Envio S-2240 de todos os empregados',
    exact: true,
  });
  await expect(panel).toContainText('sem selecionar os empregados um a um');
  await expect(
    panel.getByRole('combobox', {
      name: 'Ambiente do envio de todos os empregados',
      exact: true,
    }),
  ).toContainText('Produção restrita');
  await expect(
    panel.getByRole('combobox', {
      name: 'Empregados para esta preparação',
      exact: true,
    }),
  ).toHaveCount(0);
  const createResponse = waitForApi(page, 'POST', root);
  await panel
    .getByRole('button', {
      name: 'Confirmar envio S-2240 de todos os empregados para testes',
      exact: true,
    })
    .click();
  const createdResponse = await createResponse;
  const originalBody = createdResponse.request().postDataJSON();
  const { run } = await assertStatus(createdResponse, 201);
  expect(originalBody).toMatchObject({
    environment: 2,
    selection: 'CURRENT',
    consent: 'SEND_PENDING',
  });
  expect(originalBody.employeeIds).toBeUndefined();
  expect(run.counts.total).toBe(121);
  expect(run.counts.pending).toBe(121);
  expect(await db.sstDispatchItem.count({ where: { runId: run.id } })).toBe(
    121,
  );
  expect(await db.sstInitialDelivery.count({ where: { companyId } })).toBe(0);
  await expect(panel).toContainText('0 de 121 empregados');

  // Replay the exact observed UI command through authenticated HTTP. This
  // verifies durable identity; it does not fake a network loss in the browser.
  const replay = await call(page, 'POST', root, originalBody);
  expect(replay.run.id).toBe(run.id);
  expect(await db.sstDispatchRun.count({ where: { companyId } })).toBe(1);

  // A normal operational creation after the click belongs to the next cohort.
  const late = await call(page, 'POST', '/employee', {
    companyId,
    name: 'Cadastro posterior ao clique QA',
    cpf: syntheticCpf(6_100_001),
    esocialCode: 'BULK-BROWSER-LATE',
    esocialCategory: '101',
    sex: 'M',
    cidIds: [],
  });
  expect(
    await db.sstDispatchItem.count({
      where: { runId: run.id, employeeId: late.id },
    }),
  ).toBe(0);
  expect((await call(page, 'GET', `${root}/${run.id}`)).run.counts.total).toBe(
    121,
  );

  const advance = (phase: 'PREPARE' | 'RECONCILE', employeeId?: number) =>
    call(
      page,
      'POST',
      `/companies/${companyId}/sst-domain-test/browser/advance-dispatch`,
      { runId: run.id, phase, ...(employeeId && { employeeId }) },
    );
  const blockedEmployee = tenant.employees[1];
  const validEmployee = tenant.employees[0];
  expect((await advance('PREPARE', blockedEmployee.id)).processed).toBe(true);
  const queued = await advance('PREPARE', validEmployee.id);
  expect(queued.processed).toBe(true);
  expect(queued.run.counts.blocked).toBe(1);
  expect(queued.run.counts.queued).toBe(1);
  const item = await db.sstDispatchItem.findFirstOrThrow({
    where: { runId: run.id, employeeId: validEmployee.id },
  });
  const reconcileWhenDue = async () => {
    // The isolated harness has no continuous dispatch worker. Honour its real
    // persisted monitoring schedule before asking the ordinary reconciler to
    // observe the delivery; a premature request must not be mistaken for work.
    const monitored = await db.sstDispatchItem.findUniqueOrThrow({
      where: { id: item.id },
    });
    const delay = monitored.availableAt.getTime() - Date.now();
    expect(Number.isFinite(delay)).toBe(true);
    if (delay > 0) await page.waitForTimeout(delay + 100);
    const result = await advance('RECONCILE');
    expect(result.processed).toBe(true);
    return result;
  };
  const child = await db.sstInitialEvent.findFirstOrThrow({
    where: { runId: item.initialRunId },
    include: { delivery: true },
  });
  expect(child.delivery.state).toBe('QUEUED');
  expect(child.delivery.receipt).toBeNull();
  const send = await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/advance-delivery`,
    { family: 'S-2240', deliveryId: child.delivery.id },
  );
  expect(send.state).toBe('PROCESSING');
  expect(send.receipt).toBeNull();
  expect(send.protocol).toBeTruthy();
  const processing = await reconcileWhenDue();
  expect(processing.run.counts.processing).toBe(1);
  expect(processing.run.counts.accepted).toBe(0);
  await panel
    .getByRole('button', { name: 'Atualizar execução', exact: true })
    .click();
  await expect(panel).toContainText('1 aguardando resultado');
  await expect(panel).toContainText('0 aceitos');
  const delay = new Date(send.availableAt).getTime() - Date.now();
  expect(Number.isFinite(delay)).toBe(true);
  if (delay > 0) await page.waitForTimeout(delay + 100);
  const accepted = await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/advance-delivery`,
    { family: 'S-2240', deliveryId: child.delivery.id },
  );
  expect(accepted.state).toBe('ACCEPTED');
  expect(accepted.receipt).toMatch(/^\d\.\d\.\d{19}$/);
  const stored = await db.sstInitialDelivery.findUniqueOrThrow({
    where: { id: accepted.id },
  });
  expect(stored.credentialId).toBe(pins.signer);
  expect(stored.transmitterCredentialId).toBe(pins.transmitter);
  expect(stored.signedXml).toContain('Signature');
  const reconciled = await reconcileWhenDue();
  expect(reconciled.run.counts.accepted).toBe(1);
  expect(reconciled.run.counts.blocked).toBe(1);
  expect(reconciled.run.counts.pending).toBe(119);

  await page.goto(`/dashboard/empresas/${companyId}/empregados`);
  await expect(page).toHaveURL(new RegExp(`${companyId}/empregados`));
  await expect(page).toHaveTitle(/Funcionários/);
  await page.goto(socialPath);
  await expect(panel).toContainText('1 aceitos');
  await expect(panel).toContainText('1 com informações para corrigir');
  const progress = panel.getByRole('progressbar', {
    name: 'Progresso dos empregados da execução',
    exact: true,
  });
  await expect(progress).toHaveAttribute('aria-valuenow', '2');

  // The existing selector only lists thirty recent preparations. Create real
  // BLOCKED preparations of the independent, unadmitted employee so the old
  // accepted result must be opened by its own ID, never by a coincidental row.
  for (let index = 0; index < 31; index++) {
    const later = await call(
      page,
      'POST',
      `/companies/${companyId}/esocial-initial/2240/prepare`,
      {
        operationId: randomUUID(),
        environment: 2,
        employerRegistration: originalBody.employerRegistration,
        employeeIds: [blockedEmployee.id],
        mode: 'INITIAL',
        selection: 'CURRENT',
      },
    );
    expect(later.state).toBe('BLOCKED');
    expect(later.events.every((event: any) => !event.delivery)).toBe(true);
  }
  const latest = await call(
    page,
    'GET',
    `/companies/${companyId}/esocial-initial/2240`,
  );
  expect(latest.runs).toHaveLength(30);
  expect(
    latest.runs.some((recent: any) => recent.id === item.initialRunId),
  ).toBe(false);
  await page.reload();
  await panel
    .getByRole('combobox', {
      name: 'Situação dos empregados nesta execução',
      exact: true,
    })
    .click();
  await page
    .getByRole('option', { name: 'Aceitos pelo eSocial', exact: true })
    .click();
  const acceptedCard = panel
    .getByRole('listitem')
    .filter({ hasText: validEmployee.name });
  await expect(acceptedCard).toContainText(accepted.receipt);
  await expect(acceptedCard).toContainText('Eventos aceitos: 1 de 1.');
  const requestedDeclaration = waitForApi(
    page,
    'GET',
    `/companies/${companyId}/esocial-initial/2240/${item.initialRunId}`,
  );
  await acceptedCard
    .getByRole('button', { name: 'Ver declaração e retorno', exact: true })
    .click();
  const opened = await assertStatus(await requestedDeclaration, 200);
  expect(opened.id).toBe(item.initialRunId);
  expect(opened.events).toHaveLength(1);
  expect(opened.events[0].delivery.receipt).toBe(accepted.receipt);
  const declaration = page.getByRole('region', {
    name: 'Declaração S-2240 em consulta',
    exact: true,
  });
  await expect(declaration).toContainText(validEmployee.name);
  await expect(declaration).toContainText(accepted.receipt);
  await expect(declaration).toContainText('Aceito pelo eSocial');
  await expect(
    page.getByRole('combobox', {
      name: 'Preparações e envios desta empresa',
      exact: true,
    }),
  ).toContainText('Declaração da execução');
  // Return to this execution's bounded list; no company-wide pagination is used
  // to locate the declaration and no new preparation was manufactured by the link.
  await panel
    .getByRole('combobox', {
      name: 'Situação dos empregados nesta execução',
      exact: true,
    })
    .click();
  await page
    .getByRole('option', { name: 'Todas as situações', exact: true })
    .click();

  // The screen renders fifty rows at a time rather than loading the cohort.
  const rows = panel.getByRole('list', {
    name: 'Resultados dos empregados da execução',
    exact: true,
  });
  await expect(rows.getByRole('listitem')).toHaveCount(50);
  const firstIds = (
    await call(page, 'GET', `${root}/${run.id}/items`)
  ).items.map((row: any) => row.id);
  const secondPage = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      response.request().method() === 'GET' &&
      url.origin === fixture.apiURL &&
      url.pathname === `${root}/${run.id}/items` &&
      url.searchParams.has('cursor')
    );
  });
  await panel
    .getByRole('button', { name: 'Próxima página de empregados', exact: true })
    .click();
  const pageTwo = await assertStatus(await secondPage, 200);
  expect(pageTwo.items).toHaveLength(50);
  expect(pageTwo.items.every((row: any) => !firstIds.includes(row.id))).toBe(
    true,
  );
  await expect(panel).toContainText('Página 2 · 50 empregados nesta página.');
  await panel
    .getByRole('combobox', {
      name: 'Situação dos empregados nesta execução',
      exact: true,
    })
    .click();
  await page
    .getByRole('option', { name: 'Informações para corrigir', exact: true })
    .click();
  await expect(rows.getByRole('listitem')).toHaveCount(1);
  await expect(rows).toContainText(blockedEmployee.name);
  await expect(rows).toContainText('Corrija as informações na origem');
  await expect(rows).toContainText('Nenhum evento gerado para este empregado.');
  await expect(panel).toContainText('Página 1 · 1 empregado nesta página.');
  await page.setViewportSize({ width: 390, height: 844 });
  await rows.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('qa-envio-massa-bloqueado-390.png'),
    fullPage: true,
  });

  await panel
    .getByRole('button', { name: 'Cancelar somente pendências', exact: true })
    .click();
  const cancelResponse = waitForApi(
    page,
    'POST',
    `${root}/${run.id}/cancel-pending`,
  );
  await panel
    .getByRole('button', {
      name: 'Confirmar cancelamento das pendências',
      exact: true,
    })
    .click();
  const cancelled = await assertStatus(await cancelResponse, 201);
  expect(cancelled.run.state).toBe('CANCELLED');
  expect(cancelled.run.counts.cancelled).toBe(119);
  expect(cancelled.run.counts.accepted).toBe(1);
  expect(cancelled.run.counts.blocked).toBe(1);
  expect(
    await db.sstInitialDelivery.findUniqueOrThrow({ where: { id: stored.id } }),
  ).toMatchObject({
    state: 'ACCEPTED',
    receipt: stored.receipt,
    signedXml: stored.signedXml,
  });

  // Starting another authorized cohort must include the late employee, while
  // the unchanged accepted source itself produces NO_CHANGES, not a resend.
  const againResponse = waitForApi(page, 'POST', root);
  await panel
    .getByRole('button', {
      name: 'Confirmar envio S-2240 de todos os empregados para testes',
      exact: true,
    })
    .click();
  const again = (await assertStatus(await againResponse, 201)).run;
  expect(again.id).not.toBe(run.id);
  expect(again.counts.total).toBe(122);
  const before = await db.sstInitialDelivery.count({ where: { companyId } });
  const noChanges = await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/advance-dispatch`,
    { runId: again.id, phase: 'PREPARE', employeeId: validEmployee.id },
  );
  expect(noChanges.run.counts.noChanges).toBe(1);
  expect(await db.sstInitialDelivery.count({ where: { companyId } })).toBe(
    before,
  );
  await panel
    .getByRole('button', { name: 'Atualizar execução', exact: true })
    .click();
  await panel
    .getByRole('combobox', {
      name: 'Situação dos empregados nesta execução',
      exact: true,
    })
    .click();
  await page
    .getByRole('option', { name: 'Sem alterações para enviar', exact: true })
    .click();
  await expect(rows.getByRole('listitem')).toHaveCount(1);
  await expect(rows).toContainText(validEmployee.name);
  await expect(rows).toContainText('Sem alterações para enviar');
  const cleanup = waitForApi(
    page,
    'POST',
    `${root}/${again.id}/cancel-pending`,
  );
  await panel
    .getByRole('button', { name: 'Cancelar somente pendências', exact: true })
    .click();
  await panel
    .getByRole('button', {
      name: 'Confirmar cancelamento das pendências',
      exact: true,
    })
    .click();
  expect((await assertStatus(await cleanup, 201)).run.counts.noChanges).toBe(1);
  await test.info().attach('bulk-browser-scope', {
    contentType: 'application/json',
    body: Buffer.from(
      JSON.stringify(
        {
          employeesAtClick: 121,
          nextCohort: 122,
          actualAcceptedEvents: 1,
          governmentBoundary: 'SOAP sintético',
          proves10kLoad: false,
          fixture:
            '121 registros reais, API/PG/cofre/workers reais, sem resposta do produto simulada',
        },
        null,
        2,
      ),
    ),
  });
});

test('QA envio em massa — corrigir origem e retomar itens bloqueados exige ação e não duplica declarações', async ({
  page,
}) => {
  test.setTimeout(180_000);
  test.info().annotations.push({
    type: 'qa-cases',
    description:
      'EVT-002, EVT-003; retomada explícita da execução S2240 em massa após correção de origem',
  });
  expect(fixture.deliveryEnabled).toBe(true);
  const tenant = await seedMass(page, 2, 2);
  const companyId = tenant.company.id as string;
  const socialPath = `/dashboard/empresas/${companyId}/esocial`;
  const root = `/companies/${companyId}/esocial-dispatch/runs`;
  await login(page, socialPath, {
    email: tenant.user.email,
    password: fixture.password,
  });
  await vault(page, companyId);
  const panel = page.getByRole('region', {
    name: 'Envio S-2240 de todos os empregados',
    exact: true,
  });
  const created = waitForApi(page, 'POST', root);
  await panel
    .getByRole('button', {
      name: 'Confirmar envio S-2240 de todos os empregados para testes',
      exact: true,
    })
    .click();
  const first = (await assertStatus(await created, 201)).run;
  for (const employee of tenant.employees) {
    const progressed = await call(
      page,
      'POST',
      `/companies/${companyId}/sst-domain-test/browser/advance-dispatch`,
      { runId: first.id, phase: 'PREPARE', employeeId: employee.id },
    );
    expect(progressed.processed).toBe(true);
  }
  const blocked = (await call(page, 'GET', `${root}/${first.id}`)).run;
  expect(blocked.state).toBe('COMPLETED_WITH_ISSUES');
  expect(blocked.counts.blocked).toBe(2);
  expect(await db.sstInitialDelivery.count({ where: { companyId } })).toBe(0);
  const before = await db.sstDispatchItem.findMany({
    where: { runId: first.id },
    orderBy: { employeeId: 'asc' },
  });
  expect(before.every((item: any) => item.state === 'BLOCKED')).toBe(true);

  // Correct the ordinary source through its public operational endpoint. This
  // is not a declaration or a state rewrite; resuming still needs the UI act.
  await call(page, 'POST', `/employee-history/hierarchy/${companyId}`, {
    employeeId: tenant.employees[0].id,
    hierarchyId: tenant.office.id,
    motive: 'ADM',
    startDate: '2026-01-01T12:00:00Z',
  });
  expect(
    (await call(page, 'GET', `${root}/${first.id}`)).run.counts.blocked,
  ).toBe(2);
  await panel
    .getByRole('button', { name: 'Atualizar execução', exact: true })
    .click();
  await expect(
    panel.getByRole('button', {
      name: 'Retomar itens disponíveis',
      exact: true,
    }),
  ).toBeVisible();
  const resumedResponse = waitForApi(
    page,
    'POST',
    `${root}/${first.id}/resume`,
  );
  await panel
    .getByRole('button', { name: 'Retomar itens disponíveis', exact: true })
    .click();
  const resumed = (await assertStatus(await resumedResponse, 201)).run;
  expect(resumed.id).toBe(first.id);
  expect(resumed.counts.pending).toBe(2);
  expect(resumed.counts.blocked).toBe(0);
  const after = await db.sstDispatchItem.findMany({
    where: { runId: first.id },
    orderBy: { employeeId: 'asc' },
  });
  expect(after.map((item: any) => item.id)).toEqual(
    before.map((item: any) => item.id),
  );
  expect(
    after.every(
      (item: any, i: number) => item.operationId !== before[i].operationId,
    ),
  ).toBe(true);
  expect(after.every((item: any) => item.initialRunId === null)).toBe(true);
  const replay = await call(page, 'POST', `${root}/${first.id}/resume`, {});
  expect(replay.run.id).toBe(first.id);
  expect(
    (
      await db.sstDispatchItem.findMany({
        where: { runId: first.id },
        orderBy: { employeeId: 'asc' },
      })
    ).map((item: any) => item.operationId),
  ).toEqual(after.map((item: any) => item.operationId));
  const queued = await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/advance-dispatch`,
    { runId: first.id, phase: 'PREPARE', employeeId: tenant.employees[0].id },
  );
  expect(queued.run.counts.queued).toBe(1);
  expect(await db.sstInitialDelivery.count({ where: { companyId } })).toBe(1);
  await panel
    .getByRole('button', { name: 'Atualizar execução', exact: true })
    .click();
  await expect(panel).toContainText('1 aguardando transmissão');
  const cancellation = waitForApi(
    page,
    'POST',
    `${root}/${first.id}/cancel-pending`,
  );
  await panel
    .getByRole('button', { name: 'Cancelar somente pendências', exact: true })
    .click();
  await panel
    .getByRole('button', {
      name: 'Confirmar cancelamento das pendências',
      exact: true,
    })
    .click();
  await assertStatus(await cancellation, 201);
  const delivery = await db.sstInitialDelivery.findFirstOrThrow({
    where: { companyId },
  });
  expect(delivery).toMatchObject({
    state: 'CANCELLED',
    signedXml: null,
    protocol: null,
    receipt: null,
  });
  await page.screenshot({
    path: test.info().outputPath('qa-envio-massa-retomada.png'),
    fullPage: true,
  });
});

test('QA e-mails — preferências reais, resumo incerto, conferência no provedor e destinatários somente leitura', async ({
  page,
}) => {
  test.setTimeout(300000);
  const tenant = await seedMass(page, 0, 0);
  const companyId = tenant.company.id;
  const source = await db.user.findUniqueOrThrow({
    where: { email: fixture.email },
  });
  const responsible = await db.user.create({
    data: {
      name: 'Responsável de avisos E2E',
      email: `mail-reader-${randomUUID()}@api-e2e.invalid`,
      password: source.password,
      companies: {
        create: {
          companyId,
          roles: ['1', '8', '14', '16'],
          permissions: ['14-r'],
        },
      },
    },
  });
  const path = `/dashboard/empresas/${companyId}/esocial`;
  await login(page, path, {
    email: tenant.user.email,
    password: fixture.password,
  });
  await vault(page, companyId);
  const panel = page.getByRole('region', {
    name: 'Envio S-2240 de todos os empregados',
    exact: true,
  });
  await panel
    .getByRole('button', { name: 'Avisos por e-mail', exact: true })
    .click();
  const settings = panel.getByRole('region', {
    name: 'Preferências de e-mail da empresa',
    exact: true,
  });
  await expect(
    settings.getByRole('checkbox', {
      name: 'Notificar também quem iniciou o envio',
    }),
  ).toBeEnabled();
  const input = settings.getByRole('combobox', {
    name: 'Responsáveis da empresa',
    exact: true,
  });
  await input.fill(responsible.name);
  await page
    .getByRole('option', {
      name: `${responsible.name} · ${responsible.email}`,
      exact: true,
    })
    .click();
  await settings
    .getByRole('checkbox', { name: 'Notificar também quem iniciou o envio' })
    .uncheck();
  const policySaved = waitForApi(
    page,
    'POST',
    `/companies/${companyId}/esocial-dispatch/notification-policy`,
  );
  await settings
    .getByRole('button', { name: 'Salvar preferências de e-mail', exact: true })
    .click();
  const saved = await assertStatus(await policySaved, 201);
  expect(saved.policy.responsibleUserIds).toEqual([responsible.id]);
  expect(saved.policy.notifyOperator).toBe(false);
  // A real concurrent configuration must preserve the draft on 409 and let
  // the explicit discard action fetch the new revision, rather than use cache.
  await settings
    .getByRole('checkbox', { name: 'Notificar também quem iniciou o envio' })
    .check();
  await call(
    page,
    'POST',
    `/companies/${companyId}/esocial-dispatch/notification-policy`,
    {
      expectedRevision: saved.policy.revision,
      enabled: true,
      notifyOperator: false,
      responsibleUserIds: [responsible.id],
    },
  );
  const conflict = waitForApi(
    page,
    'POST',
    `/companies/${companyId}/esocial-dispatch/notification-policy`,
  );
  await settings
    .getByRole('button', { name: 'Salvar preferências de e-mail', exact: true })
    .click();
  await assertStatus(await conflict, 409);
  await expect(
    settings.getByRole('checkbox', {
      name: 'Notificar também quem iniciou o envio',
    }),
  ).toBeChecked();
  const reloaded = waitForApi(
    page,
    'GET',
    `/companies/${companyId}/esocial-dispatch/notification-policy`,
  );
  await settings
    .getByRole('button', {
      name: 'Descartar edição e carregar configuração atual',
      exact: true,
    })
    .click();
  expect((await assertStatus(await reloaded, 200)).policy.revision).toBe(
    saved.policy.revision + 1,
  );
  await expect(
    settings.getByRole('checkbox', {
      name: 'Notificar também quem iniciou o envio',
    }),
  ).not.toBeChecked();
  await panel
    .getByRole('region', { name: 'Avisos por e-mail da empresa', exact: true })
    .screenshot({
      path: test.info().outputPath('email-preferencias-desktop.png'),
      animations: 'disabled',
    });
  await page.setViewportSize({ width: 390, height: 844 });
  await input.scrollIntoViewIfNeeded();
  await panel
    .getByRole('region', { name: 'Avisos por e-mail da empresa', exact: true })
    .screenshot({
      path: test.info().outputPath('email-preferencias-390.png'),
      animations: 'disabled',
    });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const created = waitForApi(
    page,
    'POST',
    `/companies/${companyId}/esocial-dispatch/runs`,
  );
  await panel
    .getByRole('button', {
      name: 'Confirmar envio S-2240 de todos os empregados para testes',
      exact: true,
    })
    .click();
  const { run } = await assertStatus(await created, 201);
  expect(run.counts.total).toBe(0);
  await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/advance-dispatch`,
    { runId: run.id, phase: 'PREPARE' },
  );
  const summary = await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/advance-summary-mail`,
    { runId: run.id, outcome: 'UNKNOWN' },
  );
  expect(summary.providerCalls).toBe(1);
  // A real reload verifies persisted preferences, notification and uncertain outcome.
  await page.reload();
  const fresh = page.getByRole('region', {
    name: 'Envio S-2240 de todos os empregados',
    exact: true,
  });
  await fresh
    .getByRole('button', { name: 'Avisos por e-mail', exact: true })
    .click();
  await expect(fresh).toContainText('Resultado incerto — conferir provedor');
  await fresh
    .getByRole('button', { name: 'Conferir resultado do e-mail', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Conferir resultado do e-mail',
    exact: true,
  });
  await expect(
    dialog.getByRole('button', { name: 'Registrar conferência', exact: true }),
  ).toBeDisabled();
  await dialog
    .getByLabel('Conferência realizada', { exact: true })
    .fill('Provedor sintético confirmou que não recebeu esta tentativa.');
  await expect(
    dialog.getByRole('button', { name: 'Registrar conferência', exact: true }),
  ).toBeDisabled();
  await dialog
    .getByRole('combobox', { name: 'Resultado da conferência', exact: true })
    .click();
  await page
    .getByRole('option', {
      name: 'Provedor confirmou que não recebeu: tentar novamente',
      exact: true,
    })
    .click();
  await dialog
    .getByRole('checkbox', {
      name: 'Conferi o resultado desta tentativa no provedor de e-mail',
      exact: true,
    })
    .check();
  await page.screenshot({
    path: test.info().outputPath('email-conferencia-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: test.info().outputPath('email-conferencia-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  const resolve = waitForApi(
    page,
    'POST',
    `/companies/${companyId}/esocial-dispatch/runs/${run.id}/notifications/${(await db.sstDispatchMail.findFirstOrThrow({ where: { notice: { runId: run.id } } })).id}/resolve`,
  );
  await dialog
    .getByRole('button', { name: 'Registrar conferência', exact: true })
    .click();
  await assertStatus(await resolve, 201);
  await expect(dialog).toBeHidden();
  expect(
    (
      await call(
        page,
        'POST',
        `/companies/${companyId}/sst-domain-test/browser/advance-summary-mail`,
        { runId: run.id, outcome: 'ACCEPTED' },
      )
    ).providerCalls,
  ).toBe(1);
  await page.reload();
  const done = page.getByRole('region', {
    name: 'Envio S-2240 de todos os empregados',
    exact: true,
  });
  await done
    .getByRole('button', { name: 'Avisos por e-mail', exact: true })
    .click();
  await expect(done).toContainText('Aceito pelo provedor de e-mail');
  await expect(done.getByRole('region', { name: 'Avisos por e-mail da empresa', exact: true }).locator('.MuiCollapse-root').first()).toHaveClass(/MuiCollapse-entered/);
  await done
    .getByRole('region', { name: 'Avisos por e-mail da empresa', exact: true })
    .screenshot({
      path: test.info().outputPath('email-aceito-390.png'),
      animations: 'disabled',
    });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .locator('header')
    .getByText(tenant.user.name, { exact: true })
    .click();
  await page.getByText('Sair do App', { exact: true }).click();
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await login(page, path, {
    email: responsible.email,
    password: fixture.password,
  });
  const readonly = page.getByRole('region', {
    name: 'Envio S-2240 de todos os empregados',
    exact: true,
  });
  await readonly
    .getByRole('button', { name: 'Avisos por e-mail', exact: true })
    .click();
  await expect(readonly).toContainText(
    'Somente quem gerencia envios pode alterar destinatários',
  );
  await expect(readonly).toContainText('Aceito pelo provedor de e-mail');
  await expect(
    readonly.getByRole('button', {
      name: 'Salvar preferências de e-mail',
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    readonly.getByRole('combobox', {
      name: 'Responsáveis da empresa',
      exact: true,
    }),
  ).toHaveCount(0);
  // Wait for the actual accordion transition; text can already be in the DOM
  // while the animated container still clips the newly loaded execution.
  await expect(readonly.getByRole('region', { name: 'Avisos por e-mail da empresa', exact: true }).locator('.MuiCollapse-root').first()).toHaveClass(/MuiCollapse-entered/);
  await readonly
    .getByRole('region', { name: 'Avisos por e-mail da empresa', exact: true })
    .screenshot({
      path: test.info().outputPath('email-somente-leitura-desktop.png'),
      animations: 'disabled',
    });
  expect(await db.sstInitialDelivery.count({ where: { companyId } })).toBe(0);
  expect(await db.sstDispatchNotice.count({ where: { runId: run.id } })).toBe(
    1,
  );
  expect(
    await db.sstDispatchMail.count({ where: { notice: { runId: run.id } } }),
  ).toBe(1);
});

test('QA envio clínico em massa — autorização única, impedimento isolado, aceite e exclusão preparada pela tela', async ({ page }) => {
  test.setTimeout(300_000);
  const tenant = await seedMass(page, 2, 0), companyId = tenant.company.id as string;
  const social = `/dashboard/empresas/${companyId}/esocial`, events = `/companies/${companyId}/esocial-events`, batches = `${events}/dispatch/runs`;
  await login(page, social, { email: tenant.user.email, password: fixture.password });
  await vault(page, companyId);
  // An incomplete RET identity is intentionally valid clinical intake, but must
  // remain blocked for transmission. It never becomes an artificial acceptance.
  await call(page, 'PATCH', `/employee/${companyId}`, { id: tenant.employees[1].id, companyId, esocialCode: '', esocialCategory: null });
  for (const [index, employee] of tenant.employees.entries()) await call(page, 'POST', `${events}/toxicology-records`, {
    operationId: randomUUID(), employeeId: employee.id, examDate: '2026-10-01', laboratoryCnpj: '11222333000181', examCode: `AB12345678${index}`,
    doctorName: 'Médico da jornada sintética', doctorCrm: '12345', doctorUf: 'SP', workerLivesAbroad: false,
  });
  await page.reload();
  await page.getByRole('combobox', { name: 'Tipo de evento', exact: true }).click();
  await page.getByRole('option', { name: 'S-2221 — Exame toxicológico', exact: true }).click();
  await page.getByRole('combobox', { name: 'Inscrição do empregador no eSocial', exact: true }).click();
  await page.getByRole('option', { name: /CNPJ base: 11222333/ }).click();
  const panel = page.getByRole('region', { name: 'Envio em massa S-2221', exact: true });
  await expect(panel).toContainText('Um cadastro impedido não bloqueia os demais');
  await panel.getByRole('button', { name: 'Enviar pendências S-2221 em massa', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Autorizar envio em massa S-2221?', exact: true });
  await expect(dialog.getByRole('button', { name: 'Confirmar execução', exact: true })).toBeDisabled();
  await expect(dialog).toContainText('não inclui exclusões automáticas');
  await dialog.screenshot({ animations: 'disabled', path: test.info().outputPath('clinico-autorizacao-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await dialog.screenshot({ animations: 'disabled', path: test.info().outputPath('clinico-autorizacao-390.png') });
  await dialog.getByRole('checkbox').check();
  const created = waitForApi(page, 'POST', batches);
  await dialog.getByRole('button', { name: 'Confirmar execução', exact: true }).click();
  const { run } = await assertStatus(await created, 201);
  expect(run.counts.total).toBe(2);
  const advance = () => call(page, 'POST', `/companies/${companyId}/sst-domain-test/browser/advance-secondary-dispatch`, { runId: run.id });
  await advance(); await advance();
  const waiting = await call(page, 'GET', `${batches}/${run.id}`);
  expect(waiting.run.counts).toMatchObject({ queued: 1, blocked: 1, accepted: 0 });
  const child = waiting.items.find((item: any) => item.state === 'QUEUED');
  expect(child.event.delivery.receipt).toBeNull();
  await panel.getByRole('button', { name: 'Atualizar acompanhamento', exact: true }).click();
  await expect(panel).toContainText('Cadastros: 2 · Aceitos: 0 · Impedidos: 1');
  // A tall element screenshot is clipped by the app's real scroll container.
  // Capture the actual phone viewport at the heading and at its progress instead.
  await panel.locator('h6').first().evaluate(element => element.scrollIntoView({ block: 'center' }));
  await page.screenshot({ animations: 'disabled', path: test.info().outputPath('clinico-controles-390.png') });
  await panel.getByText(/Cadastros: 2 · Aceitos: 0/).evaluate(element => element.scrollIntoView({ block: 'center' }));
  await page.screenshot({ animations: 'disabled', path: test.info().outputPath('clinico-pendencias-390.png') });
  const boundary = `/companies/${companyId}/sst-domain-test/browser/advance-delivery`;
  const send = await call(page, 'POST', boundary, { family: 'S-2221', deliveryId: child.event.delivery.id });
  expect(send.state).toBe('PROCESSING');
  const delay = new Date(send.availableAt).getTime() - Date.now(); if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay + 50));
  const accepted = await call(page, 'POST', boundary, { family: 'S-2221', deliveryId: child.event.delivery.id });
  expect(accepted.state).toBe('ACCEPTED'); expect(accepted.receipt).toBeTruthy();
  await advance();
  await page.goto('/dashboard'); await page.goto(social);
  await page.getByRole('combobox', { name: 'Tipo de evento', exact: true }).click();
  await page.getByRole('option', { name: 'S-2221 — Exame toxicológico', exact: true }).click();
  await expect(panel).toContainText('Cadastros: 2 · Aceitos: 1 · Impedidos: 1');
  await panel.getByText(/Cadastros: 2 · Aceitos: 1/).evaluate(element => element.scrollIntoView({ block: 'center' }));
  await page.screenshot({ animations: 'disabled', path: test.info().outputPath('clinico-resultado-390.png') });
  await panel.getByRole('button', { name: 'Abrir declaração deste cadastro', exact: true }).first().evaluate(element => element.scrollIntoView({ block: 'center' }));
  await page.screenshot({ animations: 'disabled', path: test.info().outputPath('clinico-cadastros-390.png') });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await panel.screenshot({ animations: 'disabled', path: test.info().outputPath('clinico-resultado-desktop.png') });
  expect(await db.sstSecondaryDelivery.count({ where: { companyId, state: 'ACCEPTED' } })).toBe(1);
  await page.getByRole('combobox', { name: 'Tipo de evento', exact: true }).click();
  await page.getByRole('option', { name: 'S-3000 — Exclusão de evento aceito', exact: true }).click();
  const exclusions = page.getByRole('region', { name: 'Envio em massa S-3000', exact: true });
  await expect(exclusions).toContainText('Nunca seleciona todos os eventos aceitos para excluir');
  // Choose the actual receipt and prepare through the existing individual UI.
  await page.getByRole('combobox', { name: 'Evento aceito a excluir', exact: true }).click();
  await page.getByRole('option', { name: new RegExp(accepted.receipt.replaceAll('.', '\\.')) }).click();
  await page.getByLabel('Motivo da exclusão', { exact: true }).fill('Exclusão explicitamente revisada na jornada de teste');
  const preparation = waitForApi(page, 'POST', `${events}/S-3000/prepare`);
  await page.getByRole('button', { name: 'Preparar exclusão para conferência', exact: true }).click();
  const exclusionEvent = await assertStatus(await preparation, 201); expect(exclusionEvent.state).toBe('READY');
  expect(await db.sstSecondaryDelivery.count({ where: { companyId, type: 'S-3000' } })).toBe(0);
  await exclusions.getByRole('button', { name: 'Enviar exclusões já preparadas', exact: true }).click();
  const exclusionDialog = page.getByRole('dialog', { name: 'Autorizar envio em massa S-3000?', exact: true });
  await expect(exclusionDialog).toContainText('Somente as exclusões já preparadas');
  await exclusionDialog.screenshot({ animations: 'disabled', path: test.info().outputPath('exclusao-autorizacao-desktop.png') });
  await exclusionDialog.getByRole('checkbox').check();
  const exclusionCreated = waitForApi(page, 'POST', batches);
  await exclusionDialog.getByRole('button', { name: 'Confirmar execução', exact: true }).click();
  const exclusionRun = (await assertStatus(await exclusionCreated, 201)).run; expect(exclusionRun.counts.total).toBe(1);
  await call(page, 'POST', `/companies/${companyId}/sst-domain-test/browser/advance-secondary-dispatch`, { runId: exclusionRun.id });
  const queuedExclusion = (await call(page, 'GET', `${batches}/${exclusionRun.id}`)).items[0];
  expect(queuedExclusion.eventId).toBe(exclusionEvent.id);
  const exclusionSend = await call(page, 'POST', boundary, { family: 'S-3000', deliveryId: queuedExclusion.event.delivery.id });
  const exclusionDelay = new Date(exclusionSend.availableAt).getTime() - Date.now(); if (exclusionDelay > 0) await new Promise(resolve => setTimeout(resolve, exclusionDelay + 50));
  expect((await call(page, 'POST', boundary, { family: 'S-3000', deliveryId: queuedExclusion.event.delivery.id })).state).toBe('ACCEPTED');
  await call(page, 'POST', `/companies/${companyId}/sst-domain-test/browser/advance-secondary-dispatch`, { runId: exclusionRun.id });
  await exclusions.getByRole('button', { name: 'Atualizar acompanhamento', exact: true }).click();
  await expect(exclusions).toContainText('Cadastros: 1 · Aceitos: 1');
  await exclusions.screenshot({ animations: 'disabled', path: test.info().outputPath('exclusao-resultado-desktop.png') });
  // Government acceptance of the exclusion never deletes the actual clinical source.
  expect(await db.sstToxicologyRecord.count({ where: { companyId } })).toBe(2);
  expect((await db.sstSecondaryEvent.findUniqueOrThrow({ where: { id: child.eventId } })).unsignedXml).toBeTruthy();
  const readonlyUser = await db.user.create({ data: {
    name: 'Leitor clínico do navegador', email: `clinical-readonly-${randomUUID()}@api-e2e.invalid`, password: tenant.user.password,
    companies: { create: { companyId, roles: ['1'], permissions: ['14-r'] } },
  } });
  await page.locator('header').getByText(tenant.user.name, { exact: true }).click();
  await page.getByText('Sair do App', { exact: true }).click();
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await login(page, social, { email: readonlyUser.email, password: fixture.password });
  await page.getByRole('combobox', { name: 'Tipo de evento', exact: true }).click();
  await page.getByRole('option', { name: 'S-2221 — Exame toxicológico', exact: true }).click();
  await expect(panel).toContainText('Cadastros: 2 · Aceitos: 1 · Impedidos: 1');
  await expect(panel.getByRole('button', { name: 'Enviar pendências S-2221 em massa', exact: true })).toHaveCount(0);
  await expect(panel.getByRole('button', { name: 'Retomar preparações impedidas', exact: true })).toHaveCount(0);
  await panel.screenshot({ animations: 'disabled', path: test.info().outputPath('clinico-somente-leitura-desktop.png') });

});


test('QA ambientes — cliente usa produção e somente master escolhe testes', async ({ page }) => {
  test.setTimeout(240000);
  for (const master of [false, true]) {
    const tenant = await seedMass(page, 0, 0, master);
    await login(page, `/dashboard/empresas/${tenant.company.id}/esocial`, {
      email: tenant.user.email, password: fixture.password,
    });
    const bulk = page.getByRole('region', { name: 'Envio S-2240 de todos os empregados', exact: true });
    const choice = bulk.getByRole('combobox', { name: 'Ambiente do envio de todos os empregados', exact: true });
    if (master) {
      await expect(choice).toBeVisible();
      await expect(bulk).toContainText('para testes');
      await choice.click();
      await page.getByRole('option', { name: 'Produção — envio oficial', exact: true }).click();
      await expect(bulk).toContainText('em produção');
    } else {
      await expect(choice).toHaveCount(0);
      await expect(page.getByRole('combobox', { name: 'Ambiente do eSocial', exact: true })).toHaveCount(0);
      await expect(page.getByRole('combobox', { name: 'Ambiente destes eventos', exact: true })).toHaveCount(0);
      await expect(bulk).toContainText('em produção');
      await expect(bulk.getByRole('button', { name: /para testes/ })).toHaveCount(0);
    }
    await page.screenshot({ path: test.info().outputPath(master ? 'ambiente-master.png' : 'ambiente-cliente.png'), fullPage: true, animations: 'disabled' });
    await page.context().clearCookies();
  }
});
