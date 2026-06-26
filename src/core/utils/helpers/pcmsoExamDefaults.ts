import { IPcmsoExamDefaults } from 'core/interfaces/api/IPcmsoExamDefaults';

const BOOLEAN_FIELDS: (keyof IPcmsoExamDefaults)[] = [
  'isMale',
  'isFemale',
  'isPeriodic',
  'isChange',
  'isAdmission',
  'isReturn',
  'isDismissal',
];

const NUMERIC_FIELDS: (keyof IPcmsoExamDefaults)[] = [
  'validityInMonths',
  'considerBetweenDays',
  'fromAge',
  'toAge',
  'minRiskDegree',
  'minRiskDegreeQuantity',
];

/**
 * Converte os padrões de PCMSO da empresa em um patch para o estado inicial de
 * um NOVO vínculo Exame × Risco. Regras:
 * - booleanos definidos sempre entram (inclusive false);
 * - numéricos só entram quando têm valor (null/undefined = "sem padrão", mantém
 *   o comportamento atual do modal);
 * - empresa sem configuração ({}) retorna {} → nada é sobrescrito.
 */
export const mapPcmsoDefaultsToExamRisk = (
  defaults?: IPcmsoExamDefaults | null,
): Partial<IPcmsoExamDefaults> => {
  if (!defaults) return {};

  const patch: Record<string, number | boolean> = {};

  BOOLEAN_FIELDS.forEach((field) => {
    const value = defaults[field];
    if (typeof value === 'boolean') {
      patch[field] = value;
    }
  });

  NUMERIC_FIELDS.forEach((field) => {
    const value = defaults[field];
    if (typeof value === 'number') {
      patch[field] = value;
    }
  });

  return patch as Partial<IPcmsoExamDefaults>;
};

export const hasPcmsoDefaults = (defaults?: IPcmsoExamDefaults | null) =>
  !!defaults && Object.keys(mapPcmsoDefaultsToExamRisk(defaults)).length > 0;
