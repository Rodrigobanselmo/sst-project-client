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
  BLOCK_FORMAT_OPTIONS,
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
  'docCaption',
  'docAtom',
]);

export type SelectedFormatBlock = {
  pos: number;
  node: ProseMirrorNode;
};

export type ActiveBlockResolution =
  | {
      kind: 'convertible';
      convertible: true;
      format: BlockFormatType;
      id: string;
      pos: number;
      node: ProseMirrorNode;
      level?: number;
      blockCount: number;
    }
  | {
      kind: 'caption';
      convertible: false;
      visual: true;
      id: string;
      pos: number;
      node: ProseMirrorNode;
      captionType?: string;
      blockCount: number;
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
}): SelectedFormatBlock | null {
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
  blockCount = 1,
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

  if (node.type.name === 'docCaption') {
    return {
      kind: 'caption',
      convertible: false,
      visual: true,
      id: id || '',
      pos,
      node,
      captionType: node.attrs.captionType
        ? String(node.attrs.captionType)
        : undefined,
      blockCount,
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
      blockCount,
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
      blockCount,
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
      blockCount,
    };
  }

  return { kind: 'none', convertible: false };
}

export function collectSelectedFormatBlocks(
  state: EditorState,
): SelectedFormatBlock[] {
  const { selection } = state;

  if (selection instanceof NodeSelection) {
    if (!isFormatNodeName(selection.node.type.name)) return [];
    return [{ pos: selection.from, node: selection.node }];
  }

  if (selection.empty) {
    const around = findBlockAround(selection.$from);
    return around ? [around] : [];
  }

  const blocks: SelectedFormatBlock[] = [];
  state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
    if (isFormatNodeName(node.type.name)) {
      blocks.push({ pos, node });
      return false;
    }
    return true;
  });
  return blocks;
}

function compatibleStructuralKey(resolution: ActiveBlockResolution): string {
  if (resolution.kind === 'convertible') return `convertible:${resolution.format}`;
  if (resolution.kind === 'caption') return 'caption';
  if (resolution.kind === 'atom') return 'atom';
  return resolution.kind;
}

export function resolveActiveBlock(state: EditorState): ActiveBlockResolution {
  const blocks = collectSelectedFormatBlocks(state);
  if (blocks.length === 0) return { kind: 'none', convertible: false };

  const descriptions = blocks.map((block) =>
    describeNode(block.pos, block.node, blocks.length),
  );

  if (descriptions.some((item) => item.kind === 'atom')) {
    if (descriptions.length === 1) return descriptions[0];
    return { kind: 'multi', convertible: false };
  }

  const keys = new Set(descriptions.map(compatibleStructuralKey));
  if (keys.size !== 1) {
    return { kind: 'multi', convertible: false };
  }

  return descriptions[0];
}

export function labelForActiveBlock(active: ActiveBlockResolution): string {
  if (active.kind === 'atom') return 'Elemento estrutural';
  if (active.kind === 'caption') {
    if (active.captionType === 'PARAGRAPH_TABLE') return 'Título de tabela';
    if (active.captionType === 'PARAGRAPH_FIGURE') return 'Título de figura';
    return 'Legenda';
  }
  if (active.kind === 'multi') return 'Vários blocos';
  if (active.kind === 'convertible') {
    return (
      BLOCK_FORMAT_OPTIONS.find((option) => option.value === active.format)
        ?.label || active.format
    );
  }
  return 'Parágrafo';
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

function convertibleBlocksForFormat(
  state: EditorState,
): Array<SelectedFormatBlock & { id: string; format: BlockFormatType }> | null {
  const blocks = collectSelectedFormatBlocks(state);
  if (blocks.length === 0) return null;

  const described = blocks.map((block) => ({
    ...block,
    resolution: describeNode(block.pos, block.node, blocks.length),
  }));

  if (described.some((item) => item.resolution.kind !== 'convertible')) {
    return null;
  }

  const formats = new Set(
    described.map((item) =>
      item.resolution.kind === 'convertible' ? item.resolution.format : '',
    ),
  );
  if (formats.size !== 1) return null;

  const next: Array<
    SelectedFormatBlock & { id: string; format: BlockFormatType }
  > = [];
  for (const item of described) {
    if (item.resolution.kind !== 'convertible' || !item.resolution.id) {
      return null;
    }
    next.push({
      pos: item.pos,
      node: item.node,
      id: item.resolution.id,
      format: item.resolution.format,
    });
  }
  return next;
}

export function createBlockFormatTransaction(
  state: EditorState,
  target: BlockFormatType,
): Transaction | null {
  const blocks = convertibleBlocksForFormat(state);
  if (!blocks) return null;
  if (blocks[0].format === target) return null;

  const nextName = tipTapNodeNameForFormat(target);
  const nextType = state.schema.nodes[nextName];
  if (!nextType) return null;

  let tr = state.tr;
  for (const block of blocks) {
    const attrs = attrsForConvertedNode({
      id: block.id,
      target,
      source: sourceFromNode(block.node, block.id),
      headingNumber: block.node.attrs.headingNumber ?? null,
    });
    tr = tr.setNodeMarkup(block.pos, nextType, attrs);
  }

  tr = markFormatTransaction(tr);

  if (blocks.length === 1) {
    const offset = Math.min(
      state.selection.$from.parentOffset,
      tr.doc.nodeAt(blocks[0].pos)?.content.size ?? 0,
    );
    tr = tr.setSelection(
      TextSelection.create(tr.doc, blocks[0].pos + 1 + offset),
    );
  } else {
    const from = tr.mapping.map(state.selection.from);
    const to = tr.mapping.map(state.selection.to);
    tr = tr.setSelection(TextSelection.create(tr.doc, from, to));
  }

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
  const blocks = convertibleBlocksForFormat(state);
  if (!blocks) return null;
  if (blocks[0].format !== 'BULLET') return null;

  const level = clampBulletLevel(nextLevel);
  let changed = false;
  let tr = state.tr;

  for (const block of blocks) {
    const current = clampBulletLevel(Number(block.node.attrs.level ?? 0));
    if (current === level) continue;

    const source = sourceFromNode(block.node, block.id);
    const attrs = isLegacyBulletSpaceType(source.type)
      ? {
          ...block.node.attrs,
          level,
          source,
        }
      : attrsForConvertedNode({
          id: block.id,
          target: 'BULLET',
          source: { ...source, level },
        });

    tr = tr.setNodeMarkup(block.pos, undefined, attrs);
    changed = true;
  }

  if (!changed) return null;
  return markFormatTransaction(tr).scrollIntoView();
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
