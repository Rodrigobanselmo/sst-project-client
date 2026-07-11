import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

/** Mesma escala de cores do STag (action 1–6). */
function scaleColor(level?: number | null): string {
  switch (level) {
    case 1:
      return 'scale.low';
    case 2:
      return 'scale.mediumLow';
    case 3:
      return 'scale.medium';
    case 4:
      return 'scale.mediumHigh';
    case 5:
      return 'scale.high';
    case 6:
      return 'common.black';
    default:
      return 'grey.300';
  }
}

function FactorPill({
  kind,
  value,
}: {
  kind: 'P' | 'S';
  value?: number | null;
}) {
  const hasValue = typeof value === 'number' && value > 0;
  const bg = hasValue ? scaleColor(Math.min(value, 6)) : 'grey.200';

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 34,
        height: 22,
        px: 1.5,
        borderRadius: '999px',
        backgroundColor: bg,
        color: hasValue && bg !== 'grey.200' ? 'common.white' : 'text.secondary',
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: 0.2,
        boxShadow: '0px 1px 1px 0px rgb(0 0 0 / 5%)',
      }}
    >
      {hasValue ? `${kind}${value}` : `${kind}--`}
    </Box>
  );
}

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
  const bg = hasLevel ? scaleColor(level) : 'grey.200';

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
        backgroundColor: bg,
        color: hasLevel ? 'common.white' : 'text.secondary',
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
          <FactorPill kind="P" value={probability} />
          <SText
            component="span"
            fontSize={13}
            fontWeight={600}
            color="text.secondary"
            sx={{ lineHeight: 1, px: 0.25 }}
          >
            ×
          </SText>
          <FactorPill kind="S" value={severity} />
          <SText
            component="span"
            fontSize={13}
            fontWeight={600}
            color="text.secondary"
            sx={{ lineHeight: 1, px: 0.25 }}
          >
            =
          </SText>
          <ResultPill label={resultLabel || '--'} level={resultLevel} />
        </>
      )}
    </SFlex>
  );
}
