import { useEffect } from 'react';

import ChecklistTree from 'components/main/Tree/ChecklistTree';
import { ModalAddRecMed } from 'components/modals/ModalAddRecMed';
import { ModalAddRisk } from 'components/modals/ModalAddRisk';
import { NextPage } from 'next';

import { useChecklistTreeActions } from 'core/hooks/useChecklistTreeActions';
import { useQueryChecklistData } from 'core/services/hooks/queries/useQueryChecklistData';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

import { STFlexContainer } from './index.styles';

const Checklist: NextPage = () => {
  const { data } = useQueryChecklistData();

  const { setTree } = useChecklistTreeActions();

  useEffect(() => {
    if (data && data.data && data.data.json) {
      setTree(JSON.parse(data.data.json));
    }
  }, [setTree, data]);

  return (
    <STFlexContainer>
      <ChecklistTree horizontal />
      <ModalAddRisk />
      <ModalAddRecMed />
    </STFlexContainer>
  );
};

export default Checklist;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
