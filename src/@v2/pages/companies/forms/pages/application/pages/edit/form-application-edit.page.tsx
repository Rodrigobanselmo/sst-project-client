import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';

import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { useRouter } from 'next/router';
import { FormApplicationEditContent } from './components/FormApplicationEditContent';
import { Box, Skeleton } from '@mui/material';
import { useFetchReadFormApplication } from '@v2/services/forms/form-application/read-form-application/hooks/useFetchReadFormApplication';

export const FormApplicationEditPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;
  const applicationId = router.query.id as string;

  const { formApplication, isLoading } = useFetchReadFormApplication({
    companyId,
    applicationId,
  });

  return (
    <>
      <SHeaderTag title={'Editar Aplicação de Formulário'} />
      <SContainer>
        <Box
          sx={{
            maxWidth: 800,
            mx: 'auto',
          }}
        >
          <SPageHeader mb={8} title="Editar Aplicação de Formulário" />
          {isLoading ? (
            <Skeleton height={400} />
          ) : !formApplication ? (
            <div>Aplicação de formulário não encontrada</div>
          ) : (
            <>
              {/* Updated implementation now supports full editing functionality including form, sections, and questions */}
              <FormApplicationEditContent
                companyId={companyId}
                formApplication={formApplication}
              />
            </>
          )}
        </Box>
      </SContainer>
    </>
  );
};
