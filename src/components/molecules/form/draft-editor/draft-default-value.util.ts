/**
 * Identity of a Draft defaultValue that ignores generated block keys.
 * parseToEditor() builds a new object (and new keys) on every parent render;
 * comparing this fingerprint prevents a false EditorState remount.
 */
import { convertFromRaw, EditorState, RawDraftContentState } from 'draft-js';

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

export type DraftDefaultValueApplyResult =
  | {
      skipped: true;
      fingerprint: string;
      fingerprintUpdated: false;
      editorState: null;
    }
  | {
      skipped: false;
      fingerprint: string;
      fingerprintUpdated: true;
      editorState: EditorState;
    };

export function applyDraftDefaultValueChange(args: {
  defaultValue: unknown;
  isJson?: boolean;
  appliedFingerprint: string | null;
}): DraftDefaultValueApplyResult {
  const fingerprint = fingerprintDraftDefaultValue(args.defaultValue);
  if (args.appliedFingerprint === fingerprint) {
    return {
      skipped: true,
      fingerprint,
      fingerprintUpdated: false,
      editorState: null,
    };
  }

  if (!args.defaultValue) {
    return {
      skipped: false,
      fingerprint,
      fingerprintUpdated: true,
      editorState: EditorState.createEmpty(),
    };
  }

  const value = args.defaultValue;
  const isString = typeof value === 'string';
  if (args.isJson) {
    if (isString && value.includes('<p>')) {
      return {
        skipped: true,
        fingerprint,
        fingerprintUpdated: false,
        editorState: null,
      };
    }

    const raw = (
      isString ? JSON.parse(value) : value
    ) as RawDraftContentState;
    return {
      skipped: false,
      fingerprint,
      fingerprintUpdated: true,
      editorState: EditorState.createWithContent(convertFromRaw(raw)),
    };
  }

  return {
    skipped: true,
    fingerprint,
    fingerprintUpdated: false,
    editorState: null,
  };
}
