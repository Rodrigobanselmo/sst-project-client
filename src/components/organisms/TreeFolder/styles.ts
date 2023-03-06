import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

export const STDocumentModelBox = styled(Box)`
  height: 100%;

  .treeRoot {
    height: 100%;
  }

  .draggingSource {
    opacity: 0.3;
  }

  .dropTarget {
    background-color: #e8f0fe;
  }
`;
