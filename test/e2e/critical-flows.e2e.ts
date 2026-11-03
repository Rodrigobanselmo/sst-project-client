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

test('01 — acesso protegido, senha incorreta e login real', async ({
  page,
}) => {
  await test.step('Sem sessão, a página redireciona para o login', async () => {
    await page.goto(companyPath('empregados'));
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
  });
  await test.step('Senha incorreta é recusada pela API', async () => {
    await page.locator('#input_email').fill(fixture.email);
    await page.locator('#input_password').fill('Senha-incorreta1!');
    const response = waitForApi(page, 'POST', '/session');
    await page.getByRole('button', { name: 'ENTRAR', exact: true }).click();
    const result = await assertStatus(await response, 400);
    expect(result.message).toMatch(/Email ou senha incorreto/);
    await expect(
      page.getByText('Email ou senha incorreto', { exact: true }),
    ).toBeVisible();
    expect(
      (await page.context().cookies()).some((c) => c.name === 'nextauth.token'),
    ).toBe(false);
  });
  await test.step('Credenciais válidas abrem a tela de funcionários', async () => {
    await login(page);
    await expect(
      page.getByRole('button', { name: 'Adicionar', exact: true }),
    ).toBeVisible();
    expect(
      (await page.context().cookies()).some((c) => c.name === 'nextauth.token'),
    ).toBe(true);
  });
});

test('02 — funcionário: validação, criação, edição e persistência após recarregar', async ({
  page,
}) => {
  const cpf = '52998224725';
  const initialCount = await db.employee.count({
    where: { companyId: fixture.companyId },
  });
  await login(page);
  await page.getByRole('button', { name: 'Adicionar', exact: true }).click();
  await test.step('Campos obrigatórios impedem a criação vazia', async () => {
    await page.getByRole('button', { name: 'Proximo', exact: true }).click();
    await expect(
      page.getByText('nome obrigatório', { exact: true }),
    ).toBeVisible();
    expect(
      await db.employee.count({ where: { companyId: fixture.companyId } }),
    ).toBe(initialCount);
  });
  await test.step('Criar funcionário usando o formulário e confirmar no PostgreSQL', async () => {
    await page
      .getByPlaceholder('nome completo do empregado...')
      .fill('Ana Teste Navegador');
    await page.getByPlaceholder('000.000.000-00').fill(cpf);
    await page.getByRole('radio', { name: 'Feminino', exact: true }).check();
    const response = waitForApi(page, 'POST', '/employee');
    await page.getByRole('button', { name: 'Proximo', exact: true }).click();
    await assertStatus(await response, 201);
    await expect
      .poll(() =>
        db.employee.count({ where: { companyId: fixture.companyId, cpf } }),
      )
      .toBe(1);
    await expect(
      page.getByText('Histórico de lotação', { exact: true }),
    ).toBeVisible();
  });
  await test.step('Editar o cadastro e confirmar a persistência real', async () => {
    await page.getByText('Dados Pessoais', { exact: true }).click();
    await page
      .getByPlaceholder('nome completo do empregado...')
      .fill('Ana Teste Revisada');
    await page
      .getByPlaceholder('telefone do funcionário...')
      .fill('11987654321');
    const response = waitForApi(page, 'PATCH', '/employee');
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();
    await assertStatus(await response, 200);
    await expect(
      page.getByText('Ana Teste Revisada', { exact: true }),
    ).toBeVisible();
    const saved = await db.employee.findFirstOrThrow({
      where: { companyId: fixture.companyId, cpf },
    });
    expect(saved.name).toBe('Ana Teste Revisada');
    expect(saved.phone.replace(/\D/g, '')).toBe('11987654321');
    await page.reload();
    await page.getByText('Ana Teste Revisada', { exact: true }).click();
    await expect(
      page.getByPlaceholder('nome completo do empregado...'),
    ).toHaveValue('Ana Teste Revisada');
    await expect(
      page.getByPlaceholder('telefone do funcionário...'),
    ).toHaveValue(/98765/);
  });
});

test('03 — CPF duplicado é recusado sem criar outro funcionário', async ({
  page,
}) => {
  // Independent fixture: this test also works with --grep and a fresh database.
  await db.employee.create({
    data: {
      companyId: fixture.companyId,
      name: 'CPF já cadastrado',
      cpf: '11144477735',
      sex: 'M',
    },
  });
  const before = await db.employee.count({
    where: { companyId: fixture.companyId },
  });
  await login(page);
  await page.getByRole('button', { name: 'Adicionar', exact: true }).click();
  await page
    .getByPlaceholder('nome completo do empregado...')
    .fill('Tentativa de Duplicação');
  await page.getByPlaceholder('000.000.000-00').fill('11144477735');
  await page.getByRole('radio', { name: 'Masculino', exact: true }).check();
  const response = waitForApi(page, 'POST', '/employee');
  await page.getByRole('button', { name: 'Proximo', exact: true }).click();
  const result = await assertStatus(await response, 409);
  expect(JSON.stringify(result)).toMatch(/CPF|cpf|cadastrado|exist/i);
  await expect(
    page.getByPlaceholder('nome completo do empregado...'),
  ).toHaveValue('Tentativa de Duplicação');
  expect(
    await db.employee.count({ where: { companyId: fixture.companyId } }),
  ).toBe(before);
});

