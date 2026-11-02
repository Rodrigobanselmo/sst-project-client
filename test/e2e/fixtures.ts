import { test as base, expect, Page, Response } from '@playwright/test';
import fs from 'node:fs';
export const fixture = JSON.parse(
  fs.readFileSync(process.env.E2E_FIXTURE_PATH!, 'utf8'),
);

export const test = base.extend<{ observeRealTraffic: void }>({
  observeRealTraffic: [
    async ({ context, page }, use, testInfo) => {
      const failures: string[] = [];
      const requests: { method: string; path: string; status: number }[] = [];
      const allowedOrigins = new Set([fixture.baseURL, fixture.apiURL]);
      // No API responses are mocked. Only unrelated third-party integrations (Google,
      // analytics, external images) are blocked in this disposable local environment.
      await context.route('**/*', (route) => {
        const url = new URL(route.request().url());
        return allowedOrigins.has(url.origin)
          ? route.continue()
          : route.abort();
      });
      page.on('pageerror', (error) => failures.push(error.message));
      page.on('response', (response) => {
        if (response.url().startsWith(fixture.apiURL + '/')) {
          const path = new URL(response.url()).pathname;
          requests.push({
            method: response.request().method(),
            path,
            status: response.status(),
          });
          if (
            [401, 403].includes(response.status()) ||
            response.status() >= 500
          )
            failures.push(`HTTP ${response.status()} ${path}`);
        }
      });
      await use();
      await testInfo.attach('real-api-requests', {
        body: Buffer.from(JSON.stringify(requests, null, 2)),
        contentType: 'application/json',
      });
      expect(
        failures,
        'No uncaught browser exceptions or API 5xx responses',
      ).toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };
export const companyPath = (section: string) =>
  `/dashboard/empresas/${fixture.companyId}/${section}`;
export function waitForApi(page: Page, method: string, path: string) {
  return page.waitForResponse(
    (response) =>
      response.request().method() === method &&
      new URL(response.url()).origin === fixture.apiURL &&
      new URL(response.url()).pathname === path,
  );
}
export async function assertStatus(response: Response, expected: number) {
  expect(response.status(), await response.text()).toBe(expected);
  return response.json();
}
export async function login(
  page: Page,
  destination = companyPath('empregados'),
  credentials: { email: string; password: string } = fixture,
) {
  await page.goto(`/login?redirect=${destination.replaceAll('/', '|')}`);
  await page.locator('#input_email').fill(credentials.email);
  await page.locator('#input_password').fill(credentials.password);
  const response = waitForApi(page, 'POST', '/session');
  await page.getByRole('button', { name: 'ENTRAR', exact: true }).click();
  await assertStatus(await response, 200);
  await expect(page).toHaveURL(
    new RegExp(destination.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
  await expect(page.locator('body')).not.toContainText('Application error');
}
