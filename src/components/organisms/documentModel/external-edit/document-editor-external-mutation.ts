export const DOCUMENT_MODEL_EXTERNAL_SYNC_PENDING_MESSAGE =
  'Há alterações externas ainda sendo sincronizadas. Aguarde um instante e tente novamente.';

const ZERO_WIDTH = /[\u200B\uFEFF]/g;

export type ExternalMutationEditorKind = 'classic' | 'v2';

export type DocumentEditorExternalMutationTelemetry = {
  editor: ExternalMutationEditorKind;
  blockId?: string;
  mutationCount?: number;
  charsBefore: number;
  charsAfter: number;
  reconciled: boolean;
};

export type ProtectedTextRange = {
  start: number;
  end: number;
  text: string;
};

export type TextDiffAffix = {
  prefix: number;
  suffix: number;
};

export type ReentrancyGuard = {
  readonly isApplying: () => boolean;
  run: <T>(fn: () => T) => T;
  ignoreIfApplying: () => boolean;
};

export function createReentrancyGuard(): ReentrancyGuard {
  let applying = false;
  return {
    isApplying: () => applying,
    ignoreIfApplying: () => applying,
    run: <T,>(fn: () => T) => {
      if (applying) return fn();
      applying = true;
      try {
        return fn();
      } finally {
        applying = false;
      }
    },
  };
}

export function diffCommonAffix(before: string, after: string): TextDiffAffix {
  let prefix = 0;
  const min = Math.min(before.length, after.length);
  while (prefix < min && before.charAt(prefix) === after.charAt(prefix)) {
    prefix += 1;
  }
  let suffix = 0;
  while (
    suffix < min - prefix &&
    before.charAt(before.length - 1 - suffix) ===
      after.charAt(after.length - 1 - suffix)
  ) {
    suffix += 1;
  }
  return { prefix, suffix };
}

export function normalizeExternalEditableText(value: string): string {
  return value.replace(ZERO_WIDTH, '').replace(/\r\n/g, '\n').replace(/\n/g, ' ');
}

export function isSpellcheckChromeElement(el: {
  tagName?: string;
  className?: unknown;
  getAttribute?: (name: string) => string | null;
}): boolean {
  const tag = String(el.tagName || '').toLowerCase();
  if (tag.startsWith('lt-') || tag.startsWith('grammarly-')) return true;
  const className =
    typeof el.className === 'string'
      ? el.className
      : String(el.className || '');
  if (/(?:^|\s)(?:lt-|grammarly)/i.test(className)) return true;
  if (el.getAttribute?.('data-lt-comp')) return true;
  if (el.getAttribute?.('data-grammarly-part')) return true;
  if (el.getAttribute?.('data-languagetool')) return true;
  if (el.getAttribute?.('data-lt-ignore')) return true;
  return false;
}

type LikeNode = {
  nodeType?: number;
  nodeValue?: string | null;
  tagName?: string;
  className?: unknown;
  getAttribute?: (name: string) => string | null;
  childNodes?: ArrayLike<LikeNode | unknown>;
};

export function collectVisibleText(
  node: LikeNode | null | undefined,
  options: { skipSelectorAttrs?: string[] } = {},
): string {
  if (!node) return '';
  if (node.nodeType === 3) {
    return normalizeExternalEditableText(String(node.nodeValue || ''));
  }
  if (node.nodeType !== 1) return '';
  if (isSpellcheckChromeElement(node)) return '';
  const skipAttrs = options.skipSelectorAttrs || [];
  if (skipAttrs.some((attr) => Boolean(node.getAttribute?.(attr)))) {
    return '';
  }
  const children = node.childNodes || [];
  let out = '';
  for (let i = 0; i < children.length; i += 1) {
    out += collectVisibleText(children[i] as LikeNode, options);
  }
  return out;
}

export function mergeExternalTextWithProtectedRanges(
  before: string,
  after: string,
  ranges: ProtectedTextRange[],
): { text: string; preservedTokens: boolean } {
  if (!ranges.length) return { text: after, preservedTokens: true };

  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  let search = 0;
  let inOrder = true;
  for (const range of sorted) {
    const idx = after.indexOf(range.text, search);
    if (idx < 0) {
      inOrder = false;
      break;
    }
    search = idx + range.text.length;
  }
  if (inOrder) return { text: after, preservedTokens: true };

  const { prefix, suffix } = diffCommonAffix(before, after);
  const changeStart = prefix;
  const changeEnd = before.length - suffix;
  const overlapsToken = sorted.some(
    (range) => range.start < changeEnd && range.end > changeStart,
  );
  if (!overlapsToken) return { text: after, preservedTokens: true };

  let result = after;
  for (const range of [...sorted].sort((a, b) => b.start - a.start)) {
    if (result.includes(range.text)) continue;
    const at = Math.max(0, Math.min(range.start, result.length));
    const windowEnd = Math.min(result.length, at + range.text.length);
    result = `${result.slice(0, at)}${range.text}${result.slice(windowEnd)}`;
  }
  return { text: result, preservedTokens: true };
}

export function logDocumentEditorExternalMutation(
  payload: DocumentEditorExternalMutationTelemetry,
): void {
  if (typeof process === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }
  if (typeof console === 'undefined' || typeof console.info !== 'function') {
    return;
  }
  console.info('document_editor_external_mutation', {
    editor: payload.editor,
    blockId: payload.blockId,
    mutationCount: payload.mutationCount,
    charsBefore: payload.charsBefore,
    charsAfter: payload.charsAfter,
    reconciled: payload.reconciled,
  });
}

export function blockKeyFromOffsetKey(offsetKey: string): string {
  const parts = String(offsetKey || '').split('-');
  if (parts.length < 3) return parts[0] || '';
  return parts.slice(0, -2).join('-');
}
