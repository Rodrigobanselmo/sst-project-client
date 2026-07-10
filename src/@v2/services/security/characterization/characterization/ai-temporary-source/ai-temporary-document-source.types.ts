export type AiTemporaryDocumentSourceKind = 'user_pdf';

export type AiTemporaryDocumentSource = {
  kind: AiTemporaryDocumentSourceKind;
  fileName: string;
  extractedText: string;
  charCount?: number;
  truncated?: boolean;
  pageCount?: number;
};

export type AiTemporaryPdfParseResult = {
  fileName: string;
  extractedText: string;
  charCount: number;
  truncated: boolean;
  pageCount?: number;
  warnings: string[];
  status: 'success';
};

/** Client-side mirror of API hard cap (15 MB). */
export const AI_TEMPORARY_PDF_MAX_BYTES = 15 * 1024 * 1024;

export function toTemporaryDocumentSource(
  parseResult: AiTemporaryPdfParseResult,
): AiTemporaryDocumentSource {
  return {
    kind: 'user_pdf',
    fileName: parseResult.fileName,
    extractedText: parseResult.extractedText,
    charCount: parseResult.charCount,
    truncated: parseResult.truncated,
    pageCount: parseResult.pageCount,
  };
}
