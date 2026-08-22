import { JSONContent } from '@tiptap/core';
import { IDocumentModelElement } from 'core/interfaces/api/IDocumentModel';
import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';

import {
  AtomBlock,
  BulletItem,
  CaptionBlock,
  DocumentEditorChildrenOrigin,
  DocumentEditorGroup,
  DocumentEditorHeadingType,
  DocumentEditorSection,
  DocumentEditorState,
  HeadingBlock,
  TextRunParagraph,
  defaultBulletLevelForSource,
  isDocumentEditorCaptionType,
  isDocumentEditorHeadingType,
  isLegacyBulletSpaceType,
} from '../adapter/document-editor-state.types';
import { cloneJson, omitKeys, overlayDefined } from '../adapter/json-clone';
import {
  createDocumentEditorId,
  DocumentEditorIdFactory,
} from '../domain/document-editor-id';
import {
  FlatEditorNode,
  groupFlatNodesToBlocks,
} from '../domain/group-editor-blocks';
import { UnsupportedTipTapStructureError } from '../domain/unsupported-tiptap.error';
import {
  extractParagraphContent,
  semanticallyEqualRangeBlocks,
} from './inline-ranges';

export type FromTipTapStateOptions = {
  createId?: DocumentEditorIdFactory;
};

function requireId(node: JSONContent, label: string): string {
  const id = node.attrs?.id;
  if (typeof id !== 'string' || !id) {
    throw new UnsupportedTipTapStructureError(`${label} sem id canônico.`);
  }
  return id;
}

function requireSource<T>(node: JSONContent, label: string): T {
  if (node.attrs?.source == null) {
    throw new UnsupportedTipTapStructureError(`${label} sem source canônico.`);
  }
  return cloneJson(node.attrs.source) as T;
}

function resolveEditableId(
  node: JSONContent,
  createId: DocumentEditorIdFactory,
): string {
  const id = node.attrs?.id;
  if (typeof id === 'string' && id) return id;
  return createId();
}

function resolveEditableSource(
  node: JSONContent,
  id: string,
  type: string,
): IDocumentModelElement {
  if (node.attrs?.source != null) {
    return overlayDefined(cloneJson(node.attrs.source), { id, type });
  }
  return { id, type, text: '' };
}

function applyVisualAttrOverlay(
  overlay: Partial<IDocumentModelElement>,
  omit: string[],
  source: IDocumentModelElement,
  attrs: Record<string, unknown> | undefined,
) {
  const align = attrs?.align ?? null;
  if (align == null) {
    if (source.align != null) omit.push('align');
  } else if (align !== source.align) {
    overlay.align = align as IDocumentModelElement['align'];
  }

  const size = attrs?.size ?? null;
  if (size == null || size === '') {
    if (source.size != null) omit.push('size');
  } else if (Number(size) !== source.size) {
    overlay.size = Number(size);
  }

  const color = attrs?.color ?? null;
  if (color == null || color === '') {
    if (source.color != null) omit.push('color');
  } else if (String(color) !== source.color) {
    overlay.color = String(color);
  }

  const lineHeight = attrs?.lineHeight ?? null;
  if (lineHeight == null || lineHeight === '') {
    if (source.lineHeight != null) omit.push('lineHeight');
  } else if (Number(lineHeight) !== source.lineHeight) {
    overlay.lineHeight = Number(lineHeight);
  }

  const lineHeightBlock = attrs?.lineHeightBlock ?? null;
  if (lineHeightBlock == null) {
    if (source.lineHeightBlock != null) omit.push('lineHeightBlock');
  } else if (
    JSON.stringify(lineHeightBlock) !== JSON.stringify(source.lineHeightBlock)
  ) {
    overlay.lineHeightBlock = lineHeightBlock as number[];
  }
}

function applyExtractedRanges(
  overlay: Partial<IDocumentModelElement>,
  source: IDocumentModelElement,
  extracted: ReturnType<typeof extractParagraphContent>,
) {
  if (
    !semanticallyEqualRangeBlocks(
      extracted.inlineStyleRangeBlock,
      source.inlineStyleRangeBlock,
    )
  ) {
    overlay.inlineStyleRangeBlock = extracted.inlineStyleRangeBlock;
  }

  if (
    !semanticallyEqualRangeBlocks(
      extracted.entityRangeBlock,
      source.entityRangeBlock,
    )
  ) {
    overlay.entityRangeBlock = extracted.entityRangeBlock;
  }
}

