import { useEffect, useState } from 'react';

import { NextPage } from 'next';

import OrgTreeComponent from '../../../../components/main/OrgTree';
import { useTreeActions } from '../../../../core/hooks/useTreeActions';
import { STFlexContainer } from './index.styles';
import { dndData } from './utils/fakeData';

const TestDND: NextPage = () => {
  const { setTree, onExpandAll } = useTreeActions();
  const [expand, setExpand] = useState(false);

  useEffect(() => {
    setTree(dndData);
  }, [setTree]);

  const handleExpandAll = () => {
    onExpandAll(!expand);
    setExpand(!expand);
  };

  return (
    <STFlexContainer>
      <button onClick={handleExpandAll}>close/open</button>
      <OrgTreeComponent horizontal />
    </STFlexContainer>
  );
};

export default TestDND;
