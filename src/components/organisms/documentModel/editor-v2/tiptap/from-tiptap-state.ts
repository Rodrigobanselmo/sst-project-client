import { JSONContent } from '@tiptap/core';
import { IDocumentModelElement } from 'core/interfaces/api/IDocumentModel';
import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';

import {
  AtomBlock,
  BulletItem,
  DocumentEditorChildrenOrigin,
  DocumentEditorGroup,
  DocumentEditorHeadingType,
  DocumentEditorSection,
  DocumentEditorState,
  HeadingBlock,
  TextRunParagraph,
  defaultBulletLevelForSource,
  isDocumentEditorHeadingType,
  isLegacyBulletSpaceType,
} from '../adapter/document-editor-state.types';
import { cloneJson, overlayDefined } from '../adapter/json-clone';
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
  applyExtractedRanges(overlay, source, extracted);

  return {
    kind: 'heading',
    id,
    type: headingType as DocumentEditorHeadingType,
    text: extracted.text,
    source: overlayDefined(source, overlay),
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

  const align = node.attrs?.align ?? undefined;
  if (align != null && align !== source.align) overlay.align = align;

  const lineHeight = node.attrs?.lineHeight ?? undefined;
  if (lineHeight != null && lineHeight !== source.lineHeight) {
    overlay.lineHeight = lineHeight;
  }

  const lineHeightBlock = node.attrs?.lineHeightBlock ?? undefined;
  if (
    lineHeightBlock != null &&
    JSON.stringify(lineHeightBlock) !== JSON.stringify(source.lineHeightBlock)
  ) {
    overlay.lineHeightBlock = lineHeightBlock;
  }

  const nextSource = overlayDefined(source, overlay);

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

  const nextSource = overlayDefined(source, overlay);

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
