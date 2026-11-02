import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

if (!process.env.API_E2E_ARTIFACT_DIR || !process.env.E2E_BASE_URL) {
  throw new Error(
    'Run yarn test:e2e:web to create an isolated API and database first.',
  );
}
const artifacts = path.join(process.env.API_E2E_ARTIFACT_DIR, 'browser');
export default defineConfig({
  testDir: './test/e2e',
  testMatch: process.env.E2E_BROWSER_DELIVERY_MODE === '1'
    ? '**/*.delivery.ts'
    : '**/*.e2e.ts',
  grep: process.env.E2E_BROWSER_GREP
    ? new RegExp(process.env.E2E_BROWSER_GREP)
    : undefined,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  outputDir: path.join(artifacts, 'results'),
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(artifacts, 'report'), open: 'never' }],
    ['json', { outputFile: path.join(artifacts, 'results.json') }],
    ['junit', { outputFile: path.join(artifacts, 'results.xml') }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL,
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 1000 },
    video: { mode: 'on', size: { width: 1440, height: 1000 } },
    // Video and explicit screenshots already record the visuals. Avoid a second
    // frame-by-frame copy inside every trace, while retaining DOM/network/steps.
    trace: { mode: 'on', screenshots: false, snapshots: true, sources: true },
    screenshot: 'on',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    serviceWorkers: 'block',
    launchOptions: { slowMo: 80 },
    actionTimeout: 20_000,
    navigationTimeout: 90_000,
  },
});
