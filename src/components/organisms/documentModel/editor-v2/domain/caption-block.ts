import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';

/**
 * V1: PARAGRAPH_TABLE / PARAGRAPH_FIGURE / LEGEND têm draft + toolbar
 * e texto/ranges reais. Não viram atom rígido; ficam blocos textuais
 * com chrome discreto.
 */
export const DOCUMENT_EDITOR_CAPTION_TYPES = [
  DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE,
  DocumentSectionChildrenTypeEnum.PARAGRAPH_FIGURE,
  DocumentSectionChildrenTypeEnum.LEGEND,
] as const;

export type DocumentEditorCaptionType =
  (typeof DOCUMENT_EDITOR_CAPTION_TYPES)[number];

export function isDocumentEditorCaptionType(
  type: string,
): type is DocumentEditorCaptionType {
  return (DOCUMENT_EDITOR_CAPTION_TYPES as readonly string[]).includes(type);
}

export function captionChromeLabel(type: string): string {
  if (type === DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE) return 'Tabela';
  if (type === DocumentSectionChildrenTypeEnum.PARAGRAPH_FIGURE) return 'Imagem';
  if (type === DocumentSectionChildrenTypeEnum.LEGEND) return 'Legenda';
  return 'Legenda';
}
