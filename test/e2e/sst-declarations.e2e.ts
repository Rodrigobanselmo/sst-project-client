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

const root = () => `/companies/${fixture.companyId}/esocial-initial/2240`;
async function ensureSendingPolicy(page: import('@playwright/test').Page) {
  if (
    await db.sstSendingPolicy.findUnique({
      where: { companyId: fixture.companyId },
    })
  )
    return;
  await page
    .getByLabel('Data inicial de envio', { exact: true })
    .fill('01/01/2026');
  await page
    .getByLabel('Motivo da configuração')
    .fill('Início do emissor no teste de navegador');
  const saved = waitForApi(
    page,
    'POST',
    `/companies/${fixture.companyId}/sst-operational/policy`,
  );
  await page.getByRole('button', { name: 'Salvar data inicial' }).click();
  await assertStatus(await saved, 201);
}

test.afterAll(async () => db.$disconnect());

test('S-2240 — preparar na tela existente usa a API real, mostra impedimentos e restaura a consulta', async ({
  page,
}) => {
  await login(page, companyPath('esocial'));
  if (!(await db.employee.count({ where: { companyId: fixture.companyId } }))) {
    const token = (await page.context().cookies()).find(
      (cookie) => cookie.name === 'nextauth.token',
    )?.value;
    const employee = await page.request.post(fixture.apiURL + '/employee', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        companyId: fixture.companyId,
        name: 'Empregado para busca declaratória',
        cpf: '52998224725',
        sex: 'M',
        cidIds: [],
      },
    });
    expect(employee.status(), await employee.text()).toBe(201);
    await page.reload();
  }
  await expect(
    page.getByRole('heading', { name: 'Envios S-2240', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('combobox', { name: 'Ambiente do eSocial' }),
  ).toContainText('Produção restrita');
  await expect(
    page.getByText(/A transmissão está desabilitada neste ambiente do sistema/),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Adotar cadastro|Revisar adoção/ }),
  ).toHaveCount(0);
  await ensureSendingPolicy(page);
  const employeeSearch = page.getByRole('combobox', {
    name: 'Empregados para esta preparação',
  });
  const missingName = 'NOME INEXISTENTE PARA BUSCA E2E';
  const emptySearch = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      response.request().method() === 'GET' &&
      url.origin === fixture.apiURL &&
      url.pathname === root() &&
      url.searchParams.get('employeeSearch') === missingName
    );
  });
  await employeeSearch.fill(missingName);
  const empty = await assertStatus(await emptySearch, 200);
  expect(empty.employees).toEqual([]);
  await expect(employeeSearch).toBeVisible();
  await expect(page.getByText('Nenhum empregado encontrado')).toBeVisible();
  await employeeSearch.clear();
  await employeeSearch.press('Escape');
  const preparedResponse = waitForApi(page, 'POST', root() + '/prepare');
  await page
    .getByRole('button', { name: 'Preparar primeiro envio', exact: true })
    .click();
  const prepared = await assertStatus(await preparedResponse, 201);
  expect(prepared.environment).toBe(2);
  expect(prepared.sourceManifest.selection).toBe('CURRENT');
  expect(prepared.sourceManifest.mode).toBe('INITIAL');
  expect(prepared.state).toBe('BLOCKED');
  expect(prepared.diagnostics.length).toBeGreaterThan(0);
  await expect(
    page.getByText('Declaração preparada · Produção restrita', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /^Confirmar e enviar/ }),
  ).toHaveCount(0);
  const stored = await db.sstInitialRun.findUniqueOrThrow({
    where: { id: prepared.id },
    include: { events: { include: { delivery: true } } },
  });
  expect(stored.events.every((event: any) => !event.delivery)).toBe(true);
  await page.screenshot({
    path: test.info().outputPath('01-preparacao-com-impedimentos.png'),
    fullPage: true,
  });

  await page.reload();
  await page
    .getByRole('combobox', { name: 'Preparações e envios desta empresa' })
    .click();
  await page
    .getByRole('option', { name: new RegExp(prepared.id.slice(0, 8)) })
    .click();
  await expect(
    page.getByText('Declaração preparada · Produção restrita', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Impedido — confira a origem/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: /^Confirmar e enviar/ }),
  ).toHaveCount(0);
  await page.screenshot({
    path: test.info().outputPath('02-consulta-restaurada.png'),
    fullPage: true,
  });
});

test('S-2240 — conferir alterações sem envio aceito informa o requisito sem fabricar recibo', async ({
  page,
}) => {
  await login(page, companyPath('esocial'));
  await ensureSendingPolicy(page);
  await expect(
    page.getByRole('button', {
      name: 'Conferir alterações desde os envios aceitos',
    }),
  ).toBeVisible();
  const response = waitForApi(page, 'POST', root() + '/prepare');
  await page
    .getByRole('button', {
      name: 'Conferir alterações desde os envios aceitos',
    })
    .click();
  const result = await response;
  expect(result.status(), await result.text()).toBe(409);
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: /primeiro|aceit|inicial/i })
      .last(),
  ).toBeVisible();
  expect(
    await db.sstInitialDelivery.count({
      where: { companyId: fixture.companyId, state: 'ACCEPTED' },
    }),
  ).toBe(0);
  await expect(
    page.getByText('Aceito pelo eSocial', { exact: true }),
  ).toHaveCount(0);
  await page.screenshot({
    path: test.info().outputPath('03-sem-envio-aceito.png'),
    fullPage: true,
  });
});
