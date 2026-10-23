import type { IPcmsoComparableConfig as Config } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import type { IExamToRisk } from 'core/interfaces/api/IExam';
import { queryExams } from 'core/services/hooks/queries/useQueryExamsRisk/useQueryExamsRisk';
import { isExamRiskQuantityApplicable } from 'core/utils/helpers/isExamRiskQuantityApplicable';
import { matrixRiskMap } from 'core/constants/maps/matriz-risk.constant';
import type { IUpdateExamRisk } from 'core/services/hooks/mutations/checklist/exams/useMutUpdateExamRisk/useMutUpdateExamRisk';
import { examRiskSchema } from 'core/utils/schemas/exam.schema';

export type InlineRiskScope = {
  companyId: string;
  workspaceId?: string;
  riskId: string;
  riskName: string;
};

export async function loadInlineRiskLinks(
  scope: InlineRiskScope,
): Promise<IExamToRisk[]> {
  const links: IExamToRisk[] = [];
  let skip = 0;
  while (true) {
    const response = await queryExams(
      { skip, take: 100 },
      {
        companyId: scope.companyId,
        workspaceId: scope.workspaceId,
        riskNames: [scope.riskName],
      },
    );
    links.push(...response.data.filter((link) => link.riskId === scope.riskId));
    skip += response.data.length;
    if (!response.data.length || skip >= response.count) return links;
  }
}

// Match the review API: numeric null is comparable; omitted/ill-typed fields are not.
// Events/Sex contain non-nullable booleans: all-false is valid data, never missing data.
export function hasComparableParameterInformation(
  config: Partial<Record<keyof Config, unknown>> | null | undefined,
  keys: readonly (keyof Config)[],
): boolean {
  return Boolean(
    config &&
      keys.every((key) => {
        const value = config[key];
        if (key.startsWith('is')) return typeof value === 'boolean';
        return (
          value === null ||
          (typeof value === 'number' &&
            Number.isSafeInteger(value) &&
            value >= 0 &&
            (!key.startsWith('minRiskDegree') || value <= 5))
        );
      }),
  );
}

export const inlineParameterFields = {
  events: ['isAdmission', 'isPeriodic', 'isChange', 'isReturn', 'isDismissal'],
  validityInMonths: ['validityInMonths'],
  sex: ['isMale', 'isFemale'],
  age: ['fromAge', 'toAge'],
  considerBetweenDays: ['considerBetweenDays'],
  minRiskDegree: ['minRiskDegree'],
  minRiskDegreeQuantity: ['minRiskDegreeQuantity'],
} as const;
export type InlineParameterGroup = keyof typeof inlineParameterFields;
export type InlineParameterDraft = Record<string, string | boolean>;
export const inlineParameterLabels: Record<InlineParameterGroup, string> = {
  events: 'Eventos',
  validityInMonths: 'Periodicidade (meses)',
  sex: 'Sexo',
  age: 'Faixa etária',
  considerBetweenDays: 'Intervalo em dias',
  minRiskDegree: 'Critério qualitativo',
  minRiskDegreeQuantity: 'Critério quantitativo',
};
export const inlineDegreeOptions = Object.values(matrixRiskMap).filter(
  (value) => value.level > 0 && value.level < 6,
);
export const canEditInlineParameter = (
  group: InlineParameterGroup,
  link: IExamToRisk,
) =>
  group !== 'minRiskDegreeQuantity' || isExamRiskQuantityApplicable(link.risk);

export function inlineParameterDraft(
  group: InlineParameterGroup,
  link: Partial<Record<keyof IExamToRisk, unknown>>,
): InlineParameterDraft {
  const fields: readonly string[] =
    group === 'events'
      ? [...inlineParameterFields.events, 'validityInMonths']
      : inlineParameterFields[group];
  return Object.fromEntries(
    fields.map((field) => {
      const value = link[field as keyof IExamToRisk];
      return [
        field,
        field.startsWith('is')
          ? Boolean(value)
          : value == null
            ? ''
            : String(value),
      ];
    }),
  );
}