test('04 — risco: severidade obrigatória, criação, edição e recarga', async ({
  page,
}) => {
  await login(page, companyPath('fatores-riscos'));
  await page.getByRole('button', { name: 'Adicionar', exact: true }).click();
  await page
    .getByPlaceholder('descrição do fator de risco...')
    .fill('Ruído Navegador E2E');
  await page.getByText('FIS', { exact: true }).click();
  await test.step('Sem severidade, o risco não é salvo', async () => {
    await page.getByRole('button', { name: 'Criar', exact: true }).click();
    await expect(
      page.getByText('Defina a severidade do fator de risco antes de salvar.'),
    ).toBeVisible();
    expect(
      await db.riskFactors.count({
        where: { name: 'Ruído Navegador E2E', companyId: fixture.companyId },
      }),
    ).toBe(0);
  });
  await test.step('Criar fator de risco pelo modal', async () => {
    await page
      .locator('input[name="severity"][value="3"]')
      .locator('..')
      .locator('span[tabindex="0"]')
      .click();
    const response = waitForApi(page, 'POST', '/risk');
    await page.getByRole('button', { name: 'Criar', exact: true }).click();
    await assertStatus(await response, 201);
    await expect(
      page.getByText('Ruído Navegador E2E', { exact: true }),
    ).toBeVisible();
    const saved = await db.riskFactors.findFirstOrThrow({
      where: { name: 'Ruído Navegador E2E', companyId: fixture.companyId },
    });
    expect(saved.severity).toBe(3);
    expect(saved.type).toBe('FIS');
  });
  await test.step('Editar pela tela de detalhe e verificar no banco e na recarga', async () => {
    await page.getByText('Ruído Navegador E2E', { exact: true }).click();
    await expect(page).toHaveURL(/\/edit/);
    await page
      .getByPlaceholder('descrição do fator de risco...')
      .fill('Ruído Revisado Navegador E2E');
    await page
      .locator('input[name="severity"][value="4"]')
      .locator('..')
      .locator('span[tabindex="0"]')
      .click();
    const saved = await db.riskFactors.findFirstOrThrow({
      where: { name: 'Ruído Navegador E2E', companyId: fixture.companyId },
    });
    const response = waitForApi(page, 'PATCH', `/risk/${saved.id}`);
    await page
      .getByRole('button', { name: 'Salvar', exact: true })
      .first()
      .click();
    await assertStatus(await response, 200);
    await expect
      .poll(
        async () =>
          (await db.riskFactors.findUniqueOrThrow({ where: { id: saved.id } }))
            .severity,
      )
      .toBe(4);
    await page.reload();
    await expect(
      page.getByPlaceholder('descrição do fator de risco...'),
    ).toHaveValue('Ruído Revisado Navegador E2E');
    await expect(
      page.locator('input[name="severity"][value="4"]'),
    ).toBeChecked();
  });
});

test('05 — organograma: criar cargo, editar e preservar relações após recarga', async ({
  page,
}) => {
  await login(
    page,
    companyPath('hierarquia') + `?tabWorkspaceId=${fixture.workspaceId}`,
  );
  const parent = page.locator(
    `[id="node_card_${fixture.sectorId}//${fixture.workspaceId}"]`,
  );
  await expect(parent).toBeVisible();
  await parent.getByLabel('Adicionar', { exact: true }).click();
  await page
    .getByPlaceholder('nome do cargo...')
    .fill('Operador Navegador E2E');
  await page
    .getByPlaceholder('descrição do cargo...', { exact: true })
    .fill('Operação cadastrada pelo navegador.');
  const created = waitForApi(
    page,
    'POST',
    `/hierarchy/upsert-many/${fixture.companyId}`,
  );
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await assertStatus(await created, 201);
  const saved = await db.hierarchy.findFirstOrThrow({
    where: { companyId: fixture.companyId, name: 'OPERADOR NAVEGADOR E2E' },
    include: { workspaces: true },
  });
  expect(saved.type).toBe('OFFICE');
  expect(saved.parentId).toBe(fixture.sectorId);
  expect(saved.workspaces.map((w: any) => w.id)).toContain(fixture.workspaceId);
  await expect(
    page.getByText('OPERADOR NAVEGADOR E2E', { exact: true }),
  ).toBeVisible();
  await page.getByText('OPERADOR NAVEGADOR E2E', { exact: true }).click();
  await page.getByPlaceholder('nome do cargo...').fill('Operador Revisado E2E');
  const updated = waitForApi(
    page,
    'POST',
    `/hierarchy/upsert-many/${fixture.companyId}`,
  );
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await assertStatus(await updated, 201);
  expect(
    (await db.hierarchy.findUniqueOrThrow({ where: { id: saved.id } })).name,
  ).toBe('OPERADOR REVISADO E2E');
  const reloadedHierarchy = waitForApi(
    page,
    'GET',
    `/hierarchy/${fixture.companyId}`,
  );
  await page.reload();
  const reloadedRows = await assertStatus(await reloadedHierarchy, 200);
  expect(reloadedRows.find((item: any) => item.id === saved.id).name).toBe(
    'OPERADOR REVISADO E2E',
  );
  await expect(parent).toBeVisible();
  // Reload resets expansion state. Search expands the matching branch explicitly.
  await page
    .getByPlaceholder('Pesquisar no organograma...')
    .fill('OPERADOR REVISADO E2E');
  await expect(
    page.getByText('OPERADOR REVISADO E2E', { exact: true }),
  ).toBeVisible();
  const after = await db.hierarchy.findUniqueOrThrow({
    where: { id: saved.id },
    include: { workspaces: true },
  });
  expect(after.parentId).toBe(fixture.sectorId);
  expect(after.description).toBe('Operação cadastrada pelo navegador.');
  expect(after.workspaces.map((w: any) => w.id)).toEqual([fixture.workspaceId]);
});
