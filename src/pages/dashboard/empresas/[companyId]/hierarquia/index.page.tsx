import { useEffect } from 'react';

import OrgTreeComponent from 'components/main/Tree/OrgTree';
import { NextPage } from 'next';
import { STFlexContainer } from 'pages/dashboard/checklist/index.styles';

import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Hierarchy: NextPage = () => {
  const { data } = useQueryHierarchies();
  const { data: company } = useQueryCompany();

  const { setTree, transformToTreeMap } = useHierarchyTreeActions();

  useEffect(() => {
    if (data && company) setTree(transformToTreeMap(data, company));
  }, [setTree, data, company, transformToTreeMap]);

  if (!data || !company) {
    return null;
  }

  return (
    <STFlexContainer>
      <OrgTreeComponent horizontal />
    </STFlexContainer>
  );
};

export default Hierarchy;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
