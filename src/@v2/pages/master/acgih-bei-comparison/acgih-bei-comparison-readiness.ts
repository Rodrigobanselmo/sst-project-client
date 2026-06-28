import { getPendencyMessage } from '@v2/pages/master/biological-indicators/biological-indicator-labels.util';
import { AcgihBeiIndicatorConfidenceEnum } from '@v2/services/medicine/acgih-bei-indicator/service/acgih-bei-indicator.types';
import type { IAcgihBeiComparisonRow } from '@v2/services/medicine/acgih-bei-comparison/service/acgih-bei-comparison.types';

/**
 * 4L.1b — helpers de leitura (Client-only). Calculam sinais de readiness e
 * fazem parsing seguro do technicalDiff. NÃO alteram dados nem a string original
 * vinda da API. Tudo aqui é apenas apresentação.
 */

export type ReadinessChipColor =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type ReadinessChip = {
  key: string;
  label: string;
  color: ReadinessChipColor;
  tooltip?: string;
};

/** Sinais de contexto/readiness por linha, a partir dos campos enriquecidos (4L.1a). */
export const getComparisonReadiness = (
  row: IAcgihBeiComparisonRow,
): ReadinessChip[] => {
  const chips: ReadinessChip[] = [];

  // ── ACGIH/BEI ───────────────────────────────────────────────────────────────
  if (row.confidence === AcgihBeiIndicatorConfidenceEnum.LOW) {
    chips.push({
      key: 'acgih-low',
      label: 'ACGIH baixa confiança',
      color: 'error',
      tooltip: 'Transcrição ACGIH/BEI com baixa confiança. Revisar contra a fonte.',
    });
  }
  if (row.acgihBeiStatus === 'DRAFT') {
    chips.push({
      key: 'acgih-draft',
      label: 'ACGIH rascunho',
      color: 'warning',
      tooltip: 'O item ACGIH/BEI ainda está em rascunho na base de origem.',
    });
  } else if (row.acgihBeiStatus === 'ACTIVE') {
    chips.push({
      key: 'acgih-active',
      label: 'ACGIH ativo',
      color: 'success',
      tooltip: 'O item ACGIH/BEI está ativo na base de origem.',
    });
  }
  if (row.acgihBeiIsCurated === false) {
    chips.push({
      key: 'acgih-uncurated',
      label: 'ACGIH não curado',
      color: 'warning',
      tooltip: 'O item ACGIH/BEI ainda não foi marcado como curado/revisado.',
    });
  } else if (row.acgihBeiIsCurated === true) {
    chips.push({
      key: 'acgih-curated',
      label: 'ACGIH curado',
      color: 'success',
      tooltip: 'O item ACGIH/BEI foi marcado como curado/revisado.',
    });
  }

  // ── NR-7 ─────────────────────────────────────────────────────────────────────
  if (row.nr7IndicatorId) {
    if ((row.nr7PendencyCount ?? 0) > 0) {
      const codes = row.nr7PendencyCodes ?? [];
      const tooltip = codes.length
        ? `Pendências NR-7:\n${codes
            .map((code) => `- ${getPendencyMessage(code)}`)
            .join('\n')}`
        : 'O indicador NR-7 relacionado possui pendências de ativação.';
      chips.push({
        key: 'nr7-pendency',
        label: `NR-7 com pendências (${row.nr7PendencyCount})`,
        color: 'warning',
        tooltip,
      });
    }
    if (row.nr7Status === 'DRAFT') {
      chips.push({
        key: 'nr7-draft',
        label: 'NR-7 rascunho',
        color: 'warning',
        tooltip: 'O indicador NR-7 relacionado ainda está em rascunho.',
      });
    } else if (row.nr7Status === 'ACTIVE') {
      chips.push({
        key: 'nr7-active',
        label: 'NR-7 ativo',
        color: 'success',
        tooltip: 'O indicador NR-7 relacionado está ativo.',
      });
    }
  }

  // ── Biblioteca Risco × Exame ─────────────────────────────────────────────────
  if (row.examRiskRuleId) {
    if (row.examRiskRuleStatus === 'DRAFT') {
      chips.push({
        key: 'rule-draft',
        label: 'Regra rascunho',
        color: 'warning',
        tooltip: 'A regra relacionada na Biblioteca ainda está em rascunho.',
      });
    } else if (row.examRiskRuleStatus === 'ACTIVE') {
      chips.push({
        key: 'rule-active',
        label: 'Regra ativa',
        color: 'success',
        tooltip: 'A regra relacionada na Biblioteca está ativa.',
      });
    }
    if (row.examRiskRuleIsCurated === true) {
      chips.push({
        key: 'rule-curated',
        label: 'Regra curada',
        color: 'success',
        tooltip: 'A regra relacionada foi curada manualmente.',
      });
    }
  }

  // ── Fonte complementar ───────────────────────────────────────────────────────
  if (row.hasComplementaryReference) {
    chips.push({
      key: 'reference',
      label: 'Fonte complementar registrada',
      color: 'success',
      tooltip:
        'A ACGIH/BEI já está registrada como fonte complementar desta regra. Nenhum novo registro necessário.',
    });
  }

  return chips;
};

export type TechnicalDiffPart = {
  key: string;
  label: string;
  detail: string;
};

const DIFF_PREFIX_LABELS: Array<{ match: RegExp; key: string; label: string }> = [
  { match: /^determinante/i, key: 'determinante', label: 'Determinante' },
  { match: /^matriz/i, key: 'matriz', label: 'Matriz' },
  { match: /^momento/i, key: 'momento', label: 'Momento de coleta' },
  { match: /^valor/i, key: 'valor', label: 'Valor' },
  { match: /^unidade/i, key: 'unidade', label: 'Unidade' },
];

/**
 * Parsing seguro do technicalDiff (texto livre vindo da API). Formato esperado:
 * `prefixo: ACGIH "x" × NR-7 "y" | prefixo2: ...`. Se o formato não permitir
 * parsing confiável, devolve uma única parte "Outro" com o texto integral.
 */
export const parseTechnicalDiff = (
  diff?: string | null,
): TechnicalDiffPart[] => {
  const raw = (diff ?? '').trim();
  if (!raw) return [];

  return raw
    .split('|')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment, index) => {
      const separatorIndex = segment.indexOf(':');
      if (separatorIndex === -1) {
        return { key: `outro-${index}`, label: 'Outro', detail: segment };
      }
      const prefix = segment.slice(0, separatorIndex).trim();
      const detail = segment.slice(separatorIndex + 1).trim();
      const known = DIFF_PREFIX_LABELS.find((item) => item.match.test(prefix));
      return {
        key: `${known?.key ?? 'outro'}-${index}`,
        label: known?.label ?? prefix,
        detail: detail || segment,
      };
    });
};
