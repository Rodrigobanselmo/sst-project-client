import { useEffect } from 'react';

import { NextPage } from 'next';

import OrgTreeComponent from '../../../../components/main/OrgTree';
import { useTreeActions } from '../../../../core/hooks/useTreeActions';
import { STFlexContainer } from './index.styles';
import { dndData } from './utils/fakeData';

const TestDND: NextPage = () => {
  const { setTree } = useTreeActions();

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
