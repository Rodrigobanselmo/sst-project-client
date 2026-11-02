import { Alert, Box, Chip, Link, Stack, Typography } from '@mui/material';
import {
  legalDeadlineSummary,
  type EventDeadlinePresentation,
} from './legal-deadline-model';

/** A server-calculated aid to conference, never a transmission or input step. */
export function LegalDeadlineSummary({
  value,
  label = 'Prazo legal do evento',
  compact = false,
}: {
  value?: EventDeadlinePresentation | null;
  label?: string;
  compact?: boolean;
}) {
  const summary = legalDeadlineSummary(value);
  if (!summary) return null;
  if (compact)
    return (
      <Box
        role="region"
        aria-label={label}
        sx={{ mt: '16px', minWidth: 0, overflowWrap: 'anywhere' }}
      >
        <Typography variant="body2">
          {summary.simulation ? 'Simulação · ' : ''}
          {summary.title}
        </Typography>
        {summary.dueLabel && (
          <Typography variant="body2">{summary.dueLabel}</Typography>
        )}
        {summary.immediateNote && (
          <Typography variant="body2">{summary.immediateNote}</Typography>
        )}
      </Box>
    );
  return (
    <Box
      role="region"
      aria-label={label}
      sx={{
        minWidth: 0,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: '16px',
      }}
    >
      <Stack spacing={8} useFlexGap>
        <Typography variant="subtitle2">Prazo legal</Typography>
        {summary.simulation && (
          <Chip
            size="small"
            color="info"
            label="Simulação · produção restrita"
            sx={{
              alignSelf: 'flex-start',
              maxWidth: '100%',
              height: 'auto',
              '& .MuiChip-label': { whiteSpace: 'normal', py: '4px' },
            }}
          />
        )}
        <Alert
          severity={summary.severity}
          sx={{
            minWidth: 0,
            '& .MuiAlert-message': { minWidth: 0, overflowWrap: 'anywhere' },
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {summary.title}
          </Typography>
          <Typography variant="body2" sx={{ mt: '8px' }}>
            {summary.message}
          </Typography>
          {summary.dueLabel && (
            <Typography variant="body2" fontWeight={600} sx={{ mt: '8px' }}>
              {summary.dueLabel}
            </Typography>
          )}
          {summary.immediateNote && (
            <Typography variant="body2" sx={{ mt: '8px' }}>
              {summary.immediateNote}
            </Typography>
          )}
          {summary.simulation && (
            <Typography variant="body2" sx={{ mt: '8px' }}>
              Este ambiente de testes não cumpre a obrigação legal de produção.
            </Typography>
          )}
        </Alert>
        <Box component="details" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          <Box
            component="summary"
            sx={{
              cursor: 'pointer',
              fontSize: '0.875rem',
              minHeight: '32px',
              display: 'list-item',
            }}
          >
            Como este prazo foi conferido
          </Box>
          <Stack spacing={8} useFlexGap sx={{ mt: '16px' }}>
            <Box
              component="dl"
              sx={{
                m: 0,
                display: 'grid',
                gap: '16px',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(2, minmax(0, 1fr))',
                },
              }}
            >
              {summary.details.map((item) => (
                <Box component="div" key={item.label} sx={{ minWidth: 0 }}>
                  <Typography
                    component="dt"
                    variant="caption"
                    color="text.secondary"
                  >
                    {item.label}
                  </Typography>
                  <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
            {summary.diagnostics.map((message, index) => (
              <Typography key={index} variant="body2">
                {message}
              </Typography>
            ))}
            {summary.authorityUrl && (
              <Link
                href={summary.authorityUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Consultar o manual do eSocial
              </Link>
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
