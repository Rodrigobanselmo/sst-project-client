import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { Box, Typography } from '@mui/material';
import { formAccordionNavigationSx } from '../form-accordion-navigation.styles';

export function ReportSettings({ children }: { children: ReactNode }) {
  return (
    <SAccordion
      title="Configurações do relatório"
      subtitle="Selecione versões e configure a geração de análises e ilustrações."
      icon={<DescriptionOutlinedIcon sx={{ fontSize: 30 }} />}
      expandIcon={<ArrowRightIcon fontSize="small" />}
      color="text.primary"
      defaultExpanded={false}
      accordionProps={{
        sx: {
          ...formAccordionNavigationSx,
          border: 0,
          boxShadow: 'none',
          backgroundColor: 'transparent',
          mb: 12,
          '&::before': { display: 'none' },
          '&& .MuiAccordionSummary-root': {
            minHeight: 76,
            px: 6,
            gap: 4,
            borderRadius: '24px',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': { backgroundColor: 'action.hover' },
          },
          '& > .MuiAccordionSummary-root > .MuiAccordionSummary-content': {
            alignItems: 'center',
            gap: 4,
          },
          '& > .MuiAccordionSummary-root > .MuiAccordionSummary-content > div:first-of-type':
            { width: 36, height: 36, flexShrink: 0, mr: 0 },
          '& .MuiAccordionSummary-content .MuiTypography-body2': {
            color: 'text.secondary',
          },
          '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
            transform: 'rotate(90deg)',
          },
        },
      }}
    >
      <Box sx={{ pt: 10, minWidth: 0 }}>{children}</Box>
    </SAccordion>
  );
}

// Keep comparison state in its document component while rendering its controls
// with the other settings. Collapsing settings never unmounts the report.
export function ReportConfigurationContent({
  container,
  children,
}: {
  container: HTMLElement | null;
  children: ReactNode;
}) {
  return container ? createPortal(children, container) : null;
}

export function ReportToolbarGroup({
  title,
  description,
  align = 'left',
  children,
}: {
  title: string;
  description: string;
  align?: 'left' | 'center' | 'right';
  children: ReactNode;
}) {
  return (
    <Box
      role="group"
      aria-label={title}
      sx={{
        minWidth: 0,
        maxWidth: '100%',
        textAlign: { xs: 'left', md: align },
      }}
    >
      <Typography
        variant="body2"
        fontWeight={600}
        color="text.primary"
        sx={{ mb: 2 }}
      >
        {title}
      </Typography>
      <Typography
        variant="caption"
        display="block"
        color="text.secondary"
        sx={{ mb: 6, lineHeight: 1.5 }}
      >
        {description}
      </Typography>
      {children}
    </Box>
  );
}
