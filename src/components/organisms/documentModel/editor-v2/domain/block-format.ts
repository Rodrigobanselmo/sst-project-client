import { IDocumentModelElement } from 'core/interfaces/api/IDocumentModel';
import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';

import { omitKeys, overlayDefined } from '../adapter/json-clone';

export const BLOCK_FORMAT_TYPES = [
  'PARAGRAPH',
  'BULLET',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
] as const;

export type BlockFormatType = (typeof BLOCK_FORMAT_TYPES)[number];

export const BULLET_LEVEL_MIN = 0;
export const BULLET_LEVEL_MAX = 6;

export const BLOCK_FORMAT_META = 'documentEditorBlockFormat';

export const BLOCK_FORMAT_OPTIONS: Array<{
  value: BlockFormatType;
  label: string;
}> = [
  { value: 'PARAGRAPH', label: 'Parágrafo' },
  { value: 'BULLET', label: 'Marcador' },
  { value: 'H1', label: 'H1' },
  { value: 'H2', label: 'H2' },
  { value: 'H3', label: 'H3' },
  { value: 'H4', label: 'H4' },
  { value: 'H5', label: 'H5' },
  { value: 'H6', label: 'H6' },
];

export function isBlockFormatType(value: string): value is BlockFormatType {
  return (BLOCK_FORMAT_TYPES as readonly string[]).includes(value);
}

export function isHeadingFormatType(
  value: string,
): value is Exclude<BlockFormatType, 'PARAGRAPH' | 'BULLET'> {
  return isBlockFormatType(value) && value !== 'PARAGRAPH' && value !== 'BULLET';
}

export function labelForBlockFormat(type: BlockFormatType): string {
  return (
    BLOCK_FORMAT_OPTIONS.find((option) => option.value === type)?.label || type
  );
}

export function clampBulletLevel(level: number): number {
  if (!Number.isFinite(level)) return BULLET_LEVEL_MIN;
  return Math.max(
    BULLET_LEVEL_MIN,
    Math.min(BULLET_LEVEL_MAX, Math.round(level)),
  );
}

export function nextBulletLevel(current: number, delta: number): number {
  return clampBulletLevel(current + delta);
}

export function tipTapNodeNameForFormat(
  type: BlockFormatType,
): 'docParagraph' | 'docBullet' | 'docHeading' {
  if (type === 'PARAGRAPH') return 'docParagraph';
  if (type === 'BULLET') return 'docBullet';
  return 'docHeading';
}

export function canonicalTypeForFormat(type: BlockFormatType): string {
  if (type === 'PARAGRAPH') return DocumentSectionChildrenTypeEnum.PARAGRAPH;
  if (type === 'BULLET') return DocumentSectionChildrenTypeEnum.BULLET;
  return type;
}

export function normalizeSourceForConversion(
  source: IDocumentModelElement,
  target: BlockFormatType,
): IDocumentModelElement {
  const withType = overlayDefined(source, {
    id: source.id,
    type: canonicalTypeForFormat(target),
  });

  if (target === 'BULLET') {
    return overlayDefined(withType, {
      level: clampBulletLevel(source.level ?? BULLET_LEVEL_MIN),
    });
  }

  return omitKeys(withType, ['level']);
}

export function attrsForConvertedNode(args: {
  id: string;
  target: BlockFormatType;
  source: IDocumentModelElement;
  headingNumber?: string | null;
}): Record<string, unknown> {
  const source = normalizeSourceForConversion(args.source, args.target);

  if (args.target === 'PARAGRAPH') {
    return {
      id: args.id,
      align: source.align ?? null,
      size: source.size ?? null,
      color: source.color ?? null,
      lineHeight: source.lineHeight ?? null,
      lineHeightBlock: source.lineHeightBlock ?? null,
      source,
    };
  }

  if (args.target === 'BULLET') {
    return {
      id: args.id,
      level: source.level ?? BULLET_LEVEL_MIN,
      align: source.align ?? null,
      size: source.size ?? null,
      color: source.color ?? null,
      lineHeight: source.lineHeight ?? null,
      lineHeightBlock: source.lineHeightBlock ?? null,
      source,
    };
  }

  return {
    id: args.id,
    headingType: args.target,
    headingNumber: args.headingNumber ?? null,
    source,
  };
}
