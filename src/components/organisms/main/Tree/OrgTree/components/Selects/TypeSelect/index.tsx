import React, { FC, useMemo } from 'react';

import MergeTypeIcon from '@mui/icons-material/MergeType';
import { selectHierarchyTreeData } from 'store/reducers/hierarchy/hierarchySlice';

import { useAppSelector } from '../../../../../../../../core/hooks/useAppSelector';
import { IMenuOptionResponse } from '../../../../../../../molecules/SMenu/types';
import { STagSelect } from '../../../../../../../molecules/STagSelect';
import { nodeTypesConstant } from '../../../constants/node-type.constant';
import { TreeTypeEnum } from '../../../enums/tree-type.enums';
import { usePreventNode } from '../../../hooks/usePreventNode';
import { ITreeMapObject } from '../../../interfaces';
import { ITypeSelectProps } from './types';

export const TypeSelect: FC<{ children?: any } & ITypeSelectProps> = ({
  large,
  parentId,
  handleSelect,
  node,
  add,
  ...props
}) => {
  const parentNode = useAppSelector(
    selectHierarchyTreeData(parentId),
  ) as unknown as ITreeMapObject | null;

  const { preventChangeCardType } = usePreventNode();

  const handleEditTypeCard = ({ name, value }: IMenuOptionResponse) => {
    if (preventChangeCardType(node)) return;
    handleSelect && handleSelect({ value: value as TreeTypeEnum, name });
  };

  const typeOptions = useMemo(() => {
    const parentType = parentNode?.type;

    if (!parentType) return [nodeTypesConstant[TreeTypeEnum.COMPANY]];

    if (nodeTypesConstant[parentType]?.childOptions)
      return nodeTypesConstant[parentType].childOptions.map(
        (value) => nodeTypesConstant[value],
      );

    return [];
  }, [parentNode]);

  return (
    <STagSelect
      options={typeOptions}
      text={nodeTypesConstant[node.type]?.name}
      large={large}
      icon={MergeTypeIcon}
      handleSelectMenu={handleEditTypeCard}
      title={'Tipo de hierarquia'}
      disabled={!add && node.type == TreeTypeEnum.OFFICE}
      {...props}
    />
  );
};
