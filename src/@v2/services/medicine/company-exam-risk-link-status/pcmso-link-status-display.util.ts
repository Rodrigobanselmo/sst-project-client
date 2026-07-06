import {
  CompanyExamRiskLibraryCoverageEnum,
  ExamRiskCharacterizationStatusEnum,
  ExamRiskLibraryStatusEnum,
  IExamRiskLinkMissingExam,
  IExamRiskLinkStatusItem,
  IExamRiskLinkStatusResponse,
  PcmsoLinkStatusEnum,
} from './company-exam-risk-link-status.types';
import type { ITagActionColors } from 'components/atoms/STag/types';

export const pcmsoLinkStatusLabels: Record<PcmsoLinkStatusEnum, string> = {
  [PcmsoLinkStatusEnum.OK]: 'OK',
  [PcmsoLinkStatusEnum.ADJUSTMENT_RECOMMENDED]: 'Ajuste recomendado',
  [PcmsoLinkStatusEnum.RISK_NOT_CHARACTERIZED]: 'Risco fora da caracterização',
  [PcmsoLinkStatusEnum.NO_LIBRARY_REFERENCE]: 'Fora da Biblioteca',
};

export const pcmsoLinkStatusTooltips: Partial<
  Record<PcmsoLinkStatusEnum, string>
> = {
  [PcmsoLinkStatusEnum.RISK_NOT_CHARACTERIZED]:
    'Este vínculo usa um risco que não consta na caracterização atual da empresa/workspace.',
  [PcmsoLinkStatusEnum.NO_LIBRARY_REFERENCE]:
    'Este vínculo ainda não está contemplado na Biblioteca Risco × Exame.',
};

export const pcmsoLinkStatusColors: Record<
  PcmsoLinkStatusEnum,
  ITagActionColors
> = {
  [PcmsoLinkStatusEnum.OK]: 'success',
  [PcmsoLinkStatusEnum.ADJUSTMENT_RECOMMENDED]: 'warning',
  [PcmsoLinkStatusEnum.RISK_NOT_CHARACTERIZED]: 'error',
  [PcmsoLinkStatusEnum.NO_LIBRARY_REFERENCE]: 'warning',
};

export const characterizationStatusLabels: Record<
  ExamRiskCharacterizationStatusEnum,
  string
> = {
  [ExamRiskCharacterizationStatusEnum.IN_CHARACTERIZATION]: 'Na caracterização',
  [ExamRiskCharacterizationStatusEnum.OUT_OF_CHARACTERIZATION]:
    'Fora da caracterização',
};

export const characterizationStatusTooltips: Record<
  ExamRiskCharacterizationStatusEnum,
  string
> = {
  [ExamRiskCharacterizationStatusEnum.IN_CHARACTERIZATION]:
    'Este risco consta na caracterização atual da empresa/workspace.',
  [ExamRiskCharacterizationStatusEnum.OUT_OF_CHARACTERIZATION]:
    'Este vínculo usa um risco que não consta na caracterização atual da empresa/workspace.',
};

export const characterizationStatusColors: Record<
  ExamRiskCharacterizationStatusEnum,
  ITagActionColors
> = {
  [ExamRiskCharacterizationStatusEnum.IN_CHARACTERIZATION]: 'success',
  [ExamRiskCharacterizationStatusEnum.OUT_OF_CHARACTERIZATION]: 'error',
};

export const libraryStatusLabels: Record<ExamRiskLibraryStatusEnum, string> = {
  [ExamRiskLibraryStatusEnum.OK]: 'Sim',
  [ExamRiskLibraryStatusEnum.NO_LIBRARY_RULE]: 'Não',
  [ExamRiskLibraryStatusEnum.EXAM_NOT_RECOMMENDED]: 'Não',
  [ExamRiskLibraryStatusEnum.MISSING_RECOMMENDED_EXAMS]: 'Sim + pendência',
  [ExamRiskLibraryStatusEnum.INDIRECT_BIOLOGICAL_ONLY]: 'Sim indireto',
};

export const libraryStatusOutsideLibraryTooltip =
  'Este vínculo ainda não está contemplado na Biblioteca Risco × Exame.';

export const libraryStatusOutsideLibraryAuxiliaryTooltip =
  'A Biblioteca possui outros exames cadastrados para este risco. Use a ação assistida para avaliar a inclusão dos exames sugeridos.';

export const libraryStatusColors: Record<
  ExamRiskLibraryStatusEnum,
  ITagActionColors
> = {
  [ExamRiskLibraryStatusEnum.OK]: 'success',
  [ExamRiskLibraryStatusEnum.NO_LIBRARY_RULE]: 'warning',
  [ExamRiskLibraryStatusEnum.EXAM_NOT_RECOMMENDED]: 'warning',
  [ExamRiskLibraryStatusEnum.MISSING_RECOMMENDED_EXAMS]: 'warning',
  [ExamRiskLibraryStatusEnum.INDIRECT_BIOLOGICAL_ONLY]: 'info',
};

