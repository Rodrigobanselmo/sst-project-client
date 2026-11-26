import { Box } from '@mui/material';
import type { ReactNode } from 'react';

export function ReportDisclosure({
  presentation,
  title,
  heading,
  children,
}: {
  presentation: boolean;
  title: ReactNode;
  heading: 'h2' | 'h3' | 'div';
  children: ReactNode;
}) {
  if (!presentation) {
    return (
      <>
        <Box
          component={heading}
          sx={heading === 'div' ? { fontWeight: 700, mb: '24px' } : undefined}
        >
          {title}
        </Box>
        {children}
      </>
    );
  }
  return (
    <Box
      component={presentation ? 'details' : 'div'}
      {...(presentation ? { open: true } : {})}
      className="report-disclosure"
    >
      <Box
        component={presentation ? 'summary' : 'div'}
        sx={{
          cursor: presentation ? 'pointer' : 'default',
          mb: heading === 'div' ? '24px' : '20px',
          lineHeight: 1.5,
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: '6px',
          },
          '&::marker': { fontSize: '0.85em' },
        }}
      >
        <Box component={heading} sx={{ display: 'inline', fontWeight: 700 }}>
          {title}
        </Box>
      </Box>
      {children}
    </Box>
  );
}
