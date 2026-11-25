import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, ButtonBase } from '@mui/material';
import type { ReactNode } from 'react';

export function AnalysisDisclosureHeader({
  expanded,
  onToggle,
  confidence,
  action,
}: {
  expanded: boolean;
  onToggle: () => void;
  confidence?: number | null;
  action?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        flexWrap: 'wrap',
        py: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <ButtonBase
        onClick={onToggle}
        aria-expanded={expanded}
        sx={{
          color: 'text.primary',
          gap: 2,
          borderRadius: 1,
          '&.Mui-focusVisible': {
            outline: '2px solid',
            outlineColor: 'text.secondary',
          },
        }}
      >
        <ChevronRightIcon
          sx={{
            fontSize: 18,
            transform: expanded ? 'rotate(90deg)' : undefined,
          }}
        />
        <Box component="span" sx={{ fontSize: 13, fontWeight: 600 }}>
          Análise da IA
        </Box>
        {confidence != null && (
          <Box component="span" sx={{ color: 'text.secondary', fontSize: 12 }}>
            (Confiança: {Math.round(confidence * 100)}%)
          </Box>
        )}
      </ButtonBase>
      {action}
    </Box>
  );
}

export function AnalysisItemsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box
      component="details"
      open
      sx={{
        mt: title.startsWith('Recomendações') ? 10 : 3,
        '& > summary': {
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          color: 'text.primary',
          fontSize: 14,
          fontWeight: 600,
          py: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          listStyle: 'none',
          '&::-webkit-details-marker': { display: 'none' },
        },
        '&[open] > summary svg': { transform: 'rotate(90deg)' },
      }}
    >
      <summary>
        <ChevronRightIcon sx={{ fontSize: 18 }} />
        {title}
      </summary>
      <Box sx={{ pl: { xs: 12, sm: 16 }, pt: 2 }}>{children}</Box>
    </Box>
  );
}
