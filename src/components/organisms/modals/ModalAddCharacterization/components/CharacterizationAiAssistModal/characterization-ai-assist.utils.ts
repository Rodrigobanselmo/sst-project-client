import { ParagraphEnum } from 'project/enum/paragraph.enum';
import type { AiCharacterizationAssistTextItem } from '@v2/services/security/characterization/characterization/ai-characterization-assist/service/ai-characterization-assist.types';

const TECHNICAL_SOURCE_TOKEN_PATTERN =
  /\[(SYSTEM|USER|USER_PROVIDED_SOURCE|AI_INFERENCE)\]|\b(SYSTEM|USER_PROVIDED_SOURCE|AI_INFERENCE)\b/gi;

export const sanitizeApplicableAssistText = (text: string): string =>
  text.replace(TECHNICAL_SOURCE_TOKEN_PATTERN, '').replace(/\s{2,}/g, ' ').trim();

export const convertAssistTypeToParagraphEnum = (
  aiType?: string,
  fallback: ParagraphEnum = ParagraphEnum.PARAGRAPH,
): ParagraphEnum => {
  switch (aiType) {
    case 'PARAGRAPH':
      return ParagraphEnum.PARAGRAPH;
    case 'BULLET_0':
    case 'BULLET-0':
      return ParagraphEnum.BULLET_0;
    case 'BULLET_1':
    case 'BULLET-1':
      return ParagraphEnum.BULLET_1;
    case 'BULLET_2':
    case 'BULLET-2':
      return ParagraphEnum.BULLET_2;
    default:
      return fallback;
  }
};

export const assistItemsToStoredValues = (
  items: AiCharacterizationAssistTextItem[],
  defaultType: ParagraphEnum,
): string[] =>
  items
    .map((item) => {
      const type = convertAssistTypeToParagraphEnum(item.type, defaultType);
      const text = sanitizeApplicableAssistText(item.text);
      return text ? `${text}{type}=${type}` : '';
    })
    .filter(Boolean);

export const assistItemsToDisplayValues = (
  items: AiCharacterizationAssistTextItem[],
) =>
  items
    .map((item) => ({
      name: sanitizeApplicableAssistText(item.text),
      type: convertAssistTypeToParagraphEnum(item.type),
    }))
    .filter((item) => item.name);

export const resolveAssistModeFromOutputIntent = (
  outputIntent: string,
): 'DRAFT' | 'REVIEW' | 'CRITICAL_ANALYSIS' => {
  if (outputIntent === 'CRITICAL_ONLY') return 'CRITICAL_ANALYSIS';
  if (outputIntent === 'REVIEW_EXISTING') return 'REVIEW';
  return 'DRAFT';
};
