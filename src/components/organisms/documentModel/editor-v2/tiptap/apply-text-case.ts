import { Mark, Node as ProseMirrorNode } from '@tiptap/pm/model';
import { EditorState, Transaction } from '@tiptap/pm/state';

import {
  createTextCaseStreamState,
  resetTextCaseBlockBoundary,
  resolveShiftF3Mode,
  TextCaseMode,
  transformTextCaseChunk,
} from '../domain/text-case';
import { hasPartialTextSelection, selectionTouchesAtom } from './apply-text-format';

const TEXT_BLOCKS = new Set([
  'docParagraph',
  'docBullet',
  'docHeading',
  'docCaption',
]);

export type ChangeCaseResult = {
  ok: boolean;
  state: EditorState;
  mode?: TextCaseMode;
};

type TextReplacement = {
  from: number;
  to: number;
  text: string;
  marks: readonly Mark[];
};

function clipTextSlice(
  node: ProseMirrorNode,
  pos: number,
  from: number,
  to: number,
): { from: number; to: number; text: string } | null {
  if (!node.isText || !node.text) return null;
  const start = pos;
  const end = pos + node.nodeSize;
  const sliceFrom = Math.max(from, start);
  const sliceTo = Math.min(to, end);
  if (sliceFrom >= sliceTo) return null;
  return {
    from: sliceFrom,
    to: sliceTo,
    text: node.text.slice(sliceFrom - start, sliceTo - start),
  };
}

export function collectSelectedHumanText(state: EditorState): string {
  const { from, to } = state.selection;
  let text = '';

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name === 'docVariable') return false;
    if (node.type.name === 'hardBreak') {
      if (pos >= from && pos < to) text += '\n';
      return;
    }
    const slice = clipTextSlice(node, pos, from, to);
    if (slice) text += slice.text;
  });

  return text;
}

export function isChangeCaseEnabled(state: EditorState): boolean {
  return hasPartialTextSelection(state) && !selectionTouchesAtom(state);
}

function collectReplacements(
  state: EditorState,
  mode: TextCaseMode,
): TextReplacement[] {
  const { from, to } = state.selection;
  const replacements: TextReplacement[] = [];
  let stream = createTextCaseStreamState();
  let seenTextBlock = false;

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (TEXT_BLOCKS.has(node.type.name)) {
      if (seenTextBlock) {
        stream = resetTextCaseBlockBoundary(stream);
      }
      seenTextBlock = true;
      return;
    }

    if (node.type.name === 'docVariable') return false;

    if (node.type.name === 'hardBreak') {
      if (pos >= from && pos < to) {
        stream = resetTextCaseBlockBoundary(stream);
      }
      return;
    }

    const slice = clipTextSlice(node, pos, from, to);
    if (!slice) return;

    const next = transformTextCaseChunk(slice.text, mode, stream);
    stream = next.state;
    if (next.text === slice.text) return;

    replacements.push({
      from: slice.from,
      to: slice.to,
      text: next.text,
      marks: node.marks,
    });
  });

  return replacements;
}

export function createChangeCaseTransaction(
  state: EditorState,
  mode: TextCaseMode,
): Transaction | null {
  if (!hasPartialTextSelection(state)) return null;
  if (selectionTouchesAtom(state)) return null;

  const replacements = collectReplacements(state, mode);
  if (!replacements.length) return null;

  let tr = state.tr;
  for (let index = replacements.length - 1; index >= 0; index -= 1) {
    const item = replacements[index];
    const content = item.text
      ? state.schema.text(item.text, item.marks)
      : [];
    tr = tr.replaceWith(item.from, item.to, content);
  }

  return tr;
}

export function resolveCycledChangeCaseMode(
  state: EditorState,
): TextCaseMode | null {
  if (!isChangeCaseEnabled(state)) return null;
  const selected = collectSelectedHumanText(state);
  if (!selected) return null;
  return resolveShiftF3Mode(selected);
}

export function applyChangeCase(
  state: EditorState,
  mode: TextCaseMode,
): ChangeCaseResult {
  const transaction = createChangeCaseTransaction(state, mode);
  if (!transaction) return { ok: false, state, mode };
  return { ok: true, state: state.apply(transaction), mode };
}

export function createCycledChangeCaseTransaction(
  state: EditorState,
): Transaction | null {
  const mode = resolveCycledChangeCaseMode(state);
  if (!mode) return null;
  return createChangeCaseTransaction(state, mode);
}

export function applyCycledChangeCase(state: EditorState): ChangeCaseResult {
  const mode = resolveCycledChangeCaseMode(state);
  if (!mode) return { ok: false, state };
  return applyChangeCase(state, mode);
}
