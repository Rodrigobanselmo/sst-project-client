import { Box, Stack, Tooltip, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { getCharacterizationTypeLabel } from './characterization-type-label';

export type SimilarityRiskOrigin =
  | 'OWN'
  | 'REPRESENTATIVE_ANCESTOR'
  | 'UNAVAILABLE';

type Props = {
  elementName: string;
  /** Raw API enum (WORKSTATION, …) — displayed via Portuguese label only. */
  elementType?: string;
  origin: SimilarityRiskOrigin;
  representativeSourceName?: string;
  representativeDistance?: number;
  compact?: boolean;
};

const ORIGIN_META: Record<
  SimilarityRiskOrigin,
  {
    marker: string;
    label: string;
    ariaLabel: string;
    sx: SxProps<Theme>;
  }
> = {
  OWN: {
    marker: '●',
    label: 'Riscos próprios',
    ariaLabel: 'Riscos próprios',
    sx: {
      borderColor: 'success.dark',
      bgcolor: (t) =>
        t.palette.mode === 'dark'
          ? 'rgba(46, 125, 50, 0.22)'
          : 'rgba(232, 245, 233, 1)',
      color: (t) =>
        t.palette.mode === 'dark' ? 'success.light' : 'success.dark',
    },
  },
  REPRESENTATIVE_ANCESTOR: {
    marker: '↳',
    label: 'Riscos de ancestral representativo',
    ariaLabel: 'Riscos de ancestral representativo',
    sx: {
      borderColor: 'warning.dark',
      bgcolor: (t) =>
        t.palette.mode === 'dark'
          ? 'rgba(237, 108, 2, 0.18)'
          : 'rgba(255, 243, 224, 1)',
      color: (t) =>
        t.palette.mode === 'dark' ? 'common.white' : 'primary.dark',
    },
  },
  UNAVAILABLE: {
    marker: '!',
    label: 'Dados insuficientes',
    ariaLabel: 'Dados insuficientes',
    sx: {
      borderColor: 'grey.500',
      bgcolor: (t) =>
        t.palette.mode === 'dark'
          ? 'rgba(158, 158, 158, 0.16)'
          : 'grey.100',
      color: (t) =>
        t.palette.mode === 'dark' ? 'grey.100' : 'grey.800',
    },
  },
};

/**
 * Consultative risk-origin badge — visual only; does not alter scoring contracts.
 */
export function SimilarityRiskOriginBadge({
  elementName,
  elementType,
  origin,
  representativeSourceName,
  representativeDistance,
  compact = false,
}: Props) {
  const meta = ORIGIN_META[origin];
  const typeLabel = elementType
    ? getCharacterizationTypeLabel(elementType)
    : undefined;
  const displayName = typeLabel
    ? `${elementName} (${typeLabel})`
    : elementName;
  const ancestorHint =
    origin === 'REPRESENTATIVE_ANCESTOR' && representativeSourceName
      ? `Ancestral: ${representativeSourceName}${
          representativeDistance != null
            ? ` (distância ${representativeDistance})`
            : ''
        }`
      : undefined;

  const title = [displayName, meta.label, ancestorHint]
    .filter(Boolean)
    .join(' — ');

  return (
    <Tooltip title={title}>
      <Box
        component="span"
        role="status"
        aria-label={`${displayName}. ${meta.ariaLabel}${
          ancestorHint ? `. ${ancestorHint}` : ''
        }`}
        sx={{
          display: 'inline-flex',
          maxWidth: '100%',
          border: '1px solid',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          lineHeight: 1.25,
          ...meta.sx,
        }}
      >
        <Stack spacing={0.15} sx={{ minWidth: 0, maxWidth: compact ? 280 : 360 }}>
          <Typography
            component="span"
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'inherit',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayName}
          </Typography>
          <Typography
            component="span"
            variant="caption"
            sx={{
              fontWeight: 400,
              color: 'inherit',
              opacity: 0.92,
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {meta.marker} {meta.label}
          </Typography>
          {ancestorHint ? (
            <Typography
              component="span"
              variant="caption"
              sx={{
                fontWeight: 400,
                color: 'inherit',
                opacity: 0.8,
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {representativeSourceName}
            </Typography>
          ) : null}
        </Stack>
      </Box>
    </Tooltip>
  );
}
