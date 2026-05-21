import { FC } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import {
  documentModelClassificationMap,
  DocumentModelClassificationEnum,
} from 'project/enum/document-model-classification.enum';

type Props = {
  classifications?: DocumentModelClassificationEnum[];
};

export const DocumentModelClassificationChips: FC<Props> = ({
  classifications,
}) => {
  if (!classifications?.length) {
    return (
      <SText fontSize={12} color="text.light">
        —
      </SText>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {classifications.map((value) => (
        <Box
          key={value}
          sx={{
            backgroundColor: 'grey.300',
            color: 'text.main',
            borderRadius: 1,
            fontSize: 10,
            fontWeight: 600,
            px: 4,
            py: '2px',
            whiteSpace: 'nowrap',
          }}
        >
          {documentModelClassificationMap[value]?.shortLabel ?? value}
        </Box>
      ))}
    </Box>
  );
};
