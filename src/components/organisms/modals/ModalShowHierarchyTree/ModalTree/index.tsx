import { FC, useEffect } from 'react';
import { useStore } from 'react-redux';

import OrgTreeComponent from 'components/organisms/main/Tree/OrgTree';

import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';

import { IUseModalTree } from '../hooks/useModalTree';

export const ModalTree: FC<IUseModalTree> = ({
  actualHierarchy,
  copyFromHierarchy,
  company,
  selectData,
}) => {
  const store = useStore();
  const { setTree, transformToTreeMap, searchFilterNodes } =
    useHierarchyTreeActions();

  useEffect(() => {
    const search = store.getState().hierarchy.search as string;

    if (
      actualHierarchy &&
      copyFromHierarchy &&
      company &&
      selectData.copyFromCompanyId
    ) {
      setTree(
        transformToTreeMap(actualHierarchy, company, {
          allExpanded: true,
          stopDrag: true,
          showRef: true,
          copyHierarchyMap: copyFromHierarchy,
          companyIdCopy: selectData.copyFromCompanyId,
        }),
      );
      if (search) searchFilterNodes(search);
    }
  }, [
    setTree,
    actualHierarchy,
    company,
    transformToTreeMap,
    store,
    searchFilterNodes,
    copyFromHierarchy,
    selectData.copyFromCompanyId,
  ]);

  if (!actualHierarchy || !company) {
    return null;
  }

  return <OrgTreeComponent showGHO={false} horizontal />;
};
