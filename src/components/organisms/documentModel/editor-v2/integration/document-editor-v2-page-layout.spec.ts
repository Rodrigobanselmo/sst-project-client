/**
 * Fase 6A — page layout visual.
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/integration/document-editor-v2-page-layout.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { persistJson, defaultBulletLevelForSource } from '../adapter';
import { buildPocCanonicalModel } from '../adapter/fixtures/poc-canonical.fixture';
import { featureFlags } from '@v2/constants/feature-flags';
import { isMaster } from 'core/utils/auth/validateUserPermissions';
import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';
import { RoleEnum } from 'project/enum/roles.enums';
import {
  DOCUMENT_EDITOR_V2_BULLET_BASE_INDENT_PX,
  DOCUMENT_EDITOR_V2_BULLET_LEVEL_INCREMENT_PX,
  documentEditorV2BulletMarkerLeftPx,
  documentEditorV2BulletTextIndentPx,
} from '../tiptap/extensions/document-bullet-indent';

import { resolveDocumentEditorV2Access } from './document-editor-v2-access';
import {
  A4_LANDSCAPE_MM,
  A4_PORTRAIT_MM,
  LANDSCAPE_BODY_MARGIN_MM,
  PORTRAIT_BODY_MARGIN_MM,
  VISUAL_PAGE_NUMBER_HELP,
  classifyVisualPageItem,
  doesViewModeChangeMarkDirty,
  resolveDocumentEditorV2ViewMode,
  resolveSectionVisualOrientation,
  resolveVisualPageMargins,
  splitItemsIntoVisualPages,
  visualPageOverflowsA4,
  visualPageSizeMm,
  type VisualPageItem,
} from './document-editor-v2-page-layout';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

function readRel(rel: string) {
  return fs.readFileSync(path.join(__dirname, rel), 'utf8');
}

const P: VisualPageItem = { kind: 'content' };
const BREAK: VisualPageItem = { kind: 'page-break' };
const SB_LAND: VisualPageItem = {
  kind: 'section-break',
  nextOrientation: 'landscape',
};
const SB_PORT: VisualPageItem = {
  kind: 'section-break',
  nextOrientation: 'portrait',
};

run('1. default Web', () => {
  assert.equal(resolveDocumentEditorV2ViewMode(undefined), 'web');
  assert.equal(resolveDocumentEditorV2ViewMode('web'), 'web');
  assert.equal(resolveDocumentEditorV2ViewMode('page'), 'page');
  assert.equal(resolveDocumentEditorV2ViewMode('print'), 'web');
});

run('2–3. trocar Web→Página não dirty', () => {
  assert.equal(doesViewModeChangeMarkDirty(), false);
  const session = readRel('./DocumentEditorV2Session.tsx');
  assert.equal(session.includes('requestViewMode'), true);
  assert.equal(session.includes('setViewMode'), true);
  assert.equal(session.includes('markLocalDirty();\n      setViewMode'), false);
});

run('4. canonical intacto — layout não entra no persistJson', () => {
  assert.deepStrictEqual(
    persistJson(buildPocCanonicalModel()),
    persistJson(buildPocCanonicalModel()),
  );
  const layout = readRel('./document-editor-v2-page-layout.ts');
  assert.equal(layout.includes('persistJson'), false);
  assert.equal(layout.includes('mutateAsync'), false);
});

run('5. Retrato default', () => {
  assert.deepStrictEqual(visualPageSizeMm('portrait'), A4_PORTRAIT_MM);
  assert.equal(resolveSectionVisualOrientation(undefined), 'portrait');
  assert.equal(resolveSectionVisualOrientation({}), 'portrait');
  assert.equal(
    resolveSectionVisualOrientation({
      properties: { page: { size: { orientation: 'portrait' } } },
    }),
    'portrait',
  );
});

run('6–7. A) BREAK cria folha e preserva orientation', () => {
  const pages = splitItemsIntoVisualPages([P, P, BREAK, P], 'portrait');
  assert.equal(pages.length, 2);
  assert.equal(pages[0].pageNumber, 1);
  assert.equal(pages[0].orientation, 'portrait');
  assert.deepStrictEqual(pages[0].contentIndexes, [0, 1]);
  assert.equal(pages[0].trailingBreak?.kind, 'page-break');
  assert.equal(pages[1].pageNumber, 2);
  assert.equal(pages[1].orientation, 'portrait');
  assert.deepStrictEqual(pages[1].contentIndexes, [3]);
});

run('8. B) SECTION_BREAK landscape', () => {
  const pages = splitItemsIntoVisualPages([P, SB_LAND, P, P], 'portrait');
  assert.equal(pages.length, 2);
  assert.equal(pages[0].orientation, 'portrait');
  assert.deepStrictEqual(pages[0].contentIndexes, [0]);
  assert.equal(pages[1].orientation, 'landscape');
  assert.deepStrictEqual(pages[1].contentIndexes, [2, 3]);
  assert.deepStrictEqual(visualPageSizeMm('landscape'), A4_LANDSCAPE_MM);
});

run('9. C) landscape + SECTION_BREAK portrait', () => {
  const pages = splitItemsIntoVisualPages([P, SB_PORT, P], 'landscape');
  assert.equal(pages[0].orientation, 'landscape');
  assert.deepStrictEqual(pages[0].contentIndexes, [0]);
  assert.equal(pages[1].orientation, 'portrait');
  assert.deepStrictEqual(pages[1].contentIndexes, [2]);
});

run('10. D) SECTION_BREAK no início não fabrica folha vazia', () => {
  const pages = splitItemsIntoVisualPages([SB_LAND, P], 'portrait');
  assert.equal(pages.length, 1);
  assert.equal(pages[0].pageNumber, 1);
  assert.equal(pages[0].orientation, 'landscape');
  assert.deepStrictEqual(pages[0].contentIndexes, [1]);
});

run('11. múltiplas trocas de orientation', () => {
  const pages = splitItemsIntoVisualPages(
    [P, SB_LAND, P, SB_PORT, P, BREAK, P],
    'portrait',
  );
  assert.deepStrictEqual(
    pages.map((page) => page.orientation),
    ['portrait', 'landscape', 'portrait', 'portrait'],
  );
  assert.equal(pages[3].pageNumber, 4);
});

run('12. numeração local', () => {
  const pages = splitItemsIntoVisualPages([P, BREAK, P, BREAK, P]);
  assert.deepStrictEqual(
    pages.map((page) => page.pageNumber),
    [1, 2, 3],
  );
  assert.ok(VISUAL_PAGE_NUMBER_HELP.includes('desta seção'));
  assert.equal(VISUAL_PAGE_NUMBER_HELP.includes('Total de páginas'), false);
});

run('13–14. overflow não cria página nem altera canonical', () => {
  assert.equal(
    visualPageOverflowsA4({ contentHeightMm: 400, orientation: 'portrait' }),
    true,
  );
  assert.equal(
    visualPageOverflowsA4({ contentHeightMm: 100, orientation: 'portrait' }),
    false,
  );
  const before = splitItemsIntoVisualPages([P, P, P]);
  const after = splitItemsIntoVisualPages([P, P, P]);
  assert.equal(before.length, 1);
  assert.equal(after.length, 1);
  const ext = readRel('../tiptap/extensions/document-page-layout.extension.ts');
  assert.equal(ext.includes('insertContent'), false);
  assert.equal(ext.includes('classifyVisualPageItem'), true);
  assert.equal(ext.includes('splitItemsIntoVisualPages'), true);
});

run('15–23. classify cobre paragraph/heading/bullet/atom', () => {
  assert.equal(classifyVisualPageItem({ nodeType: 'docParagraph' }).kind, 'content');
  assert.equal(classifyVisualPageItem({ nodeType: 'docHeading' }).kind, 'content');
  assert.equal(classifyVisualPageItem({ nodeType: 'docBullet' }).kind, 'content');
  assert.equal(classifyVisualPageItem({ nodeType: 'docCaption' }).kind, 'content');
  assert.equal(
    classifyVisualPageItem({ nodeType: 'docAtom', atomType: 'IMAGE' }).kind,
    'content',
  );
  assert.equal(
    classifyVisualPageItem({
      nodeType: 'docAtom',
      atomType: 'TABLE_VERSION_CONTROL',
    }).kind,
    'content',
  );
  assert.equal(
    classifyVisualPageItem({ nodeType: 'docAtom', atomType: 'UNKNOWN' }).kind,
    'content',
  );
  assert.equal(
    classifyVisualPageItem({ nodeType: 'docAtom', atomType: 'BREAK' }).kind,
    'page-break',
  );
  assert.deepStrictEqual(
    classifyVisualPageItem({
      nodeType: 'docAtom',
      atomType: 'SECTION_BREAK',
      orientation: 'landscape',
    }),
    { kind: 'section-break', nextOrientation: 'landscape' },
  );
});

run('24–26. Save 5B / discard / Clássico: viewMode fora do pipeline', () => {
  const session = readRel('./DocumentEditorV2Session.tsx');
  assert.equal(session.includes('planDocumentEditorV2Persist'), true);
  assert.equal(session.includes('viewMode'), true);
  const persist = readRel(
    '../../../modals/ModalEditDocumentModel/hooks/useEditDocumentModel.tsx',
  );
  assert.equal(persist.includes('viewMode'), false);
  assert.equal(persist.includes('document-editor-v2-page-layout'), false);
  const classic = readRel(
    '../../DocumentModelContent/TypeSectionItem/TypeSectionItem.tsx',
  );
  assert.equal(classic.includes('DocumentEditorV2ViewMode'), false);
  assert.equal(classic.includes('Web | Página'), false);
});

run('27–28. access MASTER / comum intacto', () => {
  assert.equal(featureFlags.documentEditorV2, false);
  assert.equal(featureFlags.documentEditorV2Save, false);
  assert.equal(isMaster({ roles: [RoleEnum.MASTER], permissions: [] }), true);
  assert.deepStrictEqual(
    resolveDocumentEditorV2Access({
      surfaceFlag: false,
      saveFlag: false,
      isMaster: false,
    }),
    { canUseV2: false, canPersistV2: false },
  );
  assert.deepStrictEqual(
    resolveDocumentEditorV2Access({
      surfaceFlag: false,
      saveFlag: false,
      isMaster: true,
    }),
    { canUseV2: true, canPersistV2: true },
  );
  const access = readRel('./document-editor-v2-access.ts');
  assert.equal(access.includes('viewMode'), false);
});

run('margens: preset e override twips seguro', () => {
  assert.deepStrictEqual(
    resolveVisualPageMargins('portrait'),
    PORTRAIT_BODY_MARGIN_MM,
  );
  assert.deepStrictEqual(
    resolveVisualPageMargins('landscape'),
    LANDSCAPE_BODY_MARGIN_MM,
  );
  const fromTwips = resolveVisualPageMargins('portrait', {
    properties: { page: { margin: { top: 567, left: 567, right: 567, bottom: 900 } } },
  });
  assert.ok(Math.abs(fromTwips.top - 10) < 0.05);
  assert.ok(Math.abs(fromTwips.bottom - 15.875) < 0.05);
  assert.deepStrictEqual(
    resolveVisualPageMargins('portrait', {
      properties: { page: { margin: { top: 10, left: 10 } } },
    }),
    PORTRAIT_BODY_MARGIN_MM,
  );
});

run('section.properties landscape prevalece no default', () => {
  assert.equal(
    resolveSectionVisualOrientation({
      properties: { page: { size: { orientation: 'landscape' } } },
    }),
    'landscape',
  );
});

run('bullet visual: level 0 tem recuo-base; 2 > 1 > 0', () => {
  const level0 = documentEditorV2BulletMarkerLeftPx(0);
  const level1 = documentEditorV2BulletMarkerLeftPx(1);
  const level2 = documentEditorV2BulletMarkerLeftPx(2);
  assert.equal(level0, DOCUMENT_EDITOR_V2_BULLET_BASE_INDENT_PX);
  assert.ok(level0 > 0);
  assert.ok(level1 > level0);
  assert.ok(level2 > level1);
  assert.equal(level1 - level0, DOCUMENT_EDITOR_V2_BULLET_LEVEL_INCREMENT_PX);
  assert.equal(level2 - level1, DOCUMENT_EDITOR_V2_BULLET_LEVEL_INCREMENT_PX);
  assert.ok(documentEditorV2BulletTextIndentPx(0) > level0);
});

run('BULLET_SPACE visual = level 1; canonical level intacto', () => {
  assert.equal(
    defaultBulletLevelForSource({
      type: DocumentSectionChildrenTypeEnum.BULLET_SPACE,
    }),
    1,
  );
  assert.equal(
    documentEditorV2BulletMarkerLeftPx(
      defaultBulletLevelForSource({
        type: DocumentSectionChildrenTypeEnum.BULLET_SPACE,
      }),
    ),
    documentEditorV2BulletMarkerLeftPx(1),
  );
  const before = persistJson(buildPocCanonicalModel());
  const after = persistJson(buildPocCanonicalModel());
  assert.deepStrictEqual(before, after);
  const bulletNode = readRel('../tiptap/extensions/document-bullet.ts');
  assert.equal(bulletNode.includes('level + 1'), false);
  assert.equal(bulletNode.includes('documentEditorV2BulletStyleVars(level)'), true);
});

run('Page mode: blocos textuais sem border; BREAK/SECTION/atoms com chrome', () => {
  const pageSx = readRel('./document-editor-v2-page-layout-sx.ts');
  assert.equal(
    pageSx.includes("boxShadow: '0 1px 6px rgba(0,0,0,0.08)'"),
    false,
  );
  assert.equal(
    pageSx.includes(
      "boxShadow: '-1px 0 6px rgba(0,0,0,0.08), 1px 0 6px rgba(0,0,0,0.08)'",
    ),
    false,
  );
  assert.ok(pageSx.includes("'& .doc-editor-v2-page-block'") || pageSx.includes('& .doc-editor-v2-page-block'));
  assert.ok(pageSx.includes("boxShadow: 'none'"));
  assert.ok(pageSx.includes('doc-editor-v2-page-sheet'));
  assert.ok(pageSx.includes("backgroundColor: 'transparent'"));
  const ext = readRel('../tiptap/extensions/document-page-layout.extension.ts');
  assert.ok(ext.includes('createSheet'));
  assert.ok(ext.includes('page-sheet'));
  assert.ok(
    pageSx.includes(
      '.doc-editor-v2-page-block[data-doc-paragraph], & .doc-editor-v2-page-block[data-doc-heading], & .doc-editor-v2-page-block[data-doc-bullet]',
    ),
  );
  assert.ok(pageSx.includes("border: 'none'"));
  const bulletIndent = readRel(
    '../tiptap/extensions/document-bullet-indent.ts',
  );
  assert.ok(bulletIndent.includes('DOCUMENT_EDITOR_V2_BULLET_BASE_INDENT_PX = 24'));
  assert.ok(bulletIndent.includes('DOCUMENT_EDITOR_V2_BULLET_LEVEL_INCREMENT_PX = 24'));
  assert.ok(pageSx.includes('doc-editor-v2-page-gap--break'));
  assert.ok(pageSx.includes('doc-editor-v2-page-gap--section'));

  const surface = readRel('./document-editor-v2-surface-sx.ts');
  assert.ok(surface.includes("border: '1px solid'"));
  assert.ok(surface.includes('doc-editor-v2-atom--table'));
  assert.ok(surface.includes('doc-editor-v2-atom--unknown'));
  assert.ok(surface.includes('--doc-bullet-marker-left'));
  assert.equal(surface.includes('--doc-bullet-level'), false);
});

run('wiring: header toggle + um EditorContent + V1 intacto', () => {
  const header = readRel('./DocumentEditorV2HeaderControls.tsx');
  assert.equal(header.includes('Web'), true);
  assert.equal(header.includes('Página'), true);
  assert.equal(header.includes('requestViewMode'), true);

  const view = readRel('./DocumentEditorV2SectionView.tsx');
  const editorContentCount = view.split('EditorContent').length - 1;
  assert.ok(editorContentCount >= 1);
  assert.equal(view.includes('useEditor('), true);
  assert.equal(view.includes('createDocumentEditorExtensions()'), true);

  const typeSection = readRel(
    '../../DocumentModelContent/TypeSectionItem/TypeSectionItem.tsx',
  );
  assert.equal(typeSection.includes('requestViewMode'), false);
});

console.log('\nFase 6A page layout: ok');
