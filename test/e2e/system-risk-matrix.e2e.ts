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

const matrixPath = '/v2/master/system-risk-matrix';
const pagePath = '/dashboard/dados/matriz-padrao-simplesst';
let masterEmail: string;

test.beforeAll(async () => {
  const operator = await db.user.findUniqueOrThrow({
    where: { email: fixture.email },
  });
  masterEmail = `system-matrix-${randomUUID()}@api-e2e.invalid`;
  await db.user.create({
    data: {
      name: 'Administrador da matriz global E2E',
      email: masterEmail,
      password: operator.password,
      companies: {
        create: {
          companyId: fixture.companyId,
          roles: ['master'],
          permissions: ['master-crud'],
        },
      },
    },
  });
});

async function request(
  page: Page,
  method: string,
  path: string,
  body?: unknown,
) {
  const token = (await page.context().cookies()).find(
    (cookie) => cookie.name === 'nextauth.token',
  )?.value;
  return page.request.fetch(fixture.apiURL + path, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    ...(body ? { data: body } : {}),
  });
}

async function readCurrent(page: Page) {
  const response = await request(page, 'GET', matrixPath);
  expect(response.status(), await response.text()).toBe(200);
  return response.json();
}

const payload = (projection: any, changes: Record<string, unknown> = {}) => ({
  axisCriteria: projection.axisCriteria,
  axisLevelColors: projection.axisLevelColors,
  classificationColors: projection.classificationColors,
  expectedRevision: projection.editorial.revision,
  operationId: randomUUID(),
  ...changes,
});

async function saveConcurrent(page: Page, projection: any, text: string) {
  const axisCriteria = projection.axisCriteria.map((item: any) =>
    item.axis === 'SEVERITY' && item.value === 1 && item.coverageKey === 'FIS'
      ? { ...item, criterion: text }
      : item,
  );
  const response = await request(
    page,
    'PUT',
    matrixPath,
    payload(projection, { axisCriteria }),
  );
  expect(response.status(), await response.text()).toBe(200);
  return response.json();
}

async function capture(page: Page, name: string) {
  // Close transient notifications through their actual UI controls so the
  // evidence shows the fields and the persistent conflict notice unobscured.
  const notifications = page.locator('.SnackbarItem-contentRoot:visible');
  for (
    let count = await notifications.count();
    count > 0;
    count = await notifications.count()
  ) {
    await notifications.first().getByRole('button').click();
    await expect.poll(() => notifications.count()).toBeLessThan(count);
  }
  // The desktop sidebar opens on hover. Leaving the pointer at (0, 0) before
  // resizing carries that open state into the mobile modal drawer and hides
  // the form from the accessibility tree. Move outside the sidebar instead.
  await page.mouse.move((page.viewportSize()?.width ?? 1440) - 1, 1);
  await page.screenshot({
    path: test.info().outputPath(name),
    animations: 'disabled',
  });
}

