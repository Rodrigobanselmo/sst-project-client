/**
 * Padrões de PCMSO da empresa (Fase 3). Persistidos em
 * Company.metadata.pcmsoExamDefaults e usados apenas para pré-preencher o modal
 * de NOVO vínculo Exame × Risco. Empresa sem configuração retorna objeto vazio,
 * preservando o comportamento atual.
 */
export interface IPcmsoExamDefaults {
  isMale?: boolean;
  isFemale?: boolean;
  isPeriodic?: boolean;
  isChange?: boolean;
  isAdmission?: boolean;
  isReturn?: boolean;
  isDismissal?: boolean;
  validityInMonths?: number | null;
  considerBetweenDays?: number | null;
  fromAge?: number | null;
  toAge?: number | null;
  minRiskDegree?: number | null;
  minRiskDegreeQuantity?: number | null;
}
