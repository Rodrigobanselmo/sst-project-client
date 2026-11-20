import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Box, Tooltip } from '@mui/material';
import { MouseEvent } from 'react';
import { riskEditorActionSx } from 'configs/theme/risk-editor-action';

export function RiskColumnAddButton({
  onClick,
  label,
  disabled,
}: {
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <Tooltip title={label}>
      <Box
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-disabled={disabled}
        onClick={(event) => {
          if (!disabled) onClick(event);
        }}
        onKeyDown={(event) => {
          if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            event.currentTarget.click();
          }
        }}
        sx={{
          ...riskEditorActionSx,
          backdropFilter: 'none',
          width: 30,
          height: 30,
          minHeight: 30,
          p: 0,
          border: '1px solid',
          borderRadius: '50%',
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <AddRoundedIcon sx={{ fontSize: 20 }} />
      </Box>
    </Tooltip>
  );
}
