/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/tables/DocumentModelTable/document-model-duplicate.util.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { DocumentModelClassificationEnum } from 'project/enum/document-model-classification.enum';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { PermissionEnum } from 'project/enum/permission.enum';

import {
  buildDocumentModelDuplicateName,
  buildDocumentModelDuplicatePayload,
  canSubmitDocumentModelDuplicate,
  DOCUMENT_MODEL_DUPLICATE_SUCCESS_MESSAGE,
} from './document-model-duplicate.util';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const tableSource = fs.readFileSync(
  path.join(__dirname, 'DocumentModelTable.tsx'),
  'utf8',
);
const dialogSource = fs.readFileSync(
  path.join(__dirname, 'DocumentModelDuplicateDialog.tsx'),
  'utf8',
);
const mutationSource = fs.readFileSync(
  path.join(
    __dirname,
    '../../../../core/services/hooks/mutations/manager/document-model/useMutCreateDocumentModel/useMutCreateDocumentModel.ts',
  ),
  'utf8',
);

const sourceModel = {
  id: 910,
  companyId: 'company-1',
  name: 'PGR Essencial',
  description: 'Descrição original',
  type: DocumentTypeEnum.PGR,
  classifications: [
    DocumentModelClassificationEnum.SIMPLIFICADO,
    DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
  ],
};

run('1. Duplicate action is gated by document-model create permission', () => {
  assert.equal(tableSource.includes('PermissionEnum.DOCUMENT_MODEL'), true);
  assert.equal(tableSource.includes("cruds: 'c'"), true);
  assert.equal(tableSource.includes('canCreateDocumentModel'), true);
  assert.equal(PermissionEnum.DOCUMENT_MODEL, '20');
});

run('2. modal prefills name as “[original] — Cópia”', () => {
  assert.equal(
    buildDocumentModelDuplicateName('PGR Essencial'),
    'PGR Essencial — Cópia',
  );
});

run('3. user can change the duplicate name before submit', () => {
  const payload = buildDocumentModelDuplicatePayload({
    source: sourceModel,
    name: 'PGR Essencial — Cópia revisada',
  });
  assert.equal(payload.name, 'PGR Essencial — Cópia revisada');
  assert.equal(dialogSource.includes('setName(event.target.value)'), true);
});

run('4. confirm reuses create mutation with copyFromId', () => {
  const payload = buildDocumentModelDuplicatePayload({
    source: sourceModel,
    name: 'PGR Essencial — Cópia',
  });
  assert.equal(payload.copyFromId, 910);
  assert.equal(dialogSource.includes('useMutCreateDocumentModel'), true);
  assert.equal(dialogSource.includes('createMutation.mutateAsync(payload)'), true);
  assert.equal(mutationSource.includes('api.post<IDocumentModel>'), true);
});

run('5. payload keeps the original id only as copyFromId', () => {
  const payload = buildDocumentModelDuplicatePayload({
    source: sourceModel,
    name: 'PGR Essencial — Cópia',
  });
  assert.equal((payload as { id?: number }).id, undefined);
  assert.notEqual(payload.copyFromId, undefined);
  assert.notEqual(payload.copyFromId, payload.name as unknown);
});

run('6. type is preserved', () => {
  assert.equal(
    buildDocumentModelDuplicatePayload({
      source: sourceModel,
      name: 'PGR Essencial — Cópia',
    }).type,
    DocumentTypeEnum.PGR,
  );
});

run('7. description is preserved', () => {
  assert.equal(
    buildDocumentModelDuplicatePayload({
      source: sourceModel,
      name: 'PGR Essencial — Cópia',
    }).description,
    'Descrição original',
  );
});

run('8. classifications are preserved without recalculation', () => {
  assert.deepStrictEqual(
    buildDocumentModelDuplicatePayload({
      source: sourceModel,
      name: 'PGR Essencial — Cópia',
    }).classifications,
    [
      DocumentModelClassificationEnum.SIMPLIFICADO,
      DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
    ],
  );
});

run('9. content is copied via existing copyFromId mechanism', () => {
  assert.equal(
    buildDocumentModelDuplicatePayload({
      source: sourceModel,
      name: 'PGR Essencial — Cópia',
    }).copyFromId,
    sourceModel.id,
  );
  assert.equal(dialogSource.includes('buildDocumentModelDuplicatePayload'), true);
});

run('10. payload does not send status or mutate the original', () => {
  const payload = buildDocumentModelDuplicatePayload({
    source: sourceModel,
    name: 'PGR Essencial — Cópia',
  });
  assert.equal('status' in payload, false);
  assert.equal(dialogSource.includes('updateMutation'), false);
  assert.equal(dialogSource.includes('useMutUpdateDocumentModel'), false);
});

run('11. cancel does not create anything', () => {
  assert.equal(dialogSource.includes("text: 'Cancelar'"), true);
  assert.equal(dialogSource.includes('onClose={handleCancel}'), true);
  assert.equal(
    dialogSource.includes('createMutation.mutateAsync') &&
      dialogSource.includes('handleCancel'),
    true,
  );
  assert.equal(canSubmitDocumentModelDuplicate('   '), false);
});

run('12. failure keeps the modal open', () => {
  const confirmStart = dialogSource.indexOf('const handleConfirm');
  const confirmFn = dialogSource.slice(
    confirmStart,
    dialogSource.indexOf('const buttons', confirmStart),
  );
  assert.equal(confirmFn.includes('createMutation.mutateAsync(payload)'), true);
  assert.equal(confirmFn.includes('if (created) onClose()'), true);
  assert.equal(confirmFn.includes('catch'), true);
  assert.equal(/catch[\s\S]*onClose\(\)/.test(confirmFn), false);
});

run('13. listing invalidates after success via existing create mutation', () => {
  assert.equal(
    mutationSource.includes('queryClient.invalidateQueries([QueryEnum.DOCUMENT_MODEL])'),
    true,
  );
  assert.equal(
    dialogSource.includes('DOCUMENT_MODEL_DUPLICATE_SUCCESS_MESSAGE'),
    true,
  );
  assert.equal(
    DOCUMENT_MODEL_DUPLICATE_SUCCESS_MESSAGE,
    'Modelo duplicado com sucesso',
  );
});

run('14. filters are not reset by the duplicate action', () => {
  assert.equal(tableSource.includes('setClassificationFilters'), false);
  assert.equal(tableSource.includes('setStatusFilter'), false);
  assert.equal(dialogSource.includes('DOCUMENT_MODEL_EDIT_DATA'), false);
});

run('15. duplicate is hidden without create permission', () => {
  assert.equal(
    tableSource.includes('{canCreateDocumentModel && !isSelect && ('),
    true,
  );
  assert.equal(tableSource.includes('onDuplicateModel'), true);
});

console.log('\nAll document-model duplicate tests passed.');