// Copy only this group. Events retain the destination periodicity unless the
// company validator requires a positive interval to enable the periodic event.
export function inlineParameterCopyDraft(
  group: InlineParameterGroup,
  source: Partial<Record<keyof IExamToRisk, unknown>>,
  target: Partial<Record<keyof IExamToRisk, unknown>>,
  requirePositivePeriodicity = false,
): InlineParameterDraft {
  for (const field of inlineParameterFields[group]) {
    const value = source[field as keyof IExamToRisk];
    if (
      value === undefined ||
      (field.startsWith('is')
        ? typeof value !== 'boolean'
        : value !== null && typeof value !== 'number')
    )
      throw new Error(
        `${inlineParameterLabels[group]}: o parâmetro de origem está incompleto ou incompatível. Atualize a comparação.`,
      );
  }
  const result = inlineParameterDraft(group, source);
  if (group === 'events') {
    let validity = target.validityInMonths;
    if (
      requirePositivePeriodicity &&
      source.isPeriodic === true &&
      (!Number.isSafeInteger(validity) || Number(validity) <= 0)
    ) {
      validity = source.validityInMonths;
      if (!Number.isSafeInteger(validity) || Number(validity) <= 0)
        throw new Error(
          'A origem não possui periodicidade válida. Configure os eventos manualmente.',
        );
    }
    result.validityInMonths = validity == null ? '' : String(validity);
  }
  return result;
}

const integerOrNull = (
  value: string | boolean | undefined,
  label: string,
): number | null => {
  if (typeof value !== 'string') throw new Error(`Informe ${label}.`);
  const text = value.trim();
  if (text === '') return null;
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(Number(text)))
    throw new Error(`Informe ${label} como número inteiro não negativo.`);
  return Number(text);
};

export async function buildInlineParameterPatch(
  scope: InlineRiskScope,
  link: IExamToRisk,
  expected: { linkId: number; examId: number },
  group: InlineParameterGroup,
  draft: InlineParameterDraft,
): Promise<IUpdateExamRisk & { realCompanyId: string }> {
  if (
    !scope.companyId ||
    link.companyId !== scope.companyId ||
    link.id !== expected.linkId ||
    link.examId !== expected.examId ||
    link.riskId !== scope.riskId
  ) {
    throw new Error(
      'Este vínculo não pode ser editado diretamente. Utilize o modal tradicional.',
    );
  }
  if (!canEditInlineParameter(group, link))
    throw new Error('O critério quantitativo não é aplicável a este risco.');
  const patch: Record<string, number | boolean | null> = {};
  for (const field of inlineParameterFields[group]) {
    if (field.startsWith('is')) {
      if (typeof draft[field] !== 'boolean')
        throw new Error('Seleção incompleta. Confira as opções.');
      patch[field] = draft[field] as boolean;
    } else {
      const value = integerOrNull(draft[field], inlineParameterLabels[group]);
      if (
        (group === 'minRiskDegree' || group === 'minRiskDegreeQuantity') &&
        !inlineDegreeOptions.some((option) => option.level === value)
      )
        throw new Error(
          `${inlineParameterLabels[group]}: selecione um dos níveis disponíveis da matriz; não é permitido gravar ausência de nível neste vínculo.`,
        );
      patch[field] = value;
    }
  }
  if (group === 'events' && patch.isPeriodic === true) {
    const validity = integerOrNull(draft.validityInMonths, 'a periodicidade');
    if (validity !== (link.validityInMonths ?? null))
      patch.validityInMonths = validity;
  }
  const result = { ...link, ...patch };
  if (
    result.isPeriodic &&
    (!Number.isSafeInteger(result.validityInMonths) ||
      Number(result.validityInMonths) <= 0)
  )
    throw new Error('Informe a periodicidade para exames periódicos');
  await examRiskSchema.validate({
    isPeriodic: result.isPeriodic,
    validityInMonths:
      result.validityInMonths == null ? '' : String(result.validityInMonths),
  });
  if (
    group === 'age' &&
    patch.fromAge != null &&
    patch.toAge != null &&
    Number(patch.fromAge) > Number(patch.toAge)
  )
    throw new Error('A idade inicial não pode ser maior que a idade final.');
  return {
    id: link.id,
    examId: link.examId,
    riskId: link.riskId,
    companyId: scope.companyId,
    realCompanyId: scope.companyId,
    ...patch,
    publishAsSystemRule: false,
  };
}
