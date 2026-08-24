import { Mark, Node } from '@tiptap/pm/model';
import { EditorState, TextSelection, Transaction } from '@tiptap/pm/state';

import {
  collectVisibleText,
  diffCommonAffix,
  logDocumentEditorExternalMutation,
  normalizeExternalEditableText,
} from 'components/organisms/documentModel/external-edit/document-editor-external-mutation';

const TEXT_BLOCK_TYPES = new Set([
  'docParagraph',
  'docBullet',
  'docHeading',
  'docCaption',
]);

export type V2BlockVisibleText = {
  blockId: string;
  text: string;
};

export type V2ReconcileResult = {
  state: EditorState;
  changed: boolean;
  blockIds: string[];
};

type TextLeaf = {
  from: number;
  to: number;
  text: string;
};

export function collectPmEditableTextLeaves(
  blockNode: Node,
  blockPos: number,
): TextLeaf[] {
  const leaves: TextLeaf[] = [];
  blockNode.forEach((child, offset) => {
    const pos = blockPos + 1 + offset;
    if (child.isText) {
      leaves.push({
        from: pos,
        to: pos + child.nodeSize,
        text: child.text || '',
      });
      return;
    }
    if (child.type.name === 'hardBreak') {
      leaves.push({
        from: pos,
        to: pos + child.nodeSize,
        text: ' ',
      });
    }
  });
  return leaves;
}

export function concatEditableText(leaves: TextLeaf[]): string {
  return leaves.map((leaf) => leaf.text).join('');
}

function mapConcatOffsetToPos(leaves: TextLeaf[], offset: number): number {
  if (!leaves.length) return -1;
  let remaining = offset;
  for (const leaf of leaves) {
    if (remaining <= leaf.text.length) return leaf.from + remaining;
    remaining -= leaf.text.length;
  }
  return leaves[leaves.length - 1].to;
}

export function findTextBlockById(
  doc: Node,
  blockId: string,
): { node: Node; pos: number } | null {
  let found: { node: Node; pos: number } | null = null;
  doc.descendants((node, pos) => {
    if (found) return false;
    if (TEXT_BLOCK_TYPES.has(node.type.name) && node.attrs?.id === blockId) {
      found = { node, pos };
      return false;
    }
    return undefined;
  });
  return found;
}

export function readV2EditableTextsFromState(
  state: EditorState,
): V2BlockVisibleText[] {
  const out: V2BlockVisibleText[] = [];
  state.doc.descendants((node, pos) => {
    if (!TEXT_BLOCK_TYPES.has(node.type.name) || !node.attrs?.id) return;
    out.push({
      blockId: String(node.attrs.id),
      text: concatEditableText(collectPmEditableTextLeaves(node, pos)),
    });
  });
  return out;
}

export function flushProseMirrorDomObserver(view: {
  domObserver?: { flush?: () => void };
}): void {
  view.domObserver?.flush?.();
}

function marksForRange(doc: Node, from: number, to: number) {
  const pos = from < to ? from : Math.max(0, from - 1);
  try {
    return doc.resolve(pos).marks();
  } catch {
    return [];
  }
}

function markKey(marks: readonly Mark[]): string {
  return marks
    .map((mark) => `${mark.type.name}:${JSON.stringify(mark.attrs || {})}`)
    .sort()
    .join('|');
}

function collectTextMarkRuns(doc: Node, from: number, to: number) {
  const runs: { from: number; to: number; marks: readonly Mark[] }[] = [];
  if (from >= to) return runs;
  doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isText || !node.text) return;
    const start = Math.max(from, pos);
    const end = Math.min(to, pos + node.nodeSize);
    if (start < end) {
      runs.push({ from: start, to: end, marks: node.marks });
    }
  });
  return runs;
}

function marksAreHomogeneous(runs: { marks: readonly Mark[] }[]): boolean {
  if (runs.length <= 1) return true;
  const key = markKey(runs[0].marks);
  return runs.every((run) => markKey(run.marks) === key);
}

function replaceTextPreservingMarkRuns(
  tr: Transaction,
  from: number,
  to: number,
  insertion: string,
): Transaction {
  const schema = tr.doc.type.schema;
  if (from === to) {
    if (!insertion) return tr;
    return tr.replaceWith(
      from,
      to,
      schema.text(insertion, marksForRange(tr.doc, from, to)),
    );
  }
  if (!insertion) return tr.delete(from, to);

  const runs = collectTextMarkRuns(tr.doc, from, to);
  if (marksAreHomogeneous(runs)) {
    const marks = runs[0]?.marks || [];
    return tr.replaceWith(from, to, schema.text(insertion, marks));
  }

  const oldLen = to - from;
  let next = tr;
  if (insertion.length === oldLen) {
    for (let i = oldLen - 1; i >= 0; i -= 1) {
      const pos = from + i;
      const marks = next.doc.resolve(pos).nodeAfter?.marks || [];
      next = next.replaceWith(
        pos,
        pos + 1,
        schema.text(insertion.charAt(i), marks),
      );
    }
    return next;
  }

  const mapped = Math.min(oldLen, insertion.length);
  if (insertion.length < oldLen) {
    next = next.delete(from + mapped, to);
  }
  for (let i = mapped - 1; i >= 0; i -= 1) {
    const pos = from + i;
    const marks = next.doc.resolve(pos).nodeAfter?.marks || [];
    next = next.replaceWith(
      pos,
      pos + 1,
      schema.text(insertion.charAt(i), marks),
    );
  }
  if (insertion.length > mapped) {
    next = next.insert(from + mapped, schema.text(insertion.slice(mapped)));
  }
  return next;
}

