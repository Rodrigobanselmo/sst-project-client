import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SScaleFactorPill } from 'components/atoms/SScaleFactorPill';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import { useSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/hooks/useSystemRiskMatrixPresentation';
import { resolveSystemAxisLevelChipColors } from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';
import {
  QuantitativeCollapsedPresentation,
} from 'core/utils/helpers/format-quantitative-evidence.util';
import { OccupationalRiskResultPill } from 'components/organisms/main/Tree/OrgTree/components/OccupationalRiskResultPill';

function QuantitativeCollapsedEquation({
  presentation,
  resultLabel,
  resultLevel,
  resultColor,
}: {
  presentation?: QuantitativeCollapsedPresentation | null;
  resultLabel?: string | null;
  resultLevel?: number | null;
  resultColor?: string | null;
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
      <OccupationalRiskResultPill
        label={resultLabel || '--'}
        level={resultLevel}
        resultColor={resultColor}
      />
    </SFlex>
  );
}

export type MatrixEquationProps = {
  label: string;
  probability?: number | null;
  severity?: number | null;
  resultLabel?: string | null;
  resultLevel?: number | null;
  /** Hex CUSTOM do snapshot (opcional). */
  resultColor?: string | null;
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
  resultColor,
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
          resultColor={resultColor}
        />
      ) : !probability && resultLevel ? (
        // Fallback legado quantitativo sem flag explícita.
        <OccupationalRiskResultPill
          label={resultLabel || '--'}
          level={resultLevel}
          resultColor={resultColor}
        />
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
          <OccupationalRiskResultPill
            label={resultLabel || '--'}
            level={resultLevel}
            resultColor={resultColor}
          />
        </>
      )}
    </SFlex>
  );
}
