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

test.afterAll(async () => {
  await db.$disconnect();
});

test('07 — riscos químicos, físicos e biológicos: cadastro, GSE e vínculos de cargos e setores', async ({
  page,
}) => {
  test.setTimeout(300_000);
  // Only reference organization is seeded. Risk creation and associations use the UI.
  const office = await db.hierarchy.create({
    data: {
      companyId: fixture.companyId,
      name: 'OPERADOR RISCOS E2E',
      type: 'OFFICE',
      parentId: fixture.sectorId,
      workspaces: { connect: { id: fixture.workspaceId } },
    },
  });
  await login(page, companyPath('fatores-riscos'));
  for (const [type, name] of [
    ['QUI', 'Solvente Vínculos E2E'],
    ['FIS', 'Ruído Vínculos E2E'],
    ['BIO', 'Bactérias Vínculos E2E'],
  ]) {
    await test.step(`Cadastrar ${type} pelo formulário real`, async () => {
      await page
        .getByRole('button', { name: 'Adicionar', exact: true })
        .click();
      await page.getByPlaceholder('descrição do fator de risco...').fill(name);
      await page.getByText(type, { exact: true }).click();
      await page
        .locator('input[name="severity"][value="3"]')
        .locator('..')
        .locator('span[tabindex="0"]')
        .click();
      const response = waitForApi(page, 'POST', '/risk');
      await page.getByRole('button', { name: 'Criar', exact: true }).click();
      await assertStatus(await response, 201);
      await expect(page.getByText(name, { exact: true })).toBeVisible();
      const risk = await db.riskFactors.findFirstOrThrow({
        where: { companyId: fixture.companyId, name },
      });
      expect(risk.type).toBe(type);
      expect(risk.severity).toBe(3);
    });
  }
  await test.step('Configurar unidade e limite do risco químico pelo editor', async () => {
    await page.getByText('Solvente Vínculos E2E', { exact: true }).click();
    await page.locator('input[name="unit"]').fill('ppm');
    await page.locator('input[name="unit"]').press('Tab');
    await page.locator('input[name="twa"]').fill('10');
    const risk = await db.riskFactors.findFirstOrThrow({
      where: { companyId: fixture.companyId, name: 'Solvente Vínculos E2E' },
    });
    const edited = waitForApi(page, 'PATCH', `/risk/${risk.id}`);
    await page
      .getByRole('button', { name: 'Salvar', exact: true })
      .first()
      .click();
    await assertStatus(await edited, 200);
    expect(
      (await db.riskFactors.findUniqueOrThrow({ where: { id: risk.id } })).unit,
    ).toBe('ppm');
  });
  await page.goto(
    companyPath('novo/sst') + `?active=2&tabWorkspaceId=${fixture.workspaceId}`,
  );
  await page.getByRole('button', { name: 'Adicionar', exact: true }).click();
  await page
    .getByPlaceholder('nome do GSE...')
    .fill('GSE RISCOS NAVEGADOR E2E');
  await page
    .getByPlaceholder('descrição do GSE...')
    .fill('Riscos químicos, físicos e biológicos no setor operacional.');
  const response = waitForApi(page, 'POST', '/homogeneous-groups');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await assertStatus(await response, 201);
  await expect(
    page.getByText('GSE RISCOS NAVEGADOR E2E', { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Cargos', exact: true }).click();
  await page
    .getByRole('button', { name: 'Editar cargos', exact: true })
    .click();
  await page
    .getByRole('treeitem', { name: /Cargo OPERADOR RISCOS E2E,/ })
    .click();
  await page
    .getByRole('button', { name: 'Selecionar Ativos', exact: true })
    .last()
    .click();
  await page.getByLabel('Data de início', { exact: true }).fill('01/01/2026');
  await page.getByLabel('Data de início', { exact: true }).press('Tab');
  const group = await db.homogeneousGroup.findFirstOrThrow({
    where: { companyId: fixture.companyId, name: 'GSE RISCOS NAVEGADOR E2E' },
  });
  const linked = waitForApi(page, 'PATCH', `/homogeneous-groups/${group.id}`);
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await assertStatus(await linked, 200);
  await expect
    .poll(() =>
      db.hierarchyOnHomogeneous.count({
        where: {
          homogeneousGroupId: group.id,
          hierarchyId: office.id,
          deletedAt: null,
        },
      }),
    )
    .toBe(1);
  await test.step('Trocar vínculo direto do cargo por cobertura do setor', async () => {
    await page
      .getByRole('button', { name: 'Editar cargos', exact: true })
      .click();
    await page
      .getByRole('treeitem', { name: /Cargo OPERADOR RISCOS E2E,/ })
      .click();
    await page
      .getByRole('treeitem', { name: /Setor SETOR INICIAL E2E,/ })
      .click();
    await page
      .getByRole('button', { name: 'Selecionar Ativos', exact: true })
      .last()
      .click();
    await page.getByLabel('Data de início', { exact: true }).fill('01/01/2026');
    await page.getByLabel('Data de início', { exact: true }).press('Tab');
    const updated = waitForApi(
      page,
      'PATCH',
      `/homogeneous-groups/${group.id}`,
    );
    await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
    await assertStatus(await updated, 200);
    await expect
      .poll(() =>
        db.hierarchyOnHomogeneous.count({
          where: {
            homogeneousGroupId: group.id,
            hierarchyId: fixture.sectorId,
            deletedAt: null,
          },
        }),
      )
      .toBe(1);
    await expect(page.getByText(/OPERADOR RISCOS E2E/).first()).toBeVisible();
  });
  await page
    .getByRole('tab', { name: 'Fatores de Riscos', exact: true })
    .click();
  await page.getByText('Adicionar riscos', { exact: true }).click();
  for (const name of [
    'Solvente Vínculos E2E',
    'Ruído Vínculos E2E',
    'Bactérias Vínculos E2E',
  ]) {
    await page.getByRole('menuitem').filter({ hasText: name }).click();
  }
  const risksLinked = waitForApi(page, 'POST', '/risk-data/many');
  await page.getByText('CONFIRMAR', { exact: true }).click();
  await assertStatus(await risksLinked, 201);
  await expect
    .poll(() =>
      db.riskFactorData.count({
        where: { homogeneousGroupId: group.id, deletedAt: null },
      }),
    )
    .toBe(3);
  await page
    .locator('.item_box')
    .getByText('Solvente Vínculos E2E', { exact: true })
    .click();
  await page.getByText('Medição', { exact: true }).click();
  await page.getByLabel('Avaliação da jornada de Trabalhado').check();
  await page.locator('input[name="twaValue"]').fill('5');
  const measured = waitForApi(page, 'POST', '/risk-data');
  await page
    .getByRole('button', { name: 'Salvar', exact: true })
    .last()
    .click();
  await assertStatus(await measured, 201);
  const chemical = await db.riskFactors.findFirstOrThrow({
    where: { companyId: fixture.companyId, name: 'Solvente Vínculos E2E' },
  });
  const readMeasurement = () =>
    db.riskFactorData.findFirstOrThrow({
      where: {
        homogeneousGroupId: group.id,
        riskId: chemical.id,
        deletedAt: null,
      },
    });
  await expect
    .poll(async () => (await readMeasurement()).json.twaValue)
    .toBe('5');
  await test.step('Recarregar, conferir relações e editar a medição existente', async () => {
    await page.goto(
      companyPath('novo/sst') +
        `?active=2&tabWorkspaceId=${fixture.workspaceId}`,
    );
    await page.getByText('GSE RISCOS NAVEGADOR E2E', { exact: true }).click();
    await page.getByRole('tab', { name: 'Cargos', exact: true }).click();
    await expect(page.getByText(/OPERADOR RISCOS E2E/).first()).toBeVisible();
    await page
      .getByRole('tab', { name: 'Fatores de Riscos', exact: true })
      .click();
    for (const name of [
      'Solvente Vínculos E2E',
      'Ruído Vínculos E2E',
      'Bactérias Vínculos E2E',
    ]) {
      await expect(
        page.locator('.item_box').getByText(name, { exact: true }),
      ).toBeVisible();
    }
    await page
      .locator('.item_box')
      .getByText('Solvente Vínculos E2E', { exact: true })
      .click();
    await page.getByText('Quantitativo', { exact: true }).click();
    await expect(page.locator('input[name="twaValue"]')).toHaveValue('5');
    await page.locator('input[name="twaValue"]').fill('8');
    const updated = waitForApi(page, 'POST', '/risk-data');
    await page
      .getByRole('button', { name: 'Salvar', exact: true })
      .last()
      .click();
    await assertStatus(await updated, 201);
    await expect
      .poll(async () => (await readMeasurement()).json.twaValue)
      .toBe('8');
    expect(
      await db.riskFactorData.count({
        where: {
          homogeneousGroupId: group.id,
          riskId: chemical.id,
          deletedAt: null,
        },
      }),
    ).toBe(1);
    const saved = await readMeasurement();
    expect(saved.json.twa).toBe('10');
    expect(
      (await db.riskFactors.findUniqueOrThrow({ where: { id: chemical.id } }))
        .unit,
    ).toBe('ppm');
  });
  await test.step('Conferir o diário transacional das alterações feitas pelo navegador', async () => {
    const saved = await readMeasurement();
    const journal = await db.sstDataChange.findMany({
      where: {
        sourceTable: 'RiskFactorData',
        keyAfter: { equals: { id: saved.id } },
      },
      orderBy: { sequence: 'asc' },
      include: { dispatch: true },
    });
    expect(
      journal.some((entry: any) => entry.afterRow?.json?.twaValue === '5'),
    ).toBe(true);
    const update = journal.find(
      (entry: any) =>
        entry.beforeRow?.json?.twaValue === '5' &&
        entry.afterRow?.json?.twaValue === '8',
    );
    expect(update).toBeTruthy();
    expect(update.companyIds).toContain(fixture.companyId);
    expect(update.changedColumns).toContain('json');
    expect(update.dispatch.state).toBe('PENDING');
    const links = await db.sstDataChange.findMany({
      where: {
        sourceTable: 'HierarchyOnHomogeneous',
        OR: [
          { beforeRow: { path: ['homogeneousGroupId'], equals: group.id } },
          { afterRow: { path: ['homogeneousGroupId'], equals: group.id } },
        ],
      },
      include: { relations: true },
    });
    expect(
      links.some(
        (entry: any) =>
          entry.beforeRow?.hierarchyId === office.id ||
          entry.afterRow?.hierarchyId === office.id,
      ),
    ).toBe(true);
    expect(
      links.some((entry: any) =>
        entry.relations.some(
          (edge: any) =>
            edge.side === 'AFTER' &&
            edge.toTable === 'Hierarchy' &&
            edge.toKey.id === fixture.sectorId &&
            edge.temporalBasis === 'SOURCE_FIELDS',
        ),
      ),
    ).toBe(true);
    for (const type of ['QUI', 'FIS', 'BIO']) {
      expect(
        await db.sstDataChange.count({
          where: {
            sourceTable: 'RiskFactors',
            operation: 'INSERT',
            companyIds: { has: fixture.companyId },
            afterRow: { path: ['type'], equals: type },
          },
        }),
      ).toBeGreaterThan(0);
    }
  });
});
