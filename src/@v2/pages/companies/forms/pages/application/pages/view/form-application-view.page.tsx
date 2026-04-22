import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';

import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { Box, CircularProgress, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const FormApplicationViewClientOnly = dynamic(
  () =>
    import('./components/FormApplicationView/FormApplicationView').then(
      (mod) => mod.FormApplicationView,
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
          Carregando dados da aplicação...
        </Typography>
      </Box>
    ),
  },
);

export const FormViewPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;
  const formApplicationId = router.query.id as string;

  return (
    <>
      <SHeaderTag title={'Fomulários'} />
      <SContainer>
        <SPageHeader mb={8} title="Fomulários" />
        <FormApplicationViewClientOnly
          companyId={companyId}
          formApplicationId={formApplicationId}
        />
      </SContainer>
    </>
  );
};
