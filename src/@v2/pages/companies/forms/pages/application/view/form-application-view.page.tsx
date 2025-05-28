import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';

import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { useRouter } from 'next/router';
import { FormApplicationView } from './components/FormApplicationView/FormApplicationView';

export const FormViewPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;
  const formApplicationId = router.query.id as string;

  return (
    <>
      <SHeaderTag title={'Fomulários'} />
      <SContainer>
        <SPageHeader mb={8} title="Fomulários" />
        <FormApplicationView
          companyId={companyId}
          formApplicationId={formApplicationId}
        />
      </SContainer>
    </>
  );
};
