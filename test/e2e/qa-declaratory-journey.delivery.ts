import fs from 'node:fs';
import { createHash, randomInt, randomUUID } from 'node:crypto';
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

/**
 * Separate --browser-delivery suite. The ordinary buttons prepare and confirm;
 * the harness endpoint ONLY advances an already queued production worker.
 * PFX import, vault resolution, signatures, PostgreSQL and SOAP parsing are real.
 * Only the government boundary is synthetic. No accepted row/clock is fabricated.
 */
type Journey = {
  companyId: string;
  workspaceId: string;
  email: string;
  employee: { id: number; name: string; cpf: string };
  group: { id: string; name: string };
  factor: { id: string; name: string };
  inventoryId: string;
};
type Pins = { signing: string; transmitter: string };
const rights = [
  // This sandbox journey deliberately uses a master tester. Ordinary customer
  // actors default to production and are covered by the environment UX case.
  'master-crud',
  '2-cru',
  '2.1-cru',
  '2.2-cru',
  '3-cru',
  '4.0-cru',
  '4.1-cru',
  '4.2-cru',
  '4.3-cru',
  '4.6-cru',
  '6-cru',
  '10-r',
  '14-cru',
  '14.1-cru',
  '15-r',
  '26-cr',
  '26.1-u',
];
const path = (j: Journey, section: string) =>
  `/dashboard/empresas/${j.companyId}/${section}`;
const initial = (j: Journey) =>
  `/companies/${j.companyId}/esocial-initial/2240`;
const secondary = (j: Journey) => `/companies/${j.companyId}/esocial-events`;
const auth = async (page: Page) => {
  const token = (await page.context().cookies()).find(
    (c) => c.name === 'nextauth.token',
  )?.value;
  expect(
    token,
    'The real login must establish the company session',
  ).toBeTruthy();
  return { Authorization: `Bearer ${token}` };
};
async function api(page: Page, method: string, url: string, body?: unknown) {
  const response = await page.request.fetch(fixture.apiURL + url, {
    method,
    headers: await auth(page),
    ...(body === undefined ? {} : { data: body }),
  });
  expect(response.status(), await response.text()).toBeLessThan(400);
  return response.json();
}
function annotate(ids: string) {
  test.info().annotations.push({ type: 'qa-cases', description: ids });
  expect(
    fixture.deliveryEnabled,
    'Run this spec with the isolated --browser-delivery harness',
  ).toBe(true);
}
async function syntheticCpf() {
  for (;;) {
    const digits = Array.from({ length: 9 }, () => randomInt(0, 10));
    if (digits.every((d) => d === digits[0])) continue;
    for (const length of [9, 10]) {
      const remainder =
        digits
          .slice(0, length)
          .reduce((n, d, i) => n + d * (length + 1 - i), 0) % 11;
      digits.push(remainder < 2 ? 0 : 11 - remainder);
    }
    const cpf = digits.join('');
    if (!(await db.employee.count({ where: { cpf } }))) return cpf;
  }
}

