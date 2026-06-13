import dynamic from 'next/dynamic';
import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';

import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { Box, CircularProgress, Tab, Tabs, Typography } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';

import { ConsolidatedViewTab } from './consolidated-view-tab.types';

const FormConsolidatedViewClientOnly = dynamic(
  () =>
    import('./components/FormConsolidatedView/FormConsolidatedView').then(
      (mod) => mod.FormConsolidatedView,
    ),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          py: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">
          Carregando visão consolidada...
        </Typography>
      </Box>
    ),
  },
);

const parseApplicationIds = (value: string | string[] | undefined) => {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(',') : value;

  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseActiveTab = (
  value: string | string[] | undefined,
): ConsolidatedViewTab => {
  if (value === 'participants') return 'participants';
  if (value === 'charts') return 'charts';
  if (value === 'indicators') return 'indicators';
  if (value === 'risk-analysis') return 'risk-analysis';
  if (value === 'narrative') return 'indicators';
  return 'summary';
};

export const FormConsolidatedViewPage = () => {
  const router = useRouter();
  const companyGroupId = Number(router.query.businessGroupId || 0);
  const applicationIds = parseApplicationIds(router.query.applicationIds);
  const activeTab = parseActiveTab(router.query.tab);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, value: ConsolidatedViewTab) => {
      void router.push(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            tab: value,
          },
        },
        undefined,
        { shallow: true },
      );
    },
    [router],
  );

  const openTab = useCallback(
    (tab: ConsolidatedViewTab) => {
      if (activeTab === tab) return;

      void router.push(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            tab,
          },
        },
        undefined,
        { shallow: true },
      );
    },
    [activeTab, router],
  );

  const tabs = useMemo(
    () => (
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 48,
          '& .MuiTab-root': {
            minHeight: 48,
            fontSize: 14,
            fontWeight: 600,
            textTransform: 'none',
          },
        }}
      >
        <Tab label="Resumo" value="summary" />
        <Tab label="Participantes" value="participants" />
        <Tab label="Gráficos" value="charts" />
        <Tab label="Indicadores" value="indicators" />
        <Tab label="Análise de Riscos" value="risk-analysis" />
      </Tabs>
    ),
    [activeTab, handleTabChange],
  );

  return (
    <>
      <SHeaderTag title="Formulários consolidados" />
      <SContainer>
        <SPageHeader mb={2} title="Visão consolidada do grupo" />

        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            mb: 3,
          }}
        >
          {tabs}
        </Box>

        <FormConsolidatedViewClientOnly
          companyGroupId={companyGroupId}
          applicationIds={applicationIds}
          activeTab={activeTab}
          onOpenParticipantsTab={() => openTab('participants')}
          onOpenChartsTab={() => openTab('charts')}
          onOpenIndicatorsTab={() => openTab('indicators')}
          onOpenRiskAnalysisTab={() => openTab('risk-analysis')}
        />
      </SContainer>
    </>
  );
};
