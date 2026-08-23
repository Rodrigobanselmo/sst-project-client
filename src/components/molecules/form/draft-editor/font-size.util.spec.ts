/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/molecules/form/draft-editor/font-size.util.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  convertFromRaw,
  convertToRaw,
  EditorState,
  RichUtils,
  SelectionState,
} from 'draft-js';

import { fingerprintDraftDefaultValue } from './draft-default-value.util';
import {
  FONT_SIZE_OPTIONS,
  getCurrentFontSize,
  isSelectionValidOnContent,
  parseFontSizeStyle,
  resolveApplySelection,
  resolveValidApplySelection,
  setSelectionFontSize,
  toFontSizeStyle,
} from './font-size.util';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const TEXT = 'ABCDE FGHIJ';

const fromRaw = (
  text: string,
  ranges: Array<{ offset: number; length: number; style: string }> = [],
  extras: {
    key?: string;
    entityRanges?: Array<{ offset: number; length: number; key: number }>;
    entityMap?: Record<string, unknown>;
    data?: Record<string, unknown>;
  } = {},
) =>
  EditorState.createWithContent(
    convertFromRaw({
      blocks: [
        {
          key: extras.key || 'a',
          text,
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: ranges as never,
          entityRanges: extras.entityRanges || [],
          data: extras.data || {},
        },
      ],
      entityMap: (extras.entityMap || {}) as never,
    }),
  );

const selectRange = (
  editorState: EditorState,
  start: number,
  end: number,
): EditorState => {
  const key = editorState.getCurrentContent().getFirstBlock().getKey();
  const selection = SelectionState.createEmpty(key).merge({
    anchorOffset: start,
    focusOffset: end,
  }) as SelectionState;
  return EditorState.forceSelection(editorState, selection);
};

const collapseAt = (editorState: EditorState, offset: number): EditorState =>
  selectRange(editorState, offset, offset);

const stylesAt = (editorState: EditorState, offset: number) =>
  editorState.getCurrentContent().getFirstBlock().getInlineStyleAt(offset);

const hasFontSize = (
  editorState: EditorState,
  offset: number,
  size: number,
) => stylesAt(editorState, offset).has(toFontSizeStyle(size));

const toCanonicalFontSize = (editorState: EditorState) =>
  convertToRaw(editorState.getCurrentContent())
    .blocks[0].inlineStyleRanges.filter((range) =>
      range.style.includes('fontsize'),
    )
    .map((range) => ({
      style: 'FONTSIZE',
      offset: range.offset,
      length: range.length,
      value: range.style.replace('fontsize-', ''),
    }));

const staleSelection = (key = 'missing-block') =>
  SelectionState.createEmpty(key).merge({
    anchorOffset: 6,
    focusOffset: 11,
  }) as SelectionState;

run('lista inclui 10.5 na posição correta', () => {
  assert.deepStrictEqual([...FONT_SIZE_OPTIONS], [
    6, 7, 7.5, 8, 9, 10, 10.5, 11, 12, 14, 16, 18, 24, 30, 36,
  ]);
});

run('1. abrir o menu não modifica o Draft (apply é separado)', () => {
  const state = selectRange(fromRaw(TEXT), 6, 11);
  const content = state.getCurrentContent();
  const selection = state.getSelection();
  getCurrentFontSize(state);
  assert.equal(state.getCurrentContent(), content);
  assert.equal(state.getSelection(), selection);
});

run('2. range permanece válido ao "abrir" no mesmo ContentState', () => {
  const state = selectRange(fromRaw(TEXT), 6, 11);
  const captured = state.getSelection();
  assert.equal(
    isSelectionValidOnContent(state.getCurrentContent(), captured),
    true,
  );
  const still = resolveValidApplySelection(
    state.getCurrentContent(),
    state.getSelection(),
    captured,
  );
  assert.ok(still);
  assert.equal(still.getStartOffset(), 6);
  assert.equal(still.getEndOffset(), 11);
});

run('3. seleção não colapsada + 36 aplica fontsize-36', () => {
  const selected = selectRange(fromRaw(TEXT), 0, TEXT.length);
  const next = setSelectionFontSize(selected, 36);
  assert.ok(hasFontSize(next, 0, 36));
  assert.ok(hasFontSize(next, 10, 36));
  assert.equal(getCurrentFontSize(next), 36);
});

run('4. 10.5 aplica fontsize-10.5', () => {
  const next = setSelectionFontSize(selectRange(fromRaw(TEXT), 0, 5), 10.5);
  assert.ok(hasFontSize(next, 0, 10.5));
  assert.ok(!hasFontSize(next, 6, 10.5));
});

