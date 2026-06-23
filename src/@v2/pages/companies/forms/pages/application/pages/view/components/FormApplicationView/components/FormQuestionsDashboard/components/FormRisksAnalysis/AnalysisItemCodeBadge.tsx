import { Box } from '@mui/material';

export function AnalysisItemCodeBadge({ code }: { code: string }) {
  return (
    <Box
      component="span"
      aria-label={`Código do item ${code}`}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 26,
        px: 0.5,
        py: 0.125,
        borderRadius: 0.5,
        fontSize: 10,
        fontWeight: 700,
        lineHeight: 1.2,
        bgcolor: 'grey.200',
        color: 'text.secondary',
        border: '1px solid',
        borderColor: 'grey.300',
        flexShrink: 0,
        fontFamily: 'monospace',
      }}
    >
      {code}
    </Box>
  );
}
