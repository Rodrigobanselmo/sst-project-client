/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/modals/ModalEditDocumentModel/helpers/document-model-dirty.spec.ts
 */
import assert from 'assert';

import { DocumentModelClassificationEnum } from 'project/enum/document-model-classification.enum';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

import {
  getDocumentModelDirtySnapshot,
  isDocumentModelEditorDirty,
  mergeDocumentModelDirtySnapshot,
} from './document-model-dirty';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const pristine = getDocumentModelDirtySnapshot({
  name: 'PGR Canoas',
  description: 'modelo',
  type: DocumentTypeEnum.PGR,
  status: StatusEnum.ACTIVE,
  classifications: [
    DocumentModelClassificationEnum.COM_FRPS,
    DocumentModelClassificationEnum.GRO_PGR,
  ],
});

run('open without edits is pristine', () => {
  assert.strictEqual(
    isDocumentModelEditorDirty({
      current: pristine,
      baseline: pristine,
      documentDirty: false,
    }),
    false,
  );
});

run('missing baseline is treated as pristine', () => {
  assert.strictEqual(
    isDocumentModelEditorDirty({
      current: pristine,
      baseline: null,
      documentDirty: false,
    }),
    false,
  );
});

run('name change is dirty', () => {
  assert.strictEqual(
    isDocumentModelEditorDirty({
      current: getDocumentModelDirtySnapshot({
        ...pristine,
        name: 'PGR editado',
      }),
      baseline: pristine,
      documentDirty: false,
    }),
    true,
  );
});

run('saving metadata updates baseline and clears dirty', () => {
  const afterNameEdit = getDocumentModelDirtySnapshot({
    ...pristine,
    name: 'PGR editado',
  });
  const afterSave = mergeDocumentModelDirtySnapshot(pristine, {
    name: 'PGR editado',
  });

  assert.strictEqual(
    isDocumentModelEditorDirty({
      current: afterNameEdit,
      baseline: afterSave,
      documentDirty: false,
    }),
    false,
  );
});

run('document content dirty is independent from metadata snapshot', () => {
  assert.strictEqual(
    isDocumentModelEditorDirty({
      current: pristine,
      baseline: pristine,
      documentDirty: true,
    }),
    true,
  );
});

run('clearing document dirty after save leaves metadata pristine', () => {
  assert.strictEqual(
    isDocumentModelEditorDirty({
      current: pristine,
      baseline: pristine,
      documentDirty: false,
    }),
    false,
  );
});

run('classification order does not create a false dirty', () => {
  const reordered = getDocumentModelDirtySnapshot({
    ...pristine,
    classifications: [
      DocumentModelClassificationEnum.GRO_PGR,
      DocumentModelClassificationEnum.COM_FRPS,
    ],
  });

  assert.strictEqual(
    isDocumentModelEditorDirty({
      current: reordered,
      baseline: pristine,
      documentDirty: false,
    }),
    false,
  );
});

run('structural metadata such as copyFromId is dirty until saved', () => {
  assert.strictEqual(
    isDocumentModelEditorDirty({
      current: getDocumentModelDirtySnapshot({ ...pristine, copyFromId: 91 }),
      baseline: pristine,
      documentDirty: false,
    }),
    true,
  );
});

run('partial persist of status does not hide an unsaved name', () => {
  const current = getDocumentModelDirtySnapshot({
    ...pristine,
    name: 'ainda não salvo',
    status: StatusEnum.INACTIVE,
  });
  const baselineAfterStatusSave = mergeDocumentModelDirtySnapshot(pristine, {
    status: StatusEnum.INACTIVE,
  });

  assert.strictEqual(
    isDocumentModelEditorDirty({
      current,
      baseline: baselineAfterStatusSave,
      documentDirty: false,
    }),
    true,
  );
});

console.log('\nAll document-model dirty tests passed.');
