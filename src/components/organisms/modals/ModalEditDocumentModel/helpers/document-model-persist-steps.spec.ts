/**
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/modals/ModalEditDocumentModel/helpers/document-model-persist-steps.spec.ts
 */
import assert from 'assert';

import {
  planDocumentModelPersistSteps,
  shouldSuppressMetadataPersistSuccessSnackbar,
} from './document-model-persist-steps';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

run('create model persists metadata only', () => {
  assert.deepEqual(
    planDocumentModelPersistSteps({
      hasModelId: false,
      isMetadataDirty: true,
      documentDirty: true,
    }),
    ['metadata'],
  );
});

run('variables only → content step', () => {
  assert.deepEqual(
    planDocumentModelPersistSteps({
      hasModelId: true,
      isMetadataDirty: false,
      documentDirty: true,
    }),
    ['content'],
  );
});

run('nothing dirty → empty plan', () => {
  assert.deepEqual(
    planDocumentModelPersistSteps({
      hasModelId: true,
      isMetadataDirty: false,
      documentDirty: false,
    }),
    [],
  );
});

run('metadata only → show metadata success snackbar', () => {
  const steps = planDocumentModelPersistSteps({
    hasModelId: true,
    isMetadataDirty: true,
    documentDirty: false,
  });
  assert.deepEqual(steps, ['metadata']);
  assert.equal(shouldSuppressMetadataPersistSuccessSnackbar(steps), false);
});

run('content only → show content success snackbar', () => {
  const steps = planDocumentModelPersistSteps({
    hasModelId: true,
    isMetadataDirty: false,
    documentDirty: true,
  });
  assert.deepEqual(steps, ['content']);
  assert.equal(shouldSuppressMetadataPersistSuccessSnackbar(steps), false);
});

run('metadata + content → suppress metadata snackbar, one final success', () => {
  const steps = planDocumentModelPersistSteps({
    hasModelId: true,
    isMetadataDirty: true,
    documentDirty: true,
  });
  assert.deepEqual(steps, ['metadata', 'content']);
  assert.equal(shouldSuppressMetadataPersistSuccessSnackbar(steps), true);
});

console.log('\ndocument-model-persist-steps: ok');
