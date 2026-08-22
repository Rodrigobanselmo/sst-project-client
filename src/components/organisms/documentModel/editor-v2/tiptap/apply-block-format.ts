import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import {
  EditorState,
  NodeSelection,
  TextSelection,
  Transaction,
} from '@tiptap/pm/state';
import { IDocumentModelElement } from 'core/interfaces/api/IDocumentModel';

import { isLegacyBulletSpaceType } from '../adapter/document-editor-state.types';
import { cloneJson } from '../adapter/json-clone';
import {
  attrsForConvertedNode,
  BLOCK_FORMAT_META,
  BlockFormatType,
  clampBulletLevel,
  isHeadingFormatType,
  nextBulletLevel,
  tipTapNodeNameForFormat,
} from '../domain/block-format';

const FORMAT_NODE_NAMES = new Set([
  'docParagraph',
  'docBullet',
  'docHeading',
  'docAtom',
]);

export type ActiveBlockResolution =
  | {
      kind: 'convertible';
      convertible: true;
      format: BlockFormatType;
      id: string;
      pos: number;
      node: ProseMirrorNode;
      level?: number;
    }
  | {
      kind: 'atom';
      convertible: false;
      id?: string;
      pos?: number;
      atomType?: string;
    }
  | { kind: 'multi'; convertible: false }
  | { kind: 'none'; convertible: false };

function isFormatNodeName(name: string) {
  return FORMAT_NODE_NAMES.has(name);
}

function findBlockAround($pos: {
  depth: number;
  node: (depth: number) => ProseMirrorNode;
  before: (depth: number) => number;
}): { pos: number; node: ProseMirrorNode } | null {
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (isFormatNodeName(node.type.name)) {
      return { pos: $pos.before(depth), node };
    }
  }
  return null;
}

function describeNode(
  pos: number,
  node: ProseMirrorNode,
): ActiveBlockResolution {
  const id = typeof node.attrs.id === 'string' ? node.attrs.id : undefined;

  if (node.type.name === 'docAtom') {
    return {
      kind: 'atom',
      convertible: false,
      id,
      pos,
      atomType: node.attrs.atomType ? String(node.attrs.atomType) : undefined,
    };
  }

  if (node.type.name === 'docParagraph') {
    return {
      kind: 'convertible',
      convertible: true,
      format: 'PARAGRAPH',
      id: id || '',
      pos,
      node,
    };
  }

  if (node.type.name === 'docBullet') {
    return {
      kind: 'convertible',
      convertible: true,
      format: 'BULLET',
      id: id || '',
      pos,
      node,
      level: clampBulletLevel(Number(node.attrs.level ?? 0)),
    };
  }

  if (node.type.name === 'docHeading') {
    const headingType = String(node.attrs.headingType || '');
    if (!isHeadingFormatType(headingType)) {
      return { kind: 'atom', convertible: false, id, pos };
    }
    return {
      kind: 'convertible',
      convertible: true,
      format: headingType,
      id: id || '',
      pos,
      node,
    };
  }

  return { kind: 'none', convertible: false };
}

export function resolveActiveBlock(state: EditorState): ActiveBlockResolution {
  const { selection } = state;

  if (selection instanceof NodeSelection) {
    if (!isFormatNodeName(selection.node.type.name)) {
      return { kind: 'none', convertible: false };
    }
    return describeNode(selection.from, selection.node);
  }

  const fromBlock = findBlockAround(selection.$from);
  const toBlock = findBlockAround(selection.$to);

  if (!fromBlock) return { kind: 'none', convertible: false };
  if (toBlock && fromBlock.pos !== toBlock.pos) {
    return { kind: 'multi', convertible: false };
  }

  return describeNode(fromBlock.pos, fromBlock.node);
}

function sourceFromNode(node: ProseMirrorNode, id: string): IDocumentModelElement {
  if (node.attrs.source) {
    return cloneJson({ ...node.attrs.source, id });
  }
  return { id, type: 'PARAGRAPH', text: node.textContent };
}

function markFormatTransaction(tr: Transaction): Transaction {
  return tr.setMeta(BLOCK_FORMAT_META, true);
}

export function createBlockFormatTransaction(
  state: EditorState,
  target: BlockFormatType,
): Transaction | null {
  const active = resolveActiveBlock(state);
  if (!active.convertible) return null;
  if (active.format === target) return null;
  if (!active.id) return null;

  const nextName = tipTapNodeNameForFormat(target);
  const nextType = state.schema.nodes[nextName];
  if (!nextType) return null;

  const attrs = attrsForConvertedNode({
    id: active.id,
    target,
    source: sourceFromNode(active.node, active.id),
    headingNumber: active.node.attrs.headingNumber ?? null,
  });

  let tr = markFormatTransaction(
    state.tr.setNodeMarkup(active.pos, nextType, attrs),
  );

  const offset = Math.min(
    state.selection.$from.parentOffset,
    tr.doc.nodeAt(active.pos)?.content.size ?? 0,
  );
  tr = tr.setSelection(TextSelection.create(tr.doc, active.pos + 1 + offset));
  return tr.scrollIntoView();
}

export function applyBlockFormatConversion(
  state: EditorState,
  target: BlockFormatType,
): { ok: boolean; state: EditorState } {
  const transaction = createBlockFormatTransaction(state, target);
  if (!transaction) return { ok: false, state };
  return { ok: true, state: state.apply(transaction) };
}

export function createBulletLevelTransaction(
  state: EditorState,
  nextLevel: number,
): Transaction | null {
  const active = resolveActiveBlock(state);
  if (!active.convertible || active.format !== 'BULLET') return null;

  const level = clampBulletLevel(nextLevel);
  if (level === active.level) return null;

  const source = sourceFromNode(active.node, active.id);
  const attrs = isLegacyBulletSpaceType(source.type)
    ? {
        ...active.node.attrs,
        level,
        source,
      }
    : attrsForConvertedNode({
        id: active.id,
        target: 'BULLET',
        source: { ...source, level },
      });

  return markFormatTransaction(
    state.tr.setNodeMarkup(active.pos, undefined, attrs),
  ).scrollIntoView();
}

export function applyBulletLevelChange(
  state: EditorState,
  delta: number,
): { ok: boolean; state: EditorState; level: number } {
  const active = resolveActiveBlock(state);
  const current = active.kind === 'convertible' ? active.level ?? 0 : 0;
  const level = nextBulletLevel(current, delta);
  const transaction = createBulletLevelTransaction(state, level);
  if (!transaction) return { ok: false, state, level: current };
  return { ok: true, state: state.apply(transaction), level };
}

export function applyBulletLevelSet(
  state: EditorState,
  nextLevel: number,
): { ok: boolean; state: EditorState; level: number } {
  const level = clampBulletLevel(nextLevel);
  const transaction = createBulletLevelTransaction(state, level);
  if (!transaction) {
    const active = resolveActiveBlock(state);
    return {
      ok: false,
      state,
      level: active.kind === 'convertible' ? active.level ?? 0 : 0,
    };
  }
  return { ok: true, state: state.apply(transaction), level };
}