run('5. seleção parcial só altera FGHIJ', () => {
  const selected = selectRange(fromRaw(TEXT), 6, 11);
  const next = setSelectionFontSize(selected, 36);
  assert.ok(!hasFontSize(next, 0, 36));
  assert.ok(!hasFontSize(next, 4, 36));
  assert.ok(hasFontSize(next, 6, 36));
  assert.ok(hasFontSize(next, 10, 36));
  const raw = convertToRaw(next.getCurrentContent()).blocks[0];
  const font = raw.inlineStyleRanges.find((range) =>
    range.style.startsWith('fontsize-'),
  );
  assert.equal(font?.offset, 6);
  assert.equal(font?.length, 5);
  assert.equal(font?.style, 'fontsize-36');
});

run('6. Bold / Italic / Underline / Color / Link preservados', () => {
  let state = fromRaw(
    TEXT,
    [
      { offset: 6, length: 5, style: 'color-#ff0000' },
    ],
    {
      entityRanges: [{ offset: 6, length: 5, key: 0 }],
      entityMap: {
        0: {
          type: 'LINK',
          mutability: 'MUTABLE',
          data: { url: 'https://example.com' },
        },
      },
    },
  );
  state = selectRange(state, 6, 11);
  state = RichUtils.toggleInlineStyle(state, 'BOLD');
  state = RichUtils.toggleInlineStyle(state, 'ITALIC');
  state = RichUtils.toggleInlineStyle(state, 'UNDERLINE');
  const next = setSelectionFontSize(state, 14);
  assert.ok(stylesAt(next, 6).has('BOLD'));
  assert.ok(stylesAt(next, 6).has('ITALIC'));
  assert.ok(stylesAt(next, 6).has('UNDERLINE'));
  assert.ok(stylesAt(next, 6).has('color-#ff0000'));
  assert.ok(hasFontSize(next, 6, 14));
  const raw = convertToRaw(next.getCurrentContent());
  assert.equal(raw.blocks[0].entityRanges[0].key, 0);
  assert.equal((raw.entityMap as any)[0].type, 'LINK');
});

run('7. troca 12 → 36 substitui FONTSIZE anterior', () => {
  const sized = setSelectionFontSize(selectRange(fromRaw(TEXT), 6, 11), 12);
  const next = setSelectionFontSize(selectRange(sized, 6, 11), 36);
  assert.ok(!hasFontSize(next, 6, 12));
  assert.ok(hasFontSize(next, 6, 36));
});

run('8. leitura de seleção uniforme mostra o valor', () => {
  const next = setSelectionFontSize(selectRange(fromRaw(TEXT), 6, 11), 12);
  assert.equal(getCurrentFontSize(selectRange(next, 6, 11)), 12);
  assert.equal(getCurrentFontSize(selectRange(next, 0, 5)), undefined);
});

run('9. seleção com dois tamanhos mostra —', () => {
  let state = setSelectionFontSize(selectRange(fromRaw(TEXT), 0, 5), 12);
  state = setSelectionFontSize(selectRange(state, 6, 11), 36);
  assert.equal(getCurrentFontSize(selectRange(state, 0, 11)), undefined);
});

run('stale salvo + live válido não anula o range atual', () => {
  const live = collapseAt(fromRaw(TEXT, [], { key: 'new-key' }), 6);
  const stale = staleSelection('old-key');
  const resolved = resolveValidApplySelection(
    live.getCurrentContent(),
    live.getSelection(),
    stale,
  );
  assert.ok(resolved);
  assert.equal(resolved.getStartKey(), 'new-key');
  assert.equal(resolved.isCollapsed(), true);
});

run('10. SelectionState stale não crasha e é no-op', () => {
  const remounted = selectRange(fromRaw(TEXT, [], { key: 'new-key' }), 6, 11);
  const stale = staleSelection('old-key');
  assert.equal(
    isSelectionValidOnContent(remounted.getCurrentContent(), stale),
    false,
  );
  assert.equal(
    resolveValidApplySelection(
      remounted.getCurrentContent(),
      remounted.getSelection(),
      stale,
    )?.getStartKey(),
    'new-key',
  );

  let threw = false;
  let next = remounted;
  try {
    next = setSelectionFontSize(remounted, 36, stale);
  } catch {
    threw = true;
  }
  assert.equal(threw, false);
  assert.equal(next, remounted);
  assert.ok(!hasFontSize(next, 6, 36));
});

run('11. Modifier não recebe key inexistente (sem getCharacterList)', () => {
  const empty = EditorState.createEmpty();
  const stale = staleSelection();
  const startBlock = empty
    .getCurrentContent()
    .getBlockForKey(stale.getStartKey());
  assert.equal(startBlock, undefined);

  let threw = false;
  try {
    setSelectionFontSize(empty, 36, stale);
  } catch {
    threw = true;
  }
  assert.equal(threw, false);
});

