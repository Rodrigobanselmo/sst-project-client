/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/utils/documentModelInsertVisuals.spec.ts
 */
import assert from 'assert';

import CropLandscapeOutlinedIcon from '@mui/icons-material/CropLandscapeOutlined';
import CropPortraitOutlinedIcon from '@mui/icons-material/CropPortraitOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';

import { DocModelPageOrientation } from 'core/interfaces/api/IDocumentModel';

import {
  DOCUMENT_MODEL_INSERT_VISUAL,
  resolveContentElementInsertIcon,
  resolveStructuralSectionInsertIcon,
  withContentInsertOptionIcon,
  withStructuralInsertOptionIcon,
} from './documentModelInsertVisuals';
import { filterInsertableContentElements } from './filterStructuralInsertCatalog';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

run('content and structure button visuals use distinct theme tokens', () => {
  assert.notStrictEqual(
    DOCUMENT_MODEL_INSERT_VISUAL.content.borderActive,
    DOCUMENT_MODEL_INSERT_VISUAL.structure.borderActive,
  );
  assert.notStrictEqual(
    DOCUMENT_MODEL_INSERT_VISUAL.content.buttonIcon,
    DOCUMENT_MODEL_INSERT_VISUAL.structure.buttonIcon,
  );
});

run('known content types resolve specific icons', () => {
  assert.strictEqual(
    resolveContentElementInsertIcon('PARAGRAPH'),
    NotesOutlinedIcon,
  );
  assert.strictEqual(
    resolveContentElementInsertIcon('SECTION_BREAK', {
      orientation: DocModelPageOrientation.LANDSCAPE,
    }),
    CropLandscapeOutlinedIcon,
  );
  assert.strictEqual(
    resolveContentElementInsertIcon('SECTION_BREAK', {
      orientation: DocModelPageOrientation.PORTRAIT,
    }),
    CropPortraitOutlinedIcon,
  );
});

run('unknown content type uses fallback icon', () => {
  assert.strictEqual(
    resolveContentElementInsertIcon('FUTURE_CONTENT_TYPE'),
    TextFieldsOutlinedIcon,
  );
});

run('structural types include SECTION, COVER, TOC and CHAPTER', () => {
  assert.strictEqual(
    resolveStructuralSectionInsertIcon('SECTION', { isSection: true }),
    ViewAgendaOutlinedIcon,
  );
  assert(resolveStructuralSectionInsertIcon('COVER', { isBreakSection: true }));
  assert(resolveStructuralSectionInsertIcon('TOC', { isBreakSection: true }));
  assert(resolveStructuralSectionInsertIcon('CHAPTER', { isBreakSection: true }));
});

run('unknown structural type uses fallback icon', () => {
  assert.strictEqual(
    resolveStructuralSectionInsertIcon('FUTURE_STRUCTURAL'),
    LayersOutlinedIcon,
  );
});

run('option enrichers always attach an icon without dropping data', () => {
  const contentOption = withContentInsertOptionIcon({
    type: 'PARAGRAPH',
    label: 'Parágrafo',
    optionValue: 'PARAGRAPH',
  });
  assert.strictEqual(contentOption.label, 'Parágrafo');
  assert(contentOption.icon);

  const structuralOption = withStructuralInsertOptionIcon({
    type: 'APR_GROUP',
    label: 'Inventário de Riscos por GSE',
    isSection: false,
  });
  assert.strictEqual(structuralOption.label, 'Inventário de Riscos por GSE');
  assert(structuralOption.icon);
});

run('content filter still returns types without dedicated icons', () => {
  const elements = {
    PARAGRAPH: { type: 'PARAGRAPH', label: 'Parágrafo', isParagraph: true },
    CUSTOM_PARAGRAPH: {
      type: 'CUSTOM_PARAGRAPH',
      label: 'Custom',
      isParagraph: true,
    },
  } as any;

  const filtered = filterInsertableContentElements(elements);
  assert(Object.keys(filtered).includes('CUSTOM_PARAGRAPH'));
  assert(withContentInsertOptionIcon(filtered.CUSTOM_PARAGRAPH).icon);
});

console.log('\nAll documentModelInsertVisuals tests passed.');
