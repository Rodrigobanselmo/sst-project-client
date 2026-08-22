/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/@v2/pages/companies/forms/pages/application/schema/form-application-editor-dirty.spec.ts
 */
import assert from 'assert';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
  getFormApplicationEditorSnapshot,
  isFormApplicationEditorDirty,
} from './form-application-editor-dirty';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const values = {
  name: 'Aplicação',
  description: 'desc',
  bannerIntroText: 'intro',
  bannerWhyText: 'why',
  bannerContactText: 'contact',
  anonymous: true,
  shareableLink: { value: 'true', label: 'Link' },
  participationGoal: 80,
  form: { id: 'form-1', name: 'Modelo' },
  scopeType: { value: 'COMPANY' },
  companyGroup: { id: null },
  companyIds: [{ id: 'c1' }],
  workspaceIds: [{ id: 'w1' }],
  sections: [
    {
      id: 'client-1',
      apiId: 'api-1',
      title: 'Seção',
      description: '',
      items: [
        {
          id: 'client-q1',
          apiId: 'q1',
          content: 'Pergunta',
          required: true,
          type: { value: 'TEXT', label: 'Texto' },
          options: [],
          risks: [],
        },
      ],
    },
  ],
} as any;

const baseline = getFormApplicationEditorSnapshot(values);

run('open without edits is pristine even with different client uuids', () => {
  const otherClientIds = {
    ...values,
    sections: [
      {
        ...values.sections[0],
        id: 'other-client',
        items: [{ ...values.sections[0].items[0], id: 'other-q' }],
      },
    ],
  };
  assert.equal(isFormApplicationEditorDirty(otherClientIds, baseline), false);
});

run('name edit is dirty', () => {
  assert.equal(
    isFormApplicationEditorDirty({ ...values, name: 'Outro' }, baseline),
    true,
  );
});

run('banner text edit is dirty', () => {
  assert.equal(
    isFormApplicationEditorDirty(
      { ...values, bannerIntroText: 'outro intro' },
      baseline,
    ),
    true,
  );
});

run('structural question edit is dirty', () => {
  const edited = {
    ...values,
    sections: [
      {
        ...values.sections[0],
        items: [
          { ...values.sections[0].items[0], content: 'Pergunta editada' },
        ],
      },
    ],
  };
  assert.equal(isFormApplicationEditorDirty(edited, baseline), true);
});

run('snapshot does not throw when arrays are missing', () => {
  assert.doesNotThrow(() =>
    getFormApplicationEditorSnapshot({
      name: 'x',
      companyIds: undefined,
      workspaceIds: null,
      sections: [{ title: 's', items: [{ content: 'q', risks: null }] }],
    }),
  );
});

const editSource = readFileSync(
  resolve(
    'src/@v2/pages/companies/forms/pages/application/pages/edit/components/FormApplicationEditContent/FormApplicationEditContent.tsx',
  ),
  'utf8',
);
run('form application edit watches dirty in footer, not FormProvider owner', () => {
  assert.equal(editSource.includes('showSaveAndExit={true}'), true);
  assert.equal(editSource.includes('onSubmitStay'), true);
  assert.equal(editSource.includes('onSubmitExit'), true);
  assert.equal(editSource.includes('FormApplicationEditFooter'), true);
  assert.equal(editSource.includes('useWatch({ control: form.control })'), true);
  assert.equal(editSource.includes('form.watch()'), false);
});

const pageSource = readFileSync(
  resolve(
    'src/pages/dashboard/empresas/[companyId]/formularios/aplicados/[id]/edit/index.page.tsx',
  ),
  'utf8',
);
const editPageSource = readFileSync(
  resolve(
    'src/@v2/pages/companies/forms/pages/application/pages/edit/form-application-edit.page.tsx',
  ),
  'utf8',
);
run('real aplicação edit route mounts FormApplicationEditContent', () => {
  assert.equal(pageSource.includes('FormApplicationEditPage'), true);
  assert.equal(editPageSource.includes('FormApplicationEditContent'), true);
});

const addSource = readFileSync(
  resolve(
    'src/@v2/pages/companies/forms/pages/application/pages/add/components/FormApplicationAddContent/FormApplicationAddContent.tsx',
  ),
  'utf8',
);
run('form application add keeps a single save', () => {
  assert.equal(addSource.includes('showSaveAndExit'), false);
});

const modelEditSource = readFileSync(
  resolve(
    'src/@v2/pages/companies/forms/pages/model/pages/edit/components/FormModelEditContent/FormModelEditContent.tsx',
  ),
  'utf8',
);
run('form model edit stay/exit wiring is unchanged', () => {
  assert.equal(modelEditSource.includes('showSaveAndExit={true}'), true);
  assert.equal(modelEditSource.includes('onSubmitStay'), true);
  assert.equal(modelEditSource.includes('onSubmitExit'), true);
  assert.equal(modelEditSource.includes('formHook.watch()'), true);
});

console.log('\nAll form-application-editor-dirty tests passed.');
