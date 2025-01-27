import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';

import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { useRouter } from 'next/router';
import { ActionPlanContent } from './components/ActionPlanContent/ActionPlanContent';
import { StackModalViewUsers } from 'components/organisms/modals/ModalPdfView/ModalPdfView';

export const ActionPlanPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;

  return (
    <>
      <SHeaderTag title={'Plano de Ação'} />
      <SContainer>
        <SPageHeader mb={8} title="Plano de Ação" />
        <ActionPlanContent companyId={companyId} />
      </SContainer>
    </>
  );
};
