import { NextPage } from 'next';

import OrgTreeComponent, { useTree } from '../../../../components/main/OrgTree';
import { STFlexContainer } from './index.styles';
import { dndData } from './utils/fakeData';

const TestDND: NextPage = () => {
  const { treeRef } = useTree();

  const onClick = () => {
    treeRef.current?.onExpandNodes();
  };

  return (
    <STFlexContainer>
      <button onClick={onClick}>close/open</button>
      <OrgTreeComponent data={dndData} ref={treeRef} horizontal />
    </STFlexContainer>
  );
};

export default TestDND;