export const formatPcmsoSummaryRiskNotCharacterized = (count: number) =>
  `${count} fora da caracterização`;

export const formatLibrarySummaryOutsideBiblioteca = (count: number) =>
  `${count} não constam na Biblioteca`;

export const formatLibrarySummaryMissingRecommendedExams = (count: number) =>
  `${count} com exames recomendados faltantes`;

export const formatLibrarySummaryOk = (count: number) => `${count} OK`;

export const hasSplitStatusFields = (item?: IExamRiskLinkStatusItem) =>
  Boolean(item?.characterizationStatus || item?.libraryStatus);

export const resolveCharacterizationStatus = (
  item?: IExamRiskLinkStatusItem,
): ExamRiskCharacterizationStatusEnum | undefined => {
  if (item?.characterizationStatus) return item.characterizationStatus;
  if (!item?.pcmsoStatus) return undefined;

  if (item.pcmsoStatus === PcmsoLinkStatusEnum.RISK_NOT_CHARACTERIZED) {
    return ExamRiskCharacterizationStatusEnum.OUT_OF_CHARACTERIZATION;
  }

  return ExamRiskCharacterizationStatusEnum.IN_CHARACTERIZATION;
};

export const resolveLibraryStatus = (
  item?: IExamRiskLinkStatusItem,
): ExamRiskLibraryStatusEnum | undefined => {
  if (item?.libraryStatus) return item.libraryStatus;
  if (!item?.pcmsoStatus) return undefined;

  switch (item.pcmsoStatus) {
    case PcmsoLinkStatusEnum.OK:
      if (
        item.libraryCoverage ===
          CompanyExamRiskLibraryCoverageEnum.BIOLOGICAL_INDIRECT_ONLY &&
        item.matchedRules.length === 0
      ) {
        return ExamRiskLibraryStatusEnum.INDIRECT_BIOLOGICAL_ONLY;
      }
      return ExamRiskLibraryStatusEnum.OK;
    case PcmsoLinkStatusEnum.NO_LIBRARY_REFERENCE:
      return ExamRiskLibraryStatusEnum.NO_LIBRARY_RULE;
    case PcmsoLinkStatusEnum.ADJUSTMENT_RECOMMENDED:
      if (item.nonRecommendedLink) {
        return ExamRiskLibraryStatusEnum.EXAM_NOT_RECOMMENDED;
      }
      if ((item.missingRecommendedExams?.length ?? 0) > 0) {
        return ExamRiskLibraryStatusEnum.MISSING_RECOMMENDED_EXAMS;
      }
      return ExamRiskLibraryStatusEnum.EXAM_NOT_RECOMMENDED;
    case PcmsoLinkStatusEnum.RISK_NOT_CHARACTERIZED:
      return ExamRiskLibraryStatusEnum.NO_LIBRARY_RULE;
    default:
      return undefined;
  }
};

export const resolveLibraryStatusTooltip = (
  item?: IExamRiskLinkStatusItem,
) => {
  const status = resolveLibraryStatus(item);
  if (!status) return item?.message;

  if (
    status === ExamRiskLibraryStatusEnum.NO_LIBRARY_RULE ||
    status === ExamRiskLibraryStatusEnum.EXAM_NOT_RECOMMENDED
  ) {
    return libraryStatusOutsideLibraryTooltip;
  }

  return item?.message;
};

export const isPcmsoPendingStatus = (status?: PcmsoLinkStatusEnum) =>
  status === PcmsoLinkStatusEnum.ADJUSTMENT_RECOMMENDED ||
  status === PcmsoLinkStatusEnum.RISK_NOT_CHARACTERIZED;

export const isExamRiskLinkPending = (item?: IExamRiskLinkStatusItem) => {
  if (!item) return false;

  if (hasSplitStatusFields(item)) {
    const characterizationStatus = resolveCharacterizationStatus(item);
    const libraryStatus = resolveLibraryStatus(item);

    return (
      characterizationStatus ===
        ExamRiskCharacterizationStatusEnum.OUT_OF_CHARACTERIZATION ||
      libraryStatus === ExamRiskLibraryStatusEnum.NO_LIBRARY_RULE ||
      libraryStatus === ExamRiskLibraryStatusEnum.EXAM_NOT_RECOMMENDED ||
      libraryStatus === ExamRiskLibraryStatusEnum.MISSING_RECOMMENDED_EXAMS
    );
  }

  return isPcmsoPendingStatus(item.pcmsoStatus);
};

export const isRiskInCharacterization = (item?: IExamRiskLinkStatusItem) => {
  const characterizationStatus = resolveCharacterizationStatus(item);

  if (characterizationStatus) {
    return (
      characterizationStatus ===
      ExamRiskCharacterizationStatusEnum.IN_CHARACTERIZATION
    );
  }

  if (item?.isRiskCharacterized === false) return false;
  if (item?.isRiskCharacterized === true) return true;

  return false;
};

