import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';

import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { useRouter } from 'next/router';
import { FormApplicationAddContent } from './components/FormApplicationAddContent/FormApplicationAddContent';
import { Box } from '@mui/material';

export const FormApplicationAddPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;

  return (
    <>
      <SHeaderTag title={'Nova Aplicação de Formulário'} />
      <SContainer>
        <Box
          sx={{
            maxWidth: 800,
            mx: 'auto',
          }}
        >
          <SPageHeader mb={8} title="Nova Aplicação de Formulário" />
          <FormApplicationAddContent companyId={companyId} />
        </Box>
      </SContainer>
    </>
  );
};