// Raw fixture writes stop before the first declaration. All subsequent clinical
// and exposure changes use the existing frontend and normal authenticated API.
async function seedJourney(): Promise<Journey> {
  const suffix = randomUUID().slice(0, 8);
  const sourceUser = await db.user.findUniqueOrThrow({
    where: { email: fixture.email },
  });
  const sourceCompany = await db.company.findUniqueOrThrow({
    where: { id: fixture.companyId },
  });
  const company = await db.company.create({
    data: {
      name: `Empresa jornada QA ${suffix}`,
      cnpj: '11222333000181',
      type: 'MATRIZ',
      permissions: sourceCompany.permissions,
      esocialStart: new Date('2026-01-01'),
    },
  });
  const user = await db.user.create({
    data: {
      name: `Operador jornada QA ${suffix}`,
      email: `journey-${suffix}@api-e2e.invalid`,
      password: sourceUser.password,
      companies: {
        create: {
          companyId: company.id,
          roles: ['master', '1', '2', '8', '14', '15', '16', '19'],
          permissions: rights,
        },
      },
    },
  });
  const workspace = await db.workspace.create({
    data: {
      name: `Unidade jornada ${suffix}`,
      companyId: company.id,
      cnpj: '11222333000181',
      isOwner: true,
    },
  });
  const sector = await db.hierarchy.create({
    data: {
      name: `Setor jornada ${suffix}`,
      companyId: company.id,
      type: 'SECTOR',
      workspaces: { connect: { id: workspace.id } },
    },
  });
  const office = await db.hierarchy.create({
    data: {
      name: `Cargo jornada ${suffix}`,
      companyId: company.id,
      type: 'OFFICE',
      parentId: sector.id,
      description: 'Operar equipamento de teste',
      workspaces: { connect: { id: workspace.id } },
    },
  });
  const group = await db.homogeneousGroup.create({
    data: {
      name: `GSE jornada ${suffix}`,
      description: 'Grupo de trabalhadores que operam o equipamento de teste',
      companyId: company.id,
      workspaces: { connect: { id: workspace.id } },
    },
  });
  const employee = await db.employee.create({
    data: {
      companyId: company.id,
      name: `Trabalhador jornada ${suffix}`,
      cpf: await syntheticCpf(),
      admissionDate: new Date('2026-01-01'),
      esocialCode: `JOURNEY-${suffix}`,
      esocialCategory: '101',
      hierarchyId: office.id,
    },
  });
  await db.employeeHierarchyHistory.create({
    data: {
      employeeId: employee.id,
      hierarchyId: office.id,
      motive: 'ADM',
      startDate: new Date('2026-01-01T12:00:00Z'),
    },
  });
  await db.employeeHomogeneousGroupHistory.create({
    data: {
      companyId: company.id,
      employeeId: employee.id,
      homogeneousGroupId: group.id,
      startDate: new Date('2026-01-01'),
    },
  });
  const professional = await db.professional.create({
    data: {
      companyId: company.id,
      name: `Responsável sintético ${suffix}`,
      cpf: '11144477735',
      formation: [],
      certifications: [],
      councils: {
        create: {
          councilType: 'CREA',
          councilUF: 'SP',
          councilId: `J-${suffix}`,
        },
      },
    },
    include: { councils: true },
  });
  await db.professionalCouncilResponsible.create({
    data: {
      companyId: company.id,
      professionalCouncilId: professional.councils[0].id,
      startDate: new Date('2026-01-01'),
      type: 'AMB',
    },
  });
  await db.esocialTable24.upsert({
    where: { id: '01.03.001' },
    update: {},
    create: {
      id: '01.03.001',
      name: 'Agente químico sintético',
      group: '01',
      type: 'QUI',
      isQuantity: true,
    },
  });
  const factor = await db.riskFactors.create({
    data: {
      companyId: company.id,
      name: `SOLVENTE JORNADA ${suffix}`,
      type: 'QUI',
      severity: 3,
      unit: 'ppm',
      method: 'Método sintético',
      twa: '10',
      esocialCode: '01.03.001',
    },
  });
  const inventory = await db.riskFactorGroupData.create({
    data: {
      name: `Inventário jornada ${suffix}`,
      companyId: company.id,
    },
  });
  return {
    companyId: company.id,
    workspaceId: workspace.id,
    email: user.email,
    employee,
    group,
    factor,
    inventoryId: inventory.id,
  };
}

