import { useEffect } from 'react';

import OrgTreeComponent from 'components/main/OrgTree';
import { ModalAddRecMed } from 'components/modals/ModalAddRecMed';
import { ModalAddRisk } from 'components/modals/ModalAddRisk';
import { NextPage } from 'next';

import { useTreeActions } from 'core/hooks/useTreeActions';
import { useQueryChecklistData } from 'core/services/hooks/queries/useQueryChecklistData';

import { STFlexContainer } from './index.styles';

const Home: NextPage = () => {
  const { data } = useQueryChecklistData();

  const { setTree } = useTreeActions();

  useEffect(() => {
    if (data && data.data && data.data.json) {
      setTree(JSON.parse(data.data.json));
    }
  }, [setTree, data]);

  return (
    <STFlexContainer>
      <OrgTreeComponent horizontal />
      <ModalAddRisk />
      <ModalAddRecMed />
    </STFlexContainer>
  );
};

export default Home;
