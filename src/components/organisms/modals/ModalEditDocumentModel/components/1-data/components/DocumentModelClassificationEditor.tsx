import { FC } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import {
  documentModelClassificationList,
  DocumentModelClassificationEnum,
  toggleDocumentModelClassification,
} from 'project/enum/document-model-classification.enum';

type Props = {
  value?: DocumentModelClassificationEnum[];
  onChange: (next: DocumentModelClassificationEnum[]) => void;
};

export const DocumentModelClassificationEditor: FC<Props> = ({
  value,
  onChange,
}) => (
  <Box>
    <SText fontSize={13} mb={3}>
      Classificações do modelo
    </SText>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {documentModelClassificationList.map(({ value: item, shortLabel }) => {
        const selected = value?.includes(item) ?? false;
        return (
          <Box
            key={item}
            component="button"
            type="button"
            onClick={() =>
              onChange(toggleDocumentModelClassification(value, item))
            }
            sx={{
              appearance: 'none',
              border: '1px solid',
              borderColor: selected ? 'primary.main' : 'grey.400',
              cursor: 'pointer',
              backgroundColor: selected ? 'primary.light' : 'grey.100',
              color: selected ? 'primary.dark' : 'text.main',
              borderRadius: 1,
              fontSize: 11,
              fontWeight: 600,
              px: 6,
              py: '4px',
            }}
          >
            {shortLabel}
          </Box>
        );
      })}
    </Box>
    <SText fontSize={11} color="text.light" mt={2}>
      Pares excludentes: GRO/PGR ↔ Somente PGR; Com FRPS ↔ Sem FRPS; COPSOQ III ↔
      Não COPSOQ III.
    </SText>
  </Box>
);
