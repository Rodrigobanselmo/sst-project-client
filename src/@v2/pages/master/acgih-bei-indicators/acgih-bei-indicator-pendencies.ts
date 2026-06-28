import { AcgihBeiIndicatorConfidenceEnum } from '@v2/services/medicine/acgih-bei-indicator/service/acgih-bei-indicator.types';

/**
 * Cálculo de pendências/readiness ACGIH/BEI — 100% no Client.
 *
 * IMPORTANTE: não persiste nada, não chama backend e não altera schema/regra.
 * É apenas apoio visual de curadoria, derivado dos campos já presentes no
 * payload do indicador (ou no estado do formulário de edição).
 */

export type AcgihBeiPendencySeverity = 'critical' | 'warning';

export type AcgihBeiPendencyCode =
  | 'CONFIDENCE_LOW'
  | 'CONFIDENCE_MISSING'
  | 'DETERMINANT_MISSING'
  | 'MATRIX_MISSING'
  | 'SAMPLING_TIME_MISSING'
  | 'BEI_VALUE_MISSING'
  | 'UNIT_MISSING'
  | 'CAS_MISSING'
  | 'SOURCE_YEAR_MISSING'
  | 'SOURCE_PAGE_MISSING';

export type AcgihBeiPendency = {
  code: AcgihBeiPendencyCode;
  message: string;
  severity: AcgihBeiPendencySeverity;
};

/** Mensagens legíveis em PT-BR para cada pendência. */
export const ACGIH_BEI_PENDENCY_MESSAGES: Record<AcgihBeiPendencyCode, string> = {
  CONFIDENCE_LOW: 'Confiança baixa',
  CONFIDENCE_MISSING: 'Confiança não informada',
  DETERMINANT_MISSING: 'Determinante ausente',
  MATRIX_MISSING: 'Matriz biológica ausente',
  SAMPLING_TIME_MISSING: 'Momento de coleta ausente',
  BEI_VALUE_MISSING: 'Valor BEI ausente',
  UNIT_MISSING: 'Unidade ausente',
  CAS_MISSING: 'CAS ausente',
  SOURCE_YEAR_MISSING: 'Ano/fonte ausente',
  SOURCE_PAGE_MISSING: 'Página/fonte ausente',
};

/**
 * Entrada genérica aceita tanto o payload salvo (IAcgihBeiIndicator) quanto o
 * estado do formulário de edição (anos como string, confiança como '' ).
 */
export type AcgihBeiReadinessInput = {
  cas?: string | null;
  determinant?: string | null;
  biologicalMatrix?: string | null;
  samplingTime?: string | null;
  beiValue?: string | null;
  unit?: string | null;
  referenceYear?: number | string | null;
  sourceYear?: number | string | null;
  sourcePage?: string | null;
  confidence?: AcgihBeiIndicatorConfidenceEnum | '' | null;
  isCurated?: boolean;
};

const isBlank = (value?: number | string | null): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'number') return Number.isNaN(value);
  return value.trim() === '';
};

/** Calcula as pendências de um item, em ordem (críticas primeiro). */
export const getAcgihBeiPendencies = (
  input: AcgihBeiReadinessInput,
): AcgihBeiPendency[] => {
  const pendencies: AcgihBeiPendency[] = [];

  const push = (code: AcgihBeiPendencyCode, severity: AcgihBeiPendencySeverity) =>
    pendencies.push({
      code,
      severity,
      message: ACGIH_BEI_PENDENCY_MESSAGES[code],
    });

  // ── Críticas ──────────────────────────────────────────────────────────────
  if (input.confidence === AcgihBeiIndicatorConfidenceEnum.LOW) {
    push('CONFIDENCE_LOW', 'critical');
  } else if (isBlank(input.confidence)) {
    push('CONFIDENCE_MISSING', 'critical');
  }
  if (isBlank(input.determinant)) push('DETERMINANT_MISSING', 'critical');
  if (isBlank(input.biologicalMatrix)) push('MATRIX_MISSING', 'critical');
  if (isBlank(input.samplingTime)) push('SAMPLING_TIME_MISSING', 'critical');
  if (isBlank(input.beiValue)) push('BEI_VALUE_MISSING', 'critical');
  if (isBlank(input.unit)) push('UNIT_MISSING', 'critical');

  // ── Avisos / recomendados ───────────────────────────────────────────────────
  if (isBlank(input.cas)) push('CAS_MISSING', 'warning');
  if (isBlank(input.referenceYear) && isBlank(input.sourceYear)) {
    push('SOURCE_YEAR_MISSING', 'warning');
  }
  if (isBlank(input.sourcePage)) push('SOURCE_PAGE_MISSING', 'warning');

  return pendencies;
};

export const countCriticalPendencies = (pendencies: AcgihBeiPendency[]): number =>
  pendencies.filter((item) => item.severity === 'critical').length;

export type AcgihBeiChecklistItem = {
  label: string;
  done: boolean;
  severity: AcgihBeiPendencySeverity;
  guidance?: string;
};

/**
 * Constrói o checklist de readiness em chave positiva (o que já está pronto e o
 * que falta) para apoio do curador no modal. Não bloqueia nada.
 */
export const buildAcgihBeiChecklist = (
  input: AcgihBeiReadinessInput,
): AcgihBeiChecklistItem[] => {
  const codes = new Set(getAcgihBeiPendencies(input).map((item) => item.code));

  return [
    {
      label: 'Confiança informada e diferente de baixa',
      done: !codes.has('CONFIDENCE_LOW') && !codes.has('CONFIDENCE_MISSING'),
      severity: 'critical',
      guidance:
        'Informe a confiança de transcrição. Itens com confiança baixa devem ser revisados contra a fonte.',
    },
    {
      label: 'Determinante preenchido',
      done: !codes.has('DETERMINANT_MISSING'),
      severity: 'critical',
      guidance: 'Preencha o determinante biológico do indicador.',
    },
    {
      label: 'Matriz biológica preenchida',
      done: !codes.has('MATRIX_MISSING'),
      severity: 'critical',
      guidance: 'Informe a matriz biológica (urina, sangue, soro/plasma...).',
    },
    {
      label: 'Momento de coleta preenchido',
      done: !codes.has('SAMPLING_TIME_MISSING'),
      severity: 'critical',
      guidance: 'Informe o momento de amostragem/coleta.',
    },
    {
      label: 'Valor BEI preenchido',
      done: !codes.has('BEI_VALUE_MISSING'),
      severity: 'critical',
      guidance: 'Informe o valor BEI de referência.',
    },
    {
      label: 'Unidade preenchida',
      done: !codes.has('UNIT_MISSING'),
      severity: 'critical',
      guidance: 'Informe a unidade do valor BEI.',
    },
    {
      label: 'CAS informado',
      done: !codes.has('CAS_MISSING'),
      severity: 'warning',
      guidance: 'Recomendado: informe o CAS para melhorar a correspondência técnica.',
    },
    {
      label: 'Ano/fonte informado',
      done: !codes.has('SOURCE_YEAR_MISSING'),
      severity: 'warning',
      guidance: 'Recomendado: informe o ano de referência ou o ano da fonte.',
    },
    {
      label: 'Página/fonte informada',
      done: !codes.has('SOURCE_PAGE_MISSING'),
      severity: 'warning',
      guidance: 'Recomendado: informe a página/fonte para rastreabilidade.',
    },
    {
      label: 'Item marcado como curado/revisado',
      done: Boolean(input.isCurated),
      severity: 'warning',
      guidance:
        'Quando aplicável, marque como curado/revisado após conferir os dados contra a fonte.',
    },
  ];
};
