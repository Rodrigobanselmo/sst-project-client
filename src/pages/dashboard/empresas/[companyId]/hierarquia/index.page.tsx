import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import OrgTreeComponent from 'components/organisms/main/Tree/OrgTree';
import { ModalEditCard } from 'components/organisms/main/Tree/OrgTree/components/ModalEditCard';
import { useHierarchyTreeLoad } from 'components/organisms/main/Tree/OrgTree/hooks/useHierarchyTreeLoad';
import { ModalAddEpi } from 'components/organisms/modals/ModalAddEpi';
import { ModalAddGenerateSource } from 'components/organisms/modals/ModalAddGenerateSource';
import { ModalAddGho } from 'components/organisms/modals/ModalAddGHO';
import { ModalAddProbability } from 'components/organisms/modals/ModalAddProbability';
import { ModalAddQuantity } from 'components/organisms/modals/ModalAddQuantity';
import { ModalAddRecMed } from 'components/organisms/modals/ModalAddRecMed';
import { ModalAddRisk } from 'components/organisms/modals/ModalAddRisk';
import { ModalAutomateSubOffice } from 'components/organisms/modals/ModalAutomateSubOffice';
import { StackModalEditEmployee } from 'components/organisms/modals/ModalEditEmployee/ModalEditEmployee';
import { ModalEditEpiData } from 'components/organisms/modals/ModalEditEpiRiskData';
import { ModalEditExamRiskData } from 'components/organisms/modals/ModalEditExamRiskData/ModalEditExamRiskData';
import { ModalEditEngRiskData } from 'components/organisms/modals/ModalEditMedRiskData';
import { ModalExcelHierarchies } from 'components/organisms/modals/ModalExcelHierarchies';
import { ModalRiskTool } from 'components/organisms/modals/ModalRiskTool';
import { ModalSelectDocPgr } from 'components/organisms/modals/ModalSelectDocPgr';
import { ModalSelectGho } from 'components/organisms/modals/ModalSelectGho';
import { ModalSelectHierarchy } from 'components/organisms/modals/ModalSelectHierarchy';
import { ModalSelectWorkspace } from 'components/organisms/modals/ModalSelectWorkspace';
import { NextPage } from 'next';
import { STFlexContainer } from 'pages/dashboard/checklist/index.styles';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Hierarchy: NextPage = () => {
  const { hierarchies, company } = useHierarchyTreeLoad();

  if (!hierarchies || !company) {
    return null;
  }

  return (
    <>
      <SHeaderTag title={'Cargos'} />
      <STFlexContainer>
        <OrgTreeComponent horizontal />
        <ModalAddRisk />
        <ModalAddGho />
        <ModalAddGenerateSource />
        <ModalAddRecMed />
        <ModalAddEpi />
        <ModalAddProbability />
        <ModalAddQuantity />
        <ModalExcelHierarchies />

        <ModalEditCard />
        <ModalRiskTool />
        <StackModalEditEmployee />
        <ModalSelectWorkspace />
        <ModalSelectHierarchy />
        <ModalSelectGho />
        <ModalSelectDocPgr />
        <ModalEditEpiData />
        <ModalEditEngRiskData />
        <ModalEditExamRiskData />
        <ModalAutomateSubOffice />
      </STFlexContainer>
    </>
  );
};

export default Hierarchy;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