test('global SYSTEM editorial saves preserve assessments and stale drafts in the existing master screen', async ({
  page,
  context,
}) => {
  await login(page, pagePath, {
    email: masterEmail,
    password: fixture.password,
  });
  await expect(
    page.getByRole('heading', { name: 'Matriz Padrão SimpleSST', exact: true }),
  ).toBeVisible();
  const before = await readCurrent(page);
  const customRoot = `/v2/companies/${fixture.companyId}/risk-matrices`;
  const created = await request(page, 'POST', customRoot, {
    name: 'Cópia global preservada E2E',
    source: 'SYSTEM',
  });
  expect(created.status(), await created.text()).toBe(201);
  const matrix = await created.json();
  const publishedResponse = await request(
    page,
    'POST',
    `${customRoot}/${matrix.id}/versions/${matrix.draftVersion.id}/publish`,
  );
  expect(publishedResponse.status(), await publishedResponse.text()).toBe(201);
  const published = await publishedResponse.json();
  const immutableBefore = {
    assessments: await db.riskFactorData.findMany({ orderBy: { id: 'asc' } }),
    workspaceAssessments: await db.riskFactorDataWorkspaceEvaluation.findMany({
      orderBy: { id: 'asc' },
    }),
    events: await db.sstInitialEvent.findMany({ orderBy: { id: 'asc' } }),
    custom: await db.companyRiskMatrixVersion.findUniqueOrThrow({
      where: { id: published.id },
      include: {
        axisLevels: {
          orderBy: { id: 'asc' },
          include: { criteriaByCoverage: { orderBy: { id: 'asc' } } },
        },
        classifications: { orderBy: { id: 'asc' } },
        cells: { orderBy: { id: 'asc' } },
      },
    }),
  };

  await page.getByRole('button', { name: 'FIS — Físico', exact: true }).click();
  const criterion = page.getByRole('textbox', {
    name: 'Critério FIS Severidade 1',
    exact: true,
  });
  const firstText = `Orientação global E2E ${randomUUID().slice(0, 6)}`;
  await criterion.fill(firstText);
  const axisColors = page.getByTestId('system-risk-matrix-axis-colors');
  await axisColors
    .getByRole('textbox', { name: 'Hex', exact: true })
    .first()
    .fill('#123456');
  await axisColors
    .getByRole('textbox', { name: 'Hex', exact: true })
    .first()
    .blur();
  await axisColors
    .locator('..')
    .evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await capture(page, 'system-matrix-colors-desktop.png');
  await page
    .getByRole('heading', { name: 'Matriz Padrão SimpleSST', exact: true })
    .scrollIntoViewIfNeeded();
  const savedResponse = waitForApi(page, 'PUT', matrixPath);
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  const saved = await assertStatus(await savedResponse, 200);
  expect(saved.editorial.revision).toBe(before.editorial.revision + 1);
  await expect(
    page.getByRole('button', { name: 'Salvar', exact: true }),
  ).toBeDisabled();
  await expect(criterion).toHaveValue(firstText);

  const localDraft = 'Rascunho que deve sobreviver ao conflito';
  await criterion.fill(localDraft);
  const concurrent = await saveConcurrent(
    page,
    saved,
    'Orientação publicada por outra sessão',
  );
  await page
    .getByRole('heading', { name: 'Matriz Padrão SimpleSST', exact: true })
    .scrollIntoViewIfNeeded();
  const conflictResponse = waitForApi(page, 'PUT', matrixPath);
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  const conflict = await assertStatus(await conflictResponse, 409);
  expect(conflict.code).toBe('SYSTEM_RISK_MATRIX_REVISION_CONFLICT');
  await expect(page.getByText(/Seu rascunho foi mantido e/)).toBeVisible();
  await expect(criterion).toHaveValue(localDraft);
  await expect(
    page.getByRole('button', { name: 'Salvar', exact: true }),
  ).toBeDisabled();
  await capture(page, 'system-matrix-conflict-desktop.png');
  await page.setViewportSize({ width: 390, height: 844 });
  await capture(page, 'system-matrix-conflict-mobile.png');
  await criterion.scrollIntoViewIfNeeded();
  await capture(page, 'system-matrix-draft-mobile.png');

  await page
    .getByRole('button', { name: 'Carregar versão atual', exact: true })
    .click();
  await expect(criterion).toHaveValue('Orientação publicada por outra sessão');
  await expect(page.getByText(/Seu rascunho foi mantido e/)).toBeHidden();
  await criterion.fill('Rascunho preservado após reconexão');
  await saveConcurrent(page, concurrent, 'Última orientação global publicada');
  // Reconnect triggers a real React Query refetch; no API response is mocked.
  await context.setOffline(true);
  const refreshedResponse = waitForApi(page, 'GET', matrixPath);
  await context.setOffline(false);
  await assertStatus(await refreshedResponse, 200);
  await expect(page.getByText(/Seu rascunho foi mantido e/)).toBeVisible();
  await expect(criterion).toHaveValue('Rascunho preservado após reconexão');
  await page
    .getByRole('button', { name: 'Carregar versão atual', exact: true })
    .click();
  await expect(criterion).toHaveValue('Última orientação global publicada');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await criterion.scrollIntoViewIfNeeded();
  await capture(page, 'system-matrix-criteria-desktop.png');

  const current = await readCurrent(page);
  const invalid = await request(page, 'PUT', matrixPath, {
    ...payload(current),
    cells: [],
  });
  expect(invalid.status(), await invalid.text()).toBe(400);
  expect((await readCurrent(page)).editorial.revision).toBe(
    current.editorial.revision,
  );
  expect(await db.riskFactorData.findMany({ orderBy: { id: 'asc' } })).toEqual(
    immutableBefore.assessments,
  );
  expect(
    await db.riskFactorDataWorkspaceEvaluation.findMany({
      orderBy: { id: 'asc' },
    }),
  ).toEqual(immutableBefore.workspaceAssessments);
  expect(await db.sstInitialEvent.findMany({ orderBy: { id: 'asc' } })).toEqual(
    immutableBefore.events,
  );
  expect(
    await db.companyRiskMatrixVersion.findUniqueOrThrow({
      where: { id: published.id },
      include: {
        axisLevels: {
          orderBy: { id: 'asc' },
          include: { criteriaByCoverage: { orderBy: { id: 'asc' } } },
        },
        classifications: { orderBy: { id: 'asc' } },
        cells: { orderBy: { id: 'asc' } },
      },
    }),
  ).toEqual(immutableBefore.custom);
});
