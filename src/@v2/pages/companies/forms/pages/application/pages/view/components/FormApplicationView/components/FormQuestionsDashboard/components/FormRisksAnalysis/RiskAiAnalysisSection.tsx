import type { ReactNode } from 'react';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box } from '@mui/material';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { formAccordionNavigationSx } from '../../../form-accordion-navigation.styles';

export function RiskAiAnalysisSection({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ mb: 12 }}>
      <SAccordion
        defaultExpanded={false}
        title="Gerar análise de riscos com IA"
        subtitle="Gerar e gerenciar as análises de fontes geradoras e recomendações do recorte atual."
        icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 30 }} />}
        expandIcon={<ChevronRightIcon fontSize="small" />}
        color="text.primary"
        fontWeight="600"
        accordionProps={{
          sx: (theme) => ({
            ...formAccordionNavigationSx,
            p: 0,
            border: 0,
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&::before': { display: 'none' },
            '&& .MuiAccordionSummary-root:not(.Mui-expanded)': {
              minHeight: '48px !important',
              padding: '8px 12px !important',
              gap: 4,
              borderRadius: '24px',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.045)'
                : 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(16px) saturate(140%)',
              WebkitBackdropFilter: 'blur(16px) saturate(140%)',
              '&:hover': { backgroundColor: 'action.hover' },
            },
            '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 4 },
            '& .MuiAccordionSummary-content > :first-child': {
              width: 36, height: 36, flexShrink: 0, mr: 0,
            },
          }),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', px: 12, pt: 6, pb: 8 }}>
          {children}
        </Box>
      </SAccordion>
    </Box>
  );
}
