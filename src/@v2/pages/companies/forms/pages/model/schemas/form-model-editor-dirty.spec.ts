/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/@v2/pages/companies/forms/pages/model/schemas/form-model-editor-dirty.spec.ts
 */
import assert from 'assert';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
  getFormModelEditorSnapshot,
  isFormModelEditorDirty,
} from './form-model-editor-dirty';

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
  title: 'Modelo',
  description: 'desc',
  anonymous: true,
  shareableLink: { value: 'true', label: 'Link' },
  type: { value: 'PSYCHOSOCIAL', label: 'Psicossocial' },
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

const baseline = getFormModelEditorSnapshot(values);

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
  assert.equal(isFormModelEditorDirty(otherClientIds, baseline), false);
});

run('title edit is dirty', () => {
  assert.equal(
    isFormModelEditorDirty({ ...values, title: 'Outro' }, baseline),
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
  assert.equal(isFormModelEditorDirty(edited, baseline), true);
});

run('reverting title to baseline is pristine', () => {
  assert.equal(isFormModelEditorDirty(values, baseline), false);
});

const editSource = readFileSync(
  resolve(
    'src/@v2/pages/companies/forms/pages/model/pages/edit/components/FormModelEditContent/FormModelEditContent.tsx',
  ),
  'utf8',
);
run('form model edit has stay/exit', () => {
  assert.equal(editSource.includes('showSaveAndExit={true}'), true);
  assert.equal(editSource.includes('onSubmitStay'), true);
  assert.equal(editSource.includes('onSubmitExit'), true);
  assert.equal(editSource.includes('formHook.watch()'), true);
});

const pageSource = readFileSync(
  resolve(
    'src/pages/dashboard/empresas/[companyId]/formularios/modelos/[id]/index.page.tsx',
  ),
  'utf8',
);
const editPageSource = readFileSync(
  resolve(
    'src/@v2/pages/companies/forms/pages/model/pages/edit/form-model-edit.page.tsx',
  ),
  'utf8',
);
run('real modelo edit route mounts FormModelEditContent', () => {
  assert.equal(pageSource.includes('FormModelEditPage'), true);
  assert.equal(editPageSource.includes('FormModelEditContent'), true);
});

const buttonsSource = readFileSync(
  resolve(
    'src/@v2/pages/companies/forms/components/FormQuestionsButtons/FormQuestionsButtons.tsx',
  ),
  'utf8',
);
run('form footer wraps stay/exit so Salvar e sair is not clipped', () => {
  assert.equal(buttonsSource.includes('flexWrap="wrap"'), true);
  assert.equal(buttonsSource.includes('Salvar e sair'), true);
  assert.equal(buttonsSource.includes('getSaveActionV2Color'), true);
});

const addSource = readFileSync(
  resolve(
    'src/@v2/pages/companies/forms/pages/model/pages/add/components/FormModelAddContent/FormModelAddContent.tsx',
  ),
  'utf8',
);
run('form model add keeps a single save', () => {
  assert.equal(addSource.includes('showSaveAndExit'), false);
});

console.log('\nAll form-model-editor-dirty tests passed.');
