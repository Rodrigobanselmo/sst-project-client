import { useEffect } from 'react';

import ChecklistTree from 'components/organisms/main/Tree/ChecklistTree';
import { ModalAddGenerateSource } from 'components/organisms/modals/ModalAddGenerateSource';
import { ModalAddRecMed } from 'components/organisms/modals/ModalAddRecMed';
import { ModalAddRisk } from 'components/organisms/modals/ModalAddRisk';
import { NextPage } from 'next';

import { useChecklistTreeActions } from 'core/hooks/useChecklistTreeActions';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { useQueryChecklistData } from 'core/services/hooks/queries/useQueryChecklistData';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

import { STFlexContainer } from './index.styles';

const Checklist: NextPage = () => {
  const { data, isLoading } = useQueryChecklistData();
  const { setTree } = useChecklistTreeActions();

  useFetchFeedback(isLoading);

  useEffect(() => {
    if (data && data.data && data.data.json) {
      setTree(JSON.parse(data.data.json));
    }
  }, [setTree, data]);

  if (!(data && data.data && data.data.json)) return null;

  return (
    <STFlexContainer>
      <ChecklistTree horizontal />
      <ModalAddRisk />
      <ModalAddRecMed />
      <ModalAddGenerateSource />
    </STFlexContainer>
  );
};

export default Checklist;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
