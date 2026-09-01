import { FC } from 'react';

import { Box } from '@mui/material';

import {
  DocumentModelStatusFilter,
} from './document-model-status-filter.util';
import {
  documentModelFilterPillBaseSx,
  getDocumentModelFilterPillSx,
} from './document-model-presentation-theme';

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
            ...documentModelFilterPillBaseSx,
            ...getDocumentModelFilterPillSx(active === value),
          }}
        >
          {label}
        </Box>
      ))}
    </Box>
  );
};
