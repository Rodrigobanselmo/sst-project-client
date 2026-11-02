import {
  test,
  expect,
  fixture,
  companyPath,
  login,
  waitForApi,
  assertStatus,
} from './fixtures';
import { db } from './database';
import { randomInt, randomUUID } from 'node:crypto';
import type { Locator, Page } from '@playwright/test';

async function captureEvidenceDialog(
  page: Page,
  dialog: Locator,
  filename: string,
  edge: 'top' | 'bottom' = 'top',
) {
  await dialog
    .locator('.MuiDialogContent-root')
    .evaluate((element, position) => {
      element.scrollLeft = 0;
      element.scrollTop = position === 'top' ? 0 : element.scrollHeight;
    }, edge);
  await dialog.getByRole('heading').first().click();
  await page.mouse.move(0, 0);
  await expect(page.getByRole('tooltip')).toBeHidden();
  await page.screenshot({
    path: test.info().outputPath(filename),
    fullPage: true,
    animations: 'disabled',
  });
}

async function expectFloatingLabelGap(
  previousControl: Locator,
  nextLabel: Locator,
) {
  await expect
    .poll(
      async () => {
        const before = await previousControl.boundingBox();
        const after = await nextLabel.boundingBox();
        return before && after ? after.y - (before.y + before.height) : -1;
      },
      {
        message:
          'Floating labels need space from the previous control or helper text',
      },
    )
    .toBeGreaterThanOrEqual(6);
}
const root = () => `/companies/${fixture.companyId}/sst-operational`;
async function unusedSyntheticCpf(companyId = fixture.companyId) {
  for (;;) {
    const digits = Array.from({ length: 9 }, () => randomInt(0, 10));
    if (digits.every((value) => value === digits[0])) continue;
    for (const size of [9, 10]) {
      const remainder =
        digits
          .slice(0, size)
          .reduce((sum, value, index) => sum + value * (size + 1 - index), 0) %
        11;
      digits.push(remainder < 2 ? 0 : 11 - remainder);
    }
    const cpf = digits.join('');
    if (
      !(await db.employee.count({
        where: { companyId, cpf },
      }))
    )
      return cpf;
  }
}
async function call(page: any, method: string, path: string, body?: any) {
  const token = (await page.context().cookies()).find(
    (c: any) => c.name === 'nextauth.token',
  )?.value;
  const r = await page.request.fetch(fixture.apiURL + path, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    ...(body && { data: body }),
  });
  expect(r.status(), await r.text()).toBeLessThan(400);
  return r.json();
}
type CatalogBrowserSetup = {
  email: string;
  companyId: string;
  workspaceId: string;
  riskGroupId: string;
  factor: { id: string; name: string };
  groupA: { id: string; name: string };
  groupB: { id: string; name: string };
  employee: { id: number; name: string };
};
let catalogSetup: CatalogBrowserSetup;
let characterizationSetup: CatalogBrowserSetup;
let matrixAvailabilitySetup: CatalogBrowserSetup;
let matrixVersionSetup: CatalogBrowserSetup;
let chemicalEvidenceSetup: CatalogBrowserSetup;
let hierarchySelectionSetup: CatalogBrowserSetup & {
  officeA: { id: string; name: string };
  officeB: { id: string; name: string };
  employeeB: { id: number; name: string };
  linkAId: number;
};

