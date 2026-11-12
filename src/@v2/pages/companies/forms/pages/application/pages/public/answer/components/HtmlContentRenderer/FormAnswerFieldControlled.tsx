import { Box } from '@mui/material';
import { SEDITOR_HTML_STYLES } from '@v2/components/forms/fields/SEditor/SEditor';
import React from 'react';

export const HtmlContentRenderer: React.FC<{ content: string; fontSize?: number; mb?: number; useThemeTextColor?: boolean }> = ({ content, fontSize = 16, mb = 2, useThemeTextColor = false }) => {
  return (
    <Box
      sx={{
        ...SEDITOR_HTML_STYLES,
        mb: mb,
        fontSize: fontSize,
        ...(useThemeTextColor && { color: 'text.primary' }),
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

