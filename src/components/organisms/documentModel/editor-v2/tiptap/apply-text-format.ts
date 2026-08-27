import { Mark, Node as ProseMirrorNode } from '@tiptap/pm/model';
import { EditorState, TextSelection, Transaction } from '@tiptap/pm/state';
import { IDocumentModelElement } from 'core/interfaces/api/IDocumentModel';
import { InlineStyleTypeEnum } from 'project/enum/document-model.enum';

import { isLegacyBulletSpaceType } from '../adapter/document-editor-state.types';
import { cloneJson } from '../adapter/json-clone';
import {
  applyBlockVisualPatchToSource,
  BlockVisualPatch,
  displayLineHeight,
  expandOffsetsAroundVariables,
  lineHeightPatchFor,
  LineHeightDisplay,
  normalizeAlignRead,
  TEXT_FORMAT_META,
  TextAlignValue,
} from '../domain/text-format';
import { ActiveBlockResolution, resolveActiveBlock } from './apply-block-format';

const TEXT_BLOCKS = new Set([
  'docParagraph',
  'docBullet',
  'docHeading',
  'docCaption',
]);

function isVisualBlock(
  active: ActiveBlockResolution,
): active is Extract<
  ActiveBlockResolution,
  { kind: 'convertible' } | { kind: 'caption' }
> {
  return active.kind === 'convertible' || active.kind === 'caption';
}

function isMarkableInline(node: ProseMirrorNode) {
  return node.isText || node.type.name === 'docVariable';
}

function sourceFromNode(
  node: ProseMirrorNode,
  id: string,
): IDocumentModelElement {
  if (node.attrs.source) {
    return cloneJson({ ...node.attrs.source, id });
  }
  return { id, type: 'PARAGRAPH', text: node.textContent };
}

function markTextFormat(tr: Transaction): Transaction {
  return tr.setMeta(TEXT_FORMAT_META, true);
}

export function hasPartialTextSelection(state: EditorState): boolean {
  const { selection } = state;
  return !selection.empty && selection.from !== selection.to;
}

export function selectionTouchesAtom(state: EditorState): boolean {
  let touches = false;
  const { from, to } = state.selection;
  state.doc.nodesBetween(from, to, (node) => {
    if (node.type.name === 'docAtom') touches = true;
  });
  return touches;
}

export function expandSelectionAroundVariables(
  state: EditorState,
): { from: number; to: number } {
  let from = state.selection.from;
  let to = state.selection.to;

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name === 'docVariable') {
      from = Math.min(from, pos);
      to = Math.max(to, pos + node.nodeSize);
      return;
    }
    if (!TEXT_BLOCKS.has(node.type.name)) return;
    const text = node.textContent;
    const start = pos + 1;
    const localStart = Math.max(from, start) - start;
    const localEnd = Math.min(to, start + node.content.size) - start;
    const expanded = expandOffsetsAroundVariables(text, localStart, localEnd);
    from = Math.min(from, start + expanded.start);
    to = Math.max(to, start + expanded.end);
  });

  return { from, to };
}

export type TextFormatToolbarState = {
  blockEnabled: boolean;
  inlineEnabled: boolean;
  hasSelection: boolean;
  align: TextAlignValue | null;
  blockSize: number | null;
  blockColor: string | null;
  lineHeight: LineHeightDisplay;
  inlineColor: string | null | 'mixed';
  inlineFontSize: number | null | 'mixed';
  highlight: string | null | 'mixed';
  superscript: boolean | 'mixed';
  subscript: boolean | 'mixed';
  atom: boolean;
  multi: boolean;
};

function collectDocStyleValues(
  state: EditorState,
  from: number,
  to: number,
  style: string,
): Set<string | null> {
  const values = new Set<string | null>();
  if (from === to) return values;

  state.doc.nodesBetween(from, to, (node) => {
    if (!isMarkableInline(node)) return;
    const mark = node.marks.find(
      (item) => item.type.name === 'docStyle' && item.attrs.style === style,
    );
    values.add(
      mark ? (mark.attrs.value == null ? null : String(mark.attrs.value)) : null,
    );
  });

  return values;
}

