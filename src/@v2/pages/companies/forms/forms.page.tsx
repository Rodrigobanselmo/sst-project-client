import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';

import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { useRouter } from 'next/router';
import { FormContent } from './components/FormContent/FormContent';

export const FormsPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;

  return (
    <>
      <SHeaderTag title={'Formulários'} />
      <SContainer>
        <SPageHeader mb={8} title="Formulários" />
        <FormContent companyId={companyId} />
      </SContainer>
    </>
  );
};
