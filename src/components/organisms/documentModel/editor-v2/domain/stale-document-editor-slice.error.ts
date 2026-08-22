export type StaleDocumentEditorSliceReason =
  | 'section-missing'
  | 'anchor-missing'
  | 'window-mismatch';

export class StaleDocumentEditorSliceError extends Error {
  readonly code = 'STALE_DOCUMENT_EDITOR_SLICE';
  readonly reason: StaleDocumentEditorSliceReason;
  readonly sectionId?: string;
  readonly anchorId?: string;

  constructor(
    reason: StaleDocumentEditorSliceReason,
    message: string,
    extra: { sectionId?: string; anchorId?: string } = {},
  ) {
    super(message);
    this.name = 'StaleDocumentEditorSliceError';
    this.reason = reason;
    this.sectionId = extra.sectionId;
    this.anchorId = extra.anchorId;
  }
}
