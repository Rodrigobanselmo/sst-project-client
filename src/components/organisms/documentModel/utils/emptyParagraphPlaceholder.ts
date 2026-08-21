export const EMPTY_PARAGRAPH_PLACEHOLDER = 'Novo parágrafo';

export function isEmptyParagraphContent(text?: string | null): boolean {
  if (text == null) return true;
  return text.replace(/\u00a0/g, ' ').trim().length === 0;
}
