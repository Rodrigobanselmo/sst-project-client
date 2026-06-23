import { Box, Tooltip } from '@mui/material';

type MemberPendingItemCodeChipProps = {
  code: string;
  title: string;
  isApplying?: boolean;
  onClick: () => void;
};

export function MemberPendingItemCodeChip({
  code,
  title,
  isApplying = false,
  onClick,
}: MemberPendingItemCodeChipProps) {
  return (
    <Tooltip title={title} arrow placement="top">
      <Box
        component="button"
        type="button"
        aria-label={`Aplicar item ${code}: ${title}`}
        disabled={isApplying}
        onClick={onClick}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 28,
          px: 0.75,
          py: 0.25,
          borderRadius: 0.75,
          fontSize: 10,
          fontWeight: 700,
          lineHeight: 1.2,
          bgcolor: 'background.paper',
          color: 'primary.main',
          border: '1px solid',
          borderColor: 'primary.light',
          flexShrink: 0,
          fontFamily: 'monospace',
          cursor: isApplying ? 'wait' : 'pointer',
          opacity: isApplying ? 0.6 : 1,
          transition: 'background-color 0.15s ease, border-color 0.15s ease',
          '&:hover': {
            bgcolor: 'primary.50',
            borderColor: 'primary.main',
          },
          '&:disabled': {
            cursor: 'wait',
          },
        }}
      >
        {isApplying ? '...' : code}
      </Box>
    </Tooltip>
  );
}
