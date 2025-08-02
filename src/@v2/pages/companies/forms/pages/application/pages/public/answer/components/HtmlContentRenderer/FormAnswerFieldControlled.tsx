import { Box } from '@mui/material';
import { SEDITOR_HTML_STYLES } from '@v2/components/forms/fields/SEditor/SEditor';
import React from 'react';

export const HtmlContentRenderer: React.FC<{ content: string, fontSize?: number }> = ({ content, fontSize = 16 }) => {
  return (
    <Box
      sx={{
        ...SEDITOR_HTML_STYLES,
        mb: 2,
        fontSize: fontSize,
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

