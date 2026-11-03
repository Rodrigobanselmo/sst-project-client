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

test('06 — alterar lotação preserva admissão, muda cargo e sinaliza PPP', async ({
  page,
}) => {
  // Set up an existing admission; the operation under test is performed only in the UI.
  const source = await db.hierarchy.create({
    data: {
      companyId: fixture.companyId,
      name: 'CARGO ORIGEM TRANSFERENCIA',
      type: 'OFFICE',
      parentId: fixture.sectorId,
      workspaces: { connect: { id: fixture.workspaceId } },
    },
  });
  const target = await db.hierarchy.create({
    data: {
      companyId: fixture.companyId,
      name: 'CARGO DESTINO TRANSFERENCIA',
      type: 'OFFICE',
      parentId: fixture.sectorId,
      workspaces: { connect: { id: fixture.workspaceId } },
    },
  });
  const person = await db.employee.create({
    data: {
      companyId: fixture.companyId,
      name: 'Bruno Transferência Navegador',
      cpf: '12345678909',
      sex: 'M',
      hierarchyId: source.id,
    },
  });
  const admission = await db.employeeHierarchyHistory.create({
    data: {
      employeeId: person.id,
      hierarchyId: source.id,
      motive: 'ADM',
      startDate: new Date('2025-01-06T12:00:00.000Z'),
    },
  });
  const ppp = await db.employeePPPHistory.create({
    data: { employeeId: person.id, sendEvent: false },
  });
  await login(page);
  await page.getByText(person.name, { exact: true }).click();
  await page.getByText('Histórico de lotação', { exact: true }).click();
  await page.getByText('Alterar lotação', { exact: true }).click();
  await page.getByRole('combobox', { name: 'Estabelecimento destino' }).click();
  await page.getByRole('option', { name: 'Unidade E2E', exact: true }).click();
  await page.getByText('Selecione um setor', { exact: true }).click();
  await page
    .getByRole('menuitem')
    .filter({ hasText: 'SETOR INICIAL E2E' })
    .click();
  await page.getByText('Selecione um cargo', { exact: true }).click();
  await page.getByRole('menuitem').filter({ hasText: target.name }).click();
  await page.getByPlaceholder('__/__/__').fill('03/02/2025');
  await page.getByPlaceholder('__/__/__').press('Tab');
  await page.getByRole('combobox', { name: /Motivo/ }).click();
  await page
    .getByRole('option', { name: 'Transferência', exact: true })
    .click();
  const response = waitForApi(
    page,
    'POST',
    `/employee-history/hierarchy/transfer/${fixture.companyId}`,
  );
  await page
    .getByRole('button', { name: 'Alterar lotação', exact: true })
    .click();
  await assertStatus(await response, 201);
  await expect(
    page.getByText('Transferência', { exact: true }).first(),
  ).toBeVisible();
  const history = await db.employeeHierarchyHistory.findMany({
    where: { employeeId: person.id },
    orderBy: { startDate: 'asc' },
  });
  expect(history).toHaveLength(2);
  expect(history[0].id).toBe(admission.id);
  expect(history[0].hierarchyId).toBe(source.id);
  expect(history[1].motive).toBe('TRANS');
  expect(history[1].hierarchyId).toBe(target.id);
  expect(history[1].startDate.toISOString().slice(0, 10)).toBe('2025-02-03');
  expect(
    (await db.employee.findUniqueOrThrow({ where: { id: person.id } }))
      .hierarchyId,
  ).toBe(target.id);
  await expect
    .poll(
      async () =>
        (
          await db.employeePPPHistory.findUniqueOrThrow({
            where: { id: ppp.id },
          })
        ).sendEvent,
    )
    .toBe(true);
  await page.reload();
  await page.getByText(person.name, { exact: true }).click();
  await page.getByText('Histórico de lotação', { exact: true }).click();
  await expect(
    page.getByText('Transferência', { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText(target.name, { exact: true }).first(),
  ).toBeVisible();
});
