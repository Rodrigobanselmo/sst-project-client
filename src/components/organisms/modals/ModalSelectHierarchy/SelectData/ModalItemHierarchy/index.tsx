import React, { FC } from 'react';

import { BoxProps } from '@mui/material';
import { SSelectButton } from 'components/molecules/SSelectButton';
import { nodeTypesConstant } from 'components/organisms/main/Tree/OrgTree/constants/node-type.constant';
import { selectModalIdIsSelected } from 'store/reducers/hierarchy/hierarchySlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { IListHierarchyQuery } from 'core/hooks/useListHierarchyQuery';

interface IItem extends BoxProps {
  data: IListHierarchyQuery;
  active?: boolean;
}

export const ModalItemHierarchy: FC<IItem> = ({ data, active, ...rest }) => {
  const isSelected = useAppSelector(selectModalIdIsSelected(data.id));

  if ((isSelected && !active) || (!isSelected && active)) return null;
  return (
    <SSelectButton
      active={active}
      tooltipText={data.parentsName + ' > ' + data.name}
      text={data.name}
      label={nodeTypesConstant[data.type].name}
      {...rest}
    />
  );
};
