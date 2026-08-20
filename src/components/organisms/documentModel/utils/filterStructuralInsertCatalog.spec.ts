/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/utils/filterStructuralInsertCatalog.spec.ts
 */
import assert from 'assert';

import {
  filterInsertableContentElements,
  filterInsertableStructuralSections,
  getStructuralSectionDefaults,
  hasInsertableContentCatalog,
  hasInsertableStructuralCatalog,
  isDynamicStructuralChildElement,
} from './filterStructuralInsertCatalog';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const SECTION = 'SECTION';
const COVER = 'COVER';
const TOC = 'TOC';
const CHAPTER = 'CHAPTER';
const APR = 'APR';
const PARAGRAPH = 'PARAGRAPH';
const SECTION_BREAK = 'SECTION_BREAK';
const APR_TABLE = 'APR_TABLE';

const sectionsCatalog = {
  [SECTION]: {
    type: SECTION,
    label: 'SEÇÃO',
    isSection: true,
    accept: [],
    order: 1,
  },
  [COVER]: {
    type: COVER,
    label: 'CAPA DO DOCUMENTO',
    isBreakSection: true,
    accept: [],
    order: 3,
  },
  [TOC]: {
    type: TOC,
    label: 'SÚMARIO',
    isBreakSection: true,
    accept: [],
    order: 3,
  },
  [CHAPTER]: {
    type: CHAPTER,
    label: 'PÁGINA DE CAPÍTULO',
    isBreakSection: true,
    accept: [],
    order: 2,
  },
  [APR]: {
    type: APR,
    label: 'Inventário de Riscos',
    accept: [],
    order: 4,
  },
  INACTIVE_BLOCK: {
    type: 'INACTIVE_BLOCK',
    label: 'Inativo',
    active: false,
    accept: [],
    order: 5,
  },
} as any;

const elementsCatalog = {
  [PARAGRAPH]: {
    type: PARAGRAPH,
    label: 'Parágrafo',
    isParagraph: true,
  },
  [SECTION_BREAK]: {
    type: SECTION_BREAK,
    label: 'Quebra de Seção',
  },
  [APR_TABLE]: {
    type: APR_TABLE,
    label: 'Tabela APR',
  },
  INACTIVE_ELEMENT: {
    type: 'INACTIVE_ELEMENT',
    label: 'Inativo',
    active: false,
  },
} as any;

run('structural catalog includes SECTION, COVER, TOC, CHAPTER and APR', () => {
  const filtered = filterInsertableStructuralSections(sectionsCatalog);
  const types = Object.keys(filtered);

  assert(types.includes(SECTION));
  assert(types.includes(COVER));
  assert(types.includes(TOC));
  assert(types.includes(CHAPTER));
  assert(types.includes(APR));
  assert(!types.includes('INACTIVE_BLOCK'));
});

run('structural catalog excludes only inactive entries', () => {
  assert(hasInsertableStructuralCatalog(sectionsCatalog));
  assert(!hasInsertableStructuralCatalog({} as any));
});

run('content catalog includes paragraph and section break', () => {
  const filtered = filterInsertableContentElements(elementsCatalog);
  const types = Object.keys(filtered);

  assert(types.includes(PARAGRAPH));
  assert(types.includes(SECTION_BREAK));
  assert(!types.includes(APR_TABLE));
  assert(!types.includes('INACTIVE_ELEMENT'));
});

run('dynamic child elements are classified as structural children', () => {
  assert(
    isDynamicStructuralChildElement(
      APR_TABLE,
      elementsCatalog[APR_TABLE],
    ),
  );
  assert(
    !isDynamicStructuralChildElement(
      PARAGRAPH,
      elementsCatalog[PARAGRAPH],
    ),
  );
});

run('SECTION defaults include hasChildren', () => {
  const defaults = getStructuralSectionDefaults(SECTION, sectionsCatalog);
  assert.strictEqual(defaults.hasChildren, true);
  assert.strictEqual(defaults.text, undefined);
});

run('COVER/TOC/CHAPTER defaults do not force hasChildren', () => {
  [COVER, TOC, CHAPTER].forEach((type) => {
    const defaults = getStructuralSectionDefaults(type, sectionsCatalog);
    assert.strictEqual(defaults.hasChildren, undefined);
  });
});

run('content catalog availability helper', () => {
  assert(hasInsertableContentCatalog(elementsCatalog));
  assert(!hasInsertableContentCatalog({} as any));
});

console.log('\nAll filterStructuralInsertCatalog tests passed.');
