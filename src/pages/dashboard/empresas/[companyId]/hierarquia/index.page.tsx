import { useEffect } from 'react';

import OrgTreeComponent from 'components/organisms/main/Tree/OrgTree';
import { ModalAddEpi } from 'components/organisms/modals/ModalAddEpi';
import { ModalAddGenerateSource } from 'components/organisms/modals/ModalAddGenerateSource';
import { ModalAddGho } from 'components/organisms/modals/ModalAddGHO';
import { ModalAddRecMed } from 'components/organisms/modals/ModalAddRecMed';
import { ModalAddRisk } from 'components/organisms/modals/ModalAddRisk';
import { NextPage } from 'next';
import { STFlexContainer } from 'pages/dashboard/checklist/index.styles';

import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryGHO } from 'core/services/hooks/queries/useQueryGHO';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Hierarchy: NextPage = () => {
  const { data } = useQueryHierarchies();
  const { data: gho } = useQueryGHO();
  const { data: company } = useQueryCompany();

  const { setTree, transformToTreeMap } = useHierarchyTreeActions();

  useEffect(() => {
    if (data && company && gho) setTree(transformToTreeMap(data, company));
  }, [setTree, data, company, gho, transformToTreeMap]);

  if (!data || !company) {
    return null;
  }

  return (
    <STFlexContainer>
      <OrgTreeComponent horizontal />
      <ModalAddRisk />
      <ModalAddGho />
      <ModalAddGenerateSource />
      <ModalAddRecMed />
      <ModalAddEpi />
    </STFlexContainer>
  );
};

export default Hierarchy;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
