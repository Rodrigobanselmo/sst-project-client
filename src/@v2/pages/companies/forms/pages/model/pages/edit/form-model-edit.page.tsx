import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';

import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { useRouter } from 'next/router';
import { FormModelEditContent } from './components/FormModelEditContent/FormModelEditContent';
import { Box, Skeleton } from '@mui/material';
import { useFetchReadFormModel } from '@v2/services/forms/form/read-form-model/hooks/useFetchReadFormModel';

export const FormModelEditPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;
  const formId = router.query.id as string;

  const { form, isLoading } = useFetchReadFormModel({
    companyId,
    formId,
  });

  return (
    <>
      <SHeaderTag title={'Editar Modelo de Formulário'} />
      <SContainer>
        <Box
          sx={{
            maxWidth: 800,
            mx: 'auto',
          }}
        >
          <SPageHeader mb={8} title="Editar Modelo de Formulário" />
          {isLoading ? (
            <Skeleton height={400} />
          ) : !form ? (
            <div>Formulário não encontrado</div>
          ) : (
            <FormModelEditContent companyId={companyId} form={form} />
          )}
        </Box>
      </SContainer>
    </>
  );
};
