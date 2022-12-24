import React, { useEffect } from 'react';
import { useStore } from 'react-redux';

import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { StackModalRiskTool } from 'components/organisms/modals/ModalRiskTool';
import { RiskCompanyTable } from 'components/organisms/tables/RiskCompanyTable/RiskCompanyTable';
import { NextPage } from 'next';

import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const RiskPage: NextPage = () => {
  const { data } = useQueryHierarchies();
  const { data: gho } = useQueryGHOAll();
  const { data: company } = useQueryCompany();
  const store = useStore();

  const { setTree, transformToTreeMap, searchFilterNodes } =
    useHierarchyTreeActions();

  useEffect(() => {
    const search = store.getState().hierarchy.search as string;

    if (data && company && gho) {
      setTree(transformToTreeMap(data, company));
      if (search) searchFilterNodes(search);
    }
  }, [
    setTree,
    data,
    company,
    gho,
    transformToTreeMap,
    store,
    searchFilterNodes,
  ]);

  return (
    <>
      <SHeaderTag title={'Riscos'} />
      <SContainer>
        <RiskCompanyTable />
      </SContainer>
      <StackModalRiskTool />
    </>
  );
};

export default RiskPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
