import { Box } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SText from 'components/atoms/SText';

import {
  DOCUMENT_MODEL_CONFLICT_MESSAGE,
  DOCUMENT_MODEL_CONFLICT_PRIMARY_ACTION,
  DOCUMENT_MODEL_CONFLICT_PRIMARY_HINT,
  DOCUMENT_MODEL_CONFLICT_SECONDARY_ACTION,
  DOCUMENT_MODEL_CONFLICT_SECONDARY_HINT,
} from './document-model-optimistic-lock';

export function DocumentModelConflictContent(props: {
  onLoadLatest: () => void;
  onKeepOpenToCopy: () => void;
}) {
  return (
    <Box sx={{ overflowY: 'auto' }}>
      <SText sx={{ whiteSpace: 'pre-line' }}>
        {DOCUMENT_MODEL_CONFLICT_MESSAGE}
      </SText>
      <SText sx={{ mt: 6, fontWeight: 600, whiteSpace: 'pre-line' }}>
        {DOCUMENT_MODEL_CONFLICT_PRIMARY_HINT}
      </SText>
      <SButton
        variant="contained"
        fullWidth
        onClick={props.onLoadLatest}
        sx={{ mt: 3 }}
      >
        {DOCUMENT_MODEL_CONFLICT_PRIMARY_ACTION}
      </SButton>
      <SText sx={{ mt: 8, whiteSpace: 'pre-line' }}>
        {DOCUMENT_MODEL_CONFLICT_SECONDARY_HINT}
      </SText>
      <SButton
        variant="outlined"
        fullWidth
        onClick={props.onKeepOpenToCopy}
        sx={{ mt: 3 }}
      >
        {DOCUMENT_MODEL_CONFLICT_SECONDARY_ACTION}
      </SButton>
    </Box>
  );
}