function collectScriptPresence(
  state: EditorState,
  from: number,
  to: number,
  style: string,
): boolean | 'mixed' {
  if (from === to) return false;
  let saw = false;
  let missing = false;
  state.doc.nodesBetween(from, to, (node) => {
    if (!isMarkableInline(node)) return;
    const has = node.marks.some(
      (item) => item.type.name === 'docStyle' && item.attrs.style === style,
    );
    if (has) saw = true;
    else missing = true;
  });
  if (saw && missing) return 'mixed';
  return saw;
}

function singleOrMixed(values: Set<string | null>): string | null | 'mixed' {
  if (values.size === 0) return null;
  if (values.size > 1) return 'mixed';
  const [value] = Array.from(values);
  return value;
}

export function resolveTextFormatToolbarState(
  state: EditorState,
): TextFormatToolbarState {
  const active = resolveActiveBlock(state);
  const atom = active.kind === 'atom';
  const blockCount =
    active.kind === 'convertible' || active.kind === 'caption'
      ? active.blockCount
      : 1;
  const multi = active.kind === 'multi' || blockCount > 1;
  const visual = isVisualBlock(active) && blockCount === 1;
  const hasSelection = hasPartialTextSelection(state);
  const { from, to } = expandSelectionAroundVariables(state);

  const lineHeightBlock =
    visual && Array.isArray(active.node.attrs.lineHeightBlock)
      ? (active.node.attrs.lineHeightBlock as number[])
      : visual
        ? active.node.attrs.source?.lineHeightBlock
        : undefined;

  const lineHeightValue = visual
    ? ((active.node.attrs.lineHeight as number | null) ??
      active.node.attrs.source?.lineHeight ??
      null)
    : null;

  return {
    blockEnabled: visual,
    inlineEnabled: !atom && hasSelection && !selectionTouchesAtom(state),
    hasSelection,
    align: visual
      ? normalizeAlignRead(
          active.node.attrs.align ?? active.node.attrs.source?.align,
        )
      : null,
    blockSize:
      visual && active.node.attrs.size != null
        ? Number(active.node.attrs.size)
        : visual && active.node.attrs.source?.size != null
          ? Number(active.node.attrs.source.size)
          : null,
    blockColor:
      (visual &&
        (active.node.attrs.color || active.node.attrs.source?.color)) ||
      null,
    lineHeight: visual
      ? displayLineHeight(lineHeightValue, lineHeightBlock)
      : { kind: 'default' },
    inlineColor: hasSelection
      ? singleOrMixed(
          collectDocStyleValues(state, from, to, InlineStyleTypeEnum.COLOR),
        )
      : null,
    inlineFontSize: hasSelection
      ? (() => {
          const raw = singleOrMixed(
            collectDocStyleValues(
              state,
              from,
              to,
              InlineStyleTypeEnum.FONTSIZE,
            ),
          );
          if (raw === 'mixed') return 'mixed';
          if (raw == null) return null;
          const n = Number(raw);
          return Number.isFinite(n) ? n : null;
        })()
      : null,
    highlight: hasSelection
      ? singleOrMixed(
          collectDocStyleValues(state, from, to, InlineStyleTypeEnum.BG_COLOR),
        )
      : null,
    superscript: hasSelection
      ? collectScriptPresence(state, from, to, InlineStyleTypeEnum.SUPERSCRIPT)
      : false,
    subscript: hasSelection
      ? collectScriptPresence(state, from, to, InlineStyleTypeEnum.SUBSCRIPT)
      : false,
    atom,
    multi,
  };
}

function nextSourceForVisual(
  node: ProseMirrorNode,
  id: string,
  patch: BlockVisualPatch,
): IDocumentModelElement {
  const source = sourceFromNode(node, id);
  const next = applyBlockVisualPatchToSource(source, patch);
  if (isLegacyBulletSpaceType(source.type)) {
    return { ...next, type: source.type };
  }
  return next;
}

