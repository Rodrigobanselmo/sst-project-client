import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
export function GseConsultativeInfo({
  label,
  children,
}: {
  label: string;
  children: string;
}) {
  return (
    <Tooltip title={children} arrow>
      <IconButton size="small" aria-label={label}>
        <span aria-hidden="true" style={{ fontSize: 14 }}>
          ⓘ
        </span>
      </IconButton>
    </Tooltip>
  );
}
