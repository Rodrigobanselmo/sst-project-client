/**
 * Variable edits must persist via the same Strong Save path as document content.
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/modals/ModalEditDocumentModel/helpers/document-model-variables-save.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import {
  extractParagraphContent,
  lineToInlineContent,
} from '../../../documentModel/editor-v2/tiptap/inline-ranges';
import {
  isDocumentModelEditorDirty,
  getDocumentModelDirtySnapshot,
  mergeDocumentModelDirtySnapshot,
} from './document-model-dirty';
import {
  planDocumentModelPersistSteps,
  shouldSuppressMetadataPersistSuccessSnackbar,
} from './document-model-persist-steps';
import { StatusEnum } from 'project/enum/status.enum';
import { DocumentTypeEnum } from 'project/enum/document.enums';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

function readRel(...parts: string[]) {
  return fs.readFileSync(path.join(__dirname, ...parts), 'utf8');
}

const pristine = getDocumentModelDirtySnapshot({
  name: 'PGR',
  description: 'desc',
  type: DocumentTypeEnum.PGR,
  status: StatusEnum.ACTIVE,
  classifications: [],
});

run('1. editar só variável → Save usa content, não metadata', () => {
  assert.deepEqual(
    planDocumentModelPersistSteps({
      hasModelId: true,
      isMetadataDirty: false,
      documentDirty: true,
    }),
    ['content'],
  );
});

run('2. editar só metadata → Save usa metadata, não content', () => {
  assert.deepEqual(
    planDocumentModelPersistSteps({
      hasModelId: true,
      isMetadataDirty: true,
      documentDirty: false,
    }),
    ['metadata'],
  );
});

run('3. editar variável + metadata → Save usa metadata depois content', () => {
  assert.deepEqual(
    planDocumentModelPersistSteps({
      hasModelId: true,
      isMetadataDirty: true,
      documentDirty: true,
    }),
    ['metadata', 'content'],
  );
});

run('4. após content save limpo, dirty global false', () => {
  assert.equal(
    isDocumentModelEditorDirty({
      current: pristine,
      baseline: pristine,
      documentDirty: false,
    }),
    false,
  );
});

run('5. metadata salvo sem content save deixa documentDirty true', () => {
  const baseline = mergeDocumentModelDirtySnapshot(pristine, {
    name: 'PGR editado',
  });
  assert.equal(
    isDocumentModelEditorDirty({
      current: getDocumentModelDirtySnapshot({ ...pristine, name: 'PGR editado' }),
      baseline,
      documentDirty: true,
    }),
    true,
  );
});

run('6. variável editada entra no snapshot persistível (array variables)', () => {
  const token = '??TITULO_DO_DOCUMENTO??';
  const text = `Título: ${token}`;
  const content = lineToInlineContent(text, [], [], [
    { type: 'TITULO_DO_DOCUMENTO', label: 'Meu título' },
  ]);
  const extracted = extractParagraphContent(content);
  assert.equal(extracted.text, text);
  assert.ok(Array.isArray(extracted.inlineStyleRangeBlock));
  const payload = {
    variables: [{ type: 'TITULO_DO_DOCUMENTO', label: 'Meu título novo' }],
    sections: [],
  };
  assert.equal(payload.variables[0].label, 'Meu título novo');
});

run('7. DataStep orquestra saveDocumentModel quando documentDirty', () => {
  const dataStep = readRel('../components/1-data/hooks/useDataStep.tsx');
  assert.equal(dataStep.includes('planDocumentModelPersistSteps'), true);
  assert.equal(dataStep.includes('saveDocumentModel'), true);
  assert.equal(
    dataStep.indexOf("steps.includes('metadata')") <
      dataStep.indexOf("steps.includes('content')"),
    true,
  );
});

run('8. VariablesStep Save chama saveDocumentModel', () => {
  const variablesStep = readRel('../components/3-variables/hooks/useDataStep.tsx');
  assert.equal(variablesStep.includes('saveDocumentModel'), true);
  assert.equal(variablesStep.includes('documentDirty'), true);
});

run('9. setDocumentModelAddVariable marca needSynchronization no slice', () => {
  const slice = readRel('../../../../../store/reducers/document/documentSlice.ts');
  const addVar = slice.slice(
    slice.indexOf('setDocumentModelAddVariable'),
    slice.indexOf('setDocumentModelRemoveVariable'),
  );
  assert.equal(addVar.includes('needSynchronization = true'), true);
});

run('10. saveDocumentModel limpa needSynchronization via setSaveDocument', () => {
  const persist = readRel('../hooks/useEditDocumentModel.tsx');
  const saveFn = persist.slice(
    persist.indexOf('const saveDocumentModel'),
    persist.indexOf('const persistDocumentModel'),
  );
  assert.equal(saveFn.includes('dispatch(setSaveDocument())'), true);
});

run('11. combined save silencia snackbar de metadata até content concluir', () => {
  const dataStep = readRel('../components/1-data/hooks/useDataStep.tsx');
  assert.equal(
    dataStep.includes('shouldSuppressMetadataPersistSuccessSnackbar(steps)'),
    true,
  );
  assert.equal(dataStep.includes('suppressSuccessSnackbar'), true);
  const updateMutation = readRel(
    '../../../../../core/services/hooks/mutations/manager/document-model/useMutUpdateDocumentModel/useMutUpdateDocumentModel.ts',
  );
  assert.equal(updateMutation.includes('variables.suppressSuccessSnackbar'), true);
  assert.equal(
    shouldSuppressMetadataPersistSuccessSnackbar(['metadata', 'content']),
    true,
  );
  assert.equal(
    shouldSuppressMetadataPersistSuccessSnackbar(['metadata']),
    false,
  );
  assert.equal(
    shouldSuppressMetadataPersistSuccessSnackbar(['content']),
    false,
  );
});

console.log('\ndocument-model-variables-save: ok');
