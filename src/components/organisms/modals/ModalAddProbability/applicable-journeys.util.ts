export type JourneyConsistencyStatus =
  | 'CONSISTENTE_COMPLETO'
  | 'CONSISTENTE_INCOMPLETO'
  | 'CONFLITANTE'
  | 'DESCONHECIDO';

export type ApplicableJourneyOption = {
  durationMinutes: number;
  shiftNames: string[];
  employeeCount: number;
};

export type ApplicableJourneys = {
  status: JourneyConsistencyStatus;
  coveredEmployeeCount: number;
  knownJourneyCount: number;
  options: ApplicableJourneyOption[];
  suggestedMinutes: number | null;
};

export const emptyApplicableJourneys: ApplicableJourneys = {
  status: 'DESCONHECIDO',
  coveredEmployeeCount: 0,
  knownJourneyCount: 0,
  options: [],
  suggestedMinutes: null,
};

const STATUS_SET = new Set<JourneyConsistencyStatus>([
  'CONSISTENTE_COMPLETO',
  'CONSISTENTE_INCOMPLETO',
  'CONFLITANTE',
  'DESCONHECIDO',
]);

/** Garante os quatro estados mesmo se a API omitir `status` (contagens/options bastam). */
export function normalizeApplicableJourneys(
  raw: Partial<ApplicableJourneys> | null | undefined,
): ApplicableJourneys {
  const coveredEmployeeCount = raw?.coveredEmployeeCount ?? 0;
  const knownJourneyCount = raw?.knownJourneyCount ?? 0;
  const options = raw?.options ?? [];
  const suggestedMinutes =
    raw?.suggestedMinutes === undefined ? null : raw.suggestedMinutes;

  let status: JourneyConsistencyStatus | undefined =
    raw?.status && STATUS_SET.has(raw.status) ? raw.status : undefined;

  if (!status) {
    if (options.length > 1) status = 'CONFLITANTE';
    else if (options.length === 1 && knownJourneyCount < coveredEmployeeCount) {
      status = 'CONSISTENTE_INCOMPLETO';
    } else if (options.length === 1) status = 'CONSISTENTE_COMPLETO';
    else status = 'DESCONHECIDO';
  }

  return {
    status,
    coveredEmployeeCount,
    knownJourneyCount,
    options,
    suggestedMinutes:
      status === 'CONFLITANTE' || status === 'DESCONHECIDO'
        ? null
        : suggestedMinutes ?? (options.length === 1 ? options[0].durationMinutes : null),
  };
}
