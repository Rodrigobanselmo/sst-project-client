/**
 * Recuo VISUAL de BULLET no Editor V2.
 *
 * Canonical `level` não muda: 0 continua primeiro nível da lista.
 * V1 usa `padding-inline-start: 40 * (1 + level)` + marcador interno.
 * Aqui: indent = base + level * incremento; gutter separado para o "•".
 */

export const DOCUMENT_EDITOR_V2_BULLET_BASE_INDENT_PX = 24;
export const DOCUMENT_EDITOR_V2_BULLET_LEVEL_INCREMENT_PX = 24;
export const DOCUMENT_EDITOR_V2_BULLET_MARKER_GUTTER_PX = 16;

function safeLevel(level: number): number {
  if (!Number.isFinite(level) || level < 0) return 0;
  return level;
}

export function documentEditorV2BulletMarkerLeftPx(level: number): number {
  return (
    DOCUMENT_EDITOR_V2_BULLET_BASE_INDENT_PX +
    safeLevel(level) * DOCUMENT_EDITOR_V2_BULLET_LEVEL_INCREMENT_PX
  );
}

export function documentEditorV2BulletTextIndentPx(level: number): number {
  return (
    documentEditorV2BulletMarkerLeftPx(level) +
    DOCUMENT_EDITOR_V2_BULLET_MARKER_GUTTER_PX
  );
}

export function documentEditorV2BulletStyleVars(level: number): string {
  return [
    `--doc-bullet-marker-left:${documentEditorV2BulletMarkerLeftPx(level)}px`,
    `--doc-bullet-text-indent:${documentEditorV2BulletTextIndentPx(level)}px`,
  ].join(';');
}