export type ResolveApplyRecommendedExamsContext = {
  missingExamsByRiskId?: Map<string, IExamRiskLinkMissingExam[]>;
};

const dedupeMissingExams = (
  exams: IExamRiskLinkMissingExam[],
): IExamRiskLinkMissingExam[] => {
  const byExamId = new Map<number, IExamRiskLinkMissingExam>();

  exams.forEach((exam) => {
    if (!byExamId.has(exam.examId)) {
      byExamId.set(exam.examId, exam);
    }
  });

  return [...byExamId.values()];
};

/**
 * Exames realmente aplicáveis para a ação assistida.
 * Usa somente `missingRecommendedExams` da API (já considera todos os vínculos
 * da empresa e equivalência canônica/local no servidor).
 */
export const resolveApplyRecommendedExams = (
  item?: IExamRiskLinkStatusItem,
  context?: ResolveApplyRecommendedExamsContext,
): IExamRiskLinkMissingExam[] => {
  if (!item) return [];

  if (item.missingRecommendedExams?.length) {
    return dedupeMissingExams(item.missingRecommendedExams);
  }

  const fromRiskMissing = context?.missingExamsByRiskId?.get(item.riskId);
  if (fromRiskMissing?.length) {
    return dedupeMissingExams(fromRiskMissing);
  }

  return [];
};

export const canShowApplyRecommendedExams = (
  item?: IExamRiskLinkStatusItem,
  context?: ResolveApplyRecommendedExamsContext,
) => {
  if (!item || !isRiskInCharacterization(item)) return false;

  const libraryStatus = item.libraryStatus ?? resolveLibraryStatus(item);

  if (
    libraryStatus !== ExamRiskLibraryStatusEnum.MISSING_RECOMMENDED_EXAMS &&
    libraryStatus !== ExamRiskLibraryStatusEnum.EXAM_NOT_RECOMMENDED
  ) {
    return false;
  }

  return resolveApplyRecommendedExams(item, context).length > 0;
};

export const resolvePcmsoLinkStatusTooltip = (
  status: PcmsoLinkStatusEnum,
  message?: string,
) => pcmsoLinkStatusTooltips[status] ?? message;

export const buildExamRiskStatusBannerParts = (
  data: Pick<
    IExamRiskLinkStatusResponse,
    'summary' | 'characterizationSummary' | 'librarySummary'
  >,
) => {
  const parts: string[] = [];

  if (data.characterizationSummary) {
    const { outOfCharacterization } = data.characterizationSummary;
    if (outOfCharacterization > 0) {
      parts.push(formatPcmsoSummaryRiskNotCharacterized(outOfCharacterization));
    }
  } else if (data.summary.riskNotCharacterized > 0) {
    parts.push(
      formatPcmsoSummaryRiskNotCharacterized(data.summary.riskNotCharacterized),
    );
  }

  if (data.librarySummary) {
    const {
      noLibraryRule,
      examNotRecommended,
      missingRecommendedExams,
      ok,
    } = data.librarySummary;

    const outsideBibliotecaCount = noLibraryRule + examNotRecommended;

    if (outsideBibliotecaCount > 0) {
      parts.push(formatLibrarySummaryOutsideBiblioteca(outsideBibliotecaCount));
    }
    if (missingRecommendedExams > 0) {
      parts.push(
        formatLibrarySummaryMissingRecommendedExams(missingRecommendedExams),
      );
    }
    if (ok > 0) {
      parts.push(formatLibrarySummaryOk(ok));
    }
  } else {
    if (data.summary.noLibraryReference > 0) {
      parts.push(
        formatLibrarySummaryOutsideBiblioteca(data.summary.noLibraryReference),
      );
    }
    if (data.summary.adjustmentRecommended > 0) {
      parts.push(
        formatLibrarySummaryMissingRecommendedExams(
          data.summary.adjustmentRecommended,
        ),
      );
    }
    if (data.summary.ok > 0) {
      parts.push(formatLibrarySummaryOk(data.summary.ok));
    }
  }

  return parts;
};

export const hasExamRiskStatusBannerWarnings = (
  data: Pick<
    IExamRiskLinkStatusResponse,
    'summary' | 'characterizationSummary' | 'librarySummary'
  >,
) => {
  if (data.characterizationSummary || data.librarySummary) {
    const outOfCharacterization =
      data.characterizationSummary?.outOfCharacterization ?? 0;
    const libraryPending =
      (data.librarySummary?.noLibraryRule ?? 0) +
      (data.librarySummary?.examNotRecommended ?? 0) +
      (data.librarySummary?.missingRecommendedExams ?? 0);

    return outOfCharacterization > 0 || libraryPending > 0;
  }

  return (
    data.summary.riskNotCharacterized > 0 ||
    data.summary.adjustmentRecommended > 0 ||
    data.summary.noLibraryReference > 0
  );
};
