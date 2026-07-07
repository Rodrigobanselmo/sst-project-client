import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { riskTypeEnumTranslation } from '@v2/models/security/translations/risk-type.translation';

export type ExamRiskAiRiskContextDisplay = {
  riskName: string;
  riskType?: string;
  riskTypeLabel?: string;
  riskSubTypes?: { id: number; name: string }[];
  riskCas?: string | null;
  riskEsocialCode?: string | null;
};

export const resolveExamRiskAiRiskTypeLabel = (
  riskType?: string,
  riskTypeLabel?: string,
): string | undefined => {
  if (riskTypeLabel?.trim()) return riskTypeLabel.trim();
  if (!riskType) return undefined;

  return (
    riskTypeEnumTranslation[riskType as RiskTypeEnum] ??
    riskType
  );
};

export const formatExamRiskAiRiskCategoryLine = (
  context: Pick<ExamRiskAiRiskContextDisplay, 'riskType' | 'riskTypeLabel'>,
): string | null => {
  const chipLabel = formatExamRiskAiRiskCategoryChipLabel(context);
  return chipLabel ? `Categoria: ${chipLabel}` : null;
};

export const formatExamRiskAiRiskCategoryChipLabel = (
  context: Pick<ExamRiskAiRiskContextDisplay, 'riskType' | 'riskTypeLabel'>,
): string | null => {
  if (!context.riskType) return null;

  const label = resolveExamRiskAiRiskTypeLabel(
    context.riskType,
    context.riskTypeLabel,
  );

  return label ? `${label} (${context.riskType})` : context.riskType;
};

export const isExamRiskAiKnownRiskType = (
  riskType?: string,
): riskType is RiskTypeEnum =>
  Boolean(riskType && riskType in RiskTypeEnum);

export const formatExamRiskAiRiskSubTypesLine = (
  subTypes?: { id: number; name: string }[],
): string | null => {
  if (!subTypes?.length) return null;

  return `Subtipo: ${subTypes.map((item) => item.name).join(', ')}`;
};

export const formatExamRiskAiRiskMetadataLine = (
  context: Pick<
    ExamRiskAiRiskContextDisplay,
    'riskCas' | 'riskEsocialCode'
  >,
): string | null => {
  const parts: string[] = [];

  if (context.riskCas?.trim()) {
    parts.push(`CAS: ${context.riskCas.trim()}`);
  }

  if (context.riskEsocialCode?.trim()) {
    parts.push(`eSocial: ${context.riskEsocialCode.trim()}`);
  }

  return parts.length ? parts.join(' · ') : null;
};
