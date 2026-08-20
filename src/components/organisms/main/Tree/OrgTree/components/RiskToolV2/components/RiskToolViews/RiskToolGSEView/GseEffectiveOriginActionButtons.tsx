import React, { FC } from 'react';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Button } from '@mui/material';
import SFlex from 'components/atoms/SFlex';

const actionButtonSx = {
  minWidth: 0,
  px: 2,
  textTransform: 'none' as const,
  fontWeight: 600,
  whiteSpace: 'nowrap' as const,
};

export const GseEffectiveOriginActionButtons: FC<{
  onOpenOrigin?: () => void;
  onEditHere?: () => void;
}> = ({ onOpenOrigin, onEditHere }) => {
  if (!onOpenOrigin && !onEditHere) return null;

  return (
    <SFlex align="center" gap={2} flexWrap="wrap">
      {onOpenOrigin && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<OpenInNewIcon sx={{ fontSize: '1rem' }} />}
          sx={actionButtonSx}
          onClick={(event) => {
            event.stopPropagation();
            onOpenOrigin();
          }}
        >
          Abrir na origem
        </Button>
      )}
      {onEditHere && (
        <Button
          variant="outlined"
          size="small"
          color="primary"
          startIcon={<EditOutlinedIcon sx={{ fontSize: '1rem' }} />}
          sx={actionButtonSx}
          onClick={(event) => {
            event.stopPropagation();
            onEditHere();
          }}
        >
          Editar aqui
        </Button>
      )}
    </SFlex>
  );
};
