import { FC } from 'react';

import { Box } from '@mui/material';
import {
  documentModelClassificationList,
  DocumentModelClassificationEnum,
  toggleDocumentModelClassificationFilter,
} from 'project/enum/document-model-classification.enum';

type Props = {
  active: DocumentModelClassificationEnum[];
  onChange: (value: DocumentModelClassificationEnum[]) => void;
};

export const DocumentModelPgrClassificationFilters: FC<Props> = ({
  active,
  onChange,
}) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 4, ml: 2 }}>
    <FilterPill
      label="Todos"
      isActive={active.length === 0}
      onClick={() => onChange([])}
    />
    {documentModelClassificationList.map(({ value, shortLabel }) => (
      <FilterPill
        key={value}
        label={shortLabel}
        isActive={active.includes(value)}
        onClick={() =>
          onChange(toggleDocumentModelClassificationFilter(active, value))
        }
      />
    ))}
  </Box>
);

const FilterPill: FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <Box
    component="button"
    type="button"
    onClick={onClick}
    sx={{
      appearance: 'none',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: isActive ? 'primary.main' : 'grey.400',
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
);
