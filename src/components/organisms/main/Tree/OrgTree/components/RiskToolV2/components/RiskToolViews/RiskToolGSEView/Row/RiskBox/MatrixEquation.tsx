import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SScaleFactorPill } from 'components/atoms/SScaleFactorPill';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import { useSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/hooks/useSystemRiskMatrixPresentation';
import {
  resolveSystemAxisLevelChipColors,
  resolveSystemOccupationalChipColors,
} from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';
import {
  QuantitativeCollapsedPresentation,
} from 'core/utils/helpers/format-quantitative-evidence.util';

/** Largura fixa para caber “Muito Alto” / “Não informado” sem variar linha a linha. */
const RESULT_PILL_MIN_WIDTH = 96;

function ResultPill({
  label,
  level,
}: {
  label: string;
  level?: number | null;
}) {
  const presentation = useSystemRiskMatrixPresentation();
  const hasLevel = typeof level === 'number' && level > 0;
  const chip = hasLevel
    ? resolveSystemOccupationalChipColors(level, presentation)
    : { bgcolor: 'grey.200', color: 'text.secondary' };

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: RESULT_PILL_MIN_WIDTH,
        width: RESULT_PILL_MIN_WIDTH,
        height: 22,
        px: 1.5,
        borderRadius: '999px',
        backgroundColor: chip.bgcolor,
        color: chip.color,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        boxShadow: '0px 1px 1px 0px rgb(0 0 0 / 5%)',
      }}
    >
      {label || '--'}
    </Box>
  );
}

function QuantitativeCollapsedEquation({
  presentation,
  resultLabel,
  resultLevel,
}: {
  presentation?: QuantitativeCollapsedPresentation | null;
  resultLabel?: string | null;
  resultLevel?: number | null;
}) {
  const mode = presentation?.mode ?? 'none';
  const quantLabel = (
    <SText fontSize={11} fontWeight={600} color="text.secondary" noBreak>
      Quantitativo
    </SText>
  );

  const evidenceInline =
    (mode === 'single' || mode === 'multiple') && presentation?.inlineEvidence
      ? presentation.inlineEvidence
      : null;

  const evidenceBlock = evidenceInline ? (
    <>
      <SText
        component="span"
        fontSize={11}
        color="text.secondary"
        sx={{ lineHeight: 1, px: 0.25 }}
      >
        ·
      </SText>
      <SText fontSize={11} color="text.secondary" noBreak>
        {evidenceInline}
      </SText>
    </>
  ) : null;

  const leftSide =
    mode === 'multiple' && presentation?.tooltip ? (
      <STooltip
        withWrapper
        title={
          <Box
            component="span"
            sx={{ whiteSpace: 'pre-line', display: 'block' }}
          >
            {presentation.tooltip}
          </Box>
        }
        placement="top"
      >
        <SFlex align="center" gap={1} flexWrap="nowrap">
          {quantLabel}
          {evidenceBlock}
        </SFlex>
      </STooltip>
    ) : (
      <SFlex align="center" gap={1} flexWrap="nowrap">
        {quantLabel}
        {evidenceBlock}
      </SFlex>
    );

  return (
    <SFlex align="center" gap={1} flexWrap="nowrap" sx={{ flexShrink: 0 }}>
      {leftSide}
      <SText
        component="span"
        fontSize={13}
        fontWeight={600}
        color="text.secondary"
        sx={{ lineHeight: 1, px: 0.25 }}
      >
        →
      </SText>
      <ResultPill label={resultLabel || '--'} level={resultLevel} />
    </SFlex>
  );
}

export type MatrixEquationProps = {
  label: string;
  probability?: number | null;
  severity?: number | null;
  resultLabel?: string | null;
  resultLevel?: number | null;
  /** Quando true, mostra só “--” no lugar da equação (ex.: residual ausente). */
  empty?: boolean;
  /** Risco inerente quantitativo: medição → RO (sem P/S). */
  isQuantity?: boolean;
  quantitativePresentation?: QuantitativeCollapsedPresentation | null;
};

export function MatrixEquation({
  label,
  probability,
  severity,
  resultLabel,
  resultLevel,
  empty,
  isQuantity,
  quantitativePresentation,
}: MatrixEquationProps) {
  const presentation = useSystemRiskMatrixPresentation();

  return (
    <SFlex align="center" gap={1} flexWrap="nowrap" sx={{ flexShrink: 0 }}>
      <SText fontSize={11} color="text.secondary" noBreak sx={{ mr: 0.5 }}>
        {label}:
      </SText>
      {empty ? (
        <SText fontSize={12} color="text.disabled" noBreak>
          --
        </SText>
      ) : isQuantity && resultLevel ? (
        <QuantitativeCollapsedEquation
          presentation={quantitativePresentation}
          resultLabel={resultLabel}
          resultLevel={resultLevel}
        />
      ) : !probability && resultLevel ? (
        // Fallback legado quantitativo sem flag explícita.
        <ResultPill label={resultLabel || '--'} level={resultLevel} />
      ) : (
        <>
          <SScaleFactorPill
            kind="P"
            value={probability}
            chipColors={resolveSystemAxisLevelChipColors(
              probability,
              presentation,
            )}
          />
          <SText
            component="span"
            fontSize={11}
            fontWeight={500}
            color="text.secondary"
            sx={{ lineHeight: 1, px: 0.25 }}
            title="Probabilidade e Severidade → Risco Ocupacional"
          >
            e
          </SText>
          <SScaleFactorPill
            kind="S"
            value={severity}
            chipColors={resolveSystemAxisLevelChipColors(severity, presentation)}
          />
          <SText
            component="span"
            fontSize={13}
            fontWeight={600}
            color="text.secondary"
            sx={{ lineHeight: 1, px: 0.25 }}
          >
            →
          </SText>
          <ResultPill label={resultLabel || '--'} level={resultLevel} />
        </>
      )}
    </SFlex>
  );
}
