import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SScaleFactorPill } from 'components/atoms/SScaleFactorPill';
import SText from 'components/atoms/SText';

import { getSimpleSstScaleChipColors } from 'core/utils/helpers/simple-sst-scale-chip.util';

/** Largura fixa para caber “Muito Alto” / “Não informado” sem variar linha a linha. */
const RESULT_PILL_MIN_WIDTH = 96;

function ResultPill({
  label,
  level,
}: {
  label: string;
  level?: number | null;
}) {
  const hasLevel = typeof level === 'number' && level > 0;
  const chip = hasLevel
    ? getSimpleSstScaleChipColors(level)
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
  return (
    <SFlex align="center" gap={1} flexWrap="nowrap" sx={{ flexShrink: 0 }}>
      <SText fontSize={11} color="text.secondary" noBreak sx={{ mr: 0.5 }}>
        {label}:
      </SText>
      {empty ? (
        <SText fontSize={12} color="text.disabled" noBreak>
          --
        </SText>
      ) : (
        <>
          <SScaleFactorPill kind="P" value={probability} />
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
          <SScaleFactorPill kind="S" value={severity} />
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