async function importTestPfx(
  page: Page,
  url: string,
  token: string,
  configuration: Record<string, string>,
  platform = false,
) {
  const response = await page.request.post(fixture.apiURL + url, {
    headers: { Authorization: `Bearer ${token}` },
    multipart: {
      file: {
        name: 'synthetic-journey.pfx',
        mimeType: 'application/x-pkcs12',
        buffer: fs.readFileSync(
          platform ? fixture.platformCertificateFile : fixture.certificateFile,
        ),
      },
      password: platform
        ? fixture.platformCertificatePassword
        : fixture.certificatePassword,
      label: 'A1 sintético da jornada QA',
      operationId: randomUUID(),
      ...configuration,
    },
  });
  expect(
    response.status(),
    'Synthetic PFX import through the real vault endpoint',
  ).toBe(201);
  const metadata = await response.json();
  expect(metadata.encryptedPrivateKey).toBeUndefined();
  expect(metadata.key).toBeUndefined();
  return metadata.id as string;
}
async function configureVault(page: Page, j: Journey): Promise<Pins> {
  // Setup uses the normal HTTP import, never inserts key material in PostgreSQL.
  let platform = await db.eSocialPlatformCredentialBinding.findUnique({
    where: { id: 'PLATFORM' },
  });
  if (!platform?.enabled) {
    const response = await page.request.post(fixture.apiURL + '/session', {
      data: {
        email: fixture.platformMasterEmail,
        password: fixture.platformMasterPassword,
      },
    });
    expect(response.status()).toBe(200);
    const session = await response.json();
    await importTestPfx(
      page,
      '/admin/esocial-credentials',
      session.token,
      {
        activation: JSON.stringify({
          expectedRevision: platform?.revision || 0,
        }),
      },
      true,
    );
    platform = await db.eSocialPlatformCredentialBinding.findUniqueOrThrow({
      where: { id: 'PLATFORM' },
    });
  }
  const token = (await auth(page)).Authorization.slice('Bearer '.length);
  const signing = await importTestPfx(
    page,
    `/companies/${j.companyId}/esocial-credentials`,
    token,
    {
      binding: JSON.stringify({
        companyId: j.companyId,
        mode: 'OWN',
        expectedRevision: 0,
      }),
    },
  );
  const binding = await db.eSocialCredentialBinding.findUniqueOrThrow({
    where: { companyId: j.companyId },
  });
  expect(binding.credentialId).toBe(signing);
  expect(binding.enabled).toBe(true);
  expect(platform.enabled).toBe(true);
  const [signer, transmitter] = await Promise.all([
    db.eSocialCredential.findUniqueOrThrow({ where: { id: signing } }),
    db.eSocialCredential.findUniqueOrThrow({
      where: { id: platform.credentialId },
    }),
  ]);
  expect(signer).toMatchObject({
    scope: 'COMPANY',
    ownerCompanyId: j.companyId,
    registration: '11222333000181',
  });
  expect(transmitter).toMatchObject({
    scope: 'PLATFORM',
    ownerCompanyId: fixture.platformCompanyId,
    registration: '44555666000100',
  });
  expect(signer.fingerprint).not.toBe(transmitter.fingerprint);
  expect(signer.encryptedPrivateKey).not.toContain('PRIVATE KEY');
  expect(transmitter.encryptedPrivateKey).not.toContain('PRIVATE KEY');
  return { signing, transmitter: platform.credentialId };
}
async function seedExposure(page: Page, j: Journey) {
  await api(page, 'POST', '/risk-data', {
    companyId: j.companyId,
    riskId: j.factor.id,
    homogeneousGroupId: j.group.id,
    riskFactorGroupDataId: j.inventoryId,
    workspaceId: j.workspaceId,
    startDate: '2026-01-01T12:00:00Z',
    keepEmpty: true,
    json: {
      type: 'QUI',
      twaValue: '5',
      twa: '10',
      unit: 'ppm',
      measuredOn: '2026-01-01',
      selectedMeasurement: 'twaValue',
      selectionReason: 'Amostra representativa QA',
      sstDeclaration: { exposure: 'PRESENT', epiUsed: 'NO', epcPresent: 'NO' },
    },
  });
}
async function configureResponsibility(page: Page, j: Journey) {
  await api(page, 'POST', `/companies/${j.companyId}/sst-operational/policy`, {
    fromDate: '2026-01-01',
    expectedRevision: 0,
    reason: 'Responsabilidade do emissor na jornada QA',
  });
}