export function createBlockVisualTransaction(
  state: EditorState,
  patch: BlockVisualPatch,
): Transaction | null {
  const active = resolveActiveBlock(state);
  if (!isVisualBlock(active)) return null;
  if (active.blockCount > 1) return null;
  if (!active.id) return null;

  const source = nextSourceForVisual(active.node, active.id, patch);
  const attrs = {
    ...active.node.attrs,
    source,
    ...('align' in patch && { align: patch.align ?? null }),
    ...('size' in patch && { size: patch.size ?? null }),
    ...('color' in patch && { color: patch.color ?? null }),
    ...('lineHeight' in patch && { lineHeight: patch.lineHeight ?? null }),
    ...('lineHeightBlock' in patch && {
      lineHeightBlock: patch.lineHeightBlock ?? null,
    }),
  };

  return markTextFormat(
    state.tr.setNodeMarkup(active.pos, undefined, attrs),
  ).scrollIntoView();
}

export function applyBlockAlign(
  state: EditorState,
  align: TextAlignValue,
): { ok: boolean; state: EditorState } {
  const transaction = createBlockVisualTransaction(state, { align });
  if (!transaction) return { ok: false, state };
  return { ok: true, state: state.apply(transaction) };
}

export function applyBlockSize(
  state: EditorState,
  size: number | null,
): { ok: boolean; state: EditorState } {
  const transaction = createBlockVisualTransaction(state, { size });
  if (!transaction) return { ok: false, state };
  return { ok: true, state: state.apply(transaction) };
}

export function applyBlockColor(
  state: EditorState,
  color: string | null,
): { ok: boolean; state: EditorState } {
  const transaction = createBlockVisualTransaction(state, { color });
  if (!transaction) return { ok: false, state };
  return { ok: true, state: state.apply(transaction) };
}

export function applyBlockLineHeight(
  state: EditorState,
  value: number | null,
): { ok: boolean; state: EditorState } {
  const transaction = createLineHeightTransaction(state, value);
  if (!transaction) return { ok: false, state };
  return { ok: true, state: state.apply(transaction) };
}

function removeDocStyles(
  tr: Transaction,
  from: number,
  to: number,
  styles: string[],
) {
  tr.doc.nodesBetween(from, to, (node, pos) => {
    if (!isMarkableInline(node)) return;
    node.marks.forEach((mark) => {
      if (
        mark.type.name === 'docStyle' &&
        styles.includes(String(mark.attrs.style))
      ) {
        tr.removeMark(pos, pos + node.nodeSize, mark);
      }
    });
  });
}

function createDocStyleMark(
  state: EditorState,
  style: string,
  value?: string | null,
): Mark | null {
  const type = state.schema.marks.docStyle;
  if (!type) return null;
  return type.create({
    style,
    value: value == null ? null : String(value),
  });
}

export function createInlineStyleTransaction(
  state: EditorState,
  style: InlineStyleTypeEnum,
  value?: string | null,
  mode: 'set' | 'toggle' | 'unset' = 'set',
): Transaction | null {
  if (resolveActiveBlock(state).kind === 'atom') return null;
  if (selectionTouchesAtom(state)) return null;
  if (!hasPartialTextSelection(state)) return null;

  const { from, to } = expandSelectionAroundVariables(state);
  if (from === to) return null;

  const mark = createDocStyleMark(state, style, value);
  if (!mark && mode !== 'unset') return null;

  let tr = state.tr;
  if (from !== state.selection.from || to !== state.selection.to) {
    tr = tr.setSelection(TextSelection.create(state.doc, from, to));
  }

  const exclusive =
    style === InlineStyleTypeEnum.SUPERSCRIPT
      ? [InlineStyleTypeEnum.SUBSCRIPT, InlineStyleTypeEnum.SUPERSCRIPT]
      : style === InlineStyleTypeEnum.SUBSCRIPT
        ? [InlineStyleTypeEnum.SUPERSCRIPT, InlineStyleTypeEnum.SUBSCRIPT]
        : [style];

  const alreadyOn =
    style === InlineStyleTypeEnum.SUPERSCRIPT ||
    style === InlineStyleTypeEnum.SUBSCRIPT
      ? collectScriptPresence(state, from, to, style) === true
      : singleOrMixed(collectDocStyleValues(state, from, to, style)) ===
          (value == null ? null : String(value)) &&
        collectDocStyleValues(state, from, to, style).size === 1 &&
        !collectDocStyleValues(state, from, to, style).has(null);

  removeDocStyles(tr, from, to, exclusive);

  if (mode === 'unset' || (mode === 'toggle' && alreadyOn)) {
    return markTextFormat(tr);
  }

  if (!mark) return null;
  tr = tr.addMark(from, to, mark);
  return markTextFormat(tr);
}