function collectVariableLabels(blockNode: Node): string[] {
  const labels: string[] = [];
  blockNode.forEach((child) => {
    if (child.type.name !== 'docVariable') return;
    const label = String(child.attrs?.label || child.textContent || '');
    if (label) labels.push(label);
  });
  return labels;
}

function extractEditableFromVisible(visible: string, labels: string[]): string {
  if (!labels.length) return visible;
  let cursor = 0;
  let editable = '';
  for (const label of labels) {
    const idx = visible.indexOf(label, cursor);
    if (idx < 0) return visible;
    editable += visible.slice(cursor, idx);
    cursor = idx + label.length;
  }
  editable += visible.slice(cursor);
  return editable;
}

function applyBlockTextToTransaction(
  tr: Transaction,
  blockId: string,
  nextText: string,
): { tr: Transaction; changed: boolean; charsBefore: number; charsAfter: number } {
  const found = findTextBlockById(tr.doc, blockId);
  if (!found) {
    return { tr, changed: false, charsBefore: 0, charsAfter: 0 };
  }

  const leaves = collectPmEditableTextLeaves(found.node, found.pos);
  const before = concatEditableText(leaves);
  const after = normalizeExternalEditableText(
    extractEditableFromVisible(
      nextText,
      collectVariableLabels(found.node),
    ),
  );
  if (after === before) {
    return { tr, changed: false, charsBefore: before.length, charsAfter: after.length };
  }

  const { prefix, suffix } = diffCommonAffix(before, after);
  const from = leaves.length
    ? mapConcatOffsetToPos(leaves, prefix)
    : found.pos + 1;
  const to = leaves.length
    ? mapConcatOffsetToPos(leaves, before.length - suffix)
    : found.pos + 1;
  const insertion = after.slice(prefix, after.length - suffix);
  if (from < 0 || to < 0) {
    return { tr, changed: false, charsBefore: before.length, charsAfter: after.length };
  }

  const nextTr = replaceTextPreservingMarkRuns(tr, from, to, insertion);
  return {
    tr: nextTr,
    changed: true,
    charsBefore: before.length,
    charsAfter: after.length,
  };
}

export function createProseMirrorExternalTextTransaction(
  state: EditorState,
  blocks: V2BlockVisibleText[],
): Transaction | null {
  let tr = state.tr;
  const blockIds: string[] = [];
  for (const block of blocks) {
    const applied = applyBlockTextToTransaction(tr, block.blockId, block.text);
    tr = applied.tr;
    if (!applied.changed) continue;
    blockIds.push(block.blockId);
    logDocumentEditorExternalMutation({
      editor: 'v2',
      blockId: block.blockId,
      charsBefore: applied.charsBefore,
      charsAfter: applied.charsAfter,
      reconciled: true,
    });
  }
  if (!blockIds.length) return null;
  const end = tr.selection.to;
  return tr
    .setSelection(TextSelection.create(tr.doc, end))
    .setMeta('externalEdit', true)
    .scrollIntoView();
}

export function reconcileProseMirrorBlockText(args: {
  state: EditorState;
  blockId: string;
  nextText: string;
}): EditorState | null {
  const tr = createProseMirrorExternalTextTransaction(args.state, [
    { blockId: args.blockId, text: args.nextText },
  ]);
  if (!tr) return null;
  return args.state.apply(tr);
}

export function reconcileProseMirrorFromVisibleTexts(
  state: EditorState,
  blocks: V2BlockVisibleText[],
): V2ReconcileResult {
  const tr = createProseMirrorExternalTextTransaction(state, blocks);
  if (!tr) {
    return { state, changed: false, blockIds: [] };
  }
  const blockIds = blocks
    .filter((block) => {
      const found = findTextBlockById(state.doc, block.blockId);
      if (!found) return false;
      const before = concatEditableText(
        collectPmEditableTextLeaves(found.node, found.pos),
      );
      return normalizeExternalEditableText(block.text) !== before;
    })
    .map((block) => block.blockId);
  return {
    state: state.apply(tr),
    changed: true,
    blockIds,
  };
}

export function readV2BlockVisibleTexts(root: {
  querySelectorAll: (selector: string) => ArrayLike<{
    getAttribute: (name: string) => string | null;
    nodeType?: number;
    childNodes?: ArrayLike<unknown>;
  }>;
}): V2BlockVisibleText[] {
  const nodes = root.querySelectorAll('[data-doc-id]');
  const out: V2BlockVisibleText[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < nodes.length; i += 1) {
    const el = nodes[i];
    const blockId = el.getAttribute('data-doc-id') || '';
    if (!blockId || seen.has(blockId)) continue;
    const isTextBlock =
      el.getAttribute('data-doc-paragraph') != null ||
      el.getAttribute('data-doc-bullet') != null ||
      el.getAttribute('data-doc-heading') != null ||
      el.getAttribute('data-doc-caption') != null;
    if (!isTextBlock) continue;
    seen.add(blockId);
    out.push({
      blockId,
      text: collectVisibleText(el, { skipSelectorAttrs: ['data-doc-variable'] }),
    });
  }
  return out;
}
