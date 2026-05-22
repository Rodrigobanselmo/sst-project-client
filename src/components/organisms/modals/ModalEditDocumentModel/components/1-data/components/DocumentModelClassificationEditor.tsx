import { FC } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import {
  DocumentModelClassificationEnum,
  getDocumentModelClassificationsForType,
  getExclusivePairsHintForDocumentType,
  toggleDocumentModelClassification,
} from 'project/enum/document-model-classification.enum';

type Props = {
  documentType: DocumentTypeEnum;
  value?: DocumentModelClassificationEnum[];
  onChange: (next: DocumentModelClassificationEnum[]) => void;
};

export const DocumentModelClassificationEditor: FC<Props> = ({
  documentType,
  value,
  onChange,
}) => {
  const options = getDocumentModelClassificationsForType(documentType);
  const exclusiveHint = getExclusivePairsHintForDocumentType(documentType);

  return (
    <Box>
      <SText fontSize={13} mb={3}>
        Classificações do modelo
      </SText>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {options.map(({ value: item, shortLabel }) => {
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
      {exclusiveHint ? (
        <SText fontSize={11} color="text.light" mt={2}>
          Pares excludentes: {exclusiveHint}.
        </SText>
      ) : null}
    </Box>
  );
};
