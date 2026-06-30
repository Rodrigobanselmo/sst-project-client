import { SxProps, Theme } from '@mui/material';

import { ExamOriginEnum, ExamOriginSourceEnum } from 'core/interfaces/api/IExam';

type ChipColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export const EXAM_ORIGIN_LABELS: Record<ExamOriginEnum, string> = {
  [ExamOriginEnum.NR07]: 'NR-07',
  [ExamOriginEnum.SYSTEM]: 'Sistema',
  [ExamOriginEnum.CLIENT]: 'Cliente',
  [ExamOriginEnum.OTHER]: 'Outro',
};

/** @deprecated Prefer getExamOriginChipSx — global MuiChip theme breaks color="info". */
export const EXAM_ORIGIN_CHIP_COLOR: Record<ExamOriginEnum, ChipColor> = {
  [ExamOriginEnum.NR07]: 'secondary',
  [ExamOriginEnum.SYSTEM]: 'default',
  [ExamOriginEnum.CLIENT]: 'success',
  [ExamOriginEnum.OTHER]: 'warning',
};

/** Normalizes API/cache variants (NR07, NR_07, whitespace) to ExamOriginEnum. */
export function normalizeExamOrigin(value?: string | null): ExamOriginEnum {
  if (value == null || String(value).trim() === '') {
    return ExamOriginEnum.OTHER;
  }

  const compact = String(value).trim().toUpperCase().replace(/[-_\s]/g, '');
  if (compact === 'NR07') return ExamOriginEnum.NR07;

  const upper = String(value).trim().toUpperCase();
  if (upper in EXAM_ORIGIN_LABELS) return upper as ExamOriginEnum;

  return ExamOriginEnum.OTHER;
}

/** Always returns a non-empty display label for the origin chip. */
export function getExamOriginLabel(value?: string | null): string {
  return EXAM_ORIGIN_LABELS[normalizeExamOrigin(value)];
}

/**
 * Explicit chip styles — overrides the global MuiChip transparent theme so
 * NR-07 (secondary/blue) is always visible, unlike color="info" which renders blank.
 */
export function getExamOriginChipSx(origin: ExamOriginEnum): SxProps<Theme> {
  const base: SxProps<Theme> = { fontWeight: 600, height: 24 };

  switch (origin) {
    case ExamOriginEnum.NR07:
      return {
        ...base,
        backgroundColor: 'secondary.main',
        color: 'secondary.contrastText',
        border: '1px solid',
        borderColor: 'secondary.main',
      };
    case ExamOriginEnum.SYSTEM:
      return {
        ...base,
        backgroundColor: 'grey.100',
        color: 'text.primary',
        border: '1px solid',
        borderColor: 'grey.400',
      };
    case ExamOriginEnum.CLIENT:
      return {
        ...base,
        backgroundColor: 'success.main',
        color: 'common.white',
        border: '1px solid',
        borderColor: 'success.main',
      };
    default:
      return {
        ...base,
        backgroundColor: 'warning.main',
        color: 'text.primary',
        border: '1px solid',
        borderColor: 'warning.main',
      };
  }
}

/**
 * Normaliza variantes da fonte técnica/normativa acumulativa (NR07/NR_07,
 * ACGIH-BEI/ACGIH_BEI, espaços) para ExamOriginSourceEnum. Retorna undefined
 * para valores desconhecidos, para que o chamador possa ignorá-los.
 */
export function normalizeExamOriginSource(
  value?: string | null,
): ExamOriginSourceEnum | undefined {
  if (value == null || String(value).trim() === '') return undefined;

  const compact = String(value).trim().toUpperCase().replace(/[-_\s]/g, '');
  switch (compact) {
    case 'ESOCIALT27':
    case 'ESOCIAL':
    case 'T27':
    case 'TABELA27':
      return ExamOriginSourceEnum.ESOCIAL_T27;
    case 'NR07':
      return ExamOriginSourceEnum.NR_07;
    case 'ACGIHBEI':
      return ExamOriginSourceEnum.ACGIH_BEI;
    case 'SYSTEM':
      return ExamOriginSourceEnum.SYSTEM;
    case 'CLIENT':
    case 'COMPANY':
      return ExamOriginSourceEnum.CLIENT;
    case 'OTHER':
      return ExamOriginSourceEnum.OTHER;
    default:
      return undefined;
  }
}

/**
 * Estilo do chip por fonte técnica/normativa. NR-7 reaproveita o azul
 * (secondary); ACGIH/BEI recebe uma cor distinta (info) para diferenciar a
 * fonte técnica; SYSTEM/CLIENT/OTHER seguem o padrão da origem legada.
 */
export function getExamOriginSourceChipSx(
  source: ExamOriginSourceEnum,
): SxProps<Theme> {
  const base: SxProps<Theme> = { fontWeight: 600, height: 24 };

  switch (source) {
    case ExamOriginSourceEnum.ESOCIAL_T27:
      // Azul-acinzentado informativo — distinto de NR-7 (azul) e ACGIH/BEI
      // (info), sem cor de erro/alerta.
      return {
        ...base,
        backgroundColor: '#475569',
        color: 'common.white',
        border: '1px solid',
        borderColor: '#475569',
      };
    case ExamOriginSourceEnum.NR_07:
      return {
        ...base,
        backgroundColor: 'secondary.main',
        color: 'secondary.contrastText',
        border: '1px solid',
        borderColor: 'secondary.main',
      };
    case ExamOriginSourceEnum.ACGIH_BEI:
      return {
        ...base,
        backgroundColor: 'info.main',
        color: 'common.white',
        border: '1px solid',
        borderColor: 'info.main',
      };
    case ExamOriginSourceEnum.SYSTEM:
      return {
        ...base,
        backgroundColor: 'grey.100',
        color: 'text.primary',
        border: '1px solid',
        borderColor: 'grey.400',
      };
    case ExamOriginSourceEnum.CLIENT:
      return {
        ...base,
        backgroundColor: 'success.main',
        color: 'common.white',
        border: '1px solid',
        borderColor: 'success.main',
      };
    default:
      return {
        ...base,
        backgroundColor: 'warning.main',
        color: 'text.primary',
        border: '1px solid',
        borderColor: 'warning.main',
      };
  }
}

export const EXAM_ORIGIN_FILTER_OPTIONS: {
  value: ExamOriginEnum | '';
  label: string;
}[] = [
  { value: '', label: 'Todos' },
  { value: ExamOriginEnum.NR07, label: EXAM_ORIGIN_LABELS[ExamOriginEnum.NR07] },
  {
    value: ExamOriginEnum.SYSTEM,
    label: EXAM_ORIGIN_LABELS[ExamOriginEnum.SYSTEM],
  },
  {
    value: ExamOriginEnum.CLIENT,
    label: EXAM_ORIGIN_LABELS[ExamOriginEnum.CLIENT],
  },
  { value: ExamOriginEnum.OTHER, label: EXAM_ORIGIN_LABELS[ExamOriginEnum.OTHER] },
];
