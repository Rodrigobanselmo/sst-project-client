/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/modals/ModalAddCharacterization/hooks/characterization-editor-dirty.spec.ts
 */
import assert from 'assert';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { isCharacterizationEditorDirty } from './characterization-editor-dirty';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const baseline = {
  id: 'char-1',
  name: 'Sala',
  description: 'desc',
  type: 'OFFICE',
  profiles: [{ id: 'p1' }],
  photos: [{ id: 'ph1' }, { id: 'ph2' }],
};

run('open without edits is pristine', () => {
  assert.equal(
    isCharacterizationEditorDirty({
      current: baseline,
      baseline,
      form: { name: 'Sala', description: 'desc', type: 'OFFICE' },
      photoCount: 2,
      baselinePhotoCount: 2,
    }),
    false,
  );
});

run('persistent field edit is dirty', () => {
  assert.equal(
    isCharacterizationEditorDirty({
      current: baseline,
      baseline,
      form: { name: 'Sala 2', description: 'desc', type: 'OFFICE' },
      photoCount: 2,
      baselinePhotoCount: 2,
    }),
    true,
  );
});

run('photo count change is dirty', () => {
  assert.equal(
    isCharacterizationEditorDirty({
      current: { ...baseline, photos: [...baseline.photos, { id: 'ph3' }] },
      baseline,
      form: { name: 'Sala', description: 'desc', type: 'OFFICE' },
      photoCount: 3,
      baselinePhotoCount: 2,
    }),
    true,
  );
});

run('structured description paragraphs are dirty', () => {
  assert.equal(
    isCharacterizationEditorDirty({
      current: { ...baseline, paragraphs: ['novo'] },
      baseline,
      form: { name: 'Sala', description: 'desc', type: 'OFFICE' },
      photoCount: 2,
      baselinePhotoCount: 2,
    }),
    true,
  );
});

run('same photo count with different array identity is pristine', () => {
  assert.equal(
    isCharacterizationEditorDirty({
      current: { ...baseline, photos: [{ id: 'ph1' }, { id: 'ph2' }] },
      baseline,
      form: { name: 'Sala', description: 'desc', type: 'OFFICE' },
      photoCount: 2,
      baselinePhotoCount: 2,
    }),
    false,
  );
});

run('profile change is dirty', () => {
  assert.equal(
    isCharacterizationEditorDirty({
      current: { ...baseline, profiles: [{ id: 'p1' }, { id: 'p2' }] },
      baseline,
      form: { name: 'Sala', description: 'desc', type: 'OFFICE' },
      photoCount: 2,
      baselinePhotoCount: 2,
    }),
    true,
  );
});

run('type/classificação edit is dirty', () => {
  assert.equal(
    isCharacterizationEditorDirty({
      current: baseline,
      baseline,
      form: { name: 'Sala', description: 'desc', type: 'GENERAL' },
      photoCount: 2,
      baselinePhotoCount: 2,
    }),
    true,
  );
});

run('inventory summary edit is dirty', () => {
  assert.equal(
    isCharacterizationEditorDirty({
      current: baseline,
      baseline,
      form: {
        name: 'Sala',
        description: 'desc',
        type: 'OFFICE',
        riskInventorySummary: 'resumo novo',
      },
      photoCount: 2,
      baselinePhotoCount: 2,
    }),
    true,
  );
});

run('activities/work process edit is dirty', () => {
  assert.equal(
    isCharacterizationEditorDirty({
      current: { ...baseline, activities: ['solda'] },
      baseline,
      form: { name: 'Sala', description: 'desc', type: 'OFFICE' },
      photoCount: 2,
      baselinePhotoCount: 2,
    }),
    true,
  );
});

run('environmental parameter edit is dirty', () => {
  assert.equal(
    isCharacterizationEditorDirty({
      current: baseline,
      baseline,
      form: {
        name: 'Sala',
        description: 'desc',
        type: 'OFFICE',
        noiseValue: '85',
      },
      photoCount: 2,
      baselinePhotoCount: 2,
    }),
    true,
  );
});

run('reverting name to baseline is pristine', () => {
  assert.equal(
    isCharacterizationEditorDirty({
      current: baseline,
      baseline,
      form: { name: 'Sala', description: 'desc', type: 'OFFICE' },
      photoCount: 2,
      baselinePhotoCount: 2,
    }),
    false,
  );
});

run('transient saveRef is ignored because it is not in the snapshot', () => {
  assert.equal(
    isCharacterizationEditorDirty({
      current: baseline,
      baseline,
      form: { name: 'Sala', description: 'desc', type: 'OFFICE' },
      photoCount: 2,
      baselinePhotoCount: 2,
    }),
    false,
  );
});

const pageSource = readFileSync(
  resolve(
    'src/@v2/pages/companies/characterization-edit/CharacterizationEditView.tsx',
  ),
  'utf8',
);
run('real characterization edit page subscribes to live form and state for button color', () => {
  assert.equal(pageSource.includes('useWatch'), true);
  assert.equal(pageSource.includes('liveForm'), true);
  assert.equal(pageSource.includes('characterizationData'), true);
  assert.equal(pageSource.includes('editorBaseline'), true);
  assert.equal(pageSource.includes('isCharacterizationEditorDirty'), true);
  assert.equal(pageSource.includes('hasUnsavedChanges'), true);
  assert.equal(pageSource.includes('getSaveActionColor'), true);
  assert.equal(pageSource.includes('saveActionColor'), true);
  assert.equal(pageSource.includes('color={saveActionColor}'), true);
  assert.equal(pageSource.includes("saveRef.current = true"), true);
  assert.equal(pageSource.includes("saveRef.current = false"), true);
});

const tabSource = readFileSync(
  resolve(
    'src/@v2/pages/companies/characterizations/components/CharacterizationEnvironmentsTabContent/CharacterizationEnvironmentsTabContent.tsx',
  ),
  'utf8',
);
run('elementos caracterizados tab mounts CharacterizationEditView', () => {
  assert.equal(tabSource.includes('CharacterizationEditView'), true);
});

const modalSource = readFileSync(
  resolve('src/components/organisms/modals/ModalAddCharacterization/index.tsx'),
  'utf8',
);
run('characterization modal save buttons still use shared color helper', () => {
  assert.equal(modalSource.includes('getSaveActionColor'), true);
  assert.equal(modalSource.includes('saveActionColor'), true);
});

const hookSource = readFileSync(
  resolve(
    'src/components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization.tsx',
  ),
  'utf8',
);
run('hook uses useWatch and freezes baseline after hydration', () => {
  assert.equal(hookSource.includes('useWatch({ control })'), true);
  assert.equal(hookSource.includes('isCharacterizationEditorDirty'), true);
  assert.equal(hookSource.includes('hasUnsavedChanges'), true);
  assert.equal(hookSource.includes('editorBaseline'), true);
  assert.equal(hookSource.includes('isHydratingRef'), true);
  assert.equal(hookSource.includes('if (!isHydratingRef.current) return;'), true);
  assert.equal(hookSource.includes('preventDiscardIf'), true);
});

console.log('\nAll characterization-editor-dirty tests passed.');
