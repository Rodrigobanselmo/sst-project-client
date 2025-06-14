import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';

import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { useRouter } from 'next/router';
import { FormModelAddContent } from './components/FormModelAddContent/FormModelAddContent';

export const FormModelAddPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;

  return (
    <>
      <SHeaderTag title={'Novo Modelo de Formulário'} />
      <SContainer>
        <SPageHeader mb={8} title="Novo Modelo de Formulário" />
        <FormModelAddContent companyId={companyId} />
      </SContainer>
    </>
  );
};
