import {
  CompanyExamRiskCoverageStatusEnum,
  type ICompanyExamRiskCoverageItem,
  type ICompanyExamRiskCoverageSummary,
} from './company-exam-risk-coverage.types';

/**
 * Presentation mapping over coverage API statuses.
 * Does not create a parallel clinical engine — only UI decision groups.
 */
export enum ExamRiskCoverageDecisionGroupEnum {
  LIBRARY_RECOMMENDATION_AVAILABLE = 'LIBRARY_RECOMMENDATION_AVAILABLE',
  PARTIALLY_ADOPTED = 'PARTIALLY_ADOPTED',
  NO_LIBRARY_RECOMMENDATION = 'NO_LIBRARY_RECOMMENDATION',
  LOCAL_ONLY = 'LOCAL_ONLY',
}

export const resolveCoverageDecisionGroup = (
  item: Pick<
    ICompanyExamRiskCoverageItem,
    'coverageStatus' | 'hasAnyAdoptedExam' | 'missingCount'
  >,
): ExamRiskCoverageDecisionGroupEnum | null => {
  const { coverageStatus, hasAnyAdoptedExam, missingCount } = item;

  if (
    coverageStatus === CompanyExamRiskCoverageStatusEnum.MISSING_RECOMMENDED_EXAMS &&
    !hasAnyAdoptedExam
  ) {
    return ExamRiskCoverageDecisionGroupEnum.LIBRARY_RECOMMENDATION_AVAILABLE;
  }

  if (
    (coverageStatus ===
      CompanyExamRiskCoverageStatusEnum.MISSING_RECOMMENDED_EXAMS &&
      hasAnyAdoptedExam) ||
    (coverageStatus === CompanyExamRiskCoverageStatusEnum.MIXED &&
      missingCount > 0)
  ) {
    return ExamRiskCoverageDecisionGroupEnum.PARTIALLY_ADOPTED;
  }

  if (
    coverageStatus ===
    CompanyExamRiskCoverageStatusEnum.NO_LIBRARY_RECOMMENDATION
  ) {
    return ExamRiskCoverageDecisionGroupEnum.NO_LIBRARY_RECOMMENDATION;
  }

  if (coverageStatus === CompanyExamRiskCoverageStatusEnum.LOCAL_ONLY) {
    return ExamRiskCoverageDecisionGroupEnum.LOCAL_ONLY;
  }

  return null;
};

export type ExamRiskCoverageDecisionBuckets = Record<
  ExamRiskCoverageDecisionGroupEnum,
  ICompanyExamRiskCoverageItem[]
>;

export const bucketCoverageItemsByDecision = (
  items: ICompanyExamRiskCoverageItem[],
): ExamRiskCoverageDecisionBuckets => {
  const buckets: ExamRiskCoverageDecisionBuckets = {
    [ExamRiskCoverageDecisionGroupEnum.LIBRARY_RECOMMENDATION_AVAILABLE]: [],
    [ExamRiskCoverageDecisionGroupEnum.PARTIALLY_ADOPTED]: [],
    [ExamRiskCoverageDecisionGroupEnum.NO_LIBRARY_RECOMMENDATION]: [],
    [ExamRiskCoverageDecisionGroupEnum.LOCAL_ONLY]: [],
  };

  items.forEach((item) => {
    const group = resolveCoverageDecisionGroup(item);
    if (group) buckets[group].push(item);
  });

  return buckets;
};

export type ExamRiskCoverageDecisionCounts = {
  analyzed: number;
  complete: number;
  recommendationAvailable: number;
  partiallyAdopted: number;
  noLibraryRecommendation: number;
  localOnly: number;
  recommendedWithoutAdoptedExam: number;
};

export const buildDecisionCountsFromItems = (
  items: ICompanyExamRiskCoverageItem[],
  summary?: ICompanyExamRiskCoverageSummary,
): ExamRiskCoverageDecisionCounts => {
  const buckets = bucketCoverageItemsByDecision(items);
  return {
    analyzed: summary?.totalRisksAnalyzed ?? items.length,
    complete: summary?.complete ?? 0,
    recommendationAvailable:
      buckets[ExamRiskCoverageDecisionGroupEnum.LIBRARY_RECOMMENDATION_AVAILABLE]
        .length,
    partiallyAdopted:
      buckets[ExamRiskCoverageDecisionGroupEnum.PARTIALLY_ADOPTED].length,
    noLibraryRecommendation:
      buckets[ExamRiskCoverageDecisionGroupEnum.NO_LIBRARY_RECOMMENDATION]
        .length,
    localOnly: buckets[ExamRiskCoverageDecisionGroupEnum.LOCAL_ONLY].length,
    recommendedWithoutAdoptedExam:
      summary?.recommendedWithoutAdoptedExam ??
      buckets[ExamRiskCoverageDecisionGroupEnum.LIBRARY_RECOMMENDATION_AVAILABLE]
        .length,
  };
};

export const decisionGroupTitles: Record<
  ExamRiskCoverageDecisionGroupEnum,
  { title: string; subtitle: string }
> = {
  [ExamRiskCoverageDecisionGroupEnum.LIBRARY_RECOMMENDATION_AVAILABLE]: {
    title: 'Recomendações disponíveis para adoção',
    subtitle:
      'A Biblioteca SimpleSST possui recomendações técnicas para estes riscos, mas elas ainda não foram adotadas pela empresa.',
  },
  [ExamRiskCoverageDecisionGroupEnum.PARTIALLY_ADOPTED]: {
    title: 'Cobertura incompleta',
    subtitle:
      'Parte das recomendações da Biblioteca foi adotada, mas ainda existem exames pendentes.',
  },
  [ExamRiskCoverageDecisionGroupEnum.NO_LIBRARY_RECOMMENDATION]: {
    title: 'Riscos sem recomendação técnica definida',
    subtitle:
      'Não há padrão ativo na Biblioteca SimpleSST para estes riscos. A empresa pode cadastrar uma regra manualmente ou solicitar uma análise assistida por IA.',
  },
  [ExamRiskCoverageDecisionGroupEnum.LOCAL_ONLY]: {
    title: 'Vínculos locais sem correspondência na Biblioteca',
    subtitle:
      'Há exames adotados pela empresa que não correspondem a uma recomendação ACTIVE da Biblioteca SimpleSST. Isso não é, por si só, um erro.',
  },
};
