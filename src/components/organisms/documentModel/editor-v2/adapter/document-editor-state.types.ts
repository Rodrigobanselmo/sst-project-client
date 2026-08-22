import {
  DocModelAlignmentType,
  IDocumentModelElement,
  IDocumentModelSection,
  IEntityRange,
  IInlineStyleRange,
} from 'core/interfaces/api/IDocumentModel';
import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';

export const DOCUMENT_EDITOR_HEADING_TYPES = [
  DocumentSectionChildrenTypeEnum.TITLE,
  DocumentSectionChildrenTypeEnum.H1,
  DocumentSectionChildrenTypeEnum.H2,
  DocumentSectionChildrenTypeEnum.H3,
  DocumentSectionChildrenTypeEnum.H4,
  DocumentSectionChildrenTypeEnum.H5,
  DocumentSectionChildrenTypeEnum.H6,
] as const;

export type DocumentEditorHeadingType =
  (typeof DOCUMENT_EDITOR_HEADING_TYPES)[number];

/**
 * Fase 1A: só PARAGRAPH entra na superfície textual.
 * BULLET / BULLET_SPACE / captions continuam átomos até a POC 2.
 */
export const DOCUMENT_EDITOR_TEXT_RUN_TYPE =
  DocumentSectionChildrenTypeEnum.PARAGRAPH;

export type DocumentEditorChildrenOrigin = 'map' | 'inline' | 'none';

export type TextRunParagraph = {
  id: string;
  text: string;
  align?: DocModelAlignmentType;
  size?: number;
  color?: string;
  lineHeight?: number;
  lineHeightBlock?: number[];
  inlineStyleRangeBlock?: IInlineStyleRange[][];
  entityRangeBlock?: IEntityRange[][];
  /**
   * Snapshot canônico do elemento. `fromDocumentEditorState` espalha
   * este objeto e só sobrepõe campos extraídos, para não perder attrs
   * opacos (`removeWith*Vars`, extras desconhecidos, ordem das chaves).
   */
  source: IDocumentModelElement;
};

export type TextRunBlock = {
  kind: 'text-run';
  paragraphs: TextRunParagraph[];
};

export type HeadingBlock = {
  kind: 'heading';
  id: string;
  type: DocumentEditorHeadingType;
  text: string;
  source: IDocumentModelElement;
};

export type AtomBlock = {
  kind: 'atom';
  id: string;
  type: string;
  source: IDocumentModelElement;
};

export type DocumentEditorBlock = TextRunBlock | HeadingBlock | AtomBlock;

export type DocumentEditorSection = {
  id: string;
  type: string;
  childrenOrigin: DocumentEditorChildrenOrigin;
  source: IDocumentModelSection;
  blocks: DocumentEditorBlock[];
};

export type DocumentEditorGroup = {
  label?: string;
  hadChildrenMap: boolean;
  sections: DocumentEditorSection[];
};

/**
 * Representação intermediária do Editor V2.
 * Independente de TipTap / Lexical / Draft.js.
 */
export type DocumentEditorState = {
  variables: Array<{ type: string; label: string; value?: string }>;
  groups: DocumentEditorGroup[];
};

export function isTextRunBlock(
  block: DocumentEditorBlock,
): block is TextRunBlock {
  return block.kind === 'text-run';
}

export function isHeadingBlock(
  block: DocumentEditorBlock,
): block is HeadingBlock {
  return block.kind === 'heading';
}

export function isAtomBlock(block: DocumentEditorBlock): block is AtomBlock {
  return block.kind === 'atom';
}

export function isDocumentEditorHeadingType(
  type: string,
): type is DocumentEditorHeadingType {
  return (DOCUMENT_EDITOR_HEADING_TYPES as readonly string[]).includes(type);
}
