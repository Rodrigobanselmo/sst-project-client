import { ExamOriginEnum, IExam } from 'core/interfaces/api/IExam';
import { RiskEnum } from 'project/enum/risk.enums';

/** Categorias de risco com as quais exames NR-07 são naturalmente compatíveis. */
export const NR07_COMPATIBLE_RISK_TYPES: RiskEnum[] = [
  RiskEnum.QUI,
  RiskEnum.BIO,
];

/**
 * Exame de origem normativa/NR-07. Preferimos o campo `origin` resolvido pela API
 * (FindExamService), com fallback por vínculo a indicador biológico para casos em
 * que o objeto exam vem de ExamToRisk (edição) sem `origin` populado.
 */
export const isNr07Exam = (exam?: Partial<IExam> | null): boolean => {
  if (!exam) return false;

  if (exam.origin === ExamOriginEnum.NR07) return true;

  const biologicalIndicatorLinks = (
    exam as Partial<IExam> & {
      biologicalIndicatorLinks?: unknown[];
    }
  ).biologicalIndicatorLinks;

  if (Array.isArray(biologicalIndicatorLinks) && biologicalIndicatorLinks.length > 0) {
    return true;
  }

  return false;
};

/**
 * Exame incompatível com a categoria do risco selecionado (Fase 1).
 * Por ora, apenas exames NR-07/normativos são filtrados para riscos fora de QUI/BIO.
 */
export const isExamIncompatibleWithRiskType = (
  exam: Partial<IExam> | null | undefined,
  riskType: RiskEnum | undefined,
): boolean => {
  if (!exam?.id || !riskType) return false;
  if (NR07_COMPATIBLE_RISK_TYPES.includes(riskType)) return false;
  return isNr07Exam(exam);
};

export const EXAM_INCOMPATIBILITY_WARNING =
  'Este exame não parece compatível com a categoria do risco selecionado. Confirme se deseja manter este vínculo por critério médico.';
