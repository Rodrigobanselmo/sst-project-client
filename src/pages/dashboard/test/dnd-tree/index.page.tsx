import { useEffect } from 'react';

import { NextPage } from 'next';

import OrgTreeComponent from '../../../../components/organisms/main/Tree/ChecklistTree';
import { useChecklistTreeActions } from '../../../../core/hooks/useChecklistTreeActions';
import { STFlexContainer } from '../../checklist/index.styles';
import { dndData } from './utils/fakeData';

const TestDND: NextPage = () => {
  const { setTree } = useChecklistTreeActions();

  useEffect(() => {
    setTree(dndData);
  }, [setTree]);

  return (
    <STFlexContainer>
      <OrgTreeComponent horizontal />
    </STFlexContainer>
  );
};

export default TestDND;