// Seed an isolated, undeclared tenant before any browser action. Other cases
// can accept real declarations without permitting raw writes to protected data
// or sharing environmental-responsible periods with this catalogue scenario.
async function seedCatalogBrowserSetup(): Promise<CatalogBrowserSetup> {
  const suffix = randomUUID().slice(0, 6);
  const sourceUser = await db.user.findUniqueOrThrow({
    where: { email: fixture.email },
  });
  const sourceCompany = await db.company.findUniqueOrThrow({
    where: { id: fixture.companyId },
  });
  const membership = await db.userCompany.findUniqueOrThrow({
    where: {
      companyId_userId: { companyId: fixture.companyId, userId: sourceUser.id },
    },
  });
  const company = await db.company.create({
    data: {
      name: 'Empresa catálogo E2E ' + suffix,
      type: 'MATRIZ',
      cnpj: '11222333000181',
      permissions: [...sourceCompany.permissions],
      esocialStart: new Date('2026-01-01'),
    },
  });
  // A real account with one membership makes SessionService select this
  // company directly. The password hash belongs only to the disposable fixture.
  const user = await db.user.create({
    data: {
      name: 'Operador catálogo E2E',
      email: `catalog-${suffix}@api-e2e.invalid`,
      password: sourceUser.password,
    },
  });
  await db.userCompany.create({
    data: {
      companyId: company.id,
      userId: user.id,
      roles: [...membership.roles],
      permissions: [...membership.permissions],
    },
  });
  const workspace = await db.workspace.create({
    data: {
      name: 'Unidade catálogo E2E',
      companyId: company.id,
      cnpj: '11222333000181',
      isOwner: true,
    },
  });
  const inventory = await db.riskFactorGroupData.create({
    data: {
      name: 'Inventário catálogo E2E',
      companyId: company.id,
    },
  });
  await db.esocialTable24.upsert({
    where: { id: '01.03.001' },
    create: {
      id: '01.03.001',
      name: 'Agente químico sintético',
      group: '01',
      type: 'QUI',
      isQuantity: true,
    },
    update: {},
  });
  const factor = await db.riskFactors.create({
    data: {
      companyId: company.id,
      name: 'SOLVENTE CATÁLOGO ' + suffix,
      type: 'QUI',
      severity: 3,
      unit: 'ppm',
      method: 'Método anterior',
      twa: '10',
      esocialCode: '01.03.001',
    },
  });
  const groupA = await db.homogeneousGroup.create({
    data: {
      companyId: company.id,
      name: 'GSE REVISADO ' + suffix,
      description: 'Avaliação selecionada para revisão do catálogo',
      workspaces: { connect: { id: workspace.id } },
    },
  });
  const groupB = await db.homogeneousGroup.create({
    data: {
      companyId: company.id,
      name: 'GSE PRESERVADO ' + suffix,
      description: 'Avaliação que conserva os metadados anteriores',
      workspaces: { connect: { id: workspace.id } },
    },
  });
  const sector = await db.hierarchy.create({
    data: {
      companyId: company.id,
      name: 'Setor catálogo ' + suffix,
      type: 'SECTOR',
      workspaces: { connect: { id: workspace.id } },
    },
  });
  const office = await db.hierarchy.create({
    data: {
      companyId: company.id,
      name: 'Cargo catálogo ' + suffix,
      type: 'OFFICE',
      parentId: sector.id,
      description: 'Avaliar exposição sintética',
      workspaces: { connect: { id: workspace.id } },
    },
  });
  const employee = await db.employee.create({
    data: {
      companyId: company.id,
      name: 'Empregado catálogo ' + suffix,
      cpf: await unusedSyntheticCpf(company.id),
      admissionDate: new Date('2026-01-01'),
      esocialCode: 'CAT-' + suffix,
      esocialCategory: '101',
      hierarchyId: office.id,
    },
  });
  await db.employeeHomogeneousGroupHistory.create({
    data: {
      companyId: company.id,
      employeeId: employee.id,
      homogeneousGroupId: groupA.id,
      startDate: new Date('2026-01-01'),
    },
  });
  const professional = await db.professional.create({
    data: {
      companyId: company.id,
      name: 'Responsável catálogo ' + suffix,
      cpf: '11144477735',
      formation: [],
      certifications: [],
      councils: {
        create: {
          councilType: 'CREA',
          councilUF: 'SP',
          councilId: 'CAT-' + suffix,
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
  return {
    email: user.email,
    companyId: company.id,
    workspaceId: workspace.id,
    riskGroupId: inventory.id,
    factor,
    groupA,
    groupB,
    employee,
  };
}
test.beforeAll(async () => {
  catalogSetup = await seedCatalogBrowserSetup();
  // A different undeclared tenant keeps the source-period scenario independent
  // of both the global fixture and shared-catalogue revisions above.
  characterizationSetup = await seedCatalogBrowserSetup();
  await db.homogeneousGroup.update({
    where: { id: characterizationSetup.groupA.id },
    data: { type: 'ACTIVITIES' },
  });
  await db.companyCharacterization.create({
    data: {
      id: characterizationSetup.groupA.id,
      companyId: characterizationSetup.companyId,
      workspaceId: characterizationSetup.workspaceId,
      name: 'Atividade fonte E2E',
      type: 'ACTIVITIES',
      activities: ['Atividade técnica inicial{type}=PARAGRAPH'],
      paragraphs: ['Descrição técnica preservada{type}=PARAGRAPH'],
      considerations: ['Conclusão preservada{type}=PARAGRAPH'],
    },
  });
  matrixAvailabilitySetup = await seedCatalogBrowserSetup();
  await db.esocialTable24.upsert({
    where: { id: '03.01.001' },
    create: {
      id: '03.01.001',
      name: 'Agente biológico sintético',
      group: '03',
      type: 'BIO',
      isQuantity: false,
    },
    update: {},
  });
  await db.riskFactors.update({
    where: { id: matrixAvailabilitySetup.factor.id },
    data: {
      type: 'BIO',
      name: 'Agente biológico da matriz E2E',
      esocialCode: '03.01.001',
      method: 'Qualitativo',
      unit: null,
    },
  });
  // Authoring happens after this tenant accepts v1. Keep it independent of
  // availability switching, so protected data is never reset through SQL.
  matrixVersionSetup = await seedCatalogBrowserSetup();
  await db.riskFactors.update({
    where: { id: matrixVersionSetup.factor.id },
    data: {
      type: 'BIO',
      name: 'Agente biológico com metodologia versionada E2E',
      esocialCode: '03.01.001',
      method: 'Qualitativo',
      unit: null,
    },
  });
  chemicalEvidenceSetup = await seedCatalogBrowserSetup();
  await db.riskFactors.update({
    where: { id: chemicalEvidenceSetup.factor.id },
    data: {
      type: 'BIO',
      name: 'Exposição já declarada E2E',
      esocialCode: '03.01.001',
      method: 'Qualitativo',
      unit: null,
    },
  });
  await db.homogeneousGroup.update({
    where: { id: chemicalEvidenceSetup.groupA.id },
    data: { type: 'ACTIVITIES' },
  });
  await db.companyCharacterization.create({
    data: {
      id: chemicalEvidenceSetup.groupA.id,
      companyId: chemicalEvidenceSetup.companyId,
      workspaceId: chemicalEvidenceSetup.workspaceId,
      name: 'Atividade de levantamento químico E2E',
      type: 'ACTIVITIES',
      activities: ['Atividade declarada preservada{type}=PARAGRAPH'],
      paragraphs: ['Descrição declarada preservada{type}=PARAGRAPH'],
    },
  });
  const selection = await seedCatalogBrowserSetup();
  const officeA = await db.hierarchy.findUniqueOrThrow({
    where: {
      id: (
        await db.employee.findUniqueOrThrow({
          where: { id: selection.employee.id },
        })
      ).hierarchyId!,
    },
  });
  await db.hierarchy.update({
    where: { id: officeA.id },
    data: { name: 'Cargo origem da atividade E2E' },
  });
  officeA.name = 'Cargo origem da atividade E2E';
  const officeB = await db.hierarchy.create({
    data: {
      companyId: selection.companyId,
      name: 'Cargo destino da atividade E2E',
      type: 'OFFICE',
      parentId: officeA.parentId,
      description: 'Executar atividade após a revisita',
      workspaces: { connect: { id: selection.workspaceId } },
    },
  });
  const employeeB = await db.employee.create({
    data: {
      companyId: selection.companyId,
      name: 'Empregado destino da atividade E2E',
      cpf: await unusedSyntheticCpf(selection.companyId),
      admissionDate: new Date('2026-01-01'),
      esocialCode: 'SEL-B',
      esocialCategory: '101',
      hierarchyId: officeB.id,
    },
  });
  await db.employeeHomogeneousGroupHistory.deleteMany({
    where: { companyId: selection.companyId },
  });
  for (const [employeeId, hierarchyId] of [
    [selection.employee.id, officeA.id],
    [employeeB.id, officeB.id],
  ] as const) {
    await db.employeeHierarchyHistory.create({
      data: {
        employeeId,
        hierarchyId,
        motive: 'ADM',
        startDate: new Date('2026-01-01'),
      },
    });
  }
  await db.homogeneousGroup.update({
    where: { id: selection.groupA.id },
    data: { name: 'Atividade com cargos datados E2E', type: 'ACTIVITIES' },
  });
  await db.companyCharacterization.create({
    data: {
      id: selection.groupA.id,
      companyId: selection.companyId,
      workspaceId: selection.workspaceId,
      name: 'Atividade com cargos datados E2E',
      type: 'ACTIVITIES',
      activities: ['Atividade declarada com vínculo explícito{type}=PARAGRAPH'],
    },
  });
  const linkA = await db.hierarchyOnHomogeneous.create({
    data: {
      homogeneousGroupId: selection.groupA.id,
      hierarchyId: officeA.id,
      startDate: new Date('2026-01-01'),
    },
  });
  await db.riskFactors.update({
    where: { id: selection.factor.id },
    data: {
      name: 'Agente biológico dos vínculos E2E',
      type: 'BIO',
      esocialCode: '03.01.001',
      method: 'Qualitativo',
      unit: null,
    },
  });
  hierarchySelectionSetup = {
    ...selection,
    officeA,
    officeB,
    employeeB,
    linkAId: linkA.id,
  };
});

test.afterAll(async () => db.$disconnect());
test('SST 5 — painel acompanha condições e filtra desde a data escolhida, sem recadastro', async ({
  page,
}) => {
  await login(page, companyPath('esocial'));
  await expect(
    page.getByRole('heading', { name: 'Acompanhamento eSocial', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Adotar cadastro', exact: true }),
  ).toHaveCount(0);
  await page
    .getByLabel('Data inicial de envio', { exact: true })
    .fill('01/01/2026');
  await page
    .getByLabel('Motivo da configuração')
    .fill('Histórico anterior enviado por outro software');
  await page.setViewportSize({ width: 390, height: 844 });
  await expectFloatingLabelGap(
    page.getByLabel('Data inicial de envio', { exact: true }).locator('..'),
    page.locator('label').filter({ hasText: /^Motivo da configuração$/ }),
  );
  await page.screenshot({
    path: test.info().outputPath('painel-tela-estreita.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const saved = waitForApi(page, 'POST', root() + '/policy');
  await page.getByRole('button', { name: 'Salvar data inicial' }).click();
  await assertStatus(await saved, 201);
  await expect(page.getByText(/Data configurada: 2026-01-01/)).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath('painel-data-inicial.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page
    .getByLabel('Data inicial de envio', { exact: true })
    .fill('01/01/2025');
  await page
    .getByLabel('Motivo da configuração')
    .fill('Incluir períodos anteriores na análise');
  const changed = waitForApi(page, 'POST', root() + '/policy');
  await page.getByRole('button', { name: 'Salvar data inicial' }).click();
  await assertStatus(await changed, 201);
  await expect(page.getByText(/Data configurada: 2025-01-01/)).toBeVisible();
  const config = await db.sstSendingPolicy.findUniqueOrThrow({
    where: { companyId: fixture.companyId },
  });
  expect(config.fromDate.toISOString().slice(0, 10)).toBe('2025-01-01');
});
test('SST 5 — medição é alterada na caracterização e exige decisão ali mesmo', async ({
  page,
}) => {
  test.setTimeout(180000);
  const suffix = randomUUID().slice(0, 6);
  await db.company.update({
    where: { id: fixture.companyId },
    data: { esocialStart: new Date('2026-01-01') },
  });
  await db.workspace.update({
    where: { id: fixture.workspaceId },
    data: { cnpj: '11222333000181', isOwner: true },
  });
  await db.esocialTable24.upsert({
    where: { id: '01.03.001' },
    create: {
      id: '01.03.001',
      name: 'Agente químico sintético',
      group: '01',
      type: 'QUI',
      isQuantity: true,
    },
    update: {},
  });
  const group = await db.homogeneousGroup.create({
    data: {
      companyId: fixture.companyId,
      name: 'GSE HISTÓRICO ' + suffix,
      description: 'Condições por vigência',
      workspaces: { connect: { id: fixture.workspaceId } },
    },
  });
  const factor = await db.riskFactors.create({
    data: {
      companyId: fixture.companyId,
      name: 'SOLVENTE HISTÓRICO ' + suffix,
      type: 'QUI',
      severity: 3,
      unit: 'ppm',
      method: 'Método de coleta',
      twa: '10',
      esocialCode: '01.03.001',
    },
  });
  const sector = await db.hierarchy.create({
    data: {
      companyId: fixture.companyId,
      name: 'Setor histórico isolado ' + suffix,
      type: 'SECTOR',
      workspaces: { connect: { id: fixture.workspaceId } },
    },
  });
  const office = await db.hierarchy.create({
    data: {
      companyId: fixture.companyId,
      name: 'Cargo histórico ' + suffix,
      type: 'OFFICE',
      parentId: sector.id,
      description: 'Trabalhar na avaliação sintética',
      workspaces: { connect: { id: fixture.workspaceId } },
    },
  });
  const employee = await db.employee.create({
    data: {
      companyId: fixture.companyId,
      name: 'Empregado histórico ' + suffix,
      cpf: await unusedSyntheticCpf(),
      admissionDate: new Date('2026-01-01'),
      esocialCode: 'BROWSER-' + suffix,
      esocialCategory: '101',
      hierarchyId: office.id,
    },
  });
  await db.employeeHomogeneousGroupHistory.create({
    data: {
      companyId: fixture.companyId,
      employeeId: employee.id,
      homogeneousGroupId: group.id,
      startDate: new Date('2026-01-01'),
    },
  });
  const professional = await db.professional.create({
    data: {
      companyId: fixture.companyId,
      name: 'Responsável histórico sintético ' + suffix,
      cpf: '11144477735',
      formation: [],
      certifications: [],
      councils: {
        create: {
          councilType: 'CREA',
          councilUF: 'SP',
          councilId: 'BROWSER-' + suffix,
        },
      },
    },
    include: { councils: true },
  });
  await db.professionalCouncilResponsible.create({
    data: {
      companyId: fixture.companyId,
      professionalCouncilId: professional.councils[0].id,
      startDate: new Date('2026-01-01'),
      type: 'AMB',
    },
  });
  await login(page);
  await page.goto(
    companyPath('novo/sst') + `?active=2&tabWorkspaceId=${fixture.workspaceId}`,
  );
  // Initial condition goes through the real operational endpoint; there is no historical adoption.
  const data = await call(page, 'POST', '/risk-data', {
    companyId: fixture.companyId,
    riskId: factor.id,
    homogeneousGroupId: group.id,
    riskFactorGroupDataId: fixture.riskGroupId,
    workspaceId: fixture.workspaceId,
    startDate: '2026-01-01T12:00:00Z',
    json: {
      type: 'QUI',
      twaValue: '5',
      twa: '10',
      measuredOn: '2026-01-01',
      selectedMeasurement: 'twaValue',
      selectionReason: 'Amostra representativa',
      unit: 'ppm',
      sstDeclaration: { exposure: 'PRESENT', epiUsed: 'NO', epcPresent: 'NO' },
    },
    keepEmpty: true,
  });
  const config = await db.sstSendingPolicy.findUnique({
    where: { companyId: fixture.companyId },
  });
  if (!config)
    await call(page, 'POST', root() + '/policy', {
      fromDate: '2026-01-01',
      reason: 'Período de responsabilidade deste emissor',
      expectedRevision: 0,
    });
  // Real preparation/signature/durable worker/poll; only the government and A1
  // identity are synthetic in this harness-only adapter. No local fixture flag.
  const accepted = await call(
    page,
    'POST',
    `/companies/${fixture.companyId}/sst-domain-test/browser/accept-2240`,
    { employeeId: employee.id },
  );
  expect(accepted.receipt).toMatch(/^\d\.\d\.\d{19}$/);
  expect(
    (
      await db.sstSendingPolicy.findUniqueOrThrow({
        where: { companyId: fixture.companyId },
      })
    ).confirmedAt,
  ).toBeNull();
  await page.reload();
  await page.getByText(group.name, { exact: true }).click();
  await page
    .getByRole('tab', { name: 'Fatores de Riscos', exact: true })
    .click();
  await page
    .locator('.item_box')
    .getByText(factor.name, { exact: true })
    .click();
  await page.getByText('Quantitativo', { exact: true }).click();
  await expect(page.locator('input[name="twaValue"]')).toBeVisible();
  await page.locator('input[name="twaValue"]').fill('8');
  await page.getByLabel('Data da medição', { exact: true }).fill('2026-03-01');
  await page.screenshot({
    path: test.info().outputPath('medicao-no-cadastro.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page
    .getByRole('button', { name: 'Salvar', exact: true })
    .last()
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Como esta alteração afeta o período?',
  });
  await expect(dialog).toBeVisible();
  expect(
    (await db.riskFactorData.findUniqueOrThrow({ where: { id: data.id } })).json
      .twaValue,
  ).toBe('5');
  await dialog.getByLabel('Natureza da alteração').click();
  await page
    .getByRole('option', { name: 'Registrar mudança nas condições' })
    .click();
  await dialog
    .getByLabel('Início da nova condição', { exact: true })
    .fill('01/03/2026');
  await dialog
    .getByLabel('Motivo da alteração')
    .fill('Mudança de exposição observada na visita');
  await expectFloatingLabelGap(
    dialog.getByLabel('Início da nova condição', { exact: true }).locator('..'),
    dialog.locator('label').filter({ hasText: /^Motivo da alteração$/ }),
  );
  await page.screenshot({
    path: test.info().outputPath('decisao-no-cadastro.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await dialog.getByLabel('Motivo da alteração').scrollIntoViewIfNeeded();
  await expectFloatingLabelGap(
    dialog.getByLabel('Início da nova condição', { exact: true }).locator('..'),
    dialog.locator('label').filter({ hasText: /^Motivo da alteração$/ }),
  );
  await expect(
    dialog.getByRole('button', { name: 'Confirmar e salvar' }),
  ).toBeInViewport();
  await page.screenshot({
    path: test.info().outputPath('decisao-tela-estreita.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const saved = waitForApi(page, 'POST', '/risk-data');
  await dialog.getByRole('button', { name: 'Confirmar e salvar' }).click();
  await assertStatus(await saved, 201);
  await expect
    .poll(
      async () =>
        (
          await db.riskFactorData.findFirstOrThrow({
            where: {
              companyId: fixture.companyId,
              riskId: factor.id,
              homogeneousGroupId: group.id,
              endDate: null,
            },
          })
        ).json.twaValue,
    )
    .toBe('8');
  const h = await call(
    page,
    'GET',
    root() +
      `/history?table=RiskFactorData&id=${data.id}&effectiveOn=2026-04-01`,
  );
  expect(
    h.periods.map((p: any) => p.assessmentSnapshot.measurementRevision.value),
  ).toEqual(['5', '8']);
  const current = await db.riskFactorData.findFirstOrThrow({
    where: {
      companyId: fixture.companyId,
      riskId: factor.id,
      homogeneousGroupId: group.id,
      endDate: null,
    },
  });
  expect(current.json.sstDeclaration).toEqual({
    exposure: 'PRESENT',
    epiUsed: 'NO',
    epcPresent: 'NO',
  });
  await page.goto(companyPath('esocial'));
  await page
    .getByRole('combobox', { name: 'Empregados para esta preparação' })
    .fill(employee.name);
  await page.getByRole('option', { name: employee.name, exact: true }).click();
  const changesResponse = waitForApi(
    page,
    'POST',
    `/companies/${fixture.companyId}/esocial-initial/2240/prepare`,
  );
  await page
    .getByRole('button', {
      name: 'Conferir alterações desde os envios aceitos',
    })
    .click();
  const changes = await assertStatus(await changesResponse, 201);
  expect(changes.state, JSON.stringify(changes.diagnostics)).toBe('READY');
  expect(changes.events).toHaveLength(1);
  expect(changes.events[0].operation).toBe('ORIGINAL');
  expect(changes.events[0].effectiveFrom.slice(0, 10)).toBe('2026-03-01');
  expect(changes.events[0].content.agNoc[0].intConc).toBe('8');
  await expect(
    page.getByRole('table', { name: 'Eventos S-2240 preparados' }),
  ).toContainText(employee.name);
  await page.screenshot({
    path: test.info().outputPath('pendencia-gerada-no-painel.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.goto(
    companyPath('novo/sst') + `?active=2&tabWorkspaceId=${fixture.workspaceId}`,
  );
  await page.getByText(group.name, { exact: true }).click();
  await page
    .getByRole('tab', { name: 'Fatores de Riscos', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Consultar histórico da avaliação' })
    .first()
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Histórico do cadastro' }),
  ).toBeVisible();
  await expect(page.getByText('5 ppm', { exact: false })).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath('historico-na-caracterizacao.png'),
    fullPage: true,
    animations: 'disabled',
  });
});

test('SST 5 — empregado pode mudar de GSE sem mudar de cargo', async ({
  page,
}) => {
  await login(page);
  const suffix = randomUUID().slice(0, 6);
  const person = await call(page, 'POST', '/employee', {
    companyId: fixture.companyId,
    name: 'GSE independente ' + suffix,
    cpf: '93541134780',
    sex: 'M',
    cidIds: [],
  });
  const group = await call(page, 'POST', '/homogeneous-groups', {
    companyId: fixture.companyId,
    name: 'GSE empregado ' + suffix,
    description: 'Associação independente',
    workspaceIds: [fixture.workspaceId],
  });
  await page.reload();
  await page.getByText(person.name, { exact: true }).click();
  await page
    .getByRole('button', { name: 'Grupos de exposição do empregado' })
    .click();
  await page
    .getByRole('combobox', { name: 'Grupo de exposição', exact: true })
    .click();
  await page.getByRole('option', { name: group.name, exact: true }).click();
  await page
    .getByLabel('Início do vínculo ao GSE', { exact: true })
    .fill('01/01/2026');
  const groupDialog = page.getByRole('dialog', {
    name: 'Grupos de exposição do empregado',
  });
  await expectFloatingLabelGap(
    groupDialog
      .getByLabel('Início do vínculo ao GSE', { exact: true })
      .locator('..'),
    groupDialog.locator('label').filter({ hasText: /^Fim do vínculo ao GSE$/ }),
  );
  await page.screenshot({
    path: test.info().outputPath('gse-formulario-vigencias.png'),
    fullPage: true,
    animations: 'disabled',
  });
  const saved = waitForApi(
    page,
    'POST',
    `/employee-exposure-groups/${fixture.companyId}`,
  );
  await page.getByRole('button', { name: 'Salvar vínculo ao GSE' }).click();
  await assertStatus(await saved, 201);
  await expect(
    page.getByRole('cell', { name: group.name, exact: true }),
  ).toBeVisible();
  const links = await db.employeeHomogeneousGroupHistory.findMany({
    where: { companyId: fixture.companyId, employeeId: person.id },
  });
  expect(links).toHaveLength(1);
  expect(
    (await db.employee.findUniqueOrThrow({ where: { id: person.id } }))
      .hierarchyId,
  ).toBeNull();
  await page.screenshot({
    path: test.info().outputPath('gse-independente-do-cargo.png'),
    fullPage: true,
    animations: 'disabled',
  });
});

test('SST 5 — condição biológica qualitativa é preenchida na caracterização sem criar medição', async ({
  page,
}) => {
  test.setTimeout(240000);
  const suffix = randomUUID().slice(0, 6);
  const company = await db.company.findUniqueOrThrow({
    where: { id: fixture.companyId },
  });
  if (!company.esocialStart)
    await db.company.update({
      where: { id: fixture.companyId },
      data: { esocialStart: new Date('2026-01-01') },
    });
  await db.workspace.update({
    where: { id: fixture.workspaceId },
    data: { cnpj: '11222333000181', isOwner: true },
  });
  await db.esocialTable24.upsert({
    where: { id: '03.01.001' },
    create: {
      id: '03.01.001',
      name: 'Agente biológico sintético',
      group: '03',
      type: 'BIO',
      isQuantity: false,
    },
    update: {},
  });
  // A colleague may already have an accepted event. Build this new worker's
  // references through the same authenticated commands used by the application.
  await login(page);
  const group = await call(page, 'POST', '/homogeneous-groups', {
    companyId: fixture.companyId,
    name: 'GSE biológico ' + suffix,
    description: 'Trabalho com materiais sintéticos',
    workspaceIds: [fixture.workspaceId],
  });
  const risk = await call(page, 'POST', '/risk', {
    companyId: fixture.companyId,
    name: 'BIOLÓGICO DECLARATÓRIO ' + suffix,
    type: 'BIO',
    severity: 3,
    method: 'Qualitativo',
    esocialCode: '03.01.001',
  });
  const sector = await call(page, 'POST', '/hierarchy/' + fixture.companyId, {
    companyId: fixture.companyId,
    name: 'Setor biológico isolado ' + suffix,
    type: 'SECTOR',
    employeesIds: [],
    workspaceIds: [fixture.workspaceId],
  });
  const office = await call(page, 'POST', '/hierarchy/' + fixture.companyId, {
    companyId: fixture.companyId,
    name: 'Cargo biológico ' + suffix,
    type: 'OFFICE',
    parentId: sector.id,
    description: 'Avaliar materiais sintéticos',
    employeesIds: [],
    workspaceIds: [fixture.workspaceId],
  });
  const employee = await call(page, 'POST', '/employee', {
    companyId: fixture.companyId,
    name: 'Empregado biológico ' + suffix,
    cpf: await unusedSyntheticCpf(),
    esocialCode: 'BIO-' + suffix,
    esocialCategory: '101',
    sex: 'M',
    cidIds: [],
  });
  await call(page, 'POST', '/employee-history/hierarchy/' + fixture.companyId, {
    employeeId: employee.id,
    hierarchyId: office.id,
    motive: 'ADM',
    startDate: '2026-01-01T12:00:00Z',
  });
  await call(page, 'POST', '/employee-exposure-groups/' + fixture.companyId, {
    employeeId: employee.id,
    homogeneousGroupId: group.id,
    startDate: '2026-01-01',
  });
  if (
    !(await db.professionalCouncilResponsible.count({
      where: { companyId: fixture.companyId, type: 'AMB' },
    }))
  ) {
    const professional = await db.professional.create({
      data: {
        companyId: fixture.companyId,
        name: 'Responsável biológico sintético',
        cpf: '11144477735',
        formation: [],
        certifications: [],
        councils: {
          create: {
            councilType: 'CREA',
            councilUF: 'SP',
            councilId: 'BIO-SYNTHETIC',
          },
        },
      },
      include: { councils: true },
    });
    await db.professionalCouncilResponsible.create({
      data: {
        companyId: fixture.companyId,
        professionalCouncilId: professional.councils[0].id,
        startDate: new Date('2026-01-01'),
        type: 'AMB',
      },
    });
  }
  const assessment = await call(page, 'POST', '/risk-data', {
    companyId: fixture.companyId,
    riskId: risk.id,
    homogeneousGroupId: group.id,
    riskFactorGroupDataId: fixture.riskGroupId,
    workspaceId: fixture.workspaceId,
    startDate: '2026-01-01T12:00:00Z',
    probability: 3,
    json: {},
    keepEmpty: true,
  });
  const beforeInvalidAbsence = (
    await db.riskFactorData.findUniqueOrThrow({ where: { id: assessment.id } })
  ).json;
  await page.goto(
    companyPath('novo/sst') + `?active=2&tabWorkspaceId=${fixture.workspaceId}`,
  );
  await page.getByText(group.name, { exact: true }).click();
  await page
    .getByRole('tab', { name: 'Fatores de Riscos', exact: true })
    .click();
  await page.locator('.item_box').getByText(risk.name, { exact: true }).click();
  await page
    .getByRole('button', { name: 'Condições para o eSocial', exact: true })
    .click();
  await expect(
    page.getByRole('combobox', { name: 'Utiliza EPI nesta avaliação?' }),
  ).toContainText('Não informado');
  await expect(
    page.getByRole('combobox', { name: 'Existe EPC nesta avaliação?' }),
  ).toContainText('Não informado');
  const select = async (label: string, value: string) => {
    await page.getByRole('combobox', { name: label }).click();
    await page.getByRole('option', { name: value, exact: true }).click();
  };
  await select('Exposição ao agente', 'Ausente');
  await select('Tipo de avaliação para o eSocial', 'Qualitativa');
  await select('Utiliza EPI nesta avaliação?', 'Não');
  await select('Existe EPC nesta avaliação?', 'Não');
  await expectFloatingLabelGap(
    page
      .getByRole('combobox', { name: 'Tipo de avaliação para o eSocial' })
      .locator('..')
      .locator('..'),
    page
      .locator('label')
      .filter({ hasText: /^Utiliza EPI nesta avaliação\?$/ }),
  );
  await page
    .getByRole('combobox', { name: 'Exposição ao agente' })
    .scrollIntoViewIfNeeded();
  const esocialShortcut = page.getByRole('button', {
    name: 'Acompanhamento eSocial',
    exact: true,
  });
  await expect(esocialShortcut).toBeVisible();
  expect(
    await esocialShortcut.evaluate(
      (button) => button.scrollWidth <= button.clientWidth,
    ),
    'The eSocial shortcut text must fit without clipping',
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath('risco-biologico-formulario.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page
    .getByRole('button', { name: 'Salvar condições da avaliação' })
    .click();
  await expect(
    page.getByText(
      'Justifique a ausência de exposição ou o não enquadramento deste risco.',
      { exact: true },
    ),
  ).toBeVisible();
  expect(
    (
      await db.riskFactorData.findUniqueOrThrow({
        where: { id: assessment.id },
      })
    ).json,
  ).toEqual(beforeInvalidAbsence);
  await select('Exposição ao agente', 'Presente');
  await page
    .getByLabel('Descrição do agente para o eSocial', { exact: true })
    .fill('Agente biológico avaliado na visita');
  await page
    .getByLabel('Observações para o eSocial', { exact: true })
    .fill('Avaliação qualitativa sem medição quantitativa.');
  const saved = waitForApi(page, 'POST', '/risk-data');
  await page
    .getByRole('button', { name: 'Salvar condições da avaliação' })
    .click();
  await assertStatus(await saved, 201);
  await expect(
    page.getByRole('dialog', { name: 'Como esta alteração afeta o período?' }),
  ).toHaveCount(0);
  const row = await db.riskFactorData.findUniqueOrThrow({
    where: { id: assessment.id },
  });
  expect(row.json.assessmentType).toBe('QUALITATIVE');
  expect(row.json.sstDeclaration).toMatchObject({
    exposure: 'PRESENT',
    epiUsed: 'NO',
    epcPresent: 'NO',
    agentDescription: 'Agente biológico avaliado na visita',
    notes: 'Avaliação qualitativa sem medição quantitativa.',
  });
  expect(row.json.twaValue).toBeUndefined();
  expect(row.json.meditions).toBeUndefined();
  await page.screenshot({
    path: test.info().outputPath('biologico-condicoes-na-caracterizacao.png'),
    fullPage: true,
    animations: 'disabled',
  });
  if (
    !(await db.sstSendingPolicy.findUnique({
      where: { companyId: fixture.companyId },
    }))
  )
    await call(page, 'POST', root() + '/policy', {
      fromDate: '2026-01-01',
      reason: 'Início da responsabilidade deste emissor',
      expectedRevision: 0,
    });
  await page.goto(companyPath('esocial'));
  await page
    .getByRole('combobox', { name: 'Empregados para esta preparação' })
    .fill(employee.name);
  await page.getByRole('option', { name: employee.name, exact: true }).click();
  const preparedResponse = waitForApi(
    page,
    'POST',
    `/companies/${fixture.companyId}/esocial-initial/2240/prepare`,
  );
  await page
    .getByRole('button', { name: 'Preparar primeiro envio', exact: true })
    .click();
  const prepared = await assertStatus(await preparedResponse, 201);
  expect(prepared.state, JSON.stringify(prepared.diagnostics)).toBe('READY');
  expect(prepared.events).toHaveLength(1);
  const agent = prepared.events[0].content.agNoc.find(
    (item: any) => item.codAgNoc === '03.01.001',
  );
  expect(agent.tpAval).toBe(2);
  expect(agent.intConc).toBeUndefined();
  await page.getByRole('button', { name: 'Conferir XML', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'XML S-2240 preparado' }),
  ).toBeVisible();
  await expect(
    page.getByLabel('Conteúdo do evento antes da assinatura'),
  ).toHaveValue(/<tpAval>2<\/tpAval>/);
  await page.screenshot({
    path: test.info().outputPath('biologico-xml-qualitativo-preparado.png'),
    fullPage: true,
    animations: 'disabled',
  });
});

test('SST catálogo — revisão no cadastro seleciona usos, preserva cancelamento e cria nova vigência', async ({
  page,
}) => {
  test.setTimeout(240000);
  const {
    companyId,
    workspaceId,
    riskGroupId,
    factor,
    groupA,
    groupB,
    employee,
  } = catalogSetup;
  const root = () => `/companies/${companyId}/sst-operational`;
  const companyPath = (section: string) =>
    `/dashboard/empresas/${companyId}/${section}`;
  await login(page, companyPath('empregados'), {
    email: catalogSetup.email,
    password: fixture.password,
  });
  const assessments: { id: string }[] = [];
  for (const group of [groupA, groupB]) {
    assessments.push(
      await call(page, 'POST', '/risk-data', {
        companyId: companyId,
        riskId: factor.id,
        homogeneousGroupId: group.id,
        riskFactorGroupDataId: riskGroupId,
        workspaceId: workspaceId,
        startDate: '2026-01-01T12:00:00Z',
        keepEmpty: true,
        json: {
          type: 'QUI',
          twaValue: '5',
          twa: '10',
          measuredOn: '2026-01-01',
          selectedMeasurement: 'twaValue',
          selectionReason: 'Amostra representativa',
          unit: 'ppm',
          sstDeclaration: {
            exposure: 'PRESENT',
            epiUsed: 'NO',
            epcPresent: 'NO',
          },
        },
      }),
    );
  }
  const [assessmentA, assessmentB] = assessments;
  if (
    !(await db.sstSendingPolicy.findUnique({
      where: { companyId: companyId },
    }))
  )
    await call(page, 'POST', root() + '/policy', {
      fromDate: '2026-01-01',
      reason: 'Teste de escopo do catálogo',
      expectedRevision: 0,
    });
  await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-2240`,
    { employeeId: employee.id },
  );
  await page.goto(companyPath(`fatores-riscos/${factor.id}/edit`));
  await expect(
    page.getByPlaceholder('descrição do fator de risco...', { exact: true }),
  ).toHaveValue(factor.name);
  const method = page.locator('input[name="method"]');
  await method.fill('Método revisado');
  const firstPreview = waitForApi(page, 'POST', root() + '/catalog/preview');
  await page
    .getByRole('button', { name: 'Salvar', exact: true })
    .first()
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Conferir alteração do catálogo',
  });
  await expect(dialog).toBeVisible();
  const review = await assertStatus(await firstPreview, 201);
  expect(review.changes).toEqual([
    { field: 'method', before: 'Método anterior', after: 'Método revisado' },
  ]);
  await expect(dialog).toContainText('Antes: Método anterior');
  await expect(dialog).toContainText('Depois: Método revisado');
  await expect(dialog.getByRole('checkbox')).toHaveCount(2);
  await expect(
    dialog.getByRole('button', { name: 'Confirmar e salvar', exact: true }),
  ).toBeDisabled();
  expect(
    (await db.riskFactors.findUniqueOrThrow({ where: { id: factor.id } }))
      .method,
  ).toBe('Método anterior');
  await dialog.getByRole('button', { name: 'Voltar ao cadastro' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(method).toHaveValue('Método revisado');
  await page
    .getByRole('button', { name: 'Salvar', exact: true })
    .first()
    .click();
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Natureza da alteração').click();
  await page
    .getByRole('option', { name: 'Registrar mudança nas condições' })
    .click();
  await dialog
    .getByLabel('Início da nova condição', { exact: true })
    .fill('01/04/2026');
  await dialog
    .getByLabel('Motivo da alteração')
    .fill('Método alterado nesta visita; somente GSE selecionado');
  await dialog
    .getByRole('checkbox', {
      name: `${groupA.name} — ${factor.name}, 01/01/2026 até em aberto`,
      exact: true,
    })
    .check();
  await expect(
    dialog.getByRole('checkbox', {
      name: `${groupB.name} — ${factor.name}, 01/01/2026 até em aberto`,
      exact: true,
    }),
  ).not.toBeChecked();
  await dialog.getByText(factor.name, { exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('catalogo-previsao-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  const assessmentSelection = dialog.getByRole('group', {
    name: 'Avaliações afetadas',
  });
  await assessmentSelection.scrollIntoViewIfNeeded();
  await expect(dialog.getByRole('checkbox').first()).toBeInViewport();
  await expect(dialog.getByRole('checkbox').last()).toBeInViewport();
  await page.screenshot({
    path: test.info().outputPath('catalogo-selecao-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await dialog.getByText(factor.name, { exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('catalogo-previsao-topo-tela-estreita.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await dialog.getByLabel('Motivo da alteração').scrollIntoViewIfNeeded();
  await expectFloatingLabelGap(
    dialog.getByLabel('Início da nova condição', { exact: true }).locator('..'),
    dialog.locator('label').filter({ hasText: /^Motivo da alteração$/ }),
  );
  await expect(
    dialog.getByRole('button', { name: 'Confirmar e salvar', exact: true }),
  ).toBeInViewport();
  await page.screenshot({
    path: test.info().outputPath('catalogo-data-tela-estreita.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await assessmentSelection.scrollIntoViewIfNeeded();
  await expect(dialog.getByRole('checkbox').first()).toBeInViewport();
  await expect(dialog.getByRole('checkbox').last()).toBeInViewport();
  await page.screenshot({
    path: test.info().outputPath('catalogo-previsao-tela-estreita.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const applied = waitForApi(page, 'POST', root() + '/catalog/apply');
  await dialog
    .getByRole('button', { name: 'Confirmar e salvar', exact: true })
    .click();
  const applyResponse = await applied;
  expect(applyResponse.status(), await applyResponse.text()).toBeLessThan(300);
  await expect(dialog).not.toBeVisible();
  const prior = await db.riskFactorData.findUniqueOrThrow({
    where: { id: assessmentA.id },
  });
  expect(prior.endDate.toISOString().slice(0, 10)).toBe('2026-04-01');
  const current = await db.riskFactorData.findFirstOrThrow({
    where: {
      companyId: companyId,
      riskId: factor.id,
      homogeneousGroupId: groupA.id,
      endDate: null,
    },
  });
  expect(current.id).not.toBe(assessmentA.id);
  expect(current.startDate.toISOString().slice(0, 10)).toBe('2026-04-01');
  const untouched = await db.riskFactorData.findUniqueOrThrow({
    where: { id: assessmentB.id },
  });
  expect(untouched.startDate.toISOString().slice(0, 10)).toBe('2026-01-01');
  expect(untouched.endDate).toBeNull();
  expect(
    await db.riskFactorData.count({
      where: {
        companyId: companyId,
        riskId: factor.id,
        homogeneousGroupId: groupB.id,
      },
    }),
  ).toBe(1);
  const changes = await call(
    page,
    'POST',
    `/companies/${companyId}/esocial-initial/2240/prepare`,
    {
      operationId: randomUUID(),
      environment: 2,
      employerRegistration: '11222333',
      employeeIds: [employee.id],
      mode: 'CHANGES',
      selection: 'CURRENT',
    },
  );
  expect(changes.state, JSON.stringify(changes.diagnostics)).toBe('READY');
  expect(changes.events).toHaveLength(1);
  expect(changes.events[0].operation).toBe('ORIGINAL');
  expect(changes.events[0].effectiveFrom.slice(0, 10)).toBe('2026-04-01');
  expect(changes.events[0].content.agNoc[0].tecMedicao).toBe('Método revisado');
});

test('SST origem — atividades são editadas no cadastro, preservam cancelamento e os períodos já declarados', async ({
  page,
}) => {
  test.setTimeout(240000);
  const {
    companyId,
    workspaceId,
    email,
    riskGroupId,
    factor,
    groupA,
    employee,
  } = characterizationSetup;
  const operational = `/companies/${companyId}/sst-operational`;
  const mutationPath = `/company/${companyId}/workspace/${workspaceId}/characterizations`;
  const editorPath = `/dashboard/empresas/${companyId}/${workspaceId}/caracterizacao-editar/${groupA.id}`;
  const beforeActivity = 'Atividade antes do primeiro envio';
  const afterActivity = 'Atividade realizada desde abril';
  await login(page, editorPath, { email, password: fixture.password });
  const editor = page.getByLabel('Atividades ou tarefas realizadas', {
    exact: true,
  });
  await expect(editor).toBeVisible();
  await editor.fill(beforeActivity);
  const ordinarySave = waitForApi(page, 'POST', mutationPath);
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await assertStatus(await ordinarySave, 201);
  await expect(
    page.getByRole('dialog', { name: 'Como esta alteração afeta o período?' }),
  ).toHaveCount(0);
  const baseline = await db.companyCharacterization.findUniqueOrThrow({
    where: { id: groupA.id },
  });
  expect(baseline.activities.join(' ')).toContain(beforeActivity);
  expect(baseline.paragraphs).toEqual([
    'Descrição técnica preservada{type}=PARAGRAPH',
  ]);
  await expect(page.locator('.SnackbarItem-variantSuccess')).toHaveCount(0, {
    timeout: 10000,
  });
  await page.screenshot({
    path: test.info().outputPath('caracterizacao-cadastro-antes-do-envio.png'),
    fullPage: true,
    animations: 'disabled',
  });

  await call(page, 'POST', '/risk-data', {
    companyId,
    riskId: factor.id,
    homogeneousGroupId: groupA.id,
    riskFactorGroupDataId: riskGroupId,
    workspaceId,
    startDate: '2026-01-01T12:00:00Z',
    keepEmpty: true,
    json: {
      type: 'QUI',
      twaValue: '5',
      twa: '10',
      measuredOn: '2026-01-01',
      selectedMeasurement: 'twaValue',
      selectionReason: 'Amostra representativa',
      unit: 'ppm',
      sstDeclaration: {
        exposure: 'PRESENT',
        epiUsed: 'NO',
        epcPresent: 'NO',
      },
    },
  });
  await call(page, 'POST', operational + '/policy', {
    fromDate: '2026-01-01',
    reason: 'Corte do teste de conteúdo da caracterização',
    expectedRevision: 0,
  });
  const accepted = await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-2240`,
    { employeeId: employee.id },
  );
  expect(accepted.receipt).toMatch(/^\d\.\d\.\d{19}$/);
  const acceptedEvent = await db.sstInitialDelivery.findFirstOrThrow({
    where: { companyId, state: 'ACCEPTED' },
    include: { event: true },
  });
  const declaredContent = JSON.stringify(acceptedEvent.event.content);
  expect(declaredContent).toContain(beforeActivity);
  expect(declaredContent).not.toContain('{type}=');

  await editor.fill(afterActivity);
  const rejectedSave = waitForApi(page, 'POST', mutationPath);
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  const required = await assertStatus(await rejectedSave, 409);
  expect(required.code).toBe('SST_DECISION_REQUIRED');
  const decision = page.getByRole('dialog', {
    name: 'Como esta alteração afeta o período?',
  });
  await expect(decision).toBeVisible();
  expect(
    (
      await db.companyCharacterization.findUniqueOrThrow({
        where: { id: groupA.id },
      })
    ).activities,
  ).toEqual(baseline.activities);
  await decision.getByRole('button', { name: 'Voltar ao cadastro' }).click();
  await expect(decision).not.toBeVisible();
  await expect(editor).toHaveText(afterActivity);

  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(decision).toBeVisible();
  await decision.getByLabel('Natureza da alteração').click();
  await page
    .getByRole('option', { name: 'Registrar mudança nas condições' })
    .click();
  await decision
    .getByLabel('Início da nova condição', { exact: true })
    .fill('01/04/2026');
  await decision
    .getByLabel('Motivo da alteração')
    .fill('Atividade observada na revisita, preservando o trabalho anterior');
  await expect(page.locator('.SnackbarItem-variantSuccess')).toHaveCount(0, {
    timeout: 10000,
  });
  await page.screenshot({
    path: test.info().outputPath('caracterizacao-decisao-no-cadastro.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await decision.getByLabel('Motivo da alteração').scrollIntoViewIfNeeded();
  await expect(
    decision.getByRole('button', { name: 'Confirmar e salvar' }),
  ).toBeInViewport();
  await page.screenshot({
    path: test.info().outputPath('caracterizacao-decisao-tela-estreita.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const applied = waitForApi(page, 'POST', mutationPath);
  await decision.getByRole('button', { name: 'Confirmar e salvar' }).click();
  await assertStatus(await applied, 201);
  await expect(decision).not.toBeVisible();
  await expect(editor).toHaveText(afterActivity);

  const historyPath =
    operational +
    `/history?table=HomogeneousGroup&id=${groupA.id}&effectiveOn=`;
  const prior = await call(page, 'GET', historyPath + '2026-01-01');
  const current = await call(page, 'GET', historyPath + '2026-04-01');
  expect(prior.condition.referenceSnapshot.declaration.activities).toBe(
    beforeActivity,
  );
  expect(prior.condition.effectiveTo.slice(0, 10)).toBe('2026-04-01');
  expect(current.condition.referenceSnapshot.declaration.activities).toBe(
    afterActivity,
  );
  expect(current.condition.effectiveFrom.slice(0, 10)).toBe('2026-04-01');
  expect(current.entity.id).toBe(prior.entity.id);
  const changes = await call(
    page,
    'POST',
    `/companies/${companyId}/esocial-initial/2240/prepare`,
    {
      operationId: randomUUID(),
      environment: 2,
      employerRegistration: '11222333',
      employeeIds: [employee.id],
      mode: 'CHANGES',
      selection: 'CURRENT',
    },
  );
  expect(changes.state, JSON.stringify(changes.diagnostics)).toBe('READY');
  expect(changes.events).toHaveLength(1);
  expect(changes.events[0].operation).toBe('ORIGINAL');
  expect(changes.events[0].effectiveFrom.slice(0, 10)).toBe('2026-04-01');
  expect(changes.events[0].content.infoAtiv.dscAtivDes).toContain(
    afterActivity,
  );
  expect(changes.events[0].content.infoAtiv.dscAtivDes).not.toContain(
    beforeActivity,
  );
  expect(changes.events[0].content.infoAtiv.dscAtivDes).not.toContain(
    '{type}=',
  );
  expect(
    JSON.stringify(
      (
        await db.sstInitialDelivery.findUniqueOrThrow({
          where: { id: acceptedEvent.id },
          include: { event: true },
        })
      ).event.content,
    ),
  ).toBe(declaredContent);
  await expect(page.locator('.SnackbarItem-variantSuccess')).toHaveCount(0, {
    timeout: 10000,
  });
  await page.screenshot({
    path: test.info().outputPath('caracterizacao-atividade-aplicada.png'),
    fullPage: true,
    animations: 'disabled',
  });

  // The table shortcut uses a different editor from the full page. A cancelled
  // decision must keep that draft too, rather than refetching and closing it.
  await page.goto(
    `/dashboard/empresas/${companyId}/novo/sst?active=1&tabWorkspaceId=${workspaceId}`,
  );
  await expect(
    page.getByRole('tab', { name: 'Elementos Caracterizados', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(
    page.getByText('Atividade fonte E2E', { exact: true }),
  ).toBeVisible();
  // The cell also contains separate AI shortcuts. Click its process indicator,
  // not the container's geometric centre, which can land on the summary icon.
  await page.getByLabel('Processos: preenchido', { exact: true }).click();
  const manager = page.getByRole('dialog', { name: /Conteúdo Técnico/ });
  await expect(manager).toBeVisible();
  await expect(
    page.getByRole('dialog', {
      name: 'Resumo do Inventário (IA)',
      exact: true,
    }),
  ).toHaveCount(0);
  await manager
    .getByRole('heading', { name: 'Processos e Atividades', exact: true })
    .locator('..')
    .locator('..')
    .getByRole('button', { name: 'Editar', exact: true })
    .click();
  const quickEditor = page.getByRole('dialog', {
    name: 'Editar Processos e Atividades',
  });
  await quickEditor
    .getByLabel('Editor de conteúdo', { exact: true })
    .fill('Rascunho da próxima visita ainda não confirmado');
  await quickEditor
    .getByRole('button', { name: 'Salvar', exact: true })
    .click();
  await expect(decision).toBeVisible();
  await decision.getByRole('button', { name: 'Voltar ao cadastro' }).click();
  await expect(decision).not.toBeVisible();
  await expect(quickEditor).toBeVisible();
  await expect(
    quickEditor.getByLabel('Editor de conteúdo', { exact: true }),
  ).toHaveText('Rascunho da próxima visita ainda não confirmado');
  expect(
    (
      await db.companyCharacterization.findUniqueOrThrow({
        where: { id: groupA.id },
      })
    ).activities.join(' '),
  ).toContain(afterActivity);
  await page.screenshot({
    path: test
      .info()
      .outputPath('caracterizacao-atalho-rascunho-preservado.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await quickEditor
    .getByRole('button', { name: 'Cancelar', exact: true })
    .click();
  await manager.getByRole('button', { name: 'Fechar', exact: true }).click();
});

test('SST matriz — disponibilidade muda sem reaplicar a metodologia nas avaliações declaradas', async ({
  page,
}) => {
  const setup = matrixAvailabilitySetup;
  const { companyId, workspaceId, factor, groupA, riskGroupId, employee } =
    setup;
  const matrixRoot = `/v2/companies/${companyId}/risk-matrices`;
  const workspaceRoot = `/v2/companies/${companyId}/workspaces/${workspaceId}/risk-matrices`;
  await login(page, `/dashboard/empresas/${companyId}/matrizes-risco`, {
    email: setup.email,
    password: fixture.password,
  });

  // The actual editor services create complete versions before acceptance.
  // Published rows are never fabricated or mutated through SQL.
  const matrix = await call(page, 'POST', matrixRoot, {
    name: 'Matriz da visita E2E',
    source: 'SYSTEM',
  });
  const v1 = await call(
    page,
    'POST',
    `${matrixRoot}/${matrix.id}/versions/${matrix.draftVersion.id}/publish`,
  );
  const draft = await call(
    page,
    'POST',
    `${matrixRoot}/${matrix.id}/versions`,
    {
      sourceVersionId: v1.id,
    },
  );
  const v2 = await call(
    page,
    'POST',
    `${matrixRoot}/${matrix.id}/versions/${draft.id}/publish`,
  );
  await call(page, 'PUT', `${workspaceRoot}/${v1.id}`);
  const risk = await call(page, 'POST', '/risk-data', {
    companyId,
    riskId: factor.id,
    homogeneousGroupId: groupA.id,
    riskFactorGroupDataId: riskGroupId,
    workspaceId,
    probability: 3,
    startDate: '2026-01-01T12:00:00Z',
    keepEmpty: true,
    json: {
      type: 'BIO',
      assessmentType: 'QUALITATIVE',
      sstDeclaration: {
        exposure: 'PRESENT',
        epiUsed: 'NO',
        epcPresent: 'NO',
      },
    },
  });
  await call(page, 'POST', '/risk-data/apply-current-risk-matrix/gse', {
    companyId,
    riskFactorGroupDataId: riskGroupId,
    homogeneousGroupId: groupA.id,
    workspaceId,
  });
  const applied = await db.riskFactorData.findUniqueOrThrow({
    where: { id: risk.id },
  });
  const appliedWorkspace = await db.riskFactorDataWorkspaceEvaluation.findMany({
    where: { companyId, riskFactorDataId: risk.id },
    orderBy: { workspaceId: 'asc' },
  });
  expect(
    [applied, ...appliedWorkspace].some(
      (row: any) =>
        row.matrixSource === 'CUSTOM' && row.matrixVersionId === v1.id,
    ),
    'The baseline must actually use v1, rather than merely have it available',
  ).toBe(true);
  await call(page, 'POST', `/companies/${companyId}/sst-operational/policy`, {
    fromDate: '2026-01-01',
    reason: 'Corte do teste de disponibilidade da matriz',
    expectedRevision: 0,
  });
  await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-2240`,
    {
      employeeId: employee.id,
    },
  );
  const baseline = async () => ({
    risk: await db.riskFactorData.findUniqueOrThrow({ where: { id: risk.id } }),
    workspaceEvaluations: await db.riskFactorDataWorkspaceEvaluation.findMany({
      where: { companyId, riskFactorDataId: risk.id },
      orderBy: { workspaceId: 'asc' },
    }),
    revisions: await db.sstHistoryRevision.count({ where: { companyId } }),
    deliveries: await db.sstInitialDelivery.findMany({
      where: { companyId },
      include: { event: true },
      orderBy: { id: 'asc' },
    }),
  });
  const before = await baseline();
  expect(before.deliveries.some((row: any) => row.state === 'ACCEPTED')).toBe(
    true,
  );

  await page.reload();
  await expect(
    page.getByText('Matriz da visita E2E', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Gerenciar disponibilidade', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: /Disponível em estabelecimentos/,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(
    'As avaliações já realizadas mantêm a matriz utilizada.',
  );
  await expect(dialog).toContainText(
    'Habilitada na v1. Há uma versão publicada mais recente.',
  );
  await page.screenshot({
    path: test.info().outputPath('matriz-disponibilidade-v1-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });

  const switching = waitForApi(page, 'POST', `${workspaceRoot}/switch`);
  await dialog
    .getByRole('button', { name: 'Disponibilizar v2', exact: true })
    .click();
  await assertStatus(await switching, 201);
  await expect(dialog).toContainText('Habilitada (v2)');
  await expect(
    page.getByRole('dialog', { name: 'Como esta alteração afeta o período?' }),
  ).toHaveCount(0);
  expect(await baseline()).toEqual(before);
  await expect(page.locator('.SnackbarItem-variantSuccess')).toHaveCount(0, {
    timeout: 10000,
  });
  await page.screenshot({
    path: test.info().outputPath('matriz-disponibilidade-v2-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    dialog.getByRole('button', { name: 'Desabilitar', exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath('matriz-disponibilidade-v2-tela-estreita.png'),
    fullPage: true,
    animations: 'disabled',
  });
  const disabling = waitForApi(page, 'DELETE', `${workspaceRoot}/${v2.id}`);
  await dialog
    .getByRole('button', { name: 'Desabilitar', exact: true })
    .click();
  await assertStatus(await disabling, 200);
  await expect(dialog).toContainText(
    'Livre para disponibilizar a versão completa.',
  );
  expect(
    await db.workspaceRiskMatrixBinding.count({
      where: { companyId, workspaceId },
    }),
  ).toBe(0);
  expect(await baseline()).toEqual(before);
  await expect(page.locator('.SnackbarItem-variantSuccess')).toHaveCount(0, {
    timeout: 10000,
  });
  await page.screenshot({
    path: test.info().outputPath('matriz-desabilitada-tela-estreita.png'),
    fullPage: true,
    animations: 'disabled',
  });

  const enabling = waitForApi(page, 'PUT', `${workspaceRoot}/${v2.id}`);
  await dialog
    .getByRole('button', { name: 'Disponibilizar', exact: true })
    .click();
  await assertStatus(await enabling, 200);
  await expect(dialog).toContainText('Habilitada (v2)');
  const enabled = await db.workspaceRiskMatrixBinding.findMany({
    where: { companyId, workspaceId },
  });
  expect(enabled.length).toBeGreaterThan(0);
  expect(enabled.every((row: any) => row.matrixVersionId === v2.id)).toBe(true);
  expect(await baseline()).toEqual(before);
  const unchanged = await call(
    page,
    'POST',
    `/companies/${companyId}/esocial-initial/2240/prepare`,
    {
      operationId: randomUUID(),
      environment: 2,
      employerRegistration: '11222333',
      employeeIds: [employee.id],
      mode: 'CHANGES',
    },
  );
  expect(unchanged.events).toHaveLength(0);
  await dialog.getByRole('button', { name: 'Fechar', exact: true }).click();
});

test('SST matriz — nova versão é criada, editada e publicada sem reescrever a metodologia declarada', async ({
  page,
}) => {
  test.setTimeout(180000);
  const setup = matrixVersionSetup;
  const { companyId, workspaceId, factor, groupA, riskGroupId, employee } =
    setup;
  const cataloguePath = `/dashboard/empresas/${companyId}/matrizes-risco`;
  const matrixRoot = `/v2/companies/${companyId}/risk-matrices`;
  const workspaceRoot = `/v2/companies/${companyId}/workspaces/${workspaceId}/risk-matrices`;
  await login(page, cataloguePath, {
    email: setup.email,
    password: fixture.password,
  });

  // Establish a real assessment using v1 before accepting the declaration.
  // From acceptance onward, all authoring is performed through the UI/API.
  const matrix = await call(page, 'POST', matrixRoot, {
    name: 'Matriz versionada E2E',
    source: 'SYSTEM',
  });
  const v1 = await call(
    page,
    'POST',
    `${matrixRoot}/${matrix.id}/versions/${matrix.draftVersion.id}/publish`,
  );
  await call(page, 'PUT', `${workspaceRoot}/${v1.id}`);
  const risk = await call(page, 'POST', '/risk-data', {
    companyId,
    riskId: factor.id,
    homogeneousGroupId: groupA.id,
    riskFactorGroupDataId: riskGroupId,
    workspaceId,
    probability: 3,
    startDate: '2026-01-01T12:00:00Z',
    keepEmpty: true,
    json: {
      type: 'BIO',
      assessmentType: 'QUALITATIVE',
      sstDeclaration: { exposure: 'PRESENT', epiUsed: 'NO', epcPresent: 'NO' },
    },
  });
  await call(page, 'POST', '/risk-data/apply-current-risk-matrix/gse', {
    companyId,
    riskFactorGroupDataId: riskGroupId,
    homogeneousGroupId: groupA.id,
    workspaceId,
  });
  await call(page, 'POST', `/companies/${companyId}/sst-operational/policy`, {
    fromDate: '2026-01-01',
    reason: 'Metodologia declarada antes da nova versão',
    expectedRevision: 0,
  });
  await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-2240`,
    {
      employeeId: employee.id,
    },
  );
  const baseline = async () => ({
    v1: await call(page, 'GET', `${matrixRoot}/${matrix.id}/versions/${v1.id}`),
    risk: await db.riskFactorData.findUniqueOrThrow({ where: { id: risk.id } }),
    workspaceEvaluations: await db.riskFactorDataWorkspaceEvaluation.findMany({
      where: { companyId, riskFactorDataId: risk.id },
      orderBy: { workspaceId: 'asc' },
    }),
    bindings: await db.workspaceRiskMatrixBinding.findMany({
      where: { companyId, workspaceId },
      orderBy: { coverageKey: 'asc' },
    }),
    revisions: await db.sstHistoryRevision.count({ where: { companyId } }),
    deliveries: await db.sstInitialDelivery.findMany({
      where: { companyId },
      include: { event: true },
      orderBy: { id: 'asc' },
    }),
  });
  const before = await baseline();
  expect(before.deliveries.some((row: any) => row.state === 'ACCEPTED')).toBe(
    true,
  );
  expect(
    [before.risk, ...before.workspaceEvaluations].some(
      (row: any) =>
        row.matrixSource === 'CUSTOM' && row.matrixVersionId === v1.id,
    ),
  ).toBe(true);

  await page.reload();
  await page
    .getByRole('button', { name: 'Criar nova versão', exact: true })
    .click();
  const newVersionDialog = page.locator('.MuiModal-root').filter({
    has: page.getByText('Criar nova versão?', { exact: true }),
  });
  await expect(newVersionDialog).toContainText(
    'não reaplica a matriz aos riscos',
  );
  await page.screenshot({
    path: test.info().outputPath('matriz-nova-versao-confirmacao-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: test.info().outputPath('matriz-nova-versao-confirmacao-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await newVersionDialog
    .getByRole('button', { name: 'Cancelar', exact: true })
    .click();
  await expect(newVersionDialog).toHaveCount(0);
  const cancelled = await call(page, 'GET', `${matrixRoot}/${matrix.id}`);
  expect(cancelled.draftVersion).toBeNull();
  expect(await baseline()).toEqual(before);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .getByRole('button', { name: 'Criar nova versão', exact: true })
    .click();
  const created = waitForApi(
    page,
    'POST',
    `${matrixRoot}/${matrix.id}/versions`,
  );
  await newVersionDialog
    .getByRole('button', { name: 'Criar nova versão', exact: true })
    .click();
  const draft = await assertStatus(await created, 201);
  expect(draft.status).toBe('DRAFT');
  expect(draft.versionNumber).toBe(2);
  await expect(page).toHaveURL(
    `${fixture.baseURL}${cataloguePath}/${matrix.id}/versoes/${draft.id}`,
  );
  await expect(page.getByText('DRAFT v2', { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      /As avaliações já realizadas mantêm a metodologia utilizada/,
    ),
  ).toBeVisible();
  expect(await baseline()).toEqual(before);

  await expect(page.locator('.SnackbarItem-variantSuccess')).toHaveCount(0, {
    timeout: 10000,
  });
  await page
    .getByRole('button', { name: 'Critério', exact: true })
    .first()
    .click();
  const criterionPopover = page.locator('.MuiPopover-paper');
  const bioCriterion = criterionPopover.getByRole('textbox', {
    name: 'BIO — Biológico',
    exact: true,
  });
  await expect(bioCriterion).toBeEditable();
  const oldCriterion = await bioCriterion.inputValue();
  const nextCriterion =
    'Critério técnico da versão 2 — exposição biológica revisada';
  expect(oldCriterion).not.toBe(nextCriterion);
  await bioCriterion.fill(nextCriterion);
  await page.screenshot({
    path: test.info().outputPath('matriz-rascunho-v2-criterio-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.keyboard.press('Escape');
  await expect(criterionPopover).toHaveCount(0);
  const saved = waitForApi(
    page,
    'PUT',
    `${matrixRoot}/${matrix.id}/versions/${draft.id}`,
  );
  await page
    .getByRole('button', { name: 'Salvar rascunho', exact: true })
    .click();
  const savedDraft = await assertStatus(await saved, 200);
  expect(
    savedDraft.axisLevels
      .flatMap((row: any) => row.criteriaByCoverage)
      .some(
        (criterion: any) =>
          criterion.coverageKey === 'BIO' &&
          criterion.criterion === nextCriterion,
      ),
  ).toBe(true);
  expect(await baseline()).toEqual(before);

  await expect(page.locator('.SnackbarItem-variantSuccess')).toHaveCount(0, {
    timeout: 10000,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole('button', { name: 'Publicar versão', exact: true })
    .click();
  const publishDialog = page.locator('.MuiModal-root').filter({
    has: page.getByText('Publicar versão?', { exact: true }),
  });
  await expect(publishDialog).toContainText(
    'os envios do eSocial mantêm a versão já utilizada',
  );
  await page.screenshot({
    path: test.info().outputPath('matriz-publicar-v2-confirmacao-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  const publishing = waitForApi(
    page,
    'POST',
    `${matrixRoot}/${matrix.id}/versions/${draft.id}/publish`,
  );
  await publishDialog
    .getByRole('button', { name: 'Publicar versão', exact: true })
    .click();
  const v2 = await assertStatus(await publishing, 201);
  expect(v2.status).toBe('PUBLISHED');
  await expect(page.getByText('Publicada v2', { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      /Para alterar os critérios ou a metodologia, crie uma nova versão/,
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Salvar rascunho', exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Critério', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Ver critério', exact: true })
    .first()
    .click();
  await expect(criterionPopover.getByRole('textbox')).toHaveCount(0);
  await expect(criterionPopover).toContainText(nextCriterion);
  await page.screenshot({
    path: test
      .info()
      .outputPath('matriz-publicada-v2-criterio-consulta-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.keyboard.press('Escape');
  expect(await baseline()).toEqual(before);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.SnackbarItem-variantSuccess')).toHaveCount(0, {
    timeout: 10000,
  });
  // The criterion popover scrolls its trigger into view on the narrow layout.
  // Restore both dashboard and matrix scroll containers before desktop evidence.
  await expect(criterionPopover).toBeHidden();
  await page.evaluate(() => {
    for (const element of document.querySelectorAll<HTMLElement>('*')) {
      if (element.scrollTop) element.scrollTop = 0;
      if (element.scrollLeft) element.scrollLeft = 0;
    }
    window.scrollTo(0, 0);
  });
  // Escape returns focus to the criterion trigger. A real click on the heading
  // clears that focus as well as hover, so its tooltip does not cover evidence.
  await page
    .getByRole('heading', { name: 'Matriz versionada E2E', exact: true })
    .click();
  await page.mouse.move(0, 0);
  await expect(page.getByRole('tooltip')).toBeHidden();
  await expect(
    page.getByText('Publicada v2', { exact: true }),
  ).toBeInViewport();
  await page.screenshot({
    path: test.info().outputPath('matriz-publicada-v2-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page
    .getByRole('button', { name: 'Voltar para o catálogo', exact: true })
    .click();
  await expect(page.getByText('Publicada v2', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Editar rascunho', exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Criar nova versão', exact: true }),
  ).toBeVisible();
  const unchanged = await call(
    page,
    'POST',
    `/companies/${companyId}/esocial-initial/2240/prepare`,
    {
      operationId: randomUUID(),
      environment: 2,
      employerRegistration: '11222333',
      employeeIds: [employee.id],
      mode: 'CHANGES',
    },
  );
  expect(unchanged.events).toHaveLength(0);
});

test('SST vínculos — seleção de cargos é atômica, datada e preserva cancelamento e concorrência', async ({
  page,
}) => {
  test.setTimeout(300000);
  const {
    companyId,
    workspaceId,
    email,
    riskGroupId,
    factor,
    groupA,
    employee,
    employeeB,
    officeA,
    officeB,
    linkAId,
  } = hierarchySelectionSetup;
  const elementName = 'Atividade com cargos datados E2E';
  const operational = `/companies/${companyId}/sst-operational`;
  const selectionPath = `/company/${companyId}/workspace/${workspaceId}/characterizations/${groupA.id}/hierarchy-selection`;
  const editorPath = `/dashboard/empresas/${companyId}/${workspaceId}/caracterizacao-editar/${groupA.id}`;
  await login(page, editorPath, { email, password: fixture.password });
  const assessment = await call(page, 'POST', '/risk-data', {
    companyId,
    riskId: factor.id,
    homogeneousGroupId: groupA.id,
    riskFactorGroupDataId: riskGroupId,
    workspaceId,
    startDate: '2026-01-01T00:00:00Z',
    keepEmpty: true,
    json: {
      type: 'BIO',
      assessmentType: 'QUALITATIVE',
      sstDeclaration: { exposure: 'PRESENT', epiUsed: 'NO', epcPresent: 'NO' },
    },
  });
  await call(page, 'POST', operational + '/policy', {
    fromDate: '2026-01-01',
    reason: 'Corte dos vínculos datados',
    expectedRevision: 0,
  });
  const accepted = await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-2240`,
    { employeeId: employee.id },
  );
  const initialDelivery = await db.sstInitialDelivery.findUniqueOrThrow({
    where: { id: accepted.deliveryId },
    include: { event: true },
  });
  const acceptedXml = initialDelivery.signedXml;
  const assessmentBefore = await db.riskFactorData.findUniqueOrThrow({
    where: { id: assessment.id },
  });
  const metadataWrites: string[] = [];
  page.on('request', (request) => {
    if (
      request.method() === 'POST' &&
      new URL(request.url()).pathname ===
        `/company/${companyId}/workspace/${workspaceId}/characterizations`
    )
      metadataWrites.push(request.url());
  });
  const nameDraft = page.getByPlaceholder('nome do elemento caracterizado...');
  const summaryDraft = page.getByPlaceholder(
    'Texto objetivo sobre o elemento, finalidade e contexto operacional...',
  );
  const expectLocalDraft = async () => {
    await expect(nameDraft).toHaveValue(
      'Rascunho local não salvo pelo vínculo',
    );
    await expect(summaryDraft).toHaveValue('Resumo local pendente da visita');
  };
  await nameDraft.fill('Rascunho local não salvo pelo vínculo');
  await summaryDraft.fill('Resumo local pendente da visita');
  await page.getByRole('tab', { name: 'Cargos', exact: true }).click();
  await page.getByRole('tab', { name: 'Dados', exact: true }).click();
  await expectLocalDraft();
  await page.getByRole('tab', { name: 'Cargos', exact: true }).click();
  await page
    .getByRole('button', { name: 'Editar cargos', exact: true })
    .click();
  const treeA = page.getByRole('treeitem', {
    name: new RegExp(`Cargo ${officeA.name},`),
  });
  const treeB = page.getByRole('treeitem', {
    name: new RegExp(`Cargo ${officeB.name},`),
  });
  await expect(treeA).toHaveAttribute('aria-checked', 'true');
  await expect(treeB).toHaveAttribute('aria-checked', 'false');
  await treeA.click();
  await treeB.click();
  const selectionTitle = page
    .getByRole('paragraph')
    .filter({ hasText: `Selecionar cargos — ${elementName}` });
  await selectionTitle.click();
  await page.mouse.move(0, 0);
  await expect(page.getByRole('tooltip')).toBeHidden();
  await page.screenshot({
    path: test.info().outputPath('vinculos-selecao-cargos-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await treeB.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('vinculos-selecao-cargos-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const confirmOptionalDates = async (date = '01/04/2026') => {
    await page
      .getByRole('button', { name: 'Selecionar Ativos', exact: true })
      .last()
      .click();
    const start = page.getByPlaceholder('__/__/__').first();
    await start.fill(date);
    await start.press('Tab');
    await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
  };
  const rejected = waitForApi(page, 'POST', selectionPath);
  await confirmOptionalDates();
  expect((await assertStatus(await rejected, 409)).code).toBe(
    'SST_DECISION_REQUIRED',
  );
  const decision = page.getByRole('dialog', {
    name: 'Como esta alteração afeta o período?',
  });
  await expect(decision).toBeVisible();
  await decision
    .getByRole('button', { name: 'Voltar ao cadastro', exact: true })
    .click();
  await expect(decision).not.toBeVisible();
  await expect(treeA).toHaveAttribute('aria-checked', 'false');
  await expect(treeB).toHaveAttribute('aria-checked', 'true');
  expect(
    (
      await db.hierarchyOnHomogeneous.findUniqueOrThrow({
        where: { id: linkAId },
      })
    ).endDate,
  ).toBeNull();
  expect(
    await db.hierarchyOnHomogeneous.count({
      where: { homogeneousGroupId: groupA.id, hierarchyId: officeB.id },
    }),
  ).toBe(0);
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('tree', { name: 'Hierarquia da empresa' }),
  ).not.toBeVisible();
  await page.getByRole('tab', { name: 'Dados', exact: true }).click();
  await expectLocalDraft();
  await page.getByRole('tab', { name: 'Cargos', exact: true }).click();
  await page
    .getByRole('button', { name: 'Editar cargos', exact: true })
    .click();
  await expect(treeA).toHaveAttribute('aria-checked', 'true');
  await expect(treeB).toHaveAttribute('aria-checked', 'false');
  await treeA.click();
  await treeB.click();
  await confirmOptionalDates();
  await expect(decision).toBeVisible();
  await decision.getByLabel('Natureza da alteração').click();
  await page
    .getByRole('option', { name: 'Registrar mudança nas condições' })
    .click();
  await decision
    .getByLabel('Início da nova condição', { exact: true })
    .fill('01/04/2026');
  await decision
    .getByLabel('Motivo da alteração')
    .fill('Revisita: a atividade passou do cargo de origem para o destino');
  await captureEvidenceDialog(page, decision, 'vinculos-decisao-desktop.png');
  await page.setViewportSize({ width: 390, height: 844 });
  await captureEvidenceDialog(page, decision, 'vinculos-decisao-390.png');
  await page.setViewportSize({ width: 1440, height: 1000 });
  const applied = waitForApi(page, 'POST', selectionPath);
  await decision
    .getByRole('button', { name: 'Confirmar e salvar', exact: true })
    .click();
  const response = await assertStatus(await applied, 201);
  expect(response.endedLinkIds).toEqual([linkAId]);
  expect(response.addedLinkIds).toHaveLength(1);
  await expect(decision).not.toBeVisible();
  await expect(
    page.getByRole('tree', { name: 'Hierarquia da empresa' }),
  ).not.toBeVisible();
  const linkA = await db.hierarchyOnHomogeneous.findUniqueOrThrow({
    where: { id: linkAId },
  });
  const linkB = await db.hierarchyOnHomogeneous.findUniqueOrThrow({
    where: { id: response.addedLinkIds[0] },
  });
  expect(linkA.startDate.toISOString().slice(0, 10)).toBe('2026-01-01');
  expect(linkA.endDate.toISOString().slice(0, 10)).toBe('2026-04-01');
  expect(linkA.deletedAt).toBeNull();
  expect(linkB.hierarchyId).toBe(officeB.id);
  expect(linkB.startDate.toISOString().slice(0, 10)).toBe('2026-04-01');
  expect(linkB.endDate).toBeNull();
  expect(
    await db.riskFactorData.findUniqueOrThrow({ where: { id: assessment.id } }),
  ).toEqual(assessmentBefore);
  expect(
    (
      await db.companyCharacterization.findUniqueOrThrow({
        where: { id: groupA.id },
      })
    ).name,
  ).toBe(elementName);
  await page.getByRole('tab', { name: 'Dados', exact: true }).click();
  await expectLocalDraft();
  expect(metadataWrites).toEqual([]);
  expect(
    (
      await db.companyCharacterization.findUniqueOrThrow({
        where: { id: groupA.id },
      })
    ).riskInventorySummary || '',
  ).toBe('');
  await page.getByRole('tab', { name: 'Dados', exact: true }).click();
  await page.mouse.move(0, 0);
  await nameDraft.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('vinculos-rascunho-preservado-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await nameDraft.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('vinculos-rascunho-preservado-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  expect(
    (
      await db.sstInitialDelivery.findUniqueOrThrow({
        where: { id: accepted.deliveryId },
      })
    ).signedXml,
  ).toBe(acceptedXml);
  // Removing the last participation does not itself attest absence of exposure.
  // The source worker stays blocked until absence is explicitly reviewed.
  const pendingSource = await call(
    page,
    'POST',
    `/companies/${companyId}/esocial-initial/2240/prepare`,
    {
      operationId: randomUUID(),
      environment: 2,
      employerRegistration: '11222333',
      employeeIds: [employee.id],
      mode: 'CHANGES',
      selection: 'CURRENT',
    },
  );
  expect(pendingSource.state).toBe('BLOCKED');
  expect(pendingSource.diagnostics).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ code: 'ABSENCE_NOT_EXPLICITLY_REVIEWED' }),
    ]),
  );
  expect(
    pendingSource.events.some((event: any) =>
      event.content?.agNoc?.some(
        (agent: any) => agent.codAgNoc === '09.01.001',
      ),
    ),
  ).toBe(false);
  const pendingDestination = await call(
    page,
    'POST',
    `/companies/${companyId}/esocial-initial/2240/prepare`,
    {
      operationId: randomUUID(),
      environment: 2,
      employerRegistration: '11222333',
      employeeIds: [employeeB.id],
      mode: 'INITIAL',
      selection: 'CURRENT',
    },
  );
  expect(
    pendingDestination.state,
    JSON.stringify(pendingDestination.diagnostics),
  ).toBe('READY');
  expect(pendingDestination.events).toHaveLength(1);
  expect(pendingDestination.events[0].employeeName).toBe(employeeB.name);
  expect(pendingDestination.events[0].effectiveFrom.slice(0, 10)).toBe(
    '2026-04-01',
  );
  expect(pendingDestination.events[0].content.agNoc[0].codAgNoc).toBe(
    '03.01.001',
  );

  // The table shortcut is the second caller. A real concurrent HTTP edit must
  // reject its stale baseline without replacing the user's selection.
  // Explicitly discard only the two unsaved draft fields before navigating.
  await nameDraft.fill(elementName);
  await summaryDraft.fill('');
  await page.goto(
    `/dashboard/empresas/${companyId}/novo/sst?active=1&tabWorkspaceId=${workspaceId}`,
  );
  await expect(page.getByText(elementName, { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'Adicionar cargo ao elemento', exact: true })
    .click();
  await expect(
    page.getByText(`Selecionar cargos — ${elementName}`, { exact: true }),
  ).toHaveCount(1);
  await expect(selectionTitle).toBeVisible();
  await expect(treeB).toHaveAttribute('aria-checked', 'true');
  await treeB.click();
  await treeA.click();
  const token = (await page.context().cookies()).find(
    (cookie) => cookie.name === 'nextauth.token',
  )!.value;
  const concurrentPath =
    fixture.apiURL + `/homogeneous-groups/hierarchy-homo/${companyId}`;
  const concurrentOperation = randomUUID();
  const concurrentPayload = {
    companyId,
    ids: [linkB.id],
    startDate: '2026-04-02T00:00:00.000Z',
  };
  let concurrent = await page.request.post(concurrentPath, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-sst-operation-id': concurrentOperation,
    },
    data: concurrentPayload,
  });
  if (concurrent.status() === 409) {
    const required = await concurrent.json();
    expect(required.code).toBe('SST_DECISION_REQUIRED');
    concurrent = await page.request.post(concurrentPath, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-sst-operation-id': concurrentOperation,
        'x-sst-decision': encodeURIComponent(
          JSON.stringify({
            intent: 'CORRECTION',
            effectiveFrom: '2026-04-01',
            reason: 'Correção concorrente da data do cargo destino',
            expectedHead: required.expectedHead,
          }),
        ),
      },
      data: concurrentPayload,
    });
  }
  expect(concurrent.status(), await concurrent.text()).toBeLessThan(300);
  const stale = waitForApi(page, 'POST', selectionPath);
  await confirmOptionalDates('03/04/2026');
  expect((await assertStatus(await stale, 409)).code).toBe(
    'SST_CHARACTERIZATION_SELECTION_CONFLICT',
  );
  await expect(
    page.getByText('Os vínculos mudaram enquanto você selecionava.', {
      exact: false,
    }),
  ).toBeVisible();
  await expect(treeA).toHaveAttribute('aria-checked', 'true');
  await expect(treeB).toHaveAttribute('aria-checked', 'false');
  await selectionTitle.click();
  await page.mouse.move(0, 0);
  await page.screenshot({
    path: test
      .info()
      .outputPath('vinculos-conflito-preserva-selecao-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await treeA.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('vinculos-conflito-preserva-selecao-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  expect(
    (
      await db.hierarchyOnHomogeneous.findUniqueOrThrow({
        where: { id: linkB.id },
      })
    ).startDate
      .toISOString()
      .slice(0, 10),
  ).toBe('2026-04-02');
  expect(
    await db.hierarchyOnHomogeneous.count({
      where: {
        homogeneousGroupId: groupA.id,
        hierarchyId: officeA.id,
        endDate: null,
        deletedAt: null,
      },
    }),
  ).toBe(0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('tree', { name: 'Hierarquia da empresa' }),
  ).not.toBeVisible();
  await page
    .getByRole('button', { name: 'Editar cargos', exact: true })
    .click();
  await expect(treeA).toHaveAttribute('aria-checked', 'false');
  await expect(treeB).toHaveAttribute('aria-checked', 'true');
  expect(
    (
      await db.sstInitialDelivery.findUniqueOrThrow({
        where: { id: accepted.deliveryId },
      })
    ).signedXml,
  ).toBe(acceptedXml);
});

test('SST evidências — produto, composição, cenário e registro técnico são editados sem reaplicar riscos declarados', async ({
  page,
}) => {
  test.setTimeout(240000);
  const {
    companyId,
    workspaceId,
    riskGroupId,
    factor,
    groupA,
    groupB,
    employee,
    email,
  } = chemicalEvidenceSetup;
  const productsPath = `/dashboard/empresas/${companyId}/produtos-quimicos?tabWorkspaceId=${workspaceId}`;
  const productRoot = `/v2/companies/${companyId}/workspaces/${workspaceId}/chemical-products`;
  const scenarioRoot = `/v2/companies/${companyId}/workspaces/${workspaceId}/chemical-use-scenarios`;
  const recordRoot = `/v2/companies/${companyId}/workspaces/${workspaceId}/characterizations/${groupA.id}/technical-records`;
  await login(page, productsPath, { email, password: fixture.password });
  const { product } = await call(page, 'POST', productRoot, {
    tradeName: 'Produto técnico E2E',
    manufacturer: 'Fabricante inicial',
    ingredients: [
      {
        chemicalName: 'Etanol',
        cas: '64-17-5',
        concentrationKind: 'EXACT',
        exactPercent: 100,
      },
    ],
  });
  expect(product.id).toEqual(expect.any(String));
  const initialProduct = await call(
    page,
    'GET',
    `${productRoot}/${product.id}`,
  );
  const firstComposition = initialProduct.compositionVersions.find(
    (version: any) => version.status === 'ACTIVE',
  );
  expect(firstComposition).toBeDefined();
  const scenario = await call(page, 'POST', scenarioRoot, {
    chemicalProductId: product.id,
    surveyStatus: 'LEVANTAMENTO_CONCLUIDO',
    activityName: 'Limpeza técnica E2E',
    homogeneousGroupId: groupB.id,
    frequencyCount: 1,
    frequencyPeriod: 'Diário',
    durationMinutes: 20,
    controlMeasures: 'Ventilação local descrita no levantamento',
  });
  const technicalRecord = await call(page, 'POST', recordRoot, {
    title: 'Registro técnico inicial E2E',
    recordType: 'TECHNICAL_NOTE',
    analysisDate: '2026-01-01',
    responsibleName: 'Técnico E2E',
    analysisOrigin: 'TECHNICAL_RESPONSIBLE',
    status: 'DRAFT',
    technicalReport: 'Evidência inicial independente da caracterização.',
    relatedFields: ['REFERENCE_ONLY'],
    sources: [],
  });
  expect(scenario.id).toEqual(expect.any(String));
  expect(technicalRecord.id).toEqual(expect.any(String));
  const risk = await call(page, 'POST', '/risk-data', {
    companyId,
    workspaceId,
    riskId: factor.id,
    homogeneousGroupId: groupA.id,
    riskFactorGroupDataId: riskGroupId,
    probability: 3,
    startDate: '2026-01-01T12:00:00Z',
    keepEmpty: true,
    json: {
      type: 'BIO',
      assessmentType: 'QUALITATIVE',
      sstDeclaration: { exposure: 'PRESENT', epiUsed: 'NO', epcPresent: 'NO' },
    },
  });
  await call(page, 'POST', `/companies/${companyId}/sst-operational/policy`, {
    fromDate: '2026-01-01',
    reason: 'Base declarada antes da edição das evidências',
    expectedRevision: 0,
  });
  await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-2240`,
    { employeeId: employee.id },
  );
  const baseline = async () => ({
    risk: await db.riskFactorData.findUniqueOrThrow({ where: { id: risk.id } }),
    characterization: await db.companyCharacterization.findUniqueOrThrow({
      where: { id: groupA.id },
    }),
    revisions: await db.sstHistoryRevision.count({ where: { companyId } }),
    deliveries: await db.sstInitialDelivery.findMany({
      where: { companyId },
      include: { event: true },
      orderBy: { id: 'asc' },
    }),
  });
  const before = await baseline();
  expect(before.deliveries.some((row: any) => row.state === 'ACCEPTED')).toBe(
    true,
  );
  await page.reload();
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  const productEditor = page.getByRole('dialog', {
    name: 'Editar produto químico',
    exact: true,
  });
  await expect(productEditor).toContainText('não aplica fatores aos riscos');
  await productEditor
    .getByLabel(/^Nome comercial\s*\*?$/)
    .fill('Produto técnico revisado E2E');
  // This invalid range is sent to the real API. Both identity and composition
  // must roll back together while the user's draft remains editable.
  await productEditor
    .locator('.MuiFormControl-root')
    .filter({
      has: page.locator('label').filter({ hasText: /^Tipo de concentração$/ }),
    })
    .getByRole('combobox')
    .click();
  await page.getByRole('option', { name: 'Faixa (%)', exact: true }).click();
  await productEditor.getByLabel('Mín %', { exact: true }).fill('80');
  await productEditor.getByLabel('Máx %', { exact: true }).fill('20');
  const rejected = waitForApi(page, 'PATCH', `${productRoot}/${product.id}`);
  await productEditor
    .getByRole('button', { name: 'Salvar edição', exact: true })
    .click();
  await assertStatus(await rejected, 400);
  await expect(productEditor).toBeVisible();
  await expect(productEditor.getByLabel(/^Nome comercial\s*\*?$/)).toHaveValue(
    'Produto técnico revisado E2E',
  );
  await expect(productEditor.getByLabel('Mín %', { exact: true })).toHaveValue(
    '80',
  );
  await expect(productEditor.getByLabel('Máx %', { exact: true })).toHaveValue(
    '20',
  );
  await expect(productEditor.locator('.MuiAlert-standardError')).toBeVisible();
  expect(await call(page, 'GET', `${productRoot}/${product.id}`)).toEqual(
    initialProduct,
  );
  expect(await baseline()).toEqual(before);
  await captureEvidenceDialog(
    page,
    productEditor,
    'quimico-falha-atomica-rascunho-preservado.png',
    'bottom',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await captureEvidenceDialog(
    page,
    productEditor,
    'quimico-edicao-rascunho-topo-390.png',
  );
  await expectFloatingLabelGap(
    productEditor.getByRole('alert').first(),
    productEditor.locator('label').filter({ hasText: /^Nome comercial/ }),
  );
  await captureEvidenceDialog(
    page,
    productEditor,
    'quimico-edicao-rascunho-fim-390.png',
    'bottom',
  );
  await page.setViewportSize({ width: 1440, height: 1000 });

  await productEditor.getByLabel('Mín %', { exact: true }).fill('10');
  const savedProduct = waitForApi(
    page,
    'PATCH',
    `${productRoot}/${product.id}`,
  );
  await productEditor
    .getByRole('button', { name: 'Salvar edição', exact: true })
    .click();
  const revised = await assertStatus(await savedProduct, 200);
  await expect(productEditor).toBeHidden();
  expect(revised.tradeName).toBe('Produto técnico revisado E2E');
  expect(revised.compositionVersions).toHaveLength(2);
  const previous = revised.compositionVersions.find(
    (version: any) => version.id === firstComposition.id,
  );
  expect(previous.status).toBe('ARCHIVED');
  expect(previous.ingredients).toEqual(firstComposition.ingredients);
  expect(
    revised.compositionVersions.find(
      (version: any) => version.status === 'ACTIVE',
    ).ingredients[0],
  ).toMatchObject({
    minPercent: 10,
    maxPercent: 20,
    concentrationKind: 'RANGE',
  });
  await expect(
    page.getByRole('dialog', { name: 'Como esta alteração afeta o período?' }),
  ).toHaveCount(0);
  expect(await baseline()).toEqual(before);

  await page.getByRole('button', { name: 'Abrir', exact: true }).click();
  const productDetail = page.getByRole('dialog', {
    name: 'Produto químico',
    exact: true,
  });
  await expect(productDetail).toContainText('não aplica fatores aos riscos');
  await expect(productDetail).toContainText('Produto técnico revisado E2E');
  await captureEvidenceDialog(
    page,
    productDetail,
    'quimico-composicao-salva-sem-reaplicar-risco.png',
  );
  await productDetail
    .getByRole('button', { name: 'Fechar', exact: true })
    .click();

  await page
    .getByRole('button', { name: 'Cenários de uso', exact: true })
    .click();
  const scenarioRow = page.locator('.table_grid').filter({
    has: page.getByText('Limpeza técnica E2E', { exact: true }),
  });
  const openScenario = scenarioRow.getByRole('button', {
    name: 'Abrir',
    exact: true,
  });
  await openScenario.scrollIntoViewIfNeeded();
  await openScenario.click();
  const scenarioDetail = page
    .getByRole('dialog')
    .filter({ has: page.getByRole('button', { name: 'Editar', exact: true }) });
  await scenarioDetail
    .getByRole('button', { name: 'Editar', exact: true })
    .click();
  const scenarioEditor = page.getByRole('dialog', {
    name: 'Editar cenário de uso',
    exact: true,
  });
  await scenarioEditor
    .getByLabel(/^Tarefa \/ atividade\s*\*?$/)
    .fill('Limpeza revisada no levantamento E2E');
  await scenarioEditor.getByLabel('Duração', { exact: true }).fill('30');
  await page.setViewportSize({ width: 390, height: 844 });
  await captureEvidenceDialog(
    page,
    scenarioEditor,
    'quimico-cenario-levantamento-390.png',
  );
  await captureEvidenceDialog(
    page,
    scenarioEditor,
    'quimico-cenario-levantamento-fim-390.png',
    'bottom',
  );
  const savedScenario = waitForApi(
    page,
    'PATCH',
    `${scenarioRoot}/${scenario.id}`,
  );
  await scenarioEditor
    .getByRole('button', { name: 'Salvar', exact: true })
    .click();
  const updatedScenario = await assertStatus(await savedScenario, 200);
  expect(updatedScenario.activityName).toBe(
    'Limpeza revisada no levantamento E2E',
  );
  expect(updatedScenario.durationMinutes).toBe(30);
  await expect(scenarioEditor).toBeHidden();
  await expect(
    page.getByRole('dialog', { name: 'Como esta alteração afeta o período?' }),
  ).toHaveCount(0);
  expect(await baseline()).toEqual(before);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(
    `/dashboard/empresas/${companyId}/${workspaceId}/caracterizacao-editar/${groupA.id}`,
  );
  await page
    .getByRole('tab', { name: 'Rastreabilidade Técnica', exact: true })
    .click();
  const recordCard = page.locator('.MuiAccordion-root').filter({
    has: page.getByText('Registro técnico inicial E2E', { exact: true }),
  });
  const recordSummary = recordCard.getByRole('button', {
    name: /^Registro técnico inicial E2E/,
  });
  await recordSummary.click();
  await expect(recordSummary).toHaveAttribute('aria-expanded', 'true');
  await recordCard.getByRole('button', { name: 'Editar', exact: true }).click();
  const recordEditor = page.getByRole('dialog', {
    name: 'Editar registro técnico',
    exact: true,
  });
  await expect(recordEditor).toContainText(
    'nem altera os campos da caracterização',
  );
  await recordEditor
    .getByLabel(/^Título\s*\*?$/)
    .fill('Registro técnico revisado E2E');
  await recordEditor
    .getByLabel('Relatório técnico da análise', { exact: true })
    .fill(
      'Evidência revisada sem reaplicar os dados da caracterização ou alterar o risco.',
    );
  await captureEvidenceDialog(
    page,
    recordEditor,
    'registro-tecnico-formulario-desktop.png',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await captureEvidenceDialog(
    page,
    recordEditor,
    'registro-tecnico-formulario-topo-390.png',
  );
  await captureEvidenceDialog(
    page,
    recordEditor,
    'registro-tecnico-formulario-fim-390.png',
    'bottom',
  );
  const snapshotAction = recordEditor.getByRole('button', {
    name: 'Capturar versão atual da caracterização',
    exact: true,
  });
  await expect(snapshotAction).toBeVisible();
  const snapshotSize = await snapshotAction.evaluate((button) => ({
    height: button.getBoundingClientRect().height,
    overflows: button.scrollHeight > button.clientHeight,
  }));
  expect(snapshotSize.height).toBeGreaterThanOrEqual(36);
  expect(snapshotSize.overflows).toBe(false);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const savedRecord = waitForApi(
    page,
    'PATCH',
    `${recordRoot}/${technicalRecord.id}`,
  );
  await recordEditor
    .getByRole('button', { name: 'Salvar alterações', exact: true })
    .click();
  const updatedRecord = await assertStatus(await savedRecord, 200);
  expect(updatedRecord.title).toBe('Registro técnico revisado E2E');
  await expect(recordEditor).toBeHidden();
  await expect(
    page.getByText('Registro técnico revisado E2E', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('dialog', { name: 'Como esta alteração afeta o período?' }),
  ).toHaveCount(0);
  expect(await baseline()).toEqual(before);
  await page.screenshot({
    path: test
      .info()
      .outputPath('registro-tecnico-preserva-caracterizacao.png'),
    fullPage: true,
    animations: 'disabled',
  });
  const unchanged = await call(
    page,
    'POST',
    `/companies/${companyId}/esocial-initial/2240/prepare`,
    {
      operationId: randomUUID(),
      environment: 2,
      employerRegistration: '11222333',
      employeeIds: [employee.id],
      mode: 'CHANGES',
    },
  );
  expect(unchanged.events).toHaveLength(0);
});

test('SST corte — data inicial exige análise após aceite, preserva recibos e mantém rascunho no conflito', async ({
  page,
}) => {
  test.setTimeout(240000);
  const setup = await seedCatalogBrowserSetup();
  const {
    companyId,
    workspaceId,
    email,
    riskGroupId,
    factor,
    groupA,
    employee,
  } = setup;
  const operational = `/companies/${companyId}/sst-operational`;
  const policyPath = operational + '/policy';
  await login(page, `/dashboard/empresas/${companyId}/esocial`, {
    email,
    password: fixture.password,
  });
  await call(page, 'POST', '/risk-data', {
    companyId,
    riskId: factor.id,
    homogeneousGroupId: groupA.id,
    riskFactorGroupDataId: riskGroupId,
    workspaceId,
    startDate: '2026-01-01T00:00:00Z',
    keepEmpty: true,
    json: {
      type: 'QUI',
      twaValue: '5',
      twa: '10',
      measuredOn: '2026-01-01',
      selectedMeasurement: 'twaValue',
      selectionReason: 'Amostra representativa do corte',
      unit: 'ppm',
      sstDeclaration: { exposure: 'PRESENT', epiUsed: 'NO', epcPresent: 'NO' },
    },
  });
  await call(page, 'POST', policyPath, {
    fromDate: '2026-04-01',
    reason: 'Início de responsabilidade do emissor em abril',
    expectedRevision: 0,
  });
  const accepted = await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-2240`,
    { employeeId: employee.id },
  );
  const acceptedSnapshot = () =>
    db.sstInitialDelivery.findUniqueOrThrow({
      where: { id: accepted.deliveryId },
      select: {
        state: true,
        receipt: true,
        protocol: true,
        signedXml: true,
        event: {
          select: { content: true, unsignedXml: true, effectiveFrom: true },
        },
      },
    });
  const immutable = await acceptedSnapshot();
  expect(immutable.receipt).toMatch(/^\d\.\d\.\d{19}$/);
  expect(immutable.event.effectiveFrom.toISOString().slice(0, 10)).toBe(
    '2026-04-01',
  );
  const previousPreparation = await call(
    page,
    'POST',
    `/companies/${companyId}/esocial-initial/2240/prepare`,
    {
      operationId: randomUUID(),
      environment: 2,
      employerRegistration: '11222333',
      employeeIds: [employee.id],
      mode: 'CHANGES',
      selection: 'CURRENT',
    },
  );
  expect(previousPreparation.state).toBe('READY');
  expect(previousPreparation.events).toHaveLength(0);
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Salvar data inicial' }),
  ).toHaveCount(0);
  const from = page.getByLabel('Data inicial de envio', { exact: true });
  const reason = page.getByLabel('Motivo da configuração');
  const analysis = page.getByRole('region', {
    name: 'Impacto da alteração da data inicial',
  });
  const analyze = async () => {
    const response = waitForApi(page, 'POST', policyPath + '/preview');
    await page
      .getByRole('button', { name: 'Consultar impacto', exact: true })
      .click();
    return assertStatus(await response, 201);
  };
  const confirm = async () => {
    const response = waitForApi(page, 'POST', policyPath);
    await analysis
      .getByRole('button', { name: 'Confirmar alteração da data', exact: true })
      .click();
    return response;
  };
  await from.fill('01/01/2026');
  await reason.fill(
    'Disponibilizar histórico importado para seleção explícita',
  );
  const expanded = await analyze();
  expect(expanded.direction).toBe('EXPAND');
  expect(expanded.acceptedDeclarations).toBe(1);
  expect(expanded.acceptedEmployments).toBe(1);
  await expect(
    analysis.getByText('De 01/04/2026 para 01/01/2026', { exact: true }),
  ).toBeVisible();
  await expect(
    analysis.getByText(
      /somente quando você selecionar explicitamente o histórico/,
    ),
  ).toBeVisible();
  expect(
    (await db.sstSendingPolicy.findUniqueOrThrow({ where: { companyId } }))
      .revision,
  ).toBe(1);
  expect(await acceptedSnapshot()).toEqual(immutable);
  await page.screenshot({
    path: test.info().outputPath('corte-previa-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expectFloatingLabelGap(
    from.locator('..'),
    page.locator('label').filter({ hasText: /^Motivo da configuração$/ }),
  );
  const noOverflow = await analysis.evaluate((element) => ({
    contentFits: element.scrollWidth <= element.clientWidth,
    buttonsFit: Array.from(element.querySelectorAll('button')).every(
      (button) => button.scrollHeight <= button.clientHeight,
    ),
  }));
  expect(noOverflow).toEqual({ contentFits: true, buttonsFit: true });
  await analysis.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('corte-previa-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await analysis
    .getByRole('button', { name: 'Voltar à edição', exact: true })
    .click();
  await expect(analysis).toHaveCount(0);
  await expect(from).toHaveValue('01/01/2026');
  await expect(reason).toHaveValue(
    'Disponibilizar histórico importado para seleção explícita',
  );
  expect(
    (await db.sstSendingPolicy.findUniqueOrThrow({ where: { companyId } }))
      .revision,
  ).toBe(1);

  await analyze();
  await reason.fill(
    'Disponibilizar histórico anterior sem transmissão automática',
  );
  await expect(analysis).toHaveCount(0);
  await analyze();
  await assertStatus(await confirm(), 201);
  await expect(
    page.getByText(/Data configurada: 2026-01-01 · revisão 2/),
  ).toBeVisible();
  await expect(from).toHaveValue('');
  await expect(analysis).toHaveCount(0);
  await page
    .getByRole('combobox', { name: 'Preparações e envios desta empresa' })
    .click();
  await page
    .getByRole('option', {
      name: new RegExp(previousPreparation.id.slice(0, 8)),
    })
    .click();
  const staleWarning = page.getByText(
    /A data inicial foi alterada depois desta preparação\. Prepare novamente antes de confirmar/,
  );
  await expect(staleWarning).toBeVisible();
  await expect(
    page.getByRole('button', { name: /^Confirmar e enviar/ }),
  ).toHaveCount(0);
  expect(await acceptedSnapshot()).toEqual(immutable);
  await staleWarning.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('corte-preparacao-obsoleta-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await expect(
    page.getByRole('combobox', { name: 'Períodos para preparar' }),
  ).toContainText('Condição vigente e mudanças após o primeiro aceite');
  await page.getByRole('combobox', { name: 'Períodos para preparar' }).click();
  await expect(
    page.getByRole('option', {
      name: 'Incluir histórico anterior ao primeiro aceite',
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole('option', {
      name: 'Incluir histórico anterior ao primeiro aceite',
      exact: true,
    })
    .click();
  const historyRequest = waitForApi(
    page,
    'POST',
    `/companies/${companyId}/esocial-initial/2240/prepare`,
  );
  await page
    .getByRole('button', {
      name: 'Conferir alterações desde os envios aceitos',
      exact: true,
    })
    .click();
  const historyResponse = await historyRequest;
  expect(historyResponse.request().postDataJSON().selection).toBe('HISTORY');
  const history = await assertStatus(historyResponse, 201);
  expect(history.state, JSON.stringify(history.diagnostics)).toBe('READY');
  expect(history.events).toHaveLength(1);
  expect(history.events[0].operation).toBe('ORIGINAL');
  expect(history.events[0].effectiveFrom.slice(0, 10)).toBe('2026-01-01');
  expect(history.events.every((event: any) => !event.delivery)).toBe(true);
  expect(await acceptedSnapshot()).toEqual(immutable);

  await from.fill('01/07/2026');
  await reason.fill('Corte de julho mantido durante atualização concorrente');
  const reduced = await analyze();
  expect(reduced.direction).toBe('REDUCE');
  await expect(
    analysis.getByText(/correções de períodos já aceitos/),
  ).toBeVisible();
  const competing = await call(page, 'POST', policyPath + '/preview', {
    fromDate: '2026-06-01',
    reason: 'Alteração concorrente por outro cliente autenticado',
    expectedRevision: 2,
  });
  await call(page, 'POST', policyPath, {
    fromDate: '2026-06-01',
    reason: 'Alteração concorrente por outro cliente autenticado',
    expectedRevision: 2,
    operationId: randomUUID(),
    expectedPreviewHash: competing.previewHash,
  });
  const conflict = await assertStatus(await confirm(), 409);
  expect(['POLICY_REVISION_CONFLICT', 'POLICY_PREVIEW_STALE']).toContain(
    conflict.code,
  );
  await expect(analysis).toHaveCount(0);
  await expect(from).toHaveValue('01/07/2026');
  await expect(reason).toHaveValue(
    'Corte de julho mantido durante atualização concorrente',
  );
  await expect(
    page.getByText(/Data configurada: 2026-06-01 · revisão 3/),
  ).toBeVisible();
  await expect(
    page.getByText(/rascunho.*mantido|digitou foram mantidos/),
  ).toBeVisible();
  expect(await acceptedSnapshot()).toEqual(immutable);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: test.info().outputPath('corte-conflito-preserva-rascunho.png'),
    fullPage: true,
    animations: 'disabled',
  });
  const refreshed = await analyze();
  expect(refreshed.expectedRevision).toBe(3);
  await page.setViewportSize({ width: 390, height: 844 });
  await analysis.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('corte-avanco-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await assertStatus(await confirm(), 201);
  await expect(
    page.getByText(/Data configurada: 2026-07-01 · revisão 4/),
  ).toBeVisible();
  expect(await acceptedSnapshot()).toEqual(immutable);
  expect(await db.sstInitialDelivery.count({ where: { companyId } })).toBe(1);
  const finalPolicy = await db.sstSendingPolicy.findUniqueOrThrow({
    where: { companyId },
  });
  expect(finalPolicy.fromDate.toISOString().slice(0, 10)).toBe('2026-07-01');
  expect(finalPolicy.revision).toBe(4);
});

async function captureCompletionDialog(
  page: Page,
  dialog: Locator,
  name: string,
  edge: 'top' | 'bottom' = 'top',
) {
  // Dismiss real notifications before capturing the form, without intercepting
  // requests or changing application state through browser evaluation.
  const notices = page.locator('.SnackbarItem-contentRoot:visible button');
  while (await notices.count()) {
    const count = await page
      .locator('.SnackbarItem-contentRoot:visible')
      .count();
    await notices.first().click();
    await expect
      .poll(() => page.locator('.SnackbarItem-contentRoot:visible').count())
      .toBeLessThan(count);
  }
  await dialog
    .locator('.MuiDialogContent-root')
    .evaluate((element, position) => {
      element.scrollTop = position === 'top' ? 0 : element.scrollHeight;
    }, edge);
  await page.mouse.move((page.viewportSize()?.width || 1280) - 1, 1);
  await page.screenshot({
    path: test.info().outputPath(name),
    fullPage: true,
    animations: 'disabled',
  });
}

test('SST estrutura — encerrar e restaurar na origem preserva períodos e rascunho concorrente', async ({
  page,
}) => {
  test.setTimeout(240000);
  const setup = await seedCatalogBrowserSetup();
  const {
    companyId,
    workspaceId,
    email,
    employee,
    groupA,
    groupB,
    factor,
    riskGroupId,
  } = setup;
  // These are initial, undeclared records. After the first acceptance all edits
  // below go through authenticated production commands and the real UI.
  for (const group of [groupA, groupB]) {
    await db.homogeneousGroup.update({
      where: { id: group.id },
      data: { type: 'ACTIVITIES' },
    });
    await db.companyCharacterization.create({
      data: {
        id: group.id,
        companyId,
        workspaceId,
        name: group.name,
        type: 'ACTIVITIES',
        activities: ['Atividade de integração estrutural{type}=PARAGRAPH'],
        paragraphs: ['Descrição anterior preservada{type}=BULLET_0'],
      },
    });
  }
  const person = await db.employee.findUniqueOrThrow({
    where: { id: employee.id },
  });
  const originalLink = await db.hierarchyOnHomogeneous.create({
    data: {
      hierarchyId: person.hierarchyId!,
      homogeneousGroupId: groupB.id,
      startDate: new Date('2026-01-01'),
    },
  });
  const editorPath = (id: string) =>
    `/dashboard/empresas/${companyId}/${workspaceId}/caracterizacao-editar/${id}`;
  await login(page, editorPath(groupB.id), {
    email,
    password: fixture.password,
  });
  const risk = await call(page, 'POST', '/risk-data', {
    companyId,
    riskId: factor.id,
    homogeneousGroupId: groupB.id,
    riskFactorGroupDataId: riskGroupId,
    workspaceId,
    startDate: '2026-01-01T12:00:00Z',
    keepEmpty: true,
    json: {
      type: 'QUI',
      twaValue: '5',
      twa: '10',
      measuredOn: '2026-01-01',
      selectedMeasurement: 'twaValue',
      selectionReason: 'Amostra da atividade estrutural',
      unit: 'ppm',
      sstDeclaration: { exposure: 'PRESENT', epiUsed: 'NO', epcPresent: 'NO' },
    },
  });
  await call(page, 'POST', `/companies/${companyId}/sst-operational/policy`, {
    fromDate: '2026-01-01',
    expectedRevision: 0,
    reason: 'Início da conferência estrutural',
  });
  const accepted = await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-2240`,
    { employeeId: employee.id },
  );
  const immutable = await db.sstInitialDelivery.findUniqueOrThrow({
    where: { id: accepted.deliveryId },
    select: { signedXml: true, receipt: true, protocol: true },
  });
  await page.reload();
  const sourceReview = page.getByRole('button', {
    name: 'Revisar dados e participações',
    exact: true,
  });
  await expect(sourceReview).toBeEnabled();
  await sourceReview.click();
  let dialog = page.getByRole('dialog', {
    name: 'Corrigir dados de um período',
    exact: true,
  });
  await dialog.getByRole('combobox', { name: 'O que precisa fazer?' }).click();
  await page
    .getByRole('option', { name: 'Encerrar cadastro', exact: true })
    .click();
  dialog = page.getByRole('dialog', { name: 'Encerrar cadastro', exact: true });
  const from = dialog.getByLabel('Desde quando o cadastro deixou de valer?', {
    exact: true,
  });
  const reason = dialog.getByLabel('Motivo desta revisão');
  await from.fill('01/04/2026');
  await reason.fill(
    'Atividade encerrada na revisita, com preservação das medições',
  );
  await expect(from).toHaveValue('01/04/2026');
  const checkImpact = dialog.getByRole('button', {
    name: 'Conferir impacto desta alteração',
    exact: true,
  });
  const openCalendar = dialog.getByRole('button', {
    name: 'Abrir calendário: Desde quando o cadastro deixou de valer?',
    exact: true,
  });
  await openCalendar.click();
  const calendar = page.getByRole('dialog', {
    name: 'Calendário: Desde quando o cadastro deixou de valer?',
    exact: true,
  });
  await expect(calendar).toBeVisible();
  await calendar.getByRole('gridcell', { name: '2', exact: true }).click();
  await expect(calendar).toHaveCount(0);
  await expect(from).toHaveValue('02/04/2026');
  await expect(openCalendar).toBeFocused();
  // A partial/impossible edit must not keep the previous valid ISO hidden in
  // form state. Clearing a required civil date also blocks the real action.
  await from.fill('01/04/20');
  await expect(from).toHaveValue('01/04/20');
  await expect(checkImpact).toBeDisabled();
  await from.fill('31/02/2026');
  await expect(from).toHaveValue('31/02/2026');
  await expect(checkImpact).toBeDisabled();
  await from.fill('');
  await expect(checkImpact).toBeDisabled();
  await from.fill('01/04/2026');
  await expect(checkImpact).toBeEnabled();
  const structure = `/companies/${companyId}/sst-operational/structure`;
  const analyze = async () => {
    const response = waitForApi(page, 'POST', structure + '/preview');
    await dialog
      .getByRole('button', {
        name: 'Conferir impacto desta alteração',
        exact: true,
      })
      .click();
    return assertStatus(await response, 201);
  };
  const checked = await analyze();
  expect(checked.effectiveFrom).toBe('2026-04-01');
  expect(checked.blockers).toEqual([]);
  expect(checked.affectedEmploymentIds).not.toHaveLength(0);
  // Another authenticated editor corrects the same origin after the displayed
  // preview. The first user's dates and reason must survive the real 409.
  const context = await call(
    page,
    'GET',
    `${structure}/context?table=CompanyCharacterization&id=${groupB.id}`,
  );
  const concurrent = {
    target: { table: 'CompanyCharacterization', id: groupB.id },
    action: 'METADATA',
    intent: 'CORRECTION',
    effectiveFrom: context.periods.at(-1).effectiveFrom,
    patch: { name: groupB.name + ' corrigido' },
  };
  const fresh = await call(page, 'POST', structure + '/preview', concurrent);
  expect(fresh.blockers).toEqual([]);
  await call(page, 'POST', structure + '/apply', {
    ...concurrent,
    operationId: randomUUID(),
    expectedHead: fresh.expectedHead,
    impactHash: fresh.impactHash,
    reason: 'Ajuste concorrente do nome na própria origem',
  });
  const conflict = waitForApi(page, 'POST', structure + '/apply');
  await dialog
    .getByRole('button', {
      name: 'Confirmar alteração no cadastro',
      exact: true,
    })
    .click();
  expect((await assertStatus(await conflict, 409)).code).toMatch(
    /REVISION_CONFLICT/,
  );
  await expect(from).toHaveValue('01/04/2026');
  await expect(reason).toHaveValue(
    'Atividade encerrada na revisita, com preservação das medições',
  );
  await expect(dialog.getByText(/Seus campos foram mantidos/)).toBeVisible();
  await captureCompletionDialog(
    page,
    dialog,
    'estrutura-conflito-desktop.png',
    'bottom',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await captureCompletionDialog(
    page,
    dialog,
    'estrutura-conflito-390.png',
    'bottom',
  );
  await captureCompletionDialog(page, dialog, 'estrutura-encerramento-390.png');
  expect(
    await db.sstInitialDelivery.findUniqueOrThrow({
      where: { id: accepted.deliveryId },
      select: { signedXml: true, receipt: true, protocol: true },
    }),
  ).toEqual(immutable);
  await analyze();
  const applied = waitForApi(page, 'POST', structure + '/apply');
  await dialog
    .getByRole('button', {
      name: 'Confirmar alteração no cadastro',
      exact: true,
    })
    .click();
  const archived = await assertStatus(await applied, 201);
  expect(archived.action).toBe('ARCHIVE');
  await expect(dialog).toHaveCount(0);
  const closedLink = await db.hierarchyOnHomogeneous.findUniqueOrThrow({
    where: { id: originalLink.id },
  });
  expect(closedLink.endDate?.toISOString().slice(0, 10)).toBe('2026-04-01');
  expect(
    (
      await db.companyCharacterization.findUniqueOrThrow({
        where: { id: groupB.id },
      })
    ).deleted_at
      ?.toISOString()
      .slice(0, 10),
  ).toBe('2026-04-01');
  expect(
    await db.riskFactorData.findUnique({ where: { id: risk.id } }),
  ).not.toBeNull();
  // Return through an existing source form. Archived items are consulted in a
  // scoped dialog, not in a new management central.
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.goto(editorPath(groupA.id));
  await page
    .getByRole('button', {
      name: 'Consultar cadastros encerrados',
      exact: true,
    })
    .click();
  const archivedList = page.getByRole('dialog', {
    name: 'Consultar cadastros encerrados',
    exact: true,
  });
  await archivedList
    .getByRole('row')
    .filter({ hasText: groupB.name })
    .getByRole('button', { name: 'Revisar restauração', exact: true })
    .click();
  dialog = page.getByRole('dialog', {
    name: 'Restaurar cadastro',
    exact: true,
  });
  const reentryDate = dialog.getByLabel('Início da nova participação', {
    exact: true,
  });
  await reentryDate.fill('01/06/2026');
  await expect(reentryDate).toHaveValue('01/06/2026');
  await dialog
    .getByLabel('Motivo desta revisão')
    .fill('Atividade retomada com nova participação datada');
  const restoredPreview = await analyze();
  expect(restoredPreview.effectiveFrom).toBe('2026-06-01');
  expect(restoredPreview.blockers).toEqual([]);
  await captureCompletionDialog(
    page,
    dialog,
    'estrutura-restauracao-desktop.png',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await captureCompletionDialog(
    page,
    dialog,
    'estrutura-restauracao-390.png',
    'bottom',
  );
  const restoration = waitForApi(page, 'POST', structure + '/apply');
  await dialog
    .getByRole('button', {
      name: 'Confirmar alteração no cadastro',
      exact: true,
    })
    .click();
  const restored = await assertStatus(await restoration, 201);
  expect(restored.restoredLinkIds).toHaveLength(1);
  expect(restored.restoredLinkIds[0]).not.toBe(originalLink.id);
  const links = await db.hierarchyOnHomogeneous.findMany({
    where: { homogeneousGroupId: groupB.id, hierarchyId: person.hierarchyId! },
    orderBy: { startDate: 'asc' },
  });
  expect(links).toHaveLength(2);
  expect(links[0].endDate?.toISOString().slice(0, 10)).toBe('2026-04-01');
  expect(links[1].startDate?.toISOString().slice(0, 10)).toBe('2026-06-01');
  expect(links[1].endDate).toBeNull();
  expect(
    (
      await db.companyCharacterization.findUniqueOrThrow({
        where: { id: groupB.id },
      })
    ).deleted_at,
  ).toBeNull();
  expect(
    await db.sstInitialDelivery.findUniqueOrThrow({
      where: { id: accepted.deliveryId },
      select: { signedXml: true, receipt: true, protocol: true },
    }),
  ).toEqual(immutable);
  // Legal aids are read-only and scoped to the accepted event; acceptance does
  // not prove timeliness, particularly in the synthetic restricted environment.
  const acceptedRun = await call(
    page,
    'GET',
    `/companies/${companyId}/esocial-initial/2240/${accepted.runId}`,
  );
  expect(acceptedRun.events[0].legalDeadline.deadline.family).toBe('S-2240');
  expect(acceptedRun.events[0].legalDeadline.deadline.environment).toBe(2);
  expect(acceptedRun.events[0].legalDeadline.deadline.legalEffect).toBe(false);
  expect(acceptedRun.events[0].legalDeadline.assessment).toBe(
    'ACCEPTED_TIMELINESS_NOT_EVALUATED',
  );
  await page.goto(`/dashboard/empresas/${companyId}/esocial`);
  await page
    .getByRole('combobox', { name: 'Preparações e envios desta empresa' })
    .click();
  await page
    .getByRole('option', { name: new RegExp(accepted.runId.slice(0, 8)) })
    .click();
  const deadline = page
    .getByRole('region', { name: 'Prazo legal do S-2240', exact: true })
    .first();
  await expect(deadline).toContainText('Simulação · produção restrita');
  await expect(deadline).toContainText('cumprimento do prazo não avaliado');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await deadline.scrollIntoViewIfNeeded();
  await deadline.screenshot({
    path: test.info().outputPath('estrutura-prazo-aceito-desktop.png'),
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await deadline.scrollIntoViewIfNeeded();
  expect(
    await deadline.evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  await deadline.screenshot({
    path: test.info().outputPath('estrutura-prazo-aceito-390.png'),
    animations: 'disabled',
  });
});

test('SST eventos — fonte clínica, CAT e ASO reais, retificação e exclusão preservam XMLs', async ({
  page,
}) => {
  test.setTimeout(300000);
  const setup = await seedCatalogBrowserSetup();
  const {
    companyId,
    email,
    employee,
    groupA,
    factor,
    riskGroupId,
    workspaceId,
  } = setup;
  const physician = await db.professional.create({
    data: {
      companyId,
      name: 'Médico E2E de origem',
      formation: [],
      certifications: [],
      councils: {
        create: { councilType: 'CRM', councilUF: 'SP', councilId: '12345' },
      },
    },
    include: { councils: true },
  });
  const doctor = physician.councils[0];
  await db.company.update({
    where: { id: companyId },
    data: { doctorResponsibleId: doctor.id },
  });
  await db.uf.upsert({
    where: { code: '35' },
    create: { code: '35', uf: 'SP', name: 'São Paulo' },
    update: {},
  });
  await db.cities.upsert({
    where: { code: '3509502' },
    create: { code: '3509502', name: 'Campinas', ufCode: '35' },
    update: {},
  });
  await db.cid.upsert({
    where: { cid: 'S600' },
    create: { cid: 'S600', description: 'Lesão sintética E2E' },
    update: {},
  });
  await db.esocialTable13BodyPart.upsert({
    where: { code: '753030000' },
    create: { code: '753030000', desc: 'Parte sintética' },
    update: {},
  });
  for (const [code, table] of [
    ['200004300', 15],
    ['302010200', 14],
  ] as const)
    await db.esocialTable14And15Acid.upsert({
      where: { code },
      create: { code, desc: 'Ocorrência sintética', table },
      update: {},
    });
  await db.esocialTable17Injury.upsert({
    where: { code: '702010000' },
    create: { code: '702010000', desc: 'Lesão sintética' },
    update: {},
  });
  const cat = await db.cat.create({
    data: {
      employeeId: employee.id,
      docId: doctor.id,
      dtAcid: new Date('2026-10-01'),
      tpAcid: 1,
      hrAcid: '1200',
      hrsTrabAntesAcid: '0400',
      tpCat: 1,
      isIndCatObito: false,
      isIndComunPolicia: false,
      codSitGeradora: '200004300',
      iniciatCAT: 1,
      ultDiaTrab: new Date('2026-10-01'),
      houveAfast: false,
      tpLocal: 1,
      dscLocal: 'Sede de teste',
      dscLograd: 'Rua sintética',
      nrLograd: '1',
      cep: '13000000',
      codMunic: '3509502',
      uf: 'SP',
      ideLocalAcidTpInsc: 1,
      ideLocalAcidCnpj: '11222333000181',
      codParteAting: '753030000',
      lateralidade: 0,
      codAgntCausador: '302010200',
      dtAtendimento: new Date('2026-10-01'),
      hrAtendimento: '1230',
      isIndInternacao: false,
      durTrat: 1,
      isIndAfast: false,
      dscLesao: '702010000',
      codCID: 'S600',
    },
  });
  const clinical = await db.exam.create({
    data: {
      companyId,
      name: 'Avaliação clínica E2E',
      isAttendance: true,
      esocial27Code: '0295',
    },
  });
  const audio = await db.exam.create({
    data: { companyId, name: 'Audiometria E2E', esocial27Code: '0281' },
  });
  const aso = await db.employeeExamsHistory.create({
    data: {
      employeeId: employee.id,
      examId: clinical.id,
      doneDate: new Date('2026-10-01'),
      doctorId: doctor.id,
      evaluationType: 'APTO',
      examType: 'PERI',
      status: 'DONE',
    },
  });
  await db.employeeExamsHistory.create({
    data: {
      employeeId: employee.id,
      examId: audio.id,
      doneDate: new Date('2026-09-30'),
      asoExamId: aso.id,
      isSequential: true,
      conclusion: 'NORMAL',
      status: 'DONE',
    },
  });
  const employeePath = `/dashboard/empresas/${companyId}/empregados`;
  const socialPath = `/dashboard/empresas/${companyId}/esocial`;
  const secondary = `/companies/${companyId}/esocial-events`;
  const toxicology = secondary + '/toxicology-records';
  await login(page, employeePath, { email, password: fixture.password });
  const openExamHistory = async () => {
    await page.getByText(employee.name, { exact: true }).first().click();
    await page.getByText('Histórico de Exames', { exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Exames toxicológicos', exact: true }),
    ).toBeVisible();
  };
  await openExamHistory();
  const clinicalRow = page.locator('.table_grid').filter({
    has: page.getByText('Avaliação clínica E2E', { exact: true }),
  });
  const audioRow = page.locator('.table_grid').filter({
    has: page.getByText('Audiometria E2E', { exact: true }),
  });
  await expect(clinicalRow.locator('.table-row-box').first()).toHaveText(
    '01/10/2026',
  );
  await expect(audioRow.locator('.table-row-box').first()).toHaveText(
    '30/09/2026',
  );
  await page
    .getByRole('button', { name: 'Cadastrar exame toxicológico', exact: true })
    .click();
  let examDialog = page.getByRole('dialog', {
    name: 'Cadastrar exame toxicológico',
    exact: true,
  });
  await examDialog
    .getByLabel('Data de realização do exame', { exact: true })
    .fill('01/10/2026');
  await examDialog.getByLabel('CNPJ do laboratório').fill('11222333000181');
  await examDialog.getByLabel('Código do exame').fill('AB123456789');
  await examDialog
    .getByLabel('Nome do médico responsável')
    .fill('Médico cadastrado pelo usuário E2E');
  await examDialog.getByLabel('CRM do médico', { exact: true }).fill('12345');
  await examDialog
    .getByRole('combobox', { name: 'UF do CRM', exact: true })
    .click();
  await page.getByRole('option', { name: 'SP', exact: true }).click();
  await examDialog
    .getByRole('combobox', { name: 'Empregado reside no exterior?' })
    .click();
  await page.getByRole('option', { name: 'Não', exact: true }).click();
  await captureCompletionDialog(
    page,
    examDialog,
    'eventos-tox-origem-desktop.png',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await captureCompletionDialog(page, examDialog, 'eventos-tox-origem-390.png');
  await captureCompletionDialog(
    page,
    examDialog,
    'eventos-tox-origem-acoes-390.png',
    'bottom',
  );
  const create = waitForApi(page, 'POST', toxicology);
  await examDialog
    .getByRole('button', { name: 'Salvar exame', exact: true })
    .click();
  const tox = await assertStatus(await create, 201);
  expect(tox.revision).toBe(1);
  await expect(examDialog).toHaveCount(0);
  await page.setViewportSize({ width: 1360, height: 900 });
  await page
    .getByRole('button', { name: 'Corrigir exame', exact: true })
    .click();
  examDialog = page.getByRole('dialog', {
    name: 'Corrigir exame toxicológico',
    exact: true,
  });
  await examDialog
    .getByLabel('Nome do médico responsável')
    .fill('Rascunho do clínico preservado');
  await call(page, 'PATCH', `${toxicology}/${tox.id}`, {
    operationId: randomUUID(),
    expectedRevision: 1,
    doctorName: 'Médico de outra sessão',
  });
  const stale = waitForApi(page, 'PATCH', `${toxicology}/${tox.id}`);
  await examDialog
    .getByRole('button', { name: 'Salvar exame', exact: true })
    .click();
  expect((await assertStatus(await stale, 409)).code).toBe(
    'TOXICOLOGY_REVISION_CONFLICT',
  );
  await expect(examDialog.getByLabel('Nome do médico responsável')).toHaveValue(
    'Rascunho do clínico preservado',
  );
  await expect(
    examDialog.getByRole('button', { name: 'Salvar exame', exact: true }),
  ).toBeDisabled();
  await captureCompletionDialog(
    page,
    examDialog,
    'eventos-tox-conflito-desktop.png',
    'bottom',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await captureCompletionDialog(
    page,
    examDialog,
    'eventos-tox-conflito-390.png',
    'bottom',
  );
  await examDialog
    .getByRole('button', { name: 'Carregar exame atual', exact: true })
    .click();
  await expect(examDialog.getByLabel('Nome do médico responsável')).toHaveValue(
    'Médico de outra sessão',
  );
  await examDialog
    .getByLabel('Nome do médico responsável')
    .fill('Médico confirmado antes do envio');
  const saved = waitForApi(page, 'PATCH', `${toxicology}/${tox.id}`);
  await examDialog
    .getByRole('button', { name: 'Salvar exame', exact: true })
    .click();
  expect((await assertStatus(await saved, 200)).revision).toBe(3);
  await expect(examDialog).toHaveCount(0);
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.goto(socialPath);
  // Give the tenant one accepted S2240 too, so exclusion checks the actual
  // shared baseline rather than merely hiding a secondary table row.
  await call(page, 'POST', '/risk-data', {
    companyId,
    riskId: factor.id,
    homogeneousGroupId: groupA.id,
    riskFactorGroupDataId: riskGroupId,
    workspaceId,
    startDate: '2026-01-01T12:00:00Z',
    keepEmpty: true,
    json: {
      type: 'QUI',
      twaValue: '5',
      twa: '10',
      measuredOn: '2026-01-01',
      selectedMeasurement: 'twaValue',
      selectionReason: 'Amostra clínica E2E',
      unit: 'ppm',
      sstDeclaration: { exposure: 'PRESENT', epiUsed: 'NO', epcPresent: 'NO' },
    },
  });
  await call(page, 'POST', `/companies/${companyId}/sst-operational/policy`, {
    fromDate: '2026-01-01',
    expectedRevision: 0,
    reason: 'Início da integração de eventos SST',
  });
  const initial = await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-2240`,
    { employeeId: employee.id },
  );
  const initialXml = await db.sstInitialDelivery.findUniqueOrThrow({
    where: { id: initial.deliveryId },
    select: { signedXml: true, receipt: true },
  });
  const chooseType = async (name: string) => {
    await page
      .getByRole('combobox', { name: 'Tipo de evento', exact: true })
      .click();
    await page.getByRole('option', { name, exact: true }).click();
  };
  const chooseSource = async (label: string, matcher: string | RegExp) => {
    await page.getByRole('combobox', { name: label, exact: true }).click();
    await page.getByRole('option', { name: matcher }).click();
  };
  const prepareEvent = async (type: string, reason: string) => {
    await page
      .getByLabel(
        type === 'S-3000'
          ? 'Motivo da exclusão'
          : 'Motivo do envio ou da retificação',
        { exact: true },
      )
      .fill(reason);
    const response = waitForApi(page, 'POST', `${secondary}/${type}/prepare`);
    await page
      .getByRole('button', {
        name:
          type === 'S-3000'
            ? 'Preparar exclusão para conferência'
            : 'Preparar evento para conferência',
        exact: true,
      })
      .click();
    const prepared = await assertStatus(await response, 201);
    expect(prepared.state, JSON.stringify(prepared.diagnostics)).toBe('READY');
    return prepared;
  };
  await chooseType('S-2221 — Exame toxicológico');
  await chooseSource(
    'Exame toxicológico cadastrado',
    new RegExp(employee.name),
  );
  await expect(
    page.getByRole('button', {
      name: 'Preparar evento para conferência',
      exact: true,
    }),
  ).toBeDisabled();
  await page
    .getByRole('combobox', {
      name: 'Inscrição do empregador no eSocial',
      exact: true,
    })
    .click();
  await page.getByRole('option', { name: /11222333000181$/ }).click();
  const prepared = await prepareEvent(
    'S-2221',
    'Conferência do exame cadastrado pelo clínico',
  );
  expect(prepared.content.ideVinculo.cpfTrab).toBe(
    (await db.employee.findUniqueOrThrow({ where: { id: employee.id } })).cpf,
  );
  expect(prepared.unsignedXml).toContain('<evtToxic');
  expect(prepared.content.ideEmpregador.nrInsc).toBe('11222333000181');
  const eventRegion = page.getByRole('region', {
    name: 'Conferência do evento adicional',
  });
  expect(prepared.legalDeadline.deadline.family).toBe('S-2221');
  expect(prepared.legalDeadline.deadline.environment).toBe(2);
  expect(prepared.legalDeadline.deadline.legalEffect).toBe(false);
  expect(prepared.legalDeadline.deadline.state).toBe('NEEDS_REVIEW');
  const eventDeadline = eventRegion.getByRole('region', {
    name: 'Prazo legal do evento preparado',
    exact: true,
  });
  await expect(eventDeadline).toContainText('Simulação · produção restrita');
  await expect(eventDeadline).toContainText('Conferência necessária');
  await expect(eventDeadline).not.toContainText('Vencimento');
  await eventRegion.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('eventos-tox-preparacao-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await eventRegion.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('eventos-tox-preparacao-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await eventRegion
    .getByRole('button', { name: 'Consultar XML preparado', exact: true })
    .click();
  const xmlDialog = page.getByRole('dialog', {
    name: 'XML preparado para conferência',
  });
  await expect(xmlDialog).toContainText('AB123456789');
  await xmlDialog
    .getByRole('button', { name: 'Fechar XML', exact: true })
    .click();
  const accepted = await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-secondary`,
    { type: 'S-2221', id: prepared.id },
  );
  expect(accepted.receipt).toMatch(/^\d\.\d\.\d{19}$/);
  const acceptedXml = await db.sstSecondaryDelivery.findUniqueOrThrow({
    where: { id: accepted.deliveryId },
    select: { signedXml: true, receipt: true },
  });
  await page.goto(employeePath);
  await openExamHistory();
  await page
    .getByRole('button', { name: 'Corrigir exame', exact: true })
    .click();
  examDialog = page.getByRole('dialog', {
    name: 'Corrigir exame toxicológico',
    exact: true,
  });
  await expect(examDialog).toContainText(accepted.receipt);
  await examDialog
    .getByLabel('Nome do médico responsável')
    .fill('Médico corrigido depois do aceite');
  await examDialog
    .getByRole('button', { name: 'Salvar exame', exact: true })
    .click();
  await expect(
    examDialog.getByText(/Explique a correção do exame já declarado/),
  ).toBeVisible();
  await examDialog
    .getByLabel('Motivo da correção')
    .fill('Correção do nome no exame original, sem mudar sua data');
  await expect(
    examDialog.getByText(/Explique a correção do exame já declarado/),
  ).toHaveCount(0);
  const corrected = waitForApi(page, 'PATCH', `${toxicology}/${tox.id}`);
  await examDialog
    .getByRole('button', { name: 'Salvar exame', exact: true })
    .click();
  expect((await assertStatus(await corrected, 200)).revision).toBe(4);
  expect(
    await db.sstSecondaryDelivery.findUniqueOrThrow({
      where: { id: accepted.deliveryId },
      select: { signedXml: true, receipt: true },
    }),
  ).toEqual(acceptedXml);
  await page.goto(socialPath);
  await chooseType('S-2221 — Exame toxicológico');
  await chooseSource(
    'Exame toxicológico cadastrado',
    new RegExp(employee.name),
  );
  await expect(
    page.getByText(/Há alterações neste cadastro desde o último evento aceito/),
  ).toBeVisible();
  const rectification = await prepareEvent(
    'S-2221',
    'Retificação da correção informada na origem clínica',
  );
  expect(rectification.kind).toBe('RECTIFICATION');
  expect(rectification.content.ideEmpregador.nrInsc).toBe('11222333000181');
  await expect(
    page.getByRole('combobox', {
      name: 'Inscrição do empregador no eSocial',
      exact: true,
    }),
  ).toHaveCount(0);
  expect(rectification.unsignedXml).toContain(
    `<nrRecibo>${accepted.receipt}</nrRecibo>`,
  );
  const correctedAcceptance = await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-secondary`,
    { type: 'S-2221', id: rectification.id },
  );
  const correctedXml = await db.sstSecondaryDelivery.findUniqueOrThrow({
    where: { id: correctedAcceptance.deliveryId },
    select: { signedXml: true, receipt: true },
  });
  // Lifecycle is decided by the clinical author. Saving the inactive source
  // does not silently delete the receipt or create a government transmission.
  await page.goto(employeePath);
  await openExamHistory();
  await page
    .getByRole('button', { name: 'Corrigir exame', exact: true })
    .click();
  examDialog = page.getByRole('dialog', {
    name: 'Corrigir exame toxicológico',
    exact: true,
  });
  await examDialog
    .getByRole('button', { name: 'Inativar exame', exact: true })
    .click();
  await expect(examDialog).toContainText('Esta ação não transmite ao eSocial.');
  await examDialog
    .getByRole('button', { name: 'Salvar exame', exact: true })
    .click();
  await expect(
    examDialog.getByText(/Explique a correção do exame já declarado/),
  ).toBeVisible();
  await examDialog
    .getByLabel('Motivo da correção')
    .fill('Exame inativado pela origem; solicitar exclusão do recibo');
  await expect(
    examDialog.getByText(/Explique a correção do exame já declarado/),
  ).toHaveCount(0);
  await captureCompletionDialog(
    page,
    examDialog,
    'eventos-tox-inativacao-390.png',
    'bottom',
  );
  const inactivated = waitForApi(page, 'PATCH', `${toxicology}/${tox.id}`);
  await examDialog
    .getByRole('button', { name: 'Salvar exame', exact: true })
    .click();
  const inactive = await assertStatus(await inactivated, 200);
  expect(inactive.status).toBe('INACTIVE');
  expect(inactive.revision).toBe(5);
  const sourceBeforeExclusion = await call(
    page,
    'GET',
    `${secondary}/S-2221?environment=2`,
  );
  expect(
    sourceBeforeExclusion.sources.find((source: any) => source.id === tox.id)
      .needsExclusion,
  ).toBe(true);
  await page.goto(socialPath);
  await chooseType('S-3000 — Exclusão de evento aceito');
  await chooseSource(
    'Evento aceito a excluir',
    new RegExp(correctedAcceptance.receipt.replaceAll('.', '\\.')),
  );
  const toxExclusion = await prepareEvent(
    'S-3000',
    'Excluir o último aceite do exame inativado na origem',
  );
  expect(toxExclusion.content.ideEmpregador.nrInsc).toBe('11222333000181');
  expect(toxExclusion.content.infoExclusao.nrRecEvt).toBe(
    correctedAcceptance.receipt,
  );
  expect(toxExclusion.legalDeadline.deadline.family).toBe('S-3000');
  expect(toxExclusion.legalDeadline.deadline.state).toBe('NO_FIXED_DEADLINE');
  await expect(
    eventRegion.getByRole('region', {
      name: 'Prazo legal do evento preparado',
      exact: true,
    }),
  ).toContainText('não renova nem substitui o prazo');
  await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-secondary`,
    { type: 'S-3000', id: toxExclusion.id },
  );
  const inactiveSources = await call(
    page,
    'GET',
    `${secondary}/S-2221?environment=2`,
  );
  expect(
    inactiveSources.sources.some((source: any) => source.id === tox.id),
  ).toBe(false);
  expect(
    await db.sstSecondaryDelivery.findUniqueOrThrow({
      where: { id: correctedAcceptance.deliveryId },
      select: { signedXml: true, receipt: true },
    }),
  ).toEqual(correctedXml);
  await page.goto(employeePath);
  await openExamHistory();
  await page
    .getByRole('button', { name: 'Corrigir exame', exact: true })
    .click();
  examDialog = page.getByRole('dialog', {
    name: 'Corrigir exame toxicológico',
    exact: true,
  });
  await examDialog
    .getByRole('button', { name: 'Reativar exame', exact: true })
    .click();
  await examDialog
    .getByLabel('Motivo da correção')
    .fill('Retomar exame válido sem reativar o recibo excluído');
  const reactivated = waitForApi(page, 'PATCH', `${toxicology}/${tox.id}`);
  await examDialog
    .getByRole('button', { name: 'Salvar exame', exact: true })
    .click();
  const activeAgain = await assertStatus(await reactivated, 200);
  expect(activeAgain.status).toBe('ACTIVE');
  expect(activeAgain.revision).toBe(6);
  const activeSources = await call(
    page,
    'GET',
    `${secondary}/S-2221?environment=2`,
  );
  expect(
    activeSources.sources.find((source: any) => source.id === tox.id)
      .lastAcceptedDeliveryId,
  ).toBeNull();
  await page.goto(socialPath);
  // CAT and ASO both use their real existing operational records. No XML or
  // receipt is typed by the sender, and ASO keeps the complementary exam order.
  await chooseType('S-2210 — Comunicação de acidente de trabalho');
  await chooseSource('CAT cadastrada', new RegExp(employee.name));
  await page
    .getByRole('combobox', {
      name: 'Inscrição do empregador no eSocial',
      exact: true,
    })
    .click();
  await page.getByRole('option', { name: /11222333$/ }).click();
  const catEvent = await prepareEvent('S-2210', 'Conferência de CAT da origem');
  expect(catEvent.source.id).toBe(String(cat.id));
  expect(catEvent.unsignedXml).toContain('<evtCAT');
  await chooseType('S-2220 — Saúde do trabalhador / ASO');
  await chooseSource('ASO cadastrado', new RegExp(employee.name));
  const asoEvent = await prepareEvent(
    'S-2220',
    'Conferência do ASO com audiometria',
  );
  expect(asoEvent.content.exMedOcup.aso.exame).toHaveLength(2);
  expect(asoEvent.content.exMedOcup.aso.exame[1].ordExame).toBe(2);
  await chooseType('S-3000 — Exclusão de evento aceito');
  await chooseSource(
    'Evento aceito a excluir',
    new RegExp(initial.receipt.replaceAll('.', '\\.')),
  );
  const exclusion = await prepareEvent(
    'S-3000',
    'Exclusão de teste mantendo a origem e o recibo anterior',
  );
  expect(exclusion.content.infoExclusao.tpEvento).toBe('S-2240');
  expect(exclusion.content.ideEmpregador.nrInsc).toBe('11222333');
  expect(exclusion.content.infoExclusao.nrRecEvt).toBe(initial.receipt);
  await eventRegion.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('eventos-exclusao-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 1360, height: 900 });
  await eventRegion.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('eventos-exclusao-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-secondary`,
    { type: 'S-3000', id: exclusion.id },
  );
  const run = await call(
    page,
    'GET',
    `/companies/${companyId}/esocial-initial/2240/${initial.runId}`,
  );
  expect(run.events[0].delivery.excluded).toBe(true);
  expect(run.events[0].delivery.exclusionPending).toBe(false);
  expect(
    await db.sstInitialDelivery.findUniqueOrThrow({
      where: { id: initial.deliveryId },
      select: { signedXml: true, receipt: true },
    }),
  ).toEqual(initialXml);
  expect(
    await db.employee.findUnique({ where: { id: employee.id } }),
  ).not.toBeNull();
  expect(
    await db.sstToxicologyRecord.findUnique({ where: { id: tox.id } }),
  ).not.toBeNull();
  await page.reload();
  const existingRuns = page.getByRole('combobox', {
    name: 'Preparações e envios desta empresa',
    exact: true,
  });
  await existingRuns.click();
  await page
    .getByRole('option', { name: new RegExp(initial.runId.slice(0, 8)) })
    .click();
  await expect(
    page.getByText('Aceito — excluído pelo eSocial', { exact: true }),
  ).toBeVisible();
  const beforeDeliveries =
    (await db.sstInitialDelivery.count({ where: { companyId } })) +
    (await db.sstSecondaryDelivery.count({ where: { companyId } }));
  await page
    .getByRole('button', { name: 'Atualizar pendências', exact: true })
    .click();
  const healthDialog = page.getByRole('dialog', {
    name: 'Atualizar pendências',
    exact: true,
  });
  await healthDialog
    .getByLabel('Motivo da conferência', { exact: true })
    .fill('Conferir cadastros locais sem transmitir');
  const reconcile = waitForApi(
    page,
    'POST',
    `/companies/${companyId}/sst-operational/reconcile`,
  );
  await healthDialog
    .getByRole('button', { name: 'Solicitar conferência', exact: true })
    .click();
  expect((await assertStatus(await reconcile, 201)).transmissionCreated).toBe(
    false,
  );
  const afterDeliveries =
    (await db.sstInitialDelivery.count({ where: { companyId } })) +
    (await db.sstSecondaryDelivery.count({ where: { companyId } }));
  expect(afterDeliveries).toBe(beforeDeliveries);
});

test('SST consultoria — operador sem membership cliente prepara e acompanha envios pelo contrato ativo', async ({
  page,
}) => {
  test.setTimeout(240000);
  const setup = await seedCatalogBrowserSetup();
  const { companyId, workspaceId, employee, groupA, factor, riskGroupId } =
    setup;
  const client = await db.company.findUniqueOrThrow({
    where: { id: companyId },
  });
  const passwordSource = await db.user.findUniqueOrThrow({
    where: { email: fixture.email },
  });
  const consultancy = await db.company.create({
    data: {
      name: 'Consultoria E2E com autoridade própria',
      cnpj: '44555666000100',
      type: 'MATRIZ',
      permissions: client.permissions,
    },
  });
  const consultant = await db.user.create({
    data: {
      name: 'Operador da consultoria E2E',
      email: `consultant-${randomUUID()}@api-e2e.invalid`,
      password: passwordSource.password,
      companies: {
        create: {
          companyId: consultancy.id,
          roles: ['1', '8', '14', '15', '16'],
          permissions: [
            '14-cru',
            '26-cr',
            '26.1-u',
            '2.2-cru',
            '2.1-cru',
            '4.0-cru',
            '4.3-cru',
            '4.6-cru',
            '6-cru',
            '2-cru',
            '10-r',
          ],
        },
      },
    },
  });
  await db.contract.create({
    data: {
      applyingServiceCompanyId: consultancy.id,
      receivingServiceCompanyId: companyId,
    },
  });
  expect(
    await db.userCompany.count({ where: { companyId, userId: consultant.id } }),
  ).toBe(0);
  await login(page, `/dashboard/empresas/${companyId}/esocial`, {
    email: consultant.email,
    password: fixture.password,
  });
  const cookie = (await page.context().cookies()).find(
    (item) => item.name === 'nextauth.token',
  )!.value;
  const claims = JSON.parse(
    Buffer.from(cookie.split('.')[1], 'base64url').toString(),
  );
  expect(claims.companyId).toBe(consultancy.id);
  expect(claims.roles).not.toContain('master');
  await expect(
    page.getByRole('region', { name: 'Situação do acompanhamento eSocial' }),
  ).toBeVisible();
  await call(page, 'POST', '/risk-data', {
    companyId,
    riskId: factor.id,
    homogeneousGroupId: groupA.id,
    riskFactorGroupDataId: riskGroupId,
    workspaceId,
    startDate: '2026-01-01T12:00:00Z',
    keepEmpty: true,
    json: {
      type: 'QUI',
      twaValue: '5',
      twa: '10',
      measuredOn: '2026-01-01',
      selectedMeasurement: 'twaValue',
      selectionReason: 'Coleta técnica da consultoria',
      unit: 'ppm',
      sstDeclaration: { exposure: 'PRESENT', epiUsed: 'NO', epcPresent: 'NO' },
    },
  });
  await page
    .getByLabel('Data inicial de envio', { exact: true })
    .fill('01/01/2026');
  await page
    .getByLabel('Motivo da configuração', { exact: true })
    .fill('Consultoria assume o envio da empresa atendida');
  const policy = waitForApi(
    page,
    'POST',
    `/companies/${companyId}/sst-operational/policy`,
  );
  await page
    .getByRole('button', { name: 'Salvar data inicial', exact: true })
    .click();
  await assertStatus(await policy, 201);
  const initial = await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-2240`,
    { employeeId: employee.id },
  );
  const initialRun = await db.sstInitialRun.findUniqueOrThrow({
    where: { id: initial.runId },
  });
  expect(initialRun.companyId).toBe(companyId);
  expect(initialRun.actorId).toBe(String(consultant.id));
  const clinical = await call(
    page,
    'POST',
    `/companies/${companyId}/esocial-events/toxicology-records`,
    {
      operationId: randomUUID(),
      employeeId: employee.id,
      examDate: '2026-10-01',
      laboratoryCnpj: '11222333000181',
      examCode: 'CD123456789',
      doctorName: 'Médico da consultoria E2E',
      doctorCrm: '12345',
      doctorUf: 'SP',
      workerLivesAbroad: false,
    },
  );
  await page
    .getByRole('combobox', { name: 'Tipo de evento', exact: true })
    .click();
  await page
    .getByRole('option', { name: 'S-2221 — Exame toxicológico', exact: true })
    .click();
  await page
    .getByRole('combobox', {
      name: 'Inscrição do empregador no eSocial',
      exact: true,
    })
    .click();
  await page.getByRole('option', { name: /11222333000181$/ }).click();
  await page
    .getByRole('combobox', {
      name: 'Exame toxicológico cadastrado',
      exact: true,
    })
    .click();
  await page.getByRole('option', { name: new RegExp(employee.name) }).click();
  await page
    .getByLabel('Motivo do envio ou da retificação', { exact: true })
    .fill('Conferência pela consultoria com contrato direto');
  const prepare = waitForApi(
    page,
    'POST',
    `/companies/${companyId}/esocial-events/S-2221/prepare`,
  );
  await page
    .getByRole('button', {
      name: 'Preparar evento para conferência',
      exact: true,
    })
    .click();
  const event = await assertStatus(await prepare, 201);
  expect(event.state, JSON.stringify(event.diagnostics)).toBe('READY');
  expect(event.source.id).toBe(clinical.id);
  expect(event.content.ideEmpregador.nrInsc).toBe('11222333000181');
  expect(event.legalDeadline.deadline.environment).toBe(2);
  expect(event.legalDeadline.deadline.legalEffect).toBe(false);
  const prepared = await db.sstSecondaryEvent.findUniqueOrThrow({
    where: { id: event.id },
  });
  expect(prepared.actorId).toBe(String(consultant.id));
  expect(prepared.companyId).toBe(companyId);
  const accepted = await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-secondary`,
    { type: 'S-2221', id: event.id },
  );
  const region = page.getByRole('region', {
    name: 'Conferência do evento adicional',
    exact: true,
  });
  const legalDeadline = region.getByRole('region', {
    name: 'Prazo legal do evento preparado',
    exact: true,
  });
  await expect(legalDeadline).toContainText('Simulação · produção restrita');
  await expect(legalDeadline).toContainText(
    'cumprimento do prazo não avaliado',
  );
  await expect(
    region.getByText(accepted.receipt, { exact: true }),
  ).toBeVisible();
  await region.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('consultoria-envio-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await region.scrollIntoViewIfNeeded();
  const result = region.getByLabel('Resultado do processamento deste evento', {
    exact: true,
  });
  await expect(
    result.getByText(accepted.receipt, { exact: true }),
  ).toBeVisible();
  expect(
    await result.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath('consultoria-envio-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  expect(
    await db.userCompany.count({ where: { companyId, userId: consultant.id } }),
  ).toBe(0);
  expect(
    await db.sstInitialRun.count({ where: { companyId: consultancy.id } }),
  ).toBe(0);
  expect(
    await db.sstSecondaryEvent.count({ where: { companyId: consultancy.id } }),
  ).toBe(0);
  expect(
    (
      await db.sstInitialDelivery.findUniqueOrThrow({
        where: { id: initial.deliveryId },
      })
    ).receipt,
  ).toBe(initial.receipt);
});

test('SST contexto — data e motivo valem nesta aba, com exceção por alteração e encerramento explícito', async ({
  page,
}) => {
  test.setTimeout(300000);
  const setup = await seedCatalogBrowserSetup();
  const { companyId, workspaceId, email, employee, groupA, riskGroupId } =
    setup;
  const factors = [setup.factor];
  for (const [index, code] of ['01.04.001', '01.05.001'].entries()) {
    await db.esocialTable24.upsert({
      where: { id: code },
      create: {
        id: code,
        name: `Agente químico sintético C1 ${index + 2}`,
        group: '01',
        type: 'QUI',
        isQuantity: true,
      },
      update: {},
    });
    factors.push(
      await db.riskFactors.create({
        data: {
          companyId,
          name: `SOLVENTE CONTEXTO ${index + 2} ${randomUUID().slice(0, 6)}`,
          type: 'QUI',
          severity: 3,
          unit: 'ppm',
          method: 'Método de coleta C1',
          twa: '10',
          esocialCode: code,
        },
      }),
    );
  }
  await login(
    page,
    `/dashboard/empresas/${companyId}/novo/sst?active=2&tabWorkspaceId=${workspaceId}`,
    {
      email,
      password: fixture.password,
    },
  );
  const originalRows: { id: string }[] = [];
  for (let index = 0; index < factors.length; index++) {
    originalRows.push(
      await call(page, 'POST', '/risk-data', {
        companyId,
        riskId: factors[index].id,
        homogeneousGroupId: groupA.id,
        riskFactorGroupDataId: riskGroupId,
        workspaceId,
        startDate: '2026-01-01T12:00:00Z',
        probability: 3,
        keepEmpty: true,
        json: {
          type: 'QUI',
          twaValue: String(index + 5),
          twa: '10',
          measuredOn: '2026-01-01',
          selectedMeasurement: 'twaValue',
          selectionReason: 'Amostra representativa anterior ao contexto',
          unit: 'ppm',
          sstDeclaration: {
            exposure: 'PRESENT',
            epiUsed: 'NO',
            epcPresent: 'NO',
          },
        },
      }),
    );
  }
  await call(page, 'POST', `/companies/${companyId}/sst-operational/policy`, {
    fromDate: '2026-01-01',
    expectedRevision: 0,
    reason: 'Responsabilidade da empresa sintética C1',
  });
  const accepted = await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-2240`,
    { employeeId: employee.id },
  );
  const acceptedArtifact = await db.sstInitialDelivery.findUniqueOrThrow({
    where: { id: accepted.deliveryId },
    select: { signedXml: true, receipt: true, protocol: true, state: true },
  });
  // Refresh before activation, never while testing the in-memory tab context.
  await page.reload();
  await page.getByText(groupA.name, { exact: true }).click();
  await page
    .getByRole('tab', { name: 'Fatores de Riscos', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Como esta alteração afeta o período?',
    exact: true,
  });
  const banner = page.getByRole('region', {
    name: 'Contexto de alterações desta empresa',
    exact: true,
  });
  const commonReason =
    'Revisita de abril: mudanças observadas pelo responsável C1';
  type RecordedWrite = {
    path: string;
    status: number;
    operationId?: string;
    decision?: any;
    riskId?: string;
  };
  const writes: RecordedWrite[] = [];
  let aiActionId: string | undefined;
  page.on('response', (response) => {
    const request = response.request(),
      path = new URL(response.url()).pathname;
    if (
      request.method() !== 'POST' ||
      !(
        path === '/risk-data' ||
        /^\/ai-chat\/actions\/[^/]+\/confirm$/.test(path)
      )
    )
      return;
    const headers = request.headers();
    let decision: any, body: any;
    if (headers['x-sst-decision'])
      decision = JSON.parse(decodeURIComponent(headers['x-sst-decision']));
    try {
      body = request.postDataJSON();
    } catch {
      /* Confirmation has no body. */
    }
    writes.push({
      path,
      status: response.status(),
      operationId: headers['x-sst-operation-id'],
      decision,
      riskId: body?.riskId,
    });
  });
  const current = (index: number) =>
    db.riskFactorData.findFirstOrThrow({
      where: {
        companyId,
        riskId: factors[index].id,
        homogeneousGroupId: groupA.id,
        endDate: null,
      },
    });
  async function openMeasurement(index: number, value: string) {
    // Use the actual list controls to collapse every historical/current row,
    // then open only the current occurrence. No navigation reloads the tab.
    // Rows register after the tab renders; wait for either actual toggle state
    // before taking an immediate visibility snapshot of the collapsed label.
    await expect(
      page.getByRole('button', {
        name: /^(Expandir todos|Recolher todos)$/,
      }),
    ).toBeVisible();
    const expandAll = page.getByRole('button', {
      name: 'Expandir todos',
      exact: true,
    });
    if (await expandAll.isVisible()) await expandAll.click();
    await page
      .getByRole('button', { name: 'Recolher todos', exact: true })
      .click();
    const header = page
      .locator('.item_box')
      .filter({ has: page.getByText(factors[index].name, { exact: true }) })
      .first();
    await header.getByText(factors[index].name, { exact: true }).click();
    const row = header.locator('..').locator('..').locator('..');
    await row.getByText('Quantitativo', { exact: true }).click();
    await expect(page.locator('input[name="twaValue"]')).toBeVisible();
    await page.locator('input[name="twaValue"]').fill(value);
    await page
      .getByLabel('Data da medição', { exact: true })
      .fill('2026-04-01');
  }
  async function submitMeasurement() {
    await page
      .getByRole('button', { name: 'Salvar', exact: true })
      .last()
      .click();
  }
  async function assertActualRetry(index: number, fromIndex: number) {
    await expect
      .poll(() =>
        writes
          .slice(fromIndex)
          .filter((write) => write.riskId === factors[index].id)
          .map((write) => write.status),
      )
      .toEqual([409, 201]);
    const selected = writes
      .slice(fromIndex)
      .filter((write) => write.riskId === factors[index].id);
    expect(selected.map((write) => write.status)).toEqual([409, 201]);
    expect(selected[0].decision).toBeUndefined();
    expect(selected[1].operationId).toBe(selected[0].operationId);
    expect(selected[1].operationId).toMatch(/^[a-f0-9-]{36}$/);
    expect(selected[1].decision).toMatchObject({
      intent: 'NEW_CONDITION',
      effectiveFrom: '2026-04-01',
      reason: commonReason,
    });
    expect(selected[1].decision.expectedHead).toMatch(/^[a-f0-9]{64}$/);
  }

  // The first actual save still asks for the decision; opting in is explicit.
  await openMeasurement(0, '8');
  await submitMeasurement();
  await expect(dialog).toBeVisible();
  expect((await current(0)).json.twaValue).toBe('5');
  await dialog.getByLabel('Natureza da alteração').click();
  await page
    .getByRole('option', {
      name: 'Registrar mudança nas condições',
      exact: true,
    })
    .click();
  await dialog
    .getByLabel('Início da nova condição', { exact: true })
    .fill('01/04/2026');
  await dialog
    .getByLabel('Motivo da alteração', { exact: true })
    .fill(commonReason);
  const reuse = dialog.getByRole('checkbox', {
    name: 'Usar esta data e motivo nas próximas alterações desta empresa por 2 horas',
    exact: true,
  });
  await expect(reuse).not.toBeChecked();
  await reuse.check();
  await page.screenshot({
    path: test.info().outputPath('contexto-ativacao-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await dialog
    .getByRole('button', { name: 'Confirmar e salvar', exact: true })
    .click();
  await expect.poll(async () => (await current(0)).json.twaValue).toBe('8');
  await expect(dialog).toHaveCount(0);
  await expect(banner).toBeVisible();
  await expect(banner).toContainText(commonReason);
  await expect(banner).toContainText('01/04/2026');
  await assertActualRetry(0, 0);
  const firstDecision = writes.find(
    (write) => write.riskId === factors[0].id && write.status === 201,
  )!.decision;
  await page.setViewportSize({ width: 390, height: 844 });
  await banner.scrollIntoViewIfNeeded();
  expect(
    await banner.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath('contexto-ativo-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 1440, height: 1000 });

  // A different source uses the same date/reason, but its own fresh API fence.
  const secondStart = writes.length;
  await openMeasurement(1, '9');
  await submitMeasurement();
  await expect.poll(async () => (await current(1)).json.twaValue).toBe('9');
  await expect(dialog).toHaveCount(0);
  await assertActualRetry(1, secondStart);
  const secondDecision = writes
    .slice(secondStart)
    .find((write) => write.status === 201)!.decision;
  expect(secondDecision.expectedHead).not.toBe(firstDecision.expectedHead);
  for (const original of originalRows.slice(0, 2)) {
    const previous = await db.riskFactorData.findUniqueOrThrow({
      where: { id: original.id },
    });
    expect(previous.endDate?.toISOString().slice(0, 10)).toBe('2026-04-01');
  }
  await page.screenshot({
    path: test.info().outputPath('contexto-segunda-alteracao-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });

  // A normal stored proposal is loaded through the real chat history. Opening
  // its card must not confirm it; the person still clicks every AI proposal.
  const actor = await db.user.findUniqueOrThrow({ where: { email } });
  const thread = await call(page, 'POST', '/ai-chat/threads', {
    title: 'Proposta C1 aguardando clique',
  });
  expect(thread.title).toBe('Proposta C1 aguardando clique');
  const message = await db.$transaction(async (tx: typeof db) => {
    const stored = await tx.aiMessage.create({
      data: {
        threadId: thread.id,
        role: 'assistant',
        content: 'Confira a medição proposta durante a revisita.',
      },
    });
    // Match addMessage's normal conversation metadata. History deliberately
    // excludes empty threads; inserting a synthetic message alone is incomplete.
    await tx.aiThread.update({
      where: { id: thread.id },
      data: {
        lastMessageAt: stored.created_at,
        updated_at: stored.created_at,
      },
    });
    return stored;
  });
  const originalAi = await current(2);
  const { requestHash } = require(
    `${process.env.API_E2E_ROOT}/dist/sst-history/commands/change-contract`,
  );
  const action = await db.aiPendingAction.create({
    data: {
      companyId,
      userId: actor.id,
      messageId: message.id,
      service: 'UPSERT_MANY_RISK_DATA',
      summary: 'Proposta C1: atualizar a terceira medição',
      details: { Medição: 'De 7 para 11 ppm' },
      payload: {
        contractVersion: 2,
        baseHash: requestHash(JSON.parse(JSON.stringify(originalAi))),
        data: {
          id: originalAi.id,
          riskId: factors[2].id,
          homogeneousGroupId: groupA.id,
          riskFactorGroupDataId: riskGroupId,
          workspaceId,
          json: { twaValue: '11', measuredOn: '2026-04-01' },
          keepEmpty: true,
        },
      },
    },
  });
  aiActionId = action.id;
  const listed = await call(page, 'GET', '/ai-chat/threads?first=20');
  expect(
    listed.edges.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
    })),
  ).toContainEqual({ id: thread.id, title: thread.title });
  await page
    .getByRole('button', { name: 'Toggle AI Assistant', exact: true })
    .click();
  await page.getByTitle('Histórico de conversas', { exact: true }).click();
  await page
    .getByText('Proposta C1 aguardando clique', { exact: true })
    .click();
  await expect(
    page.getByText('Proposta C1: atualizar a terceira medição', {
      exact: true,
    }),
  ).toBeVisible();
  expect(
    (await db.aiPendingAction.findUniqueOrThrow({ where: { id: action.id } }))
      .status,
  ).toBe('PENDING');
  expect((await current(2)).json.twaValue).toBe('7');
  expect(
    writes.filter(
      (write) => write.path === `/ai-chat/actions/${aiActionId}/confirm`,
    ),
  ).toEqual([]);
  await page
    .getByRole('button', {
      name: 'Confirmar alteração no cadastro',
      exact: true,
    })
    .click();
  await expect
    .poll(
      async () =>
        (
          await db.aiPendingAction.findUniqueOrThrow({
            where: { id: action.id },
          })
        ).status,
    )
    .toBe('COMPLETED');
  await expect(
    page.getByText('Aplicado à caracterização', { exact: true }),
  ).toBeVisible();
  await expect(dialog).toHaveCount(0);
  expect((await current(2)).json.twaValue).toBe('11');
  const aiWrites = writes.filter(
    (write) => write.path === `/ai-chat/actions/${aiActionId}/confirm`,
  );
  expect(aiWrites.map((write) => write.status)).toEqual([409, 201]);
  expect(aiWrites[0].decision).toBeUndefined();
  expect(aiWrites[1].operationId).toBe(aiWrites[0].operationId);
  expect(aiWrites[1].decision).toMatchObject({
    intent: 'NEW_CONDITION',
    effectiveFrom: '2026-04-01',
    reason: commonReason,
  });
  await page.screenshot({
    path: test.info().outputPath('contexto-proposta-ia-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByTitle('Fechar', { exact: true }).click();

  // One explicit exception never turns the reusable context into a correction.
  await banner
    .getByRole('button', { name: 'Conferir próxima alteração', exact: true })
    .click();
  await openMeasurement(1, '10');
  await submitMeasurement();
  await expect(dialog).toBeVisible();
  expect((await current(1)).json.twaValue).toBe('9');
  await dialog.getByLabel('Natureza da alteração').click();
  await page
    .getByRole('option', {
      name: 'Corrigir informação deste período',
      exact: true,
    })
    .click();
  await dialog
    .getByLabel('Data dentro do período a corrigir', { exact: true })
    .fill('15/04/2026');
  await dialog
    .getByLabel('Motivo da alteração', { exact: true })
    .fill('Correção individual: resultado digitado incorretamente');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: test.info().outputPath('contexto-excecao-correcao-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await dialog
    .getByRole('button', { name: 'Confirmar e salvar', exact: true })
    .click();
  await expect.poll(async () => (await current(1)).json.twaValue).toBe('10');
  await expect(dialog).toHaveCount(0);
  await expect(banner).toContainText(commonReason);
  const correction = writes
    .filter((write) => write.riskId === factors[1].id && write.status === 201)
    .at(-1)!;
  expect(correction.decision).toMatchObject({
    intent: 'CORRECTION',
    effectiveFrom: '2026-04-15',
    reason: 'Correção individual: resultado digitado incorretamente',
  });
  expect((await current(1)).startDate?.toISOString().slice(0, 10)).toBe(
    '2026-04-01',
  );

  await banner
    .getByRole('button', { name: 'Encerrar contexto', exact: true })
    .click();
  await expect(banner).toHaveCount(0);
  await openMeasurement(0, '12');
  await submitMeasurement();
  await expect(dialog).toBeVisible();
  expect((await current(0)).json.twaValue).toBe('8');
  await expect(
    dialog.getByRole('checkbox', {
      name: 'Usar esta data e motivo nas próximas alterações desta empresa por 2 horas',
      exact: true,
    }),
  ).not.toBeChecked();
  await page.screenshot({
    path: test.info().outputPath('contexto-encerrado-nova-decisao-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await dialog
    .getByRole('button', { name: 'Voltar ao cadastro', exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  const preservedMeasurement = page.locator('input[name="twaValue"]');
  await expect(preservedMeasurement).toBeVisible();
  await expect(preservedMeasurement).toHaveValue('12');
  await expect(
    page.getByLabel('Data da medição', { exact: true }),
  ).toHaveValue('2026-04-01');
  await expect(
    page.getByRole('button', { name: 'Salvar', exact: true }).last(),
  ).toBeEnabled();
  await page.setViewportSize({ width: 390, height: 844 });
  await preservedMeasurement.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath('contexto-cancelado-rascunho-preservado-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  expect((await current(0)).json.twaValue).toBe('8');
  expect(
    await db.sstInitialDelivery.findUniqueOrThrow({
      where: { id: accepted.deliveryId },
      select: { signedXml: true, receipt: true, protocol: true, state: true },
    }),
  ).toEqual(acceptedArtifact);
  expect(await db.sstInitialDelivery.count({ where: { companyId } })).toBe(1);
  for (let index = 0; index < originalRows.length; index++) {
    const row = await db.riskFactorData.findUniqueOrThrow({
      where: { id: originalRows[index].id },
    });
    expect(row.json.twaValue).toBe(String(index + 5));
    expect(row.endDate?.toISOString().slice(0, 10)).toBe('2026-04-01');
  }
  expect(
    await db.sstHistoryRevision.count({
      where: { companyId, reason: commonReason, source: 'AI' },
    }),
  ).toBeGreaterThan(0);
});

test('SST período — fim exclusivo recusa datas iguais, reversas e parciais sem fechar ou gravar', async ({
  page,
}) => {
  const setup = await seedCatalogBrowserSetup();
  const { companyId, workspaceId, email, factor, groupA, riskGroupId } = setup;
  await login(
    page,
    `/dashboard/empresas/${companyId}/novo/sst?active=2&tabWorkspaceId=${workspaceId}`,
    {
      email,
      password: fixture.password,
    },
  );
  const risk = await call(page, 'POST', '/risk-data', {
    companyId,
    riskId: factor.id,
    homogeneousGroupId: groupA.id,
    riskFactorGroupDataId: riskGroupId,
    workspaceId,
    startDate: '2026-01-01T12:00:00Z',
    probability: 3,
    keepEmpty: true,
    json: {
      type: 'QUI',
      twaValue: '5',
      twa: '10',
      measuredOn: '2026-01-01',
      selectedMeasurement: 'twaValue',
      selectionReason: 'Amostra do período pré-envio',
      unit: 'ppm',
      sstDeclaration: { exposure: 'PRESENT', epiUsed: 'NO', epcPresent: 'NO' },
    },
  });
  expect(await db.sstInitialDelivery.count({ where: { companyId } })).toBe(0);
  const original = await db.riskFactorData.findUniqueOrThrow({
    where: { id: risk.id },
  });
  await page.reload();
  await page.getByText(groupA.name, { exact: true }).click();
  await page
    .getByRole('tab', { name: 'Fatores de Riscos', exact: true })
    .click();
  const header = page
    .locator('.item_box')
    .filter({ has: page.getByText(factor.name, { exact: true }) })
    .first();
  await header.getByText(factor.name, { exact: true }).click();
  await header.locator('..').locator('.item_end_date').click();
  const modal = page.locator('.MuiModal-root').filter({
    has: page.getByRole('heading', {
      name: 'Definir período de vigência',
      exact: true,
    }),
  });
  await expect(modal).toBeVisible();
  const start = modal.getByLabel('Data de início', { exact: true });
  const end = modal.getByLabel('Válido antes de', { exact: true });
  const confirm = modal.getByRole('button', { name: 'Confirmar', exact: true });
  await expect(start).toHaveValue('01/01/2026');
  await expect(end).toHaveValue('');
  await expect(modal).toContainText('Esta data não faz parte do período.');
  let writes = 0;
  page.on('request', (request) => {
    if (
      request.method() === 'POST' &&
      new URL(request.url()).pathname === '/risk-data'
    )
      writes++;
  });
  const unchanged = async () => {
    await expect(modal).toBeVisible();
    expect(writes).toBe(0);
    expect(
      await db.riskFactorData.findUniqueOrThrow({ where: { id: risk.id } }),
    ).toEqual(original);
  };
  await start.fill('01/04/2026');
  await end.fill('01/04/2026');
  await confirm.click();
  await expect(modal).toContainText('deve ser posterior à data de início');
  await expect(end).toHaveValue('01/04/2026');
  await unchanged();
  await end.fill('31/03/2026');
  await confirm.click();
  await expect(end).toHaveValue('31/03/2026');
  await unchanged();
  await start.fill('01/04/20');
  await confirm.click();
  await expect(start).toHaveValue('01/04/20');
  await expect(start).toHaveAttribute('aria-invalid', 'true');
  await expect(modal).toContainText(
    'Informe uma data válida no formato DD/MM/AAAA.',
  );
  await unchanged();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(confirm).toBeInViewport();
  await page.screenshot({
    path: test.info().outputPath('periodo-exclusivo-invalido-390.png'),
    fullPage: true,
    animations: 'disabled',
  });

  await start.fill('01/03/2026');
  await end.fill('01/04/2026');
  const saved = waitForApi(page, 'POST', '/risk-data');
  await confirm.click();
  await assertStatus(await saved, 201);
  await expect(modal).toHaveCount(0);
  const updated = await db.riskFactorData.findUniqueOrThrow({
    where: { id: risk.id },
  });
  expect(updated.startDate?.toISOString()).toBe('2026-03-01T00:00:00.000Z');
  expect(updated.endDate?.toISOString()).toBe('2026-04-01T00:00:00.000Z');
  expect(updated.json).toEqual(original.json);
  expect(writes).toBe(1);
  expect(await db.sstInitialDelivery.count({ where: { companyId } })).toBe(0);
  const historyPath = `/companies/${companyId}/sst-operational/history?table=RiskFactorData&id=${risk.id}&effectiveOn=`;
  expect(
    (await call(page, 'GET', historyPath + '2026-03-31')).condition,
  ).not.toBeNull();
  expect(
    (await call(page, 'GET', historyPath + '2026-04-01')).condition,
  ).toBeNull();
  await expect(
    page.getByRole('dialog', {
      name: 'Como esta alteração afeta o período?',
      exact: true,
    }),
  ).toHaveCount(0);
  await page.screenshot({
    path: test.info().outputPath('periodo-exclusivo-gravado-390.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
});

test('SST sessão — sair em outra aba encerra o usuário e o contexto sem retransmitir logout', async ({
  page,
  context,
}) => {
  test.setTimeout(240000);
  const setup = await seedCatalogBrowserSetup();
  const {
    companyId,
    workspaceId,
    email,
    employee,
    factor,
    groupA,
    riskGroupId,
  } = setup;
  const destination = `/dashboard/empresas/${companyId}/novo/sst?active=2&tabWorkspaceId=${workspaceId}`;
  await login(page, destination, { email, password: fixture.password });
  const risk = await call(page, 'POST', '/risk-data', {
    companyId,
    riskId: factor.id,
    homogeneousGroupId: groupA.id,
    riskFactorGroupDataId: riskGroupId,
    workspaceId,
    startDate: '2026-01-01T12:00:00Z',
    probability: 3,
    keepEmpty: true,
    json: {
      type: 'QUI',
      twaValue: '5',
      twa: '10',
      measuredOn: '2026-01-01',
      selectedMeasurement: 'twaValue',
      selectionReason: 'Amostra do encerramento entre abas',
      unit: 'ppm',
      sstDeclaration: { exposure: 'PRESENT', epiUsed: 'NO', epcPresent: 'NO' },
    },
  });
  await call(page, 'POST', `/companies/${companyId}/sst-operational/policy`, {
    fromDate: '2026-01-01',
    expectedRevision: 0,
    reason: 'Responsabilidade sintética para logout entre abas',
  });
  const accepted = await call(
    page,
    'POST',
    `/companies/${companyId}/sst-domain-test/browser/accept-2240`,
    { employeeId: employee.id },
  );
  await page.reload();
  await page.getByText(groupA.name, { exact: true }).click();
  await page
    .getByRole('tab', { name: 'Fatores de Riscos', exact: true })
    .click();
  const header = page
    .locator('.item_box')
    .filter({ has: page.getByText(factor.name, { exact: true }) })
    .first();
  await header.getByText(factor.name, { exact: true }).click();
  await header
    .locator('..')
    .locator('..')
    .locator('..')
    .getByText('Quantitativo', { exact: true })
    .click();
  await page.locator('input[name="twaValue"]').fill('8');
  await page.getByLabel('Data da medição', { exact: true }).fill('2026-04-01');
  await page
    .getByRole('button', { name: 'Salvar', exact: true })
    .last()
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Como esta alteração afeta o período?',
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Natureza da alteração').click();
  await page
    .getByRole('option', {
      name: 'Registrar mudança nas condições',
      exact: true,
    })
    .click();
  await dialog
    .getByLabel('Início da nova condição', { exact: true })
    .fill('01/04/2026');
  await dialog
    .getByLabel('Motivo da alteração', { exact: true })
    .fill('Contexto da primeira aba que deve terminar no logout');
  await dialog
    .getByRole('checkbox', {
      name: 'Usar esta data e motivo nas próximas alterações desta empresa por 2 horas',
      exact: true,
    })
    .check();
  await dialog
    .getByRole('button', { name: 'Confirmar e salvar', exact: true })
    .click();
  const banner = page.getByRole('region', {
    name: 'Contexto de alterações desta empresa',
    exact: true,
  });
  await expect(banner).toBeVisible();
  await expect
    .poll(
      async () =>
        (
          await db.riskFactorData.findFirstOrThrow({
            where: { companyId, riskId: factor.id, endDate: null },
          })
        ).json.twaValue,
    )
    .toBe('8');
  await expect(dialog).toHaveCount(0);
  const before = await db.riskFactorData.findMany({
    where: { companyId, riskId: factor.id },
    orderBy: { id: 'asc' },
  });
  const artifact = await db.sstInitialDelivery.findUniqueOrThrow({
    where: { id: accepted.deliveryId },
  });
  const second = await context.newPage();
  const secondaryFailures: string[] = [];
  let primaryLoginNavigations = 0,
    secondaryLoginNavigations = 0,
    refreshRequests = 0;
  const observe = (target: Page, primary: boolean) => {
    target.on('framenavigated', (frame) => {
      if (
        frame === target.mainFrame() &&
        new URL(frame.url()).pathname === '/login'
      ) {
        if (primary) primaryLoginNavigations++;
        else secondaryLoginNavigations++;
      }
    });
    target.on('request', (request) => {
      if (new URL(request.url()).pathname === '/refresh') refreshRequests++;
    });
  };
  observe(page, true);
  observe(second, false);
  second.on('pageerror', (error) => secondaryFailures.push(error.message));
  second.on('response', (response) => {
    if (
      response.url().startsWith(fixture.apiURL + '/') &&
      ([401, 403].includes(response.status()) || response.status() >= 500)
    )
      secondaryFailures.push(
        `HTTP ${response.status()} ${new URL(response.url()).pathname}`,
      );
  });
  try {
    // Same browser context/origin: real shared cookies and native BroadcastChannel.
    // Opening this document does not activate or copy the first tab's context.
    await second.goto(destination);
    await expect(
      second
        .locator('header')
        .getByText('Operador catálogo E2E', { exact: true }),
    ).toBeVisible();
    await expect(
      second.getByRole('region', {
        name: 'Contexto de alterações desta empresa',
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(banner).toBeVisible();
    await page.screenshot({
      path: test.info().outputPath('sessao-contexto-antes-logout-desktop.png'),
      fullPage: true,
      animations: 'disabled',
    });
    await second
      .locator('header')
      .getByText('Operador catálogo E2E', { exact: true })
      .click();
    await second.getByText('Sair do App', { exact: true }).click();
    await expect(second).toHaveURL(/\/login(?:\?|$)/);
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
    await expect(banner).toHaveCount(0);
    await expect(page.locator('#input_email')).toBeVisible();
    await expect(second.locator('#input_email')).toBeVisible();
    expect(
      (await context.cookies()).some((cookie) =>
        ['nextauth.token', 'nextauth.refreshToken'].includes(cookie.name),
      ),
    ).toBe(false);
    // Give an accidental broadcast echo time to manifest, without posting a fake
    // message or reading private React state. Both documents must remain settled.
    await page.waitForTimeout(1000);
    expect(primaryLoginNavigations).toBe(1);
    expect(secondaryLoginNavigations).toBe(1);
    expect(refreshRequests).toBe(0);
    expect(secondaryFailures).toEqual([]);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: test.info().outputPath('sessao-outra-aba-logout-390.png'),
      fullPage: true,
      animations: 'disabled',
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    // The same identity signing in again must not revive its old in-memory
    // context; this distinguishes clearing the store from merely hiding a banner.
    await login(page, destination, { email, password: fixture.password });
    await expect(banner).toHaveCount(0);
    expect(
      await db.riskFactorData.findMany({
        where: { companyId, riskId: factor.id },
        orderBy: { id: 'asc' },
      }),
    ).toEqual(before);
    expect(
      await db.sstInitialDelivery.findUniqueOrThrow({
        where: { id: accepted.deliveryId },
      }),
    ).toEqual(artifact);
    expect(
      (
        await db.riskFactorData.findUniqueOrThrow({ where: { id: risk.id } })
      ).endDate
        ?.toISOString()
        .slice(0, 10),
    ).toBe('2026-04-01');
  } finally {
    await second.close();
  }
});

test('SST portfólio — consultoria pagina empresas, filtra resultados e abre eventos reais sem nova transmissão', async ({ page }) => {
  test.setTimeout(300000);
  const setup = await seedCatalogBrowserSetup();
  const { companyId, workspaceId, employee, factor, groupA, riskGroupId } = setup;
  const client = await db.company.findUniqueOrThrow({ where: { id: companyId } });
  const passwordSource = await db.user.findUniqueOrThrow({ where: { email: fixture.email } });
  const owner = await db.company.create({ data: { name: 'Consultoria painel E2E', isConsulting: true, type: 'MATRIZ', permissions: client.permissions } });
  const makeOperator = (name: string, permissions: string[]) => db.user.create({ data: { name, email: `portfolio-${randomUUID()}@api-e2e.invalid`, password: passwordSource.password, companies: { create: { companyId: owner.id, roles: ['1', '8', '14', '16'], permissions } } } });
  const operator = await makeOperator('Operador painel E2E', ['14-ru']);
  const reader = await makeOperator('Leitor painel E2E', ['14-r']);
  for (let index = 0; index < 21; index++) {
    const empty = await db.company.create({ data: { name: `Cliente painel vazio ${index}`, type: 'MATRIZ' } });
    await db.contract.create({ data: { applyingServiceCompanyId: owner.id, receivingServiceCompanyId: empty.id } });
  }
  const foreign = await db.company.create({ data: { name: 'Cliente painel SEM contrato', type: 'MATRIZ' } });
  await db.contract.create({ data: { applyingServiceCompanyId: owner.id, receivingServiceCompanyId: companyId } });
  await login(page, `/dashboard/empresas/${companyId}/esocial`, { email: setup.email, password: fixture.password });
  await call(page, 'POST', '/risk-data', {
    companyId, riskId: factor.id, homogeneousGroupId: groupA.id, riskFactorGroupDataId: riskGroupId, workspaceId,
    startDate: '2026-01-01T12:00:00Z', keepEmpty: true,
    json: { type: 'QUI', twaValue: '5', twa: '10', measuredOn: '2026-01-01', selectedMeasurement: 'twaValue', selectionReason: 'Amostra do painel consolidado', unit: 'ppm', sstDeclaration: { exposure: 'PRESENT', epiUsed: 'NO', epcPresent: 'NO' } },
  });
  await call(page, 'POST', `/companies/${companyId}/sst-operational/policy`, { fromDate: '2026-01-01', expectedRevision: 0, reason: 'Responsabilidade sintética do painel' });
  const accepted = await call(page, 'POST', `/companies/${companyId}/sst-domain-test/browser/accept-2240`, { employeeId: employee.id });
  const original = await db.sstInitialDelivery.findUniqueOrThrow({ where: { id: accepted.deliveryId } });
  const clinical = await call(page, 'POST', `/companies/${companyId}/esocial-events/toxicology-records`, { operationId: randomUUID(), employeeId: employee.id, examDate: '2026-10-01', laboratoryCnpj: '11222333000181', examCode: 'EF123456789', doctorName: 'Médico do painel', doctorCrm: '12345', doctorUf: 'SP', workerLivesAbroad: false });
  const secondary = await call(page, 'POST', `/companies/${companyId}/esocial-events/S-2221/prepare`, { operationId: randomUUID(), environment: 2, employerRegistration: '11222333000181', sourceId: clinical.id, reason: 'Preparação distinta de aceite' });
  expect(secondary.state, JSON.stringify(secondary.diagnostics)).toBe('READY');
  const logout = async (name: string) => {
    await page.locator('header').getByText(name, { exact: true }).click();
    await page.getByText('Sair do App', { exact: true }).click();
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
  };
  await logout('Operador catálogo E2E');
  await login(page, '/dashboard/esocial', { email: operator.email, password: fixture.password });
  await expect(page.getByRole('heading', { name: 'eSocial · Empresas atendidas', exact: true })).toBeVisible();
  const cards = page.locator('section[aria-label^="Empresa "]');
  await expect(cards).toHaveCount(20);
  const firstPage = await cards.evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')));
  await page.getByRole('button', { name: 'Próxima página', exact: true }).click();
  await expect(cards).toHaveCount(3);
  const lastPage = await cards.evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')));
  expect(new Set([...firstPage, ...lastPage]).size).toBe(23);
  expect([...firstPage, ...lastPage].some(name => name?.includes(foreign.name))).toBe(false);
  await page.getByLabel('Buscar empresa por nome ou CNPJ', { exact: true }).fill(client.name);
  await page.getByRole('button', { name: 'Aplicar filtros', exact: true }).click();
  const customer = page.getByRole('region', { name: `Empresa ${client.name}`, exact: true });
  await expect(cards).toHaveCount(1);
  await expect(customer.getByText('1 aceitos', { exact: true })).toBeVisible();
  await expect(customer).toContainText('1 eventos preparados, ainda não enviados');
  await page.screenshot({ path: test.info().outputPath('portfolio-empresas-desktop.png'), fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  await customer.scrollIntoViewIfNeeded();
  expect(await customer.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('portfolio-empresas-390.png'), fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('combobox', { name: 'Ambiente do painel', exact: true }).click();
  await page.getByRole('option', { name: 'Produção', exact: true }).click();
  await page.getByRole('button', { name: 'Aplicar filtros', exact: true }).click();
  await expect(customer.getByText('0 aceitos', { exact: true })).toBeVisible();
  await customer.getByRole('button', { name: 'Abrir acompanhamento desta empresa', exact: true }).click();
  const productionDialog = page.getByRole('dialog');
  await expect(productionDialog.getByRole('button', { name: 'Confirmar envio S-2240 de todos os empregados em produção', exact: true })).toBeDisabled();
  await productionDialog.getByRole('button', { name: 'Fechar acompanhamento', exact: true }).click();
  await page.getByRole('combobox', { name: 'Ambiente do painel', exact: true }).click();
  await page.getByRole('option', { name: 'Produção restrita · testes', exact: true }).click();
  await page.getByRole('button', { name: 'Aplicar filtros', exact: true }).click();
  await expect(customer.getByText('1 aceitos', { exact: true })).toBeVisible();
  await customer.getByRole('button', { name: 'Abrir acompanhamento desta empresa', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: `${client.name} · acompanhamento eSocial`, exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Confirmar envio S-2240 de todos os empregados para testes', exact: true })).toBeVisible();
  await captureEvidenceDialog(page, dialog, 'portfolio-acompanhamento-desktop.png');
  await dialog.getByRole('button', { name: 'Fechar acompanhamento', exact: true }).click();
  await page.getByRole('tab', { name: 'Eventos e resultados', exact: true }).click();
  const eventCards = page.locator('section[aria-label^="Evento "]');
  await expect(eventCards).toHaveCount(2);
  await expect(page.getByText('Preparado · não enviado', { exact: true })).toBeVisible();
  const secondaryRead = waitForApi(page, 'GET', `/companies/${companyId}/esocial-events/S-2221/${secondary.id}`);
  await page.getByRole('region', { name: `Evento S-2221 de ${employee.name}`, exact: true }).getByRole('button', { name: 'Conferir este evento', exact: true }).click();
  const secondaryDialog = page.getByRole('dialog', { name: `${client.name} · S-2221`, exact: true });
  expect((await assertStatus(await secondaryRead, 200)).id).toBe(secondary.id);
  await expect(secondaryDialog.getByRole('region', { name: 'Conferência do evento adicional', exact: true })).toBeVisible();
  await captureEvidenceDialog(page, secondaryDialog, 'portfolio-evento-adicional-desktop.png', 'bottom');
  await secondaryDialog.getByRole('button', { name: 'Fechar acompanhamento', exact: true }).click();

  await page.getByRole('combobox', { name: 'Situação dos eventos', exact: true }).click();
  await page.getByRole('option', { name: 'Aceito', exact: true }).click();
  await page.getByRole('button', { name: 'Aplicar filtros', exact: true }).click();
  const acceptedCard = page.getByRole('region', { name: `Evento S-2240 de ${employee.name}`, exact: true });
  await expect(eventCards).toHaveCount(1);
  await expect(acceptedCard).toContainText(accepted.receipt);
  await expect(acceptedCard).toContainText('01.03.001');
  await expect(acceptedCard).toContainText(factor.name);
  await expect(acceptedCard).toContainText('01/01/2026');
  await page.screenshot({ path: test.info().outputPath('portfolio-eventos-desktop.png'), fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  await acceptedCard.scrollIntoViewIfNeeded();
  expect(await acceptedCard.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('portfolio-eventos-390.png'), fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await acceptedCard.getByRole('button', { name: 'Conferir este evento', exact: true }).click();
  const detail = page.getByRole('dialog', { name: `${client.name} · S-2240`, exact: true });
  await expect(detail.getByText(accepted.receipt, { exact: true })).toBeVisible();
  await captureEvidenceDialog(page, detail, 'portfolio-evento-detalhe-desktop.png');
  await detail.getByRole('button', { name: 'Fechar acompanhamento', exact: true }).click();
  await logout(operator.name);
  await login(page, '/dashboard/esocial', { email: reader.email, password: fixture.password });
  await page.getByLabel('Buscar empresa por nome ou CNPJ', { exact: true }).fill(client.name);
  await page.getByRole('button', { name: 'Aplicar filtros', exact: true }).click();
  await page.getByRole('region', { name: `Empresa ${client.name}`, exact: true }).getByRole('button', { name: 'Abrir acompanhamento desta empresa', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Confirmar envio S-2240 de todos/ })).toHaveCount(0);
  await captureEvidenceDialog(page, page.getByRole('dialog'), 'portfolio-somente-leitura-desktop.png');
  expect(await db.userCompany.count({ where: { companyId, userId: { in: [operator.id, reader.id] } } })).toBe(0);
  expect(await db.sstInitialDelivery.findUniqueOrThrow({ where: { id: accepted.deliveryId } })).toEqual(original);
  expect(await db.sstInitialDelivery.count({ where: { companyId } })).toBe(1);
  expect(await db.sstSecondaryDelivery.count({ where: { companyId } })).toBe(0);
  expect(await db.sstDispatchRun.count({ where: { companyId } })).toBe(0);
});
