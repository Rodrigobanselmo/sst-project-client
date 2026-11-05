import { test, expect, fixture, companyPath, login, waitForApi, assertStatus } from './fixtures';

test('home — one company action-plan summary, correct counters and no workspace fan-out', async ({ page }) => {
  const summaryPath = `/v2/companies/${fixture.companyId}/action-plans/home-summary`;
  const summaryRequests: string[] = [];
  const legacyBrowseRequests: string[] = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin !== fixture.apiURL || request.method() !== 'GET') return;
    if (url.pathname === summaryPath) summaryRequests.push(url.pathname);
    if (url.pathname.includes('/action-plans/workspace/')) legacyBrowseRequests.push(url.pathname);
  });
  const summaryResponse = waitForApi(page, 'GET', summaryPath);
  await login(page, companyPath('novo/empresa'));
  const counts = await assertStatus(await summaryResponse, 200);
  const card = page.getByText('Plano de Ação', { exact: true }).last().locator('..').locator('..');
  for (const [label, key] of [['Total', 'total'], ['Pendente', 'pending'], ['Iniciada', 'progress'], ['Concluída', 'done'], ['Cancelada', 'canceled']] as const)
    await expect(card).toContainText(new RegExp(`${label}:\\s*${counts[key]}`));
  await page.getByRole('link', { name: 'Caracterização', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'Fatores de risco e perigos', exact: true })).toBeVisible();
  await expect(page.getByRole('status', { name: 'Carregando', exact: true })).toHaveCount(0);
  expect(summaryRequests).toHaveLength(1);
  expect(legacyBrowseRequests).toHaveLength(0);
});
