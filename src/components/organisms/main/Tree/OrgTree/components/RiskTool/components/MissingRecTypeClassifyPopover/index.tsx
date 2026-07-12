import React, { FC, MouseEvent, useState } from 'react';

import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Box, Button, Icon, Popover, Typography } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import { RecTypeEnum } from 'project/enum/recType.enum';

import { MISSING_REC_TYPE_QUICK_CLASSIFY_MESSAGE } from '../../utils/isRecommendationRecTypeMissing.util';

const QUICK_CLASSIFY_OPTIONS: Array<{ type: RecTypeEnum; label: string }> = [
  { type: RecTypeEnum.ADM, label: 'Administrativa' },
  { type: RecTypeEnum.ENG, label: 'Engenharia' },
  { type: RecTypeEnum.EPI, label: 'EPI' },
];

/** Acima do Tooltip do MUI (theme.zIndex.tooltip = 1500). */
const CLASSIFY_POPOVER_Z_INDEX = 1600;

export type MissingRecTypeClassifyPopoverProps = {
  onClassify: (recType: RecTypeEnum) => void | Promise<void>;
  loading?: boolean;
  tooltipFallback?: string;
  /** Notifica o item pai para fechar/desabilitar o tooltip informativo. */
  onOpenChange?: (open: boolean) => void;
};

/**
 * Ícone de alerta + Popover para classificar rapidamente o `recType`.
 * O clique no ícone usa stopPropagation para não abrir o modal de edição do item.
 */
export const MissingRecTypeClassifyPopover: FC<
  MissingRecTypeClassifyPopoverProps
> = ({
  onClassify,
  loading = false,
  tooltipFallback,
  onOpenChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const setOpenState = (nextAnchor: HTMLElement | null) => {
    setAnchorEl(nextAnchor);
    onOpenChange?.(Boolean(nextAnchor));
  };

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setOpenState(event.currentTarget);
  };

  const handleClose = (event?: object) => {
    if (
      event &&
      typeof event === 'object' &&
      'stopPropagation' in event &&
      typeof (event as MouseEvent).stopPropagation === 'function'
    ) {
      (event as MouseEvent).stopPropagation();
    }
    setOpenState(null);
  };

  const handleClassify = async (
    event: MouseEvent<HTMLElement>,
    recType: RecTypeEnum,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      await onClassify(recType);
      setOpenState(null);
    } catch {
      // Erro já tratado pela mutation (snackbar). Mantém popover/alerta.
    }
  };

  return (
    <>
      <SIconButton
        sx={{ maxWidth: 18, maxHeight: 18, p: 0.25 }}
        onClick={handleOpen}
        onMouseDown={(e) => e.stopPropagation()}
        disabled={loading}
        title={open ? undefined : tooltipFallback}
        aria-label="Classificar tipo da recomendação"
      >
        <Icon
          component={WarningAmberRoundedIcon}
          sx={{ fontSize: 15, color: 'warning.main' }}
        />
      </SIconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableRestoreFocus
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        onClick={(e) => e.stopPropagation()}
        // Portal no body + z-index acima do Tooltip (1500) da recomendação.
        sx={{ zIndex: CLASSIFY_POPOVER_Z_INDEX }}
        PaperProps={{
          sx: {
            p: 1.25,
            maxWidth: 280,
            border: '1px solid',
            borderColor: 'warning.light',
            zIndex: CLASSIFY_POPOVER_Z_INDEX,
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mb: 1,
            lineHeight: 1.4,
            color: 'text.secondary',
          }}
        >
          {MISSING_REC_TYPE_QUICK_CLASSIFY_MESSAGE}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {QUICK_CLASSIFY_OPTIONS.map(({ type, label }) => (
            <Button
              key={type}
              size="small"
              variant="outlined"
              color="warning"
              disabled={loading}
              onClick={(e) => handleClassify(e, type)}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              {label}
            </Button>
          ))}
        </Box>
      </Popover>
    </>
  );
};
