/**
 * Identity of a Draft defaultValue that ignores generated block keys.
 * parseToEditor() builds a new object (and new keys) on every parent render;
 * comparing this fingerprint prevents a false EditorState remount.
 */
export const fingerprintDraftDefaultValue = (value: unknown): string => {
  if (value == null || value === '') return '';
  if (typeof value === 'string') return `s:${value}`;

  if (typeof value === 'object' && value !== null && 'blocks' in value) {
    const raw = value as {
      blocks?: Array<{
        text?: string;
        type?: string;
        depth?: number;
        inlineStyleRanges?: unknown;
        entityRanges?: unknown;
        data?: unknown;
      }>;
      entityMap?: unknown;
    };

    return JSON.stringify({
      blocks: (raw.blocks || []).map((block) => ({
        text: block.text,
        type: block.type,
        depth: block.depth,
        inlineStyleRanges: block.inlineStyleRanges,
        entityRanges: block.entityRanges,
        data: block.data,
      })),
      entityMap: raw.entityMap ?? {},
    });
  }

  return JSON.stringify(value);
};
