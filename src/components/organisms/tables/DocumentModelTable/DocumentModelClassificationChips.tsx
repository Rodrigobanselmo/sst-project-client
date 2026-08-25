import { FC } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import {
  documentModelClassificationMap,
  DocumentModelClassificationEnum,
  sortClassificationsForDisplay,
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

  const ordered = sortClassificationsForDisplay(classifications);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {ordered.map((value) => (
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
