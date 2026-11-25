import type { ReactNode } from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, SvgIcon } from '@mui/material';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { formAccordionNavigationSx } from '../../../form-accordion-navigation.styles';

export function OccupationalRiskAnalysisSection({ children, action }: { children: ReactNode; action: ReactNode }) {
  return (
    <Box sx={{ mb: 12 }}>
      <SAccordion
        defaultExpanded
        endComponent={
          <Box
            onClick={(event) => event.stopPropagation()}
            onFocus={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            sx={{ ml: 'auto', pl: 4, flexShrink: 0 }}
          >
            {action}
          </Box>
        }
        title="Análise de riscos ocupacionais por setor"
        subtitle="Probabilidade, severidade e classificação do risco ocupacional de cada fator nos setores avaliados."
        icon={
          <SvgIcon sx={{ fontSize: 30 }} viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="0.7" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M6 2v20M10 2v20M14 2v20M18 2v20M2 6h20M2 10h20M2 14h20M2 18h20" fill="none" stroke="currentColor" strokeWidth="0.65" />
          </SvgIcon>
        }
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
            '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 4, minWidth: 0, flexWrap: 'wrap' },
            '& .MuiAccordionSummary-content > :nth-child(2)': { flex: '1 1 auto' },
            '& .MuiAccordionSummary-content > :first-child': {
              width: 36, height: 36, flexShrink: 0, mr: 0,
            },
          }),
        }}
      >
        <Box sx={{ px: { xs: 2, sm: 6 }, pt: 6, pb: 8 }}>
          {children}
        </Box>
      </SAccordion>
    </Box>
  );
}
