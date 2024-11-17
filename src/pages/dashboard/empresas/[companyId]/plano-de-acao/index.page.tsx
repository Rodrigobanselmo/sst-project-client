import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { ActionPlanTable } from '@v2/pages/companies/action-plan/components/ActionPlanTable/ActionPlanTable';
import { ActionPlanInfo } from '@v2/pages/companies/action-plan/components/ActionPlanInfo/ActionPlanInfo';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import SClinicIcon from 'assets/icons/SClinicIcon';
import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { ActionPlanInfoForm } from '@v2/pages/companies/action-plan/components/ActionPlanForms/ActionPlanInfoForm/ActionPlanInfoForm';

const ActionPlanPage: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'Plano de Ação'} />
      <SContainer>
        <SPageHeader title="Plano de Ação" />
        <ActionPlanInfoForm />
        <ActionPlanInfo mb={[14]} />
        <ActionPlanTable />
      </SContainer>
    </>
  );
};

export default ActionPlanPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
