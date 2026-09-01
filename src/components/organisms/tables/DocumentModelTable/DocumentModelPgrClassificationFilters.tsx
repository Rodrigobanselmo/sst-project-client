import { FC } from 'react';

import { Box } from '@mui/material';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import {
  DocumentModelClassificationEnum,
  getDocumentModelClassificationsForType,
  toggleDocumentModelClassificationFilter,
} from 'project/enum/document-model-classification.enum';

import {
  documentModelFilterPillBaseSx,
  getDocumentModelFilterPillSx,
} from './document-model-presentation-theme';

type Props = {
  documentType: DocumentTypeEnum;
  active: DocumentModelClassificationEnum[];
  onChange: (value: DocumentModelClassificationEnum[]) => void;
};

export const DocumentModelPgrClassificationFilters: FC<Props> = ({
  documentType,
  active,
  onChange,
}) => {
  const options = getDocumentModelClassificationsForType(documentType);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 4, ml: 2 }}>
      <FilterPill
        label="Todos"
        isActive={active.length === 0}
        onClick={() => onChange([])}
      />
      {options.map(({ value, shortLabel }) => (
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
};

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
      ...documentModelFilterPillBaseSx,
      ...getDocumentModelFilterPillSx(isActive),
    }}
  >
    {label}
  </Box>
);
