import React, { FC } from 'react';

import { BoxProps } from '@mui/material';
import { SSelectButton } from 'components/molecules/SSelectButton';
import { IHierarchyTreeMapObject } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/components/RiskToolViews/RiskToolRiskView/types';
import { nodeTypesConstant } from 'components/organisms/main/Tree/OrgTree/constants/node-type.constant';
import { selectModalIdIsSelected } from 'store/reducers/hierarchy/hierarchySlice';

import { useAppSelector } from 'core/hooks/useAppSelector';

interface IItem extends BoxProps {
  data: IHierarchyTreeMapObject;
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