function headingFromNode(node: JSONContent): HeadingBlock {
  const id = requireId(node, 'Heading');
  const source = requireSource<IDocumentModelElement>(node, `Heading ${id}`);
  const headingType = String(node.attrs?.headingType || source.type);
  if (!isDocumentEditorHeadingType(headingType)) {
    throw new UnsupportedTipTapStructureError(
      `Heading ${id} com tipo inválido: ${headingType}`,
    );
  }

  const extracted = extractParagraphContent(node.content);
  const overlay: Partial<IDocumentModelElement> = {
    id,
    type: headingType,
    text: extracted.text,
  };
  const omit: string[] = [];
  applyExtractedRanges(overlay, source, extracted);
  applyVisualAttrOverlay(overlay, omit, source, node.attrs);

  return {
    kind: 'heading',
    id,
    type: headingType as DocumentEditorHeadingType,
    text: extracted.text,
    source: omitKeys(overlayDefined(source, overlay), omit),
  };
}

function paragraphFromNode(
  node: JSONContent,
  createId: DocumentEditorIdFactory,
): TextRunParagraph {
  const id = resolveEditableId(node, createId);
  const source = resolveEditableSource(
    node,
    id,
    DocumentSectionChildrenTypeEnum.PARAGRAPH,
  );
  const extracted = extractParagraphContent(node.content);

  const overlay: Partial<IDocumentModelElement> = {
    id,
    type: DocumentSectionChildrenTypeEnum.PARAGRAPH,
    text: extracted.text,
  };

  applyExtractedRanges(overlay, source, extracted);
  const omit: string[] = [];
  applyVisualAttrOverlay(overlay, omit, source, node.attrs);

  const nextSource = omitKeys(overlayDefined(source, overlay), omit);

  return {
    id,
    text: extracted.text,
    ...(nextSource.align != null && { align: nextSource.align }),
    ...(nextSource.size != null && { size: nextSource.size }),
    ...(nextSource.color != null && { color: nextSource.color }),
    ...(nextSource.lineHeight != null && { lineHeight: nextSource.lineHeight }),
    ...(nextSource.lineHeightBlock != null && {
      lineHeightBlock: nextSource.lineHeightBlock,
    }),
    ...(nextSource.inlineStyleRangeBlock != null && {
      inlineStyleRangeBlock: nextSource.inlineStyleRangeBlock,
    }),
    ...(nextSource.entityRangeBlock != null && {
      entityRangeBlock: nextSource.entityRangeBlock,
    }),
    source: nextSource,
  };
}

function bulletFromNode(
  node: JSONContent,
  createId: DocumentEditorIdFactory,
): BulletItem {
  const id = resolveEditableId(node, createId);
  const rawSourceType =
    typeof node.attrs?.source?.type === 'string'
      ? node.attrs.source.type
      : DocumentSectionChildrenTypeEnum.BULLET;
  const keepLegacySpace = isLegacyBulletSpaceType(rawSourceType);
  const source = resolveEditableSource(
    node,
    id,
    keepLegacySpace
      ? DocumentSectionChildrenTypeEnum.BULLET_SPACE
      : DocumentSectionChildrenTypeEnum.BULLET,
  );
  const extracted = extractParagraphContent(node.content);
  const level =
    node.attrs?.level != null
      ? Number(node.attrs.level)
      : defaultBulletLevelForSource(source);

  const overlay: Partial<IDocumentModelElement> = {
    id,
    type: keepLegacySpace
      ? DocumentSectionChildrenTypeEnum.BULLET_SPACE
      : DocumentSectionChildrenTypeEnum.BULLET,
    text: extracted.text,
    ...(!keepLegacySpace && level != null && { level }),
  };

  applyExtractedRanges(overlay, source, extracted);
  const omit: string[] = [];
  applyVisualAttrOverlay(overlay, omit, source, node.attrs);

  const nextSource = omitKeys(overlayDefined(source, overlay), omit);

  return {
    id,
    text: extracted.text,
    level,
    ...(nextSource.align != null && { align: nextSource.align }),
    ...(nextSource.size != null && { size: nextSource.size }),
    ...(nextSource.color != null && { color: nextSource.color }),
    ...(nextSource.lineHeight != null && { lineHeight: nextSource.lineHeight }),
    ...(nextSource.lineHeightBlock != null && {
      lineHeightBlock: nextSource.lineHeightBlock,
    }),
    ...(nextSource.inlineStyleRangeBlock != null && {
      inlineStyleRangeBlock: nextSource.inlineStyleRangeBlock,
    }),
    ...(nextSource.entityRangeBlock != null && {
      entityRangeBlock: nextSource.entityRangeBlock,
    }),
    source: nextSource,
  };
}

