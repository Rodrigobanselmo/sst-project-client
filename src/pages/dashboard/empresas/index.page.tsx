import { Wizard } from 'react-use-wizard';

import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import SWizardBox from 'components/atoms/SWizardBox';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ModalAddCompanyGroup } from 'components/organisms/modals/ModalAddCompanyGroup/ModalAddCompanyGroup';
import { CompaniesTable } from 'components/organisms/tables/CompaniesTable';
import { CompanyGroupsTable } from 'components/organisms/tables/CompanyGroupsTable ';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import SCompanyGroupIcon from 'assets/icons/SCompanyGroupIcon';
import { useRouter } from 'next/router';

export const CompaniesWizard = () => {
  const { query } = useRouter();
  return (
    <>
      <Wizard
        header={
          <WizardTabs
            shadow
            onUrl
            active={query.active ? Number(query.active) : 0}
            renderChildren={(activeStep) => (
              <>
                {activeStep === 0 && (
                  <STableTitle icon={BusinessTwoToneIcon}>Empresas</STableTitle>
                )}
                {activeStep === 1 && (
                  <STableTitle icon={SCompanyGroupIcon}>
                    Grupos Empresariais
                  </STableTitle>
                )}
              </>
            )}
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
          <CompaniesTable hideTitle />
        </SWizardBox>
        <SWizardBox sx={{ px: 5, py: 10 }}>
          <CompanyGroupsTable hideTitle />
        </SWizardBox>
      </Wizard>
      <ModalAddCompanyGroup />
    </>
  );
};

const Companies: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'Empresas'} />
      <SContainer>
        <CompaniesWizard />
      </SContainer>
    </>
  );
};

export default Companies;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
