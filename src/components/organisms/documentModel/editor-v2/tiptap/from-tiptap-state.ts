import { JSONContent } from '@tiptap/core';
import { IDocumentModelElement } from 'core/interfaces/api/IDocumentModel';
import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';

import {
  AtomBlock,
  DocumentEditorChildrenOrigin,
  DocumentEditorGroup,
  DocumentEditorHeadingType,
  DocumentEditorSection,
  DocumentEditorState,
  HeadingBlock,
  TextRunParagraph,
  isDocumentEditorHeadingType,
} from '../adapter/document-editor-state.types';
import { cloneJson, overlayDefined } from '../adapter/json-clone';
import {
  FlatEditorNode,
  groupFlatNodesToBlocks,
} from '../domain/group-editor-blocks';
import { UnsupportedTipTapStructureError } from '../domain/unsupported-tiptap.error';
import {
  extractParagraphContent,
  semanticallyEqualRangeBlocks,
} from './inline-ranges';

function requireId(node: JSONContent, label: string): string {
  const id = node.attrs?.id;
  if (typeof id !== 'string' || !id) {
    throw new UnsupportedTipTapStructureError(
      `${label} sem id canônico. Enter/split ainda não é suportado na Fase 1B.`,
    );
  }
  return id;
}

function requireSource<T>(node: JSONContent, label: string): T {
  if (node.attrs?.source == null) {
    throw new UnsupportedTipTapStructureError(
      `${label} sem source canônico. O adapter TipTap não inventa elementos novos.`,
    );
  }
  return cloneJson(node.attrs.source) as T;
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

  return {
    kind: 'heading',
    id,
    type: headingType as DocumentEditorHeadingType,
    text: extracted.text,
    source: overlayDefined(source, {
      id,
      type: headingType,
      text: extracted.text,
    }),
  };
}

function paragraphFromNode(node: JSONContent): TextRunParagraph {
  const id = requireId(node, 'Paragraph');
  const source = requireSource<IDocumentModelElement>(node, `Paragraph ${id}`);
  const extracted = extractParagraphContent(node.content);

  const overlay: Partial<IDocumentModelElement> = {
    id,
    type: DocumentSectionChildrenTypeEnum.PARAGRAPH,
    text: extracted.text,
  };

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

function nodesToFlat(content?: JSONContent[]): FlatEditorNode[] {
  return (content || []).map((node) => {
    if (node.type === 'docHeading') {
      return { kind: 'heading', block: headingFromNode(node) };
    }
    if (node.type === 'docParagraph') {
      return { kind: 'paragraph', paragraph: paragraphFromNode(node) };
    }
    if (node.type === 'docAtom') {
      return { kind: 'atom', block: atomFromNode(node) };
    }

    throw new UnsupportedTipTapStructureError(
      `Nó TipTap não suportado na Fase 1B: ${node.type || 'unknown'}`,
    );
  });
}

function sectionFromNode(node: JSONContent): DocumentEditorSection {
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
    blocks: groupFlatNodesToBlocks(nodesToFlat(node.content)),
  };
}

function groupFromNode(node: JSONContent): DocumentEditorGroup {
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
      return sectionFromNode(section);
    }),
  };
}

export function fromTipTapState(doc: JSONContent): DocumentEditorState {
  if (doc.type !== 'doc') {
    throw new UnsupportedTipTapStructureError(
      `Documento TipTap inválido: ${doc.type}`,
    );
  }

  return {
    variables: cloneJson(doc.attrs?.variables || []),
    groups: (doc.content || []).map((group) => {
      if (group.type !== 'docGroup') {
        throw new UnsupportedTipTapStructureError(
          `Documento TipTap contém nó inesperado: ${group.type}`,
        );
      }
      return groupFromNode(group);
    }),
  };
}
