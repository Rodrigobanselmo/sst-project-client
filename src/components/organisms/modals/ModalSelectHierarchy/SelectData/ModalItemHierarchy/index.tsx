import React, { FC } from 'react';

import { BoxProps } from '@mui/material';
import { SSelectList } from 'components/molecules/SSelectList';
import { nodeTypesConstant } from 'components/organisms/main/Tree/OrgTree/constants/node-type.constant';
import { selectModalIdIsSelected } from 'store/reducers/hierarchy/hierarchySlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { IListHierarchyQuery } from 'core/hooks/useListHierarchyQuery';

interface IItem extends BoxProps {
  data: IListHierarchyQuery;
  active?: boolean;
  activeRemove?: boolean;
}

export const ModalItemHierarchy: FC<{ children?: any } & IItem> = ({
  data,
  active,
  activeRemove,
  ...rest
}) => {
  const isSelected = useAppSelector(selectModalIdIsSelected(data.id));

  if ((isSelected && !active) || (!isSelected && active)) return null;
  return (
    <SSelectList
      active={active}
      activeRemove={activeRemove}
      tooltipText={data.parentsName + ' > ' + data.name}
      text={data.name}
      label={nodeTypesConstant[data.type].name}
      {...rest}
    />
  );
};
