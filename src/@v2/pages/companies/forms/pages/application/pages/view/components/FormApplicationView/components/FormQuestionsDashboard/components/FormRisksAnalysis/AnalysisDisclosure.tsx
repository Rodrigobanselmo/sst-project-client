import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box } from '@mui/material';
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
  return <Box sx={{ display: 'flex', justifyContent: 'flex-end', position: { xs: 'static', md: 'absolute' }, right: 0, top: '2px', zIndex: 1, py: 0, mb: 0, '&:empty': { display: 'none' } }}>{action}</Box>;
}

export function AnalysisItemsSection({
  title,
  children,
  action,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box
      component="details"
      data-analysis-section={title}
      open
      sx={{
        mt: title.startsWith('Recomendações') ? '12px' : '2px',
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
        '&[open] > summary > svg': { transform: 'rotate(90deg)' },
      }}
    >
      <summary>
        <ChevronRightIcon sx={{ fontSize: 18 }} />
        {title}
        {action}
      </summary>
      <Box sx={{ pl: { xs: '16px', sm: '24px' }, pt: '2px' }}>{children}</Box>
    </Box>
  );
}

export function renderAnalysisOriginGroups<T extends { justificativa: string; selectionOrigin?: string }>(items: T[], render: (item: T, index: number) => ReactNode) {
  const manual = (item: T) => item.selectionOrigin === 'USER' || item.justificativa === 'Selecionado manualmente do catálogo pelo responsável técnico.';
  return [false, true].map(user => {
    const entries = items.map((item, index) => ({ item, index })).filter(({ item }) => manual(item) === user);
    return entries.length ? <AnalysisItemsSection key={String(user)} title={user ? 'Adicionados pelo usuário' : 'Adicionados pela IA'}>{entries.map(({ item, index }) => render(item, index))}</AnalysisItemsSection> : null;
  });
}