async function advanceAccepted(
  page: Page,
  j: Journey,
  family: 'S-2240' | 'S-2221',
  deliveryId: string,
  pins: Pins,
) {
  const advance = () =>
    api(
      page,
      'POST',
      `/companies/${j.companyId}/sst-domain-test/browser/advance-delivery`,
      { family, deliveryId },
    );
  const sent = await advance();
  expect(sent.processed).toBe(true);
  expect(sent.state).toBe('PROCESSING');
  expect(sent.protocol).toBeTruthy();
  expect(sent.receipt).toBeNull();
  // This is the worker's real persisted polling delay, not an assertion retry
  // or a mutation of availableAt. The protocol alone must never look accepted.
  const wait = new Date(sent.availableAt).getTime() - Date.now();
  expect(Number.isFinite(wait)).toBe(true);
  expect(wait).toBeGreaterThan(0);
  expect(wait).toBeLessThan(60_000);
  await page.waitForTimeout(wait + 100);
  const accepted = await advance();
  expect(accepted.processed).toBe(true);
  expect(accepted.state).toBe('ACCEPTED');
  expect(accepted.receipt).toMatch(/^\d\.\d\.\d{19}$/);
  const table =
    family === 'S-2240' ? db.sstInitialDelivery : db.sstSecondaryDelivery;
  const persisted = await table.findUniqueOrThrow({
    where: { id: deliveryId },
  });
  expect(persisted.environment).toBe(2);
  expect(persisted.state).toBe('ACCEPTED');
  expect(persisted.credentialId).toBe(pins.signing);
  expect(persisted.transmitterCredentialId).toBe(pins.transmitter);
  expect(persisted.signedXml).toContain('Signature');
  expect(persisted.receipt).toBe(accepted.receipt);
  await test.info().attach(`worker-${family}-${deliveryId}`, {
    contentType: 'application/json',
    body: Buffer.from(
      JSON.stringify(
        {
          family,
          deliveryId,
          environment: persisted.environment,
          state: persisted.state,
          receipt: persisted.receipt,
          protocol: persisted.protocol,
          signingCredentialId: persisted.credentialId,
          transmitterCredentialId: persisted.transmitterCredentialId,
          signedXmlSha256: createHash('sha256')
            .update(persisted.signedXml)
            .digest('hex'),
          boundary:
            'SOAP sintético; API, cofre e worker reais no ambiente descartável',
        },
        null,
        2,
      ),
    ),
  });
  return persisted;
}
async function prepare2240(
  page: Page,
  j: Journey,
  mode: 'INITIAL' | 'CHANGES',
) {
  await page.goto(path(j, 'esocial'));
  await expect(
    page.getByRole('heading', { name: 'Envios S-2240', exact: true }),
  ).toBeVisible();
  const response = waitForApi(page, 'POST', initial(j) + '/prepare');
  await page
    .getByRole('button', {
      name:
        mode === 'INITIAL'
          ? 'Preparar primeiro envio'
          : 'Conferir alterações desde os envios aceitos',
      exact: true,
    })
    .click();
  const run = await assertStatus(await response, 201);
  expect(run.state, JSON.stringify(run.diagnostics)).toBe('READY');
  expect(run.environment).toBe(2);
  return run;
}
async function confirm2240(page: Page, j: Journey, run: any) {
  expect(run.events).toHaveLength(1);
  expect(
    await db.sstInitialDelivery.count({ where: { eventId: run.events[0].id } }),
  ).toBe(0);
  const response = waitForApi(page, 'POST', `${initial(j)}/${run.id}/confirm`);
  await page
    .getByRole('button', {
      name: 'Confirmar e enviar para testes',
      exact: true,
    })
    .click();
  const result = await assertStatus(await response, 201);
  expect(result.deliveries).toHaveLength(1);
  expect(result.deliveries[0].state).toBe('QUEUED');
  const queued = await db.sstInitialDelivery.findUniqueOrThrow({
    where: { id: result.deliveries[0].id },
  });
  expect(queued.state).toBe('QUEUED');
  expect(queued.signedXml).toBeNull();
  expect(queued.receipt).toBeNull();
  return queued.id as string;
}
async function editMeasurement(
  page: Page,
  j: Journey,
  value: string,
  intent: 'CORRECTION' | 'NEW_CONDITION',
  on: string,
  currentPeriodStart = on,
) {
  await page.goto(path(j, `novo/sst?active=2&tabWorkspaceId=${j.workspaceId}`));
  await page.getByText(j.group.name, { exact: true }).click();
  await page
    .getByRole('tab', { name: 'Fatores de Riscos', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Expandir todos', exact: true })
    .click();
  const riskCards = page
    .locator('.item_box')
    .filter({ has: page.getByText(j.factor.name, { exact: true }) })
    .locator('..');
  const currentRisk = riskCards
    .filter({
      has: page.getByText(`início: ${currentPeriodStart}`, { exact: true }),
    })
    .filter({ has: page.getByText('fim: em aberto', { exact: true }) });
  // History legitimately contains two rows after the April condition. Select
  // the visible open period explicitly, never a positional first/last match.
  await expect(currentRisk).toHaveCount(1);
  await expect(
    currentRisk.getByText(`início: ${currentPeriodStart}`, { exact: true }),
  ).toBeVisible();
  if (currentPeriodStart === '01/04/2026') {
    await expect(riskCards).toHaveCount(2);
    const closedRisk = riskCards
      .filter({ has: page.getByText('início: 01/01/2026', { exact: true }) })
      .filter({
        has: page.getByText('válido antes de: 01/04/2026', { exact: true }),
      });
    await expect(closedRisk).toHaveCount(1);
    await expect(
      closedRisk.getByText('válido antes de: 01/04/2026', { exact: true }),
    ).toBeVisible();
  }
  await currentRisk
    .locator('..')
    .locator('..')
    .getByText('Quantitativo', { exact: true })
    .click();
  await page.locator('input[name="twaValue"]').fill(value);
  await page
    .getByRole('button', { name: 'Salvar', exact: true })
    .last()
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Como esta alteração afeta o período?',
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole('combobox', { name: 'Natureza da alteração', exact: true })
    .click();
  await page
    .getByRole('option', {
      name:
        intent === 'CORRECTION'
          ? 'Corrigir informação deste período'
          : 'Registrar mudança nas condições',
      exact: true,
    })
    .click();
  await dialog
    .getByRole('textbox', {
      name:
        intent === 'CORRECTION'
          ? 'Data dentro do período a corrigir'
          : 'Início da nova condição',
      exact: true,
    })
    .fill(on);
  await dialog
    .getByLabel('Motivo da alteração', { exact: true })
    .fill(
      intent === 'CORRECTION'
        ? 'Corrigir o valor informado no período existente'
        : 'Mudança real da exposição desde a data informada',
    );
  const saved = waitForApi(page, 'POST', '/risk-data');
  await dialog
    .getByRole('button', { name: 'Confirmar e salvar', exact: true })
    .click();
  await assertStatus(await saved, 201);
  await expect(dialog).toHaveCount(0);
}
async function showAccepted2240(page: Page, j: Journey, receipt: string) {
  await page
    .getByRole('button', { name: 'Atualizar resultado', exact: true })
    .click();
  const table = page.getByRole('table', {
    name: 'Eventos S-2240 preparados',
    exact: true,
  });
  await expect(table).toContainText(receipt);
  await expect(table).toContainText('Aceito pelo eSocial');
  await expect(table).toContainText(j.employee.name);
}

async function openExamHistory(page: Page, j: Journey) {
  await page.goto(path(j, 'empregados'));
  await page.getByText(j.employee.name, { exact: true }).first().click();
  await page.getByText('Histórico de Exames', { exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Exames toxicológicos', exact: true }),
  ).toBeVisible();
}
async function createToxicology(page: Page, j: Journey) {
  await openExamHistory(page, j);
  await page
    .getByRole('button', { name: 'Cadastrar exame toxicológico', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Cadastrar exame toxicológico',
    exact: true,
  });
  await dialog
    .getByRole('textbox', { name: 'Data de realização do exame', exact: true })
    .fill('01/10/2026');
  await dialog
    .getByLabel('CNPJ do laboratório', { exact: true })
    .fill('11222333000181');
  await dialog
    .getByLabel('Código do exame', { exact: true })
    .fill('AB123456789');
  await dialog
    .getByLabel('Nome do médico responsável', { exact: true })
    .fill('Médico original da jornada');
  await dialog.getByLabel('CRM do médico', { exact: true }).fill('12345');
  await dialog
    .getByRole('combobox', { name: 'UF do CRM', exact: true })
    .click();
  await page.getByRole('option', { name: 'SP', exact: true }).click();
  await dialog
    .getByRole('combobox', {
      name: 'Empregado reside no exterior?',
      exact: true,
    })
    .click();
  await page.getByRole('option', { name: 'Não', exact: true }).click();
  const response = waitForApi(
    page,
    'POST',
    secondary(j) + '/toxicology-records',
  );
  await dialog
    .getByRole('button', { name: 'Salvar exame', exact: true })
    .click();
  const record = await assertStatus(await response, 201);
  await expect(dialog).toHaveCount(0);
  return record;
}
async function correctDoctor(
  page: Page,
  j: Journey,
  recordId: string,
  name: string,
) {
  await openExamHistory(page, j);
  await page
    .getByRole('button', { name: 'Corrigir exame', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Corrigir exame toxicológico',
    exact: true,
  });
  await dialog
    .getByLabel('Nome do médico responsável', { exact: true })
    .fill(name);
  await dialog
    .getByLabel('Motivo da correção', { exact: true })
    .fill('Correção conferida pelo autor do exame');
  const response = waitForApi(
    page,
    'PATCH',
    secondary(j) + `/toxicology-records/${recordId}`,
  );
  await dialog
    .getByRole('button', { name: 'Salvar exame', exact: true })
    .click();
  await assertStatus(await response, 200);
  await expect(dialog).toHaveCount(0);
}
async function selectToxicology(page: Page, j: Journey) {
  await page.goto(path(j, 'esocial'));
  await page
    .getByRole('combobox', { name: 'Tipo de evento', exact: true })
    .click();
  await page
    .getByRole('option', { name: 'S-2221 — Exame toxicológico', exact: true })
    .click();
  await page
    .getByRole('combobox', {
      name: 'Exame toxicológico cadastrado',
      exact: true,
    })
    .click();
  await page.getByRole('option', { name: new RegExp(j.employee.name) }).click();
}
async function prepareToxicology(page: Page, j: Journey, original: boolean) {
  await selectToxicology(page, j);
  if (original) {
    await page
      .getByRole('combobox', {
        name: 'Inscrição do empregador no eSocial',
        exact: true,
      })
      .click();
    await page.getByRole('option', { name: /11222333000181$/ }).click();
  } else {
    // The shared selector remains available for a separate bulk authorization.
    // Individual corrections inherit the accepted employer, regardless of it.
    await expect(page.getByText(/A retificação usará o recibo/)).toBeVisible();
    await page.getByRole('combobox', {
      name: 'Inscrição do empregador no eSocial', exact: true,
    }).click();
    await page.getByRole('option', { name: 'Selecione a inscrição cadastrada', exact: true }).click();
  }
  await page
    .getByLabel('Motivo do envio ou da retificação', { exact: true })
    .fill('Conferência do evento pela jornada de usuário QA');
  const response = waitForApi(page, 'POST', secondary(j) + '/S-2221/prepare');
  await page
    .getByRole('button', {
      name: 'Preparar evento para conferência',
      exact: true,
    })
    .click();
  const preparedResponse = await response;
  const request = preparedResponse.request().postDataJSON();
  if (!original) expect(request).not.toHaveProperty('employerRegistration');
  const event = await assertStatus(preparedResponse, 201);
  expect(event.state, JSON.stringify(event.diagnostics)).toBe('READY');
  expect(event.environment).toBe(2);
  return event;
}
async function confirmToxicology(page: Page, j: Journey, event: any) {
  expect(
    await db.sstSecondaryDelivery.count({ where: { eventId: event.id } }),
  ).toBe(0);
  const response = waitForApi(
    page,
    'POST',
    secondary(j) + `/S-2221/${event.id}/confirm`,
  );
  await page
    .getByRole('region', {
      name: 'Conferência do evento adicional',
      exact: true,
    })
    .getByRole('button', {
      name: 'Confirmar transmissão deste evento',
      exact: true,
    })
    .click();
  const result = await assertStatus(await response, 201);
  expect(result.delivery.state).toBe('QUEUED');
  expect(result.delivery.receipt).toBeNull();
  return result.delivery.id as string;
}
async function showAcceptedToxicology(page: Page, receipt: string) {
  const region = page.getByRole('region', {
    name: 'Conferência do evento adicional',
    exact: true,
  });
  await expect(region).toContainText(receipt);
  await expect(region).toContainText('Aceito pelo eSocial');
}

test.afterAll(async () => db.$disconnect());

test('QA entrega S2240 — confirmar pela tela, retificar, abrir nova condição e não reenviar conteúdo igual', async ({
  page,
}) => {
  test.setTimeout(360_000);
  annotate(
    'EVT-001, EVT-003, EVT-006, EVT-007, EVT-008, EVT-009, HIS-002, HIS-003, HIS-013',
  );
  const j = await seedJourney();
  await login(page, path(j, 'esocial'), {
    email: j.email,
    password: fixture.password,
  });
  const pins = await configureVault(page, j);
  await configureResponsibility(page, j);
  await seedExposure(page, j);

  const first = await prepare2240(page, j, 'INITIAL');
  expect(first.events).toHaveLength(1);
  expect(first.sourceManifest.selection).toBe('CURRENT');
  expect(first.events[0].content.agNoc[0].intConc).toBe('5');
  expect(first.events[0].operation).toBe('ORIGINAL');
  const firstDelivery = await confirm2240(page, j, first);
  const original = await advanceAccepted(
    page,
    j,
    'S-2240',
    firstDelivery,
    pins,
  );
  await showAccepted2240(page, j, original.receipt);

  await editMeasurement(page, j, '6', 'CORRECTION', '01/01/2026');
  const correction = await prepare2240(page, j, 'CHANGES');
  expect(correction.events).toHaveLength(1);
  expect(correction.events[0].operation).toBe('RECTIFICATION');
  expect(correction.events[0].rectifiedReceipt).toBe(original.receipt);
  expect(correction.events[0].effectiveFrom.slice(0, 10)).toBe('2026-01-01');
  expect(correction.events[0].content.agNoc[0].intConc).toBe('6');
  const correctionDelivery = await confirm2240(page, j, correction);
  const corrected = await advanceAccepted(
    page,
    j,
    'S-2240',
    correctionDelivery,
    pins,
  );
  expect(corrected.receipt).not.toBe(original.receipt);
  await showAccepted2240(page, j, corrected.receipt);

  await editMeasurement(
    page,
    j,
    '8',
    'NEW_CONDITION',
    '01/04/2026',
    '01/01/2026',
  );
  const changed = await prepare2240(page, j, 'CHANGES');
  expect(changed.events).toHaveLength(1);
  expect(changed.events[0].operation).toBe('ORIGINAL');
  expect(changed.events[0].rectifiedReceipt).toBeNull();
  expect(changed.events[0].effectiveFrom.slice(0, 10)).toBe('2026-04-01');
  expect(changed.events[0].content.agNoc[0].intConc).toBe('8');
  const changedDelivery = await confirm2240(page, j, changed);
  const acceptedChange = await advanceAccepted(
    page,
    j,
    'S-2240',
    changedDelivery,
    pins,
  );
  await showAccepted2240(page, j, acceptedChange.receipt);
  expect(
    await db.sstInitialDelivery.findUniqueOrThrow({
      where: { id: original.id },
    }),
  ).toMatchObject({
    state: 'ACCEPTED',
    signedXml: original.signedXml,
    receipt: original.receipt,
  });
  expect(
    await db.sstInitialDelivery.findUniqueOrThrow({
      where: { id: corrected.id },
    }),
  ).toMatchObject({
    state: 'ACCEPTED',
    signedXml: corrected.signedXml,
    receipt: corrected.receipt,
  });

  // Change and undo before sending. Both reviews are recorded at the origin,
  // but the final XML content must not produce a fourth transmission.
  await editMeasurement(page, j, '9', 'CORRECTION', '01/04/2026');
  await editMeasurement(page, j, '8', 'CORRECTION', '01/04/2026');
  const noChange = await prepare2240(page, j, 'CHANGES');
  expect(noChange.events).toEqual([]);
  await expect(
    page.getByText(
      'Nenhuma diferença declaratória encontrada em relação aos envios aceitos. Nenhum novo evento precisa ser transmitido.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('button', {
      name: 'Confirmar e enviar para testes',
      exact: true,
    }),
  ).toHaveCount(0);
  expect(
    await db.sstInitialDelivery.count({ where: { companyId: j.companyId } }),
  ).toBe(3);
  await page.screenshot({
    path: test.info().outputPath('qa-s2240-sem-diferenca.png'),
    fullPage: true,
  });
});

test('QA entrega S2221 — cancelar preparo, confirmar original e duas retificações com recibos próprios', async ({
  page,
}) => {
  test.setTimeout(360_000);
  annotate('EVT-001, EVT-005, EVT-007, EVT-027, HIS-014');
  const j = await seedJourney();
  await login(page, path(j, 'empregados'), {
    email: j.email,
    password: fixture.password,
  });
  const pins = await configureVault(page, j);
  await configureResponsibility(page, j);
  const source = await createToxicology(page, j);
  const cancelled = await prepareToxicology(page, j, true);
  expect(
    await db.sstSecondaryDelivery.count({ where: { companyId: j.companyId } }),
  ).toBe(0);
  const cancellation = waitForApi(
    page,
    'POST',
    secondary(j) + `/S-2221/${cancelled.id}/cancel`,
  );
  await page
    .getByRole('region', {
      name: 'Conferência do evento adicional',
      exact: true,
    })
    .getByRole('button', {
      name: 'Cancelar tentativa ainda não aceita',
      exact: true,
    })
    .click();
  const cancelledResult = await assertStatus(await cancellation, 201);
  expect(cancelledResult.state).toBe('CANCELLED');
  const cancelledDelivery = await db.sstSecondaryDelivery.findUniqueOrThrow({
    where: { eventId: cancelled.id },
  });
  expect(cancelledDelivery).toMatchObject({
    state: 'CANCELLED',
    receipt: null,
    protocol: null,
    signedXml: null,
    attempts: 0,
  });
  expect(
    await db.sstSecondaryEvent.count({
      where: { companyId: j.companyId, type: 'S-3000' },
    }),
  ).toBe(0);

  const original = await prepareToxicology(page, j, true);
  expect(original.kind).toBe('ORIGINAL');
  const originalId = await confirmToxicology(page, j, original);
  const accepted = await advanceAccepted(page, j, 'S-2221', originalId, pins);
  await showAcceptedToxicology(page, accepted.receipt);

  await correctDoctor(page, j, source.id, 'Médico corrigido primeira vez');
  const firstCorrection = await prepareToxicology(page, j, false);
  expect(firstCorrection.kind).toBe('RECTIFICATION');
  expect(firstCorrection.targetDeliveryId).toBe(accepted.id);
  expect(firstCorrection.unsignedXml).toContain(
    `<nrRecibo>${accepted.receipt}</nrRecibo>`,
  );
  expect(firstCorrection.content.ideEmpregador.nrInsc).toBe('11222333000181');
  const firstCorrectionId = await confirmToxicology(page, j, firstCorrection);
  const corrected = await advanceAccepted(
    page,
    j,
    'S-2221',
    firstCorrectionId,
    pins,
  );
  expect(corrected.receipt).not.toBe(accepted.receipt);
  await showAcceptedToxicology(page, corrected.receipt);

  await correctDoctor(page, j, source.id, 'Médico corrigido segunda vez');
  const nextCorrection = await prepareToxicology(page, j, false);
  expect(nextCorrection.targetDeliveryId).toBe(corrected.id);
  expect(nextCorrection.unsignedXml).toContain(
    `<nrRecibo>${corrected.receipt}</nrRecibo>`,
  );
  expect(nextCorrection.unsignedXml).not.toContain(
    `<nrRecibo>${accepted.receipt}</nrRecibo>`,
  );
  const nextCorrectionId = await confirmToxicology(page, j, nextCorrection);
  const latest = await advanceAccepted(
    page,
    j,
    'S-2221',
    nextCorrectionId,
    pins,
  );
  await showAcceptedToxicology(page, latest.receipt);

  await correctDoctor(
    page,
    j,
    source.id,
    'Rascunho desfeito antes de transmitir',
  );
  await correctDoctor(page, j, source.id, 'Médico corrigido segunda vez');
  await selectToxicology(page, j);
  await expect(
    page.getByText(
      'Este cadastro está igual ao último evento aceito. Nenhuma retificação é necessária.',
      { exact: true },
    ),
  ).toBeVisible();
  await page
    .getByLabel('Motivo do envio ou da retificação', { exact: true })
    .fill('Não transmitir conteúdo igual');
  await expect(
    page.getByRole('button', {
      name: 'Preparar evento para conferência',
      exact: true,
    }),
  ).toBeDisabled();
  expect(
    await db.sstSecondaryEvent.count({ where: { companyId: j.companyId } }),
  ).toBe(4);
  expect(
    await db.sstSecondaryDelivery.count({
      where: { companyId: j.companyId, state: 'ACCEPTED' },
    }),
  ).toBe(3);
  for (const retained of [accepted, corrected, latest]) {
    expect(
      await db.sstSecondaryDelivery.findUniqueOrThrow({
        where: { id: retained.id },
      }),
    ).toMatchObject({
      state: 'ACCEPTED',
      signedXml: retained.signedXml,
      receipt: retained.receipt,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole('button', {
      name: 'Preparar evento para conferência',
      exact: true,
    })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('qa-s2221-sem-retificacao-redundante-390.png'),
    fullPage: true,
  });
});