function captionFromNode(
  node: JSONContent,
  createId: DocumentEditorIdFactory,
): CaptionBlock {
  const id = resolveEditableId(node, createId);
  const rawType =
    typeof node.attrs?.captionType === 'string'
      ? node.attrs.captionType
      : typeof node.attrs?.source?.type === 'string'
        ? node.attrs.source.type
        : DocumentSectionChildrenTypeEnum.LEGEND;
  const captionType = isDocumentEditorCaptionType(rawType)
    ? rawType
    : DocumentSectionChildrenTypeEnum.LEGEND;
  const source = resolveEditableSource(node, id, captionType);
  const extracted = extractParagraphContent(node.content);

  const overlay: Partial<IDocumentModelElement> = {
    id,
    type: captionType,
    text: extracted.text,
  };

  applyExtractedRanges(overlay, source, extracted);
  const omit: string[] = [];
  applyVisualAttrOverlay(overlay, omit, source, node.attrs);

  const nextSource = omitKeys(overlayDefined(source, overlay), omit);

  return {
    kind: 'caption',
    id,
    type: captionType,
    text: extracted.text,
    ...(nextSource.align != null && { align: nextSource.align }),
    ...(nextSource.size != null && { size: nextSource.size }),
    ...(nextSource.color != null && { color: nextSource.color }),
    ...(nextSource.lineHeight != null && { lineHeight: nextSource.lineHeight }),
    ...(nextSource.lineHeightBlock != null && {
      lineHeightBlock: nextSource.lineHeightBlock,
    }),
    ...(nextSource.inlineStyleRangeBlock != null && {
      inlineStyleRangeBlock: nextSource.inlineStyleRangeBlock,
    }),
    ...(nextSource.entityRangeBlock != null && {
      entityRangeBlock: nextSource.entityRangeBlock,
    }),
    source: nextSource,
  };
}

function atomFromNode(node: JSONContent): AtomBlock {
  const id = requireId(node, 'Atom');
  const source = requireSource<IDocumentModelElement>(node, `Atom ${id}`);
  const atomType = String(node.attrs?.atomType || source.type || 'UNKNOWN');

  return {
    kind: 'atom',
    id,
    type: atomType,
    source: overlayDefined(source, {
      id,
      type: atomType,
    }),
  };
}

function nodesToFlat(
  content: JSONContent[] | undefined,
  createId: DocumentEditorIdFactory,
): FlatEditorNode[] {
  return (content || []).map((node) => {
    if (node.type === 'docHeading') {
      return { kind: 'heading', block: headingFromNode(node) };
    }
    if (node.type === 'docParagraph') {
      return {
        kind: 'paragraph',
        paragraph: paragraphFromNode(node, createId),
      };
    }
    if (node.type === 'docBullet') {
      return { kind: 'bullet', bullet: bulletFromNode(node, createId) };
    }
    if (node.type === 'docCaption') {
      return { kind: 'caption', block: captionFromNode(node, createId) };
    }
    if (node.type === 'docAtom') {
      return { kind: 'atom', block: atomFromNode(node) };
    }

    throw new UnsupportedTipTapStructureError(
      `Nó TipTap não suportado: ${node.type || 'unknown'}`,
    );
  });
}

function sectionFromNode(
  node: JSONContent,
  createId: DocumentEditorIdFactory,
): DocumentEditorSection {
  const id = requireId(node, 'Section');
  const source = requireSource<DocumentEditorSection['source']>(
    node,
    `Section ${id}`,
  );

  return {
    id,
    type: String(node.attrs?.type || source.type),
    childrenOrigin: (node.attrs?.childrenOrigin ||
      'none') as DocumentEditorChildrenOrigin,
    source: overlayDefined(source, {
      id,
      type: String(node.attrs?.type || source.type),
    }),
    blocks: groupFlatNodesToBlocks(nodesToFlat(node.content, createId)),
  };
}

function groupFromNode(
  node: JSONContent,
  createId: DocumentEditorIdFactory,
): DocumentEditorGroup {
  const label = node.attrs?.label;
  return {
    ...(typeof label === 'string' && label ? { label } : {}),
    hadChildrenMap: Boolean(node.attrs?.hadChildrenMap),
    sections: (node.content || []).map((section) => {
      if (section.type !== 'docSection') {
        throw new UnsupportedTipTapStructureError(
          `Grupo TipTap contém nó inesperado: ${section.type}`,
        );
      }
      return sectionFromNode(section, createId);
    }),
  };
}

export function fromTipTapState(
  doc: JSONContent,
  options: FromTipTapStateOptions = {},
): DocumentEditorState {
  if (doc.type !== 'doc') {
    throw new UnsupportedTipTapStructureError(
      `Documento TipTap inválido: ${doc.type}`,
    );
  }

  const createId = options.createId || createDocumentEditorId;

  return {
    variables: cloneJson(doc.attrs?.variables || []),
    groups: (doc.content || []).map((group) => {
      if (group.type !== 'docGroup') {
        throw new UnsupportedTipTapStructureError(
          `Documento TipTap contém nó inesperado: ${group.type}`,
        );
      }
      return groupFromNode(group, createId);
    }),
  };
}
