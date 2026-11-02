import {
  test,
  expect,
  fixture,
  login,
  waitForApi,
  assertStatus,
} from './fixtures';
import { db } from './database';
import type { Locator } from '@playwright/test';

async function expectReadableCertificateLabels(dialog: Locator) {
  const passwordControl = dialog
    .getByLabel('Senha do certificado', { exact: true })
    .locator('..');
  const representationLabel = dialog
    .locator('label')
    .filter({ hasText: /^Forma de representação$/ });
  await expect
    .poll(
      async () => {
        const before = await passwordControl.boundingBox();
        const after = await representationLabel.boundingBox();
        return before && after ? after.y - (before.y + before.height) : -1;
      },
      {
        message:
          'Floating representation label must not touch the preceding password field',
      },
    )
    .toBeGreaterThanOrEqual(6);
}

const root = () => `/companies/${fixture.companyId}/esocial-credentials`;
test.afterAll(async () => {
  await db.$disconnect();
});

test('Certificados eSocial — transmissão interna, renovação automática e isolamento da empresa', async ({
  page,
}) => {
  const internalPath =
    '/dashboard/configuracoes/certificado-transmissao-esocial';
  const adminRoot = '/admin/esocial-credentials';
  await login(page, internalPath, {
    email: fixture.platformMasterEmail,
    password: fixture.platformMasterPassword,
  });
  await expect(
    page.getByRole('heading', {
      name: 'Certificado de transmissão SimpleSST',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText('Nenhum certificado cadastrado', { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath('10-transmissao-interna.png'),
    fullPage: true,
  });
  await page
    .getByRole('button', { name: 'Adicionar certificado', exact: true })
    .click();
  const upload = page.getByRole('dialog', {
    name: 'Adicionar certificado',
    exact: true,
  });
  await upload
    .getByLabel('Nome do certificado')
    .fill('SimpleSST transmissão sintética');
  await upload
    .getByLabel('Arquivo do certificado')
    .setInputFiles(fixture.certificateFile);
  await upload
    .getByLabel('Senha do certificado')
    .fill(fixture.certificatePassword);
  await expect(upload.getByLabel('Forma de representação')).toBeHidden();
  let response = waitForApi(page, 'POST', adminRoot);
  await upload
    .getByRole('button', { name: 'Importar e ativar', exact: true })
    .click();
  const created = await assertStatus(await response, 201);
  expect(created.scope).toBe('PLATFORM');
  expect(created.encryptedPrivateKey).toBeUndefined();
  await expect(upload).toBeHidden();
  await expect(
    page.getByText('Configuração atual: SimpleSST transmissão sintética.', {
      exact: true,
    }),
  ).toBeVisible();
  const initialBinding =
    await db.eSocialPlatformCredentialBinding.findUniqueOrThrow({
      where: { id: 'PLATFORM' },
    });
  expect(initialBinding.credentialId).toBe(created.id);
  expect(initialBinding.revision).toBe(1);
  await page.screenshot({
    path: test.info().outputPath('11-transmissao-configurada.png'),
    fullPage: true,
  });
  await page.getByRole('tab', { name: 'Certificados', exact: true }).click();
  await page
    .getByRole('row')
    .filter({ hasText: 'SimpleSST transmissão sintética' })
    .getByRole('button', { name: 'Renovar', exact: true })
    .click();
  const renewal = page.getByRole('dialog', {
    name: 'Renovar certificado',
    exact: true,
  });
  await renewal
    .getByLabel('Nome do certificado')
    .fill('SimpleSST transmissão renovada');
  await renewal
    .getByLabel('Arquivo do certificado')
    .setInputFiles(fixture.renewalFile);
  await renewal
    .getByLabel('Senha do certificado')
    .fill(fixture.certificatePassword);
  response = waitForApi(page, 'POST', adminRoot + `/${created.id}/renew`);
  await renewal
    .getByRole('button', { name: 'Confirmar renovação', exact: true })
    .click();
  const renewed = await assertStatus(await response, 201);
  await expect(renewal).toBeHidden();
  const activeBinding =
    await db.eSocialPlatformCredentialBinding.findUniqueOrThrow({
      where: { id: 'PLATFORM' },
    });
  expect(activeBinding.credentialId).toBe(renewed.id);
  expect(activeBinding.revision).toBe(2);
  await page
    .getByRole('tab', { name: 'Uso na transmissão', exact: true })
    .click();
  await expect(
    page.getByText('Configuração atual: SimpleSST transmissão renovada.', {
      exact: true,
    }),
  ).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath('12-renovacao-automatica-interna.png'),
    fullPage: true,
  });

  await page.context().clearCookies();
  const companyPath = `/dashboard/empresas/${fixture.companyId}/esocial/certificados`;
  // Loading the guest page (including its development bundles) is not the
  // authenticated action which triggers the vault request. Start both response
  // observers only after navigation and filling, immediately before submission.
  await page.goto(`/login?redirect=${companyPath.replaceAll('/', '|')}`);
  await page.locator('#input_email').fill(fixture.email);
  await page.locator('#input_password').fill(fixture.password);
  const companyList = waitForApi(page, 'GET', root());
  const companySession = waitForApi(page, 'POST', '/session');
  await page.getByRole('button', { name: 'ENTRAR', exact: true }).click();
  await assertStatus(await companySession, 200);
  await expect(page).toHaveURL(
    new RegExp(companyPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
  await expect(page.locator('body')).not.toContainText('Application error');
  const companyVault = await assertStatus(await companyList, 200);
  expect(companyVault.platformAdministrationAllowed).toBe(false);
  expect(
    companyVault.certificates.every(
      (certificate: any) => certificate.scope === 'COMPANY',
    ),
  ).toBe(true);
  expect(JSON.stringify(companyVault)).not.toContain(created.id);
  expect(JSON.stringify(companyVault)).not.toContain(renewed.id);
  await expect(
    page.getByText('Transmissão eSocial · SimpleSST', { exact: true }),
  ).toBeHidden();
  await expect(
    page.getByText('SimpleSST transmissão renovada', { exact: true }),
  ).toBeHidden();
  await page.screenshot({
    path: test.info().outputPath('13-empresa-sem-configuracao-interna.png'),
    fullPage: true,
  });
});

test('Certificados eSocial — upload, senha incorreta, próprio, procuração, renovação e desativação', async ({
  page,
}) => {
  await login(
    page,
    `/dashboard/empresas/${fixture.companyId}/esocial/certificados`,
  );
  await expect(
    page.getByText('Você não possui autorização para acessar essa rota', {
      exact: true,
    }),
  ).toBeHidden();
  await expect(
    page.getByRole('heading', { name: 'Certificados do eSocial', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Nenhum certificado cadastrado', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Transmissão eSocial · SimpleSST', { exact: true }),
  ).toBeHidden();
  await page.screenshot({
    path: test.info().outputPath('01-cadastro-vazio.png'),
    fullPage: true,
  });

  await page
    .getByRole('button', { name: 'Adicionar certificado', exact: true })
    .click();
  const upload = page.getByRole('dialog', {
    name: 'Adicionar certificado',
    exact: true,
  });
  await upload
    .getByLabel('Nome do certificado')
    .fill('Certificado A1 sintético');
  await upload
    .getByLabel('Arquivo do certificado')
    .setInputFiles(fixture.certificateFile);
  await upload.getByLabel('Senha do certificado').fill('senha-incorreta');
  let response = waitForApi(page, 'POST', root());
  await upload
    .getByRole('button', { name: 'Importar e ativar', exact: true })
    .click();
  expect((await response).status()).toBe(400);
  await expect(
    upload.getByText('Senha do certificado incorreta.'),
  ).toBeVisible();
  await expect(upload.getByLabel('Senha do certificado')).toHaveValue('');
  expect(
    await db.eSocialCredential.count({
      where: { ownerCompanyId: fixture.companyId, scope: 'COMPANY' },
    }),
  ).toBe(0);
  expect(
    await db.eSocialCredentialBinding.count({
      where: { companyId: fixture.companyId },
    }),
  ).toBe(0);
  await upload
    .getByLabel('Senha do certificado')
    .fill(fixture.certificatePassword);
  await expectReadableCertificateLabels(upload);
  await test.info().attach('certificate-dialog-spacing', {
    body: Buffer.from(
      JSON.stringify(
        await upload.evaluate((dialog) => {
          const fields = dialog.querySelector(
            '.MuiDialogContent-root > .MuiStack-root',
          );
          return {
            rootFontSize: getComputedStyle(document.documentElement).fontSize,
            fieldGap: fields ? getComputedStyle(fields).gap : null,
          };
        }),
        null,
        2,
      ),
    ),
    contentType: 'application/json',
  });
  await page.screenshot({
    path: test.info().outputPath('02-importacao-protegida.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await upload
    .getByLabel('Forma de representação', { exact: true })
    .scrollIntoViewIfNeeded();
  await expectReadableCertificateLabels(upload);
  await expect(
    upload.getByRole('button', { name: 'Importar e ativar', exact: true }),
  ).toBeInViewport();
  await page.screenshot({
    path: test.info().outputPath('02b-importacao-tela-estreita.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expectReadableCertificateLabels(upload);
  response = waitForApi(page, 'POST', root());
  await upload
    .getByRole('button', { name: 'Importar e ativar', exact: true })
    .click();
  const created = await assertStatus(await response, 201);
  expect(created.encryptedPrivateKey).toBeUndefined();
  expect(created.key).toBeUndefined();
  expect(created.certificate).toBeUndefined();
  await expect(upload).toBeHidden();
  await expect(
    page.getByText('Certificado importado e ativado para os próximos envios.', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      'Configuração atual: Certificado A1 sintético · certificado próprio.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('combobox', { name: 'Empresa empregadora', exact: true }),
  ).toBeHidden();
  const own = await db.eSocialCredentialBinding.findUniqueOrThrow({
    where: { companyId: fixture.companyId },
  });
  expect(own.credentialId).toBe(created.id);
  expect(own.revision).toBe(1);
  await page.screenshot({
    path: test.info().outputPath('04-certificado-proprio.png'),
    fullPage: true,
  });
  await page.getByRole('tab', { name: 'Certificados', exact: true }).click();
  const certificateRow = page
    .getByRole('row')
    .filter({ hasText: 'Certificado A1 sintético' });
  await expect(
    certificateRow.getByText('Ativo', { exact: true }),
  ).toBeVisible();
  const stored = await db.eSocialCredential.findUniqueOrThrow({
    where: { id: created.id },
  });
  expect(stored.encryptedPrivateKey).not.toContain('PRIVATE KEY');
  expect(JSON.parse(stored.encryptedPrivateKey).version).toBe(1);
  await page.screenshot({
    path: test.info().outputPath('03-certificado-importado.png'),
    fullPage: true,
  });

  await page.goto('/dashboard/configuracoes/certificados-esocial');
  await page
    .getByRole('tab', { name: 'Empresas e envio', exact: true })
    .click();
  await page
    .getByRole('combobox', { name: 'Empresa empregadora', exact: true })
    .fill('Cliente procuração');
  await page.getByRole('option', { name: /Cliente procuração E2E/ }).click();
  await expect(
    page.getByText(
      'Esta empresa ainda não tem um certificado habilitado para novos envios.',
    ),
  ).toBeVisible();
  await page.getByLabel('Certificado para envio').click();
  await page.getByRole('option', { name: /Certificado A1 sintético/ }).click();
  await page.getByLabel('Forma de representação').click();
  await page
    .getByRole('option', { name: 'Certificado de procurador', exact: true })
    .click();
  await expect(
    page.getByRole('button', {
      name: 'Salvar configuração de envio',
      exact: true,
    }),
  ).toBeDisabled();
  await page
    .getByLabel(
      'Confirmo que existe procuração válida para enviar os eventos de SST desta empresa',
    )
    .check();
  await page.screenshot({
    path: test.info().outputPath('05-procuracao-por-empresa.png'),
    fullPage: true,
  });
  response = waitForApi(
    page,
    'PUT',
    root() + '/bindings/' + fixture.certificateClientId,
  );
  await page
    .getByRole('button', { name: 'Salvar configuração de envio', exact: true })
    .click();
  const proxy = await assertStatus(await response, 200);
  expect(proxy.authorizationStatus).toBe('DECLARED_NOT_VERIFIED');
  await expect(
    page.getByText(
      /Configuração atual: Certificado A1 sintético · procuração informada/,
    ),
  ).toBeVisible();

  await page.getByRole('tab', { name: 'Certificados', exact: true }).click();
  await certificateRow
    .getByRole('button', { name: 'Renovar', exact: true })
    .click();
  const renewal = page.getByRole('dialog', {
    name: 'Renovar certificado',
    exact: true,
  });
  await renewal
    .getByLabel('Nome do certificado')
    .fill('Certificado A1 renovado');
  await renewal
    .getByLabel('Arquivo do certificado')
    .setInputFiles(fixture.renewalFile);
  await renewal
    .getByLabel('Senha do certificado')
    .fill(fixture.certificatePassword);
  await page.screenshot({
    path: test.info().outputPath('06-renovacao.png'),
    fullPage: true,
  });
  response = waitForApi(page, 'POST', root() + `/${created.id}/renew`);
  await renewal
    .getByRole('button', { name: 'Confirmar renovação', exact: true })
    .click();
  const renewed = await assertStatus(await response, 201);
  await expect(renewal).toBeHidden();
  await expect(
    certificateRow.getByText('Renovado', { exact: true }),
  ).toBeVisible();
  const bindings = await db.eSocialCredentialBinding.findMany({
    where: {
      companyId: { in: [fixture.companyId, fixture.certificateClientId] },
    },
  });
  expect(bindings).toHaveLength(2);
  expect(
    bindings.every(
      (b: any) => b.credentialId === renewed.id && b.revision === 2,
    ),
  ).toBe(true);
  await page
    .getByRole('tab', { name: 'Empresas e envio', exact: true })
    .click();
  await expect(
    page.getByText(
      /Configuração atual: Certificado A1 renovado · procuração informada/,
    ),
  ).toBeVisible();
  await expect(
    page.getByLabel(
      'Confirmo que existe procuração válida para enviar os eventos de SST desta empresa',
    ),
  ).toBeChecked();
  await page.getByRole('tab', { name: 'Certificados', exact: true }).click();
  await page.screenshot({
    path: test.info().outputPath('07-versoes-preservadas.png'),
    fullPage: true,
  });

  await page
    .getByRole('row')
    .filter({ hasText: 'Certificado A1 renovado' })
    .getByRole('button', { name: 'Desativar', exact: true })
    .click();
  const disable = page.getByRole('dialog', {
    name: 'Desativar certificado',
    exact: true,
  });
  await page.screenshot({
    path: test.info().outputPath('08-desativacao.png'),
    fullPage: true,
  });
  response = waitForApi(page, 'POST', root() + `/${renewed.id}/disable`);
  await disable
    .getByRole('button', { name: 'Confirmar desativação', exact: true })
    .click();
  await assertStatus(await response, 201);
  await expect(disable).toBeHidden();
  await expect(
    page
      .getByRole('row')
      .filter({ hasText: 'Certificado A1 renovado' })
      .getByText('Desativado', { exact: true }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Atividade', exact: true }).click();
  await expect(
    page.getByRole('table', { name: 'Atividade dos certificados' }),
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Renovação', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Desativação', exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath('09-atividade.png'),
    fullPage: true,
  });
});
