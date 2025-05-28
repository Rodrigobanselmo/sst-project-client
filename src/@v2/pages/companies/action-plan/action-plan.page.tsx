import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { useRouter } from 'next/router';
import { ActionPlanContent } from './components/ActionPlanContent/ActionPlanContent';
import { SContainer } from '@v2/components/atoms/SContainer/SContainer';
import { SHeader } from '@v2/components/atoms/SHeader/SHeader';

export const ActionPlanPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;

  return (
    <>
      <SHeader title={'Plano de Ação'} />
      <SContainer>
        <SPageHeader mb={8} title="Plano de Ação" />
        <ActionPlanContent companyId={companyId} />
      </SContainer>
    </>
  );
};
