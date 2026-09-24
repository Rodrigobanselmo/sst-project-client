import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SScaleFactorPill } from 'components/atoms/SScaleFactorPill';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import { useSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/hooks/useSystemRiskMatrixPresentation';
import {
  resolveAxisLevelTooltip,
  type AxisLevelTooltipItem,
  type CoverageSubtypeInput,
} from '@v2/services/security/risk-matrix/presentation/axis-level-tooltip.util';
import { resolveDisplayedAxisLevelChipColors } from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';
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
  matrixSource?: string | null;
  axisLevelColors?: Array<{ value: number; color: string }> | null;
  pinnedAxisLevels?: AxisLevelTooltipItem[] | null;
  evaluatedCoverageKey?: string | null;
  riskType?: string | null;
  riskSubTypes?: CoverageSubtypeInput[] | null;
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
  matrixSource,
  axisLevelColors,
  pinnedAxisLevels,
  evaluatedCoverageKey,
  riskType,
  riskSubTypes,
  empty,
  isQuantity,
  quantitativePresentation,
}: MatrixEquationProps) {
  const presentation = useSystemRiskMatrixPresentation();
  const axisTooltip = (kind: 'P' | 'S', value?: number | null) =>
    resolveAxisLevelTooltip({
      kind,
      value,
      matrixSource,
      pinnedAxisLevels,
      systemAxisLevels: presentation?.axisLevels,
      extraordinaryLabel: presentation?.extraordinaryProbability?.label,
      evaluatedCoverageKey,
      riskType,
      subTypes: riskSubTypes,
    });

  const scalePill = (kind: 'P' | 'S', value?: number | null) => {
    const pill = (
      <SScaleFactorPill
        kind={kind}
        value={value}
        chipColors={resolveDisplayedAxisLevelChipColors({
          value,
          matrixSource,
          axisLevelColors,
          systemPresentation: presentation,
        })}
      />
    );
    const tooltip = axisTooltip(kind, value);
    if (!tooltip) return pill;
    return (
      <STooltip
        withWrapper
        placement="top"
        title={
          <Box component="span" sx={{ display: 'block' }}>
            <Box component="span" sx={{ display: 'block', fontWeight: 700 }}>
              {tooltip.heading}
            </Box>
            {tooltip.criterion ? (
              <Box
                component="span"
                sx={{ display: 'block', fontWeight: 400, whiteSpace: 'pre-line' }}
              >
                {tooltip.criterion}
              </Box>
            ) : null}
          </Box>
        }
      >
        {pill}
      </STooltip>
    );
  };

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
          {scalePill('P', probability)}
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
          {scalePill('S', severity)}
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
