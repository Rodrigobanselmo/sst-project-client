import { ChangeEvent, FC, MouseEvent, useEffect, useState } from 'react';

import { Box, Popover, TextField } from '@mui/material';

import {
  normalizeRiskMatrixHex,
  RISK_MATRIX_SUGGESTED_COLORS,
} from '../utils/risk-matrix-hex.util';

type RiskMatrixColorInputProps = {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export const RiskMatrixColorInput: FC<RiskMatrixColorInputProps> = ({
  value,
  disabled = false,
  onChange,
}) => {
  const normalized = normalizeRiskMatrixHex(value);
  const [hexDraft, setHexDraft] = useState(normalized ?? value);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHexDraft(normalized ?? value);
  }, [normalized, value]);

  const handleHexChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setHexDraft(next);
    const parsed = normalizeRiskMatrixHex(next);
    if (parsed) onChange(parsed);
  };

  const handleHexBlur = () => {
    const parsed = normalizeRiskMatrixHex(hexDraft);
    if (parsed) {
      setHexDraft(parsed);
      onChange(parsed);
      return;
    }
    setHexDraft(normalized ?? value);
  };

  const handleSelectSuggested = (color: string) => {
    const parsed = normalizeRiskMatrixHex(color);
    if (!parsed) return;
    setHexDraft(parsed);
    onChange(parsed);
    setAnchorEl(null);
  };

  return (
    <Box display="flex" alignItems="center" gap={1} minWidth={180}>
      <Box
        component="button"
        type="button"
        aria-label="Cor da classificação"
        disabled={disabled}
        onClick={(event: MouseEvent<HTMLElement>) => {
          if (disabled) return;
          setAnchorEl(event.currentTarget);
        }}
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.400',
          bgcolor: normalized || 'transparent',
          cursor: disabled ? 'default' : 'pointer',
          flexShrink: 0,
          p: 0,
        }}
      />
      <TextField
        size="small"
        label="Hex"
        placeholder="#RRGGBB"
        value={hexDraft}
        disabled={disabled}
        onChange={handleHexChange}
        onBlur={handleHexBlur}
        sx={{ width: 120 }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 1.5, maxWidth: 220 }}>
          <Box display="flex" flexWrap="wrap" gap="10px">
            {RISK_MATRIX_SUGGESTED_COLORS.map((color) => {
              const selected = normalized === normalizeRiskMatrixHex(color);
              return (
                <Box
                  key={color}
                  onClick={() => handleSelectSuggested(color)}
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: color,
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': {
                      ':after': {
                        content: '""',
                        width: 'calc(100% + 4px)',
                        height: 'calc(100% + 4px)',
                        borderRadius: '50%',
                        border: '1px solid',
                        position: 'absolute',
                        borderColor: 'grey.400',
                        margin: '-3px',
                      },
                    },
                    ...(selected && {
                      ':after': {
                        content: '""',
                        width: 'calc(100% + 4px)',
                        height: 'calc(100% + 4px)',
                        borderRadius: '50%',
                        border: '1px solid',
                        position: 'absolute',
                        borderColor: 'grey.400',
                        margin: '-3px',
                      },
                    }),
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};