run('12. fingerprint ignora block key — re-render não é remount', () => {
  const a = {
    blocks: [
      {
        key: 'aaa',
        text: TEXT,
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [{ offset: 6, length: 5, style: 'fontsize-36' }],
        entityRanges: [],
        data: {},
      },
    ],
    entityMap: {},
  };
  const b = {
    ...a,
    blocks: [{ ...a.blocks[0], key: 'bbb' }],
  };
  assert.equal(fingerprintDraftDefaultValue(a), fingerprintDraftDefaultValue(b));
  assert.notEqual(
    fingerprintDraftDefaultValue(a),
    fingerprintDraftDefaultValue({
      ...a,
      blocks: [{ ...a.blocks[0], text: 'outro' }],
    }),
  );
});

run('13. Undo reverte fontsize-36', () => {
  const selected = selectRange(fromRaw(TEXT), 6, 11);
  const next = setSelectionFontSize(selected, 36);
  assert.ok(hasFontSize(next, 6, 36));
  const undone = EditorState.undo(next);
  assert.ok(!hasFontSize(undone, 6, 36));
});

run('14. Save raw / reopen reconhece FONTSIZE', () => {
  const next = setSelectionFontSize(selectRange(fromRaw(TEXT), 6, 11), 10.5);
  assert.deepStrictEqual(toCanonicalFontSize(next), [
    { style: 'FONTSIZE', offset: 6, length: 5, value: '10.5' },
  ]);
  const raw = convertToRaw(next.getCurrentContent());
  const reopened = selectRange(
    EditorState.createWithContent(convertFromRaw(raw)),
    6,
    11,
  );
  assert.equal(getCurrentFontSize(reopened), 10.5);
});

run('15. line-height / block data não é alterado', () => {
  const selected = selectRange(
    fromRaw(TEXT, [], { data: { lineHeight: 1.5 } }),
    6,
    11,
  );
  const before = selected.getCurrentContent().getFirstBlock().getData();
  const next = setSelectionFontSize(selected, 36);
  assert.deepStrictEqual(
    next.getCurrentContent().getFirstBlock().getData().toObject(),
    before.toObject(),
  );
});

run('seleção perdida pelo foco ainda usa o range original se válido', () => {
  const selected = selectRange(fromRaw(TEXT), 6, 11);
  const saved = selected.getSelection();
  const stolen = collapseAt(selected, 6);
  const target = resolveApplySelection(stolen.getSelection(), saved);
  const next = setSelectionFontSize(stolen, 36, target);
  assert.ok(!hasFontSize(next, 0, 36));
  assert.ok(hasFontSize(next, 6, 36));
});

run('sem range salvo, collapsed NÃO pinta o texto', () => {
  const selected = selectRange(fromRaw(TEXT), 6, 11);
  const stolen = collapseAt(selected, 6);
  const next = setSelectionFontSize(stolen, 36, stolen.getSelection());
  assert.ok(!hasFontSize(next, 6, 36));
});

run('leitura: cursor em texto inteiro fontsize-12', () => {
  const next = setSelectionFontSize(
    selectRange(fromRaw(TEXT), 0, TEXT.length),
    12,
  );
  assert.equal(getCurrentFontSize(collapseAt(next, 3)), 12);
});

run('leitura: nenhum FONTSIZE → —', () => {
  assert.equal(getCurrentFontSize(selectRange(fromRaw(TEXT), 0, 5)), undefined);
});

run('parseFontSizeStyle 36', () => {
  assert.equal(parseFontSizeStyle(toFontSizeStyle(36)), 36);
});

run('16/17. controle Classic não usa <select>; V2 intocado no patch', () => {
  const control = fs.readFileSync(
    path.join(__dirname, 'FontSizeControl.tsx'),
    'utf8',
  );
  assert.equal(control.includes('<select'), false);
  assert.equal(control.includes('<Menu'), true);
  assert.equal(control.includes('preventDefault()'), true);
  assert.equal(control.includes('setAnchorEl'), true);
  assert.equal(
    /onChange\(setSelectionFontSize/.test(control) &&
      control.includes('setAnchorEl(e.currentTarget)'),
    true,
  );

  const wrapper = fs.readFileSync(
    path.join(
      __dirname,
      '../../../organisms/documentModel/DocumentModelContent/TypeSectionItem/ItemWrapper.tsx',
    ),
    'utf8',
  );
  assert.equal(wrapper.includes('DRAFT_FONT_SIZE_MENU_ATTR'), true);

  const v2Apply = path.join(
    __dirname,
    '../../../organisms/documentModel/editor-v2/tiptap/apply-text-case.ts',
  );
  assert.equal(fs.existsSync(v2Apply), false);
});

console.log('\nfont-size.util.spec ok');
