import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SScaleFactorPill } from 'components/atoms/SScaleFactorPill';
import SText from 'components/atoms/SText';

import { useSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/hooks/useSystemRiskMatrixPresentation';
import {
  resolveSystemAxisLevelChipColors,
  resolveSystemOccupationalChipColors,
} from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';

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

export type MatrixEquationProps = {
  label: string;
  probability?: number | null;
  severity?: number | null;
  resultLabel?: string | null;
  resultLevel?: number | null;
  /** Quando true, mostra só “--” no lugar da equação (ex.: residual ausente). */
  empty?: boolean;
};

export function MatrixEquation({
  label,
  probability,
  severity,
  resultLabel,
  resultLevel,
  empty,
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
      ) : !probability && resultLevel ? (
        // Quantitativo: RO vem do level — não montar equação P e S.
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
