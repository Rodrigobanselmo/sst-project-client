import { FC } from 'react';

import { Box } from '@mui/material';

import {
  DocumentModelStatusFilter,
} from './document-model-status-filter.util';

type Props = {
  active: DocumentModelStatusFilter;
  onChange: (value: DocumentModelStatusFilter) => void;
};

const OPTIONS: { value: DocumentModelStatusFilter; label: string }[] = [
  { value: 'ACTIVE', label: 'Ativos' },
  { value: 'INACTIVE', label: 'Inativos' },
  { value: 'ALL', label: 'Todos' },
];

export const DocumentModelStatusFilters: FC<Props> = ({ active, onChange }) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 4, ml: 2 }}>
      {OPTIONS.map(({ value, label }) => (
        <Box
          key={value}
          component="button"
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={active === value}
          sx={{
            appearance: 'none',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: active === value ? 'primary.main' : 'grey.400',
            color: 'common.white',
            borderRadius: 1,
            fontSize: 11,
            fontWeight: 600,
            px: 6,
            py: '4px',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Box>
      ))}
    </Box>
  );
};
