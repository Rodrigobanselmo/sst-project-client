import { CompanyExamRiskCoverageStatusEnum } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import type { IPcmsoComparableConfig } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import type { SxProps, Theme } from '@mui/material';

export const coverageStatusLabels: Record<
  CompanyExamRiskCoverageStatusEnum,
  string
> = {
  [CompanyExamRiskCoverageStatusEnum.COMPLETE]: 'Cobertura completa',
  [CompanyExamRiskCoverageStatusEnum.MISSING_RECOMMENDED_EXAMS]:
    'Recomendações pendentes',
  [CompanyExamRiskCoverageStatusEnum.NO_LIBRARY_RECOMMENDATION]:
    'Sem recomendação',
  [CompanyExamRiskCoverageStatusEnum.LOCAL_ONLY]: 'Vínculo exclusivamente local',
  [CompanyExamRiskCoverageStatusEnum.MIXED]: 'Cobertura mista',
};

export const coverageStatusTooltips: Record<
  CompanyExamRiskCoverageStatusEnum,
  string
> = {
  [CompanyExamRiskCoverageStatusEnum.COMPLETE]:
    'Todas as recomendações aplicáveis da Biblioteca já estão contempladas nos vínculos desta empresa.',
  [CompanyExamRiskCoverageStatusEnum.MISSING_RECOMMENDED_EXAMS]:
    'Existem exames recomendados pela Biblioteca que ainda não foram incorporados à configuração desta empresa.',
  [CompanyExamRiskCoverageStatusEnum.NO_LIBRARY_RECOMMENDATION]:
    'Não há regra ativa da Biblioteca para este risco.',
  [CompanyExamRiskCoverageStatusEnum.LOCAL_ONLY]:
    'Há exames adotados pela empresa, mas nenhum corresponde a uma recomendação ativa da Biblioteca.',
  [CompanyExamRiskCoverageStatusEnum.MIXED]:
    'Coexistem exames recomendados, pendentes e/ou exclusivamente locais. Abra o painel para ver o detalhe.',
};

const pillBaseSx: SxProps<Theme> = {
  height: 24,
  borderRadius: '999px',
  fontWeight: 600,
  cursor: 'pointer',
  '& .MuiChip-label': {
    px: 1.25,
    fontSize: 12,
    lineHeight: 1.2,
  },
};

export const coverageStatusPillSx: Record<
  CompanyExamRiskCoverageStatusEnum,
  SxProps<Theme>
> = {
  [CompanyExamRiskCoverageStatusEnum.COMPLETE]: {
    ...pillBaseSx,
    bgcolor: 'success.main',
    color: 'common.white',
    border: '1px solid',
    borderColor: 'success.dark',
  },
  [CompanyExamRiskCoverageStatusEnum.MISSING_RECOMMENDED_EXAMS]: {
    ...pillBaseSx,
    bgcolor: '#FFF8E1',
    color: 'text.primary',
    border: '1px solid',
    borderColor: 'warning.main',
  },
  [CompanyExamRiskCoverageStatusEnum.NO_LIBRARY_RECOMMENDATION]: {
    ...pillBaseSx,
    bgcolor: '#F5F5F5',
    color: 'text.secondary',
    border: '1px solid',
    borderColor: 'grey.400',
  },
  [CompanyExamRiskCoverageStatusEnum.LOCAL_ONLY]: {
    ...pillBaseSx,
    bgcolor: '#FFF4E5',
    color: 'text.primary',
    border: '1px solid',
    borderColor: 'warning.main',
  },
  [CompanyExamRiskCoverageStatusEnum.MIXED]: {
    ...pillBaseSx,
    bgcolor: '#E8F4FD',
    color: 'info.dark',
    border: '1px solid',
    borderColor: 'info.main',
  },
};

export const formatExamEvents = (
  config: IPcmsoComparableConfig | null | undefined,
): string => {
  if (!config) return '—';
  const parts: string[] = [];
  if (config.isAdmission) parts.push('Admissional');
  if (config.isPeriodic) parts.push('Periódico');
  if (config.isChange) parts.push('Mudança');
  if (config.isReturn) parts.push('Retorno');
  if (config.isDismissal) parts.push('Demissional');
  return parts.length ? parts.join(', ') : '—';
};

export const formatExamSex = (
  config: IPcmsoComparableConfig | null | undefined,
): string => {
  if (!config) return '—';
  if (config.isMale && config.isFemale) return 'Ambos';
  if (config.isMale) return 'Masculino';
  if (config.isFemale) return 'Feminino';
  return '—';
};

export const formatExamAge = (
  config: IPcmsoComparableConfig | null | undefined,
): string => {
  if (!config) return '—';
  const from = config.fromAge;
  const to = config.toAge;
  if (from == null && to == null) return 'Todas';
  if (from != null && to != null) return `${from}–${to} anos`;
  if (from != null) return `A partir de ${from} anos`;
  return `Até ${to} anos`;
};

export const formatExamPeriodicity = (
  config: IPcmsoComparableConfig | null | undefined,
): string => {
  if (!config?.validityInMonths) return '—';
  return `${config.validityInMonths} meses`;
};