export function applyInlineStyle(
  state: EditorState,
  style: InlineStyleTypeEnum,
  value?: string | null,
  mode: 'set' | 'toggle' | 'unset' = 'set',
): { ok: boolean; state: EditorState } {
  const transaction = createInlineStyleTransaction(state, style, value, mode);
  if (!transaction) return { ok: false, state };
  return { ok: true, state: state.apply(transaction) };
}

export function applyInlineColor(
  state: EditorState,
  color: string | null,
): { ok: boolean; state: EditorState } {
  return applyInlineStyle(
    state,
    InlineStyleTypeEnum.COLOR,
    color,
    color == null ? 'unset' : 'set',
  );
}

export function applyInlineFontSize(
  state: EditorState,
  size: number | null,
): { ok: boolean; state: EditorState } {
  return applyInlineStyle(
    state,
    InlineStyleTypeEnum.FONTSIZE,
    size == null ? null : String(size),
    size == null ? 'unset' : 'set',
  );
}

export function applyHighlight(
  state: EditorState,
  color: string | null,
): { ok: boolean; state: EditorState } {
  return applyInlineStyle(
    state,
    InlineStyleTypeEnum.BG_COLOR,
    color,
    color == null ? 'unset' : 'set',
  );
}

export function applySuperscript(
  state: EditorState,
): { ok: boolean; state: EditorState } {
  return applyInlineStyle(
    state,
    InlineStyleTypeEnum.SUPERSCRIPT,
    null,
    'toggle',
  );
}

export function applySubscript(
  state: EditorState,
): { ok: boolean; state: EditorState } {
  return applyInlineStyle(
    state,
    InlineStyleTypeEnum.SUBSCRIPT,
    null,
    'toggle',
  );
}

export function createSizeTransaction(
  state: EditorState,
  size: number | null,
): Transaction | null {
  if (hasPartialTextSelection(state)) {
    return createInlineStyleTransaction(
      state,
      InlineStyleTypeEnum.FONTSIZE,
      size == null ? null : String(size),
      size == null ? 'unset' : 'set',
    );
  }
  return createBlockVisualTransaction(state, { size });
}

export function createColorTransaction(
  state: EditorState,
  color: string | null,
): Transaction | null {
  if (hasPartialTextSelection(state)) {
    return createInlineStyleTransaction(
      state,
      InlineStyleTypeEnum.COLOR,
      color,
      color == null ? 'unset' : 'set',
    );
  }
  return createBlockVisualTransaction(state, { color });
}

function lineCountFromNode(node: ProseMirrorNode): number {
  let breaks = 0;
  node.descendants((child) => {
    if (child.type.name === 'hardBreak') breaks += 1;
  });
  return breaks + 1;
}

export function createLineHeightTransaction(
  state: EditorState,
  value: number | null,
): Transaction | null {
  const active = resolveActiveBlock(state);
  if (!isVisualBlock(active)) return null;
  return createBlockVisualTransaction(
    state,
    lineHeightPatchFor(value, lineCountFromNode(active.node)),
  );
}

export function applySizeCommand(
  state: EditorState,
  size: number | null,
): { ok: boolean; state: EditorState } {
  const transaction = createSizeTransaction(state, size);
  if (!transaction) return { ok: false, state };
  return { ok: true, state: state.apply(transaction) };
}

export function applyColorCommand(
  state: EditorState,
  color: string | null,
): { ok: boolean; state: EditorState } {
  const transaction = createColorTransaction(state, color);
  if (!transaction) return { ok: false, state };
  return { ok: true, state: state.apply(transaction) };
}
