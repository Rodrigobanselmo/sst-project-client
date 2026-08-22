import {
  DocModelAlignmentType,
  IDocumentModelElement,
} from 'core/interfaces/api/IDocumentModel';
import { InlineStyleTypeEnum } from 'project/enum/document-model.enum';

import { omitKeys, overlayDefined } from '../adapter/json-clone';

export const TEXT_FORMAT_META = 'documentEditorTextFormat';

/** Campos que NÃO existem no canonical atual. A Fase 4B não os inventa. */
export const TEXT_FORMAT_NON_CANONICAL_FIELDS = [
  'paragraphSpacing',
  'marginBottom',
  'marginTop',
  'indent',
  'fontFamily',
] as const;

export const TEXT_ALIGN_OPTIONS = [
  { value: DocModelAlignmentType.START, label: 'Esquerda' },
  { value: DocModelAlignmentType.CENTER, label: 'Centro' },
  { value: DocModelAlignmentType.END, label: 'Direita' },
  { value: DocModelAlignmentType.BOTH, label: 'Justificado' },
] as const;

export type TextAlignValue =
  (typeof TEXT_ALIGN_OPTIONS)[number]['value'];

/** Mesmos tamanhos do DraftEditor V1. */
export const FONT_SIZE_OPTIONS = [
  6, 7, 7.5, 8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36,
] as const;

/** Mesmos valores do LineHeightControl V1. 1.46 = padrão (omite o campo). */
export const DEFAULT_LINE_HEIGHT = 1.46;

export const LINE_HEIGHT_OPTIONS = [
  { value: 1, label: '1' },
  { value: 1.15, label: '1,15' },
  { value: 1.5, label: '1,5' },
  { value: 2, label: '2' },
] as const;

export const TEXT_COLOR_PRESETS = [
  '#000000',
  '#434343',
  '#666666',
  '#999999',
  '#B7B7B7',
  '#FFFFFF',
  '#FF0000',
  '#FF9900',
  '#FFFF00',
  '#00FF00',
  '#00FFFF',
  '#0000FF',
  '#9900FF',
  '#FF00FF',
  '#F4CCCC',
  '#FCE5CD',
  '#FFF2CC',
  '#D9EAD3',
  '#D0E0E3',
  '#CFE2F3',
  '#D9D2E9',
  '#EAD1DC',
] as const;

export const VARIABLE_TOKEN_RE = /\?\?[A-Za-z0-9_]+\?\?/g;

export type LineHeightDisplay =
  | { kind: 'default' }
  | { kind: 'value'; value: number }
  | { kind: 'mixed' };

export type BlockVisualPatch = {
  align?: TextAlignValue | null;
  size?: number | null;
  color?: string | null;
  lineHeight?: number | null;
  lineHeightBlock?: number[] | null;
};

export function isTextAlignValue(value: string): value is TextAlignValue {
  return TEXT_ALIGN_OPTIONS.some((option) => option.value === value);
}

export function normalizeAlignRead(
  value: string | null | undefined,
): TextAlignValue | null {
  if (!value) return null;
  if (value === 'left' || value === DocModelAlignmentType.START) {
    return DocModelAlignmentType.START;
  }
  if (value === 'right' || value === DocModelAlignmentType.END) {
    return DocModelAlignmentType.END;
  }
  if (
    value === 'justify' ||
    value === 'justified' ||
    value === DocModelAlignmentType.BOTH ||
    value === DocModelAlignmentType.JUSTIFIED
  ) {
    return DocModelAlignmentType.BOTH;
  }
  if (value === DocModelAlignmentType.CENTER) {
    return DocModelAlignmentType.CENTER;
  }
  return null;
}

export function isKnownFontSize(value: number): boolean {
  return (FONT_SIZE_OPTIONS as readonly number[]).includes(value);
}

export function parseFontSize(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function displayLineHeight(
  lineHeight?: number | null,
  lineHeightBlock?: number[] | null,
): LineHeightDisplay {
  const values = (lineHeightBlock || []).filter(
    (item): item is number => item != null && Number.isFinite(item),
  );

  if (values.length > 0) {
    const first = values[0];
    if (values.some((item) => item !== first)) return { kind: 'mixed' };
    if (first === DEFAULT_LINE_HEIGHT) return { kind: 'default' };
    return { kind: 'value', value: first };
  }

  if (lineHeight == null) return { kind: 'default' };
  if (lineHeight === DEFAULT_LINE_HEIGHT) return { kind: 'default' };
  return { kind: 'value', value: lineHeight };
}

export function lineHeightPatchFor(
  value: number | null,
  lineCount: number,
): Pick<BlockVisualPatch, 'lineHeight' | 'lineHeightBlock'> {
  const count = Math.max(1, lineCount);
  if (value == null || value === DEFAULT_LINE_HEIGHT) {
    return { lineHeight: null, lineHeightBlock: null };
  }
  return {
    lineHeight: value,
    lineHeightBlock: Array.from({ length: count }, () => value),
  };
}

export function findVariableSpans(
  text: string,
): Array<{ start: number; end: number; token: string }> {
  const spans: Array<{ start: number; end: number; token: string }> = [];
  const re = new RegExp(VARIABLE_TOKEN_RE.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    spans.push({
      start: match.index,
      end: match.index + match[0].length,
      token: match[0],
    });
  }
  return spans;
}

export function expandOffsetsAroundVariables(
  text: string,
  start: number,
  end: number,
): { start: number; end: number } {
  let nextStart = start;
  let nextEnd = end;

  findVariableSpans(text).forEach((span) => {
    const overlaps = nextStart < span.end && nextEnd > span.start;
    const collapsedInside =
      nextStart === nextEnd &&
      nextStart > span.start &&
      nextStart < span.end;
    const partial = overlaps && (nextStart > span.start || nextEnd < span.end);
    if (collapsedInside || partial) {
      nextStart = Math.min(nextStart, span.start);
      nextEnd = Math.max(nextEnd, span.end);
    }
  });

  return { start: nextStart, end: nextEnd };
}

const VISUAL_KEYS = [
  'align',
  'size',
  'color',
  'lineHeight',
  'lineHeightBlock',
] as const;

export function applyBlockVisualPatchToSource(
  source: IDocumentModelElement,
  patch: BlockVisualPatch,
): IDocumentModelElement {
  const overlay: Partial<IDocumentModelElement> = {};
  const omit: string[] = [];

  VISUAL_KEYS.forEach((key) => {
    if (!(key in patch)) return;
    const value = patch[key];
    if (value == null) {
      omit.push(key);
      return;
    }
    (overlay as Record<string, unknown>)[key] = value;
  });

  return omitKeys(overlayDefined(source, overlay), omit);
}

export function sourceHasNonCanonicalField(
  source: IDocumentModelElement,
): boolean {
  return TEXT_FORMAT_NON_CANONICAL_FIELDS.some((key) => key in source);
}

export const INLINE_VALUE_STYLES = [
  InlineStyleTypeEnum.COLOR,
  InlineStyleTypeEnum.BG_COLOR,
  InlineStyleTypeEnum.FONTSIZE,
] as const;

export const SCRIPT_STYLES = [
  InlineStyleTypeEnum.SUPERSCRIPT,
  InlineStyleTypeEnum.SUBSCRIPT,
] as const;
