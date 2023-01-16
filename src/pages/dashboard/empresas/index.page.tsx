import { Wizard } from 'react-use-wizard';

import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import SWizardBox from 'components/atoms/SWizardBox';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ModalAddCompanyGroup } from 'components/organisms/modals/ModalAddCompanyGroup/ModalAddCompanyGroup';
import { ModalSelectClinic } from 'components/organisms/modals/ModalSelectClinics';
import { CompaniesTable } from 'components/organisms/tables/CompaniesTable';
import { CompanyGroupsTable } from 'components/organisms/tables/CompanyGroupsTable ';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Companies: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'Empresas'} />
      <SContainer>
        <Wizard
          header={
            <WizardTabs
              shadow
              options={[
                {
                  label: 'Empresas',
                  // icon: <BusinessTwoToneIcon />,
                  // iconPosition: 'start',
                },
                {
                  label: 'Grupo Empresarial',
                  // icon: <SCompanyGroupIcon />,
                  // iconPosition: 'start',
                },
              ]}
            />
          }
        >
          <SWizardBox sx={{ px: 5, py: 10 }}>
            <CompaniesTable />
          </SWizardBox>
          <SWizardBox sx={{ px: 5, py: 10 }}>
            <CompanyGroupsTable />
          </SWizardBox>
        </Wizard>
      </SContainer>
      <>
        <ModalAddCompanyGroup />
        <ModalSelectClinic />
      </>
    </>
  );
};

export default Companies;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
