import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { Box, CircularProgress, Typography } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';

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

export const FormConsolidatedViewPage = () => {
  const router = useRouter();
  const companyGroupId = Number(router.query.businessGroupId || 0);
  const applicationIds = parseApplicationIds(router.query.applicationIds);

  return (
    <>
      <SHeaderTag title="Formulários consolidados" />
      <SContainer>
        <SPageHeader mb={4} title="Visão consolidada do grupo" />
        <FormConsolidatedViewClientOnly
          companyGroupId={companyGroupId}
          applicationIds={applicationIds}
        />
      </SContainer>
    </>
  );
};
